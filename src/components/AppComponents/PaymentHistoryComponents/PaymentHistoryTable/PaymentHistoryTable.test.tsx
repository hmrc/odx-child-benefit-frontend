import React from 'react';
import { render, screen } from '@testing-library/react';
import PaymentHistoryListData from '../../../interfaces/PaymentHistoryListData';
import PaymentHistoryTable from './PaymentHistoryTable';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  }),
}));

jest.mock('dayjs', () => {
  const actualDayjs = jest.requireActual('dayjs');
  const mockDayjs = (dateString: string) => ({
    format: () => {
      const lang = sessionStorage.getItem('rsdk_locale')?.substring(0, 2) || 'en';
      const date = actualDayjs(dateString);
      const options: Intl.DateTimeFormatOptions = {day: 'numeric', month: 'long', year: 'numeric'};
      return new Intl.DateTimeFormat(`${lang}-GB`, options).format(date.toDate());
    },
  });
  mockDayjs.locale = jest.fn();
  return mockDayjs;
});

const sampleData: Array<PaymentHistoryListData> = [
        { ExpectedCreditingDate: '20240627', Amount: -200.9 },
        { ExpectedCreditingDate: '20240527', Amount: 99.9 },
        { ExpectedCreditingDate: '20240427', Amount: 300.0 },
        { ExpectedCreditingDate: '20240327', Amount: -150.5 },
        { ExpectedCreditingDate: '20240227', Amount: 100.0 },
        { ExpectedCreditingDate: '20240127', Amount: 300.0 },
        { ExpectedCreditingDate: '20231227', Amount: 100.8 }
];

const englishDateTestCases = [
  ['20240627', '27 June 2024'],
  ['20240527', '27 May 2024'],
  ['20240427', '27 April 2024'],
  ['20240327', '27 March 2024'],
  ['20240227', '27 February 2024']
];

const welshDateTestCases = [
  ['20240627', '27 Mehefin 2024'],
  ['20240527', '27 Mai 2024'],
  ['20240427', '27 Ebrill 2024'],
  ['20240327', '27 Mawrth 2024'],
  ['20240227', '27 Chwefror 2024']
];

const amountTestCases = [
  [-200.9, '-£200.90'],
  [99.9, '£99.90'],
  [300, '£300.00'],
  [-150.5, '-£150.50'],
  [100.0, '£100.00']
];

describe('PaymentHistoryTable', () => {
  test('Renders table captions', () => {
    render(<PaymentHistoryTable paymentList={sampleData} />);
    expect(screen.getByText("PAYMENT_HISTORY_RECENT_PAYMENTS")).toBeInTheDocument();
    expect(screen.getByText("PAYMENT_HISTORY_MOST_RECENT_PAYMENTS")).toBeInTheDocument();
  });

  test('Renders table headers', () => {
    render(<PaymentHistoryTable paymentList={sampleData} />);
    expect(screen.getByText("DATE")).toBeInTheDocument();
    expect(screen.getByText("POE_LABEL_AMOUNT")).toBeInTheDocument();
  });

  test('Renders the first five payments', () => {
    render(<PaymentHistoryTable paymentList={sampleData} />);
    const rows = screen.getAllByRole('row');
    // six rows, counting the headers
    expect(rows).toHaveLength(6);
  });

  test.each(englishDateTestCases) (
    'Renders the payment date %s formatted as %s in English',
    (inputDate, expectedDate) => {
      render(<PaymentHistoryTable paymentList={sampleData} />);
      expect(screen.getByText(expectedDate)).toBeInTheDocument();
    }
  );

  test.each(amountTestCases) (
    'Renders the payment amount %d in the expected format %s',
    (inputAmount, expectedAmount) => {
      render(<PaymentHistoryTable paymentList={sampleData} />);
      expect(screen.getByText(expectedAmount)).toBeInTheDocument();
    }
  );
});

describe('Renders the first five payment dates formatted as D MMMM YYYY in Welsh', () => {
  beforeEach(() => {
    sessionStorage.setItem('rsdk_locale', 'cy-GB');
  });

  test.each(welshDateTestCases)(
    'Renders the payment date %s formatted as %s in Welsh',
    (inputDate, expectedDate) => {
      render(<PaymentHistoryTable paymentList={sampleData} />);
      expect(screen.getByText(expectedDate)).toBeInTheDocument();
    }
  );
});