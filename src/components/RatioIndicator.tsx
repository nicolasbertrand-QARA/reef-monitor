import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Status } from '@/src/models/types';
import { StatusBadge } from './StatusBadge';
import { THEME, STATUS_COLORS } from '@/src/constants/colors';

interface Props {
  title: string;
  message: string;
  status: Status;
}

const ALERT_BG: Record<string, string> = {
  warning: THEME.statusWarnBg,
  critical: THEME.statusCritBg,
};

export function RatioIndicator({ title, message, status }: Props) {
  if (status === 'unknown' || status === 'ok') return null;

  return (
    <View style={[styles.container, { backgroundColor: ALERT_BG[status] ?? THEME.surface }]}>
      <View style={styles.row}>
        <StatusBadge status={status} size={6} />
        <Text style={[styles.title, { color: STATUS_COLORS[status] }]}>{title}</Text>
      </View>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
  },
  message: {
    color: THEME.textSecondary,
    fontSize: 12,
    marginLeft: 14,
    lineHeight: 17,
  },
});
