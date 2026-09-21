import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useDebugStore } from '../store/debugStore';
import { useProgressStore } from '../store/progressStore';

export default function RootLayout() {
  const loadProgress = useProgressStore((state) => state.loadProgress);
  const loadDebugSettings = useDebugStore((state) => state.loadDebugSettings);

  useEffect(() => {
    void loadProgress();
    void loadDebugSettings();
  }, [loadProgress, loadDebugSettings]);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
