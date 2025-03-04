import { useEffect, useState } from 'react';
import { getServiceShutteredStatus } from '../utils';

export default function useServiceShuttered(): boolean {
  const [serviceShuttered, setServiceShuttered] = useState<boolean>(null);

  useEffect(() => {
    const isServiceShuttered = async () => {
      const status: boolean = await getServiceShutteredStatus();
      setServiceShuttered(status);
    };

    isServiceShuttered();
  }, []);

  return serviceShuttered;
}
