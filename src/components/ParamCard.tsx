import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { formatDistanceToNow } from 'date-fns';
import { Reading, Status, Thresholds, ParameterDef } from '@/src/models/types';
import { StatusBadge } from './StatusBadge';
import { MiniSparkline } from './MiniSparkline';
import { THEME, STATUS_TEXT_COLORS } from '@/src/constants/colors';
import { getDisplayUnit } from '@/src/utils/units';
import i18n, { getDateLocale } from '@/src/i18n';

interface Props {
  paramDef: ParameterDef;
  reading: Reading | undefined;
  status: Status;
  history?: Reading[];
  thresholds?: Thresholds | null;
  unitPrefs?: Record<string, string>;
  onPress?: () => void;
}

const STATUS_BG: Record<Status, string> = {
  ok: THEME.surfaceElevated, warning: THEME.statusWarnBg, critical: THEME.statusCritBg, unknown: THEME.surface,
};

const A11Y_STATUS_KEY: Record<Status, string> = {
  ok: 'a11y.statusOk', warning: 'a11y.statusWarning', critical: 'a11y.statusCritical', unknown: 'a11y.statusUnknown',
};

export function ParamCard({ paramDef, reading, status, history, thresholds, unitPrefs, onPress }: Props) {
  const timeAgo = reading
    ? formatDistanceToNow(new Date(reading.recorded_at), { addSuffix: true, locale: getDateLocale() })
    : i18n.t('dashboard.noData');

  const u = getDisplayUnit(paramDef, unitPrefs ?? {});

  // Non-color status channel: "low"/"high" word when out of range
  const outOfRange = status === 'warning' || status === 'critical';
  const below = outOfRange && reading && thresholds
    ? (thresholds.critical_low != null && reading.value <= thresholds.critical_low) ||
      (thresholds.warning_low != null && reading.value < thresholds.warning_low)
    : false;
  const directionWord = outOfRange ? i18n.t(below ? 'dashboard.low' : 'dashboard.high') : null;

  const valueText = reading ? `${u.fromCanonical(reading.value).toFixed(u.decimals)} ${u.unit}`.trim() : i18n.t('dashboard.noData');
  const a11yLabel = `${paramDef.label}, ${valueText}, ${i18n.t(A11Y_STATUS_KEY[status])}, ${timeAgo}`;

  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: STATUS_BG[status] }]} onPress={onPress} activeOpacity={0.7}
      accessibilityRole="button" accessibilityLabel={a11yLabel} accessibilityHint={i18n.t('a11y.logReading')}>
      <View style={styles.topRow}>
        <Text style={styles.label}>{paramDef.label}</Text>
        <View style={styles.statusGroup}>
          {directionWord ? (
            <Text style={[styles.directionWord, { color: STATUS_TEXT_COLORS[status === 'critical' ? 'critical' : 'warning'] }]}>{directionWord}</Text>
          ) : null}
          <StatusBadge status={status} />
        </View>
      </View>
      {reading ? (
        <Text style={styles.value}>
          {u.fromCanonical(reading.value).toFixed(u.decimals)}
          {u.unit ? <Text style={styles.unit}> {u.unit}</Text> : null}
        </Text>
      ) : (
        <View style={styles.emptyValueRow}>
          <Text style={styles.value}>—</Text>
          <FontAwesome name="plus-circle" size={18} color={THEME.accent} />
        </View>
      )}
      <Text style={styles.timeAgo}>{timeAgo}</Text>
      {history && history.length >= 2 && (
        <View style={styles.sparklineContainer}>
          <MiniSparkline readings={history} thresholds={thresholds ?? null} width={0} height={20} fill />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 14, paddingTop: 16, paddingHorizontal: 16, paddingBottom: 8, width: '47%', marginBottom: 12 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 },
  statusGroup: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  directionWord: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  label: { color: THEME.textSecondary, fontSize: 13, fontWeight: '500', letterSpacing: 0.3 },
  value: { color: THEME.text, fontSize: 30, fontWeight: '700', letterSpacing: -0.5, fontVariant: ['tabular-nums'] },
  unit: { color: THEME.textSecondary, fontSize: 14, fontWeight: '400' },
  timeAgo: { color: THEME.textSecondary, fontSize: 11, marginTop: 2, fontWeight: '400' },
  emptyValueRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sparklineContainer: { marginTop: 8, marginHorizontal: -6 },
});
