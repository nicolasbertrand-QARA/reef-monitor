import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Reading, Thresholds, DosingEntry, WaterChange } from '@/src/models/types';
import { ParameterDef } from '@/src/models/types';
import { THEME } from '@/src/constants/colors';
import { format } from 'date-fns';
import i18n, { getDateLocale } from '@/src/i18n';

const CHART_HEIGHT = 200;
const CHART_PADDING = 16;
const DOSE_COLOR = '#c4943e';
const WC_COLOR = '#5a8fb8';

// Distinct colors for multi-param overlay
const LINE_COLORS = [
  '#5a8f8b', // teal (accent)
  '#c4644a', // coral
  '#c4943e', // amber
  '#6b9e7a', // sage
  '#8b6b9e', // purple
  '#5a7fb8', // blue
  '#b88a5a', // bronze
  '#9e6b7a', // mauve
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

export function MultiTrendChart({ datasets, doses, waterChanges }: Props) {
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

  // Global time range across all datasets
  const allTimes = allReadings.map((r) => new Date(r.recorded_at).getTime());
  const timeStart = Math.min(...allTimes);
  const timeEnd = Math.max(...allTimes);
  const timeRange = timeEnd - timeStart || 1;

  // For single param: use actual values for y-axis. For multi: normalize 0-1.
  let yMin = 0, yMax = 1, yRange = 1;
  if (isSingle) {
    const values = datasets[0].readings.map((r) => r.value);
    const min = Math.min(...values), max = Math.max(...values);
    const range = max - min || 1;
    yMin = min - range * 0.15;
    yMax = max + range * 0.15;
    yRange = yMax - yMin;
  }

  // Build SVG paths for each dataset
  const paths = datasets.map((ds) => {
    const values = ds.readings.map((r) => r.value);
    const dsMin = Math.min(...values), dsMax = Math.max(...values);
    const dsRange = dsMax - dsMin || 1;

    const points = ds.readings.map((r) => {
      const t = new Date(r.recorded_at).getTime();
      const x = CHART_PADDING + ((t - timeStart) / timeRange) * chartWidth;
      const normalizedY = isSingle
        ? (r.value - yMin) / yRange
        : (r.value - dsMin) / dsRange;
      const y = CHART_HEIGHT - normalizedY * CHART_HEIGHT;
      return { x, y };
    });

    return { path: smoothPath(points), color: ds.color };
  });

  // Dosing markers
  const doseMarkers = (doses ?? []).map((d) => {
    const t = new Date(d.dosed_at).getTime();
    if (t < timeStart || t > timeEnd) return null;
    return CHART_PADDING + ((t - timeStart) / timeRange) * chartWidth;
  }).filter(Boolean) as number[];

  // Water change markers
  const wcMarkers = (waterChanges ?? []).map((w) => {
    const t = new Date(w.changed_at).getTime();
    if (t < timeStart || t > timeEnd) return null;
    return CHART_PADDING + ((t - timeStart) / timeRange) * chartWidth;
  }).filter(Boolean) as number[];

  // X-axis dates
  const earliest = new Date(timeStart);
  const latest = new Date(timeEnd);

  // Stats (single param only)
  const singleDS = isSingle ? datasets[0] : null;
  const singleValues = singleDS ? singleDS.readings.map((r) => r.value) : [];
  const singleLatest = singleDS ? singleDS.readings[singleDS.readings.length - 1] : null;

  return (
    <View style={styles.container}>
      <View style={[styles.chartArea, { width: screenWidth, height: CHART_HEIGHT + 30 }]}>
        {/* Target range band (single only) */}
        {isSingle && singleDS?.thresholds?.warning_low != null && singleDS?.thresholds?.warning_high != null && (
          <View style={[styles.rangeBand, {
            top: Math.max(0, CHART_HEIGHT - ((singleDS.thresholds.warning_high - yMin) / yRange) * CHART_HEIGHT),
            height: Math.abs(((singleDS.thresholds.warning_high - singleDS.thresholds.warning_low) / yRange) * CHART_HEIGHT),
            left: CHART_PADDING, width: chartWidth,
          }]} />
        )}

        {/* Dose markers */}
        {doseMarkers.map((x, i) => (
          <View key={`dose-${i}`} style={[styles.markerLine, { left: x }]}>
            <View style={[styles.markerLineInner, { backgroundColor: DOSE_COLOR }]} />
            <View style={[styles.markerDot, { backgroundColor: DOSE_COLOR }]} />
          </View>
        ))}

        {/* Water change markers */}
        {wcMarkers.map((x, i) => (
          <View key={`wc-${i}`} style={[styles.markerLine, { left: x }]}>
            <View style={[styles.markerLineInner, { backgroundColor: WC_COLOR }]} />
            <View style={[styles.markerDot, { backgroundColor: WC_COLOR }]} />
          </View>
        ))}

        {/* SVG curves */}
        <Svg width={screenWidth} height={CHART_HEIGHT} style={{ position: 'absolute', top: 0 }}>
          {paths.map((p, i) => (
            <Path key={i} d={p.path} stroke={p.color} strokeWidth={2} fill="none" strokeLinecap="round" />
          ))}
        </Svg>

        {/* Y-axis (single only) */}
        {isSingle && (
          <>
            <Text style={[styles.yLabel, { top: 0 }]}>{yMax.toFixed(singleDS!.paramDef.decimals)}</Text>
            <Text style={[styles.yLabel, { top: CHART_HEIGHT - 14 }]}>{yMin.toFixed(singleDS!.paramDef.decimals)}</Text>
          </>
        )}

        {/* X-axis */}
        {allReadings.length > 1 && (
          <>
            <Text style={[styles.xLabel, { left: CHART_PADDING }]}>{format(earliest, 'MMM d', { locale: getDateLocale() })}</Text>
            <Text style={[styles.xLabel, { right: 0 }]}>{format(latest, 'MMM d', { locale: getDateLocale() })}</Text>
          </>
        )}
      </View>

      {/* Stats (single param only) */}
      {isSingle && singleLatest && (
        <View style={styles.stats}>
          {[
            { label: i18n.t('chart.current'), val: singleLatest.value },
            { label: i18n.t('chart.min'), val: Math.min(...singleValues) },
            { label: i18n.t('chart.max'), val: Math.max(...singleValues) },
            { label: i18n.t('chart.avg'), val: singleValues.reduce((s, v) => s + v, 0) / singleValues.length },
          ].map((s) => (
            <View key={s.label} style={styles.stat}>
              <Text style={styles.statLabel}>{s.label}</Text>
              <Text style={styles.statValue}>{s.val.toFixed(singleDS!.paramDef.decimals)}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Legend (multi only) */}
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
