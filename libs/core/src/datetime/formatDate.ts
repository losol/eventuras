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

/**
 * Compact date range formatter for dense listings — produces strings like
 * `"14. SEP"`, `"14.–16. SEP"`, `"30. AUG–2. SEP"`, or
 * `"30. DEC 2026–2. JAN 2027"` depending on whether the range crosses
 * months or years. Output is uppercased to read as a label / pill.
 *
 * Returns an empty string when no start date is supplied. Pair with the
 * mono caps tile pattern in `EventTile` and similar dense displays.
 */
const formatCompactDateRange = (
  startDate: string | Date | null | undefined,
  endDate: string | Date | null | undefined,
  locale = 'en-US'
): string => {
  if (!startDate) return '';

  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : null;

  const dayMonthFmt = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' });
  const dayFmt = new Intl.DateTimeFormat(locale, { day: 'numeric' });
  const yearFmt = new Intl.DateTimeFormat(locale, { year: 'numeric' });

  // Pull the locale-formatted day number without any trailing punctuation
  // (some locales — e.g. nb-NO — append "." after the day; we add our own
  // literal `.` below and don't want a doubled period).
  const dayPart = (date: Date): string =>
    dayFmt.formatToParts(date).find(p => p.type === 'day')?.value ?? String(date.getDate());

  const startLabel = dayMonthFmt.format(start).toUpperCase();

  if (!end || +start === +end) {
    return startLabel;
  }

  const sameMonth =
    start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth();
  const sameYear = start.getFullYear() === end.getFullYear();

  if (sameMonth) {
    return `${dayPart(start)}.–${dayMonthFmt.format(end)}`.toUpperCase();
  }
  if (sameYear) {
    return `${dayMonthFmt.format(start)}–${dayMonthFmt.format(end)}`.toUpperCase();
  }
  return `${dayMonthFmt.format(start)} ${yearFmt.format(start)}–${dayMonthFmt.format(end)} ${yearFmt.format(end)}`.toUpperCase();
};

export { formatDate, formatDateSpan, formatCompactDateRange };
export type { FormatDateOptions };
