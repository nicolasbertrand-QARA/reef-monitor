import { Reading, Status } from '@/src/models/types';
import i18n from '@/src/i18n';

export interface RatioResult { ratio: number | null; status: Status; message: string; }

export function evaluateNO3PO4Ratio(no3: number, po4: number): RatioResult {
  if (po4 <= 0 || no3 < 0) {
    if (po4 <= 0 && no3 > 5) return { ratio: null, status: 'warning', message: i18n.t('ratios.po4Undetectable') };
    if (no3 <= 0 && po4 > 0.03) return { ratio: null, status: 'warning', message: i18n.t('ratios.no3Undetectable') };
    return { ratio: null, status: 'unknown', message: i18n.t('ratios.insufficientData') };
  }
  const ratio = Math.round(no3 / po4);
  if (ratio < 20) return { ratio, status: 'warning', message: i18n.t('ratios.ratioLow', { ratio }) };
  if (ratio > 200) return { ratio, status: 'warning', message: i18n.t('ratios.ratioHigh', { ratio }) };
  return { ratio, status: 'ok', message: i18n.t('ratios.ratioOk', { ratio }) };
}

export function evaluateIonicBalance(ca: number, alk: number, mg: number): { status: Status; message: string } {
  const issues: string[] = [];
  const mgCaRatio = mg / ca;
  if (mgCaRatio < 2.5) issues.push(i18n.t('ratios.mgLow'));
  if (mgCaRatio > 4.0) issues.push(i18n.t('ratios.mgHigh'));
  if (mg < 1200 && (ca < 400 || alk < 7)) issues.push(i18n.t('ratios.mgInstability'));
  if (issues.length === 0) return { status: 'ok', message: i18n.t('ratios.ionicOk') };
  return { status: 'warning', message: issues.join('. ') };
}

export function detectAlkSwing(readings: Reading[]): { swing: number; status: Status } {
  if (readings.length < 2) return { swing: 0, status: 'unknown' };
  const now = Date.now();
  const last24h = readings.filter((r) => now - new Date(r.recorded_at).getTime() < 24 * 60 * 60 * 1000);
  if (last24h.length < 2) return { swing: 0, status: 'ok' };
  const values = last24h.map((r) => r.value);
  const swing = Math.max(...values) - Math.min(...values);
  if (swing > 1.5) return { swing, status: 'critical' };
  if (swing > 1.0) return { swing, status: 'warning' };
  return { swing, status: 'ok' };
}
