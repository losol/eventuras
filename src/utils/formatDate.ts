/**
 * Formats dates into a string! If one date is provided, it will return a
 * formatted date string. If two dates are provided,
 * it will return a formatted date range string.
 *
 * @param {string | Date} startDate - The first date to format.
 * @param {string | Date | null} [endDate=null] - The end date to format if it is a period. Optional and defaults to null.
 * @param {string} [locale='en-US'] - The locale for formatting dates. Optional and defaults to 'en-US'.
 * @param {boolean} [showTime=false] - Whether to include the time in the formatted string. Optional and defaults to true.
 * @returns {string} A formatted date or date range string.
 */
const formatDate = (
  startDate: string | Date,
  endDate: string | Date | null = null,
  locale: string = 'en-US',
  showTime: boolean = false
): string => {
  const dateOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
  };

  if (!startDate) {
    return '';
  }

  const parsedStartDate = new Date(startDate);
  let formattedStartDate = parsedStartDate.toLocaleDateString(locale, dateOptions);

  if (showTime) {
    formattedStartDate += ' ' + parsedStartDate.toLocaleTimeString(locale, timeOptions);
  }

  if (!endDate) {
    return formattedStartDate;
  }

  const parsedEndDate = new Date(endDate);
  let formattedEndDate = parsedEndDate.toLocaleDateString(locale, dateOptions);

  if (showTime) {
    formattedEndDate += ' ' + parsedEndDate.toLocaleTimeString(locale, timeOptions);
  }

  if (startDate === endDate) {
    return formattedStartDate;
  }

  return `${formattedStartDate} - ${formattedEndDate}`;
};

export default formatDate;
