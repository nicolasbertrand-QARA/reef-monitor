import { ParameterDef, ParameterKey, UnitOption } from '@/src/models/types';
import i18n from '@/src/i18n';

// Identity conversion (for the canonical option of each parameter)
const ID = (v: number) => v;

// Temperature conversions
const C_TO_F = (c: number) => Math.round((c * 9 / 5 + 32) * 10) / 10;
const F_TO_C = (f: number) => Math.round((f - 32) * 5 / 9 * 100) / 100;

// Salinity conversions (at 25 °C, standard reef approximation)
// SG 1.026 ≈ 35 ppt; using factor 1346
const SG_TO_PPT = (sg: number) => Math.round((sg - 1) * 1346 * 10) / 10;
const PPT_TO_SG = (ppt: number) => Math.round((1 + ppt / 1346) * 1000) / 1000;

// Alkalinity conversions
const DKH_TO_MEQ = (dkh: number) => Math.round(dkh / 2.8 * 100) / 100;
const MEQ_TO_DKH = (meq: number) => Math.round(meq * 2.8 * 100) / 100;
const DKH_TO_CACO3 = (dkh: number) => Math.round(dkh * 17.86);
const CACO3_TO_DKH = (ppm: number) => Math.round(ppm / 17.86 * 100) / 100;

// Nitrate NO3 ↔ NO3-N (molecular weight ratio 62/14 ≈ 4.43)
const NO3_TO_NO3N = (no3: number) => Math.round(no3 / 4.43 * 100) / 100;
const NO3N_TO_NO3 = (n: number) => Math.round(n * 4.43 * 100) / 100;

// Phosphate ppm ↔ ppb
const PPM_TO_PPB = (ppm: number) => Math.round(ppm * 1000);
const PPB_TO_PPM = (ppb: number) => Math.round(ppb / 1000 * 1000) / 1000;

const TEMP_UNITS: UnitOption[] = [
  { unit: '°C', step: 0.1, decimals: 1, toCanonical: ID, fromCanonical: ID },
  { unit: '°F', step: 0.2, decimals: 1, toCanonical: F_TO_C, fromCanonical: C_TO_F },
];

const SALINITY_UNITS: UnitOption[] = [
  { unit: '', step: 0.001, decimals: 3, toCanonical: ID, fromCanonical: ID }, // SG (canonical)
  { unit: 'ppt', step: 0.5, decimals: 1, toCanonical: PPT_TO_SG, fromCanonical: SG_TO_PPT },
];

const ALK_UNITS: UnitOption[] = [
  { unit: 'dKH', step: 0.1, decimals: 1, toCanonical: ID, fromCanonical: ID },
  { unit: 'meq/L', step: 0.05, decimals: 2, toCanonical: MEQ_TO_DKH, fromCanonical: DKH_TO_MEQ },
  { unit: 'ppm CaCO₃', step: 5, decimals: 0, toCanonical: CACO3_TO_DKH, fromCanonical: DKH_TO_CACO3 },
];

const NITRATE_UNITS: UnitOption[] = [
  { unit: 'ppm', step: 0.1, decimals: 1, toCanonical: ID, fromCanonical: ID },
  { unit: 'ppm NO₃-N', step: 0.05, decimals: 2, toCanonical: NO3N_TO_NO3, fromCanonical: NO3_TO_NO3N },
];

const PHOSPHATE_UNITS: UnitOption[] = [
  { unit: 'ppm', step: 0.01, decimals: 2, toCanonical: ID, fromCanonical: ID },
  { unit: 'ppb', step: 5, decimals: 0, toCanonical: PPB_TO_PPM, fromCanonical: PPM_TO_PPB },
];

