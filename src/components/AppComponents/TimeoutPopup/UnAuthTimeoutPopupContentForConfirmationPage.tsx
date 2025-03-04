import React from 'react';
import { t } from 'i18next';
import Button from '../../BaseComponents/Button/Button';
import { timeoutText } from './timeOutUtils';

export default function UnAuthTimeoutPopupContentForConfirmationPage({
  timeoutState,
  staySignedinHandler,
  signoutHandler
}) {
  return (
    <div>
      <h1 id='govuk-timeout-heading' className='govuk-heading-m push--top'>
        {t('FOR_YOUR_SECURITY')}
      </h1>

      <p className='govuk-body hmrc-timeout-dialog__message' aria-hidden='true'>
        {`${t('AUTOMATICALLY_CLOSE_IN')} `}
        <span className='hmrc-timeout-dialog__countdown'>{timeoutText(timeoutState)}</span>
      </p>
      <p className='govuk-visually-hidden screenreader-content' aria-live='assertive'>
        {timeoutState.countdownStart
          ? `${timeoutState.screenReaderCountdown}`
          : `${t('AUTOMATICALLY_CLOSE_IN')} ${t('2_MINUTES')}.`}
      </p>

      <div className='govuk-button-group govuk-!-padding-top-4'>
        <Button type='button' onClick={staySignedinHandler}>
          {t('STAY_ON_THIS_PAGE')}
        </Button>

        <a
          id='modal-staysignin-btn'
          className='govuk-link'
          href='#'
          onClick={e => {
            e.preventDefault();
            signoutHandler();
          }}
        >
          {t('EXIT_THIS_PAGE')}
        </a>
      </div>
    </div>
  );
}
