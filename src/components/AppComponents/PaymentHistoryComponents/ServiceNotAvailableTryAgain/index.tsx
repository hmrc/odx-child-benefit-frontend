import React from 'react';
import { useTranslation } from 'react-i18next';

export default function ServiceNotAvailableTryAgain() {
  const { t } = useTranslation();
  return (
    <>
      <h1 className='govuk-heading-l'>{t('SERVICE_NOT_AVAILABLE')}</h1>
      <p className='govuk-body'>{t('TRY_AGAIN_LATER')}</p>
      <p className='govuk-body'>{t('YOU_WILL_NEED_TO_START_AGAIN')}</p>
    </>
  );
}
