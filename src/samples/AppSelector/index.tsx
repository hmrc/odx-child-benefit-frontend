import React, { useEffect, useState } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
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
import PaymentHistory from '../PaymentHistory/PaymentHistory'
import ChangeOfBank from '../ChangeOfBank/ChangeOfBank';
import { getSdkConfig } from '@pega/auth/lib/sdk-auth-manager';

const AppSelector = () => {
  const [mobileAppURL, setMobileAppURL] = useState<string | null>(null);

  getSdkConfig().then(sdkConfig => {
    setMobileAppURL(sdkConfig.mobileApp.mobileAppURL);
  });

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
  }, []);

  return !i18nloaded ? null : (
    <Switch>
      <Route exact path='/' component={ChildBenefitsClaim} />
      <Route exact path='/ua' component={UnAuthChildBenefitsClaim} />

      <Route exact path='/home' component={ChildBenefitHub} />
      <Route exact path='/view-proof-entitlement' component={ProofOfEntitlement} />
      <Route exact path='/view-payment-history' component={PaymentHistory} />
      <Route exact path='/change-of-bank' component={ChangeOfBank} />

      <Route exact path='/hicbc/opt-in' component={HighIncomeCase} />
      <Route exact path='/education/start' component={EducationStart} />
      <Route path='/cookies' component={CookiePage} />
      <Route
        path='/are-you-sure-to-continue-without-sign-in'
        component={AreYouSureToContinueWithoutSignIn}
      />
      <Route path='/sign-in-to-government-gateway' component={DoYouWantToSignIn} />
      <Route path='/check-on-claim' component={CheckOnClaim} />
      <Route path='/recently-claimed-child-benefit' component={RecentlyClaimedChildBenefit} />

      <Redirect from='/mobile-app' to={mobileAppURL || '/'} />
    </Switch>
  );
};

export default AppSelector;
