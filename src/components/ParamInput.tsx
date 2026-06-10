import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { formatDistanceToNow } from 'date-fns';
import { ParameterDef, Thresholds, Reading, Status } from '@/src/models/types';
import { THEME, STATUS_COLORS, STATUS_TEXT_COLORS } from '@/src/constants/colors';
import { insertReading, getLastReading } from '@/src/db/queries';
import { getDisplayUnit } from '@/src/utils/units';
import { evaluateStatus } from '@/src/utils/thresholds';
import { TestTimer } from './TestTimer';
import i18n, { getDateLocale } from '@/src/i18n';

interface Props {
  paramDef: ParameterDef;
  visible: boolean;
  tankId: number;
  threshold?: Thresholds | null;
  unitPrefs?: Record<string, string>;
  onClose: () => void;
  onSaved: () => void;
}

export function ParamInput({ paramDef, visible, tankId, threshold, unitPrefs, onClose, onSaved }: Props) {
  // All state here is in DISPLAY units; canonical is only used at save time
  const displayUnit = getDisplayUnit(paramDef, unitPrefs ?? {});
  const defaultDisplay = displayUnit.fromCanonical(paramDef.defaultValue);
  const [value, setValue] = useState(defaultDisplay);
  const [lastReading, setLastReading] = useState<Reading | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      getLastReading(paramDef.key, tankId).then((last) => {
        setLastReading(last);
        // readings are stored canonical, convert to display
        setValue(last ? displayUnit.fromCanonical(last.value) : defaultDisplay);
      });
    }
  }, [visible, paramDef.key, displayUnit.unit]);

  // Physical bounds (canonical) → display space; all conversions are monotonic increasing
  const minDisplay = paramDef.min != null ? displayUnit.fromCanonical(paramDef.min) : -Infinity;
  const maxDisplay = paramDef.max != null ? displayUnit.fromCanonical(paramDef.max) : Infinity;
  const clamp = (v: number) => Math.min(maxDisplay, Math.max(minDisplay, v));
  const roundTo = (v: number) => Math.round(v * (10 ** displayUnit.decimals)) / (10 ** displayUnit.decimals);

  const adjust = (direction: 1 | -1) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setValue((v) => clamp(roundTo(v + direction * displayUnit.step)));
  };
  const adjustBig = (direction: 1 | -1) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setValue((v) => clamp(roundTo(v + direction * displayUnit.step * 10)));
  };

  // Live verdict for the value being entered
  const canonical = displayUnit.toCanonical(value);
  const status: Status = threshold ? evaluateStatus(canonical, threshold) : 'unknown';
  const valueColor = status === 'warning' || status === 'critical' ? STATUS_COLORS[status] : THEME.text;

  const fmt = (v: number) => `${displayUnit.fromCanonical(v).toFixed(displayUnit.decimals)}`;
  const withUnit = (s: string) => (displayUnit.unit ? `${s} ${displayUnit.unit}` : s);

  let previewText: string | null = null;
  if (threshold) {
    if (status === 'ok') previewText = i18n.t('log.previewOk');
    else if (status === 'critical') previewText = i18n.t('log.previewCritical');
    else if (status === 'warning') {
      const below = threshold.warning_low != null && canonical < threshold.warning_low;
      previewText = i18n.t(below ? 'log.previewLow' : 'log.previewHigh');
    }
  }

  let targetText: string | null = null;
  if (threshold) {
    const { warning_low: wl, warning_high: wh } = threshold;
    if (wl != null && wh != null) targetText = i18n.t('log.targetRange', { range: withUnit(`${fmt(wl)}–${fmt(wh)}`) });
    else if (wh != null) targetText = i18n.t('log.targetBelowMax', { value: withUnit(fmt(wh)) });
    else if (wl != null) targetText = i18n.t('log.targetAboveMin', { value: withUnit(fmt(wl)) });
  }

  const lastText = lastReading
    ? i18n.t('log.lastReading', {
        value: withUnit(displayUnit.fromCanonical(lastReading.value).toFixed(displayUnit.decimals)),
        time: formatDistanceToNow(new Date(lastReading.recorded_at), { addSuffix: true, locale: getDateLocale() }),
      })
    : i18n.t('log.noHistory');

  const handleSave = async () => {
    setSaving(true);
    // Convert display → canonical before storing
    await insertReading(paramDef.key, canonical, paramDef.unit, tankId);
    // The haptic should tell the truth: a reading in the warning or critical
    // zone must not feel like a success (peak-end rule).
    if (status === 'critical') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    else if (status === 'warning') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    else Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSaving(false); onSaved(); onClose();
  };

  const bigStep = roundTo(displayUnit.step * 10);
  const isNitrate = paramDef.key === 'nitrate';
  const isPhosphate = paramDef.key === 'phosphate';

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} hitSlop={16}><Text style={styles.cancelText}>{i18n.t('log.cancel')}</Text></TouchableOpacity>
          <Text style={styles.title}>{paramDef.label}</Text>
          <View style={{ width: 60 }} />
        </View>
        {/* Timers first: the physical sequence is shake → wait → read → enter */}
        {isNitrate && (
          <View style={styles.timers}>
            <Text style={styles.timerSectionLabel}>{i18n.t('timers.title')}</Text>
            <View style={styles.timerRow}><TestTimer seconds={30} label={i18n.t('timers.shake')} /></View>
            <View style={styles.timerRow}><TestTimer seconds={180} label={i18n.t('timers.wait')} /></View>
          </View>
        )}
        {isPhosphate && (
          <View style={styles.timers}>
            <Text style={styles.timerSectionLabel}>{i18n.t('timers.title')}</Text>
            <View style={styles.timerRow}><TestTimer seconds={30} label={i18n.t('timers.shake')} /></View>
          </View>
        )}
        <Text style={styles.lastReading}>{lastText}</Text>
        <View style={styles.valueContainer}>
          <Text style={[styles.valueText, { color: valueColor }]}>{value.toFixed(displayUnit.decimals)}</Text>
          {displayUnit.unit ? <Text style={styles.unitText}>{displayUnit.unit}</Text> : null}
          {previewText ? (
            <Text style={[styles.previewText, { color: STATUS_TEXT_COLORS[status] }]}>{previewText}</Text>
          ) : null}
          {targetText ? <Text style={styles.targetText}>{targetText}</Text> : null}
        </View>
        <View style={styles.steppers}>
          <TouchableOpacity style={styles.stepBtn} onPress={() => adjustBig(-1)} accessibilityRole="button" accessibilityLabel={`-${bigStep}`}><Text style={styles.stepLabel}>-{bigStep}</Text></TouchableOpacity>
          <TouchableOpacity style={styles.stepBtnMain} onPress={() => adjust(-1)} accessibilityRole="button" accessibilityLabel={`-${displayUnit.step}`}><Text style={styles.stepMainLabel}>-</Text></TouchableOpacity>
          <TouchableOpacity style={styles.stepBtnMain} onPress={() => adjust(1)} accessibilityRole="button" accessibilityLabel={`+${displayUnit.step}`}><Text style={styles.stepMainLabel}>+</Text></TouchableOpacity>
          <TouchableOpacity style={styles.stepBtn} onPress={() => adjustBig(1)} accessibilityRole="button" accessibilityLabel={`+${bigStep}`}><Text style={styles.stepLabel}>+{bigStep}</Text></TouchableOpacity>
        </View>
        <Text style={styles.stepHint}>{i18n.t('log.step')} {displayUnit.step}{displayUnit.unit ? ` ${displayUnit.unit}` : ''}</Text>
        <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.5 }]} onPress={handleSave} disabled={saving}>
          <Text style={styles.saveBtnText}>{saving ? i18n.t('log.saving') : i18n.t('log.save')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  scrollContent: { padding: 24, paddingBottom: 48 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, marginTop: 8 },
  cancelText: { color: THEME.textSecondary, fontSize: 16, width: 60 },
  title: { color: THEME.text, fontSize: 17, fontWeight: '600' },
  lastReading: { color: THEME.textSecondary, fontSize: 13, textAlign: 'center', marginBottom: 12 },
  valueContainer: { alignItems: 'center', marginBottom: 36 },
  valueText: { fontSize: 72, fontWeight: '700', fontVariant: ['tabular-nums'], letterSpacing: -2 },
  unitText: { color: THEME.textSecondary, fontSize: 20, marginTop: 4, fontWeight: '400' },
  previewText: { fontSize: 14, fontWeight: '600', marginTop: 10 },
  targetText: { color: THEME.textSecondary, fontSize: 12, marginTop: 4 },
  steppers: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 16 },
  stepBtn: { backgroundColor: THEME.surface, borderRadius: 16, width: 64, height: 64, alignItems: 'center', justifyContent: 'center' },
  stepBtnMain: { backgroundColor: THEME.accent, borderRadius: 16, width: 72, height: 72, alignItems: 'center', justifyContent: 'center' },
  stepLabel: { color: THEME.textSecondary, fontSize: 15, fontWeight: '600', fontVariant: ['tabular-nums'] },
  stepMainLabel: { color: THEME.surfaceElevated, fontSize: 28, fontWeight: '500' },
  stepHint: { color: THEME.textSecondary, fontSize: 12, textAlign: 'center', marginBottom: 40 },
  saveBtn: { backgroundColor: THEME.accent, borderRadius: 14, paddingVertical: 18, alignItems: 'center' },
  saveBtnText: { color: THEME.surfaceElevated, fontSize: 17, fontWeight: '600' },
  timers: { marginBottom: 24 },
  timerSectionLabel: { color: THEME.textSecondary, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  timerRow: { marginBottom: 10 },
});
