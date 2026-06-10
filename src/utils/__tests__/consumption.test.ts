import { calculateConsumptionRate } from '../consumption';
import { Reading } from '@/src/models/types';

const reading = (daysAgo: number, value: number): Reading => ({
  id: 0,
  parameter: 'alkalinity',
  value,
  unit: 'dKH',
  recorded_at: new Date(Date.UTC(2026, 5, 10) - daysAgo * 24 * 3600 * 1000).toISOString(),
  notes: null,
});

describe('calculateConsumptionRate', () => {
  it('returns null with fewer than 2 readings', () => {
    expect(calculateConsumptionRate([])).toBeNull();
    expect(calculateConsumptionRate([reading(0, 8)])).toBeNull();
  });

  it('measures steady consumption (negative slope)', () => {
    // 8.4 → 8.0 over 4 days = -0.1 dKH/day
    const rate = calculateConsumptionRate([reading(4, 8.4), reading(2, 8.2), reading(0, 8.0)]);
    expect(rate).toBeCloseTo(-0.1, 2);
  });

  it('measures rising alkalinity (positive slope)', () => {
    const rate = calculateConsumptionRate([reading(3, 7.8), reading(0, 8.4)]);
    expect(rate).toBeCloseTo(0.2, 2);
  });

  it('returns null when all readings share one timestamp', () => {
    expect(calculateConsumptionRate([reading(0, 8.0), reading(0, 8.2)])).toBeNull();
  });
});
