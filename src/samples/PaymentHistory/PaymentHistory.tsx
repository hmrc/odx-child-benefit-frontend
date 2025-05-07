import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginIfNecessary, sdkIsLoggedIn } from '@pega/auth/lib/sdk-auth-manager';
import AppHeader from '../../components/AppComponents/AppHeader';
import AppFooter from '../../components/AppComponents/AppFooter';
import PaymentOptOut from '../../components/AppComponents/PaymentHistoryComponents/PaymentOptOut/PaymentOptOut';
import PaymentHistoryNoAward from '../../components/AppComponents/PaymentHistoryComponents/PaymentHistoryNoAward/PaymentHistoryNoAward';
import ServiceNotAvailableTryAgain from '../../components/AppComponents/PaymentHistoryComponents/ServiceNotAvailableTryAgain';
import { useTranslation } from 'react-i18next';
import setPageTitle, { registerServiceName } from '../../components/helpers/setPageTitleHelpers';
import { triggerLogout } from '../../components/helpers/utils';
import MainWrapper from '../../components/BaseComponents/MainWrapper';
import useHMRCExternalLinks from '../../components/helpers/hooks/HMRCExternalLinks';
import TimeoutPopup from '../../components/AppComponents/TimeoutPopup';
import { initTimeout } from '../../components/AppComponents/TimeoutPopup/timeOutUtils';
import LoadingWrapper from '../../components/AppComponents/LoadingSpinner/LoadingWrapper';
import capitalizeWords from '../../components/helpers/formatters/capitalizeWords';
import PaymentHistoryTable from '../../components/AppComponents/PaymentHistoryComponents/PaymentHistoryTable/PaymentHistoryTable';
import PaymentHistoryDatapage from '../../components/interfaces/PaymentHistoryDatapage';
import PaymentHistoryNextPayment from '../../components/AppComponents/PaymentHistoryComponents/PaymentHistoryNextPayment/PaymentHistoryNextPayment';
import { addDeviceIdCookie } from '../../components/helpers/cookie';
import LanguageToggle from '../../components/AppComponents/LanguageToggle';

declare const myLoadMashup: any;

export default function PaymentHistory() {
  const [entitlementData, setEntitlementData] = useState<PaymentHistoryDatapage>(null);
  const [showNoAward, setShowNoAward] = useState(false);
  const [showPaymentOptOut, setShowPaymentOptOut] = useState(false);
  const [showPaymentOptIn, setShowPaymentOptIn] = useState(false);
  const [showProblemWithService, setShowProblemWithService] = useState(false);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [pageContentReady, setPageContentReady] = useState(false);
  const { hmrcURL, referrerURL } = useHMRCExternalLinks();
  const navigate = useNavigate();
  const { t } = useTranslation();

  registerServiceName(t('CHB_HOMEPAGE_HEADING'));

  const onRedirectDone = () => {
    navigate('/view-payment-history');
    // appName and mainRedirect params have to be same as earlier invocation
    loginIfNecessary({ appName: 'ChB', mainRedirect: true });
  };

  useEffect(() => {
    initTimeout(setShowTimeoutModal, false, true, false);
  }, []);

  async function fetchPaymentHistoryData() {
    const result: PaymentHistoryDatapage = (await PCore.getDataPageUtils().getPageDataAsync(
      'D_GetChBPaymentHistory',
      'root'
    )) as PaymentHistoryDatapage;

    if (result.IsAPIError) {
      setShowProblemWithService(true);
    } else if (!result.HasAward) {
      setShowNoAward(true);
    } else if (result.IsPaymentOptedOut) {
      setShowPaymentOptOut(true);
    } else {
      setShowPaymentOptIn(true);
    }

    setEntitlementData(result);
    setPageContentReady(true);
    setPageTitle();
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!sdkIsLoggedIn()) {
          loginIfNecessary({ appName: 'ChB', mainRedirect: true, redirectDoneCB: onRedirectDone });
        }

        if (window.PCore) {
          await fetchPaymentHistoryData();
        }

        document.addEventListener('SdkConstellationReady', () => {
          myLoadMashup('pega-root', false);
          PCore.onPCoreReady(async () => {
            await addDeviceIdCookie();

            await fetchPaymentHistoryData();
          });
        });
      } catch (error) {
        setShowProblemWithService(true);
        setPageTitle();
      }
    };

    fetchData();
  }, []);

  const handleSignout = () => {
    triggerLogout();
  };

  return (
    <>
      <AppHeader
        appname={t('CHB_HOMEPAGE_HEADING')}
        betafeedbackurl={`${hmrcURL}contact/beta-feedback?service=463&referrerUrl=${window.location}`}
        handleSignout={handleSignout}
      />
      <TimeoutPopup
        show={showTimeoutModal}
        staySignedinHandler={() => {
          setShowTimeoutModal(false);
          initTimeout(setShowTimeoutModal, false, true, false);
          // Using operator details call as 'app agnostic' session keep-alive
          PCore.getUserApi().getOperatorDetails(PCore.getEnvironmentInfo().getOperatorIdentifier());
        }}
        signoutHandler={triggerLogout}
        isAuthorised
      />

      <LoadingWrapper
        pageIsLoading={!pageContentReady}
        spinnerProps={{ bottomText: t('LOADING'), size: '30px', label: t('LOADING') }}
      >
        <div className='govuk-width-container' id='poe-page'>
          <LanguageToggle />
          <MainWrapper>
            {entitlementData && !showProblemWithService && (
              <>
                <p className='govuk-caption-xl govuk-!-margin-bottom-3'>
                  {capitalizeWords(entitlementData.Claimant?.pyFullName)}
                </p>
                <h1 className='govuk-heading-l'>{t('PAYMENT_HISTORY_HEADING')}</h1>
                {showPaymentOptOut && (
                  <PaymentOptOut paymentListAvailable={entitlementData.PaymentList?.length > 0} />
                )}
                {showNoAward && (
                  <PaymentHistoryNoAward
                    paymentAvailable={entitlementData.PaymentList?.length > 0}
                  />
                )}

                {entitlementData.PaymentList?.length > 0 && (
                  <PaymentHistoryTable paymentList={entitlementData.PaymentList} />
                )}

                {showPaymentOptIn && (
                  <PaymentHistoryNextPayment
                    paymentAvailable={entitlementData.PaymentList?.length > 0}
                  />
                )}

                <h2 className='govuk-heading-m'>
                  {showNoAward && entitlementData.PaymentList?.length > 0
                    ? t('PAYMENT_HISTORY_HEADING2')
                    : t('PAYMENT_HISTORY_HEADING3')}
                </h2>
                <p className='govuk-body'>
                  {t('PAYMENT_HISTORY_YOU_CAN')}{' '}
                  <Link to={`${referrerURL}view-proof-entitlement`} className='govuk-link'>
                    {showNoAward && entitlementData.PaymentList?.length > 0
                      ? t('PAYMENT_HISTORY_LINK1')
                      : t('PAYMENT_HISTORY_LINK2')}
                  </Link>
                  , {t('PAYMENT_HISTORY_PRINT')}{' '}
                </p>
              </>
            )}
            {showProblemWithService && <ServiceNotAvailableTryAgain />}
          </MainWrapper>
        </div>
      </LoadingWrapper>

      <AppFooter />
    </>
  );
}
