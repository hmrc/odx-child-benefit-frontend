import React from 'react';
import { render, screen } from '@testing-library/react';
import PaymentHistoryNextPayment from './PaymentHistoryNextPayment';
import PaymentHistoryListData from '../../../interfaces/PaymentHistoryListData';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
      t: (key: string) => key
    }),
}));

describe('PaymentHistoryNextPayment', () => {
    test('Renders content to give customer guidance on where to find info on next payment if they have payment history', () => {
        const paymentListData: Array<PaymentHistoryListData> = [
            { ExpectedCreditingDate: '20240627', Amount: -200.9 },
            { ExpectedCreditingDate: '20240527', Amount: 99.9 },
            { ExpectedCreditingDate: '20240427', Amount: 300.0 },
            { ExpectedCreditingDate: '20240327', Amount: -150.5 },
            { ExpectedCreditingDate: '20240227', Amount: 100.0 },
        ];

        render(<PaymentHistoryNextPayment paymentAvailable={paymentListData.length > 0} />);

        expect(screen.getByText("PAYMENT_HISTORY_NEXT_PAYMENT_TITLE")).toBeInTheDocument();
        expect(screen.getByText("PAYMENT_HISTORY_NEXT_PAYMENT_P1")).toBeInTheDocument();
        expect(screen.getByText("PAYMENT_HISTORY_NEXT_PAYMENT_P2")).toBeInTheDocument();
        expect(screen.getByText("PAYMENT_HISTORY_BANK_HOLIDAY_LINK")).toBeInTheDocument();
        expect(screen.getByText("PAYMENT_HISTORY_NEXT_PAYMENT_P3")).toBeInTheDocument();
    });

    test('Renders content to inform customer that they have not received payment if they have no payment history', () => {
        const paymentListData: Array<PaymentHistoryListData> = [];

        render(<PaymentHistoryNextPayment paymentAvailable={paymentListData.length > 0} />);

        expect(screen.getByText("PAYMENT_HISTORY_AWARD_NO_PAYMENT")).toBeInTheDocument();
    });
});