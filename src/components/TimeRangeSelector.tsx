import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { THEME } from '@/src/constants/colors';

export type TimeRange = 7 | 30 | 90 | 0;

interface Props {
  selected: TimeRange;
  onSelect: (range: TimeRange) => void;
}

const OPTIONS: { label: string; value: TimeRange }[] = [
  { label: '7d', value: 7 },
  { label: '30d', value: 30 },
  { label: '90d', value: 90 },
  { label: 'All', value: 0 },
];

export function TimeRangeSelector({ selected, onSelect }: Props) {
  return (
    <View style={styles.container}>
      {OPTIONS.map((opt) => (
        <TouchableOpacity
          key={opt.value}
          style={[styles.chip, selected === opt.value && styles.chipActive]}
          onPress={() => onSelect(opt.value)}
        >
          <Text style={[styles.text, selected === opt.value && styles.textActive]}>
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    marginVertical: 12,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: THEME.surface,
  },
  chipActive: {
    backgroundColor: THEME.accent,
  },
  text: {
    color: THEME.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  textActive: {
    color: THEME.surfaceElevated,
  },
});
