import * as SQLite from 'expo-sqlite';
import { PARAMETER_LIST } from '@/src/constants/parameters';

const DB_NAME = 'reef-monitor.db';
const DB_VERSION = 2;

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

      CREATE INDEX IF NOT EXISTS idx_readings_param_date
        ON readings(parameter, recorded_at DESC);

      CREATE TABLE IF NOT EXISTS thresholds (
        parameter TEXT PRIMARY KEY,
        warning_low REAL,
        warning_high REAL,
        critical_low REAL,
        critical_high REAL
      );

      CREATE TABLE IF NOT EXISTS dosing_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product TEXT NOT NULL,
        amount REAL NOT NULL,
        unit TEXT NOT NULL,
        dosed_at TEXT NOT NULL,
        notes TEXT
      );

      CREATE TABLE IF NOT EXISTS reminder_schedules (
        parameter TEXT PRIMARY KEY,
        interval_hours INTEGER NOT NULL,
        enabled INTEGER NOT NULL DEFAULT 1,
        last_notified_at TEXT
      );
    `);

    await seedDefaults(database);
  }

  if (user_version < 2) {
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS water_changes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        percentage REAL NOT NULL,
        salt_brand TEXT,
        dilution_gpl REAL,
        changed_at TEXT NOT NULL
      );
    `);
  }

  await database.execAsync(`PRAGMA user_version = ${DB_VERSION}`);
}

async function seedDefaults(database: SQLite.SQLiteDatabase) {
  for (const param of PARAMETER_LIST) {
    const { warningLow, warningHigh, criticalLow, criticalHigh } = param.defaultThresholds;
    await database.runAsync(
      `INSERT OR IGNORE INTO thresholds (parameter, warning_low, warning_high, critical_low, critical_high)
       VALUES (?, ?, ?, ?, ?)`,
      param.key, warningLow, warningHigh, criticalLow, criticalHigh
    );

    await database.runAsync(
      `INSERT OR IGNORE INTO reminder_schedules (parameter, interval_hours, enabled)
       VALUES (?, ?, 1)`,
      param.key, param.reminderIntervalHours
    );
  }
}
