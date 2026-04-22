import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, TextInput, Switch, StyleSheet, Alert } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Paths, File } from 'expo-file-system/next';
import { getParameterList } from '@/src/constants/parameters';
import { THEME } from '@/src/constants/colors';
import { Thresholds, ParameterKey, Tank } from '@/src/models/types';
import {
  getThresholds, updateThreshold, getAllReadingsForExport, importReadingsFromCSV,
  getAllParamVisibility, setParamVisibility,
  createTank, renameTank, deleteTank,
} from '@/src/db/queries';
import { useTank } from '@/src/hooks/useTank';
import i18n from '@/src/i18n';

export default function SettingsScreen() {
  const { tanks, activeTank, refreshTanks } = useTank();
  const tankId = activeTank?.id ?? 1;
  const [thresholds, setThresholds] = useState<Thresholds[]>([]);
  const [editing, setEditing] = useState<ParameterKey | null>(null);
  const [visibility, setVisibility] = useState<Record<string, boolean>>({});
  const [editingTankId, setEditingTankId] = useState<number | null>(null);
  const [tankName, setTankName] = useState('');
  const paramList = getParameterList();

  useEffect(() => {
    getThresholds(tankId).then(setThresholds);
    getAllParamVisibility(tankId).then(setVisibility);
  }, [tankId]);

  const toggleParam = async (key: ParameterKey) => {
    const newVal = !visibility[key];
    await setParamVisibility(key, tankId, newVal);
    setVisibility((prev) => ({ ...prev, [key]: newVal }));
  };

  const handleExport = async () => {
    const readings = await getAllReadingsForExport(tankId);
    if (readings.length === 0) { Alert.alert(i18n.t('settings.noDataExport'), i18n.t('settings.noDataExportMsg')); return; }
    const csv = ['parameter,value,unit,recorded_at,notes', ...readings.map((r) => `${r.parameter},${r.value},${r.unit},${r.recorded_at},${r.notes ?? ''}`)].join('\n');
    const file = new File(Paths.document, 'reef-monitor-export.csv');
    file.create(); file.write(csv);
    await Sharing.shareAsync(file.uri);
  };

  const handleImport = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'text/csv', copyToCacheDirectory: true });
    if (result.canceled || !result.assets?.[0]) return;
    const file = new File(result.assets[0].uri);
    const content = await file.text();
    try {
      const count = await importReadingsFromCSV(content, tankId);
      Alert.alert(i18n.t('settings.importSuccess'), i18n.t('settings.importSuccessMsg', { count }));
    } catch (e: any) {
      Alert.alert(i18n.t('settings.importError'), e.message);
    }
  };

  const handleAddTank = () => {
    Alert.prompt(
      i18n.t('tanks.add'),
      i18n.t('tanks.namePrompt'),
      async (name) => {
        if (!name?.trim()) return;
        await createTank(name.trim());
        refreshTanks();
      }
    );
  };

  const handleRenameTank = (tank: Tank) => {
    Alert.prompt(
      i18n.t('tanks.rename'),
      i18n.t('tanks.namePrompt'),
      async (name) => {
        if (!name?.trim()) return;
        await renameTank(tank.id, name.trim());
        refreshTanks();
      },
      'plain-text',
      tank.name
    );
  };

  const handleDeleteTank = (tank: Tank) => {
    if (tanks.length <= 1) {
      Alert.alert(i18n.t('tanks.cantDeleteLast'));
      return;
    }
    Alert.alert(
      i18n.t('tanks.delete'),
      i18n.t('tanks.deleteConfirm', { name: tank.name }),
      [
        { text: i18n.t('log.cancel'), style: 'cancel' },
        { text: i18n.t('tanks.delete'), style: 'destructive', onPress: async () => { await deleteTank(tank.id); refreshTanks(); } },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Tank management */}
      <Text style={styles.sectionTitle}>{i18n.t('tanks.title')}</Text>
      <View style={styles.section}>
        {tanks.map((tank, idx) => (
          <View key={tank.id} style={[styles.tankRow, idx < tanks.length - 1 && styles.rowBorder]}>
            <FontAwesome name="tint" size={14} color={tank.id === tankId ? THEME.accent : THEME.textSecondary} />
            <Text style={[styles.tankName, tank.id === tankId && styles.tankNameActive]}>{tank.name}</Text>
            <TouchableOpacity onPress={() => handleRenameTank(tank)} hitSlop={8} style={styles.tankAction}>
              <FontAwesome name="pencil" size={14} color={THEME.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteTank(tank)} hitSlop={8} style={styles.tankAction}>
              <FontAwesome name="trash-o" size={14} color={THEME.textSecondary} />
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity style={styles.addTankRow} onPress={handleAddTank}>
          <FontAwesome name="plus" size={14} color={THEME.accent} />
          <Text style={styles.addTankText}>{i18n.t('tanks.add')}</Text>
        </TouchableOpacity>
      </View>

      {/* Parameters */}
      <Text style={styles.sectionTitle}>{i18n.t('settings.parameters')}</Text>
      <View style={styles.section}>
        {paramList.map((paramDef, idx) => {
          const t = thresholds.find((th) => th.parameter === paramDef.key);
          const isEditing = editing === paramDef.key;
          const isLast = idx === paramList.length - 1;
          const isVisible = visibility[paramDef.key] ?? true;
          return (
            <View key={paramDef.key}>
              <View style={[styles.row, !isLast && styles.rowBorder]}>
                <Switch value={isVisible} onValueChange={() => toggleParam(paramDef.key)}
                  trackColor={{ false: THEME.surface, true: THEME.accent }} thumbColor={THEME.surfaceElevated} style={styles.toggle} />
                <TouchableOpacity style={styles.rowContent} onPress={() => setEditing(isEditing ? null : paramDef.key)}>
                  <Text style={[styles.rowLabel, !isVisible && styles.rowLabelDisabled]}>{paramDef.label}</Text>
                  <Text style={styles.rowValue}>{t ? `${t.warning_low ?? '—'} – ${t.warning_high ?? '—'} ${paramDef.unit}` : '—'}</Text>
                  <FontAwesome name={isEditing ? 'chevron-up' : 'chevron-down'} size={12} color={THEME.textSecondary} />
                </TouchableOpacity>
              </View>
              {isEditing && t && (
                <ThresholdEditor threshold={{ ...t, tank_id: tankId }} onSave={async (updated) => {
                  await updateThreshold(updated);
                  setThresholds(await getThresholds(tankId));
                  setEditing(null);
                }} />
              )}
            </View>
          );
        })}
      </View>

      {/* Data */}
      <Text style={styles.sectionTitle}>{i18n.t('settings.data')}</Text>
      <View style={styles.section}>
        <TouchableOpacity style={[styles.actionRow, styles.rowBorder]} onPress={handleExport}>
          <FontAwesome name="share-square-o" size={16} color={THEME.accent} />
          <Text style={styles.actionLabel}>{i18n.t('settings.exportCsv')}</Text>
          <FontAwesome name="chevron-right" size={12} color={THEME.textSecondary} style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionRow} onPress={handleImport}>
          <FontAwesome name="upload" size={16} color={THEME.accent} />
          <Text style={styles.actionLabel}>{i18n.t('settings.importCsv')}</Text>
          <FontAwesome name="chevron-right" size={12} color={THEME.textSecondary} style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function ThresholdEditor({ threshold, onSave }: { threshold: Thresholds & { tank_id: number }; onSave: (t: Thresholds & { tank_id: number }) => void }) {
  const [wl, setWl] = useState(String(threshold.warning_low ?? ''));
  const [wh, setWh] = useState(String(threshold.warning_high ?? ''));
  const [cl, setCl] = useState(String(threshold.critical_low ?? ''));
  const [ch, setCh] = useState(String(threshold.critical_high ?? ''));
  return (
    <View style={editorStyles.container}>
      <View style={editorStyles.row}>
        <Field label={i18n.t('settings.warnLow')} value={wl} onChange={setWl} />
        <Field label={i18n.t('settings.warnHigh')} value={wh} onChange={setWh} />
      </View>
      <View style={editorStyles.row}>
        <Field label={i18n.t('settings.critLow')} value={cl} onChange={setCl} />
        <Field label={i18n.t('settings.critHigh')} value={ch} onChange={setCh} />
      </View>
      <TouchableOpacity style={editorStyles.saveBtn} onPress={() => onSave({
        ...threshold, warning_low: wl ? parseFloat(wl) : null, warning_high: wh ? parseFloat(wh) : null,
        critical_low: cl ? parseFloat(cl) : null, critical_high: ch ? parseFloat(ch) : null,
      })}>
        <Text style={editorStyles.saveBtnText}>{i18n.t('settings.save')}</Text>
      </TouchableOpacity>
    </View>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <View style={editorStyles.field}>
      <Text style={editorStyles.fieldLabel}>{label}</Text>
      <TextInput style={editorStyles.input} value={value} onChangeText={onChange} keyboardType="decimal-pad" placeholderTextColor={THEME.textSecondary} placeholder="—" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  sectionTitle: { color: THEME.textSecondary, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, paddingHorizontal: 20, paddingTop: 28, paddingBottom: 10 },
  section: { backgroundColor: THEME.surfaceElevated, marginHorizontal: 20, borderRadius: 14, overflow: 'hidden' },
  // Tank rows
  tankRow: { paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  tankName: { flex: 1, color: THEME.text, fontSize: 15 },
  tankNameActive: { fontWeight: '600', color: THEME.accent },
  tankAction: { padding: 4 },
  addTankRow: { paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', gap: 10, borderTopWidth: 0.5, borderTopColor: THEME.border },
  addTankText: { color: THEME.accent, fontSize: 15, fontWeight: '500' },
  // Param rows
  toggle: { marginRight: 12, transform: [{ scale: 0.85 }] },
  rowContent: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  rowLabelDisabled: { opacity: 0.4 },
  row: { paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center' },
  rowBorder: { borderBottomWidth: 0.5, borderBottomColor: THEME.border },
  rowLabel: { color: THEME.text, fontSize: 15, flex: 1 },
  rowValue: { color: THEME.textSecondary, fontSize: 13, marginRight: 10, fontVariant: ['tabular-nums'] },
  actionRow: { paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  actionLabel: { color: THEME.text, fontSize: 15 },
});

const editorStyles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingBottom: 16, backgroundColor: THEME.surfaceElevated },
  row: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  field: { flex: 1 },
  fieldLabel: { color: THEME.textSecondary, fontSize: 11, marginBottom: 4, fontWeight: '500' },
  input: { backgroundColor: THEME.background, borderRadius: 10, padding: 10, color: THEME.text, fontSize: 15, fontVariant: ['tabular-nums'] },
  saveBtn: { backgroundColor: THEME.accent, borderRadius: 10, paddingVertical: 10, alignItems: 'center', marginTop: 4 },
  saveBtnText: { color: THEME.surfaceElevated, fontWeight: '600', fontSize: 15 },
});
