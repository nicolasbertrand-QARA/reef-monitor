import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import { Reading, Status, Thresholds } from '@/src/models/types';
import { ParameterDef } from '@/src/models/types';
import { StatusBadge } from './StatusBadge';
import { MiniSparkline } from './MiniSparkline';
import { THEME } from '@/src/constants/colors';
import i18n, { getDateLocale } from '@/src/i18n';

interface Props {
  paramDef: ParameterDef;
  reading: Reading | undefined;
  status: Status;
  history?: Reading[];
  thresholds?: Thresholds | null;
  onPress?: () => void;
}

const STATUS_BG: Record<Status, string> = {
  ok: THEME.surfaceElevated, warning: THEME.statusWarnBg, critical: THEME.statusCritBg, unknown: THEME.surface,
};

export function ParamCard({ paramDef, reading, status, history, thresholds, onPress }: Props) {
  const timeAgo = reading
    ? formatDistanceToNow(new Date(reading.recorded_at), { addSuffix: true, locale: getDateLocale() })
    : i18n.t('dashboard.noData');

  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: STATUS_BG[status] }]} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.topRow}>
        <Text style={styles.label}>{paramDef.label}</Text>
        <StatusBadge status={status} />
      </View>
      <Text style={styles.value}>
        {reading ? reading.value.toFixed(paramDef.decimals) : '—'}
        {paramDef.unit ? <Text style={styles.unit}> {paramDef.unit}</Text> : null}
      </Text>
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
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  label: { color: THEME.textSecondary, fontSize: 13, fontWeight: '500', letterSpacing: 0.3 },
  value: { color: THEME.text, fontSize: 30, fontWeight: '700', letterSpacing: -0.5, fontVariant: ['tabular-nums'] },
  unit: { color: THEME.textSecondary, fontSize: 14, fontWeight: '400' },
  timeAgo: { color: THEME.textSecondary, fontSize: 11, marginTop: 2, fontWeight: '400' },
  sparklineContainer: { marginTop: 8, marginHorizontal: -6 },
});
