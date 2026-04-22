import * as SQLite from 'expo-sqlite';
import { PARAMETER_LIST } from '@/src/constants/parameters';

const DB_NAME = 'reef-monitor.db';
const DB_VERSION = 5;

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync(DB_NAME);
  await initDatabase(db);
  return db;
}

async function initDatabase(database: SQLite.SQLiteDatabase) {
  const { user_version } = await database.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version'
  ) ?? { user_version: 0 };

  if (user_version < 1) {
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS readings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        parameter TEXT NOT NULL,
        value REAL NOT NULL,
        unit TEXT NOT NULL,
        recorded_at TEXT NOT NULL,
        notes TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_readings_param_date ON readings(parameter, recorded_at DESC);
      CREATE TABLE IF NOT EXISTS thresholds (
        parameter TEXT PRIMARY KEY,
        warning_low REAL, warning_high REAL,
        critical_low REAL, critical_high REAL
      );
      CREATE TABLE IF NOT EXISTS dosing_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product TEXT NOT NULL, amount REAL NOT NULL, unit TEXT NOT NULL,
        dosed_at TEXT NOT NULL, notes TEXT
      );
      CREATE TABLE IF NOT EXISTS reminder_schedules (
        parameter TEXT PRIMARY KEY,
        interval_hours INTEGER NOT NULL, enabled INTEGER NOT NULL DEFAULT 1,
        last_notified_at TEXT
      );
    `);
  }

  if (user_version < 2) {
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS water_changes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        percentage REAL NOT NULL, salt_brand TEXT, dilution_gpl REAL,
        changed_at TEXT NOT NULL
      );
    `);
  }

  if (user_version < 3) {
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS parameter_visibility (
        parameter TEXT PRIMARY KEY,
        visible INTEGER NOT NULL DEFAULT 1
      );
    `);
    const hiddenByDefault = ['ammonia', 'nitrite', 'potassium', 'strontium', 'iodine', 'boron', 'silicate'];
    for (const param of PARAMETER_LIST) {
      const visible = hiddenByDefault.includes(param.key) ? 0 : 1;
      await database.runAsync(
        'INSERT OR IGNORE INTO parameter_visibility (parameter, visible) VALUES (?, ?)',
        param.key, visible
      );
    }
  }

  if (user_version < 4) {
    await database.runAsync(
      `UPDATE thresholds SET warning_low = 1.023, warning_high = 1.027, critical_low = 1.020, critical_high = 1.030 WHERE parameter = 'salinity'`
    );
  }

  if (user_version < 5) {
    // Create tanks table
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS tanks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);

    // Create default tank and get its id
    await database.runAsync(
      `INSERT INTO tanks (name, created_at) VALUES (?, ?)`,
      'My Reef', new Date().toISOString()
    );
    const defaultTank = await database.getFirstAsync<{ id: number }>('SELECT id FROM tanks LIMIT 1');
    const tankId = defaultTank?.id ?? 1;

    // Add tank_id to all data tables
    await database.execAsync(`ALTER TABLE readings ADD COLUMN tank_id INTEGER NOT NULL DEFAULT ${tankId}`);
    await database.execAsync(`ALTER TABLE dosing_log ADD COLUMN tank_id INTEGER NOT NULL DEFAULT ${tankId}`);
    await database.execAsync(`ALTER TABLE water_changes ADD COLUMN tank_id INTEGER NOT NULL DEFAULT ${tankId}`);

    // Thresholds and visibility: change PK to include tank_id
    // Recreate thresholds with composite key
    await database.execAsync(`
      CREATE TABLE thresholds_new (
        parameter TEXT NOT NULL,
        tank_id INTEGER NOT NULL,
        warning_low REAL, warning_high REAL,
        critical_low REAL, critical_high REAL,
        PRIMARY KEY (parameter, tank_id)
      );
      INSERT INTO thresholds_new (parameter, tank_id, warning_low, warning_high, critical_low, critical_high)
        SELECT parameter, ${tankId}, warning_low, warning_high, critical_low, critical_high FROM thresholds;
      DROP TABLE thresholds;
      ALTER TABLE thresholds_new RENAME TO thresholds;
    `);

    // Recreate parameter_visibility with composite key
    await database.execAsync(`
      CREATE TABLE parameter_visibility_new (
        parameter TEXT NOT NULL,
        tank_id INTEGER NOT NULL,
        visible INTEGER NOT NULL DEFAULT 1,
        PRIMARY KEY (parameter, tank_id)
      );
      INSERT INTO parameter_visibility_new (parameter, tank_id, visible)
        SELECT parameter, ${tankId}, visible FROM parameter_visibility;
      DROP TABLE parameter_visibility;
      ALTER TABLE parameter_visibility_new RENAME TO parameter_visibility;
    `);

    // Update index
    await database.execAsync(`
      DROP INDEX IF EXISTS idx_readings_param_date;
      CREATE INDEX idx_readings_tank_param_date ON readings(tank_id, parameter, recorded_at DESC);
    `);

    // Store active tank
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);
    await database.runAsync(
      `INSERT OR REPLACE INTO app_settings (key, value) VALUES ('active_tank_id', ?)`,
      String(tankId)
    );
  }

  // Seed defaults for active tank
  await seedDefaultsForAllTanks(database);

  await database.execAsync(`PRAGMA user_version = ${DB_VERSION}`);
}

async function seedDefaultsForAllTanks(database: SQLite.SQLiteDatabase) {
  const tanks = await database.getAllAsync<{ id: number }>('SELECT id FROM tanks');
  for (const tank of tanks) {
    for (const param of PARAMETER_LIST) {
      const { warningLow, warningHigh, criticalLow, criticalHigh } = param.defaultThresholds;
      await database.runAsync(
        `INSERT OR IGNORE INTO thresholds (parameter, tank_id, warning_low, warning_high, critical_low, critical_high) VALUES (?, ?, ?, ?, ?, ?)`,
        param.key, tank.id, warningLow, warningHigh, criticalLow, criticalHigh
      );
      await database.runAsync(
        `INSERT OR IGNORE INTO parameter_visibility (parameter, tank_id, visible) VALUES (?, ?, ?)`,
        param.key, tank.id, 1
      );
    }
  }
}

export { seedDefaultsForAllTanks };
