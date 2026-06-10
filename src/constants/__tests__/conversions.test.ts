import { getParameterList } from '../parameters';
import { ParameterKey } from '@/src/models/types';

jest.mock('@/src/i18n', () => ({
  __esModule: true,
  default: { t: (key: string) => key },
  getDateLocale: () => ({}),
}));

const unitsOf = (key: ParameterKey) => {
  const def = getParameterList().find((p) => p.key === key)!;
  return def.units!;
};

describe('temperature °C ↔ °F', () => {
  const f = unitsOf('temperature')[1];
  it('converts both ways', () => {
    expect(f.fromCanonical(25)).toBeCloseTo(77, 1);
    expect(f.toCanonical(77)).toBeCloseTo(25, 1);
    expect(f.fromCanonical(f.toCanonical(78.1))).toBeCloseTo(78.1, 1);
  });
});

describe('salinity SG ↔ ppt', () => {
  const ppt = unitsOf('salinity')[1];
  it('hits the reef anchor point 1.026 ≈ 35 ppt', () => {
    expect(ppt.fromCanonical(1.026)).toBeCloseTo(35, 0);
    expect(ppt.toCanonical(35)).toBeCloseTo(1.026, 3);
  });
});

describe('alkalinity dKH ↔ meq/L ↔ ppm CaCO₃', () => {
  const [, meq, caco3] = unitsOf('alkalinity');
  it('uses the 2.8 factor for meq/L', () => {
    expect(meq.fromCanonical(8.4)).toBeCloseTo(3.0, 1);
    expect(meq.toCanonical(3)).toBeCloseTo(8.4, 1);
  });
  it('uses the 17.86 factor for ppm CaCO₃', () => {
    expect(caco3.fromCanonical(8)).toBeCloseTo(143, 0);
    expect(caco3.toCanonical(143)).toBeCloseTo(8, 1);
  });
});

describe('nitrate NO₃ ↔ NO₃-N', () => {
  const no3n = unitsOf('nitrate')[1];
  it('uses the 4.43 molecular weight ratio', () => {
    expect(no3n.fromCanonical(4.43)).toBeCloseTo(1, 2);
    expect(no3n.toCanonical(1)).toBeCloseTo(4.43, 2);
  });
});

describe('phosphate ppm ↔ ppb', () => {
  const ppb = unitsOf('phosphate')[1];
  it('converts by 1000 and round-trips', () => {
    expect(ppb.fromCanonical(0.05)).toBe(50);
    expect(ppb.toCanonical(50)).toBeCloseTo(0.05, 3);
  });
});
