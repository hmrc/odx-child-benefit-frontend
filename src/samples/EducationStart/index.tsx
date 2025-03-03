import React, { FunctionComponent, useState, useEffect, useContext, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Landing from './Landing';
import setPageTitle, { registerServiceName } from '../../components/helpers/setPageTitleHelpers';
import { getSdkConfig, loginIfNecessary } from '@pega/auth/lib/sdk-auth-manager';
import AppFooter from '../../components/AppComponents/AppFooter';
import AppContextEducation from './reuseables/AppContextEducation'; // TODO: Once this code exposed to common folder, we will refer AppContext from reuseable components
import { checkStatus, triggerLogout } from '../../components/helpers/utils';
import useHMRCExternalLinks from '../../components/helpers/hooks/HMRCExternalLinks';
import TimeoutPopup from '../../components/AppComponents/TimeoutPopup';
import ShutterServicePage from '../../components/AppComponents/ShutterService/ShutterServicePage';
import ServiceNotAvailable from '../../components/AppComponents/ServiceNotAvailable';
import LogoutPopup from '../../components/AppComponents/LogoutPopup';
import SummaryPage from '../../components/AppComponents/SummaryPage';
import {
  initTimeout,
  settingTimer,
  staySignedIn
} from '../../components/AppComponents/TimeoutPopup/timeOutUtils';
import { useStartMashup } from './reuseables/PegaSetup';
import { useHistory } from 'react-router-dom';
import AppHeader from '../../components/AppComponents/AppHeader';

const EducationStartCase: FunctionComponent<any> = () => {
  const { t } = useTranslation();

  const educationStartParam = 'claim-child-benefit';
  // Adding hardcoded value as key to sort translation issue.
  const serviceNameAndHeader = 'EDUCATION_START';
  const claimsListApi = 'D_ClaimantWorkAssignmentEdStartCases';

  const summaryPageRef = useRef<HTMLDivElement>(null);

  const [showLandingPage, setShowLandingPage] = useState<boolean>(true);
  const [showPortalPageDefault, setShowPortalPageDefault] = useState<boolean>(false);
  const [startClaimClicked, setStartClaimClicked] = useState(false);
  const [pCoreReady, setPCoreReady] = useState(false);
  const { showLanguageToggle } = useContext(AppContextEducation);
  const [showLanguageToggleState, setShowLanguageToggleState] = useState(showLanguageToggle);
  const [currentDisplay, setCurrentDisplay] = useState<
    | 'pegapage'
    | 'resolutionpage'
    | 'servicenotavailable'
    | 'shutterpage'
    | 'loading'
    | 'landingpage'
  >('pegapage');
  const [summaryPageContent, setSummaryPageContent] = useState<any>({
    content: null,
    title: null,
    banner: null
  });
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [showSignoutModal, setShowSignoutModal] = useState(false);
  const [showPortalBanner, setShowPortalBanner] = useState(false);
  const [showforceStartClaim, setForceShowStartClaim] = useState(false);
  const [pConnect, setPconnect] = useState(null);

  const { hmrcURL } = useHMRCExternalLinks();
  const history = useHistory();

  registerServiceName(t('EDUCATION_START'));

  useEffect(() => {
    initTimeout(setShowTimeoutModal, false, true, false);
  }, []);

  function doRedirectDone() {
    history.replace('/education/start');
    // appName and mainRedirect params have to be same as earlier invocation
    loginIfNecessary({ appName: 'ChB', mainRedirect: true });
  }

  const {
    showPega,
    setShowPega,
    showResolutionPage,
    setShutterServicePage,
    caseId,
    shutterServicePage,
    serviceNotAvailable,
    assignmentPConnect,
    assignmentCancelled,
    setAssignmentCancelled,
    containerClosed
  } = useStartMashup(doRedirectDone, {
    appBacklinkProps: {},
    serviceParam: educationStartParam,
    serviceName: serviceNameAndHeader,
    appNameHeader: serviceNameAndHeader
  });

  useEffect(() => {
    if (assignmentPConnect) {
      setPconnect(assignmentPConnect);
    }
  }, [assignmentPConnect]);

  function handleSignout() {
    if (currentDisplay === 'pegapage') {
      setShowSignoutModal(true);
    } else {
      triggerLogout();
    }
  }

  const handleStaySignIn = e => {
    e.preventDefault();
    setShowSignoutModal(false);
    // Extends manual signout popup 'stay signed in' to reset the automatic timeout timer also
    staySignedIn(
      setShowTimeoutModal,
      claimsListApi,
      null,
      false,
      true,
      currentDisplay === 'resolutionpage'
    );
  };

  function returnToPortalPage() {
    sessionStorage.setItem('assignmentFinishedFlag', 'false');
    setShowSignoutModal(false);
    staySignedIn(
      setShowTimeoutModal,
      claimsListApi,
      null,
      false,
      true,
      currentDisplay === 'resolutionpage'
    );
    setCurrentDisplay('loading');
    setShowLandingPage(true);
    PCore.getContainerUtils().closeContainerItem(
      PCore.getContainerUtils().getActiveContainerItemContext('app/primary'),
      { skipDirtyCheck: true }
    );
  }

  const handleStartCliam = () => {
    setShowPega(true);
    setShowLandingPage(false);
    setStartClaimClicked(true);

    sessionStorage.setItem('isComingFromPortal', 'true');
    sessionStorage.setItem('isEditMode', 'true');
    sessionStorage.removeItem('stepIDCYA');
  };

  /* ***
   * Application specific PCore subscriptions
   *
   * TODO Can this be made into a tidy helper? including its own clean up? A custom hook perhaps
   */

  // TODO - This function will be removed with US-13518 implementation.
  function removeHmrcLink() {
    if (checkStatus() === 'Open-InProgress') {
      const hmrcLink = document.querySelector(
        '[href="https://www.tax.service.gov.uk/ask-hmrc/chat/child-benefit"]'
      );
      const breakTag = document.querySelectorAll('br');

      if (hmrcLink || breakTag.length) {
        hmrcLink?.remove();
        breakTag[0]?.remove();
        breakTag[1]?.remove();
      }
    }
  }

  function closeContainer() {
    if (PCore.getContainerUtils().getActiveContainerItemName('app/primary')) {
      PCore.getContainerUtils().closeContainerItem(
        PCore.getContainerUtils().getActiveContainerItemContext('app/primary'),
        { skipDirtyCheck: true }
      );
    }
  }

  function returnedToPortal(showBanner = false) {
    closeContainer();
    setShowPega(false);
    setCurrentDisplay('landingpage');
    setShowPortalBanner(showBanner);
    setAssignmentCancelled(false);
    setStartClaimClicked(false);
    setSummaryPageContent({
      content: null,
      title: null,
      banner: null
    });
  }

  useEffect(() => {
    if (assignmentCancelled) {
      // user clicked save and come back later link
      const showBanner = true;
      returnedToPortal(showBanner);
    }
  }, [assignmentCancelled]);

  useEffect(() => {
    function handleClick(e) {
      const targetId = e.target.id;
      if (targetId === 'homepage') {
        e.preventDefault();
        returnedToPortal(false);
        setShowPortalPageDefault(true);
      }
    }

    const currentSummaryPageRef = summaryPageRef.current;
    if (currentSummaryPageRef) {
      currentSummaryPageRef.addEventListener('click', handleClick);
    }
    return () => {
      if (currentSummaryPageRef) {
        currentSummaryPageRef.removeEventListener('click', handleClick);
      }
    };
  }, [summaryPageContent]);

  useEffect(() => {
    if (shutterServicePage) {
      setCurrentDisplay('shutterpage');
    } else if (showLandingPage && pCoreReady) {
      setCurrentDisplay('landingpage');
    } else if (showPega) {
      setCurrentDisplay('pegapage');
    } else if (showResolutionPage) {
      setSummaryPageContent({
        content: null,
        title: null,
        banner: null
      });
      setCurrentDisplay('resolutionpage');
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
          })
          .catch(() => {
            return false;
          });
      });
    } else if (serviceNotAvailable) {
      setCurrentDisplay('servicenotavailable');
    } else if (containerClosed) {
      // Back link action for submitted cases
      setShowPortalBanner(false);
      setCurrentDisplay('landingpage');
    } else {
      setCurrentDisplay('loading');
    }
    if (!showPega) {
      setPageTitle();
    }
  }, [
    showResolutionPage,
    showPega,
    shutterServicePage,
    serviceNotAvailable,
    pCoreReady,
    showLandingPage,
    containerClosed
  ]);

  useEffect(() => {
    const pyAssignmentID = sessionStorage.getItem('assignmentID');
    const startClaimPageSet = sessionStorage.getItem('isStartClaimPage');
    if (startClaimPageSet === 'true') {
      setForceShowStartClaim(true);
    } else {
      setForceShowStartClaim(false);
    }
    if (pyAssignmentID && pCoreReady && pyAssignmentID !== 'undefined') {
      const container = pConnect?.getContainerName();
      const target = `${PCore?.getConstants().APP.APP}/${container}`;
      const openAssignmentOptions = { pageName: '', channelName: '' };
      const assignmentID = sessionStorage.getItem('assignmentID');
      PCore.getMashupApi().openAssignment(assignmentID, target, openAssignmentOptions);
      setShowLandingPage(false);
    }
    if (showPega && pCoreReady && startClaimClicked) {
      sessionStorage.setItem('assignmentFinishedFlag', 'false');
      const startingFields = {
        NotificationLanguage: sessionStorage.getItem('rsdk_locale')?.slice(0, 2) || 'en'
      };

      PCore.getMashupApi().createCase(
        'HMRC-ChB-Work-EducationStart',
        PCore.getConstants().APP.APP,
        {
          startingFields,
          pageName: '',
          channelName: ''
        }
      );
    }
  }, [pCoreReady, showPega, startClaimClicked]);

  useEffect(() => {
    const eventHandler = () => {
      PCore.onPCoreReady(() => {
        if (!pCoreReady) {
          setPCoreReady(true);
          PCore?.getPubSubUtils().subscribe(
            'CustomAssignmentFinished',
            removeHmrcLink,
            'CustomAssignmentFinished'
          );
          PCore.getPubSubUtils().subscribe(
            PCore.getConstants().PUB_SUB_EVENTS.CONTAINER_EVENTS.CLOSE_CONTAINER_ITEM,
            () => {
              setShowPega(false);
            },
            'showStartPageOnCloseContainerItem'
          );
        }
      });
      settingTimer();
      PCore.getStore().subscribe(() =>
        staySignedIn(
          setShowTimeoutModal,
          '',
          null,
          false,
          true,
          currentDisplay === 'resolutionpage'
        )
      );

      PCore?.getPubSubUtils().subscribe(
        'showPortalScreenOnBackPress',
        () => {
          returnedToPortal(true);
        },
        'showPortalScreenOnBackPress'
      );
    };
    document.addEventListener('SdkConstellationReady', eventHandler);

    return () => {
      PCore?.getPubSubUtils().unsubscribe('CustomAssignmentFinished', 'CustomAssignmentFinished');
      PCore.getPubSubUtils().unsubscribe(
        PCore.getConstants().PUB_SUB_EVENTS.CONTAINER_EVENTS.CLOSE_CONTAINER_ITEM,
        'showStartPageOnCloseContainerItem'
      );
      document.removeEventListener('SdkConstellationReady', eventHandler);
    };
  }, []);

  useEffect(() => {
    getSdkConfig().then(config => {
      setShowLanguageToggleState(config?.educationStartConfig?.showLanguageToggle);
    });
  }, []);

  if (currentDisplay === 'servicenotavailable') {
    return (
      <>
        <AppHeader
          appname={t('EDUCATION_START')}
          hasLanguageToggle={showLanguageToggleState}
          handleSignout={handleSignout}
          betafeedbackurl={`${hmrcURL}contact/beta-feedback?service=claim-child-benefit-frontend&backUrl=/fill-online/claim-child-benefit/recently-claimed-child-benefit`}
        />
        <div className='govuk-width-container'>
          <ServiceNotAvailable returnToPortalPage={returnToPortalPage} />
        </div>
        <AppFooter />
      </>
    );
  } else {
    return (
      <AppContextEducation.Provider
        value={{
          appBacklinkProps: {},
          showLanguageToggle,
          serviceParam: educationStartParam,
          serviceName: serviceNameAndHeader,
          appNameHeader: serviceNameAndHeader
        }}
      >
        <TimeoutPopup
          show={showTimeoutModal}
          staySignedinHandler={() =>
            staySignedIn(
              setShowTimeoutModal,
              claimsListApi,
              null,
              false,
              true,
              currentDisplay === 'resolutionpage'
            )
          }
          signoutHandler={triggerLogout}
          isAuthorised={false}
          staySignedInButtonText={t('STAY_SIGNED_IN')}
          signoutButtonText={t('SIGN-OUT')}
        >
          <h1 id='hmrc-timeout-heading' className='govuk-heading-m push--top'>
            {t('YOURE_ABOUT_TO_BE_SIGNED_OUT')}
          </h1>
          <p className='govuk-body hmrc-timeout-dialog__message'>
            {' '}
            {/* Todo Aria-hidden will be added back with US-13474 implementation */}
            {t('FOR_YOUR_SECURITY_WE_WILL_SIGN_YOU_OUT')}{' '}
            <span id='hmrc-timeout-countdown' className='hmrc-timeout-dialog__countdown'>
              {t('2_MINUTES')}
            </span>
            .
          </p>
        </TimeoutPopup>
        <AppHeader
          handleSignout={handleSignout}
          appname={t('EDUCATION_START')}
          hasLanguageToggle={showLanguageToggleState}
        />
        <div className='govuk-width-container'>
          {currentDisplay === 'shutterpage' ? (
            <ShutterServicePage />
          ) : (
            <>
              <div id='pega-part-of-page'>
                <div id='pega-root' className='education-start'></div>
              </div>
              {currentDisplay === 'landingpage' && (
                <Landing
                  handleStartCliam={handleStartCliam}
                  assignmentPConn={pConnect}
                  showPortalBanner={showPortalBanner}
                  setShowLandingPage={setShowLandingPage}
                  showPortalPageDefault={showPortalPageDefault}
                  setShowPortalPageDefault={setShowPortalPageDefault}
                  setShutterServicePage={setShutterServicePage}
                  setShowPortalBanner={setShowPortalBanner}
                  showforceStartClaim={showforceStartClaim}
                />
              )}
              {currentDisplay === 'resolutionpage' && (
                <SummaryPage
                  summaryContent={summaryPageContent?.Content}
                  summaryTitle={summaryPageContent?.Title}
                  summaryBanner={summaryPageContent?.Banner}
                  backlinkProps={{}}
                  ref={summaryPageRef}
                />
              )}
            </>
          )}
        </div>
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
          <p className='govuk-body'>{t('YOU_STILL_NEED_TO_SAVE_YOUR_PROGRESS')}</p>
          <p className='govuk-body'>{t('TO_SAVE_YOUR_PROGRESS')}</p>
        </LogoutPopup>
        <AppFooter />
      </AppContextEducation.Provider>
    );
  }
};
export default EducationStartCase;
