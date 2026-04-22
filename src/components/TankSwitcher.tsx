import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTank } from '@/src/hooks/useTank';
import { THEME } from '@/src/constants/colors';

export function TankSwitcher() {
  const { tanks, activeTank, switchTank } = useTank();
  const [showPicker, setShowPicker] = useState(false);

  if (tanks.length <= 1) return null;

  return (
    <>
      <TouchableOpacity style={styles.trigger} onPress={() => setShowPicker(true)} hitSlop={12}>
        <FontAwesome name="tint" size={14} color={THEME.accent} />
        <Text style={styles.triggerText} numberOfLines={1}>{activeTank?.name ?? ''}</Text>
        <FontAwesome name="chevron-down" size={10} color={THEME.textSecondary} />
      </TouchableOpacity>

      <Modal visible={showPicker} transparent animationType="fade" onRequestClose={() => setShowPicker(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowPicker(false)}>
          <View style={styles.dropdown}>
            {tanks.map((tank) => (
              <TouchableOpacity
                key={tank.id}
                style={[styles.option, tank.id === activeTank?.id && styles.optionActive]}
                onPress={() => { switchTank(tank.id); setShowPicker(false); }}
              >
                <Text style={[styles.optionText, tank.id === activeTank?.id && styles.optionTextActive]}>
                  {tank.name}
                </Text>
                {tank.id === activeTank?.id && (
                  <FontAwesome name="check" size={14} color={THEME.accent} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, backgroundColor: THEME.surface },
  triggerText: { color: THEME.text, fontSize: 13, fontWeight: '500', maxWidth: 100 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-start', paddingTop: 100, alignItems: 'center' },
  dropdown: { backgroundColor: THEME.surfaceElevated, borderRadius: 14, minWidth: 200, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12 },
  option: { paddingHorizontal: 20, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  optionActive: { backgroundColor: THEME.accentSoft },
  optionText: { color: THEME.text, fontSize: 16 },
  optionTextActive: { fontWeight: '600', color: THEME.accent },
});
