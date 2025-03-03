import React from 'react';
import { useTranslation } from 'react-i18next';
import AppHeader from '../../../components/AppComponents/AppHeader';
import AppFooter from '../../../components/AppComponents/AppFooter';
import CookiePageTable from './CookiePageTable';
import { scrollToTop } from '../../../components/helpers/utils';
import MainWrapper from '../../../components/BaseComponents/MainWrapper';
import { useLocation } from 'react-router-dom';
import { registerServiceName } from '../../../components/helpers/setPageTitleHelpers';

const FIND_OUT_MORE_URL = 'https://www.tax.service.gov.uk/help/cookie-details';

export default function CookiePage() {
  const { t } = useTranslation();
  const location = useLocation();
  scrollToTop();

  const searchParams = new URLSearchParams(location.search);
  const appNameHeader = searchParams.get('appname');
  const serviceNamePageTitle = searchParams.get('serviceNamePageTitle');
  const serviceParam = searchParams.get('serviceParam');

  registerServiceName(t(serviceNamePageTitle));

  return (
    <>
      <AppHeader appname={t(appNameHeader)} hasLanguageToggle />
      <div className='govuk-width-container'>
        <MainWrapper serviceParam={serviceParam}>
          <h1 className='govuk-heading-l'>{t('COOKIES')}</h1>
          <p className='govuk-body'>{t('COOKIES_PAGE_P1')}</p>
          <p className='govuk-body'>{t('COOKIES_PAGE_P2')}</p>
          <h2 className='govuk-heading-m'>{t('ESSENTIAL_COOKIES')}</h2>
          <p className='govuk-body'>{t('ESSENTIAL_COOKIES_P1')}</p>
          <CookiePageTable />
          <p className='govuk-body'>
            <a href={FIND_OUT_MORE_URL} className='govuk-link govuk-link--no-visited-state'>
              {t('COOKIE_FIND_OUT_MORE')}
            </a>
          </p>
        </MainWrapper>
      </div>
      <AppFooter />
    </>
  );
}
