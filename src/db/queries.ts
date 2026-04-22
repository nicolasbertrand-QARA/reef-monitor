import { Reading, Thresholds, DosingEntry, WaterChange, Tank, ParameterKey } from '@/src/models/types';
import { getDatabase, seedDefaultsForAllTanks } from './database';

// --- Tanks ---

export async function getTanks(): Promise<Tank[]> {
  const db = await getDatabase();
  return db.getAllAsync<Tank>('SELECT * FROM tanks ORDER BY created_at ASC');
}

export async function createTank(name: string): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT INTO tanks (name, created_at) VALUES (?, ?)',
    name, new Date().toISOString()
  );
  // Seed defaults for the new tank
  await seedDefaultsForAllTanks(db);
  return result.lastInsertRowId;
}

export async function renameTank(id: number, name: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE tanks SET name = ? WHERE id = ?', name, id);
}

export async function deleteTank(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM tanks WHERE id = ?', id);
  await db.runAsync('DELETE FROM readings WHERE tank_id = ?', id);
  await db.runAsync('DELETE FROM dosing_log WHERE tank_id = ?', id);
  await db.runAsync('DELETE FROM water_changes WHERE tank_id = ?', id);
  await db.runAsync('DELETE FROM thresholds WHERE tank_id = ?', id);
  await db.runAsync('DELETE FROM parameter_visibility WHERE tank_id = ?', id);
}

export async function getActiveTankId(): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ value: string }>(
    "SELECT value FROM app_settings WHERE key = 'active_tank_id'"
  );
  return row ? parseInt(row.value) : 1;
}

export async function setActiveTankId(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    "INSERT OR REPLACE INTO app_settings (key, value) VALUES ('active_tank_id', ?)",
    String(id)
  );
}

// --- Parameter Visibility (tank-scoped) ---

export async function getVisibleParams(tankId: number): Promise<Set<ParameterKey>> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ parameter: string }>(
    'SELECT parameter FROM parameter_visibility WHERE tank_id = ? AND visible = 1',
    tankId
  );
  return new Set(rows.map((r) => r.parameter as ParameterKey));
}

export async function getAllParamVisibility(tankId: number): Promise<Record<string, boolean>> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ parameter: string; visible: number }>(
    'SELECT parameter, visible FROM parameter_visibility WHERE tank_id = ?',
    tankId
  );
  const result: Record<string, boolean> = {};
  rows.forEach((r) => { result[r.parameter] = r.visible === 1; });
  return result;
}

export async function setParamVisibility(parameter: ParameterKey, tankId: number, visible: boolean): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT OR REPLACE INTO parameter_visibility (parameter, tank_id, visible) VALUES (?, ?, ?)',
    parameter, tankId, visible ? 1 : 0
  );
}

// --- Readings (tank-scoped) ---

export async function insertReading(
  parameter: ParameterKey, value: number, unit: string, tankId: number, notes?: string
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO readings (parameter, value, unit, recorded_at, tank_id, notes) VALUES (?, ?, ?, ?, ?, ?)',
    parameter, value, unit, new Date().toISOString(), tankId, notes ?? null
  );
}

export async function getLatestReadings(tankId: number): Promise<Reading[]> {
  const db = await getDatabase();
  return db.getAllAsync<Reading>(
    `SELECT r.* FROM readings r
     INNER JOIN (
       SELECT parameter, MAX(id) as max_id FROM readings WHERE tank_id = ? GROUP BY parameter
     ) latest ON r.id = latest.max_id
     ORDER BY r.parameter`,
    tankId
  );
}

