import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ScrollView, View, Text, TouchableOpacity, TextInput, Alert, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { format } from 'date-fns';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { getParameterList, PARAMETERS } from '@/src/constants/parameters';
import { THEME, STATUS_COLORS } from '@/src/constants/colors';
import { ParameterKey, Reading, DosingEntry, WaterChange, Thresholds } from '@/src/models/types';
import { getReadingHistory, getThresholdForParam, deleteReading, updateReading, getDosingHistory, getWaterChanges } from '@/src/db/queries';
import { MultiTrendChart, LINE_COLORS } from '@/src/components/MultiTrendChart';
import { TimeRangeSelector, TimeRange } from '@/src/components/TimeRangeSelector';
import { calculateConsumptionRate } from '@/src/utils/consumption';
import { evaluateStatus } from '@/src/utils/thresholds';
import { isDoseRelevant } from '@/src/constants/dosingMap';
import { useVisibleParams } from '@/src/hooks/useVisibility';
import i18n, { getDateLocale } from '@/src/i18n';

export default function TrendsScreen() {
  const params = useLocalSearchParams<{ param?: string }>();
  const initialParam = (params.param as ParameterKey) || 'alkalinity';

  const [selectedSet, setSelectedSet] = useState<Set<ParameterKey>>(new Set([initialParam]));
  const [timeRange, setTimeRange] = useState<TimeRange>(30);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const { visible: visibleParams } = useVisibleParams();

  // Data for all selected params
  const [allReadings, setAllReadings] = useState<Map<ParameterKey, Reading[]>>(new Map());
  const [allThresholds, setAllThresholds] = useState<Map<ParameterKey, Thresholds>>(new Map());
  const [doses, setDoses] = useState<DosingEntry[]>([]);
  const [waterChanges, setWaterChanges] = useState<WaterChange[]>([]);

  const days = timeRange === 0 ? undefined : timeRange;
  const selectedArray = Array.from(selectedSet);
  const isSingle = selectedArray.length === 1;
  const primaryKey = selectedArray[0];
  const primaryDef = PARAMETERS[primaryKey];

  // Fetch data for all selected params
  useEffect(() => {
    (async () => {
      const readingsMap = new Map<ParameterKey, Reading[]>();
      const thresholdsMap = new Map<ParameterKey, Thresholds>();
      await Promise.all(selectedArray.map(async (key) => {
        const [readings, threshold] = await Promise.all([
          getReadingHistory(key, days),
          getThresholdForParam(key),
        ]);
        readingsMap.set(key, readings);
        if (threshold) thresholdsMap.set(key, threshold);
      }));
      setAllReadings(readingsMap);
      setAllThresholds(thresholdsMap);
    })();
  }, [selectedSet, days]);

  // Fetch dosing + water changes
  useEffect(() => {
    if (isSingle) {
      getDosingHistory(days).then((allDoses) => {
        setDoses(allDoses.filter((d) => isDoseRelevant(d.product, primaryKey)));
      });
    } else {
      setDoses([]);
    }
    getWaterChanges(days).then(setWaterChanges);
  }, [selectedSet, days]);

  const handleChipTap = (key: ParameterKey) => {
    setSelectedSet((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size > 1) next.delete(key); // don't allow empty selection
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // Build datasets for chart
  const datasets = selectedArray.map((key, i) => ({
    paramDef: PARAMETERS[key],
    readings: allReadings.get(key) ?? [],
    thresholds: allThresholds.get(key) ?? null,
    color: LINE_COLORS[i % LINE_COLORS.length],
  }));

  // Consumption rate (single alkalinity only)
  const consumptionRate = isSingle && primaryKey === 'alkalinity'
    ? calculateConsumptionRate(allReadings.get('alkalinity') ?? [])
    : null;

  // History list (single param only)
  const primaryReadings = isSingle ? [...(allReadings.get(primaryKey) ?? [])].reverse() : [];
  const primaryThreshold = isSingle ? allThresholds.get(primaryKey) ?? null : null;

  const refresh = useCallback(async () => {
    // Trigger re-fetch
    setSelectedSet((prev) => new Set(prev));
  }, []);

  const handleDelete = useCallback((reading: Reading) => {
    Alert.alert(
      i18n.t('trends.deleteTitle'),
      i18n.t('trends.deleteMessage', { value: reading.value.toFixed(primaryDef.decimals), unit: primaryDef.unit, date: format(new Date(reading.recorded_at), 'd MMM, HH:mm', { locale: getDateLocale() }) }),
      [{ text: i18n.t('log.cancel'), style: 'cancel' }, { text: i18n.t('trends.deleteConfirm'), style: 'destructive', onPress: async () => { await deleteReading(reading.id); refresh(); } }]
    );
  }, [primaryDef, refresh]);

  const scrollRef = useRef<ScrollView>(null);

  const handleEditStart = useCallback((reading: Reading) => {
    setEditingId(reading.id);
    setEditValue(reading.value.toFixed(primaryDef.decimals));
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 300);
  }, [primaryDef]);

  const handleEditSave = useCallback(async () => {
    if (editingId === null) return;
    const parsed = parseFloat(editValue);
    if (isNaN(parsed)) return;
    await updateReading(editingId, parsed); setEditingId(null); refresh();
  }, [editingId, editValue, refresh]);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
    <ScrollView ref={scrollRef} style={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      {/* Parameter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {getParameterList().filter((p) => visibleParams.has(p.key)).map((p, i) => {
          const isActive = selectedSet.has(p.key);
          const colorIdx = isActive ? selectedArray.indexOf(p.key) : -1;
          const chipColor = isActive && !isSingle ? LINE_COLORS[colorIdx % LINE_COLORS.length] : undefined;
          return (
            <TouchableOpacity
              key={p.key}
              style={[styles.chip, isActive && (chipColor ? { backgroundColor: chipColor } : styles.chipActive)]}
              onPress={() => handleChipTap(p.key)}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{p.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <TimeRangeSelector selected={timeRange} onSelect={setTimeRange} />

      <MultiTrendChart datasets={datasets} doses={doses} waterChanges={waterChanges} />

      {/* Alk consumption (single only) */}
      {consumptionRate !== null && (
        <View style={styles.consumptionCard}>
          <Text style={styles.consumptionLabel}>{i18n.t('trends.consumptionRate')}</Text>
          <Text style={styles.consumptionValue}>
            {consumptionRate > 0 ? '+' : ''}{consumptionRate}
            <Text style={styles.consumptionUnit}> dKH/{i18n.locale === 'en' ? 'day' : 'jour'}</Text>
          </Text>
          <Text style={styles.consumptionHint}>
            {consumptionRate < -1 ? i18n.t('trends.consumptionHigh') : consumptionRate < 0 ? i18n.t('trends.consumptionNormal') : consumptionRate === 0 ? i18n.t('trends.consumptionStable') : i18n.t('trends.consumptionRising')}
          </Text>
        </View>
      )}

      {/* History list (single param only) */}
      {isSingle && (
        <>
          <Text style={styles.logSectionLabel}>{i18n.t('trends.history')} ({primaryReadings.length})</Text>
          {primaryReadings.length === 0 ? (
            <Text style={styles.logEmpty}>{i18n.t('trends.noReadings')}</Text>
          ) : (
            <View style={styles.logSection}>
              {primaryReadings.map((reading, idx) => {
                const isEditing = editingId === reading.id;
                const status = primaryThreshold ? evaluateStatus(reading.value, primaryThreshold) : 'ok';
                return (
                  <View key={reading.id} style={[styles.logRow, idx < primaryReadings.length - 1 && styles.logRowBorder]}>
                    <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[status] }]} />
                    <View style={styles.logInfo}>
                      <Text style={styles.logDate}>{format(new Date(reading.recorded_at), 'EEEE d MMM, HH:mm', { locale: getDateLocale() })}</Text>
                      {isEditing ? (
                        <View style={styles.editRow}>
                          <TextInput style={styles.editInput} value={editValue} onChangeText={setEditValue} keyboardType="decimal-pad" autoFocus selectTextOnFocus />
                          <Text style={styles.editUnit}>{primaryDef.unit}</Text>
                          <TouchableOpacity onPress={handleEditSave} style={styles.editBtn}><FontAwesome name="check" size={14} color={THEME.accent} /></TouchableOpacity>
                          <TouchableOpacity onPress={() => setEditingId(null)} style={styles.editBtn}><FontAwesome name="times" size={14} color={THEME.textSecondary} /></TouchableOpacity>
                        </View>
                      ) : (
                        <Text style={styles.logValue}>{reading.value.toFixed(primaryDef.decimals)}<Text style={styles.logUnit}> {primaryDef.unit}</Text></Text>
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
        </>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
    </KeyboardAvoidingView>
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
