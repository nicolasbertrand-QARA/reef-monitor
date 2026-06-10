import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { formatDistanceToNow } from 'date-fns';
import { Reading, Status, Thresholds, ParameterDef } from '@/src/models/types';
import { StatusBadge } from './StatusBadge';
import { MiniSparkline } from './MiniSparkline';
import { THEME } from '@/src/constants/colors';
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

export function ParamCard({ paramDef, reading, status, history, thresholds, unitPrefs, onPress }: Props) {
  const timeAgo = reading
    ? formatDistanceToNow(new Date(reading.recorded_at), { addSuffix: true, locale: getDateLocale() })
    : i18n.t('dashboard.noData');

  const u = getDisplayUnit(paramDef, unitPrefs ?? {});

  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: STATUS_BG[status] }]} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.topRow}>
        <Text style={styles.label}>{paramDef.label}</Text>
        <StatusBadge status={status} />
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
  label: { color: THEME.textSecondary, fontSize: 13, fontWeight: '500', letterSpacing: 0.3 },
  value: { color: THEME.text, fontSize: 30, fontWeight: '700', letterSpacing: -0.5, fontVariant: ['tabular-nums'] },
  unit: { color: THEME.textSecondary, fontSize: 14, fontWeight: '400' },
  timeAgo: { color: THEME.textSecondary, fontSize: 11, marginTop: 2, fontWeight: '400' },
  emptyValueRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sparklineContainer: { marginTop: 8, marginHorizontal: -6 },
});
