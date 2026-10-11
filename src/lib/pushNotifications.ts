import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { apiRequest, isApiConfigured } from "./api/client";

// Show order updates as a banner even while the app is open, so a
// "pesanan sedang dikirim" push isn't silently swallowed in the foreground.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Matches `defaultChannel` in the expo-notifications plugin (app.json) and
// the `channelId` the server sends with every push.
const CHANNEL_ID = "default";

// Remembered so logout can tell the server to stop pushing this device's
// token to the account that's signing out.
let registeredToken: string | null = null;

// Best-effort and silent: no permission, no network, Expo Go (remote push
// isn't supported there) or web must never break login — the app just won't
// get pushes, and the in-app Notifikasi list still works from polling.
export async function registerForPushNotifications(): Promise<void> {
  if (Platform.OS === "web" || !isApiConfigured()) return;

  try {
    // Android 13+ only shows the permission prompt once a channel exists.
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: "Pesanan",
        importance: Notifications.AndroidImportance.HIGH,
      });
    }

    const { status: existing } = await Notifications.getPermissionsAsync();
    const status =
      existing === "granted" ? existing : (await Notifications.requestPermissionsAsync()).status;
    if (status !== "granted") return;

    const { data: token } = await Notifications.getExpoPushTokenAsync();
    await apiRequest("/api/mobile/push-token", {
      method: "POST",
      auth: true,
      body: { token, action: "register" },
    });
    registeredToken = token;
  } catch {
    // Intentionally ignored — see above.
  }
}

// Must run before the auth token is cleared, since the server identifies
// the account from it.
export async function unregisterPushNotifications(): Promise<void> {
  if (!registeredToken || !isApiConfigured()) return;
  const token = registeredToken;
  registeredToken = null;
  await apiRequest("/api/mobile/push-token", {
    method: "POST",
    auth: true,
    body: { token, action: "unregister" },
  }).catch(() => {});
}
