import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Paths, File } from 'expo-file-system/next';
import { getParameterList } from '@/src/constants/parameters';
import { THEME } from '@/src/constants/colors';
import { Thresholds, ParameterKey } from '@/src/models/types';
import { getThresholds, updateThreshold, getAllReadingsForExport, importReadingsFromCSV } from '@/src/db/queries';
import i18n from '@/src/i18n';

export default function SettingsScreen() {
  const [thresholds, setThresholds] = useState<Thresholds[]>([]);
  const [editing, setEditing] = useState<ParameterKey | null>(null);
  const router = useRouter();
  const paramList = getParameterList();

  useEffect(() => { getThresholds().then(setThresholds); }, []);

  const handleExport = async () => {
    const readings = await getAllReadingsForExport();
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
      const count = await importReadingsFromCSV(content);
      Alert.alert(i18n.t('settings.importSuccess'), i18n.t('settings.importSuccessMsg', { count }));
    } catch (e: any) {
      Alert.alert(i18n.t('settings.importError'), e.message);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>{i18n.t('settings.thresholds')}</Text>
      <View style={styles.section}>
        {paramList.map((paramDef, idx) => {
          const t = thresholds.find((th) => th.parameter === paramDef.key);
          const isEditing = editing === paramDef.key;
          const isLast = idx === paramList.length - 1;
          return (
            <View key={paramDef.key}>
              <TouchableOpacity style={[styles.row, !isLast && styles.rowBorder]} onPress={() => setEditing(isEditing ? null : paramDef.key)}>
                <Text style={styles.rowLabel}>{paramDef.label}</Text>
                <Text style={styles.rowValue}>{t ? `${t.warning_low ?? '—'} – ${t.warning_high ?? '—'} ${paramDef.unit}` : '—'}</Text>
                <FontAwesome name={isEditing ? 'chevron-up' : 'chevron-down'} size={12} color={THEME.textSecondary} />
              </TouchableOpacity>
              {isEditing && t && (
                <ThresholdEditor threshold={t} onSave={async (updated) => { await updateThreshold(updated); const fresh = await getThresholds(); setThresholds(fresh); setEditing(null); }} />
              )}
            </View>
          );
        })}
      </View>
      <Text style={styles.sectionTitle}>{i18n.t('settings.data')}</Text>
      <View style={styles.section}>
        <TouchableOpacity style={[styles.actionRow, styles.rowBorder]} onPress={() => router.push('/dosing' as any)}>
          <FontAwesome name="eyedropper" size={16} color={THEME.accent} />
          <Text style={styles.actionLabel}>{i18n.t('settings.dosingLog')}</Text>
          <FontAwesome name="chevron-right" size={12} color={THEME.textSecondary} style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>
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

function ThresholdEditor({ threshold, onSave }: { threshold: Thresholds; onSave: (t: Thresholds) => void }) {
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
      <TouchableOpacity style={editorStyles.saveBtn} onPress={() => onSave({ ...threshold, warning_low: wl ? parseFloat(wl) : null, warning_high: wh ? parseFloat(wh) : null, critical_low: cl ? parseFloat(cl) : null, critical_high: ch ? parseFloat(ch) : null })}>
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
  row: { paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center' },
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
