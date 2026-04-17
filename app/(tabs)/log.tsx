import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '@/src/constants/colors';
import { QuickLogGrid } from '@/src/components/QuickLogGrid';
import i18n from '@/src/i18n';

export default function LogScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>{i18n.t('log.subtitle')}</Text>
      <QuickLogGrid onSaved={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  subtitle: { color: THEME.textSecondary, fontSize: 13, textAlign: 'center', paddingVertical: 12, fontWeight: '400' },
});
