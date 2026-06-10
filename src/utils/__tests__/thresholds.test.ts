import { evaluateStatus } from '../thresholds';
import { Thresholds } from '@/src/models/types';

const alk: Thresholds = {
  parameter: 'alkalinity',
  warning_low: 6.5, warning_high: 11,
  critical_low: 5.5, critical_high: 12.5,
};

describe('evaluateStatus', () => {
  it('classifies the healthy band', () => {
    expect(evaluateStatus(8.2, alk)).toBe('ok');
  });
  it('classifies warnings on both sides', () => {
    expect(evaluateStatus(6.0, alk)).toBe('warning');
    expect(evaluateStatus(11.5, alk)).toBe('warning');
  });
  it('classifies critical, inclusive at the bound', () => {
    expect(evaluateStatus(5.5, alk)).toBe('critical');
    expect(evaluateStatus(12.5, alk)).toBe('critical');
    expect(evaluateStatus(4.0, alk)).toBe('critical');
  });
  it('treats exact warning bounds as ok (documented boundary behavior)', () => {
    expect(evaluateStatus(6.5, alk)).toBe('ok');
    expect(evaluateStatus(11, alk)).toBe('ok');
  });
  it('handles one-sided thresholds (ammonia-style)', () => {
    const ammonia: Thresholds = {
      parameter: 'ammonia',
      warning_low: null, warning_high: 0.1,
      critical_low: null, critical_high: 0.25,
    };
    expect(evaluateStatus(0, ammonia)).toBe('ok');
    expect(evaluateStatus(0.15, ammonia)).toBe('warning');
    expect(evaluateStatus(0.3, ammonia)).toBe('critical');
  });
});
