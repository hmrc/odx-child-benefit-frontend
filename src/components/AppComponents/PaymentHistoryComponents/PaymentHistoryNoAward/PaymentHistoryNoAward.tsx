import React from 'react';
import { useTranslation } from 'react-i18next';

interface PaymentHistoryNoAwardProps {
  paymentAvailable: boolean;
}

const PaymentHistoryNoAward: React.FC<PaymentHistoryNoAwardProps> = ({ paymentAvailable }) => {
  const { t } = useTranslation();

  return (
    <>
      {paymentAvailable ? (
        <>
          <p className='govuk-body'>{t('PAYMENT_HISTORY_AWARD_NO_PAYMENT_HEADING')} </p>
          <p className='govuk-body'>{t('PAYMENT_HISTORY_OPT_OUT_SUB_HEADING_RECEIVED')} </p>
        </>
      ) : (
        <p className='govuk-body'>{t('PAYMENT_HISTORY_AWARD_NO_PAYMENT')} </p>
      )}
    </>
  );
};

export default PaymentHistoryNoAward;