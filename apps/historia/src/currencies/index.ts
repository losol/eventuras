export interface Currency {
  code: string;
  decimals: number;
  label: string;
  symbol: string;
}

export const NOK: Currency = {
  code: 'NOK',
  decimals: 2,
  label: 'Norwegian Krone',
  symbol: 'kr',
};

export const USD: Currency = {
  code: 'USD',
  decimals: 2,
  label: 'US Dollar',
  symbol: '$',
};

export const EUR: Currency = {
  code: 'EUR',
  decimals: 2,
  label: 'Euro',
  symbol: '€',
};

export const GBP: Currency = {
  code: 'GBP',
  decimals: 2,
  label: 'British Pound',
  symbol: '£',
};

export const SEK: Currency = {
  code: 'SEK',
  decimals: 2,
  label: 'Swedish Krona',
  symbol: 'kr',
};

export const DKK: Currency = {
  code: 'DKK',
  decimals: 2,
  label: 'Danish Krone',
  symbol: 'kr',
};

export const currencies: Record<string, Currency> = {
  NOK,
  USD,
  EUR,
  GBP,
  SEK,
  DKK,
};

/**
 * Get currency configuration by code
 */
export function getCurrency(code: string): Currency | undefined {
  return currencies[code.toUpperCase()];
}

/**
 * Get list of all currency codes
 */
export function getCurrencyCodes(): string[] {
  return Object.keys(currencies);
}

/**
 * Get list of currency options for select fields
 */
export function getCurrencyOptions() {
  return Object.values(currencies).map((currency) => ({
    label: `${currency.label} (${currency.code})`,
    value: currency.code,
  }));
}
