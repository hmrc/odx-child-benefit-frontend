import React from 'react';
import { useTranslation } from 'react-i18next';

interface PaymentOptOutProps {
  paymentListAvailable: boolean;
}

const PaymentOptOut: React.FC<PaymentOptOutProps> = ({paymentListAvailable}) => {
  const { t } = useTranslation();

  return (
    <>
      <p className='govuk-body'>{t('PAYMENT_HISTORY_OPT_OUT_HEADING')} </p>
      {paymentListAvailable ? (
        <>
          <p className='govuk-body'>{t('PAYMENT_HISTORY_OPT_OUT_SUB_HEADING_RECEIVED')} </p>
        </>
      ) : (
        <p className='govuk-body'>{t('PAYMENT_HISTORY_OPT_OUT_SUB_HEADING')} </p>
      )}
    </>
  );
};
export default PaymentOptOut;
