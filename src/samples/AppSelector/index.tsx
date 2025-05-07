import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import i18n from 'i18next';
import ChildBenefitsClaim from '../ChildBenefitsClaim/index';
import CookiePage from '../ChildBenefitsClaim/cookiePage/index';
import UnAuthChildBenefitsClaim from '../UnAuthChildBenefitsClaim';
import HighIncomeCase from '../HighIncomeCase';
import AreYouSureToContinueWithoutSignIn from '../StaticPages/AreYouSureToContinueWithoutSignIn/AreYouSureToContinueWithoutSignIn';
import DoYouWantToSignIn from '../StaticPages/DoYouWantToSignIn/doYouWantToSignIn';
import CheckOnClaim from '../StaticPages/CheckOnClaim';
import RecentlyClaimedChildBenefit from '../StaticPages/ChooseClaimService';
import EducationStart from '../EducationStart';
import setPageTitle from '../../components/helpers/setPageTitleHelpers';
import ChildBenefitHub from '../ChildBenefitHub/ChildBenefitHub';
import ProofOfEntitlement from '../ProofOfEntitlement/ProofOfEntitlement';
import PaymentHistory from '../PaymentHistory/PaymentHistory';
import ChangeOfBank from '../ChangeOfBank/ChangeOfBank';
import { getSdkConfig } from '@pega/auth/lib/sdk-auth-manager';
import ChildBenefitGuidance from '../GovUkGuidance/ChildBenefitGuidance';

const AppSelector = () => {
  const [mobileAppURL, setMobileAppURL] = useState<string>('/');

  const [i18nloaded, seti18nloaded] = useState(false);

  useEffect(() => {
    i18n
      .use(Backend)
      .use(initReactI18next)
      .init({
        lng: sessionStorage.getItem('rsdk_locale')?.substring(0, 2) || 'en',

        backend: {
          loadPath: `assets/i18n/{{lng}}.json`
        },
        fallbackLng: 'en',
        debug: false,
        returnNull: false,
        react: {
          useSuspense: false
        }
      })
      .finally(() => {
        seti18nloaded(true);
        setPageTitle();
      });
    getSdkConfig().then(sdkConfig => {
      setMobileAppURL(sdkConfig.mobileApp.mobileAppUrl);
    });
  }, []);

  useEffect(() => {
    const currentPath = window.location.pathname;
    const assignmentID = sessionStorage.getItem('assignmentID');
    const storedURL = sessionStorage.getItem('currentURL');

    if (assignmentID && storedURL !== currentPath) {
      sessionStorage.removeItem('assignmentID');
    }
  }, []);

  return !i18nloaded ? null : (
    <Routes>
      <Route path='/' element={<ChildBenefitsClaim />} />
      <Route path='/ua' element={<UnAuthChildBenefitsClaim />} />

      <Route path='/home' element={<ChildBenefitHub />} />
      <Route path='/view-proof-entitlement' element={<ProofOfEntitlement />} />
      <Route path='/view-payment-history' element={<PaymentHistory />} />
      <Route path='/change-of-bank' element={<ChangeOfBank />} />

      <Route path='/hicbc/opt-in' element={<HighIncomeCase />} />
      <Route path='/education/start' element={<EducationStart />} />
      <Route path='/cookies' element={<CookiePage />} />
      <Route
        path='/are-you-sure-to-continue-without-sign-in'
        element={<AreYouSureToContinueWithoutSignIn />}
      />
      <Route path='/sign-in-to-government-gateway' element={<DoYouWantToSignIn />} />
      <Route path='/check-on-claim' element={<CheckOnClaim />} />
      <Route path='/recently-claimed-child-benefit' element={<RecentlyClaimedChildBenefit />} />
      <Route path='/how-to-claim' element={<ChildBenefitGuidance />} />

      <Route path='/mobile-app' element={<Navigate to={mobileAppURL || '/'} />} />
    </Routes>
  );
};

export default AppSelector;
