import React, { useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import Modal from '../../BaseComponents/Modal/Modal';
import Button from '../../BaseComponents/Button/Button';
import { useTranslation } from 'react-i18next';

export default function LogoutPopup(props) {
  const {
    hideModal,
    handleSignoutModal,
    handleStaySignIn,
    id,
    staySignedInButtonText,
    signoutButtonText,
    children,
    show
  } = props;
  const { t } = useTranslation();

  const staySignedInCallback = useCallback(
    event => {
      if (event.key === 'Escape') {
        handleStaySignIn(event);
        hideModal();
      }
    },
    [handleStaySignIn]
  );

  useEffect(() => {
    if (show) {
      window.addEventListener('keydown', staySignedInCallback);
    } else {
      window.removeEventListener('keydown', staySignedInCallback);
    }
    return () => {
      window.removeEventListener('keydown', staySignedInCallback);
    };
  }, [show]);

  if (children) {
    return (
      <Modal show={show} handleClose={hideModal} id={id}>
        <div>
          {children}
          <div className='govuk-button-group govuk-!-padding-top-4'>
            <Button
              type='button'
              id='modal-signout-btn'
              attributes={{ className: 'govuk-button' }}
              onClick={handleSignoutModal}
            >
              {signoutButtonText}
            </Button>

            <a
              id='modal-staysignin-btn'
              className='govuk-link '
              href='#'
              onClick={handleStaySignIn}
            >
              {staySignedInButtonText}
            </a>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal show={props.show} handleClose={hideModal} id={id}>
      <div>
        <h1 id='govuk-timeout-heading' className='govuk-heading-m push--top'>
          {t('YOU_ARE_ABOUT_TO_SIGN_OUT')}
        </h1>
        <p className='govuk-body'>{t('YOU_STILL_NEED_TO_SAVE_YOUR_PROGRESS')}</p>
        <p className='govuk-body'>{t('TO_SAVE_YOUR_PROGRESS')}</p>
        <div className='govuk-button-group govuk-!-padding-top-4'>
          <Button
            type='button'
            id='modal-signout-btn'
            attributes={{ className: 'govuk-button' }}
            onClick={handleSignoutModal}
          >
            {t('SIGN-OUT')}
          </Button>

          <a id='modal-staysignin-btn' className='govuk-link ' href='#' onClick={handleStaySignIn}>
            {t('STAY_SIGNED_IN')}
          </a>
        </div>
      </div>
    </Modal>
  );
}

LogoutPopup.propTypes = {
  id: PropTypes.string,
  show: PropTypes.bool,
  hideModal: PropTypes.func,
  handleSignoutModal: PropTypes.func,
  handleStaySignIn: PropTypes.func,
  staySignedInButtonText: PropTypes.string,
  signoutButtonText: PropTypes.string,
  children: PropTypes.any
};
