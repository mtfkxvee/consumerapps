import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Platform, RefreshControl, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "../components/Screen";
import { Text } from "../components/Text";
import { Pressable } from "../components/Pressable";
import { colors, fonts, radius, spacing, typography } from "../theme/colors";
import { getMyPesanan } from "../lib/api/orders";
import { DELIVERY_STATUS_LABELS } from "../lib/orderStage";
import type { OrderStage, Pesanan } from "../lib/types";

type NotificationItem = {
  // Identifies this exact notification state — the order plus the stage (and
  // courier status) it's at — so clearing it hides only what the customer
  // has already seen, and a later status change shows up as a new one.
  key: string;
  id: string;
  // Document number shown in the message / detail header.
  no: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  date: string;
};

const STAGE_ICON: Record<OrderStage, keyof typeof Ionicons.glyphMap> = {
  unpaid: "time-outline",
  preparing: "cube-outline",
  shipping: "bicycle-outline",
  completed: "checkmark-circle-outline",
};

// Notifications derived from the customer's own Pesanan lifecycle — the
// only asynchronous, "you should know about this" events the app currently
// has. In-store purchases (Riwayat Transaksi) aren't included since the
// customer was there in person and already knows.
function toNotification(p: Pesanan): NotificationItem {
  const key = `${p.id}|${p.stage}|${p.deliveryStatus ?? ""}`;
  // Show the document number "Pesanan Saya" shows for this stage.
  const no = p.displayId;
  if (p.stage === "unpaid") {
    return {
      key,
      no,
      id: p.id,
      icon: STAGE_ICON.unpaid,
      title: "Menunggu Pembayaran",
      message: `Pesanan ${no} menunggu pembayaran Anda.`,
      date: p.date,
    };
  }
  if (p.stage === "preparing") {
    return {
      key,
      no,
      id: p.id,
      icon: STAGE_ICON.preparing,
      title: "Pesanan Sedang Disiapkan",
      message: `Pesanan ${no} sedang disiapkan oleh tim kami.`,
      date: p.date,
    };
  }
  if (p.stage === "shipping") {
    const statusLabel = p.deliveryStatus ? (DELIVERY_STATUS_LABELS[p.deliveryStatus] ?? p.deliveryStatus) : null;
    return {
      key,
      no,
      id: p.id,
      icon: STAGE_ICON.shipping,
      title: "Pesanan Dalam Pengiriman",
      message: statusLabel
        ? `Pesanan ${no}: ${statusLabel}.`
        : `Pesanan ${no} sedang dalam proses pengiriman.`,
      date: p.date,
    };
  }
  return {
    key,
    no,
    id: p.id,
    icon: STAGE_ICON.completed,
    title: "Pesanan Diterima",
    message: `Pesanan ${no} telah diterima. Terima kasih!`,
    date: p.date,
  };
}

const DISMISSED_KEY = "xsha_dismissed_notifications";
// Old entries only matter while their order is still in the (20-row) list.
const MAX_DISMISSED = 200;

export function NotificationsScreen() {
  const navigation = useNavigation();
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(DISMISSED_KEY)
      .then((stored) => {
        if (stored) setDismissed(JSON.parse(stored) as string[]);
      })
      .catch(() => {});
  }, []);

  const dismiss = useCallback((keys: string[]) => {
    setDismissed((prev) => {
      const next = [...new Set([...prev, ...keys])].slice(-MAX_DISMISSED);
      AsyncStorage.setItem(DISMISSED_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const { data: pesanan, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ["my-pesanan"],
    queryFn: () => getMyPesanan(),
  });

  const items = [...(pesanan ?? [])]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map(toNotification)
    .filter((item) => !dismissed.includes(item.key));

  const clearAll = () => {
    dismiss(items.map((item) => item.key));
    // Also sweep the same pushes out of the phone's notification shade.
    if (Platform.OS !== "web") Notifications.dismissAllNotificationsAsync().catch(() => {});
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Notifikasi</Text>
        {items.length > 0 ? (
          <Pressable onPress={clearAll} hitSlop={8}>
            <Text style={styles.clearText}>Hapus semua</Text>
          </Pressable>
        ) : (
          <View style={{ width: 22 }} />
        )}
      </View>

      {isError ? (
        <View style={styles.center}>
          <Pressable style={styles.errorBox} onPress={() => refetch()}>
            <Text style={styles.errorText}>Gagal memuat notifikasi. Ketuk untuk coba lagi.</Text>
          </Pressable>
        </View>
      ) : isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !isLoading}
              onRefresh={() => refetch()}
              tintColor={colors.primary}
              colors={[colors.primary]}
              progressBackgroundColor={colors.surface}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="notifications-off-outline" size={36} color={colors.onSurfaceVariant} />
              <Text style={styles.emptyText}>Belum ada notifikasi.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() =>
                (navigation.navigate as (name: string, params?: object) => void)("OrderDetail", {
                  id: item.id,
                  source: "pesanan",
                  label: item.no,
                })
              }
            >
              <View style={styles.iconWrap}>
                <Ionicons name={item.icon} size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardMessage}>{item.message}</Text>
                <Text style={styles.cardDate}>{item.date}</Text>
              </View>
              <Pressable onPress={() => dismiss([item.key])} hitSlop={10} style={styles.dismiss}>
                <Ionicons name="close" size={16} color={colors.onSurfaceVariant} />
              </Pressable>
            </Pressable>
          )}
        />
      )}
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
    paddingBottom: spacing.xs,
  },
  headerTitle: { ...typography.headlineMd, color: colors.onSurface },
  clearText: { fontSize: 12, fontFamily: fonts.body.semiBold, color: colors.primary },
  dismiss: { alignSelf: "flex-start", padding: 2 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg },
  errorBox: { padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.errorContainer },
  errorText: { color: colors.error, fontSize: 13, fontFamily: fonts.body.semiBold, textAlign: "center" },
  list: { padding: spacing.md, gap: spacing.sm, flexGrow: 1 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.sm, paddingVertical: spacing.xxl },
  emptyText: { color: colors.onSurfaceVariant, fontSize: 13 },
  card: {
    flexDirection: "row",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: colors.primary,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.primaryFixed,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontSize: 13, fontFamily: fonts.body.bold, color: colors.onSurface },
  cardMessage: { fontSize: 12, color: colors.onSurfaceVariant, marginTop: 2 },
  cardDate: { fontSize: 10, color: colors.onSurfaceVariant, marginTop: 4 },
});
