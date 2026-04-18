import { ParameterDef, ParameterKey } from '@/src/models/types';
import i18n from '@/src/i18n';

function getParams(): Record<ParameterKey, ParameterDef> {
  return {
    temperature: {
      key: 'temperature', label: i18n.t('params.temperature'), unit: '°C', step: 0.1, decimals: 1, defaultValue: 25.5, icon: 'thermometer-half', group: 'core',
      defaultThresholds: { warningLow: 24, warningHigh: 27.5, criticalLow: 22, criticalHigh: 29 }, reminderIntervalHours: 24,
    },
    salinity: {
      key: 'salinity', label: i18n.t('params.salinity'), unit: '', step: 0.001, decimals: 3, defaultValue: 1.025, icon: 'tint', group: 'core',
      defaultThresholds: { warningLow: 1.023, warningHigh: 1.027, criticalLow: 1.020, criticalHigh: 1.030 }, reminderIntervalHours: 24,
    },
    ph: {
      key: 'ph', label: i18n.t('params.ph'), unit: '', step: 0.05, decimals: 2, defaultValue: 8.2, icon: 'flask', group: 'core',
      defaultThresholds: { warningLow: 7.8, warningHigh: 8.5, criticalLow: 7.6, criticalHigh: 8.6 }, reminderIntervalHours: 168,
    },
    alkalinity: {
      key: 'alkalinity', label: i18n.t('params.alkalinity'), unit: 'dKH', step: 0.1, decimals: 1, defaultValue: 8.0, icon: 'balance-scale', group: 'core',
      defaultThresholds: { warningLow: 6.5, warningHigh: 11, criticalLow: 5.5, criticalHigh: 12.5 }, reminderIntervalHours: 84,
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
    },
    phosphate: {
      key: 'phosphate', label: i18n.t('params.phosphate'), unit: 'ppm', step: 0.01, decimals: 2, defaultValue: 0.05, icon: 'eyedropper', group: 'nutrients',
      defaultThresholds: { warningLow: 0.01, warningHigh: 0.15, criticalLow: 0, criticalHigh: 0.25 }, reminderIntervalHours: 168,
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
