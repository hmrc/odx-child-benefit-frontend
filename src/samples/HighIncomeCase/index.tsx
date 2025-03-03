import React, { FunctionComponent, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import LandingPage from './LandingPage';
import ClaimPage from './ClaimPage';
import setPageTitle, { registerServiceName } from '../../components/helpers/setPageTitleHelpers';
import { getSdkConfig, sdkIsLoggedIn } from '@pega/auth/lib/sdk-auth-manager';
import AppHeader from '../../components/AppComponents/AppHeader';
import AppFooter from '../../components/AppComponents/AppFooter';
import AppContext from './reuseables/AppContext';
import ShutterServicePage from '../../components/AppComponents/ShutterService/ShutterServicePage';
import { useHistory } from 'react-router-dom';
import { useStartMashup } from '../EducationStart/reuseables/PegaSetup';
import { loginIfNecessary } from '@pega/auth/lib/sdk-auth-manager';
import useTimeoutTimer from '../../components/helpers/hooks/useTimeoutTimer';
import {
  initTimeout,
  settingTimer,
  staySignedIn
} from '../../components/AppComponents/TimeoutPopup/timeOutUtils';
import { triggerLogout } from '../../components/helpers/utils';
import useHMRCExternalLinks from '../../components/helpers/hooks/HMRCExternalLinks';
import { loadBundles } from '../../components/helpers/languageToggleHelper';
import TimeoutPopup from '../../components/AppComponents/TimeoutPopup';

const HighIncomeCase: FunctionComponent<any> = () => {
  const [showLandingPage, setShowLandingPage] = useState<boolean>(true);
  const [shuttered, setShuttered] = useState(null);
  const [showLanguageToggle, setShowLanguageToggle] = useState(false);
  const [currentDisplay, setCurrentDisplay] = useState<
    'pegapage' | 'resolutionpage' | 'servicenotavailable' | 'shutterpage' | 'loading'
  >('pegapage');
  const [pCoreReady, setPCoreReady] = useState(false);
  const [showSignoutModal, setShowSignoutModal] = useState(false);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);

  // Holds relevant summary page content (specific language)
  const [summaryPageContent, setSummaryPageContent] = useState<any>({
    content: null,
    title: null,
    banner: null
  });

  const { t } = useTranslation();
  const history = useHistory();
  const { hmrcURL } = useHMRCExternalLinks();
  registerServiceName(t('HICBC_APP_NAME'));

  function doRedirectDone() {
    history.replace('/hicbc/opt-in');
    // appName and mainRedirect params have to be same as earlier invocation
    loginIfNecessary({
      appName: 'ChB',
      mainRedirect: true
    });
  }

  const { showPega, setShowPega, showResolutionPage, caseId, renderRootComponent, rootProps } =
    useStartMashup(doRedirectDone, { appBacklinkProps: {} });

  const startClaim = () => {
    setShowPega(true);
    PCore.getMashupApi().createCase('HMRC-ChB-Work-HICBCPreference', PCore.getConstants().APP.APP);
  };
  const landingPageProceedHandler = () => {
    localStorage.setItem('showLandingPage', 'false');
    setShowLandingPage(false);
    startClaim();
  };

  useEffect(() => {
    getSdkConfig().then(config => {
      setShowLanguageToggle(config?.hicbcOptinConfig?.showLanguageToggle);

      if (config.hicbcOptinConfig?.shutterService) {
        setShuttered(config.hicbcOptinConfig.shutterService);
      } else {
        setShuttered(false);
      }
    });
  }, []);

  useEffect(() => {
    if (showPega) {
      setCurrentDisplay('pegapage');
    } else if (showResolutionPage) {
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
            /* const summaryData={
                  en:{content:'English content', title: 'English Title', banner:null},
                  cy:{content:'Welsh content', banner: 'Welsh Banner', title:null},
                } */
            // setSummaryPageData(summaryData);
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
    } else {
      setCurrentDisplay('loading');
    }
    if (!showPega) {
      setPageTitle();
    }
  }, [showResolutionPage, showPega, pCoreReady]);

  /* ***
   * Application specific PCore subscriptions
   *
   * TODO Can this be made into a tidy helper? including its own clean up? A custom hook perhaps
   */

  useEffect(() => {
    document.addEventListener('SdkConstellationReady', () => {
      PCore.onPCoreReady(() => {
        if (!pCoreReady) {
          setPCoreReady(true);
          PCore.getPubSubUtils().subscribe(
            PCore.getConstants().PUB_SUB_EVENTS.CONTAINER_EVENTS.CLOSE_CONTAINER_ITEM,
            () => {
              // console.log("SUBEVENT!!! showStartPageOnCloseContainerItem")
              setShowPega(false);
            },
            'showStartPageOnCloseContainerItem'
          );

          // Preloading bundles for language toggle
          loadBundles(sessionStorage.getItem('rsdk_locale') || 'en_GB');
        }
      });
      settingTimer();
    });

    return () => {
      PCore.getPubSubUtils().unsubscribe(
        PCore.getConstants().PUB_SUB_EVENTS.CONTAINER_EVENTS.CLOSE_CONTAINER_ITEM,
        'showStartPageOnCloseContainerItem'
      );
    };
  }, []);

  function handleSignout() {
    if (currentDisplay === 'pegapage') {
      setShowSignoutModal(true);
    } else {
      triggerLogout();
    }
  }

  // useEffect(() => {
  //   loadBundles(sessionStorage.getItem('rsdk_locale') || 'en_GB');
  // }, []);

  // Function to force re-render the pega Root component
  const forceRefreshRootComponent = () => {
    renderRootComponent();
  };

  useEffect(() => {
    if (Object.keys(rootProps).length) {
      PCore.getPubSubUtils().subscribe(
        'forceRefreshRootComponent',
        forceRefreshRootComponent,
        'forceRefreshRootComponent'
      );
    }
    return () => {
      PCore?.getPubSubUtils().unsubscribe('forceRefreshRootComponent', 'forceRefreshRootComponent');
    };
  }, [rootProps]);

  useTimeoutTimer(setShowTimeoutModal);

  const handleStaySignIn = e => {
    e.preventDefault();
    setShowSignoutModal(false);
    // Extends manual signout popup 'stay signed in' to reset the automatic timeout timer also
    staySignedIn(setShowTimeoutModal, 'D_ClaimantSubmittedChBCases', null, null);
  };

  if (shuttered === null) {
    return null;
  } else if (shuttered) {
    setPageTitle();
    return (
      <>
        <AppHeader appname={t('HICBC_APP_NAME')} hasLanguageToggle={false} />
        <div className='govuk-width-container'>
          <ShutterServicePage />
        </div>
        <AppFooter />
      </>
    );
  } else {
    return (
      sdkIsLoggedIn() && (
        <>
          <AppHeader
            handleSignout={handleSignout}
            appname={t('HICBC_APP_NAME')}
            hasLanguageToggle={showLanguageToggle}
            betafeedbackurl={`${hmrcURL}contact/beta-feedback?service=463&referrerUrl=${window.location}`}
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
          <AppContext.Provider value={{ appBacklinkProps: {}, showLanguageToggle }}>
            <div className='govuk-width-container'>
              <div id='pega-part-of-page'>
                <div id='pega-root'></div>
              </div>
              {showLandingPage ? (
                <LandingPage onProceedHandler={() => landingPageProceedHandler()} />
              ) : (
                <ClaimPage
                  showSignoutModal={showSignoutModal}
                  setShowSignoutModal={setShowSignoutModal}
                  currentDisplay={currentDisplay}
                  summaryPageContent={summaryPageContent}
                  handleStaySignIn={handleStaySignIn}
                  showTimeoutModal={showTimeoutModal}
                />
              )}
            </div>
          </AppContext.Provider>
          <AppFooter />
        </>
      )
    );
  }
};
export default HighIncomeCase;
