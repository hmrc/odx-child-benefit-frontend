import React from 'react';
import { render, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import AppHeader from '.';
import * as rdd from 'react-device-detect';

jest.mock('@pega/auth/lib/sdk-auth-manager', () => ({
  getSdkConfig: jest.fn().mockResolvedValue({
    serverConfig: {
      sdkContentServerUrl: 'https://localhost:3502/',
      sdkHmrcURL: 'https://hmrc.gov.uk'
    },
    mobileApp: {
      mobileAppUserAgent: 'hmrcnextgenconsumer'
    }
  })
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: key => key })
}));

describe('<AppHeader />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // set defaults
  const props = {
    handleSignout: jest.fn(),
    appname: 'Test App',
    hasLanguageToggle: true,
    languageToggleCallback: jest.fn()
  };

  test('Renders the AppHeader component', async () => {
    let container;
    await act(async () => {
      ({ container } = render(<AppHeader {...props} />));
    });
    const appHeaderElement = await waitFor(() => container.querySelector('header'));

    expect(appHeaderElement).toBeInTheDocument();
  });

  test("The header component ISN'T rendered if the given string from the SDK config IS in the User Agent String", async () => {
    Object.defineProperty(rdd, 'getUA', {
      get: () =>
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) hmrcnextgenconsumer AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
    });

    let container;
    await act(async () => {
      ({ container } = render(<AppHeader {...props} />));
    });

    // Assuming CustomView renders a div, we can check if the div exists
    const customViewElement = await waitFor(() => container.querySelector('header'));

    // Check if the condition is applied correctly

    expect(customViewElement).not.toBeInTheDocument();
  });

  test("The header component IS rendered if the given string from the SDK config ISN'T in the User Agent String", async () => {
    Object.defineProperty(rdd, 'getUA', {
      get: () =>
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
    });

    let container;
    await act(async () => {
      ({ container } = render(<AppHeader {...props} />));
    });

    // Assuming CustomView renders a div, we can check if the div exists
    const customViewElement = await waitFor(() => container.querySelector('header'));

    // Check if the condition is applied correctly

    expect(customViewElement).toBeInTheDocument();
  });
});
