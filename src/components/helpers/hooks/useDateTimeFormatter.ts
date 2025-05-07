import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

interface DateTimeFormatter {
  formatTimestamp: (hour: string, min: string, meridiem: string) => string;
  formatDate: (date: string | Date) => string;
  getFormattedDate: (date: string | Date) => string;
}

function useDateTimeFormatter(): DateTimeFormatter {
  const { t } = useTranslation();

  const formatTimestamp = (hour: string, min: string, meridiem: string): string => {
    const meridiemTime = meridiem === 'am' ? t('AM') : t('PM');

    // Handle midnight/midday cases
    if (hour === '12' && min === '00') {
      return meridiem === 'pm' ? t('MIDDAY') : t('MIDNIGHT');
    }

    // Format time without minutes if minutes are '00'
    if (min === '00') {
      return `${hour}${meridiemTime}`;
    }

    // Default format
    return `${hour}:${min}${meridiemTime}`;
  };

  const formatDate = date => {
    return dayjs(date).format('D MMMM YYYY');
  };

  const getFormattedDate = date => {
    return `${formatDate(date)} ${t('AT')} ${formatTimestamp(dayjs(date).format('h'), dayjs(date).format('mm'), dayjs(date).format('a'))}`;
  };

  return {
    formatTimestamp,
    formatDate,
    getFormattedDate
  };
}

export default useDateTimeFormatter;
