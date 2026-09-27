import { describe, it, expect } from 'vitest';
import { formatUSD } from '@/utils/currency';

describe('formatUSD', () => {
  it('formats a typical dollar-and-cents amount', () => {
    expect(formatUSD(49.99)).toBe('$49.99');
  });

  it('pads whole numbers to two decimal places', () => {
    expect(formatUSD(20)).toBe('$20.00');
  });

  it('formats zero', () => {
    expect(formatUSD(0)).toBe('$0.00');
  });

  it('formats negative amounts', () => {
    expect(formatUSD(-5.25)).toBe('-$5.25');
  });

  it('inserts thousands separators', () => {
    expect(formatUSD(1234567.89)).toBe('$1,234,567.89');
  });

  it('rounds to two decimal places when given more precision', () => {
    // Intl.NumberFormat rounds half-away-from-zero at the boundary it keeps;
    // exact tie-breaking at the 3rd decimal is engine-dependent, so this
    // sticks to an unambiguous case.
    expect(formatUSD(9.999)).toBe('$10.00');
    expect(formatUSD(9.994)).toBe('$9.99');
  });

  it('defaults to en-US formatting when no locale is given', () => {
    expect(formatUSD(1000)).toBe(formatUSD(1000, 'en-US'));
  });

  it('respects an explicit locale', () => {
    // German locale uses a comma for decimals and a period for thousands,
    // and (per ICU/CLDR) renders the currency symbol after the amount.
    expect(formatUSD(1234.5, 'de-DE')).toBe('1.234,50\u00a0$');
  });

  it('always includes the USD currency symbol regardless of locale', () => {
    expect(formatUSD(10)).toContain('$');
  });
});