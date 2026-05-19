import { ParameterDef, ParameterKey, UnitOption, Thresholds } from '@/src/models/types';

// Identity unit option for parameters without alternative units
function identityUnit(paramDef: ParameterDef): UnitOption {
  return {
    unit: paramDef.unit,
    step: paramDef.step,
    decimals: paramDef.decimals,
    toCanonical: (v) => v,
    fromCanonical: (v) => v,
  };
}

/**
 * Get the display unit for a parameter given the user's preference.
 * Falls back to canonical (first entry of units, or paramDef itself).
 */
export function getDisplayUnit(paramDef: ParameterDef, preferences: Record<string, string>): UnitOption {
  if (!paramDef.units || paramDef.units.length === 0) {
    return identityUnit(paramDef);
  }
  const preferred = preferences[paramDef.key];
  if (preferred) {
    const match = paramDef.units.find((u) => u.unit === preferred);
    if (match) return match;
  }
  return paramDef.units[0]; // canonical
}

/**
 * Convert a canonical (stored) value into the display value for the user's preferred unit.
 */
export function toDisplayValue(canonicalValue: number, paramDef: ParameterDef, preferences: Record<string, string>): number {
  const u = getDisplayUnit(paramDef, preferences);
  return u.fromCanonical(canonicalValue);
}

/**
 * Convert a display value (entered by user) back into the canonical value for storage.
 */
export function toCanonicalValue(displayValue: number, paramDef: ParameterDef, preferences: Record<string, string>): number {
  const u = getDisplayUnit(paramDef, preferences);
  return u.toCanonical(displayValue);
}

/**
 * Convert thresholds (stored canonical) into display values for the user's preferred unit.
 * Returns a new Thresholds object with display values.
 */
export function thresholdsToDisplay(t: Thresholds, paramDef: ParameterDef, preferences: Record<string, string>): Thresholds {
  const u = getDisplayUnit(paramDef, preferences);
  return {
    parameter: t.parameter,
    warning_low: t.warning_low != null ? u.fromCanonical(t.warning_low) : null,
    warning_high: t.warning_high != null ? u.fromCanonical(t.warning_high) : null,
    critical_low: t.critical_low != null ? u.fromCanonical(t.critical_low) : null,
    critical_high: t.critical_high != null ? u.fromCanonical(t.critical_high) : null,
  };
}

/**
 * Convert thresholds from display unit back to canonical for storage.
 */
export function thresholdsToCanonical(t: Thresholds, paramDef: ParameterDef, preferences: Record<string, string>): Thresholds {
  const u = getDisplayUnit(paramDef, preferences);
  return {
    parameter: t.parameter,
    warning_low: t.warning_low != null ? u.toCanonical(t.warning_low) : null,
    warning_high: t.warning_high != null ? u.toCanonical(t.warning_high) : null,
    critical_low: t.critical_low != null ? u.toCanonical(t.critical_low) : null,
    critical_high: t.critical_high != null ? u.toCanonical(t.critical_high) : null,
  };
}

/**
 * Format a canonical value with the display unit string (e.g. "25.5 °C" or "77.9 °F").
 * Returns the numeric string only; pair with the unit label separately in UI.
 */
export function formatDisplay(canonicalValue: number, paramDef: ParameterDef, preferences: Record<string, string>): string {
  const u = getDisplayUnit(paramDef, preferences);
  return u.fromCanonical(canonicalValue).toFixed(u.decimals);
}
