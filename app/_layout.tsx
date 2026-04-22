import React, { useEffect, useState } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
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
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
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
