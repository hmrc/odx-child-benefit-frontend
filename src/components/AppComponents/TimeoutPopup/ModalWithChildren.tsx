import React from 'react';
import Modal from '../../BaseComponents/Modal/Modal';
import Button from '../../BaseComponents/Button/Button';

export default function ModalWithChildren({
  show,
  children,
  staySignedinHandler,
  staySignedInButtonText,
  signoutHandler,
  signoutButtonText
}) {
  return (
    <Modal show={show} id='timeout-popup'>
      <div>
        {children}
        <div className='govuk-button-group govuk-!-padding-top-4'>
          <Button type='button' onClick={staySignedinHandler}>
            {staySignedInButtonText}
          </Button>

          <a id='modal-signout-btn' className='govuk-link' href='#' onClick={signoutHandler}>
            {signoutButtonText}
          </a>
        </div>
      </div>
    </Modal>
  );
}
