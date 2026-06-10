import React, { useEffect, useState } from 'react';
import { Platform, Settings } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as SQLite from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { DatabaseContext } from '@/src/hooks/useDatabase';
import { getDatabase } from '@/src/db/database';
import { THEME } from '@/src/constants/colors';
import { TankContext, useTankProvider } from '@/src/hooks/useTank';
import i18n from '@/src/i18n';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = { initialRouteName: '(tabs)' };

SplashScreen.preventAutoHideAsync();

function AppContent() {
  const tankState = useTankProvider();

  // Screenshot/automation tour: `xcrun simctl spawn <udid> defaults write
  // com.nicolasbertrand.reefmonitor screenshotRoute /trends` navigates on
  // launch without the simctl openurl confirmation dialog. Inert for users
  // (the key never exists outside automation).
  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    const route = Settings.get('screenshotRoute');
    if (typeof route === 'string' && route.startsWith('/')) {
      setTimeout(() => router.replace(route as never), 400);
    }
  }, []);

  return (
    <TankContext.Provider value={tankState}>
      <StatusBar style="dark" />
      <Stack screenOptions={{
        headerStyle: { backgroundColor: THEME.background },
        headerTintColor: THEME.text,
        contentStyle: { backgroundColor: THEME.background },
      }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </TankContext.Provider>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);

  useEffect(() => { if (error) throw error; }, [error]);
  useEffect(() => { getDatabase().then(setDb); }, []);
  useEffect(() => { if (loaded && db) SplashScreen.hideAsync(); }, [loaded, db]);

  if (!loaded || !db) return null;

  return (
    <DatabaseContext.Provider value={db}>
      <AppContent />
    </DatabaseContext.Provider>
  );
}
