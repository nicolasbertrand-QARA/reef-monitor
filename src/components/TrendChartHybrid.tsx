import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Svg, { Polyline, Line, Rect, Circle, G, Text as SvgText } from 'react-native-svg';
import { format, differenceInDays } from 'date-fns';
import { THEME, STATUS_COLORS } from '@/src/constants/colors';
import {
  ParameterDef, Reading, Thresholds, DosingEntry, WaterChange, ParameterKey, Status,
} from '@/src/models/types';
import { getDisplayUnit } from '@/src/utils/units';
import { evaluateStatus } from '@/src/utils/thresholds';
import { calculateConsumptionRate } from '@/src/utils/consumption';
import i18n, { getDateLocale } from '@/src/i18n';

export interface ParamData {
  paramDef: ParameterDef;
  readings: Reading[];
  thresholds: Thresholds | null;
}

interface Props {
  datasets: ParamData[];
  doses?: DosingEntry[];
  waterChanges?: WaterChange[];
  unitPrefs?: Record<string, string>;
  timeRangeDays?: number;
  onSelectSingle?: (key: ParameterKey) => void;
  onClearMulti?: () => void;
}

export function TrendChartHybrid(props: Props) {
  const totalReadings = props.datasets.reduce((s, d) => s + d.readings.length, 0);
  if (totalReadings === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>{i18n.t('chart.noReadings')}</Text>
        {props.datasets.length === 1 && (
          <Text style={styles.emptyHint}>{i18n.t('chart.noReadingsHint', { param: props.datasets[0].paramDef.label })}</Text>
        )}
      </View>
    );
  }
  if (props.datasets.length === 1) {
    return <MonoView {...props} ds={props.datasets[0]} />;
  }
  return <MultiView {...props} />;
}

// ---------- MonoView ----------

