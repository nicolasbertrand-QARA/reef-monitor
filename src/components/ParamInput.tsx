import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ParameterDef } from '@/src/models/types';
import { THEME } from '@/src/constants/colors';
import { insertReading, getReadingHistory } from '@/src/db/queries';
import { TestTimer } from './TestTimer';
import i18n from '@/src/i18n';

interface Props { paramDef: ParameterDef; visible: boolean; onClose: () => void; onSaved: () => void; }

export function ParamInput({ paramDef, visible, onClose, onSaved }: Props) {
  const [value, setValue] = useState(paramDef.defaultValue);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      getReadingHistory(paramDef.key).then((readings) => {
        if (readings.length > 0) {
          setValue(readings[readings.length - 1].value);
        } else {
          setValue(paramDef.defaultValue);
        }
      });
    }
  }, [visible, paramDef.key]);

  const adjust = (direction: 1 | -1) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setValue((v) => Math.round((v + direction * paramDef.step) * (10 ** paramDef.decimals)) / (10 ** paramDef.decimals));
  };
  const adjustBig = (direction: 1 | -1) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const bigStep = paramDef.step * 10;
    setValue((v) => Math.round((v + direction * bigStep) * (10 ** paramDef.decimals)) / (10 ** paramDef.decimals));
  };
  const handleSave = async () => {
    setSaving(true);
    await insertReading(paramDef.key, value, paramDef.unit);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSaving(false); onSaved(); onClose();
  };

  const bigStep = paramDef.step * 10;
  const isNitrate = paramDef.key === 'nitrate';

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} hitSlop={16}><Text style={styles.cancelText}>{i18n.t('log.cancel')}</Text></TouchableOpacity>
          <Text style={styles.title}>{paramDef.label}</Text>
          <View style={{ width: 60 }} />
        </View>
        <View style={styles.valueContainer}>
          <Text style={styles.valueText}>{value.toFixed(paramDef.decimals)}</Text>
          {paramDef.unit ? <Text style={styles.unitText}>{paramDef.unit}</Text> : null}
        </View>
        <View style={styles.steppers}>
          <TouchableOpacity style={styles.stepBtn} onPress={() => adjustBig(-1)}><Text style={styles.stepLabel}>-{bigStep}</Text></TouchableOpacity>
          <TouchableOpacity style={styles.stepBtnMain} onPress={() => adjust(-1)}><Text style={styles.stepMainLabel}>-</Text></TouchableOpacity>
          <TouchableOpacity style={styles.stepBtnMain} onPress={() => adjust(1)}><Text style={styles.stepMainLabel}>+</Text></TouchableOpacity>
          <TouchableOpacity style={styles.stepBtn} onPress={() => adjustBig(1)}><Text style={styles.stepLabel}>+{bigStep}</Text></TouchableOpacity>
        </View>
        <Text style={styles.stepHint}>{i18n.t('log.step')} : {paramDef.step}{paramDef.unit ? ` ${paramDef.unit}` : ''}</Text>
        <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.5 }]} onPress={handleSave} disabled={saving}>
          <Text style={styles.saveBtnText}>{saving ? i18n.t('log.saving') : i18n.t('log.save')}</Text>
        </TouchableOpacity>
        {isNitrate && (
          <View style={styles.timers}>
            <Text style={styles.timerSectionLabel}>{i18n.t('timers.title')}</Text>
            <View style={styles.timerRow}><TestTimer seconds={30} label={i18n.t('timers.shake')} /></View>
            <View style={styles.timerRow}><TestTimer seconds={180} label={i18n.t('timers.wait')} /></View>
          </View>
        )}
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  scrollContent: { padding: 24, paddingBottom: 48 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, marginTop: 8 },
  cancelText: { color: THEME.textSecondary, fontSize: 16, width: 60 },
  title: { color: THEME.text, fontSize: 17, fontWeight: '600' },
  valueContainer: { alignItems: 'center', marginBottom: 48 },
  valueText: { color: THEME.text, fontSize: 72, fontWeight: '700', fontVariant: ['tabular-nums'], letterSpacing: -2 },
  unitText: { color: THEME.textSecondary, fontSize: 20, marginTop: 4, fontWeight: '400' },
  steppers: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 16 },
  stepBtn: { backgroundColor: THEME.surface, borderRadius: 16, width: 64, height: 64, alignItems: 'center', justifyContent: 'center' },
  stepBtnMain: { backgroundColor: THEME.accent, borderRadius: 16, width: 72, height: 72, alignItems: 'center', justifyContent: 'center' },
  stepLabel: { color: THEME.textSecondary, fontSize: 15, fontWeight: '600', fontVariant: ['tabular-nums'] },
  stepMainLabel: { color: THEME.surfaceElevated, fontSize: 28, fontWeight: '500' },
  stepHint: { color: THEME.textSecondary, fontSize: 12, textAlign: 'center', marginBottom: 48 },
  saveBtn: { backgroundColor: THEME.accent, borderRadius: 14, paddingVertical: 18, alignItems: 'center' },
  saveBtnText: { color: THEME.surfaceElevated, fontSize: 17, fontWeight: '600' },
  timers: { marginTop: 40 },
  timerSectionLabel: { color: THEME.textSecondary, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  timerRow: { marginBottom: 10 },
});
