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
