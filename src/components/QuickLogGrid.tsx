import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ParameterDef } from '@/src/models/types';
import { getCoreParams, getNutrientParams } from '@/src/constants/parameters';
import { THEME } from '@/src/constants/colors';
import { ParamInput } from './ParamInput';
import i18n from '@/src/i18n';

interface Props { onSaved: () => void; }

export function QuickLogGrid({ onSaved }: Props) {
  const [selectedParam, setSelectedParam] = useState<ParameterDef | null>(null);
  const renderCell = (param: ParameterDef) => (
    <TouchableOpacity key={param.key} style={styles.cell} onPress={() => setSelectedParam(param)} activeOpacity={0.6}>
      <Text style={styles.cellLabel}>{param.label}</Text>
      <Text style={styles.cellUnit}>{param.unit || '—'}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionLabel}>{i18n.t('dashboard.waterChemistry')}</Text>
      <View style={styles.grid}>{getCoreParams().map(renderCell)}</View>
      <Text style={styles.sectionLabel}>{i18n.t('dashboard.nutrients')}</Text>
      <View style={styles.grid}>{getNutrientParams().map(renderCell)}</View>
      {selectedParam && <ParamInput paramDef={selectedParam} visible={true} onClose={() => setSelectedParam(null)} onSaved={onSaved} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 32 },
  sectionLabel: { color: THEME.textSecondary, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginTop: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 8 },
  cell: { backgroundColor: THEME.surfaceElevated, borderRadius: 14, width: '47%', paddingVertical: 28, paddingHorizontal: 16, marginBottom: 12, alignItems: 'center', justifyContent: 'center' },
  cellLabel: { color: THEME.text, fontSize: 16, fontWeight: '600', marginBottom: 4 },
  cellUnit: { color: THEME.textSecondary, fontSize: 13, fontWeight: '400' },
});
