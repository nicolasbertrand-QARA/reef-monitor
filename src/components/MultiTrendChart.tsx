import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Reading, Thresholds, DosingEntry, WaterChange, ParameterDef } from '@/src/models/types';
import { THEME } from '@/src/constants/colors';
import { format } from 'date-fns';
import { getDisplayUnit } from '@/src/utils/units';
import i18n, { getDateLocale } from '@/src/i18n';

const CHART_HEIGHT = 200;
const CHART_PADDING = 16;
const DOSE_COLOR = '#c4943e';
const WC_COLOR = '#5a8fb8';

const LINE_COLORS = [
  '#5a8f8b', '#c4644a', '#c4943e', '#6b9e7a',
  '#8b6b9e', '#5a7fb8', '#b88a5a', '#9e6b7a',
];

interface ParamData {
  paramDef: ParameterDef;
  readings: Reading[];
  thresholds: Thresholds | null;
  color: string;
}

interface Props {
  datasets: ParamData[];
  doses?: DosingEntry[];
  waterChanges?: WaterChange[];
  unitPrefs?: Record<string, string>;
}

function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return '';
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx = (prev.x + curr.x) / 2;
    d += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  return d;
}

export function MultiTrendChart({ datasets, doses, waterChanges, unitPrefs }: Props) {
  const prefs = unitPrefs ?? {};
  const allReadings = datasets.flatMap((d) => d.readings);
  if (allReadings.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>{i18n.t('chart.noReadings')}</Text>
      </View>
    );
  }

  const screenWidth = Dimensions.get('window').width - 40;
  const chartWidth = screenWidth - CHART_PADDING * 2;
  const isSingle = datasets.length === 1;

  const allTimes = allReadings.map((r) => new Date(r.recorded_at).getTime());
  const timeStart = Math.min(...allTimes);
  const timeEnd = Math.max(...allTimes);
  const timeRange = timeEnd - timeStart || 1;

  // For single-param mode: build y-axis in DISPLAY units
  let yMinDisplay = 0, yMaxDisplay = 1, yRangeDisplay = 1;
  let singleUnit = null as ReturnType<typeof getDisplayUnit> | null;
  if (isSingle) {
    singleUnit = getDisplayUnit(datasets[0].paramDef, prefs);
    const displayVals = datasets[0].readings.map((r) => singleUnit!.fromCanonical(r.value));
    const min = Math.min(...displayVals), max = Math.max(...displayVals);
    const range = max - min || 1;
    yMinDisplay = min - range * 0.15;
    yMaxDisplay = max + range * 0.15;
    yRangeDisplay = yMaxDisplay - yMinDisplay;
  }

  // Build SVG paths
  const paths = datasets.map((ds) => {
    const u = getDisplayUnit(ds.paramDef, prefs);
    const displayVals = ds.readings.map((r) => u.fromCanonical(r.value));
    const dsMin = Math.min(...displayVals), dsMax = Math.max(...displayVals);
    const dsRange = dsMax - dsMin || 1;

    const points = ds.readings.map((r, i) => {
      const t = new Date(r.recorded_at).getTime();
      const x = CHART_PADDING + ((t - timeStart) / timeRange) * chartWidth;
      const normalizedY = isSingle
        ? (displayVals[i] - yMinDisplay) / yRangeDisplay
        : (displayVals[i] - dsMin) / dsRange;
      const y = CHART_HEIGHT - normalizedY * CHART_HEIGHT;
      return { x, y };
    });

    return { path: smoothPath(points), color: ds.color };
  });

  const doseMarkers = (doses ?? []).map((d) => {
    const t = new Date(d.dosed_at).getTime();
    if (t < timeStart || t > timeEnd) return null;
    return CHART_PADDING + ((t - timeStart) / timeRange) * chartWidth;
  }).filter(Boolean) as number[];

  const wcMarkers = (waterChanges ?? []).map((w) => {
    const t = new Date(w.changed_at).getTime();
    if (t < timeStart || t > timeEnd) return null;
    return CHART_PADDING + ((t - timeStart) / timeRange) * chartWidth;
  }).filter(Boolean) as number[];

  const earliest = new Date(timeStart);
  const latest = new Date(timeEnd);

  // Stats (single param, in display units)
  const singleDS = isSingle ? datasets[0] : null;
  const singleDisplayValues = singleDS && singleUnit ? singleDS.readings.map((r) => singleUnit!.fromCanonical(r.value)) : [];
  const singleLatest = singleDS ? singleDS.readings[singleDS.readings.length - 1] : null;

  // Threshold band (single mode, in display units)
  let thresholdLowDisplay: number | null = null;
  let thresholdHighDisplay: number | null = null;
  if (isSingle && singleDS?.thresholds && singleUnit) {
    if (singleDS.thresholds.warning_low != null) thresholdLowDisplay = singleUnit.fromCanonical(singleDS.thresholds.warning_low);
    if (singleDS.thresholds.warning_high != null) thresholdHighDisplay = singleUnit.fromCanonical(singleDS.thresholds.warning_high);
  }

  return (
    <View style={styles.container}>
      <View style={[styles.chartArea, { width: screenWidth, height: CHART_HEIGHT + 30 }]}>
        {isSingle && thresholdLowDisplay != null && thresholdHighDisplay != null && (
          <View style={[styles.rangeBand, {
            top: Math.max(0, CHART_HEIGHT - ((thresholdHighDisplay - yMinDisplay) / yRangeDisplay) * CHART_HEIGHT),
            height: Math.abs(((thresholdHighDisplay - thresholdLowDisplay) / yRangeDisplay) * CHART_HEIGHT),
            left: CHART_PADDING, width: chartWidth,
          }]} />
        )}

        {doseMarkers.map((x, i) => (
          <View key={`dose-${i}`} style={[styles.markerLine, { left: x }]}>
            <View style={[styles.markerLineInner, { backgroundColor: DOSE_COLOR }]} />
            <View style={[styles.markerDot, { backgroundColor: DOSE_COLOR }]} />
          </View>
        ))}

        {wcMarkers.map((x, i) => (
          <View key={`wc-${i}`} style={[styles.markerLine, { left: x }]}>
            <View style={[styles.markerLineInner, { backgroundColor: WC_COLOR }]} />
            <View style={[styles.markerDot, { backgroundColor: WC_COLOR }]} />
          </View>
        ))}

        <Svg width={screenWidth} height={CHART_HEIGHT} style={{ position: 'absolute', top: 0 }}>
          {paths.map((p, i) => (
            <Path key={i} d={p.path} stroke={p.color} strokeWidth={2} fill="none" strokeLinecap="round" />
          ))}
        </Svg>

        {isSingle && singleUnit && (
          <>
            <Text style={[styles.yLabel, { top: 0 }]}>{yMaxDisplay.toFixed(singleUnit.decimals)}</Text>
            <Text style={[styles.yLabel, { top: CHART_HEIGHT - 14 }]}>{yMinDisplay.toFixed(singleUnit.decimals)}</Text>
          </>
        )}

        {allReadings.length > 1 && (
          <>
            <Text style={[styles.xLabel, { left: CHART_PADDING }]}>{format(earliest, 'MMM d', { locale: getDateLocale() })}</Text>
            <Text style={[styles.xLabel, { right: 0 }]}>{format(latest, 'MMM d', { locale: getDateLocale() })}</Text>
          </>
        )}
      </View>

      {isSingle && singleLatest && singleUnit && (
        <View style={styles.stats}>
          {[
            { label: i18n.t('chart.current'), val: singleUnit.fromCanonical(singleLatest.value) },
            { label: i18n.t('chart.min'), val: Math.min(...singleDisplayValues) },
            { label: i18n.t('chart.max'), val: Math.max(...singleDisplayValues) },
            { label: i18n.t('chart.avg'), val: singleDisplayValues.reduce((s, v) => s + v, 0) / singleDisplayValues.length },
          ].map((s) => (
            <View key={s.label} style={styles.stat}>
              <Text style={styles.statLabel}>{s.label}</Text>
              <Text style={styles.statValue}>{s.val.toFixed(singleUnit.decimals)}</Text>
            </View>
          ))}
        </View>
      )}

      {!isSingle && (
        <View style={styles.legend}>
          {datasets.map((ds) => (
            <View key={ds.paramDef.key} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: ds.color }]} />
              <Text style={styles.legendText}>{ds.paramDef.label}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export { LINE_COLORS };

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20 },
  chartArea: { position: 'relative', marginBottom: 8 },
  rangeBand: { position: 'absolute', backgroundColor: THEME.statusOkBg, borderRadius: 4 },
  yLabel: { position: 'absolute', left: 0, color: THEME.textSecondary, fontSize: 10, fontVariant: ['tabular-nums'] },
  xLabel: { position: 'absolute', bottom: 0, color: THEME.textSecondary, fontSize: 10 },
  empty: { height: 200, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyTitle: { color: THEME.text, fontSize: 16, fontWeight: '600', marginBottom: 6 },
  markerLine: { position: 'absolute', top: 0, height: CHART_HEIGHT, width: 1, alignItems: 'center' },
  markerLineInner: { width: 1, height: '100%', opacity: 0.4 },
  markerDot: { position: 'absolute', top: -4, width: 8, height: 8, borderRadius: 4 },
  stats: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: THEME.surfaceElevated, borderRadius: 14, padding: 16, marginTop: 8 },
  stat: { alignItems: 'center' },
  statLabel: { color: THEME.textSecondary, fontSize: 11, marginBottom: 4, fontWeight: '500' },
  statValue: { color: THEME.text, fontSize: 16, fontWeight: '600', fontVariant: ['tabular-nums'] },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8, paddingHorizontal: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: THEME.textSecondary, fontSize: 11 },
});
