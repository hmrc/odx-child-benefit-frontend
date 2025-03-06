import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { loginIfNecessary, sdkIsLoggedIn, getSdkConfig } from '@pega/auth/lib/sdk-auth-manager';
import AppHeader from '../../components/AppComponents/AppHeader';
import AppFooter from '../../components/AppComponents/AppFooter';
import { useTranslation } from 'react-i18next';
import setPageTitle, { registerServiceName } from '../../components/helpers/setPageTitleHelpers';
import useHMRCExternalLinks from '../../components/helpers/hooks/HMRCExternalLinks';
import { getServiceShutteredStatus, triggerLogout } from '../../components/helpers/utils';
import TimeoutPopup from '../../components/AppComponents/TimeoutPopup';
import LogoutPopup from '../../components/AppComponents/LogoutPopup';
import {
  initTimeout,
  staySignedIn
} from '../../components/AppComponents/TimeoutPopup/timeOutUtils';
import { useStartMashup } from '../EducationStart/reuseables/PegaSetup';
import StartPage from './StartPage';
import SummaryPage from '../../components/AppComponents/SummaryPage';
import ShutteredServiceWrapper from '../../components/AppComponents/ShutterService/ShutteredServiceWrapper';
import useTimeoutTimer from '../../components/helpers/hooks/useTimeoutTimer';

export default function ChangeOfBank() {
  const history = useHistory();
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [showSignoutModal, setShowSignoutModal] = useState(false);
  const [summaryPageContent, setSummaryPageContent] = useState<any>({
    content: null,
    title: null,
    banner: null
  });

  const { t } = useTranslation();
  const { hmrcURL } = useHMRCExternalLinks();

  registerServiceName(t('CHB_HOMEPAGE_HEADING'));
  const onRedirectDone = () => {
    history.replace('/change-of-bank');
    // appName and mainRedirect params have to be same as earlier invocation
    loginIfNecessary({ appName: 'ChB', mainRedirect: true });
  };

  const { showPega, setShowPega, caseId, showResolutionPage } = useStartMashup(onRedirectDone, {
    appBacklinkProps: {}
  });

  useTimeoutTimer(setShowTimeoutModal);

  const [serviceIsShuttered, setServiceIsShuttered] = useState<boolean>(null);

  useEffect(() => {
    const getShutteredService = async () => {
      const status: boolean = await getServiceShutteredStatus();
      setServiceIsShuttered(status);
    };

    getShutteredService();
  }, [showPega]);

  useEffect(() => {
    if (showResolutionPage) {
      getSdkConfig().then(config => {
        PCore.getRestClient()
          .invokeCustomRestApi(
            `${config.serverConfig.infinityRestServerUrl}/api/application/v2/cases/${caseId}?pageName=SubmissionSummary`,
            {
              method: 'GET',
              body: '',
              headers: '',
              withoutDefaultHeaders: false
            },
            ''
          )
          .then(response => {
            PCore.getPubSubUtils().unsubscribe(
              'languageToggleTriggered',
              'summarypageLanguageChange'
            );
            const summaryData: Array<any> =
              response.data.data.caseInfo.content.ScreenContent.LocalisedContent;
            const currentLang =
              sessionStorage.getItem('rsdk_locale')?.slice(0, 2).toUpperCase() || 'EN';

            setSummaryPageContent(summaryData.find(data => data.Language === currentLang));

            PCore.getPubSubUtils().subscribe(
              'languageToggleTriggered',
              ({ language }) => {
                setSummaryPageContent(
                  summaryData.find(data => data.Language === language.toUpperCase())
                );
              },
              'summarypageLanguageChange'
            );
          });
      });
    }
    if (!showPega) {
      setPageTitle();
    }
  }, [showResolutionPage, showPega]);

  const handleStartCOB = async () => {
    setShowPega(true);
    const status: boolean = await getServiceShutteredStatus();
    if (!status) {
      PCore.getMashupApi().createCase(
        'HMRC-ChB-Work-ChBChangeOfBank',
        PCore.getConstants().APP.APP
      );
    }
  };

  function handleSignout() {
    if (showPega) {
      setShowSignoutModal(true);
    } else {
      triggerLogout();
    }
  }

  const handleStaySignIn = e => {
    e.preventDefault();
    setShowSignoutModal(false);
    // Extends manual signout popup 'stay signed in' to reset the automatic timeout timer also
    staySignedIn(setShowTimeoutModal, 'D_ClaimantSubmittedChBCases', null, null);
  };

  return (
    sdkIsLoggedIn() && (
      <>
        <AppHeader
          hasLanguageToggle
          betafeedbackurl={`${hmrcURL}contact/beta-feedback?service=463&referrerUrl=${window.location}`}
          appname={t('CHB_HOMEPAGE_HEADING')}
          handleSignout={handleSignout}
        />
        <TimeoutPopup
          show={showTimeoutModal}
          staySignedinHandler={() => {
            setShowTimeoutModal(false);
            initTimeout(setShowTimeoutModal, false, true, false);
            // Using operator details call as 'app agnostic' session keep-alive
            PCore.getUserApi().getOperatorDetails(
              PCore.getEnvironmentInfo().getOperatorIdentifier()
            );
          }}
          signoutHandler={triggerLogout}
          isAuthorised
          signoutButtonText={t('SIGN-OUT')}
          staySignedInButtonText={t('STAY_SIGNED_IN')}
        />
        <ShutteredServiceWrapper serviceIsShuttered={serviceIsShuttered}>
          <div className='govuk-width-container'>
            {!showPega && <StartPage handleStartCOB={handleStartCOB} />}
            <div id='pega-part-of-page'>
              <div id='pega-root'></div>
            </div>
            {showResolutionPage && (
              <SummaryPage
                summaryContent={summaryPageContent.Content}
                summaryTitle={summaryPageContent.Title}
                summaryBanner={summaryPageContent.Banner}
                backlinkProps={{}}
              />
            )}
          </div>
        </ShutteredServiceWrapper>
        <LogoutPopup
          show={showSignoutModal && !showTimeoutModal}
          hideModal={() => setShowSignoutModal(false)}
          handleSignoutModal={triggerLogout}
          handleStaySignIn={handleStaySignIn}
          staySignedInButtonText={t('STAY_SIGNED_IN')}
          signoutButtonText={t('SIGN-OUT')}
        >
          <h1 id='govuk-timeout-heading' className='govuk-heading-m push--top'>
            {t('YOU_ARE_ABOUT_TO_SIGN_OUT')}
          </h1>
          <p className='govuk-body'>{t('SIGN_OUT_MSG')}</p>
        </LogoutPopup>
        <AppFooter />
      </>
    )
  );
}
