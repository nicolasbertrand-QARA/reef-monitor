import { Reading, Thresholds, DosingEntry, WaterChange, Tank, ParameterKey, PARAMETER_KEYS } from '@/src/models/types';
import { BackupData } from '@/src/utils/csv';
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

// --- Generic app settings ---

export async function getAppSetting(key: string): Promise<string | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM app_settings WHERE key = ?', key
  );
  return row?.value ?? null;
}

export async function setAppSetting(key: string, value: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)', key, value);
}

/** Distinct calendar days with at least one reading, across all tanks. */
export async function getDistinctLoggingDays(): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ n: number }>(
    "SELECT COUNT(DISTINCT date(recorded_at)) AS n FROM readings"
  );
  return row?.n ?? 0;
}

// --- Unit Preferences (global, stored in app_settings as unit_<paramKey>) ---

export async function getUnitPreferences(): Promise<Record<string, string>> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ key: string; value: string }>(
    "SELECT key, value FROM app_settings WHERE key LIKE 'unit_%'"
  );
  const result: Record<string, string> = {};
  rows.forEach((r) => { result[r.key.replace('unit_', '')] = r.value; });
  return result;
}

export async function setUnitPreference(parameter: ParameterKey, unit: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    "INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)",
    `unit_${parameter}`, unit
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
  // Latest = most recent recorded_at (id breaks ties), NOT max id: imported
  // backups can insert older readings with higher ids.
  return db.getAllAsync<Reading>(
    `SELECT r.* FROM readings r
     WHERE r.tank_id = ? AND r.id = (
       SELECT r2.id FROM readings r2
       WHERE r2.tank_id = r.tank_id AND r2.parameter = r.parameter
       ORDER BY r2.recorded_at DESC, r2.id DESC LIMIT 1
     )
     ORDER BY r.parameter`,
    tankId
  );
}

export async function getLastReading(parameter: ParameterKey, tankId: number): Promise<Reading | null> {
  const db = await getDatabase();
  return db.getFirstAsync<Reading>(
    'SELECT * FROM readings WHERE parameter = ? AND tank_id = ? ORDER BY recorded_at DESC, id DESC LIMIT 1',
    parameter, tankId
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

export async function deleteDose(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM dosing_log WHERE id = ?', id);
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

export async function deleteWaterChange(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM water_changes WHERE id = ?', id);
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

export interface ImportResult { imported: number; skipped: number; }

/**
 * Import a parsed backup into a tank, inside a transaction.
 * Dedupes against existing rows so re-importing the same file is a no-op.
 * Unknown parameter names are skipped. Thresholds are applied (replace) but
 * not counted in `imported`.
 */
export async function importBackup(data: BackupData, tankId: number): Promise<ImportResult> {
  const db = await getDatabase();
  const knownParams = new Set<string>(PARAMETER_KEYS);
  let imported = 0;
  let skipped = 0;

  await db.withTransactionAsync(async () => {
    const existingReadings = await db.getAllAsync<{ parameter: string; recorded_at: string; value: number }>(
      'SELECT parameter, recorded_at, value FROM readings WHERE tank_id = ?', tankId
    );
    const readingKeys = new Set(existingReadings.map((r) => `${r.parameter}|${r.recorded_at}|${r.value}`));
    for (const r of data.readings) {
      if (!knownParams.has(r.parameter)) { skipped++; continue; }
      const key = `${r.parameter}|${r.recorded_at}|${r.value}`;
      if (readingKeys.has(key)) { skipped++; continue; }
      readingKeys.add(key);
      await db.runAsync(
        'INSERT INTO readings (parameter, value, unit, recorded_at, tank_id, notes) VALUES (?, ?, ?, ?, ?, ?)',
        r.parameter, r.value, r.unit, r.recorded_at, tankId, r.notes
      );
      imported++;
    }

    const existingDoses = await db.getAllAsync<{ product: string; dosed_at: string; amount: number }>(
      'SELECT product, dosed_at, amount FROM dosing_log WHERE tank_id = ?', tankId
    );
    const doseKeys = new Set(existingDoses.map((d) => `${d.product}|${d.dosed_at}|${d.amount}`));
    for (const d of data.doses) {
      const key = `${d.product}|${d.dosed_at}|${d.amount}`;
      if (doseKeys.has(key)) { skipped++; continue; }
      doseKeys.add(key);
      await db.runAsync(
        'INSERT INTO dosing_log (product, amount, unit, dosed_at, tank_id, notes) VALUES (?, ?, ?, ?, ?, ?)',
        d.product, d.amount, d.unit, d.dosed_at, tankId, d.notes
      );
      imported++;
    }

    const existingWCs = await db.getAllAsync<{ changed_at: string; percentage: number }>(
      'SELECT changed_at, percentage FROM water_changes WHERE tank_id = ?', tankId
    );
    const wcKeys = new Set(existingWCs.map((w) => `${w.changed_at}|${w.percentage}`));
    for (const w of data.waterChanges) {
      const key = `${w.changed_at}|${w.percentage}`;
      if (wcKeys.has(key)) { skipped++; continue; }
      wcKeys.add(key);
      await db.runAsync(
        'INSERT INTO water_changes (percentage, salt_brand, dilution_gpl, changed_at, tank_id) VALUES (?, ?, ?, ?, ?)',
        w.percentage, w.salt_brand, w.dilution_gpl, w.changed_at, tankId
      );
      imported++;
    }

    for (const t of data.thresholds) {
      if (!knownParams.has(t.parameter)) { skipped++; continue; }
      await db.runAsync(
        `INSERT OR REPLACE INTO thresholds (parameter, tank_id, warning_low, warning_high, critical_low, critical_high)
         VALUES (?, ?, ?, ?, ?, ?)`,
        t.parameter, tankId, t.warning_low, t.warning_high, t.critical_low, t.critical_high
      );
    }
  });

  return { imported, skipped };
}
