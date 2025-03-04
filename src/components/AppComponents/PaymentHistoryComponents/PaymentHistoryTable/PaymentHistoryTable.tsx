import React from 'react'
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs'
import PaymentHistoryListData from '../../../interfaces/PaymentHistoryListData';

interface PaymentHistoryTableProps {
    paymentList: Array<PaymentHistoryListData>;
}

const PaymentHistoryTable: React.FC<PaymentHistoryTableProps> = ({ paymentList }) => {
    const { t } = useTranslation();
    const lang = sessionStorage.getItem('rsdk_locale')?.substring(0, 2) || 'en';
    dayjs.locale(lang);

    function formatPaymentDate(date: string): string {
        return dayjs(date).format('D MMMM YYYY');
    }

    function formatPaymentAmount(amount: number): string {
        return amount.toLocaleString('en-GB', { style: 'currency', currency: 'GBP' });
    }

    return (
        <>
            <table className='govuk-table' data-test-id='payment-history-table' >
                <caption className='govuk-table__caption govuk-table__caption--m'>
                    {t("PAYMENT_HISTORY_RECENT_PAYMENTS")}
                </caption>
                <caption className='govuk-table__caption govuk-table__caption--s table-subheading'>
                    {t("PAYMENT_HISTORY_MOST_RECENT_PAYMENTS")}
                </caption>
                <thead className='govuk-table__head'>
                    <tr className='govuk-table__row'>
                        <th scope='col' className='govuk-table__header'>{t("DATE")}</th>
                        <th scope='col' className='govuk-table__header'>{t("POE_LABEL_AMOUNT")}</th>
                    </tr>
                </thead>
                <tbody className='govuk-table__body'>
                    {paymentList.slice(0, 5).map((paymentData) => (
                        <tr className='govuk-table_row' key={paymentData.ExpectedCreditingDate}>
                            <th scope='col' className='govuk-table__header'>{formatPaymentDate(paymentData.ExpectedCreditingDate)}</th>
                            <td className='govuk-table__cell'>{formatPaymentAmount(paymentData.Amount)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    )
}

export default PaymentHistoryTable;