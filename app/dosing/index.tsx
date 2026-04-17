import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Modal } from 'react-native';
import { format } from 'date-fns';
import { THEME } from '@/src/constants/colors';
import { DosingEntry } from '@/src/models/types';
import { insertDose, getDosingHistory } from '@/src/db/queries';
import i18n, { getDateLocale } from '@/src/i18n';

const PRODUCT_KEYS = ['kalkwasser', 'allForReef', 'caBalling', 'alkBalling', 'mgSupplement', 'aminoAcids', 'coralFood'] as const;

export default function DosingScreen() {
  const [entries, setEntries] = useState<DosingEntry[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const refresh = useCallback(async () => { setEntries(await getDosingHistory(90)); }, []);
  useEffect(() => { refresh(); }, [refresh]);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
        <Text style={styles.addBtnText}>{i18n.t('dosing.add')}</Text>
      </TouchableOpacity>
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {entries.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>{i18n.t('dosing.empty')}</Text>
            <Text style={styles.emptyHint}>{i18n.t('dosing.emptyHint')}</Text>
          </View>
        ) : entries.map((entry) => (
          <View key={entry.id} style={styles.entry}>
            <View style={styles.entryLeft}>
              <Text style={styles.entryProduct}>{entry.product}</Text>
              <Text style={styles.entryDate}>{format(new Date(entry.dosed_at), 'MMM d, HH:mm', { locale: getDateLocale() })}</Text>
            </View>
            <Text style={styles.entryAmount}>{entry.amount} {entry.unit}</Text>
          </View>
        ))}
      </ScrollView>
      <AddDoseModal visible={showAdd} onClose={() => setShowAdd(false)} onSaved={() => { setShowAdd(false); refresh(); }} />
    </View>
  );
}

function AddDoseModal({ visible, onClose, onSaved }: { visible: boolean; onClose: () => void; onSaved: () => void }) {
  const [product, setProduct] = useState('');
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState('ml');
  const [notes, setNotes] = useState('');
  const handleSave = async () => {
    if (!product || !amount) return;
    await insertDose(product, parseFloat(amount), unit, notes || undefined);
    setProduct(''); setAmount(''); setNotes(''); onSaved();
  };
  const products = PRODUCT_KEYS.map((k) => i18n.t(`dosing.products.${k}`));

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={modalStyles.container}>
        <View style={modalStyles.header}>
          <TouchableOpacity onPress={onClose}><Text style={modalStyles.cancel}>{i18n.t('dosing.cancel')}</Text></TouchableOpacity>
          <Text style={modalStyles.title}>{i18n.t('dosing.add')}</Text>
          <TouchableOpacity onPress={handleSave}><Text style={modalStyles.save}>{i18n.t('dosing.save')}</Text></TouchableOpacity>
        </View>
        <Text style={modalStyles.label}>{i18n.t('dosing.product')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={modalStyles.productScroll}>
          {products.map((p) => (
            <TouchableOpacity key={p} style={[modalStyles.chip, product === p && modalStyles.chipActive]} onPress={() => setProduct(p)}>
              <Text style={[modalStyles.chipText, product === p && modalStyles.chipTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TextInput style={modalStyles.input} placeholder={i18n.t('dosing.productPlaceholder')} placeholderTextColor={THEME.textSecondary} value={product} onChangeText={setProduct} />
        <Text style={modalStyles.label}>{i18n.t('dosing.amount')}</Text>
        <View style={modalStyles.amountRow}>
          <TextInput style={[modalStyles.input, { flex: 1 }]} placeholder="0.0" placeholderTextColor={THEME.textSecondary} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
          <View style={modalStyles.unitPicker}>
            {['ml', 'g', 'gouttes'].map((u) => (
              <TouchableOpacity key={u} style={[modalStyles.chip, unit === u && modalStyles.chipActive]} onPress={() => setUnit(u)}>
                <Text style={[modalStyles.chipText, unit === u && modalStyles.chipTextActive]}>{u}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <Text style={modalStyles.label}>{i18n.t('dosing.notes')}</Text>
        <TextInput style={[modalStyles.input, { height: 60 }]} placeholder={i18n.t('dosing.notesPlaceholder')} placeholderTextColor={THEME.textSecondary} value={notes} onChangeText={setNotes} multiline />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  addBtn: { backgroundColor: THEME.accent, margin: 20, padding: 16, borderRadius: 14, alignItems: 'center' },
  addBtnText: { color: THEME.surfaceElevated, fontSize: 16, fontWeight: '600' },
  list: { flex: 1, paddingHorizontal: 20 },
  emptyState: { alignItems: 'center', marginTop: 48, paddingHorizontal: 32 },
  emptyTitle: { color: THEME.text, fontSize: 16, fontWeight: '600', marginBottom: 6 },
  emptyHint: { color: THEME.textSecondary, fontSize: 13, textAlign: 'center', lineHeight: 19 },
  entry: { backgroundColor: THEME.surfaceElevated, borderRadius: 12, padding: 16, marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  entryLeft: { flex: 1 },
  entryProduct: { color: THEME.text, fontSize: 15, fontWeight: '600' },
  entryDate: { color: THEME.textSecondary, fontSize: 12, marginTop: 2 },
  entryAmount: { color: THEME.accent, fontSize: 18, fontWeight: '700', fontVariant: ['tabular-nums'] },
});

const modalStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background, padding: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, marginTop: 8 },
  title: { color: THEME.text, fontSize: 17, fontWeight: '600' },
  cancel: { color: THEME.textSecondary, fontSize: 16 },
  save: { color: THEME.accent, fontSize: 16, fontWeight: '600' },
  label: { color: THEME.textSecondary, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, marginTop: 20 },
  productScroll: { flexGrow: 0, marginBottom: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: THEME.surface, marginRight: 8 },
  chipActive: { backgroundColor: THEME.accent },
  chipText: { color: THEME.textSecondary, fontSize: 13, fontWeight: '500' },
  chipTextActive: { color: THEME.surfaceElevated },
  input: { backgroundColor: THEME.surfaceElevated, borderRadius: 12, padding: 14, color: THEME.text, fontSize: 16 },
  amountRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  unitPicker: { flexDirection: 'row', gap: 4 },
});
