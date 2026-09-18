import { useMemo, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "../components/Screen";
import { Text } from "../components/Text";
import { Pressable } from "../components/Pressable";
import { colors, fonts, radius, spacing, typography } from "../theme/colors";
import { formatIDR } from "../lib/format";
import { getMyOrders, getMyPesanan, resumePayment } from "../lib/api/orders";
import type { OrderStage } from "../lib/types";

type Tab = OrderStage;

const TABS: { key: Tab; label: string }[] = [
  { key: "unpaid", label: "Belum Dibayar" },
  { key: "preparing", label: "Disiapkan" },
  { key: "shipping", label: "Pengiriman" },
  { key: "completed", label: "Diterima" },
];

// Raw Delivery Request statuses (see erp.x-sha.id Delivery Request doctype)
// translated for display.
const DELIVERY_STATUS_LABELS: Record<string, string> = {
  Pending: "Menunggu Penugasan",
  Ditugaskan: "Ditugaskan ke Kurir",
  "Dalam Perjalanan": "Dalam Perjalanan",
  Terkirim: "Terkirim",
  Gagal: "Pengiriman Gagal",
};

// One row shape for every tab — "completed" merges the app's own paid-and-
// delivered orders (Pesanan) with the existing in-store Sales Invoice
// history (Order), which is why this exists instead of just using Pesanan
// directly. Every row is tappable; `source` tells OrderDetailScreen which
// endpoint to resolve the item breakdown from (Quotation vs Sales Invoice).
type Row = {
  id: string;
  date: string;
  total: number;
  statusText: string;
  resumable: boolean;
  source: "pesanan" | "invoice";
};

export function OrdersScreen() {
  const navigation = useNavigation();
  const [tab, setTab] = useState<Tab>("unpaid");
  const [resumingId, setResumingId] = useState<string | null>(null);

  const {
    data: pesanan,
    isLoading: pesananLoading,
    isError: pesananError,
    isFetching: pesananFetching,
    refetch: refetchPesanan,
  } = useQuery({ queryKey: ["my-pesanan"], queryFn: () => getMyPesanan() });

  const {
    data: invoices,
    isLoading: invoicesLoading,
    isFetching: invoicesFetching,
    refetch: refetchInvoices,
  } = useQuery({ queryKey: ["my-orders"], queryFn: () => getMyOrders() });

  const isLoading = pesananLoading || (tab === "completed" && invoicesLoading);
  const isFetching = pesananFetching || invoicesFetching;

  const refetch = () => {
    refetchPesanan();
    refetchInvoices();
  };

  const rows = useMemo((): Row[] => {
    const fromPesanan = (pesanan ?? [])
      .filter((p) => p.stage === tab)
      .map(
        (p): Row => ({
          id: p.id,
          date: p.date,
          total: p.total,
          statusText:
            tab === "shipping" && p.deliveryStatus
              ? (DELIVERY_STATUS_LABELS[p.deliveryStatus] ?? p.deliveryStatus)
              : tab === "unpaid"
                ? "Menunggu Pembayaran"
                : tab === "preparing"
                  ? "Sedang Disiapkan"
                  : "Diterima",
          resumable: tab === "unpaid",
          source: "pesanan",
        }),
      );

    if (tab !== "completed") return fromPesanan;

    const fromInvoices = (invoices ?? []).map(
      (o): Row => ({
        id: o.id,
        date: o.date,
        total: o.total,
        statusText: o.status,
        resumable: false,
        source: "invoice",
      }),
    );

    return [...fromPesanan, ...fromInvoices].sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [pesanan, invoices, tab]);

  const handleResume = async (id: string) => {
    setResumingId(id);
    const result = await resumePayment(id);
    setResumingId(null);
    if (!result.ok) return;
    await WebBrowser.openBrowserAsync(result.paymentUrl);
    refetch();
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Pesanan Saya</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabScroll}
        contentContainerStyle={styles.tabRow}
      >
        {TABS.map((item) => {
          const active = tab === item.key;
          return (
            <Pressable
              key={item.key}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => setTab(item.key)}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {pesananError ? (
        <View style={styles.center}>
          <Pressable style={styles.errorBox} onPress={refetch}>
            <Text style={styles.errorText}>Gagal memuat pesanan. Ketuk untuk coba lagi.</Text>
          </Pressable>
        </View>
      ) : isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(r) => r.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} />}
          ListEmptyComponent={<Text style={styles.empty}>Tidak ada pesanan di tahap ini.</Text>}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() =>
                (navigation.navigate as (name: string, params?: object) => void)("OrderDetail", {
                  id: item.id,
                  source: item.source,
                })
              }
            >
              <View style={styles.cardTopRow}>
                <Text style={styles.orderId}>{item.id}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{item.statusText}</Text>
                </View>
              </View>
              <Text style={styles.orderDate}>{item.date}</Text>
              <View style={styles.cardBottomRow}>
                <Text style={styles.orderTotal}>{formatIDR(item.total)}</Text>
                {item.resumable && (
                  <Pressable
                    style={styles.resumeButton}
                    onPress={() => handleResume(item.id)}
                    disabled={resumingId === item.id}
                  >
                    {resumingId === item.id ? (
                      <ActivityIndicator size="small" color={colors.onPrimary} />
                    ) : (
                      <Text style={styles.resumeButtonText}>Lanjutkan Pembayaran</Text>
                    )}
                  </Pressable>
                )}
              </View>
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
  tabScroll: { flexGrow: 0, flexShrink: 0 },
  tabRow: {
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    alignItems: "center",
  },
  tab: {
    height: 32,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainer,
  },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontSize: 12, fontFamily: fonts.body.semiBold, color: colors.onSurfaceVariant },
  tabTextActive: { color: colors.onPrimary },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg },
  errorBox: { padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.errorContainer },
  errorText: { color: colors.error, fontSize: 13, fontFamily: fonts.body.semiBold, textAlign: "center" },
  list: { padding: spacing.md, gap: spacing.sm },
  empty: { textAlign: "center", color: colors.onSurfaceVariant, paddingVertical: spacing.xxl },
  card: {
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
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  orderId: { fontSize: 13, fontFamily: fonts.body.bold, color: colors.onSurface },
  orderDate: { fontSize: 11, color: colors.onSurfaceVariant, marginBottom: spacing.sm },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
    backgroundColor: colors.primaryFixed,
  },
  statusText: { fontSize: 10, fontFamily: fonts.body.bold, color: colors.primary },
  cardBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderTotal: { fontSize: 15, fontFamily: fonts.body.extraBold, color: colors.onSurface },
  resumeButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  resumeButtonText: { color: colors.onPrimary, fontFamily: fonts.body.bold, fontSize: 12 },
});
