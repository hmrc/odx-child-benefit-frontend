import React from 'react';
import { useTranslation } from 'react-i18next';
import MainWrapper from '../../components/BaseComponents/MainWrapper';
import Button from '../../components/BaseComponents/Button/Button';
import WarningText from './reuseables/WarningText/WarningText';

export default function LandingPage({ onProceedHandler }) {
  const { t } = useTranslation();

  return (
    <MainWrapper>
      <h1 className='govuk-heading-xl'>{t('HICBC_LANDINGPAGE_HEADING')}</h1>
      <p className='govuk-body'> {t('HICBC_LANDINGPAGE_P1')}</p>
      <p className='govuk-body'> {t('HICBC_LANDINGPAGE_P2')}</p>
      <ul className='govuk-list govuk-list--bullet'>
        <li>{t('HICBC_LANDINGPAGE_LISTITEM_BE_CHB_CLAIMANT')}</li>
        <li>
          {t('HICBC_LANDINGPAGE_LISTITEM_STILL_ELIGIBLE')}{' '}
          <a
            className='govuk-link'
            href='https://www.gov.uk/child-benefit/eligibility'
            target='_blank'
            rel='noreferrer noopener'
          >
            {t('HICBC_LANDINGPAGE_LISTITEM_STILL_ELIGIBLE_LINK_TEXT')} {t('OPENS_IN_NEW_TAB')}
          </a>
        </li>
        <li>{t('HICBC_LANDINGPAGE_LISTITEM_OPT_IN_WITHIN_3_MONTHS')}</li>
        <li>{t('HICBC_LANDINGPAGE_LISTITEM_HAVE_PAYMENT_DETAILS_AVAILABLE')}</li>
      </ul>
      <WarningText className='govuk-body'>
        {t('HICBC_LANDINGPAGE_WARNING_CAN_ONLY_BE_COMPLETED_BY_CLAIMANT')}
      </WarningText>
      <Button id='startNow' onClick={onProceedHandler} variant='start'>
        {t('START_NOW')}
      </Button>
      <br />
    </MainWrapper>
  );
}
