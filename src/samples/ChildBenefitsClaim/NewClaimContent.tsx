import React, { useEffect } from 'react';
import Button from '../../components/BaseComponents/Button/Button';
import { useTranslation } from 'react-i18next';

export default function NewClaimContent(props) {
  const { beginClaim } = props;
  const { t } = useTranslation();
  useEffect(() => {
    const beginNewClaimButton = Array.from(document.querySelectorAll('a')).find(
      el => el.textContent === `${t('BEGIN_NEW_CLAIM')}`
    );
    beginNewClaimButton?.addEventListener('contextmenu', event => event.preventDefault());
  }, []);
  const keyHandler = e => {
    if (e?.ctrlKey) {
      e.preventDefault();
    } else {
      beginClaim();
    }
  };
  return (
    <>
      <p className='govuk-body'>{t('USE_THIS_SERVICE')}</p>
      <p className='govuk-body'>{t('WE_MAY_CALL_YOU')}</p>
      <Button attributes={{ className: 'govuk' }} onClick={e => keyHandler(e)} variant='start'>
        {t('BEGIN_NEW_CLAIM')}
      </Button>
    </>
  );
}
