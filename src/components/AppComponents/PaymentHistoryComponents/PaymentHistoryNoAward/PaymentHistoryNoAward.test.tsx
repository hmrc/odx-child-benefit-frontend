
import React from 'react';
import { render, screen } from '@testing-library/react';
import  PaymentHistoryNoAward  from './PaymentHistoryNoAward';
import PaymentHistoryListData from '../../../interfaces/PaymentHistoryListData';
import { useTranslation } from 'react-i18next';

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(),
}));

describe('PaymentHistoryNoAward', () => {
  beforeEach(() => {
    (useTranslation as jest.Mock).mockReturnValue({
      t: jest.fn((key) => key), 
    });
  });

  test('should render the payment opt-out heading and sub-heading text when payment history is available', () => {
    const paymentListData: Array<PaymentHistoryListData> = [
      { ExpectedCreditingDate: '20240627', Amount: -200.9 },
      { ExpectedCreditingDate: '20240527', Amount: 99.9 },
      { ExpectedCreditingDate: '20240427', Amount: 300.0 },
      { ExpectedCreditingDate: '20240327', Amount: -150.5 },
      { ExpectedCreditingDate: '20240227', Amount: 100.0 },
    ];

    render(<PaymentHistoryNoAward paymentAvailable={paymentListData.length > 0}/>);
    expect(screen.getByText('PAYMENT_HISTORY_AWARD_NO_PAYMENT_HEADING')).toBeInTheDocument();
    expect(screen.getByText('PAYMENT_HISTORY_OPT_OUT_SUB_HEADING_RECEIVED')).toBeInTheDocument();
  });

  test('should render alternative heading when payment history is not available', () => {
    const paymentListData: Array<PaymentHistoryListData> = [];

    render(<PaymentHistoryNoAward paymentAvailable={paymentListData.length > 0}/>);
    expect(screen.getByText('PAYMENT_HISTORY_AWARD_NO_PAYMENT')).toBeInTheDocument();
  });
});
