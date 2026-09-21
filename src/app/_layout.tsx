import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useProgressStore } from '../store/progressStore';

export default function RootLayout() {
  const loadProgress = useProgressStore((state) => state.loadProgress);

  useEffect(() => {
    void loadProgress();
  }, [loadProgress]);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
