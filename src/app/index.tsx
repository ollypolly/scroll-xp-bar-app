import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { XPBar } from '../components/XPBar';
import { useProgressStore } from '../store/progressStore';

export default function OnboardingScreen() {
  const isLoaded = useProgressStore((state) => state.isLoaded);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Shorts XP</Text>
        <Text style={styles.body}>
          Watch YouTube Shorts right here in the app. XP is only earned for Shorts you actually
          watch — swiping past hundreds of them earns nothing.
        </Text>
        <Text style={styles.body}>
          Watch at least 20% of a Short to start earning XP. Watch the whole thing for the full
          reward.
        </Text>

        {isLoaded ? <XPBar /> : null}

        <TouchableOpacity style={styles.button} onPress={() => router.push('/shorts')}>
          <Text style={styles.buttonText}>Start scrolling</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/debug')}>
          <Text style={styles.debugLink}>Developer debug screen</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f14',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 20,
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
  },
  body: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 15,
    lineHeight: 21,
  },
  button: {
    backgroundColor: '#7c3aed',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  debugLink: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    textAlign: 'center',
  },
});
