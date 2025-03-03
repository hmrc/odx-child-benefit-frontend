import React from 'react';
import { render, screen } from '@testing-library/react';
import PaymentOptOut from './PaymentOptOut';
import PaymentHistoryListData from '../../../interfaces/PaymentHistoryListData';
import { useTranslation } from 'react-i18next';

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn()
}));

describe('PaymentOptOut', () => {
  beforeEach(() => {
    (useTranslation as jest.Mock).mockReturnValue({
      t: jest.fn(key => key)
    });
  });

  test('should render the payment opt-out heading and sub-heading when paymentList is empty', () => {
    const paymentListData: Array<PaymentHistoryListData> = [];
    render(<PaymentOptOut paymentListAvailable={paymentListData.length>0} />);

    expect(screen.getByText('PAYMENT_HISTORY_OPT_OUT_HEADING')).toBeInTheDocument();
    expect(screen.getByText('PAYMENT_HISTORY_OPT_OUT_SUB_HEADING')).toBeInTheDocument();
  });

  test('should render the payment opt-out heading and different sub-heading when paymentList has items', () => {
    const paymentListData: Array<PaymentHistoryListData> = [
      { ExpectedCreditingDate: '20240627', Amount: -200.9 },
      { ExpectedCreditingDate: '20240527', Amount: 99.9 },
      { ExpectedCreditingDate: '20240427', Amount: 300.0 },
      { ExpectedCreditingDate: '20240327', Amount: -150.5 },
      { ExpectedCreditingDate: '20240227', Amount: 100.0 }
    ];
    render(<PaymentOptOut paymentListAvailable={paymentListData.length>0} />);

    expect(screen.getByText('PAYMENT_HISTORY_OPT_OUT_HEADING')).toBeInTheDocument();
    expect(screen.getByText('PAYMENT_HISTORY_OPT_OUT_SUB_HEADING_RECEIVED')).toBeInTheDocument();
  });
});
