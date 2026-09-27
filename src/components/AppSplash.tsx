import { ActivityIndicator, Image, StyleSheet, View } from "react-native";
import { colors } from "../theme/colors";

const HERO_IMAGE = require("../../assets/login-hero.jpg");

// Android 12+ forces the native splash screen (configured via app.json/
// expo-splash-screen) into a small centered-icon layout — the platform
// itself doesn't allow a full-bleed photo there, no matter how it's
// configured. This is a JS-rendered stand-in shown the moment the native
// splash hides, so the same photo actually fills the screen while fonts
// (and anything else App.tsx gates on) finish loading.
export function AppSplash() {
  return (
    <View style={styles.container}>
      <Image source={HERO_IMAGE} resizeMode="cover" style={StyleSheet.absoluteFill} />
      <View style={styles.overlay} />
      <View style={styles.center}>
        <ActivityIndicator color={colors.onPrimary} size="large" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary },
  overlay: { ...StyleSheet.absoluteFill, backgroundColor: colors.primary, opacity: 0.55 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