function MonoView({ ds, doses = [], waterChanges = [], unitPrefs = {}, timeRangeDays = 30 }: Props & { ds: ParamData }) {
  const { paramDef, readings, thresholds } = ds;
  if (readings.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>{i18n.t('chart.noReadings')}</Text>
      </View>
    );
  }

  const u = getDisplayUnit(paramDef, unitPrefs);
  const sorted = [...readings].sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime());
  const n = sorted.length;
  const latest = sorted[n - 1];
  const earliest = sorted[0];
  const displayVals = sorted.map(r => u.fromCanonical(r.value));
  const latestVal = displayVals[n - 1];
  const earliestVal = displayVals[0];
  const minVal = Math.min(...displayVals);
  const maxVal = Math.max(...displayVals);
  const avgVal = displayVals.reduce((s, v) => s + v, 0) / n;
  const delta = latestVal - earliestVal;

  const wLow = thresholds?.warning_low != null ? u.fromCanonical(thresholds.warning_low) : null;
  const wHigh = thresholds?.warning_high != null ? u.fromCanonical(thresholds.warning_high) : null;

  const status: Status = thresholds ? evaluateStatus(latest.value, thresholds) : 'ok';
  const statusColor = STATUS_COLORS[status];
  const deltaColor = status === 'critical' ? STATUS_COLORS.critical : status === 'warning' ? STATUS_COLORS.warning : STATUS_COLORS.ok;
  const deltaArrow = delta > 0.0001 ? '▲' : delta < -0.0001 ? '▼' : '◆';

  // y range
  let yMin: number; let yMax: number;
  if (wLow != null && wHigh != null) {
    const span = wHigh - wLow;
    const pad = span * 0.25;
    yMin = Math.min(wLow - pad, minVal - span * 0.05);
    yMax = Math.max(wHigh + pad, maxVal + span * 0.05);
  } else {
    const dataPad = (maxVal - minVal) * 0.15 || Math.max(1, Math.abs(latestVal) * 0.05);
    yMin = minVal - dataPad;
    yMax = maxVal + dataPad;
  }
  const yRange = yMax - yMin || 1;

  // viewBox 360x280, plot area 36..348 x 24..240
  const VB_W = 360, VB_H = 280;
  const PX0 = 36, PX1 = 348, PY0 = 24, PY1 = 240;
  const PLOT_W = PX1 - PX0;
  const PLOT_H = PY1 - PY0;
  const valToY = (v: number) => PY0 + ((yMax - v) / yRange) * PLOT_H;

  const tMin = new Date(earliest.recorded_at).getTime();
  const tMax = new Date(latest.recorded_at).getTime();
  const tRange = (tMax - tMin) || 1;
  const timeToX = (t: number) => PX0 + ((t - tMin) / tRange) * PLOT_W;

  const polyPoints = sorted.map((r, i) => {
    const x = n === 1 ? PX0 + PLOT_W / 2 : timeToX(new Date(r.recorded_at).getTime());
    const y = valToY(displayVals[i]);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(' ');

  const lastX = n === 1 ? PX0 + PLOT_W / 2 : timeToX(new Date(latest.recorded_at).getTime());
  const lastY = valToY(latestVal);

  const midTime = (tMin + tMax) / 2;
  const xLabels = n > 1 ? [
    { x: PX0, label: format(new Date(tMin), 'd MMM', { locale: getDateLocale() }) },
    { x: (PX0 + PX1) / 2, label: format(new Date(midTime), 'd MMM', { locale: getDateLocale() }) },
    { x: PX1, label: format(new Date(tMax), 'd MMM', { locale: getDateLocale() }) },
  ] : [];

  const wcMarkers = (waterChanges ?? [])
    .map(w => new Date(w.changed_at).getTime())
    .filter(t => t >= tMin && t <= tMax)
    .map(t => timeToX(t));
  const doseMarkers = (doses ?? [])
    .map(d => new Date(d.dosed_at).getTime())
    .filter(t => t >= tMin && t <= tMax)
    .map(t => timeToX(t));

  // Narrative
  let narrative: string;
  if (n === 1) {
    narrative = i18n.t('trends.narrativeSingle');
  } else {
    const key = status === 'critical' ? 'trends.narrativeCritical' : status === 'warning' ? 'trends.narrativeWarning' : 'trends.narrativeOk';
    narrative = i18n.t(key, {
      value: latestVal.toFixed(u.decimals),
      unit: u.unit,
      min: minVal.toFixed(u.decimals),
      max: maxVal.toFixed(u.decimals),
    });
  }

  // Alk consumption inline: fit on the recent regime only (14 days back from
  // the latest reading), and keep the sign — rising alk is a dosing warning,
  // not "consumption".
  let consumptionInline = '';
  if (paramDef.key === 'alkalinity' && n >= 2) {
    const windowStart = tMax - 14 * 24 * 60 * 60 * 1000;
    const recent = sorted.filter((r) => new Date(r.recorded_at).getTime() >= windowStart);
    const rate = recent.length >= 2 ? calculateConsumptionRate(recent) : null;
    if (rate !== null && Math.abs(rate) >= 0.01) {
      // Alk units are pure scale factors, so converting the daily delta works
      const displayRate = Math.abs(u.fromCanonical(rate));
      const key = rate < 0 ? 'trends.consumptionInline' : 'trends.consumptionInlineRising';
      consumptionInline = ' ' + i18n.t(key, { rate: displayRate.toFixed(2), unit: u.unit });
    }
  }

  const daysSpan = Math.max(1, differenceInDays(new Date(tMax), new Date(tMin)) || timeRangeDays || 1);

  // Sizing
  const screenW = Dimensions.get('window').width;
  const cardW = screenW - 40;
  const chartW = cardW - 8;
  const chartH = chartW * VB_H / VB_W;

  return (
    <View style={styles.container}>
      {/* Narrative card */}
      <View style={styles.narrativeCard}>
        <View style={styles.narrativeRow1}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={styles.narrativeLabel}>
            {paramDef.label.toUpperCase()} · {timeRangeDays === 0
              ? i18n.t('trends.allTime')
              : i18n.t('trends.lastDays', { days: timeRangeDays })}
          </Text>
        </View>
        {n > 1 ? (
          <View style={styles.deltaRow}>
            <Text style={[styles.deltaArrow, { color: deltaColor }]}>{deltaArrow}</Text>
            <Text style={[styles.deltaValue, { color: deltaColor }]}>{Math.abs(delta).toFixed(u.decimals)}</Text>
            <Text style={styles.deltaUnit}>
              {u.unit} {i18n.t('trends.deltaSuffix', { days: daysSpan })}
            </Text>
          </View>
        ) : (
          <View style={styles.deltaRow}>
            <Text style={styles.singleVal}>{latestVal.toFixed(u.decimals)}</Text>
            <Text style={styles.deltaUnit}>{u.unit}</Text>
          </View>
        )}
        <Text style={styles.narrativeText}>{narrative}{consumptionInline}</Text>
      </View>

      {/* Chart card */}
      <View style={styles.chartCard}>
        <Svg width={chartW} height={chartH} viewBox={`0 0 ${VB_W} ${VB_H}`}>
          {wHigh != null && (
            <Rect x={PX0} y={PY0} width={PLOT_W} height={Math.max(0, valToY(wHigh) - PY0)} fill={THEME.statusWarnBg} />
          )}
          {wLow != null && wHigh != null && (
            <Rect x={PX0} y={valToY(wHigh)} width={PLOT_W} height={Math.max(0, valToY(wLow) - valToY(wHigh))} fill={THEME.statusOkBg} />
          )}
          {wLow != null && (
            <Rect x={PX0} y={valToY(wLow)} width={PLOT_W} height={Math.max(0, PY1 - valToY(wLow))} fill={THEME.statusWarnBg} />
          )}

          {wLow != null && (
            <Line x1={PX0} y1={valToY(wLow)} x2={PX1} y2={valToY(wLow)} stroke={STATUS_COLORS.warning} strokeWidth={0.7} strokeDasharray="4 3" opacity={0.6} />
          )}
          {wHigh != null && (
            <Line x1={PX0} y1={valToY(wHigh)} x2={PX1} y2={valToY(wHigh)} stroke={STATUS_COLORS.warning} strokeWidth={0.7} strokeDasharray="4 3" opacity={0.6} />
          )}

          {wLow != null && (
            <SvgText x={32} y={valToY(wLow) + 3} fill={THEME.textSecondary} fontSize={9} textAnchor="end">
              {wLow.toFixed(u.decimals)}
            </SvgText>
          )}
          {wHigh != null && (
            <SvgText x={32} y={valToY(wHigh) + 3} fill={THEME.textSecondary} fontSize={9} textAnchor="end">
              {wHigh.toFixed(u.decimals)}
            </SvgText>
          )}

          {wcMarkers.map((x, i) => (
            <G key={`wc-${i}`}>
              <Line x1={x} y1={PY0} x2={x} y2={PY1} stroke={THEME.accent} strokeWidth={1} strokeDasharray="2 4" opacity={0.5} />
              <Circle cx={x} cy={14} r={4} fill={THEME.accent} />
            </G>
          ))}
          {doseMarkers.map((x, i) => (
            <G key={`dose-${i}`}>
              <Line x1={x} y1={PY0} x2={x} y2={PY1} stroke={STATUS_COLORS.warning} strokeWidth={1} strokeDasharray="2 4" opacity={0.5} />
              <Circle cx={x} cy={14} r={4} fill={STATUS_COLORS.warning} />
            </G>
          ))}

          {n > 1 && (
            <Polyline
              points={polyPoints}
              fill="none"
              stroke={THEME.accent}
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          <Circle cx={lastX} cy={lastY} r={3.5} fill="white" stroke={THEME.accent} strokeWidth={2} />

          {xLabels.map((l, i) => (
            <SvgText key={`xl-${i}`} x={l.x} y={262} fill={THEME.textSecondary} fontSize={9} textAnchor="middle">
              {l.label}
            </SvgText>
          ))}
        </Svg>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}><Text style={styles.statVal}>{latestVal.toFixed(u.decimals)}</Text><Text style={styles.statKey}>{i18n.t('chart.current')}</Text></View>
        <View style={styles.stat}><Text style={styles.statVal}>{minVal.toFixed(u.decimals)}</Text><Text style={styles.statKey}>{i18n.t('chart.min')}</Text></View>
        <View style={styles.stat}><Text style={styles.statVal}>{avgVal.toFixed(u.decimals)}</Text><Text style={styles.statKey}>{i18n.t('chart.avg')}</Text></View>
        <View style={styles.stat}><Text style={styles.statVal}>{maxVal.toFixed(u.decimals)}</Text><Text style={styles.statKey}>{i18n.t('chart.max')}</Text></View>
      </View>
    </View>
  );
}

// ---------- MultiView ----------

function MultiView({ datasets, waterChanges = [], unitPrefs = {}, onSelectSingle, onClearMulti, timeRangeDays = 30 }: Props) {
  const statuses: Status[] = datasets.map(ds => {
    if (ds.readings.length === 0 || !ds.thresholds) return 'ok';
    const latest = [...ds.readings].sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime())[0];
    return evaluateStatus(latest.value, ds.thresholds);
  });
  const nCrit = statuses.filter(s => s === 'critical').length;
  const nWarn = statuses.filter(s => s === 'warning').length;
  const nOk = statuses.filter(s => s === 'ok').length;

  let synth: string;
  if (nCrit > 0) {
    synth = i18n.t('trends.synthCritical', { critical: nCrit, warning: nWarn, ok: nOk });
  } else if (nWarn > 0) {
    synth = i18n.t('trends.synthWarning', { warning: nWarn, ok: nOk });
  } else {
    synth = i18n.t('trends.synthAllOk');
  }

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <Text style={styles.bannerLeft}>{i18n.t('trends.compared', { count: datasets.length })}</Text>
        {onClearMulti && (
          <TouchableOpacity onPress={onClearMulti} hitSlop={8}>
            <Text style={styles.bannerRight}>{i18n.t('trends.clear')}</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.synthCard}>
        <View style={styles.synthDots}>
          {statuses.map((s, i) => (
            <View key={i} style={[styles.synthDot, { backgroundColor: STATUS_COLORS[s] }]} />
          ))}
        </View>
        <Text style={styles.synthText}>{synth}</Text>
      </View>

      <View style={styles.miniList}>
        {datasets.map((ds, idx) => (
          <MiniCard
            key={ds.paramDef.key}
            ds={ds}
            unitPrefs={unitPrefs}
            onPress={() => onSelectSingle?.(ds.paramDef.key)}
            timeRangeDays={timeRangeDays}
            last={idx === datasets.length - 1}
            waterChanges={waterChanges}
          />
        ))}
      </View>

      <Text style={styles.footerHint}>{i18n.t('trends.tapForDetail')}</Text>
    </View>
  );
}

// ---------- MiniCard (multi mode) ----------

function MiniCard({
  ds, unitPrefs, onPress, last, waterChanges,
}: {
  ds: ParamData;
  unitPrefs: Record<string, string>;
  onPress?: () => void;
  timeRangeDays: number;
  last: boolean;
  waterChanges: WaterChange[];
}) {
  const { paramDef, readings, thresholds } = ds;
  const screenW = Dimensions.get('window').width;
  const cardW = screenW - 40;
  const sparkW = cardW - 28;
  const sparkH = 56;

  if (readings.length === 0) {
    return (
      <View style={[styles.miniRow, !last && styles.miniRowBorder]}>
        <View style={styles.miniHead}>
          <View style={styles.miniHeadLeft}>
            <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS.unknown }]} />
            <Text style={styles.miniName}>{paramDef.label}</Text>
          </View>
          <Text style={styles.miniEmpty}>{i18n.t('trends.noReadings')}</Text>
        </View>
      </View>
    );
  }

  const u = getDisplayUnit(paramDef, unitPrefs);
  const sorted = [...readings].sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime());
  const n = sorted.length;
  const latest = sorted[n - 1];
  const earliest = sorted[0];
  const displayVals = sorted.map(r => u.fromCanonical(r.value));
  const latestVal = displayVals[n - 1];
  const earliestVal = displayVals[0];
  const delta = latestVal - earliestVal;
  const minVal = Math.min(...displayVals);
  const maxVal = Math.max(...displayVals);

  const status: Status = thresholds ? evaluateStatus(latest.value, thresholds) : 'ok';
  const statusColor = STATUS_COLORS[status];
  const lineColor = status === 'critical' ? STATUS_COLORS.critical : status === 'warning' ? STATUS_COLORS.warning : STATUS_COLORS.ok;

  const wLow = thresholds?.warning_low != null ? u.fromCanonical(thresholds.warning_low) : null;
  const wHigh = thresholds?.warning_high != null ? u.fromCanonical(thresholds.warning_high) : null;

  const VB_W = 320, VB_H = 56;
  const PX0 = 4, PX1 = 314, PY0 = 8, PY1 = 48;

  let yMin: number; let yMax: number;
  if (wLow != null && wHigh != null) {
    const span = wHigh - wLow;
    yMin = Math.min(wLow - span * 0.3, minVal - span * 0.05);
    yMax = Math.max(wHigh + span * 0.3, maxVal + span * 0.05);
  } else {
    const dataPad = (maxVal - minVal) * 0.15 || Math.max(1, Math.abs(latestVal) * 0.05);
    yMin = minVal - dataPad;
    yMax = maxVal + dataPad;
  }
  const yRange = yMax - yMin || 1;
  const valToY = (v: number) => PY0 + ((yMax - v) / yRange) * (PY1 - PY0);

  const tMin = new Date(earliest.recorded_at).getTime();
  const tMax = new Date(latest.recorded_at).getTime();
  const tRange = (tMax - tMin) || 1;
  const timeToX = (t: number) => PX0 + ((t - tMin) / tRange) * (PX1 - PX0);

  const polyPoints = sorted.map((r, i) => {
    const x = n === 1 ? (PX0 + PX1) / 2 : timeToX(new Date(r.recorded_at).getTime());
    const y = valToY(displayVals[i]);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(' ');
  const lastX = n === 1 ? (PX0 + PX1) / 2 : PX1;
  const lastY = valToY(latestVal);

  // Water-change vertical markers in the sparkline
  const wcLines = (waterChanges ?? [])
    .map(w => new Date(w.changed_at).getTime())
    .filter(t => t >= tMin && t <= tMax && tRange > 1)
    .map(t => timeToX(t));

  const deltaArrow = delta > 0.0001 ? '▲' : delta < -0.0001 ? '▼' : '◆';
  const deltaColor = status === 'critical' ? STATUS_COLORS.critical : status === 'warning' ? STATUS_COLORS.warning : THEME.textSecondary;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={[styles.miniRow, !last && styles.miniRowBorder]}>
      <View style={styles.miniHead}>
        <View style={styles.miniHeadLeft}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={styles.miniName}>{paramDef.label}</Text>
        </View>
        <Text style={styles.miniVal}>
          {latestVal.toFixed(u.decimals)}
          <Text style={styles.miniUnit}> {u.unit}</Text>
        </Text>
      </View>
      <Svg width={sparkW} height={sparkH} viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="none">
        {wLow != null && wHigh != null && (
          <Rect
            x={PX0}
            y={valToY(wHigh)}
            width={PX1 - PX0}
            height={Math.max(0, valToY(wLow) - valToY(wHigh))}
            fill={THEME.statusOkBg}
            opacity={0.85}
          />
        )}
        {wcLines.map((x, i) => (
          <Line key={`wcl-${i}`} x1={x} y1={PY0} x2={x} y2={PY1} stroke={THEME.accent} strokeWidth={0.8} strokeDasharray="2 3" opacity={0.5} />
        ))}
        {n > 1 && (
          <Polyline
            points={polyPoints}
            fill="none"
            stroke={lineColor}
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        <Circle cx={lastX} cy={lastY} r={3} fill="white" stroke={lineColor} strokeWidth={1.8} />
      </Svg>
      <View style={styles.miniMeta}>
        <Text style={[styles.miniDelta, { color: deltaColor }]}>
          {n > 1 ? `${deltaArrow} ${Math.abs(delta).toFixed(u.decimals)} ${u.unit}` : ''}
        </Text>
        <Text style={styles.miniDetail}>{i18n.t('trends.detail')} ›</Text>
      </View>
    </TouchableOpacity>
  );
}

// ---------- Styles ----------

const styles = StyleSheet.create({
  container: { paddingHorizontal: 0 },
  empty: { height: 200, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyTitle: { color: THEME.text, fontSize: 16, fontWeight: '600', marginBottom: 6 },
  emptyHint: { color: THEME.textSecondary, fontSize: 13, textAlign: 'center', lineHeight: 19 },

  // Narrative card
  narrativeCard: {
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: THEME.surface,
    borderRadius: 18,
    padding: 18,
  },
  narrativeRow1: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  narrativeLabel: { color: THEME.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 0.6 },
  deltaRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 10 },
  deltaArrow: { fontSize: 22, fontWeight: '700' },
  deltaValue: { fontSize: 32, fontWeight: '700', letterSpacing: -0.6 },
  deltaUnit: { fontSize: 13, color: THEME.textSecondary, fontWeight: '500' },
  singleVal: { fontSize: 32, fontWeight: '700', color: THEME.text, letterSpacing: -0.6 },
  narrativeText: { fontSize: 14, color: THEME.text, lineHeight: 20 },

  // Chart card
  chartCard: {
    marginHorizontal: 20,
    marginTop: 10,
    backgroundColor: THEME.surfaceElevated,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 4,
    alignItems: 'center',
  },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: THEME.surfaceElevated,
    borderRadius: 14,
    paddingVertical: 14,
    marginHorizontal: 20,
    marginTop: 10,
  },
  stat: { alignItems: 'center' },
  statVal: { fontSize: 16, fontWeight: '700', color: THEME.text, fontVariant: ['tabular-nums'] },
  statKey: { fontSize: 11, color: THEME.textSecondary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },

  // Multi banner
  banner: {
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: THEME.accentSoft,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerLeft: { color: THEME.accent, fontSize: 12, fontWeight: '700' },
  bannerRight: { color: THEME.accent, fontSize: 11, fontWeight: '700' },

  // Multi synth
  synthCard: {
    marginHorizontal: 20,
    marginTop: 8,
    backgroundColor: THEME.surfaceElevated,
    borderRadius: 14,
    padding: 14,
  },
  synthDots: { flexDirection: 'row', gap: 4, marginBottom: 6 },
  synthDot: { width: 8, height: 8, borderRadius: 4 },
  synthText: { fontSize: 14, color: THEME.text, lineHeight: 20 },

  // Mini cards
  miniList: {
    marginHorizontal: 20,
    marginTop: 8,
    backgroundColor: THEME.surfaceElevated,
    borderRadius: 16,
    overflow: 'hidden',
  },
  miniRow: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 10 },
  miniRowBorder: { borderBottomWidth: 0.5, borderBottomColor: THEME.border },
  miniHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  miniHeadLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  miniName: { fontSize: 13, fontWeight: '700', color: THEME.text },
  miniVal: { fontSize: 17, fontWeight: '700', color: THEME.text, fontVariant: ['tabular-nums'], letterSpacing: -0.3 },
  miniUnit: { fontSize: 11, fontWeight: '500', color: THEME.textSecondary },
  miniMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
  miniDelta: { fontSize: 11, fontWeight: '700' },
  miniDetail: { fontSize: 11, fontWeight: '700', color: THEME.accent },
  miniEmpty: { fontSize: 12, color: THEME.textSecondary, marginTop: 4 },

  footerHint: { marginHorizontal: 20, marginTop: 8, color: THEME.textSecondary, fontSize: 11, textAlign: 'center' },
});

// Keep export for any legacy callers
export const LINE_COLORS = [
  '#5a8f8b', '#c4644a', '#c4943e', '#6b9e7a',
  '#8b6b9e', '#5a7fb8', '#b88a5a', '#9e6b7a',
];
