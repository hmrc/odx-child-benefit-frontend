import React from 'react';
import UserPortal from '../ChildBenefitsClaim/UserPortal';
import { waitFor, render, screen, act } from '@testing-library/react';
import { configure } from '@testing-library/react';
import { mockGetSdkConfigWithBasepath } from '../../../tests/mocks/getSdkConfigMock';
import 'jest-fetch-mock';

configure({ testIdAttribute: 'data-test-id' });

jest.mock('@pega/auth/lib/sdk-auth-manager', () => ({
  getSdkConfig: jest.fn()
}));

describe('UserPortal Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  mockGetSdkConfigWithBasepath(); // Common mock

  const { queryByText } = render(
    <UserPortal beginClaim showPortalBanner showBeginNewClaimButton />
  );

  test('Begin new claim button should not render, if user has existing submitted claims', async () => {
    await waitFor(() => {
      expect(queryByText('Begin new claim')).not.toBeInTheDocument();
    });
  });
  test('Begin new claim button should render, if user has no existing submitted claims', async () => {
    await act(async () => {
      render(<UserPortal beginClaim showPortalBanner showBeginNewClaimButton />);
      await waitFor(() => {
        expect(screen.getByText(/BEGIN_NEW_CLAIM/i)).toBeInTheDocument();
      });
    });
  });
  test('UserPortal text message should not render, if user has existing claims', async () => {
    await waitFor(() => {
      expect(
        queryByText(
          'Use this service to make a new claim or add a child to an existing Child Benefit claim.'
        )
      ).not.toBeInTheDocument();
    });
  });
  test('Begin new claim button should not render, if user has existing in progress claims', async () => {
    await waitFor(() => {
      expect(queryByText('Begin new claim')).not.toBeInTheDocument();
    });
  });
  test('UserPortal text message should render, if user has existing subitted claims', async () => {
    await act(async () => {
      render(<UserPortal beginClaim showPortalBanner showBeginNewClaimButton />);
      await waitFor(() => {
        expect(screen.getByText(/PORTAL_NOTIFICATION_BANNER_CONTENT/i)).toBeInTheDocument();
      });
    });
  });
});
