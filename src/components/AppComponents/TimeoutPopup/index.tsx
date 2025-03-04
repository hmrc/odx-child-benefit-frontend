import React, { useEffect, useCallback, useReducer } from 'react';
import Modal from '../../BaseComponents/Modal/Modal';
import { useTranslation } from 'react-i18next';
import ModalWithChildren from './ModalWithChildren';
import UnAuthTimeoutPopupContent from './UnAuthTimeoutPopupContent';
import UnAuthTimeoutPopupContentForConfirmationPage from './UnAuthTimeoutPopupContentForConfirmationPage';
import AuthorisedModal from './AuthorisedModal';

interface TimeoutPopupPropTypes {
  show: boolean;
  millisecondsTillSignout?: number;
  staySignedinHandler: () => void;
  signoutHandler: () => void;
  isAuthorised: boolean;
  staySignedInButtonText: string;
  signoutButtonText: string;
  children?: any;
  isConfirmationPage?: boolean;
  userTimeoutDelete?: () => void;
}

type Action =
  | { type: 'START_COUNTDOWN'; payload: boolean }
  | { type: 'UPDATE_TIME_REMAINING'; payload: number }
  | { type: 'UPDATE_SCREEN_READER_COUNTDOWN'; payload: string };

export interface TimeoutState {
  countdownStart: boolean;
  timeRemaining: number;
  screenReaderCountdown: string;
}

export default function TimeoutPopup({
  show,
  millisecondsTillSignout,
  staySignedinHandler,
  signoutHandler,
  userTimeoutDelete,
  isAuthorised,
  isConfirmationPage,
  staySignedInButtonText,
  signoutButtonText,
  children
}: TimeoutPopupPropTypes) {
  const staySignedInCallback = useCallback(
    event => {
      if (event.key === 'Escape') staySignedinHandler();
    },
    [staySignedinHandler]
  );
  const { t } = useTranslation();

  const initialTimeoutState: TimeoutState = {
    countdownStart: false,
    timeRemaining: 60,
    screenReaderCountdown: ''
  };

  const reducer = (state: TimeoutState, action: Action) => {
    switch (action.type) {
      case 'START_COUNTDOWN':
        return { ...state, countdownStart: action.payload };
      case 'UPDATE_TIME_REMAINING':
        return { ...state, timeRemaining: action.payload };
      case 'UPDATE_SCREEN_READER_COUNTDOWN':
        return { ...state, screenReaderCountdown: action.payload };
      default:
        return state;
    }
  };

  const [timeoutState, dispatch] = useReducer(reducer, initialTimeoutState);

  useEffect(() => {
    let countdownTimeout;

    if (!show) {
      dispatch({ type: 'UPDATE_TIME_REMAINING', payload: 60 });
      dispatch({ type: 'UPDATE_SCREEN_READER_COUNTDOWN', payload: '' });
      dispatch({ type: 'START_COUNTDOWN', payload: false });
    } else {
      const milisecondsTilCountdown = millisecondsTillSignout - 60000;
      countdownTimeout = setTimeout(() => {
        dispatch({ type: 'START_COUNTDOWN', payload: true });
      }, milisecondsTilCountdown);
    }

    if (show) {
      window.addEventListener('keydown', staySignedInCallback);
    }

    return () => {
      if (countdownTimeout) {
        clearTimeout(countdownTimeout);
      }
      window.removeEventListener('keydown', staySignedInCallback);
    };
  }, [show]);

  function screenReaderContentDisplay() {
    if (!isConfirmationPage) {
      return isAuthorised
        ? t('FOR_YOUR_SECURITY_WE_WILL_SIGN_YOU_OUT')
        : t('FOR_YOUR_SECURITY_WE_WILL_DELETE_YOUR_ANSWER');
    } else {
      return t('FOR_YOUR_SECURITY_WE_WILL_AUTOMATICALLY_CLOSE_IN');
    }
  }

  useEffect(() => {
    if (timeoutState.countdownStart) {
      if (timeoutState.timeRemaining === 60) {
        dispatch({
          type: 'UPDATE_SCREEN_READER_COUNTDOWN',
          payload: `${screenReaderContentDisplay()} ${t('1_MINUTE')}`
        });
      }

      if (timeoutState.timeRemaining === 0) return;

      const timeRemainingInterval = setInterval(() => {
        dispatch({ type: 'UPDATE_TIME_REMAINING', payload: timeoutState.timeRemaining - 1 });
      }, 1000);

      return () => clearInterval(timeRemainingInterval);
    }
  }, [timeoutState.countdownStart, timeoutState.timeRemaining]);

  useEffect(() => {
    if (timeoutState.timeRemaining < 60 && timeoutState.timeRemaining % 20 === 0) {
      dispatch({
        type: 'UPDATE_SCREEN_READER_COUNTDOWN',
        payload: `${screenReaderContentDisplay()} ${timeoutState.timeRemaining} ${t('SECONDS')}`
      });
    }

    if (timeoutState.timeRemaining === 0) {
      const signoutHandlerTimeout = setTimeout(() => {
        signoutHandler();
      }, 1000);

      return () => {
        clearTimeout(signoutHandlerTimeout);
      };
    }
  }, [timeoutState.timeRemaining]);

  const renderUnAuthPopupContent = () => {
    return isConfirmationPage ? (
      <UnAuthTimeoutPopupContentForConfirmationPage
        timeoutState={timeoutState}
        staySignedinHandler={staySignedinHandler}
        signoutHandler={signoutHandler}
      />
    ) : (
      <UnAuthTimeoutPopupContent
        timeoutState={timeoutState}
        staySignedinHandler={staySignedinHandler}
        userTimeoutDelete={userTimeoutDelete}
      />
    );
  };

  if (children) {
    return (
      <ModalWithChildren
        show={show}
        staySignedinHandler={staySignedinHandler}
        staySignedInButtonText={staySignedInButtonText}
        signoutHandler={signoutHandler}
        signoutButtonText={signoutButtonText}
      >
        {children}
      </ModalWithChildren>
    );
  }

  return (
    <Modal show={show} id='timeout-popup'>
      {isAuthorised ? (
        <AuthorisedModal
          timeoutState={timeoutState}
          staySignedinHandler={staySignedinHandler}
          signoutHandler={signoutHandler}
        />
      ) : (
        renderUnAuthPopupContent()
      )}
    </Modal>
  );
}
