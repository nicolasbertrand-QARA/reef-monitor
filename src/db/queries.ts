import { Reading, Thresholds, DosingEntry, WaterChange, ParameterKey } from '@/src/models/types';

// --- Parameter Visibility ---

export async function getVisibleParams(): Promise<Set<ParameterKey>> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ parameter: string; visible: number }>(
    'SELECT parameter, visible FROM parameter_visibility WHERE visible = 1'
  );
  return new Set(rows.map((r) => r.parameter as ParameterKey));
}

export async function getAllParamVisibility(): Promise<Record<string, boolean>> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ parameter: string; visible: number }>(
    'SELECT parameter, visible FROM parameter_visibility'
  );
  const result: Record<string, boolean> = {};
  rows.forEach((r) => { result[r.parameter] = r.visible === 1; });
  return result;
}

export async function setParamVisibility(parameter: ParameterKey, visible: boolean): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT OR REPLACE INTO parameter_visibility (parameter, visible) VALUES (?, ?)',
    parameter, visible ? 1 : 0
  );
}
import { getDatabase } from './database';

// --- Readings ---

export async function insertReading(
  parameter: ParameterKey,
  value: number,
  unit: string,
  notes?: string
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO readings (parameter, value, unit, recorded_at, notes) VALUES (?, ?, ?, ?, ?)',
    parameter, value, unit, new Date().toISOString(), notes ?? null
  );
}

export async function getLatestReadings(): Promise<Reading[]> {
  const db = await getDatabase();
  return db.getAllAsync<Reading>(
    `SELECT r.* FROM readings r
     INNER JOIN (
       SELECT parameter, MAX(id) as max_id FROM readings GROUP BY parameter
     ) latest ON r.id = latest.max_id
     ORDER BY r.parameter`
  );
}

export async function getReadingHistory(
  parameter: ParameterKey,
  days?: number
): Promise<Reading[]> {
  const db = await getDatabase();
  if (days) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    return db.getAllAsync<Reading>(
      'SELECT * FROM readings WHERE parameter = ? AND recorded_at >= ? ORDER BY recorded_at ASC',
      parameter, since.toISOString()
    );
  }
  return db.getAllAsync<Reading>(
    'SELECT * FROM readings WHERE parameter = ? ORDER BY recorded_at ASC',
    parameter
  );
}

export async function deleteReading(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM readings WHERE id = ?', id);
}

export async function updateReading(id: number, value: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE readings SET value = ? WHERE id = ?', value, id);
}

// --- Thresholds ---

export async function getThresholds(): Promise<Thresholds[]> {
  const db = await getDatabase();
  return db.getAllAsync<Thresholds>('SELECT * FROM thresholds');
}

export async function getThresholdForParam(parameter: ParameterKey): Promise<Thresholds | null> {
  const db = await getDatabase();
  return db.getFirstAsync<Thresholds>(
    'SELECT * FROM thresholds WHERE parameter = ?',
    parameter
  );
}

export async function updateThreshold(threshold: Thresholds): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE thresholds SET warning_low = ?, warning_high = ?, critical_low = ?, critical_high = ?
     WHERE parameter = ?`,
    threshold.warning_low, threshold.warning_high,
    threshold.critical_low, threshold.critical_high,
    threshold.parameter
  );
}

// --- Dosing ---

export async function insertDose(
  product: string,
  amount: number,
  unit: string,
  notes?: string
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO dosing_log (product, amount, unit, dosed_at, notes) VALUES (?, ?, ?, ?, ?)',
    product, amount, unit, new Date().toISOString(), notes ?? null
  );
}

export async function getDosingHistory(days?: number): Promise<DosingEntry[]> {
  const db = await getDatabase();
  if (days) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    return db.getAllAsync<DosingEntry>(
      'SELECT * FROM dosing_log WHERE dosed_at >= ? ORDER BY dosed_at DESC',
      since.toISOString()
    );
  }
  return db.getAllAsync<DosingEntry>(
    'SELECT * FROM dosing_log ORDER BY dosed_at DESC'
  );
}

// --- CSV Export ---

export async function getAllReadingsForExport(): Promise<Reading[]> {
  const db = await getDatabase();
  return db.getAllAsync<Reading>(
    'SELECT * FROM readings ORDER BY recorded_at ASC'
  );
}

// --- CSV Import ---

export async function importReadingsFromCSV(csvContent: string): Promise<number> {
  const db = await getDatabase();
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) return 0;

  // Skip header row
  const header = lines[0].toLowerCase();
  if (!header.includes('parameter') || !header.includes('value')) {
    throw new Error('Invalid CSV format: missing parameter or value columns');
  }

  let imported = 0;
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    if (cols.length < 4) continue;

    const [parameter, valueStr, unit, recorded_at, ...rest] = cols;
    const value = parseFloat(valueStr);
    if (isNaN(value) || !parameter || !recorded_at) continue;

    const notes = rest.join(',').trim() || null;

    await db.runAsync(
      'INSERT INTO readings (parameter, value, unit, recorded_at, notes) VALUES (?, ?, ?, ?, ?)',
      parameter.trim(), value, unit.trim(), recorded_at.trim(), notes
    );
    imported++;
  }
  return imported;
}

// --- Water Changes ---

export async function insertWaterChange(
  percentage: number,
  saltBrand?: string,
  dilutionGpl?: number
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO water_changes (percentage, salt_brand, dilution_gpl, changed_at) VALUES (?, ?, ?, ?)',
    percentage, saltBrand ?? null, dilutionGpl ?? null, new Date().toISOString()
  );
}

export async function getWaterChanges(days?: number): Promise<WaterChange[]> {
  const db = await getDatabase();
  if (days) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    return db.getAllAsync<WaterChange>(
      'SELECT * FROM water_changes WHERE changed_at >= ? ORDER BY changed_at DESC',
      since.toISOString()
    );
  }
  return db.getAllAsync<WaterChange>(
    'SELECT * FROM water_changes ORDER BY changed_at DESC'
  );
}

export async function getLastWaterChange(): Promise<WaterChange | null> {
  const db = await getDatabase();
  return db.getFirstAsync<WaterChange>(
    'SELECT * FROM water_changes ORDER BY id DESC LIMIT 1'
  );
}
