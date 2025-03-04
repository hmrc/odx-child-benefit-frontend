import { Dispatch, SetStateAction, useEffect } from 'react';
import { initTimeout, staySignedIn } from '../../AppComponents/TimeoutPopup/timeOutUtils';

export default function useTimeoutTimer(
  setShowTimeoutModal: Dispatch<SetStateAction<boolean>>
): void {
  useEffect(() => {
    const addTimer = () => {
      PCore.onPCoreReady(() => {
        PCore.getStore().subscribe(() =>
          // stay active when pega store changes
          staySignedIn(setShowTimeoutModal, 'D_ClaimantSubmittedChBCases', null, null)
        );
      });
      initTimeout(setShowTimeoutModal, false, true, false);
    };

    document.addEventListener('SdkConstellationReady', addTimer);

    return () => {
      document.removeEventListener('SdkConstellationReady', addTimer);
    };
  }, []);
}
