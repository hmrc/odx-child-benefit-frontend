import React from 'react';
import { t } from 'i18next';
import Button from '../../BaseComponents/Button/Button';
import { timeoutText } from './timeOutUtils';

export default function AuthorisedModal({ timeoutState, staySignedinHandler, signoutHandler }) {
  return (
    <div>
      <h1 id='hmrc-timeout-heading' className='govuk-heading-m push--top'>
        {t('YOURE_ABOUT_TO_BE_SIGNED_OUT')}
      </h1>
      <p className='govuk-body hmrc-timeout-dialog__message' aria-hidden='true'>
        {`${t('FOR_YOUR_SECURITY_WE_WILL_SIGN_YOU_OUT')} `}
        <span className='hmrc-timeout-dialog__countdown'>{timeoutText(timeoutState)}</span>
      </p>
      <p className='govuk-visually-hidden screenreader-content' aria-live='assertive'>
        {timeoutState.countdownStart
          ? `${timeoutState.screenReaderCountdown}`
          : `${t('FOR_YOUR_SECURITY_WE_WILL_SIGN_YOU_OUT')} ${t('2_MINUTES')}.`}
      </p>
      <Button type='button' onClick={staySignedinHandler}>
        {t('STAY_SIGNED_IN')}
      </Button>
      <div className='hmrc-timeout-dialog__link-wrapper'>
        <a
          id='modal-staysignin-btn'
          className='govuk-link hmrc-timeout-dialog__link'
          href='#'
          onClick={e => {
            e.preventDefault();
            signoutHandler();
          }}
        >
          {t('SIGN-OUT')}
        </a>
      </div>
    </div>
  );
}
