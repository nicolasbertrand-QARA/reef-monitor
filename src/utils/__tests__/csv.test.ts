import { escapeCsvField, parseCsv, buildBackupCsv, parseBackupCsv } from '../csv';

describe('escapeCsvField', () => {
  it('passes plain values through', () => {
    expect(escapeCsvField('alkalinity')).toBe('alkalinity');
    expect(escapeCsvField(8.2)).toBe('8.2');
  });
  it('returns empty string for null/undefined', () => {
    expect(escapeCsvField(null)).toBe('');
    expect(escapeCsvField(undefined)).toBe('');
  });
  it('quotes fields containing commas, quotes, newlines', () => {
    expect(escapeCsvField('Red Sea, Coral Pro')).toBe('"Red Sea, Coral Pro"');
    expect(escapeCsvField('the "new" kit')).toBe('"the ""new"" kit"');
    expect(escapeCsvField('line1\nline2')).toBe('"line1\nline2"');
  });
});

describe('parseCsv', () => {
  it('parses simple rows', () => {
    expect(parseCsv('a,b\nc,d')).toEqual([['a', 'b'], ['c', 'd']]);
  });
  it('handles quoted fields with commas, escaped quotes and newlines', () => {
    const rows = parseCsv('a,"x, y",b\n"he said ""hi""","l1\nl2",z');
    expect(rows).toEqual([
      ['a', 'x, y', 'b'],
      ['he said "hi"', 'l1\nl2', 'z'],
    ]);
  });
  it('handles CRLF and trailing newline', () => {
    expect(parseCsv('a,b\r\nc,d\n')).toEqual([['a', 'b'], ['c', 'd']]);
  });
});

const sampleData = {
  readings: [
    { parameter: 'alkalinity', value: 8.2, unit: 'dKH', recorded_at: '2026-06-01T10:00:00.000Z', notes: 'Salifert, lot #42' },
    { parameter: 'calcium', value: 420, unit: 'ppm', recorded_at: '2026-06-02T10:00:00.000Z', notes: null },
  ],
  doses: [
    { product: 'All-for-Reef', amount: 5, unit: 'ml', dosed_at: '2026-06-01T08:00:00.000Z', notes: 'morning\n"double" check' },
  ],
  waterChanges: [
    { percentage: 10, salt_brand: 'Red Sea, Coral Pro', dilution_gpl: 35, changed_at: '2026-05-30T09:00:00.000Z' },
  ],
  thresholds: [
    { parameter: 'alkalinity', warning_low: 6.5, warning_high: 11, critical_low: 5.5, critical_high: 12.5 },
    { parameter: 'ammonia', warning_low: null, warning_high: 0.1, critical_low: null, critical_high: 0.25 },
  ],
};

describe('backup v2 round-trip', () => {
  it('survives build → parse with hostile field content', () => {
    const csv = buildBackupCsv(sampleData, { tankName: 'My Reef, 30L', exportedAt: '2026-06-10T12:00:00.000Z' });
    const parsed = parseBackupCsv(csv);
    expect(parsed.readings).toEqual(sampleData.readings);
    expect(parsed.doses).toEqual(sampleData.doses);
    expect(parsed.waterChanges).toEqual(sampleData.waterChanges);
    expect(parsed.thresholds).toEqual(sampleData.thresholds);
    expect(parsed.invalidRows).toBe(0);
  });
});

describe('parseBackupCsv v1 compatibility', () => {
  it('parses a legacy readings-only export', () => {
    const v1 = [
      'parameter,value,unit,recorded_at,notes',
      'alkalinity,8.2,dKH,2026-06-01T10:00:00.000Z,',
      'salinity,1.025,,2026-06-01T10:05:00.000Z,refracto check',
    ].join('\n');
    const parsed = parseBackupCsv(v1);
    expect(parsed.readings).toHaveLength(2);
    expect(parsed.readings[0]).toEqual({
      parameter: 'alkalinity', value: 8.2, unit: 'dKH',
      recorded_at: '2026-06-01T10:00:00.000Z', notes: null,
    });
    expect(parsed.readings[1].notes).toBe('refracto check');
    expect(parsed.doses).toHaveLength(0);
  });

  it('counts invalid rows instead of importing them', () => {
    const v1 = [
      'parameter,value,unit,recorded_at,notes',
      'alkalinity,not-a-number,dKH,2026-06-01T10:00:00.000Z,',
      'alkalinity,8.0,dKH,not-a-date,',
      'alkalinity,8.0,dKH,2026-06-01T10:00:00.000Z,ok',
    ].join('\n');
    const parsed = parseBackupCsv(v1);
    expect(parsed.readings).toHaveLength(1);
    expect(parsed.invalidRows).toBe(2);
  });

  it('throws on content with no recognizable header', () => {
    expect(() => parseBackupCsv('just,some,random\ncells,here,too')).toThrow('Invalid CSV format');
  });
});
