import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import PaymentHistory from './PaymentHistory';
import { loginIfNecessary, sdkIsLoggedIn } from '@pega/auth/lib/sdk-auth-manager';
import { initTimeout } from '../../components/AppComponents/TimeoutPopup/timeOutUtils';
import { addDeviceIdCookie } from '../../components/helpers/cookie';
import PaymentHistoryDatapage from '../../components/interfaces/PaymentHistoryDatapage';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

jest.mock('../../components/AppComponents/AppHeader', () => () => <header />);

jest.mock('../../components/AppComponents/AppFooter', () => () => <footer />);

jest.mock('../../components/AppComponents/PaymentHistoryComponents/ServiceNotAvailableTryAgain', () => () => 
  <div data-test-id='error-div'>
    Error Page
  </div>
);

jest.mock('@pega/auth/lib/sdk-auth-manager', () => ({
  getSdkConfig: jest.fn().mockResolvedValue({
    serverConfig: {
      sdkContentServerUrl: 'https://mocked.content.server.url',
      sdkHmrcURL: 'https://mocked.url'
    },
    mobileApp: { mobileAppUserAgent: 'agent' },
    timeoutConfig: {}
  }),
  loginIfNecessary: jest.fn(),
  sdkIsLoggedIn: jest.fn().mockResolvedValue(false)
}));

jest.mock('../../components/AppComponents/TimeoutPopup/timeOutUtils', () => ({
  initTimeout: jest.fn()
}));

jest.mock('../../components/helpers/cookie', () => ({
  addDeviceIdCookie: jest.fn()
}));

describe('PaymentHistory Component', () => {
  const mockGetPageDataAsync = jest.fn();

  const mockApiDataOptedIn: PaymentHistoryDatapage = {
    IsPaymentOptedOut: false,
    HasAward: true,
    PaymentList: [
      { ExpectedCreditingDate: '20240627', Amount: 100.0 },
      { ExpectedCreditingDate: '20240527', Amount: 99.9 },
      { ExpectedCreditingDate: '20240427', Amount: 300.0 },
      { ExpectedCreditingDate: '20240327', Amount: 100.5 },
      { ExpectedCreditingDate: '20240227', Amount: -300.0 },
      { ExpectedCreditingDate: '20240127', Amount: 300.75 },
      { ExpectedCreditingDate: '20231227', Amount: 100.8 }
    ],
    Claimant: {
      pyFirstName: 'Firstname',
      pyFullName: 'Firstname Lastname',
      pyLastName: 'Lastname'
    }
  };

  beforeEach(() => {
    (window as any).PCore = {
      getDataPageUtils: jest.fn(() => ({
        getPageDataAsync: mockGetPageDataAsync
      })),
      onPCoreReady: jest.fn(callback => callback())
    };

    (window as any).myLoadMashup = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state initially', async () => {
    await act(async () => {
      render(<PaymentHistory />);
    });
    expect(screen.getByText('LOADING')).toBeInTheDocument();
  });

  test('calls loginIfNecessary if user is not logged in', async () => {
    (sdkIsLoggedIn as jest.Mock).mockReturnValue(false);
    await act(async () => {
      render(<PaymentHistory />);
    });
    await waitFor(() => expect(loginIfNecessary).toHaveBeenCalled());
  });

  test('does not call loginIfNecessary if user is already logged in', async () => {
    (sdkIsLoggedIn as jest.Mock).mockReturnValue(true);
    await act(async () => {
      render(<PaymentHistory />);
    });
    expect(loginIfNecessary).not.toHaveBeenCalled();
  });

  test('initializes timeout on mount', async () => {
    await act(async () => {
      render(<PaymentHistory />);
    });

    expect(initTimeout).toHaveBeenCalledWith(expect.any(Function), false, true, false);
  });

  test('renders payment opt-out heading if user has opted out', async () => {
    render(<PaymentHistory />);
    mockGetPageDataAsync.mockResolvedValue({
      IsPaymentOptedOut: true,
      HasAward: true,
      PaymentList: [
        { ExpectedCreditingDate: '20240627', Amount: 100.0 },
        { ExpectedCreditingDate: '20240527', Amount: 99.9 },
        { ExpectedCreditingDate: '20240427', Amount: 300.0 },
        { ExpectedCreditingDate: '20240327', Amount: 100.5 },
        { ExpectedCreditingDate: '20240227', Amount: -300.0 },
        { ExpectedCreditingDate: '20240127', Amount: 300.75 },
        { ExpectedCreditingDate: '20231227', Amount: 100.8 }
      ],
      Claimant: {
        pyFirstName: 'Firstname',
        pyFullName: 'Firstname Lastname',
        pyLastName: 'Lastname'
      }
    });
    const event = new Event('SdkConstellationReady');
    document.dispatchEvent(event);
    await waitFor(() => {
      expect(addDeviceIdCookie).toHaveBeenCalled();
      expect(mockGetPageDataAsync).toHaveBeenCalled();
      expect(screen.getByText('PAYMENT_HISTORY_HEADING')).toBeInTheDocument();
      expect(screen.getByText('PAYMENT_HISTORY_OPT_OUT_SUB_HEADING_RECEIVED')).toBeInTheDocument();
    });
  });

  test('renders alternative payment heading if user has opted in', async () => {
    render(<PaymentHistory />);
    mockGetPageDataAsync.mockResolvedValue(mockApiDataOptedIn);
    const event = new Event('SdkConstellationReady');
    document.dispatchEvent(event);
    await waitFor(() => {
      expect(addDeviceIdCookie).toHaveBeenCalled();
      expect(mockGetPageDataAsync).toHaveBeenCalled();
      expect(screen.getByText('PAYMENT_HISTORY_HEADING')).toBeInTheDocument();
      expect(screen.getByText('PAYMENT_HISTORY_HEADING3')).toBeInTheDocument();
    });
  });

  test('Renders payment table if payment list length > 0', async () => {
    render(<PaymentHistory/>);

    mockGetPageDataAsync.mockResolvedValueOnce(mockApiDataOptedIn);

    const event = new Event('SdkConstellationReady');
    document.dispatchEvent(event);

    await waitFor(() => {
      expect(addDeviceIdCookie).toHaveBeenCalled();
      expect(mockGetPageDataAsync).toHaveBeenCalled();
    });

    const table = await screen.findByTestId('payment-history-table');
    expect(table).toBeInTheDocument();
  });
  
  test('Renders next payment component when user has opted in', async () => {
    render(<PaymentHistory/>);

    mockGetPageDataAsync.mockResolvedValueOnce(mockApiDataOptedIn);

    const event = new Event('SdkConstellationReady');
    document.dispatchEvent(event);

    await waitFor(() => {
      expect(addDeviceIdCookie).toHaveBeenCalled();
      expect(mockGetPageDataAsync).toHaveBeenCalled();
    });

    const nextPaymentComponent = await screen.findByTestId('next-payment-info-div');
    expect(nextPaymentComponent).toBeInTheDocument();
  });

  test('Renders error page when API fails', async () => {
    render(<PaymentHistory/>);
    
    mockGetPageDataAsync.mockResolvedValue({
      IsApiError: true
    });

    const event = new Event('SdkConstellationReady');
    document.dispatchEvent(event);

    await waitFor(() => {
      expect(addDeviceIdCookie).toHaveBeenCalled();
      expect(mockGetPageDataAsync).toHaveBeenCalled();
    });

    const error = await screen.findByTestId('error-div');
    expect(error).toBeInTheDocument();
  });
});
