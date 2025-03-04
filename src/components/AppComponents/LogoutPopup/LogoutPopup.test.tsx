import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import LogoutPopup from './index';

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
  let hideModalMock: jest.Mock;

  beforeEach(() => {
    handleStaySignInMock = jest.fn();
    hideModalMock = jest.fn();
    render(
      <LogoutPopup
        show
        hideModal={hideModalMock}
        handleSignoutModal={() => {}}
        handleStaySignIn={handleStaySignInMock}
      >
        <h1>Content</h1>
      </LogoutPopup>
    );
  });

  test('Closes the popup when Escape key is pressed', () => {
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(hideModalMock).toHaveBeenCalledTimes(1);
    expect(handleStaySignInMock).toHaveBeenCalledTimes(1);


  });
  test('Does not close the popup when another key is pressed', () => {
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Shift' });
    expect(hideModalMock).toHaveBeenCalledTimes(0);
    expect(handleStaySignInMock).toHaveBeenCalledTimes(0);
  });
});
