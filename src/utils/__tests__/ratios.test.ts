import { evaluateNO3PO4Ratio, evaluateIonicBalance, detectAlkSwing } from '../ratios';
import { Reading } from '@/src/models/types';

jest.mock('@/src/i18n', () => ({
  __esModule: true,
  default: { t: (key: string) => key },
  getDateLocale: () => ({}),
}));

describe('evaluateNO3PO4Ratio', () => {
  it('reports ok in the healthy band', () => {
    const r = evaluateNO3PO4Ratio(5, 0.05); // 100:1
    expect(r.status).toBe('ok');
    expect(r.ratio).toBe(100);
  });
  it('warns on low ratio (excess phosphate)', () => {
    const r = evaluateNO3PO4Ratio(1, 0.1); // 10:1
    expect(r.status).toBe('warning');
    expect(r.ratio).toBe(10);
  });
  it('warns on high ratio (excess nitrate)', () => {
    const r = evaluateNO3PO4Ratio(25, 0.1); // 250:1
    expect(r.status).toBe('warning');
  });
  it('flags undetectable PO4 with elevated NO3', () => {
    const r = evaluateNO3PO4Ratio(10, 0);
    expect(r.status).toBe('warning');
    expect(r.message).toBe('ratios.po4Undetectable');
  });
  it('flags undetectable NO3 with measurable PO4 (regression: was unreachable)', () => {
    const r = evaluateNO3PO4Ratio(0, 0.05);
    expect(r.status).toBe('warning');
    expect(r.message).toBe('ratios.no3Undetectable');
  });
  it('reports insufficient data when both are bottomed out', () => {
    const r = evaluateNO3PO4Ratio(0, 0.01);
    expect(r.status).toBe('unknown');
  });
});

describe('evaluateIonicBalance', () => {
  it('accepts natural seawater proportions', () => {
    expect(evaluateIonicBalance(420, 8, 1350).status).toBe('ok');
  });
  it('warns when Mg is low relative to Ca', () => {
    expect(evaluateIonicBalance(480, 8, 1100).status).toBe('warning'); // ratio 2.29
  });
  it('warns on Mg-driven instability', () => {
    expect(evaluateIonicBalance(390, 6.8, 1150).status).toBe('warning');
  });
});

const reading = (hoursAgo: number, value: number): Reading => ({
  id: 0,
  parameter: 'alkalinity',
  value,
  unit: 'dKH',
  recorded_at: new Date(Date.now() - hoursAgo * 3600 * 1000).toISOString(),
  notes: null,
});

describe('detectAlkSwing', () => {
  it('returns unknown with fewer than 2 readings', () => {
    expect(detectAlkSwing([reading(1, 8)]).status).toBe('unknown');
  });
  it('ignores readings older than 24h', () => {
    expect(detectAlkSwing([reading(30, 9.5), reading(1, 8.0)]).status).toBe('ok');
  });
  it('warns above 1.0 dKH within 24h', () => {
    const r = detectAlkSwing([reading(20, 9.2), reading(1, 8.0)]);
    expect(r.status).toBe('warning');
    expect(r.swing).toBeCloseTo(1.2);
  });
  it('is critical above 1.5 dKH within 24h', () => {
    expect(detectAlkSwing([reading(20, 9.8), reading(1, 8.0)]).status).toBe('critical');
  });
});
