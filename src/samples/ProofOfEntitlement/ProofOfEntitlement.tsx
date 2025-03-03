import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { getSdkConfig, loginIfNecessary, sdkIsLoggedIn } from '@pega/auth/lib/sdk-auth-manager';
import AppHeader from '../../components/AppComponents/AppHeader';
import AppFooter from '../../components/AppComponents/AppFooter';
import ReadOnlyDisplay from '../../components/BaseComponents/ReadOnlyDisplay/ReadOnlyDisplay';
import ServiceNotAvailableTryAgain from '../../components/AppComponents/PaymentHistoryComponents/ServiceNotAvailableTryAgain';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import NoAwardPage from './NoAward';
import setPageTitle, { registerServiceName } from '../../components/helpers/setPageTitleHelpers';
import { triggerLogout, formatCurrency } from '../../components/helpers/utils';
import MainWrapper from '../../components/BaseComponents/MainWrapper';
import useHMRCExternalLinks from '../../components/helpers/hooks/HMRCExternalLinks';
import TimeoutPopup from '../../components/AppComponents/TimeoutPopup';
import { initTimeout } from '../../components/AppComponents/TimeoutPopup/timeOutUtils';
import { TIMEOUT_115_SECONDS } from '../../components/helpers/constants';
import LoadingWrapper from '../../components/AppComponents/LoadingSpinner/LoadingWrapper';
import { addDeviceIdCookie } from '../../components/helpers/cookie';

declare const PCore;
declare const myLoadMashup: any;

