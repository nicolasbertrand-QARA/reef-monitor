import { parseLocaleFloat } from '../number';

describe('parseLocaleFloat', () => {
  it('parses dot decimals', () => {
    expect(parseLocaleFloat('8.2')).toBe(8.2);
    expect(parseLocaleFloat('1.025')).toBe(1.025);
  });

  it('parses comma decimals (FR/DE iOS decimal pad)', () => {
    expect(parseLocaleFloat('8,2')).toBe(8.2);
    expect(parseLocaleFloat('1,5')).toBe(1.5);
    expect(parseLocaleFloat('0,05')).toBe(0.05);
  });

  it('tolerates surrounding and inner whitespace', () => {
    expect(parseLocaleFloat(' 7,8 ')).toBe(7.8);
    expect(parseLocaleFloat('1 250,5')).toBe(1250.5);
  });

  it('returns NaN on garbage and empty input', () => {
    expect(parseLocaleFloat('')).toBeNaN();
    expect(parseLocaleFloat('   ')).toBeNaN();
    expect(parseLocaleFloat('abc')).toBeNaN();
  });

  it('handles negatives and integers', () => {
    expect(parseLocaleFloat('-0,3')).toBe(-0.3);
    expect(parseLocaleFloat('420')).toBe(420);
  });
});
