import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import { Reading, Status } from '@/src/models/types';
import { ParameterDef } from '@/src/models/types';
import { StatusBadge } from './StatusBadge';
import { THEME, STATUS_COLORS } from '@/src/constants/colors';
import i18n, { getDateLocale } from '@/src/i18n';

interface Props {
  paramDef: ParameterDef;
  reading: Reading | undefined;
  status: Status;
  onPress?: () => void;
}

const STATUS_BG: Record<Status, string> = {
  ok: THEME.surfaceElevated, warning: THEME.statusWarnBg, critical: THEME.statusCritBg, unknown: THEME.surface,
};

export function ParamCard({ paramDef, reading, status, onPress }: Props) {
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
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 14, padding: 16, width: '47%', marginBottom: 12 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  label: { color: THEME.textSecondary, fontSize: 13, fontWeight: '500', letterSpacing: 0.3 },
  value: { color: THEME.text, fontSize: 30, fontWeight: '700', letterSpacing: -0.5, fontVariant: ['tabular-nums'] },
  unit: { color: THEME.textSecondary, fontSize: 14, fontWeight: '400' },
  timeAgo: { color: THEME.textSecondary, fontSize: 11, marginTop: 8, fontWeight: '400' },
});
