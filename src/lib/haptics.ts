import { Platform } from "react-native";
import * as Haptics from "expo-haptics";

// Touch feedback is decoration: it must never be the reason something
// breaks, so every call swallows its own errors (unsupported device, a
// vibration setting turned off, web).
//
// On Android the platform haptics API is used instead of impactAsync /
// notificationAsync because those need the VIBRATE permission, which Expo
// would otherwise add to the manifest just for this.

// A light tap — adding to the cart, confirming a small choice.
export function tapFeedback(): void {
  try {
    if (Platform.OS === "android") {
      void Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Context_Click).catch(() => {});
    } else if (Platform.OS === "ios") {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  } catch {
    // ignored — see above
  }
}

// Something finished successfully — a payment going through.
export function successFeedback(): void {
  try {
    if (Platform.OS === "android") {
      void Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Confirm).catch(() => {});
    } else if (Platform.OS === "ios") {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
  } catch {
    // ignored — see above
  }
}
