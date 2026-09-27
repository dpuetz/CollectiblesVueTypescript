export const formatUSD = (value: number, locale: string = 'en-US'): string =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
