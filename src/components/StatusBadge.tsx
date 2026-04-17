import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Status } from '@/src/models/types';
import { STATUS_COLORS } from '@/src/constants/colors';

interface Props {
  status: Status;
  size?: number;
}

export function StatusBadge({ status, size = 8 }: Props) {
  return (
    <View
      style={[
        styles.dot,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: STATUS_COLORS[status],
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  dot: {},
});
