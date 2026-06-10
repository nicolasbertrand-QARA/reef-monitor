#!/usr/bin/env node
/**
 * Generates a realistic 90-day demo SQLite database for App Store screenshots.
 *
 * Usage:
 *   node scripts/seed-demo-db.mjs /tmp/reef-monitor.db
 *   xcrun simctl get_app_container booted com.nicolasbertrand.reefmonitor data
 *   cp /tmp/reef-monitor.db "<container>/Documents/SQLite/reef-monitor.db"
 *
 * Story baked into the data: a healthy mixed reef where phosphate has crept
 * just over the warning line (one amber card) and alkalinity shows a gentle,
 * readable consumption slope with water-change bumps. Everything else green.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const out = process.argv[2] ?? '/tmp/reef-monitor.db';
if (fs.existsSync(out)) fs.unlinkSync(out);

const DAY = 24 * 60 * 60 * 1000;
const now = Date.now();
const at = (daysAgo, hour = 10) => new Date(now - daysAgo * DAY - (daysAgo === 0 ? 0 : 0) + (hour - 10) * 3600 * 1000).toISOString();
const r2 = (v, d = 2) => Math.round(v * 10 ** d) / 10 ** d;

const rows = []; // [parameter, value, unit, recorded_at, tank_id]
const push = (p, v, u, daysAgo, tank = 1, hour = 10) => rows.push([p, v, u, at(daysAgo, hour), tank]);

// Alkalinity: every 3 days; sawtooth around weekly 10% WCs, recent net slope ~ -0.05 dKH/day
for (let d = 90; d >= 0; d -= 3) {
  const base = 8.55 - (90 - d) * 0.005;            // slow seasonal drift
  const sincewc = d % 7;                            // weekly WC bump
  const v = base + 0.18 - sincewc * 0.045;
  push('alkalinity', r2(Math.max(7.8, v), 1), 'dKH', d, 1, d === 0 ? 9 : 10);
}
// Temperature: every 2 days, tight band
for (let d = 90; d >= 0; d -= 2) push('temperature', r2(25.4 + Math.sin(d / 3) * 0.3, 1), '°C', d, 1, 9);
// Salinity: every 3-4 days
for (let d = 90; d >= 0; d -= 4) push('salinity', r2(1.025 + Math.sin(d / 5) * 0.0008, 3), '', d, 1);
// pH: weekly
for (let d = 88; d >= 1; d -= 7) push('ph', r2(8.15 + Math.sin(d / 11) * 0.06, 2), '', d, 1);
// Calcium: weekly, gentle decline
for (let d = 87; d >= 2; d -= 7) push('calcium', Math.round(444 - (90 - d) * 0.18), 'ppm', d, 1);
// Magnesium: every 10 days
for (let d = 85; d >= 4; d -= 10) push('magnesium', Math.round(1342 + Math.sin(d / 9) * 14), 'ppm', d, 1);
// Nitrate: every 4 days, slow rise, still in range
for (let d = 88; d >= 1; d -= 4) push('nitrate', r2(4.5 + (90 - d) * 0.033, 1), 'ppm', d, 1);
// Phosphate: every 4 days, creeping past warn-high (0.15) on the last reading
for (let d = 88; d >= 0; d -= 4) {
  const v = 0.05 + ((90 - d) / 90) * 0.11;
  push('phosphate', r2(Math.min(v, 0.16), 2), 'ppm', d, 1, d === 0 ? 9 : 10);
}
// Second tank: a small set so multi-tank is real
for (let d = 30; d >= 1; d -= 5) {
  push('alkalinity', r2(7.9 + Math.sin(d / 4) * 0.15, 1), 'dKH', d, 2);
  push('salinity', 1.025, '', d, 2);
  push('temperature', r2(25.1 + Math.sin(d / 2) * 0.2, 1), '°C', d, 2);
}

const doses = []; // [product, amount, unit, dosed_at, tank_id]
for (let d = 30; d >= 0; d -= 2) doses.push(['All-for-Reef', 5, 'ml', at(d, 8), 1]);
for (let d = 80; d > 35; d -= 3) doses.push(['Kalkwasser', 250, 'ml', at(d, 22), 1]);

const wcs = []; // [percentage, salt_brand, dilution_gpl, changed_at, tank_id]
for (let d = 88; d >= 4; d -= 7) wcs.push([10, 'Tropic Marin Pro Reef', 35, at(d, 11), 1]);

const esc = (s) => String(s).replace(/'/g, "''");
const sql = [
  'PRAGMA user_version = 5;',
  `CREATE TABLE readings (id INTEGER PRIMARY KEY AUTOINCREMENT, parameter TEXT NOT NULL, value REAL NOT NULL, unit TEXT NOT NULL, recorded_at TEXT NOT NULL, notes TEXT, tank_id INTEGER NOT NULL DEFAULT 1);`,
  `CREATE INDEX idx_readings_tank_param_date ON readings(tank_id, parameter, recorded_at DESC);`,
  `CREATE TABLE thresholds (parameter TEXT NOT NULL, tank_id INTEGER NOT NULL, warning_low REAL, warning_high REAL, critical_low REAL, critical_high REAL, PRIMARY KEY (parameter, tank_id));`,
  `CREATE TABLE dosing_log (id INTEGER PRIMARY KEY AUTOINCREMENT, product TEXT NOT NULL, amount REAL NOT NULL, unit TEXT NOT NULL, dosed_at TEXT NOT NULL, notes TEXT, tank_id INTEGER NOT NULL DEFAULT 1);`,
  `CREATE TABLE reminder_schedules (parameter TEXT PRIMARY KEY, interval_hours INTEGER NOT NULL, enabled INTEGER NOT NULL DEFAULT 1, last_notified_at TEXT);`,
  `CREATE TABLE water_changes (id INTEGER PRIMARY KEY AUTOINCREMENT, percentage REAL NOT NULL, salt_brand TEXT, dilution_gpl REAL, changed_at TEXT NOT NULL, tank_id INTEGER NOT NULL DEFAULT 1);`,
  `CREATE TABLE parameter_visibility (parameter TEXT NOT NULL, tank_id INTEGER NOT NULL, visible INTEGER NOT NULL DEFAULT 1, PRIMARY KEY (parameter, tank_id));`,
  `CREATE TABLE tanks (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, created_at TEXT NOT NULL);`,
  `CREATE TABLE app_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);`,
  `INSERT INTO tanks (id, name, created_at) VALUES (1, 'Reef 60 L', '${at(90)}'), (2, 'Nano 25 L', '${at(40)}');`,
  `INSERT INTO app_settings (key, value) VALUES ('active_tank_id', '1');`,
  ...rows.map(([p, v, u, t, tank]) => `INSERT INTO readings (parameter, value, unit, recorded_at, tank_id) VALUES ('${p}', ${v}, '${esc(u)}', '${t}', ${tank});`),
  ...doses.map(([p, a, u, t, tank]) => `INSERT INTO dosing_log (product, amount, unit, dosed_at, tank_id) VALUES ('${esc(p)}', ${a}, '${u}', '${t}', ${tank});`),
  ...wcs.map(([pc, b, g, t, tank]) => `INSERT INTO water_changes (percentage, salt_brand, dilution_gpl, changed_at, tank_id) VALUES (${pc}, '${esc(b)}', ${g}, '${t}', ${tank});`),
].join('\n');

execFileSync('sqlite3', [out], { input: sql });
const counts = execFileSync('sqlite3', [out, 'SELECT (SELECT COUNT(*) FROM readings) || " readings, " || (SELECT COUNT(*) FROM dosing_log) || " doses, " || (SELECT COUNT(*) FROM water_changes) || " water changes";']).toString().trim();
console.log(`${out}: ${counts}`);
