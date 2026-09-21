import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { XPBar } from '../components/XPBar';
import { useDebugStore } from '../store/debugStore';
import { useProgressStore } from '../store/progressStore';

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString();
}

export default function DebugScreen() {
  const debug = useDebugStore();
  const progress = useProgressStore((state) => state.progress);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.section}>
        <XPBar />
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>WebView Status</Text>
        <Text style={styles.line}>Current Video ID: {debug.currentVideoId ?? '-'}</Text>
        <Text style={styles.line}>Duration: {debug.duration != null ? `${debug.duration.toFixed(1)}s` : '-'}</Text>
        <Text style={styles.line}>Position: {debug.position != null ? `${debug.position.toFixed(1)}s` : '-'}</Text>
        <Text style={styles.line}>
          Watch %: {debug.watchPercentage != null ? `${debug.watchPercentage.toFixed(1)}%` : '-'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Current XP</Text>
        <Text style={styles.line}>{progress.totalXP.toLocaleString()}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Last XP Award</Text>
        <Text style={styles.line}>{debug.lastXPAward != null ? `+${debug.lastXPAward} XP` : '-'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Detection</Text>
        <Text style={styles.line}>Video changes: {debug.videoChangeCount}</Text>
        <Text style={styles.line}>Events received: {debug.eventsReceivedCount}</Text>
      </View>

      <View style={[styles.section, styles.logSection]}>
        <Text style={styles.heading}>Event Log</Text>
        <FlatList
          data={debug.log}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <Text style={styles.logLine}>
              {formatTime(item.timestamp)} {item.message}
            </Text>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f14',
    padding: 16,
    gap: 16,
  },
  section: {
    gap: 4,
  },
  logSection: {
    flex: 1,
  },
  heading: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  line: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
  },
  logLine: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    fontFamily: 'monospace',
  },
});
