import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Reading, Thresholds, DosingEntry } from '@/src/models/types';
import { ParameterDef } from '@/src/models/types';
import { THEME } from '@/src/constants/colors';
import { format } from 'date-fns';
import i18n, { getDateLocale } from '@/src/i18n';

const CHART_HEIGHT = 200;
const CHART_PADDING = 40;
const DOSE_COLOR = '#c4943e';

interface Props {
  readings: Reading[];
  paramDef: ParameterDef;
  thresholds: Thresholds | null;
  doses?: DosingEntry[];
}

export function TrendChart({ readings, paramDef, thresholds, doses }: Props) {
  if (readings.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>{i18n.t('chart.noReadings')}</Text>
        <Text style={styles.emptyHint}>{i18n.t('chart.noReadingsHint', { param: paramDef.label.toLowerCase() })}</Text>
      </View>
    );
  }

  const screenWidth = Dimensions.get('window').width - 40;
  const values = readings.map((r) => r.value);
  const min = Math.min(...values), max = Math.max(...values);
  const range = max - min || 1;
  const yMin = min - range * 0.15, yMax = max + range * 0.15, yRange = yMax - yMin;
  const chartWidth = screenWidth - CHART_PADDING * 2;

  // Time range for x-axis positioning
  const timeStart = new Date(readings[0].recorded_at).getTime();
  const timeEnd = new Date(readings[readings.length - 1].recorded_at).getTime();
  const timeRange = timeEnd - timeStart || 1;

  const points = readings.map((r) => {
    const t = new Date(r.recorded_at).getTime();
    return {
      x: CHART_PADDING + ((t - timeStart) / timeRange) * chartWidth,
      y: CHART_HEIGHT - ((r.value - yMin) / yRange) * CHART_HEIGHT,
    };
  });

  // Position dosing markers on the time axis
  const doseMarkers = (doses ?? [])
    .map((d) => {
      const t = new Date(d.dosed_at).getTime();
      if (t < timeStart || t > timeEnd) return null;
      return {
        x: CHART_PADDING + ((t - timeStart) / timeRange) * chartWidth,
        label: `${d.product} ${d.amount}${d.unit}`,
        shortLabel: d.product.slice(0, 3),
      };
    })
    .filter(Boolean) as { x: number; label: string; shortLabel: string }[];

  const warnLowY = thresholds?.warning_low != null ? CHART_HEIGHT - ((thresholds.warning_low - yMin) / yRange) * CHART_HEIGHT : null;
  const warnHighY = thresholds?.warning_high != null ? CHART_HEIGHT - ((thresholds.warning_high - yMin) / yRange) * CHART_HEIGHT : null;
  const avg = values.reduce((s, v) => s + v, 0) / values.length;
  const latest = readings[readings.length - 1];

  return (
    <View style={styles.container}>
      <View style={[styles.chartArea, { width: screenWidth, height: CHART_HEIGHT + 30 }]}>
        {/* Target range band */}
        {warnLowY != null && warnHighY != null && (
          <View style={[styles.rangeBand, { top: Math.max(0, Math.min(warnHighY, warnLowY)), height: Math.abs(warnLowY - warnHighY), left: CHART_PADDING, width: chartWidth }]} />
        )}

        {/* Dosing markers — vertical dashed lines */}
        {doseMarkers.map((dm, i) => (
          <View key={`dose-${i}`} style={[styles.doseLine, { left: dm.x }]}>
            <View style={styles.doseLineInner} />
            <View style={styles.doseDot} />
          </View>
        ))}

        {/* Data points */}
        {points.map((pt, i) => <View key={i} style={[styles.dot, { left: pt.x - 3.5, top: pt.y - 3.5 }]} />)}

        {/* Y axis */}
        <Text style={[styles.yLabel, { top: 0 }]}>{yMax.toFixed(paramDef.decimals)}</Text>
        <Text style={[styles.yLabel, { top: CHART_HEIGHT - 14 }]}>{yMin.toFixed(paramDef.decimals)}</Text>

        {/* X axis */}
        {readings.length > 1 && (
          <>
            <Text style={[styles.xLabel, { left: CHART_PADDING }]}>{format(new Date(readings[0].recorded_at), 'MMM d', { locale: getDateLocale() })}</Text>
            <Text style={[styles.xLabel, { right: 0 }]}>{format(new Date(latest.recorded_at), 'MMM d', { locale: getDateLocale() })}</Text>
          </>
        )}
      </View>

      {/* Stats row */}
      <View style={styles.stats}>
        {[
          { label: i18n.t('chart.current'), val: latest.value },
          { label: i18n.t('chart.min'), val: min },
          { label: i18n.t('chart.max'), val: max },
          { label: i18n.t('chart.avg'), val: avg },
        ].map((s) => (
          <View key={s.label} style={styles.stat}>
            <Text style={styles.statLabel}>{s.label}</Text>
            <Text style={styles.statValue}>{s.val.toFixed(paramDef.decimals)}</Text>
          </View>
        ))}
      </View>

      {/* Dosing legend below stats */}
      {doseMarkers.length > 0 && (
        <View style={styles.doseLegend}>
          <View style={styles.doseLegendDot} />
          <Text style={styles.doseLegendText}>
            {[...new Set((doses ?? []).map((d) => d.product))].join(', ')}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20 },
  chartArea: { position: 'relative', marginBottom: 8 },
  rangeBand: { position: 'absolute', backgroundColor: THEME.statusOkBg, borderRadius: 4 },
  dot: { position: 'absolute', width: 7, height: 7, borderRadius: 3.5, backgroundColor: THEME.accent },
  yLabel: { position: 'absolute', left: 0, color: THEME.textSecondary, fontSize: 10, fontVariant: ['tabular-nums'] },
  xLabel: { position: 'absolute', bottom: 0, color: THEME.textSecondary, fontSize: 10 },
  empty: { height: 200, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyTitle: { color: THEME.text, fontSize: 16, fontWeight: '600', marginBottom: 6 },
  emptyHint: { color: THEME.textSecondary, fontSize: 13, textAlign: 'center', lineHeight: 19 },
  stats: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: THEME.surfaceElevated, borderRadius: 14, padding: 16, marginTop: 8 },
  stat: { alignItems: 'center' },
  statLabel: { color: THEME.textSecondary, fontSize: 11, marginBottom: 4, fontWeight: '500' },
  statValue: { color: THEME.text, fontSize: 16, fontWeight: '600', fontVariant: ['tabular-nums'] },
  // Dosing markers
  doseLine: { position: 'absolute', top: 0, height: CHART_HEIGHT, width: 1, alignItems: 'center' },
  doseLineInner: { width: 1, height: '100%', backgroundColor: DOSE_COLOR, opacity: 0.4 },
  doseDot: { position: 'absolute', top: -4, width: 8, height: 8, borderRadius: 4, backgroundColor: DOSE_COLOR },
  doseLegend: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, paddingHorizontal: 4 },
  doseLegendDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: DOSE_COLOR },
  doseLegendText: { color: THEME.textSecondary, fontSize: 11 },
});
