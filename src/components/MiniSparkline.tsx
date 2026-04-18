import React, { useState } from 'react';
import { View, LayoutChangeEvent } from 'react-native';
import { Reading, Thresholds } from '@/src/models/types';
import { STATUS_COLORS } from '@/src/constants/colors';

interface Props {
  readings: Reading[];
  thresholds: Thresholds | null;
  width?: number;
  height?: number;
  fill?: boolean; // if true, ignores width and fills container
}

const MID_GREY = '#b5ada3';

function getSparklineColor(value: number, thresholds: Thresholds | null): string {
  if (!thresholds) return MID_GREY;

  const { warning_low, warning_high, critical_low, critical_high } = thresholds;

  if (critical_low !== null && value <= critical_low) return STATUS_COLORS.critical;
  if (critical_high !== null && value >= critical_high) return STATUS_COLORS.critical;

  if (warning_low !== null && value < warning_low) {
    if (critical_low !== null && critical_low < warning_low) {
      const t = Math.min(1, (warning_low - value) / (warning_low - critical_low));
      return interpolateColor(STATUS_COLORS.warning, STATUS_COLORS.critical, t);
    }
    return STATUS_COLORS.warning;
  }
  if (warning_high !== null && value > warning_high) {
    if (critical_high !== null && critical_high > warning_high) {
      const t = Math.min(1, (value - warning_high) / (critical_high - warning_high));
      return interpolateColor(STATUS_COLORS.warning, STATUS_COLORS.critical, t);
    }
    return STATUS_COLORS.warning;
  }

  return MID_GREY;
}

function interpolateColor(c1: string, c2: string, t: number): string {
  const r1 = parseInt(c1.slice(1, 3), 16), g1 = parseInt(c1.slice(3, 5), 16), b1 = parseInt(c1.slice(5, 7), 16);
  const r2 = parseInt(c2.slice(1, 3), 16), g2 = parseInt(c2.slice(3, 5), 16), b2 = parseInt(c2.slice(5, 7), 16);
  const r = Math.round(r1 + (r2 - r1) * t), g = Math.round(g1 + (g2 - g1) * t), b = Math.round(b1 + (b2 - b1) * t);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export function MiniSparkline({ readings, thresholds, width: fixedWidth = 70, height = 30, fill }: Props) {
  const [containerWidth, setContainerWidth] = useState(0);

  if (readings.length < 2) return <View style={{ height }} />;

  const width = fill ? containerWidth : fixedWidth;

  const onLayout = (e: LayoutChangeEvent) => {
    if (fill) setContainerWidth(e.nativeEvent.layout.width);
  };

  const data = readings.slice(-20);
  const values = data.map((r) => r.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pad = 3;

  const latest = values[values.length - 1];
  const color = getSparklineColor(latest, thresholds);

  if (width === 0 && fill) {
    return <View style={{ height }} onLayout={onLayout} />;
  }

  const points = data.map((r, i) => ({
    x: pad + (i / (data.length - 1)) * (width - pad * 2),
    y: pad + (1 - (r.value - min) / range) * (height - pad * 2),
  }));

  return (
    <View style={{ width: fill ? '100%' : width, height, position: 'relative' }} onLayout={onLayout}>
      {points.map((pt, i) => {
        if (i === 0) return null;
        const prev = points[i - 1];
        const dx = pt.x - prev.x;
        const dy = pt.y - prev.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);

        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: prev.x,
              top: prev.y - 1,
              width: length,
              height: 2,
              backgroundColor: color,
              borderRadius: 1,
              transform: [{ rotate: `${angle}deg` }],
              transformOrigin: 'left center',
            }}
          />
        );
      })}
    </View>
  );
}
