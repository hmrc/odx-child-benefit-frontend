import React from 'react';
import { render, screen } from '@testing-library/react';
import ServiceNotAvailableTryAgain from './index';
import { useTranslation } from 'react-i18next';

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn()
}));

describe('ServiceNotAvailableTryAgain', () => {
  beforeEach(() => {
    (useTranslation as jest.Mock).mockReturnValue({
      t: jest.fn(key => key)
    });
  });

  test('should render the payment opt-out heading and sub-heading text', () => {
    render(<ServiceNotAvailableTryAgain />);
    expect(screen.getByText('SERVICE_NOT_AVAILABLE')).toBeInTheDocument();
    expect(screen.getByText('TRY_AGAIN_LATER')).toBeInTheDocument();
    expect(screen.getByText('YOU_WILL_NEED_TO_START_AGAIN')).toBeInTheDocument();
  });
});
