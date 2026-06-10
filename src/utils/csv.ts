/**
 * CSV backup format (v2) — full tank backup with RFC 4180 quoting.
 *
 * Layout:
 *   # Reef Monitor backup v2
 *   # tank: <name>  /  # exported_at: <ISO>
 *   [readings]      parameter,value,unit,recorded_at,notes
 *   [dosing]        product,amount,unit,dosed_at,notes
 *   [water_changes] percentage,salt_brand,dilution_gpl,changed_at
 *   [thresholds]    parameter,warning_low,warning_high,critical_low,critical_high
 *
 * parseBackupCsv also accepts the legacy v1 export (plain readings CSV with a
 * `parameter,value,unit,recorded_at,notes` header and no section markers).
 * Numbers always use a dot decimal separator in files, regardless of locale.
 */

export interface BackupReading {
  parameter: string;
  value: number;
  unit: string;
  recorded_at: string;
  notes: string | null;
}

export interface BackupDose {
  product: string;
  amount: number;
  unit: string;
  dosed_at: string;
  notes: string | null;
}

export interface BackupWaterChange {
  percentage: number;
  salt_brand: string | null;
  dilution_gpl: number | null;
  changed_at: string;
}

export interface BackupThreshold {
  parameter: string;
  warning_low: number | null;
  warning_high: number | null;
  critical_low: number | null;
  critical_high: number | null;
}

export interface BackupData {
  readings: BackupReading[];
  doses: BackupDose[];
  waterChanges: BackupWaterChange[];
  thresholds: BackupThreshold[];
  invalidRows: number;
}

