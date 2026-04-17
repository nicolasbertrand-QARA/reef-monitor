import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { THEME } from '@/src/constants/colors';
import i18n from '@/src/i18n';

interface Props { seconds: number; label: string; }

export function TestTimer({ seconds, label }: Props) {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { return () => { if (intervalRef.current) clearInterval(intervalRef.current); }; }, []);

  const start = () => {
    setRemaining(seconds); setRunning(true); setFinished(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!); intervalRef.current = null;
          setRunning(false); setFinished(true);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const reset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null; setRemaining(seconds); setRunning(false); setFinished(false);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const progress = 1 - remaining / seconds;

  return (
    <View style={[styles.container, finished && styles.containerFinished]}>
      <View style={styles.info}>
        <Text style={[styles.label, finished && styles.labelFinished]}>{label}</Text>
        <Text style={[styles.time, finished && styles.timeFinished]}>{formatTime(remaining)}</Text>
      </View>
      {running && (<View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress * 100}%` }]} /></View>)}
      <TouchableOpacity style={[styles.btn, running && styles.btnRunning, finished && styles.btnFinished]} onPress={running || finished ? reset : start}>
        <Text style={[styles.btnText, finished && styles.btnTextFinished]}>
          {finished ? i18n.t('timers.done') : running ? i18n.t('timers.cancel') : i18n.t('timers.start')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: THEME.surfaceElevated, borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  containerFinished: { backgroundColor: THEME.statusOkBg },
  info: { flex: 1 },
  label: { color: THEME.textSecondary, fontSize: 12, fontWeight: '500', marginBottom: 2 },
  labelFinished: { color: '#6b9e7a' },
  time: { color: THEME.text, fontSize: 24, fontWeight: '700', fontVariant: ['tabular-nums'], letterSpacing: -0.5 },
  timeFinished: { color: '#6b9e7a' },
  progressTrack: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, backgroundColor: THEME.surface, borderBottomLeftRadius: 14, borderBottomRightRadius: 14, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: THEME.accent, borderRadius: 3 },
  btn: { backgroundColor: THEME.accent, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  btnRunning: { backgroundColor: THEME.surface },
  btnFinished: { backgroundColor: '#6b9e7a' },
  btnText: { color: THEME.surfaceElevated, fontSize: 14, fontWeight: '600' },
  btnTextFinished: { color: THEME.surfaceElevated },
});
