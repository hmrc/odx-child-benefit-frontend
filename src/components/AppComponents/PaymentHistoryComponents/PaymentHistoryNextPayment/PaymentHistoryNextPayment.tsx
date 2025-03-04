import React from 'react';
import { useTranslation } from 'react-i18next';

interface PaymentHistoryNextPaymentProps {
    paymentAvailable: boolean;
}

const PaymentHistoryNextPayment: React.FC<PaymentHistoryNextPaymentProps> = ({ paymentAvailable }) => {
    const { t } = useTranslation();

    return (
        <>  
            {paymentAvailable ? (
                    <div className='next-payment-container' data-test-id='next-payment-info-div'>
                        <h1 className='govuk-heading-m'>
                            {t("PAYMENT_HISTORY_NEXT_PAYMENT_TITLE")}
                        </h1>
                        <p className='govuk-body'>
                            {t("PAYMENT_HISTORY_NEXT_PAYMENT_P1")}
                        </p>
                        <p className='govuk-body'>
                            {t("PAYMENT_HISTORY_NEXT_PAYMENT_P2")}
                            <a
                                className='govuk-link'
                                href='https://www.gov.uk/child-benefit-payment-dates/bank-holidays'
                                target='_blank'
                                rel='noreferrer noopener'
                            >
                                {t("PAYMENT_HISTORY_BANK_HOLIDAY_LINK")}
                            </a>
                        </p>
                        <p className='govuk-body'>
                            {t("PAYMENT_HISTORY_NEXT_PAYMENT_P3")}
                        </p>
                    </div>
                ) : (
                    <div data-test-id='next-payment-no-history-div'>
                        <p className='govuk-body'>
                            {t("PAYMENT_HISTORY_AWARD_NO_PAYMENT")}
                        </p>
                    </div>
                )
            }
        </>
    )
}

export default PaymentHistoryNextPayment;