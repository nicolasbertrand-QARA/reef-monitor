import React, { useCallback, useState } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { getCoreParams, getNutrientParams, PARAMETERS } from '@/src/constants/parameters';
import { THEME } from '@/src/constants/colors';
import { useLatestReadings } from '@/src/hooks/useParameters';
import { evaluateStatus } from '@/src/utils/thresholds';
import { evaluateNO3PO4Ratio, evaluateIonicBalance } from '@/src/utils/ratios';
import { ParamCard } from '@/src/components/ParamCard';
import { ParamInput } from '@/src/components/ParamInput';
import { RatioIndicator } from '@/src/components/RatioIndicator';
import { Reading, Thresholds, ParameterKey, ParameterDef } from '@/src/models/types';
import i18n from '@/src/i18n';

export default function DashboardScreen() {
  const { readings, thresholds, loading, refresh } = useLatestReadings();
  const [selectedParam, setSelectedParam] = useState<ParameterDef | null>(null);

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const readingMap = new Map<ParameterKey, Reading>();
  readings.forEach((r) => readingMap.set(r.parameter as ParameterKey, r));
  const thresholdMap = new Map<ParameterKey, Thresholds>();
  thresholds.forEach((t) => thresholdMap.set(t.parameter as ParameterKey, t));

  const no3 = readingMap.get('nitrate'), po4 = readingMap.get('phosphate');
  const ca = readingMap.get('calcium'), alk = readingMap.get('alkalinity'), mg = readingMap.get('magnesium');
  const ratioResult = no3 && po4 ? evaluateNO3PO4Ratio(no3.value, po4.value) : null;
  const ionicResult = ca && alk && mg ? evaluateIonicBalance(ca.value, alk.value, mg.value) : null;

  const renderCard = (paramDef: ReturnType<typeof getCoreParams>[0]) => {
    const reading = readingMap.get(paramDef.key);
    const threshold = thresholdMap.get(paramDef.key);
    const status = reading && threshold ? evaluateStatus(reading.value, threshold) : 'unknown';
    return (
      <ParamCard key={paramDef.key} paramDef={paramDef} reading={reading} status={status}
        onPress={() => setSelectedParam(PARAMETERS[paramDef.key])} />
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {ratioResult && ratioResult.status !== 'ok' && ratioResult.status !== 'unknown' && (
        <View style={styles.alertSection}>
          <RatioIndicator title={i18n.t('dashboard.ratioNO3PO4')} message={ratioResult.message} status={ratioResult.status} />
        </View>
      )}
      {ionicResult && ionicResult.status !== 'ok' && ionicResult.status !== 'unknown' && (
        <View style={styles.alertSection}>
          <RatioIndicator title={i18n.t('dashboard.ionicBalance')} message={ionicResult.message} status={ionicResult.status} />
        </View>
      )}
      <Text style={styles.sectionLabel}>{i18n.t('dashboard.waterChemistry')}</Text>
      <View style={styles.grid}>{getCoreParams().map(renderCard)}</View>
      <Text style={styles.sectionLabel}>{i18n.t('dashboard.nutrients')}</Text>
      <View style={styles.grid}>{getNutrientParams().map(renderCard)}</View>

      {selectedParam && (
        <ParamInput
          paramDef={selectedParam}
          visible={true}
          onClose={() => setSelectedParam(null)}
          onSaved={() => { setSelectedParam(null); refresh(); }}
        />
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
