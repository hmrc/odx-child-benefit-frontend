import React from 'react';
import { render, waitFor } from '@testing-library/react';
import TopLevelApp from '.';
import { mockGetSdkConfigWithBasepath } from '../../../tests/mocks/getSdkConfigMock';

// Component specific Mocking
jest.mock('../AppSelector', () => () => <div>AppSelector Component</div>);

jest.mock('@pega/auth/lib/sdk-auth-manager', () => ({
  getSdkConfig: jest.fn()
}));

describe('TopLevelApp Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders AppSelector when basepath is set', async () => {
    mockGetSdkConfigWithBasepath(); // Common mock

    const { getByText } = render(<TopLevelApp />);

    await waitFor(() => {
      expect(getByText('AppSelector Component')).toBeInTheDocument();
    });
  });
});
