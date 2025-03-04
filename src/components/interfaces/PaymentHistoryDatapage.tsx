import PaymentHistoryListData from './PaymentHistoryListData';

export default interface PaymentHistoryDatapage {
  IsApiError?: boolean;
  HasAward?: boolean;
  HasPreviousAward?: boolean;
  IsPaymentOptedOut: boolean;
  PaymentList: Array<PaymentHistoryListData>;
  Claimant: {
    pyFirstName: string;
    pyFullName: string;
    pyLastName: string;
  };
}
