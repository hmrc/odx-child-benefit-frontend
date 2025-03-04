import React from 'react';
import { render, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { BrowserRouter as Router } from 'react-router-dom';
import AppFooter from '.';
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

describe('<AppFooter />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("The footer component ISN'T rendered if the given string from the SDK config IS in the User Agent String", async () => {
    Object.defineProperty(rdd, 'getUA', {
      get: () =>
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) hmrcnextgenconsumer AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
    });

    let container;
    await act(async () => {
      ({ container } = render(
        <Router>
          <AppFooter />
        </Router>
      ));
    });

    const customViewElement = await waitFor(() => container.querySelector('footer'));

    expect(customViewElement).not.toBeInTheDocument();
  });

  test("The footer component IS rendered if the given string from the SDK config ISN'T in the User Agent String", async () => {
    Object.defineProperty(rdd, 'getUA', {
      get: () =>
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
    });

    let container;
    await act(async () => {
      ({ container } = render(
        <Router>
          <AppFooter />
        </Router>
      ));
    });

    const customViewElement = await waitFor(() => container.querySelector('footer'));

    expect(customViewElement).toBeInTheDocument();
  });
});
