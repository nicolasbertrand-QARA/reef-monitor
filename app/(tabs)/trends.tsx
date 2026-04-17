import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, View, Text, TouchableOpacity, TextInput, Alert, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { format } from 'date-fns';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { getParameterList, PARAMETERS } from '@/src/constants/parameters';
import { THEME, STATUS_COLORS } from '@/src/constants/colors';
import { ParameterKey, Reading } from '@/src/models/types';
import { useReadingHistory } from '@/src/hooks/useParameters';
import { getThresholdForParam, deleteReading, updateReading } from '@/src/db/queries';
import { Thresholds } from '@/src/models/types';
import { TrendChart } from '@/src/components/TrendChart';
import { TimeRangeSelector, TimeRange } from '@/src/components/TimeRangeSelector';
import { calculateConsumptionRate } from '@/src/utils/consumption';
import { evaluateStatus } from '@/src/utils/thresholds';
import i18n, { getDateLocale } from '@/src/i18n';

export default function TrendsScreen() {
  const params = useLocalSearchParams<{ param?: string }>();
  const [selected, setSelected] = useState<ParameterKey>((params.param as ParameterKey) || 'alkalinity');
  const [timeRange, setTimeRange] = useState<TimeRange>(30);
  const [thresholds, setThresholds] = useState<Thresholds | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const days = timeRange === 0 ? undefined : timeRange;
  const { readings, refresh } = useReadingHistory(selected, days);
  const paramDef = PARAMETERS[selected];

  useEffect(() => { getThresholdForParam(selected).then(setThresholds); }, [selected]);

  const consumptionRate = selected === 'alkalinity' ? calculateConsumptionRate(readings) : null;

  const handleDelete = useCallback((reading: Reading) => {
    Alert.alert(
      i18n.t('trends.deleteTitle'),
      i18n.t('trends.deleteMessage', { value: reading.value.toFixed(paramDef.decimals), unit: paramDef.unit, date: format(new Date(reading.recorded_at), 'd MMM, HH:mm', { locale: getDateLocale() }) }),
      [{ text: i18n.t('log.cancel'), style: 'cancel' }, { text: i18n.t('trends.deleteConfirm'), style: 'destructive', onPress: async () => { await deleteReading(reading.id); refresh(); } }]
    );
  }, [paramDef, refresh]);

  const handleEditStart = useCallback((reading: Reading) => { setEditingId(reading.id); setEditValue(reading.value.toFixed(paramDef.decimals)); }, [paramDef]);
  const handleEditSave = useCallback(async () => {
    if (editingId === null) return;
    const parsed = parseFloat(editValue);
    if (isNaN(parsed)) return;
    await updateReading(editingId, parsed); setEditingId(null); refresh();
  }, [editingId, editValue, refresh]);

  const sortedReadings = [...readings].reverse();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {getParameterList().map((p) => (
          <TouchableOpacity key={p.key} style={[styles.chip, selected === p.key && styles.chipActive]} onPress={() => setSelected(p.key)}>
            <Text style={[styles.chipText, selected === p.key && styles.chipTextActive]}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <TimeRangeSelector selected={timeRange} onSelect={setTimeRange} />
      <TrendChart readings={readings} paramDef={paramDef} thresholds={thresholds} />

      {selected === 'alkalinity' && consumptionRate !== null && (
        <View style={styles.consumptionCard}>
          <Text style={styles.consumptionLabel}>{i18n.t('trends.consumptionRate')}</Text>
          <Text style={styles.consumptionValue}>
            {consumptionRate > 0 ? '+' : ''}{consumptionRate}
            <Text style={styles.consumptionUnit}> dKH/{i18n.t('chart.current').charAt(0) === 'C' ? 'day' : 'jour'}</Text>
          </Text>
          <Text style={styles.consumptionHint}>
            {consumptionRate < -1 ? i18n.t('trends.consumptionHigh') : consumptionRate < 0 ? i18n.t('trends.consumptionNormal') : consumptionRate === 0 ? i18n.t('trends.consumptionStable') : i18n.t('trends.consumptionRising')}
          </Text>
        </View>
      )}

      <Text style={styles.logSectionLabel}>{i18n.t('trends.history')} ({sortedReadings.length})</Text>
      {sortedReadings.length === 0 ? (
        <Text style={styles.logEmpty}>{i18n.t('trends.noReadings')}</Text>
      ) : (
        <View style={styles.logSection}>
          {sortedReadings.map((reading, idx) => {
            const isEditing = editingId === reading.id;
            const status = thresholds ? evaluateStatus(reading.value, thresholds) : 'ok';
            return (
              <View key={reading.id} style={[styles.logRow, idx < sortedReadings.length - 1 && styles.logRowBorder]}>
                <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[status] }]} />
                <View style={styles.logInfo}>
                  <Text style={styles.logDate}>{format(new Date(reading.recorded_at), 'EEEE d MMM, HH:mm', { locale: getDateLocale() })}</Text>
                  {isEditing ? (
                    <View style={styles.editRow}>
                      <TextInput style={styles.editInput} value={editValue} onChangeText={setEditValue} keyboardType="decimal-pad" autoFocus selectTextOnFocus />
                      <Text style={styles.editUnit}>{paramDef.unit}</Text>
                      <TouchableOpacity onPress={handleEditSave} style={styles.editBtn}><FontAwesome name="check" size={14} color={THEME.accent} /></TouchableOpacity>
                      <TouchableOpacity onPress={() => setEditingId(null)} style={styles.editBtn}><FontAwesome name="times" size={14} color={THEME.textSecondary} /></TouchableOpacity>
                    </View>
                  ) : (
                    <Text style={styles.logValue}>{reading.value.toFixed(paramDef.decimals)}<Text style={styles.logUnit}> {paramDef.unit}</Text></Text>
                  )}
                </View>
                {!isEditing && (
                  <View style={styles.logActions}>
                    <TouchableOpacity onPress={() => handleEditStart(reading)} hitSlop={12} style={styles.actionBtn}><FontAwesome name="pencil" size={14} color={THEME.textSecondary} /></TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(reading)} hitSlop={12} style={styles.actionBtn}><FontAwesome name="trash-o" size={14} color={THEME.textSecondary} /></TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  chips: { paddingHorizontal: 20, paddingVertical: 12, gap: 8, flexDirection: 'row' },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: THEME.surface },
  chipActive: { backgroundColor: THEME.accent },
  chipText: { color: THEME.textSecondary, fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: THEME.surfaceElevated },
  consumptionCard: { backgroundColor: THEME.surfaceElevated, borderRadius: 14, padding: 18, marginHorizontal: 20, marginTop: 12 },
  consumptionLabel: { color: THEME.textSecondary, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 },
  consumptionValue: { color: THEME.text, fontSize: 28, fontWeight: '700', fontVariant: ['tabular-nums'] },
  consumptionUnit: { fontSize: 14, fontWeight: '400', color: THEME.textSecondary },
  consumptionHint: { color: THEME.textSecondary, fontSize: 12, marginTop: 8, lineHeight: 17 },
  logSectionLabel: { color: THEME.textSecondary, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, paddingHorizontal: 20, marginTop: 28, marginBottom: 10 },
  logEmpty: { color: THEME.textSecondary, fontSize: 14, paddingHorizontal: 20 },
  logSection: { backgroundColor: THEME.surfaceElevated, marginHorizontal: 20, borderRadius: 14, overflow: 'hidden' },
  logRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  logRowBorder: { borderBottomWidth: 0.5, borderBottomColor: THEME.border },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 12 },
  logInfo: { flex: 1 },
  logDate: { color: THEME.textSecondary, fontSize: 12, marginBottom: 2 },
  logValue: { color: THEME.text, fontSize: 17, fontWeight: '600', fontVariant: ['tabular-nums'] },
  logUnit: { fontSize: 13, fontWeight: '400', color: THEME.textSecondary },
  logActions: { flexDirection: 'row', gap: 16 },
  actionBtn: { padding: 4 },
  editRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  editInput: { backgroundColor: THEME.background, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, color: THEME.text, fontSize: 17, fontWeight: '600', fontVariant: ['tabular-nums'], minWidth: 80 },
  editUnit: { color: THEME.textSecondary, fontSize: 13 },
  editBtn: { padding: 6 },
});
