import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Modal } from 'react-native';
import Slider from '@react-native-community/slider';
import { format } from 'date-fns';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { THEME } from '@/src/constants/colors';
import { DosingEntry, WaterChange } from '@/src/models/types';
import { insertDose, getDosingHistory, insertWaterChange, getWaterChanges, getLastWaterChange } from '@/src/db/queries';
import { useTank } from '@/src/hooks/useTank';
import i18n, { getDateLocale } from '@/src/i18n';

const PRODUCT_KEYS = ['kalkwasser', 'allForReef', 'caBalling', 'alkBalling', 'mgSupplement', 'aminoAcids', 'coralFood'] as const;
const WC_COLOR = '#5a8fb8';

export default function DosingScreen() {
  const { activeTank } = useTank();
  const tankId = activeTank?.id ?? 1;
  const [entries, setEntries] = useState<DosingEntry[]>([]);
  const [waterChanges, setWaterChanges] = useState<WaterChange[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showWC, setShowWC] = useState(false);

  const refresh = useCallback(async () => {
    const [doses, wcs] = await Promise.all([getDosingHistory(tankId, 90), getWaterChanges(tankId, 90)]);
    setEntries(doses);
    setWaterChanges(wcs);
  }, [tankId]);

  useEffect(() => { refresh(); }, [refresh]);

  // Merge and sort all events by date
  type Event = { type: 'dose'; data: DosingEntry; date: string } | { type: 'wc'; data: WaterChange; date: string };
  const events: Event[] = [
    ...entries.map((d) => ({ type: 'dose' as const, data: d, date: d.dosed_at })),
    ...waterChanges.map((w) => ({ type: 'wc' as const, data: w, date: w.changed_at })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <View style={styles.container}>
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
          <FontAwesome name="eyedropper" size={16} color={THEME.surfaceElevated} />
          <Text style={styles.addBtnText}>{i18n.t('dosing.add')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.addBtn, styles.wcBtn]} onPress={() => setShowWC(true)}>
          <FontAwesome name="tint" size={16} color={THEME.surfaceElevated} />
          <Text style={styles.addBtnText}>{i18n.t('waterChange.add')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {events.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>{i18n.t('dosing.empty')}</Text>
            <Text style={styles.emptyHint}>{i18n.t('dosing.emptyHint')}</Text>
          </View>
        ) : events.map((event, idx) => {
          if (event.type === 'dose') {
            const e = event.data;
            return (
              <View key={`dose-${e.id}`} style={styles.entry}>
                <View style={styles.entryLeft}>
                  <Text style={styles.entryProduct}>{e.product}</Text>
                  <Text style={styles.entryDate}>{format(new Date(e.dosed_at), 'MMM d, HH:mm', { locale: getDateLocale() })}</Text>
                </View>
                <Text style={styles.entryAmount}>{e.amount} {e.unit}</Text>
              </View>
            );
          } else {
            const w = event.data;
            return (
              <View key={`wc-${w.id}`} style={[styles.entry, styles.wcEntry]}>
                <View style={styles.entryLeft}>
                  <View style={styles.wcHeader}>
                    <FontAwesome name="tint" size={14} color={WC_COLOR} />
                    <Text style={[styles.entryProduct, { color: WC_COLOR }]}>{i18n.t('waterChange.title')}</Text>
                  </View>
                  <Text style={styles.entryDate}>
                    {format(new Date(w.changed_at), 'MMM d, HH:mm', { locale: getDateLocale() })}
                    {w.salt_brand ? ` · ${w.salt_brand}` : ''}
                    {w.dilution_gpl ? ` · ${w.dilution_gpl} g/L` : ''}
                  </Text>
                </View>
                <Text style={[styles.entryAmount, { color: WC_COLOR }]}>{w.percentage}%</Text>
              </View>
            );
          }
        })}
      </ScrollView>

      <AddDoseModal visible={showAdd} tankId={tankId} onClose={() => setShowAdd(false)} onSaved={() => { setShowAdd(false); refresh(); }} />
      <WaterChangeModal visible={showWC} tankId={tankId} onClose={() => setShowWC(false)} onSaved={() => { setShowWC(false); refresh(); }} />
    </View>
  );
}

