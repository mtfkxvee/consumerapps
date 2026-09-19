import { useRef, useState } from "react";
import { ActivityIndicator, Alert, Linking, StyleSheet, View } from "react-native";
import { WebView, type WebViewNavigation } from "react-native-webview";
import { StackActions, useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "../components/Screen";
import { Text } from "../components/Text";
import { Pressable } from "../components/Pressable";
import { colors, radius, spacing, typography } from "../theme/colors";

// DOKU's hosted checkout page shown inside the app instead of an external
// browser. When DOKU finishes it redirects to our return URL (a deep link
// like exp://…/payment-result or xsha://payment-result) — a WebView can't
// open that scheme, so we intercept it and hand off to PaymentResult, which
// confirms the payment against the server rather than trusting the redirect.
export function PaymentWebViewScreen() {
  const navigation = useNavigation();
  const { orderId, paymentUrl } = useRoute().params as { orderId: string; paymentUrl: string };
  const [loading, setLoading] = useState(true);
  const finished = useRef(false);

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    navigation.dispatch(StackActions.replace("PaymentResult", { orderId }));
  };

  const confirmClose = () => {
    Alert.alert(
      "Tutup halaman pembayaran?",
      "Pesanan tetap tersimpan. Anda bisa melanjutkan pembayaran dari Pesanan Saya kapan saja.",
      [
        { text: "Lanjut Bayar", style: "cancel" },
        { text: "Tutup", onPress: finish },
      ],
    );
  };

  const onShouldStart = (req: WebViewNavigation) => {
    const url = req.url;
    if (/^https?:\/\//i.test(url) || url === "about:blank") return true;
    if (url.includes("payment-result")) {
      finish();
      return false;
    }
    // e-wallet / banking app deep links (gopay://, intent://, …)
    Linking.openURL(url).catch(() => {});
    return false;
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={confirmClose} hitSlop={8}>
          <Ionicons name="close" size={24} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Pembayaran</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={{ flex: 1 }}>
        <WebView
          source={{ uri: paymentUrl }}
          onShouldStartLoadWithRequest={onShouldStart}
          onLoadEnd={() => setLoading(false)}
          setSupportMultipleWindows={false}
          style={{ flex: 1 }}
        />
        {loading && (
          <View style={styles.loading} pointerEvents="none">
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
      </View>

      <Pressable style={styles.doneBar} onPress={finish}>
        <Text style={styles.doneText}>Saya sudah membayar</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  headerTitle: { ...typography.headlineMd, color: colors.onSurface },
  loading: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  doneBar: {
    margin: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: 12,
    alignItems: "center",
  },
  doneText: { color: colors.primary, fontSize: 14, fontWeight: "700" },
});
