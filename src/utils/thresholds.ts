import { Status, Thresholds } from '@/src/models/types';

export function evaluateStatus(value: number, thresholds: Thresholds): Status {
  const { warning_low, warning_high, critical_low, critical_high } = thresholds;

  if (critical_low !== null && value <= critical_low) return 'critical';
  if (critical_high !== null && value >= critical_high) return 'critical';
  if (warning_low !== null && value < warning_low) return 'warning';
  if (warning_high !== null && value > warning_high) return 'warning';
  return 'ok';
}
