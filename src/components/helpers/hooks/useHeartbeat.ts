import { Dispatch, SetStateAction, useEffect } from 'react';
import { staySignedIn } from '../../AppComponents/TimeoutPopup/timeOutUtils';

export default function useHeartbeat(setShowTimeoutModal: Dispatch<SetStateAction<boolean>>) {
  const eventHandler = () => {
    staySignedIn(
      setShowTimeoutModal,
      'D_ClaimantWorkAssignmentChBCases',
      undefined,
      true,
      true,
      false
    );
  };
  useEffect(() => {
    window.addEventListener('HEARTBEAT', eventHandler);
    return () => {
      window.removeEventListener('HEARTBEAT', eventHandler);
    };
  }, []);
}
