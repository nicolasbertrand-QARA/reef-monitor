export type ParameterKey =
  | 'temperature'
  | 'salinity'
  | 'ph'
  | 'alkalinity'
  | 'calcium'
  | 'magnesium'
  | 'nitrate'
  | 'phosphate';

export type Status = 'critical' | 'warning' | 'ok' | 'unknown';

export interface Reading {
  id: number;
  parameter: ParameterKey;
  value: number;
  unit: string;
  recorded_at: string; // ISO 8601
  notes: string | null;
}

export interface Thresholds {
  parameter: ParameterKey;
  warning_low: number | null;
  warning_high: number | null;
  critical_low: number | null;
  critical_high: number | null;
}

export interface DosingEntry {
  id: number;
  product: string;
  amount: number;
  unit: string;
  dosed_at: string;
  notes: string | null;
}

export interface WaterChange {
  id: number;
  percentage: number;
  salt_brand: string | null;
  dilution_gpl: number | null;
  changed_at: string;
}

export interface ReminderSchedule {
  parameter: ParameterKey;
  interval_hours: number;
  enabled: boolean;
  last_notified_at: string | null;
}

export interface ParameterDef {
  key: ParameterKey;
  label: string;
  unit: string;
  step: number;
  decimals: number;
  defaultValue: number;
  icon: string;
  group: 'core' | 'nutrients';
  defaultThresholds: {
    warningLow: number | null;
    warningHigh: number | null;
    criticalLow: number | null;
    criticalHigh: number | null;
  };
  reminderIntervalHours: number;
}
