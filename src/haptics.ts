import * as Haptics from 'expo-haptics';

export function levelUpHaptic(): void {
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}
