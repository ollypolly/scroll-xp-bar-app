import * as Haptics from 'expo-haptics';

export function xpGainHaptic(): void {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export function levelUpHaptic(): void {
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}
