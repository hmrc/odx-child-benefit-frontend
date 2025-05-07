import React, { ReactNode, useState } from 'react';

import { CustomView, getUA } from 'react-device-detect';
import { getSdkConfig } from '@pega/auth/lib/sdk-auth-manager';

const HideOnMobileView = (props: { children: ReactNode }) => {
  const [mobileAppUA, setMobileAppUA] = useState<string | null>(null);

  getSdkConfig()
    .then(sdkConfig => {
      if (sdkConfig && sdkConfig.mobileApp && sdkConfig.mobileApp.mobileAppUserAgent && getUA) {
        setMobileAppUA(sdkConfig.mobileApp.mobileAppUserAgent);
      } else {
        setMobileAppUA('/');
      }
    })
    .catch(error => {
      // eslint-disable-next-line no-console
      console.error('Error fetching SDK config:', error);
    });

  return (
    <CustomView condition={!getUA.toLocaleLowerCase().includes(mobileAppUA)}>
      {props.children}
    </CustomView>
  );
};

export default HideOnMobileView;
