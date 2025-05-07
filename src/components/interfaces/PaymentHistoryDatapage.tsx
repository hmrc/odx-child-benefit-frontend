import PaymentHistoryListData from './PaymentHistoryListData';

export default interface PaymentHistoryDatapage {
  IsAPIError?: boolean;
  HasAward?: boolean;
  HasPreviousAward?: boolean;
  IsPaymentOptedOut: boolean;
  PaymentList: PaymentHistoryListData[];
  Claimant: {
    pyFirstName: string;
    pyFullName: string;
    pyLastName: string;
  };
}
