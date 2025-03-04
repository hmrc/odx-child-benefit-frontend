import { getSdkConfig } from '@pega/auth/lib/sdk-auth-manager';
import { isUnAuthJourney, triggerLogout } from '../../helpers/utils';
import { TIMEOUT_115_SECONDS, TIMEOUT_13_MINUTES } from '../../helpers/constants';
import { t } from 'i18next';
import { TimeoutState } from './index';

let millisecondsTillWarning = TIMEOUT_13_MINUTES;
let millisecondsTillSignout = TIMEOUT_115_SECONDS;

export const settingTimer = async () => {
  const sdkConfig = await getSdkConfig();
  if (sdkConfig.timeoutConfig.secondsTilWarning)
    millisecondsTillWarning = sdkConfig.timeoutConfig.secondsTilWarning * 1000;
  if (sdkConfig.timeoutConfig.secondsTilLogout)
    millisecondsTillSignout = sdkConfig.timeoutConfig.secondsTilLogout * 1000;
};

let applicationTimeout = null;
let signoutTimeout = null;

export function clearTimer() {
  clearTimeout(applicationTimeout);
  clearTimeout(signoutTimeout);
}

export const initTimeout = async (
  showTimeoutModal,
  deleteData,
  isAuthorised,
  isConfirmationPage
) => {
  // TODO - isAuthorised to be replaced by caseType from pega
  // Fetches timeout length config
  await settingTimer();
  clearTimeout(applicationTimeout);
  clearTimeout(signoutTimeout);

  // Clears any existing timeouts and starts the timeout for warning, after set time shows the modal and starts signout timer
  applicationTimeout = setTimeout(() => {
    // TODO - unauth and sessiontimeout functionality to be implemented
    showTimeoutModal(true);
    signoutTimeout = setTimeout(() => {
      if (!isAuthorised && !isConfirmationPage && deleteData) {
        // if the journey is not authorized or from confirmation page , the claim data gets deleted
        deleteData();
        clearTimer();
        // session ends and deleteData() (pega)
      }
    }, millisecondsTillSignout);
  }, millisecondsTillWarning);
};

export const resetTimeout = (showTimeoutModal, deleteData, isAuthorised, isConfirmationPage) => {
  // TODO - isAuthorised to be replaced by caseType from pega
  // Fetches timeout length config
  clearTimeout(applicationTimeout);
  clearTimeout(signoutTimeout);

  // Clears any existing timeouts and starts the timeout for warning, after set time shows the modal and starts signout timer
  applicationTimeout = setTimeout(() => {
    showTimeoutModal(true);
    signoutTimeout = setTimeout(() => {
      if (!isAuthorised && !isConfirmationPage && deleteData) {
        // if the journey is not authorized or from confirmation page , the claim data gets deleted
        deleteData();
        clearTimer();
      } else {
        // the logout case executes when entire timeout occurs after confirmation page or user clicks
        // exit survey link in pop after confirmation page
        triggerLogout();
      }
    }, millisecondsTillSignout);
  }, millisecondsTillWarning);
};

// Sends 'ping' to pega to keep session alive and then initiates the timeout
export function staySignedIn(
  setShowTimeoutModal,
  claimsListApi,
  deleteData = null,
  isAuthorised = false,
  refreshSignin = true,
  isConfirmationPage = false
) {
  const operatorId = {};
  if (refreshSignin && !!claimsListApi) {
    if (isUnAuthJourney()) {
      operatorId['OperatorId'] = 'Model_Unauth@ChB';
    }
    // @ts-ignore
    PCore.getDataPageUtils().getDataAsync(claimsListApi, 'root', { ...operatorId });
  }
  setShowTimeoutModal(false);
  resetTimeout(setShowTimeoutModal, deleteData, isAuthorised, isConfirmationPage);
}

export const timeoutText = (timeoutState: TimeoutState): string => {
  const { countdownStart, timeRemaining } = timeoutState;

  if (countdownStart) {
    if (timeRemaining === 60) {
      return `${t('1_MINUTE')}.`;
    } else if (timeRemaining === 1) {
      return `${timeRemaining} ${t('SECOND')}.`;
    } else if (timeRemaining < 60 || timeRemaining === 0) {
      return `${timeRemaining} ${t('SECONDS')}.`;
    }
  }

  return `${t('2_MINUTES')}.`;
};
