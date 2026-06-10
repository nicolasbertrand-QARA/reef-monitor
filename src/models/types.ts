export const PARAMETER_KEYS = [
  'temperature',
  'salinity',
  'ph',
  'alkalinity',
  'calcium',
  'magnesium',
  'nitrate',
  'phosphate',
  'ammonia',
  'nitrite',
  'potassium',
  'strontium',
  'iodine',
  'boron',
  'silicate',
] as const;

export type ParameterKey = (typeof PARAMETER_KEYS)[number];

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

export interface Tank {
  id: number;
  name: string;
  created_at: string;
}

export interface ReminderSchedule {
  parameter: ParameterKey;
  interval_hours: number;
  enabled: boolean;
  last_notified_at: string | null;
}

export interface UnitOption {
  unit: string;             // display label, e.g. "°F"
  step: number;             // step size in this unit
  decimals: number;         // decimals to display
  toCanonical: (v: number) => number;   // convert display value → canonical storage value
  fromCanonical: (v: number) => number; // convert canonical storage value → display value
}

export interface ParameterDef {
  key: ParameterKey;
  label: string;
  unit: string;              // canonical unit (used for storage)
  step: number;              // canonical step
  decimals: number;          // canonical decimals
  defaultValue: number;      // canonical default
  icon: string;
  group: 'core' | 'nutrients';
  min?: number;              // physical lower bound (canonical), clamps the stepper
  max?: number;              // physical upper bound (canonical), clamps the stepper
  defaultThresholds: {
    warningLow: number | null;
    warningHigh: number | null;
    criticalLow: number | null;
    criticalHigh: number | null;
  };
  reminderIntervalHours: number;
  units?: UnitOption[];      // available display units (first must be canonical)
}
