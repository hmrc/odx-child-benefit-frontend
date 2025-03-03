import { t } from 'i18next';
import React from 'react';
import { timeoutText } from './timeOutUtils';
import Button from '../../BaseComponents/Button/Button';

export default function UnAuthTimeoutPopupContent({
  timeoutState,
  staySignedinHandler,
  userTimeoutDelete
}) {
  return (
    <div>
      <h1 id='hmrc-timeout-heading' className='govuk-heading-m push--top'>
        {t('FOR_YOUR_SECURITY')}
      </h1>

      <p className='govuk-body hmrc-timeout-dialog__message' aria-hidden='true'>
        {`${t('WE_WILL_DELETE_YOUR_ANSWERS')} `}
        <span className='hmrc-timeout-dialog__countdown'>{timeoutText(timeoutState)}</span>
      </p>
      <p className='govuk-visually-hidden screenreader-content' aria-live='assertive'>
        {timeoutState.countdownStart
          ? `${timeoutState.screenReaderCountdown}`
          : `${t('WE_WILL_DELETE_YOUR_ANSWERS')} ${t('2_MINUTES')}.`}
      </p>

      <div className='govuk-button-group govuk-!-padding-top-4'>
        <Button type='button' onClick={staySignedinHandler}>
          {t('CONTINUE_CLAIM')}
        </Button>

        <a
          id='modal-staysignin-btn'
          className='govuk-link'
          href='#'
          onClick={e => {
            e.preventDefault();
            userTimeoutDelete();
          }}
        >
          {t('DELETE_YOUR_ANSWERS')}
        </a>
      </div>
    </div>
  );
}
