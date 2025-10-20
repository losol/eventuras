interface FormatDateOptions {
  locale?: string;
  showTime?: boolean;
}

const formatDate = (
  date: string | Date,
  { locale = 'en-US', showTime = false }: FormatDateOptions = {}
): string => {
  if (!date) {
    return '';
  }

  const dateOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
  };

  const parsedDate = new Date(date);
  let formattedDate = parsedDate.toLocaleDateString(locale, dateOptions);

  if (showTime) {
    formattedDate += ' ' + parsedDate.toLocaleTimeString(locale, timeOptions);
  }

  return formattedDate;
};

const formatDateSpan = (
  startDate: string | Date,
  endDate: string | Date | null = null,
  options: FormatDateOptions = {}
): string => {
  if (!startDate) {
    return '';
  }

  const formattedStartDate = formatDate(startDate, options);

  if (!endDate || startDate === endDate) {
    return formattedStartDate;
  }

  const formattedEndDate = formatDate(endDate, options);

  return `${formattedStartDate} - ${formattedEndDate}`;
};

export { formatDate, formatDateSpan };
export type { FormatDateOptions };
