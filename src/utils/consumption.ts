import { Reading } from '@/src/models/types';

/**
 * Calculate alkalinity consumption rate via linear regression.
 * Returns dKH/day (negative = consumption, positive = rising).
 * Returns null if fewer than 2 readings.
 */
export function calculateConsumptionRate(readings: Reading[]): number | null {
  if (readings.length < 2) return null;

  // Convert to (days_since_first, value) pairs
  const firstTime = new Date(readings[0].recorded_at).getTime();
  const points = readings.map((r) => ({
    x: (new Date(r.recorded_at).getTime() - firstTime) / (1000 * 60 * 60 * 24), // days
    y: r.value,
  }));

  const n = points.length;
  const sumX = points.reduce((s, p) => s + p.x, 0);
  const sumY = points.reduce((s, p) => s + p.y, 0);
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
  const sumX2 = points.reduce((s, p) => s + p.x * p.x, 0);

  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return null;

  const slope = (n * sumXY - sumX * sumY) / denom;
  return Math.round(slope * 100) / 100; // round to 2 decimals
}