function AddDoseModal({ visible, tankId, onClose, onSaved }: { visible: boolean; tankId: number; onClose: () => void; onSaved: () => void }) {
  const [product, setProduct] = useState('');
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState('ml');
  const [notes, setNotes] = useState('');
  const handleSave = async () => {
    if (!product || !amount) return;
    await insertDose(product, parseFloat(amount), unit, tankId, notes || undefined);
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

function WaterChangeModal({ visible, tankId, onClose, onSaved }: { visible: boolean; tankId: number; onClose: () => void; onSaved: () => void }) {
  const [percentage, setPercentage] = useState(10);
  const [saltBrand, setSaltBrand] = useState('');
  const [dilution, setDilution] = useState('');

  // Load last values when modal opens
  useEffect(() => {
    if (visible) {
      getLastWaterChange(tankId).then((last) => {
        if (last) {
          setPercentage(last.percentage);
          setSaltBrand(last.salt_brand ?? '');
          setDilution(last.dilution_gpl ? String(last.dilution_gpl) : '');
        }
      });
    }
  }, [visible]);

  const handleSave = async () => {
    await insertWaterChange(
      percentage, tankId,
      saltBrand || undefined,
      dilution ? parseFloat(dilution) : undefined
    );
    onSaved();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={modalStyles.container}>
        <View style={modalStyles.header}>
          <TouchableOpacity onPress={onClose}><Text style={modalStyles.cancel}>{i18n.t('waterChange.cancel')}</Text></TouchableOpacity>
          <Text style={modalStyles.title}>{i18n.t('waterChange.title')}</Text>
          <TouchableOpacity onPress={handleSave}><Text style={modalStyles.save}>{i18n.t('waterChange.save')}</Text></TouchableOpacity>
        </View>

        <Text style={modalStyles.label}>{i18n.t('waterChange.percentage')}</Text>
        <Text style={wcStyles.percentValue}>{percentage}%</Text>
        <Slider
          style={wcStyles.slider}
          minimumValue={0}
          maximumValue={100}
          step={5}
          value={percentage}
          onValueChange={setPercentage}
          minimumTrackTintColor={WC_COLOR}
          maximumTrackTintColor={THEME.surface}
          thumbTintColor={WC_COLOR}
        />
        <View style={wcStyles.sliderLabels}>
          <Text style={wcStyles.sliderLabel}>0%</Text>
          <Text style={wcStyles.sliderLabel}>100%</Text>
        </View>

        <Text style={modalStyles.label}>{i18n.t('waterChange.saltBrand')}</Text>
        <TextInput
          style={modalStyles.input}
          placeholder={i18n.t('waterChange.saltPlaceholder')}
          placeholderTextColor={THEME.textSecondary}
          value={saltBrand}
          onChangeText={setSaltBrand}
        />

        <Text style={modalStyles.label}>{i18n.t('waterChange.dilution')} (g/L)</Text>
        <TextInput
          style={modalStyles.input}
          placeholder="35"
          placeholderTextColor={THEME.textSecondary}
          value={dilution}
          onChangeText={setDilution}
          keyboardType="decimal-pad"
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  buttons: { flexDirection: 'row', gap: 10, marginHorizontal: 20, marginTop: 20, marginBottom: 4 },
  addBtn: { flex: 1, backgroundColor: THEME.accent, padding: 14, borderRadius: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  wcBtn: { backgroundColor: WC_COLOR },
  addBtnText: { color: THEME.surfaceElevated, fontSize: 15, fontWeight: '600' },
  list: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  emptyState: { alignItems: 'center', marginTop: 48, paddingHorizontal: 32 },
  emptyTitle: { color: THEME.text, fontSize: 16, fontWeight: '600', marginBottom: 6 },
  emptyHint: { color: THEME.textSecondary, fontSize: 13, textAlign: 'center', lineHeight: 19 },
  entry: { backgroundColor: THEME.surfaceElevated, borderRadius: 12, padding: 16, marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  wcEntry: {},
  wcHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
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

const wcStyles = StyleSheet.create({
  percentValue: { color: THEME.text, fontSize: 48, fontWeight: '700', textAlign: 'center', marginBottom: 8, fontVariant: ['tabular-nums'] },
  slider: { width: '100%', height: 40 },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  sliderLabel: { color: THEME.textSecondary, fontSize: 12 },
});
