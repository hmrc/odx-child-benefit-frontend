import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import TimeoutPopup from './index';

jest.mock('@pega/auth/lib/sdk-auth-manager', () => ({
  getSdkConfig: jest.fn()
}));

jest.mock('../../BaseComponents/Modal/Modal', () => () => (
  <div
    tabIndex={-1}
    role='dialog'
    aria-modal='true'
    id='hmrc-timeout'
    aria-labelledby='hmrc-timeout-heading hmrc-timeout-message'
  >
    <h1>Modal</h1>
  </div>
));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: key => key })
}));

describe('LogoutPopup Component', () => {
  let handleStaySignInMock: jest.Mock;
  let signOutMock: jest.Mock;

  beforeEach(() => {
    handleStaySignInMock = jest.fn();
    signOutMock = jest.fn();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  test('Closes the popup when Escape key is pressed', async () => {
    render(
      <TimeoutPopup
        show
        signoutHandler={signOutMock}
        isAuthorised
        staySignedinHandler={handleStaySignInMock}
      />
    );

    expect(screen.getByText('Modal')).toBeInTheDocument();

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(handleStaySignInMock).toHaveBeenCalledTimes(1);
  });

  test('Does not close the popup when another key is pressed', () => {
    render(
      <TimeoutPopup
        show
        signoutHandler={signOutMock}
        isAuthorised
        staySignedinHandler={handleStaySignInMock}
      />
    );

    expect(screen.getByText('Modal')).toBeInTheDocument();

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Shift' });
    expect(handleStaySignInMock).toHaveBeenCalledTimes(0);
  });
});
