import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { THEME } from '@/src/constants/colors';
import i18n from '@/src/i18n';

export type TimeRange = 7 | 30 | 90 | 0;

interface Props {
  selected: TimeRange;
  onSelect: (range: TimeRange) => void;
}

const VALUES: TimeRange[] = [7, 30, 90, 0];

export function TimeRangeSelector({ selected, onSelect }: Props) {
  return (
    <View style={styles.container}>
      {VALUES.map((value) => {
        const label = value === 0 ? i18n.t('trends.rangeAll') : i18n.t('trends.rangeDays', { n: value });
        return (
          <TouchableOpacity
            key={value}
            style={[styles.chip, selected === value && styles.chipActive]}
            onPress={() => onSelect(value)}
            accessibilityRole="button"
            accessibilityState={{ selected: selected === value }}
            hitSlop={{ top: 8, bottom: 8 }}
          >
            <Text style={[styles.text, selected === value && styles.textActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
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
