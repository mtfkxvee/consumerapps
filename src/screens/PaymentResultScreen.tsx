import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "../components/Screen";
import { Text } from "../components/Text";
import { Pressable } from "../components/Pressable";
import { colors, fonts, radius, spacing, typography } from "../theme/colors";
import { formatIDR } from "../lib/format";
import { getQuotationDetail, resumePayment } from "../lib/api/orders";

type Phase = "checking" | "paid" | "pending";

// Kept short on purpose: a Virtual Account / store payment is usually made
// in the bank app *after* the DOKU page closes, so a long wait here mostly
// just delays showing the (correct) "waiting for payment" state.
const POLL_INTERVAL_MS = 2500;
const POLL_ATTEMPTS = 5;

// DOKU confirms payment to our server via webhook, which converts the
// Quotation to a Sales Order (status "Ordered") — so after the browser
// closes we poll the Quotation until it flips, rather than trusting the
// redirect alone.
export function PaymentResultScreen() {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const { orderId } = useRoute().params as { orderId: string };

  const [phase, setPhase] = useState<Phase>("checking");
  const [total, setTotal] = useState<number | null>(null);
  const [retrying, setRetrying] = useState(false);
  const runId = useRef(0);

  const check = async () => {
    const id = ++runId.current;
    setPhase("checking");
    for (let i = 0; i < POLL_ATTEMPTS; i++) {
      const detail = await getQuotationDetail(orderId);
      if (id !== runId.current) return;
      if (detail) setTotal(detail.total);
      if (detail?.status === "Ordered") {
        setPhase("paid");
        queryClient.invalidateQueries({ queryKey: ["my-pesanan"] });
        return;
      }
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    }
    if (id === runId.current) setPhase("pending");
  };

  useEffect(() => {
    check();
    return () => {
      runId.current++;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const payAgain = async () => {
    setRetrying(true);
    const result = await resumePayment(orderId);
    setRetrying(false);
    if (!result.ok) return;
    await WebBrowser.openBrowserAsync(result.paymentUrl);
    check();
  };

  const goToOrders = () => {
    queryClient.invalidateQueries({ queryKey: ["my-pesanan"] });
    (navigation.navigate as (name: string, params?: object) => void)("Orders");
  };

  const goHome = () => (navigation.navigate as (name: string, params?: object) => void)("MainTabs");

  return (
    <Screen>
      <View style={styles.center}>
        {phase === "checking" && (
          <>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.title}>Memeriksa pembayaran…</Text>
            <Text style={styles.subtitle}>Mohon tunggu, kami sedang mengonfirmasi pembayaran Anda.</Text>
            <Pressable style={styles.linkButton} onPress={goToOrders}>
              <Text style={styles.linkText}>Lewati, lihat Pesanan Saya</Text>
            </Pressable>
          </>
        )}

        {phase === "paid" && (
          <>
            <View style={[styles.iconWrap, { backgroundColor: colors.primaryFixed }]}>
              <Ionicons name="checkmark-circle" size={56} color={colors.primary} />
            </View>
            <Text style={styles.title}>Pembayaran Berhasil</Text>
            <Text style={styles.subtitle}>Pesanan {orderId} sedang disiapkan oleh tim kami.</Text>
            {total != null && <Text style={styles.amount}>{formatIDR(total)}</Text>}
          </>
        )}

        {phase === "pending" && (
          <>
            <View style={[styles.iconWrap, { backgroundColor: colors.surfaceContainer }]}>
              <Ionicons name="time-outline" size={56} color={colors.onSurfaceVariant} />
            </View>
            <Text style={styles.title}>Menunggu Pembayaran</Text>
            <Text style={styles.subtitle}>
              Pembayaran untuk pesanan {orderId} belum kami terima. Jika Anda sudah membayar, status akan
              diperbarui otomatis dalam beberapa menit.
            </Text>
            {total != null && <Text style={styles.amount}>{formatIDR(total)}</Text>}
          </>
        )}
      </View>

      {phase !== "checking" && (
        <View style={styles.footer}>
          {phase === "pending" && (
            <>
              <Pressable style={styles.primaryButton} onPress={payAgain} disabled={retrying}>
                {retrying ? (
                  <ActivityIndicator color={colors.onPrimary} />
                ) : (
                  <Text style={styles.primaryText}>Bayar Sekarang</Text>
                )}
              </Pressable>
              <Pressable style={styles.secondaryButton} onPress={check}>
                <Text style={styles.secondaryText}>Periksa Ulang</Text>
              </Pressable>
            </>
          )}
          <Pressable style={phase === "paid" ? styles.primaryButton : styles.secondaryButton} onPress={goToOrders}>
            <Text style={phase === "paid" ? styles.primaryText : styles.secondaryText}>Lihat Pesanan Saya</Text>
          </Pressable>
          <Pressable style={styles.linkButton} onPress={goHome}>
            <Text style={styles.linkText}>Kembali ke Beranda</Text>
          </Pressable>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg, gap: spacing.sm },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  title: { ...typography.headlineMd, color: colors.onSurface, textAlign: "center", marginTop: spacing.sm },
  subtitle: { color: colors.onSurfaceVariant, fontSize: 13, textAlign: "center", lineHeight: 19 },
  amount: { fontSize: 20, fontFamily: fonts.body.extraBold, color: colors.onSurface, marginTop: spacing.sm },
  footer: { padding: spacing.md, gap: spacing.sm },
  primaryButton: {
    backgroundColor: colors.secondary,
    borderRadius: radius.full,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryText: { color: colors.white, fontFamily: fonts.body.bold, fontSize: 15 },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryText: { color: colors.primary, fontFamily: fonts.body.bold, fontSize: 15 },
  linkButton: { paddingVertical: spacing.sm, alignItems: "center" },
  linkText: { color: colors.onSurfaceVariant, fontSize: 13, fontFamily: fonts.body.semiBold },
});
