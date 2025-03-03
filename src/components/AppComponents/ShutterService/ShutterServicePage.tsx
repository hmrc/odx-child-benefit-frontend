import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import MainWrapper from '../../BaseComponents/MainWrapper';
import setPageTitle from '../../helpers/setPageTitleHelpers';

export default function ShutterServicePage() {
  const { t } = useTranslation();
  const lang = sessionStorage.getItem('rsdk_locale')?.substring(0, 2) || 'en';
  useEffect(() => {
    setPageTitle();
  }, [lang]);
  return (
    <MainWrapper showPageNotWorkingLink={false}>
      <h1 className='govuk-heading-l'>{t('SHUTTER_SERVICE_UNAVAILABLE')}</h1>
      <p className='govuk-body'>{t('SHUTTER_USE_SERVICE_LATER_MESSAGE')}</p>
      <p className='govuk-body'>
        {t('SHUTTER_ERROR_RETURN_TO')}{' '}
        <a className='govuk-link' href='https://www.gov.uk/child-benefit'>
          {t('SHUTTER_ERROR_RETURN_LINK')}
        </a>
        .
      </p>
    </MainWrapper>
  );
}