export function escapeCsvField(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const s = String(value);
  if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

/** RFC 4180 parser: handles quoted fields containing commas, quotes, newlines. */
export function parseCsv(content: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  let i = 0;

  const endField = () => { row.push(field); field = ''; };
  const endRow = () => { endField(); rows.push(row); row = []; };

  while (i < content.length) {
    const c = content[i];
    if (inQuotes) {
      if (c === '"') {
        if (content[i + 1] === '"') { field += '"'; i += 2; continue; }
        inQuotes = false; i++; continue;
      }
      field += c; i++; continue;
    }
    if (c === '"') { inQuotes = true; i++; continue; }
    if (c === ',') { endField(); i++; continue; }
    if (c === '\r') { if (content[i + 1] === '\n') i++; endRow(); i++; continue; }
    if (c === '\n') { endRow(); i++; continue; }
    field += c; i++;
  }
  if (field !== '' || row.length > 0) endRow();

  // Drop fully empty rows (blank lines between sections)
  return rows.filter((r) => !(r.length === 1 && r[0].trim() === ''));
}

const SECTION_HEADERS: Record<string, string[]> = {
  readings: ['parameter', 'value', 'unit', 'recorded_at', 'notes'],
  dosing: ['product', 'amount', 'unit', 'dosed_at', 'notes'],
  water_changes: ['percentage', 'salt_brand', 'dilution_gpl', 'changed_at'],
  thresholds: ['parameter', 'warning_low', 'warning_high', 'critical_low', 'critical_high'],
};

export function buildBackupCsv(
  data: Omit<BackupData, 'invalidRows'>,
  meta: { tankName: string; exportedAt: string }
): string {
  const lines: string[] = [];
  lines.push('# Reef Monitor backup v2');
  lines.push(`# tank: ${meta.tankName.replace(/[\r\n]/g, ' ')}`);
  lines.push(`# exported_at: ${meta.exportedAt}`);

  lines.push('[readings]');
  lines.push(SECTION_HEADERS.readings.join(','));
  for (const r of data.readings) {
    lines.push([r.parameter, r.value, r.unit, r.recorded_at, r.notes].map(escapeCsvField).join(','));
  }

  lines.push('[dosing]');
  lines.push(SECTION_HEADERS.dosing.join(','));
  for (const d of data.doses) {
    lines.push([d.product, d.amount, d.unit, d.dosed_at, d.notes].map(escapeCsvField).join(','));
  }

  lines.push('[water_changes]');
  lines.push(SECTION_HEADERS.water_changes.join(','));
  for (const w of data.waterChanges) {
    lines.push([w.percentage, w.salt_brand, w.dilution_gpl, w.changed_at].map(escapeCsvField).join(','));
  }

  lines.push('[thresholds]');
  lines.push(SECTION_HEADERS.thresholds.join(','));
  for (const t of data.thresholds) {
    lines.push([t.parameter, t.warning_low, t.warning_high, t.critical_low, t.critical_high].map(escapeCsvField).join(','));
  }

  return lines.join('\n');
}

const toNum = (s: string | undefined): number | null => {
  if (s === undefined || s.trim() === '') return null;
  const v = parseFloat(s);
  return Number.isFinite(v) ? v : null;
};

const validDate = (s: string | undefined): boolean => s !== undefined && !isNaN(Date.parse(s));

export function parseBackupCsv(content: string): BackupData {
  const rows = parseCsv(content);
  const out: BackupData = { readings: [], doses: [], waterChanges: [], thresholds: [], invalidRows: 0 };

  let section: keyof typeof SECTION_HEADERS | null = null;
  let colIndex: Record<string, number> = {};
  let sawSectionMarker = false;
  let sawAnyHeader = false;

  const setHeader = (cells: string[]) => {
    colIndex = {};
    cells.forEach((c, idx) => { colIndex[c.trim().toLowerCase()] = idx; });
    sawAnyHeader = true;
  };

  for (const cells of rows) {
    const first = cells[0]?.trim() ?? '';
    if (first.startsWith('#')) continue;

    const marker = first.match(/^\[(\w+)\]$/);
    if (marker && cells.length === 1) {
      const name = marker[1].toLowerCase();
      if (name in SECTION_HEADERS) {
        section = name as keyof typeof SECTION_HEADERS;
        colIndex = {};
        sawSectionMarker = true;
        continue;
      }
    }

    // v1 compatibility: a bare readings header with no section marker
    if (!sawSectionMarker && section === null) {
      const lower = cells.map((c) => c.trim().toLowerCase());
      if (lower.includes('parameter') && lower.includes('value')) {
        section = 'readings';
        setHeader(cells);
        continue;
      }
      out.invalidRows++;
      continue;
    }

    if (section === null) { out.invalidRows++; continue; }

    // First row after a section marker is its header
    if (Object.keys(colIndex).length === 0) { setHeader(cells); continue; }

    const get = (col: string): string | undefined => {
      const idx = colIndex[col];
      return idx === undefined ? undefined : cells[idx];
    };

    if (section === 'readings') {
      const parameter = get('parameter')?.trim();
      const value = toNum(get('value'));
      const recorded_at = get('recorded_at')?.trim();
      if (!parameter || value === null || !validDate(recorded_at)) { out.invalidRows++; continue; }
      out.readings.push({
        parameter, value, recorded_at: recorded_at!,
        unit: get('unit')?.trim() ?? '',
        notes: get('notes')?.trim() || null,
      });
    } else if (section === 'dosing') {
      const product = get('product')?.trim();
      const amount = toNum(get('amount'));
      const dosed_at = get('dosed_at')?.trim();
      if (!product || amount === null || !validDate(dosed_at)) { out.invalidRows++; continue; }
      out.doses.push({
        product, amount, dosed_at: dosed_at!,
        unit: get('unit')?.trim() ?? '',
        notes: get('notes')?.trim() || null,
      });
    } else if (section === 'water_changes') {
      const percentage = toNum(get('percentage'));
      const changed_at = get('changed_at')?.trim();
      if (percentage === null || !validDate(changed_at)) { out.invalidRows++; continue; }
      out.waterChanges.push({
        percentage, changed_at: changed_at!,
        salt_brand: get('salt_brand')?.trim() || null,
        dilution_gpl: toNum(get('dilution_gpl')),
      });
    } else if (section === 'thresholds') {
      const parameter = get('parameter')?.trim();
      if (!parameter) { out.invalidRows++; continue; }
      out.thresholds.push({
        parameter,
        warning_low: toNum(get('warning_low')),
        warning_high: toNum(get('warning_high')),
        critical_low: toNum(get('critical_low')),
        critical_high: toNum(get('critical_high')),
      });
    }
  }

  if (!sawAnyHeader) throw new Error('Invalid CSV format');
  return out;
}