function getParams(): Record<ParameterKey, ParameterDef> {
  return {
    temperature: {
      key: 'temperature', label: i18n.t('params.temperature'), unit: '°C', step: 0.1, decimals: 1, defaultValue: 25.5, icon: 'thermometer-half', group: 'core',
      defaultThresholds: { warningLow: 24, warningHigh: 27.5, criticalLow: 22, criticalHigh: 29 }, reminderIntervalHours: 24,
      units: TEMP_UNITS,
    },
    salinity: {
      key: 'salinity', label: i18n.t('params.salinity'), unit: '', step: 0.001, decimals: 3, defaultValue: 1.025, icon: 'tint', group: 'core',
      defaultThresholds: { warningLow: 1.023, warningHigh: 1.027, criticalLow: 1.020, criticalHigh: 1.030 }, reminderIntervalHours: 24,
      units: SALINITY_UNITS,
    },
    ph: {
      key: 'ph', label: i18n.t('params.ph'), unit: '', step: 0.05, decimals: 2, defaultValue: 8.2, icon: 'flask', group: 'core',
      defaultThresholds: { warningLow: 7.8, warningHigh: 8.5, criticalLow: 7.6, criticalHigh: 8.6 }, reminderIntervalHours: 168,
    },
    alkalinity: {
      key: 'alkalinity', label: i18n.t('params.alkalinity'), unit: 'dKH', step: 0.1, decimals: 1, defaultValue: 8.0, icon: 'balance-scale', group: 'core',
      defaultThresholds: { warningLow: 6.5, warningHigh: 11, criticalLow: 5.5, criticalHigh: 12.5 }, reminderIntervalHours: 84,
      units: ALK_UNITS,
    },
    calcium: {
      key: 'calcium', label: i18n.t('params.calcium'), unit: 'ppm', step: 5, decimals: 0, defaultValue: 420, icon: 'cube', group: 'core',
      defaultThresholds: { warningLow: 380, warningHigh: 480, criticalLow: 350, criticalHigh: 500 }, reminderIntervalHours: 168,
    },
    magnesium: {
      key: 'magnesium', label: i18n.t('params.magnesium'), unit: 'ppm', step: 10, decimals: 0, defaultValue: 1350, icon: 'diamond', group: 'core',
      defaultThresholds: { warningLow: 1200, warningHigh: 1450, criticalLow: 1100, criticalHigh: 1500 }, reminderIntervalHours: 168,
    },
    nitrate: {
      key: 'nitrate', label: i18n.t('params.nitrate'), unit: 'ppm', step: 0.1, decimals: 1, defaultValue: 5, icon: 'leaf', group: 'nutrients',
      defaultThresholds: { warningLow: 0.5, warningHigh: 20, criticalLow: 0, criticalHigh: 40 }, reminderIntervalHours: 168,
      units: NITRATE_UNITS,
    },
    phosphate: {
      key: 'phosphate', label: i18n.t('params.phosphate'), unit: 'ppm', step: 0.01, decimals: 2, defaultValue: 0.05, icon: 'eyedropper', group: 'nutrients',
      defaultThresholds: { warningLow: 0.01, warningHigh: 0.15, criticalLow: 0, criticalHigh: 0.25 }, reminderIntervalHours: 168,
      units: PHOSPHATE_UNITS,
    },
    ammonia: {
      key: 'ammonia', label: i18n.t('params.ammonia'), unit: 'ppm', step: 0.05, decimals: 2, defaultValue: 0, icon: 'warning', group: 'nutrients',
      defaultThresholds: { warningLow: null, warningHigh: 0.1, criticalLow: null, criticalHigh: 0.25 }, reminderIntervalHours: 168,
    },
    nitrite: {
      key: 'nitrite', label: i18n.t('params.nitrite'), unit: 'ppm', step: 0.05, decimals: 2, defaultValue: 0, icon: 'exclamation-triangle', group: 'nutrients',
      defaultThresholds: { warningLow: null, warningHigh: 0.1, criticalLow: null, criticalHigh: 0.25 }, reminderIntervalHours: 168,
    },
    potassium: {
      key: 'potassium', label: i18n.t('params.potassium'), unit: 'ppm', step: 5, decimals: 0, defaultValue: 400, icon: 'bolt', group: 'core',
      defaultThresholds: { warningLow: 380, warningHigh: 450, criticalLow: 350, criticalHigh: 480 }, reminderIntervalHours: 720,
    },
    strontium: {
      key: 'strontium', label: i18n.t('params.strontium'), unit: 'ppm', step: 0.5, decimals: 1, defaultValue: 9, icon: 'certificate', group: 'core',
      defaultThresholds: { warningLow: 7, warningHigh: 12, criticalLow: 5, criticalHigh: 14 }, reminderIntervalHours: 720,
    },
    iodine: {
      key: 'iodine', label: i18n.t('params.iodine'), unit: 'ppm', step: 0.01, decimals: 2, defaultValue: 0.06, icon: 'sun-o', group: 'core',
      defaultThresholds: { warningLow: 0.02, warningHigh: 0.1, criticalLow: 0.01, criticalHigh: 0.15 }, reminderIntervalHours: 720,
    },
    boron: {
      key: 'boron', label: i18n.t('params.boron'), unit: 'ppm', step: 0.5, decimals: 1, defaultValue: 5, icon: 'tint', group: 'core',
      defaultThresholds: { warningLow: 3, warningHigh: 7, criticalLow: 2, criticalHigh: 9 }, reminderIntervalHours: 720,
    },
    silicate: {
      key: 'silicate', label: i18n.t('params.silicate'), unit: 'ppm', step: 0.1, decimals: 1, defaultValue: 0, icon: 'filter', group: 'nutrients',
      defaultThresholds: { warningLow: null, warningHigh: 0.5, criticalLow: null, criticalHigh: 2 }, reminderIntervalHours: 720,
    },
  };
}

// Re-evaluate on each access so language changes are reflected
export const PARAMETERS = new Proxy({} as Record<ParameterKey, ParameterDef>, {
  get: (_, key: string) => getParams()[key as ParameterKey],
});

export function getParameterList() { return Object.values(getParams()); }
export function getCoreParams() { return getParameterList().filter((p) => p.group === 'core'); }
export function getNutrientParams() { return getParameterList().filter((p) => p.group === 'nutrients'); }

// Keep backward compat
export const PARAMETER_LIST = Object.values(getParams());
export const CORE_PARAMS = PARAMETER_LIST.filter((p) => p.group === 'core');
export const NUTRIENT_PARAMS = PARAMETER_LIST.filter((p) => p.group === 'nutrients');
