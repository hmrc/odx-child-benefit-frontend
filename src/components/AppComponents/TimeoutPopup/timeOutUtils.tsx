import { getSdkConfig } from '@pega/auth/lib/sdk-auth-manager';
import { isUnAuthJourney, triggerLogout } from '../../helpers/utils';
import { TIMEOUT_115_SECONDS, TIMEOUT_13_MINUTES } from '../../helpers/constants';
import { t } from 'i18next';
import { TimeoutState } from './index';
import { Dispatch, SetStateAction } from 'react';

let millisecondsOfInactivity = TIMEOUT_13_MINUTES;
let millisecondsTillSignout = TIMEOUT_115_SECONDS;
let applicationTimeout: ReturnType<typeof setTimeout> = null;
let countdownSignoutTimer: ReturnType<typeof setTimeout> = null;

export const settingTimerConfig = async (): Promise<void> => {
  const sdkConfig = await getSdkConfig();
  if (sdkConfig.timeoutConfig.secondsTilWarning)
    millisecondsOfInactivity = sdkConfig.timeoutConfig.secondsTilWarning * 1000;
  if (sdkConfig.timeoutConfig.secondsTilLogout)
    millisecondsTillSignout = sdkConfig.timeoutConfig.secondsTilLogout * 1000;
};

export function clearExistingTimers() {
  clearTimeout(applicationTimeout);
  clearTimeout(countdownSignoutTimer);
}

export const initTimeout = async (
  showTimeoutModal: Dispatch<SetStateAction<boolean>>,
  deleteData: any,
  isAuthorised: boolean,
  isConfirmationPage: boolean
) => {
  // Set timers to sdk-config values
  await settingTimerConfig();
  // TODO - isAuthorised to be replaced by caseType from pega
  // Fetches timeout length config
  clearTimeout(applicationTimeout);
  clearTimeout(countdownSignoutTimer);

  // Clears any existing timeouts and starts the timeout for warning, after set time shows the modal and starts signout timer
  applicationTimeout = setTimeout(() => {
    showTimeoutModal(true);
    countdownSignoutTimer = setTimeout(() => {
      if (!isAuthorised && !isConfirmationPage && deleteData) {
        // if the journey is not authorized or from confirmation page , the claim data gets deleted
        deleteData();
        clearExistingTimers();
      } else {
        // the logout case executes when entire timeout occurs after confirmation page or user clicks
        // exit survey link in pop after confirmation page
        triggerLogout();
      }
    }, millisecondsTillSignout);
  }, millisecondsOfInactivity);
};

// Sends 'ping' to pega to keep session alive and then initiates the timeout
export function staySignedIn(
  setShowTimeoutModal: Dispatch<SetStateAction<boolean>>,
  claimsListApi: string,
  deleteData = null,
  isAuthorised = false,
  refreshSignin = true,
  isConfirmationPage = false
) {
  const operatorId: { OperatorId?: string } = {};
  if (refreshSignin && !!claimsListApi) {
    if (isUnAuthJourney()) {
      operatorId.OperatorId = 'Model_Unauth@ChB';
    }
    PCore.getDataPageUtils().getDataAsync(claimsListApi, 'root', { ...operatorId }, {}, {});
  }
  setShowTimeoutModal(false);
  initTimeout(setShowTimeoutModal, deleteData, isAuthorised, isConfirmationPage);
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
