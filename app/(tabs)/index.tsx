import React, { useCallback, useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { getCoreParams, getNutrientParams, PARAMETERS, getParameterList } from '@/src/constants/parameters';
import { THEME } from '@/src/constants/colors';
import { useLatestReadings } from '@/src/hooks/useParameters';
import { evaluateStatus } from '@/src/utils/thresholds';
import { evaluateNO3PO4Ratio, evaluateIonicBalance, detectAlkSwing } from '@/src/utils/ratios';
import { getDisplayUnit } from '@/src/utils/units';
import { ParamCard } from '@/src/components/ParamCard';
import { ParamInput } from '@/src/components/ParamInput';
import { RatioIndicator } from '@/src/components/RatioIndicator';
import { Reading, Thresholds, ParameterKey, ParameterDef } from '@/src/models/types';
import { useVisibleParams } from '@/src/hooks/useVisibility';
import { useTank } from '@/src/hooks/useTank';
import { useUnitPrefs } from '@/src/hooks/useUnitPrefs';
import { getReadingHistory } from '@/src/db/queries';
import i18n from '@/src/i18n';

export default function DashboardScreen() {
  const { activeTank } = useTank();
  const tankId = activeTank?.id ?? 1;
  const { readings, thresholds, loading, refresh } = useLatestReadings(tankId);
  const { visible, refresh: refreshVisibility } = useVisibleParams(tankId);
  const { prefs: unitPrefs, refresh: refreshUnits } = useUnitPrefs();
  const [selectedParam, setSelectedParam] = useState<ParameterDef | null>(null);
  const [historyMap, setHistoryMap] = useState<Map<ParameterKey, Reading[]>>(new Map());

  const loadHistory = useCallback(async () => {
    const map = new Map<ParameterKey, Reading[]>();
    await Promise.all(getParameterList().map(async (p) => {
      map.set(p.key, await getReadingHistory(p.key, tankId, 30));
    }));
    setHistoryMap(map);
  }, [tankId]);

  useFocusEffect(useCallback(() => { refresh(); refreshVisibility(); refreshUnits(); loadHistory(); }, [refresh, refreshVisibility, refreshUnits, loadHistory]));

  const readingMap = new Map<ParameterKey, Reading>();
  readings.forEach((r) => readingMap.set(r.parameter as ParameterKey, r));
  const thresholdMap = new Map<ParameterKey, Thresholds>();
  thresholds.forEach((t) => thresholdMap.set(t.parameter as ParameterKey, t));

  const no3 = readingMap.get('nitrate'), po4 = readingMap.get('phosphate');
  const ca = readingMap.get('calcium'), alk = readingMap.get('alkalinity'), mg = readingMap.get('magnesium');
  // Ratio alerts are only meaningful when the paired readings were taken
  // close together; a 3-week-old PO4 against today's NO3 is noise.
  const PAIRING_WINDOW_MS = 72 * 60 * 60 * 1000;
  const contemporaneous = (...rs: Reading[]) => {
    const ts = rs.map((r) => new Date(r.recorded_at).getTime());
    return Math.max(...ts) - Math.min(...ts) <= PAIRING_WINDOW_MS;
  };
  const ratioResult = no3 && po4 && contemporaneous(no3, po4) ? evaluateNO3PO4Ratio(no3.value, po4.value) : null;
  const ionicResult = ca && alk && mg && contemporaneous(ca, alk, mg) ? evaluateIonicBalance(ca.value, alk.value, mg.value) : null;
  const alkSwing = detectAlkSwing(historyMap.get('alkalinity') ?? []);
  const alkUnit = getDisplayUnit(PARAMETERS.alkalinity, unitPrefs);

  const renderCard = (paramDef: ReturnType<typeof getCoreParams>[0]) => {
    const reading = readingMap.get(paramDef.key);
    const threshold = thresholdMap.get(paramDef.key);
    const status = reading && threshold ? evaluateStatus(reading.value, threshold) : 'unknown';
    return (
      <ParamCard key={paramDef.key} paramDef={paramDef} reading={reading} status={status}
        history={historyMap.get(paramDef.key)} thresholds={threshold} unitPrefs={unitPrefs}
        onPress={() => setSelectedParam(PARAMETERS[paramDef.key])} />
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {ratioResult && ratioResult.status !== 'ok' && ratioResult.status !== 'unknown' && (
        <View style={styles.alertSection}><RatioIndicator title={i18n.t('dashboard.ratioNO3PO4')} message={ratioResult.message} status={ratioResult.status} /></View>
      )}
      {ionicResult && ionicResult.status !== 'ok' && ionicResult.status !== 'unknown' && (
        <View style={styles.alertSection}><RatioIndicator title={i18n.t('dashboard.ionicBalance')} message={ionicResult.message} status={ionicResult.status} /></View>
      )}
      {(alkSwing.status === 'warning' || alkSwing.status === 'critical') && (
        <View style={styles.alertSection}><RatioIndicator title={i18n.t('dashboard.alkSwing')}
          message={i18n.t('ratios.alkSwing', { swing: alkUnit.fromCanonical(alkSwing.swing).toFixed(alkUnit.decimals), unit: alkUnit.unit })}
          status={alkSwing.status} /></View>
      )}
      <Text style={styles.sectionLabel}>{i18n.t('dashboard.waterChemistry')}</Text>
      <View style={styles.grid}>{getCoreParams().filter((p) => visible.has(p.key)).map(renderCard)}</View>
      <Text style={styles.sectionLabel}>{i18n.t('dashboard.nutrients')}</Text>
      <View style={styles.grid}>{getNutrientParams().filter((p) => visible.has(p.key)).map(renderCard)}</View>
      {selectedParam && (
        <ParamInput paramDef={selectedParam} visible={true} tankId={tankId} unitPrefs={unitPrefs}
          onClose={() => setSelectedParam(null)}
          onSaved={() => { setSelectedParam(null); refresh(); loadHistory(); }} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32 },
  alertSection: { marginBottom: 4 },
  sectionLabel: { color: THEME.textSecondary, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginTop: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 12 },
});
