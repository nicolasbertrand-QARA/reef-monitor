import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { THEME } from '@/src/constants/colors';
import i18n from '@/src/i18n';

function TabBarIcon(props: { name: React.ComponentProps<typeof FontAwesome>['name']; color: string }) {
  return <FontAwesome size={22} style={{ marginBottom: -2 }} {...props} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: THEME.accent,
        tabBarInactiveTintColor: THEME.textSecondary,
        tabBarStyle: { backgroundColor: THEME.surfaceElevated, borderTopColor: THEME.border, borderTopWidth: 0.5, height: 88, paddingTop: 8 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500', letterSpacing: 0.2 },
        headerStyle: { backgroundColor: THEME.background, shadowColor: 'transparent', elevation: 0 },
        headerTitleStyle: { color: THEME.text, fontSize: 17, fontWeight: '600' },
        headerTintColor: THEME.text,
      }}
    >
      <Tabs.Screen name="index" options={{ title: i18n.t('tabs.dashboard'), tabBarIcon: ({ color }) => <TabBarIcon name="tachometer" color={color} /> }} />
      <Tabs.Screen name="trends" options={{ title: i18n.t('tabs.trends'), tabBarIcon: ({ color }) => <TabBarIcon name="line-chart" color={color} /> }} />
      <Tabs.Screen name="settings" options={{ title: i18n.t('tabs.settings'), tabBarIcon: ({ color }) => <TabBarIcon name="sliders" color={color} /> }} />
    </Tabs>
  );
}
