import { getSdkConfig } from '@pega/auth/lib/sdk-auth-manager';

const redirectToMobileApp = () => {
  getSdkConfig().then(sdkConfig => {
    const mobileAppURL = sdkConfig.mobileAppURL;
    // eslint-disable-next-line no-console
    console.log('Mobile App URL:', mobileAppURL);
    if (mobileAppURL) {
      window.location.href = mobileAppURL;
    }
  });
};

export default redirectToMobileApp;
