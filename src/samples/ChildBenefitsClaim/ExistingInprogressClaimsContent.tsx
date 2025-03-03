import React from 'react';
import { useTranslation } from 'react-i18next';

export default function ExistingInprogressClaimsContent() {
  const { t } = useTranslation();
  return (
    <>
      <p className='govuk-body'>{t('HAVE_EXISTING_CLAIM_IN_PROGRESS')}</p>
      <p className='govuk-body'>{t('CANNOT_START_A_NEW_CLAIM')}</p>
      <p className='govuk-body'>{t('WE_MAY_CALL_YOU')}</p>
    </>
  );
}