export default function ProofOfEntitlement() {
  const [entitlementData, setEntitlementData] = useState(null);
  const [showNoAward, setShowNoAward] = useState(false);
  const [showProblemWithService, setShowProblemWithService] = useState(false);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [millisecondsTillSignout, setmillisecondsTillSignout] = useState(TIMEOUT_115_SECONDS);
  const [pageContentReady, setPageContentReady] = useState(false);

  const { hmrcURL, referrerURL } = useHMRCExternalLinks();
  const history = useHistory();
  const { t } = useTranslation();

  registerServiceName(t('CHB_HOMEPAGE_HEADING'));

  const onRedirectDone = () => {
    history.replace('/view-proof-entitlement');
    // appName and mainRedirect params have to be same as earlier invocation
    loginIfNecessary({ appName: 'ChB', mainRedirect: true });
  };

  useEffect(() => {
    initTimeout(setShowTimeoutModal, false, true, false);
  }, []);

  useEffect(() => {
    if (!sdkIsLoggedIn()) {
      loginIfNecessary({ appName: 'ChB', mainRedirect: true, redirectDoneCB: onRedirectDone });
    }
    document.addEventListener('SdkConstellationReady', () => {
      myLoadMashup('pega-root', false);
      PCore.onPCoreReady(async () => {
        getSdkConfig().then(config => {
          if (config.timeoutConfig.secondsTilLogout) {
            setmillisecondsTillSignout(config.timeoutConfig.secondsTilLogout * 1000);
          }
        });
        await addDeviceIdCookie();
        PCore.getDataPageUtils()
          .getPageDataAsync('D_GetChBEntitlement', 'root')
          .then(result => {
            // If no claimant data in response, assume no award (or api error)
            if (result.IsAPIError) {
              setShowProblemWithService(true);
            } else if (!result.HasAward) {
              if (result.CanAccess) {
                // Award can still be viewed for 5 years after end date
                setEntitlementData(result);
              } else {
                // Award ended over 5 years ago
                setShowNoAward(true);
              }
            } else {
              // User has active child benefit
              setEntitlementData(result);
            }
            setPageContentReady(true);
            setPageTitle();
          })
          .catch(() => {
            setShowProblemWithService(true);
            setPageTitle();
          });
      });

      // getPDFContent();
    });
  }, []);

  const handleSignout = () => {
    triggerLogout();
  };

  return (
    <>
      <AppHeader
        appname={t('CHB_HOMEPAGE_HEADING')}
        hasLanguageToggle
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
        signoutButtonText={t('SIGN-OUT')}
        staySignedInButtonText={t('STAY_SIGNED_IN')}
        millisecondsTillSignout={millisecondsTillSignout}
      />
      <LoadingWrapper
        pageIsLoading={!pageContentReady}
        spinnerProps={{ bottomText: t('LOADING'), size: '30px', label: t('LOADING') }}
      >
        <div className='govuk-width-container' id='poe-page'>
          <MainWrapper>
            {entitlementData && (
              <>
                <p className='print-only govuk-caption-xl govuk-!-margin-bottom-3'>
                  {entitlementData.Claimant?.pyFullName}
                </p>
                <h1 className='govuk-heading-l'>{t('PROOF_ENTITLEMENT_HEADING')}</h1>
                <p className='print-hidden govuk-body'>
                  <a
                    href='#'
                    className='govuk-link'
                    onClick={e => {
                      e.preventDefault();
                      window.print();
                    }}
                  >
                    {t('PRINT_THIS_PAGE')}
                  </a>
                </p>
                <p className='govuk-body'>
                  {t('PROOF_ENTITLEMENT_CONFIRMATION')} {entitlementData.Claimant?.pyFullName}{' '}
                  {t('ON')} {dayjs().format('D MMMM YYYY')}.
                </p>
                <p className='govuk-body'>{t('POE_CHB_PAID_AT')}</p>
                <ul className='govuk-list govuk-list--bullet'>
                  <li>
                    {formatCurrency(entitlementData.HigherRateValue)} {t('POE_FOR_ELDEST_CHILD')}
                  </li>
                  <li>
                    {formatCurrency(entitlementData.StandardRateValue)}
                    {t('POE_FOR_ADDITIONAL_CHILD')}
                  </li>
                </ul>
                <h2 className='govuk-heading-m'>{t('PROOF_ENTITLEMENT_DETAILS_H2')}</h2>
                <p className='govuk-body print-hidden'>
                  {t('PROOF_ENTITLEMENT_IF_DETAILS_INCORRECT')}{' '}
                  <a
                    href='https://www.gov.uk/report-changes-child-benefit/if-your-familys-circumstances-change'
                    className='govuk-link'
                    target='_blank'
                    rel='noreferrer noopener'
                  >
                    {t('PROOF_ENTITLEMENT_IF_DETAILS_INCORRECT_CHANGE_YOUR_CIRCUSMSTANCES_LINK')}{' '}
                    {t('OPENS_IN_NEW_TAB')}
                  </a>{' '}
                  {t('PROOF_ENTITLMENT_IF_DETAILS_INCORRECT_OR_ABOUT')}{' '}
                  <a
                    href='https://www.gov.uk/report-changes-child-benefit'
                    className='govuk-link'
                    target='_blank'
                    rel='noreferrer noopener'
                  >
                    {t('PROOF_ENTITLEMENT_IF_DETAILS_INCORRECT_CHANGE_CHILDS_CIRCUMSTANCES_LINK')}{' '}
                    {t('OPENS_IN_NEW_TAB')}
                  </a>
                  {t('PROOF_ENTITLMENT_IF_DETAILS_INCORRECT_WILL_UPDATE')}
                </p>

                <dl className='govuk-summary-list page-break-after'>
                  <ReadOnlyDisplay
                    key='name'
                    label={t('POE_LABEL_NAME')}
                    value={entitlementData.Claimant?.pyFullName}
                  />
                  <ReadOnlyDisplay
                    key='address'
                    label={t('POE_LABEL_ADDRESS')}
                    value={entitlementData.Claimant?.CurrentAddress?.AddressCSV}
                    name={
                      entitlementData.Claimant?.CurrentAddress?.AddressCSV.indexOf(',') ? 'CSV' : ''
                    }
                  />
                  <ReadOnlyDisplay
                    key='amount'
                    label={t('POE_LABEL_AMOUNT')}
                    value={`${formatCurrency(entitlementData.AwardValue)} ${t('PER_WEEK')}`}
                  />
                  <ReadOnlyDisplay
                    key='startdate'
                    label={t('POE_LABEL_START_DATE')}
                    value={`${entitlementData.IsMigrated ? `${t('ON_OR_BEFORE')} ` : ''}${dayjs(
                      entitlementData.AwardStart
                    ).format('D MMMM YYYY')}`}
                  />
                  <ReadOnlyDisplay
                    key='enddate'
                    label={t('POE_LABEL_END_DATE')}
                    value={dayjs(entitlementData.AwardEnd).format('D MMMM YYYY')}
                  />
                </dl>

                {entitlementData.Children?.map(childData => {
                  return (
                    <React.Fragment key={childData?.pyFullName}>
                      <h2 className='govuk-heading-m'>
                        {t('CHILD_BENEFIT_DETAILS_FOR')} {childData?.pyFullName}
                      </h2>
                      <dl className='govuk-summary-list'>
                        <ReadOnlyDisplay
                          key={`${childData?.pyFullName} dob`}
                          label={t('POE_LABEL_CHILD_DOB')}
                          value={dayjs(childData.DateOfBirth).format('D MMMM YYYY') || ''}
                        />
                        <ReadOnlyDisplay
                          key={`${childData?.pyFullName} start`}
                          label={t('POE_LABEL_START_DATE')}
                          value={`${childData.IsMigrated ? `${t('ON_OR_BEFORE')} ` : ''}${dayjs(
                            childData.EligibilityStart
                          ).format('D MMMM YYYY')}`}
                        />
                        <ReadOnlyDisplay
                          key={`${childData?.pyFullName} end`}
                          label={t('POE_LABEL_END_DATE')}
                          value={dayjs(childData.EligibilityEnd).format('D MMMM YYYY')}
                        />
                      </dl>
                    </React.Fragment>
                  );
                })}

                <h2 className='govuk-heading-m print-hidden'>
                  {t('PROOF_ENTITLEMENT_VIEW_YOUR_PAYMENTS_H2')}
                </h2>
                <a href={`${referrerURL}view-payment-history`} className='govuk-link print-hidden'>
                  {t('PROOF_ENTITLEMENT_VIEW_PAST_PAYMENTS_LINK')}
                </a>
              </>
            )}
            {showNoAward && <NoAwardPage />}
            {showProblemWithService && <ServiceNotAvailableTryAgain />}
            <br />
            <br />
          </MainWrapper>
        </div>
      </LoadingWrapper>

      <AppFooter />
    </>
  );
}