export async function getReadingHistory(
  parameter: ParameterKey, tankId: number, days?: number
): Promise<Reading[]> {
  const db = await getDatabase();
  if (days) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    return db.getAllAsync<Reading>(
      'SELECT * FROM readings WHERE parameter = ? AND tank_id = ? AND recorded_at >= ? ORDER BY recorded_at ASC',
      parameter, tankId, since.toISOString()
    );
  }
  return db.getAllAsync<Reading>(
    'SELECT * FROM readings WHERE parameter = ? AND tank_id = ? ORDER BY recorded_at ASC',
    parameter, tankId
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

// --- Thresholds (tank-scoped) ---

export async function getThresholds(tankId: number): Promise<Thresholds[]> {
  const db = await getDatabase();
  return db.getAllAsync<Thresholds>('SELECT * FROM thresholds WHERE tank_id = ?', tankId);
}

export async function getThresholdForParam(parameter: ParameterKey, tankId: number): Promise<Thresholds | null> {
  const db = await getDatabase();
  return db.getFirstAsync<Thresholds>(
    'SELECT * FROM thresholds WHERE parameter = ? AND tank_id = ?',
    parameter, tankId
  );
}

export async function updateThreshold(threshold: Thresholds & { tank_id: number }): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE thresholds SET warning_low = ?, warning_high = ?, critical_low = ?, critical_high = ?
     WHERE parameter = ? AND tank_id = ?`,
    threshold.warning_low, threshold.warning_high,
    threshold.critical_low, threshold.critical_high,
    threshold.parameter, threshold.tank_id
  );
}

// --- Dosing (tank-scoped) ---

export async function insertDose(
  product: string, amount: number, unit: string, tankId: number, notes?: string
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO dosing_log (product, amount, unit, dosed_at, tank_id, notes) VALUES (?, ?, ?, ?, ?, ?)',
    product, amount, unit, new Date().toISOString(), tankId, notes ?? null
  );
}

export async function getDosingHistory(tankId: number, days?: number): Promise<DosingEntry[]> {
  const db = await getDatabase();
  if (days) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    return db.getAllAsync<DosingEntry>(
      'SELECT * FROM dosing_log WHERE tank_id = ? AND dosed_at >= ? ORDER BY dosed_at DESC',
      tankId, since.toISOString()
    );
  }
  return db.getAllAsync<DosingEntry>(
    'SELECT * FROM dosing_log WHERE tank_id = ? ORDER BY dosed_at DESC', tankId
  );
}

// --- Water Changes (tank-scoped) ---

export async function insertWaterChange(
  percentage: number, tankId: number, saltBrand?: string, dilutionGpl?: number
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO water_changes (percentage, salt_brand, dilution_gpl, changed_at, tank_id) VALUES (?, ?, ?, ?, ?)',
    percentage, saltBrand ?? null, dilutionGpl ?? null, new Date().toISOString(), tankId
  );
}

export async function getWaterChanges(tankId: number, days?: number): Promise<WaterChange[]> {
  const db = await getDatabase();
  if (days) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    return db.getAllAsync<WaterChange>(
      'SELECT * FROM water_changes WHERE tank_id = ? AND changed_at >= ? ORDER BY changed_at DESC',
      tankId, since.toISOString()
    );
  }
  return db.getAllAsync<WaterChange>(
    'SELECT * FROM water_changes WHERE tank_id = ? ORDER BY changed_at DESC', tankId
  );
}

export async function getLastWaterChange(tankId: number): Promise<WaterChange | null> {
  const db = await getDatabase();
  return db.getFirstAsync<WaterChange>(
    'SELECT * FROM water_changes WHERE tank_id = ? ORDER BY id DESC LIMIT 1', tankId
  );
}

// --- CSV Export/Import (tank-scoped) ---

export async function getAllReadingsForExport(tankId: number): Promise<Reading[]> {
  const db = await getDatabase();
  return db.getAllAsync<Reading>(
    'SELECT * FROM readings WHERE tank_id = ? ORDER BY recorded_at ASC', tankId
  );
}

export async function importReadingsFromCSV(csvContent: string, tankId: number): Promise<number> {
  const db = await getDatabase();
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) return 0;
  const header = lines[0].toLowerCase();
  if (!header.includes('parameter') || !header.includes('value')) {
    throw new Error('Invalid CSV format');
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
      'INSERT INTO readings (parameter, value, unit, recorded_at, tank_id, notes) VALUES (?, ?, ?, ?, ?, ?)',
      parameter.trim(), value, unit.trim(), recorded_at.trim(), tankId, notes
    );
    imported++;
  }
  return imported;
}
