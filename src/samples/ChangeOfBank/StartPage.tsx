import React from 'react';
import WarningText from '../../components/BaseComponents/GDSWarningText/WarningText';
import Button from '../../components/BaseComponents/Button/Button';
import MainWrapper from '../../components/BaseComponents/MainWrapper';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function StartPage(props) {
  const { handleStartCOB } = props;
  const { t } = useTranslation();

  return (
    <MainWrapper>
      <h1 className='govuk-heading-xl'>{t('COB_PAGE_HEADING')}</h1>
      <WarningText className='govuk-body'>{t('COB_PAGE_WARNING')}</WarningText>
      <p className='govuk-body'>{t('COB_PAGE_P1')}</p>
      <p className='govuk-body'>
        {t('COB_PAGE_P2')}
        <Link to='/recently-claimed-child-benefit' className='govuk-link'>
          {t('COB_PAGE_MAKE_A_CLAIM')}
        </Link>
        .
      </p>
      <p className='govuk-body'>{t('COB_PAGE_P3')}</p>

      <Button
        id='continueToPortal'
        onClick={handleStartCOB}
        variant='start'
        data-prevent-double-click='true'
      >
        {t('START_NOW')}
      </Button>
    </MainWrapper>
  );
}
