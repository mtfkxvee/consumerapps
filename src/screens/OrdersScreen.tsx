import { useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "../components/Screen";
import { Text } from "../components/Text";
import { Pressable } from "../components/Pressable";
import { colors, fonts, radius, spacing, typography } from "../theme/colors";
import { formatIDR } from "../lib/format";
import { getMyQuotations, resumePayment } from "../lib/api/orders";
import type { QuotationOrder } from "../lib/types";

// Raw ERPNext Quotation statuses, mapped to what a shopper should actually
// see — "Ordered" means DOKU confirmed payment and it became a Sales
// Order; everything else still needs the shopper's attention.
const STATUS_LABELS: Record<string, string> = {
  Open: "Menunggu Pembayaran",
  Ordered: "Sedang Diproses",
  Cancelled: "Dibatalkan",
  Expired: "Kedaluwarsa",
  Lost: "Dibatalkan",
};

function statusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

function isResumable(status: string): boolean {
  return status !== "Ordered" && status !== "Cancelled" && status !== "Expired" && status !== "Lost";
}

function statusTone(status: string): "pending" | "done" | "muted" {
  if (status === "Ordered") return "done";
  if (status === "Cancelled" || status === "Expired" || status === "Lost") return "muted";
  return "pending";
}

export function OrdersScreen() {
  const navigation = useNavigation();
  const [resumingId, setResumingId] = useState<string | null>(null);

  const {
    data: orders,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["my-quotations"],
    queryFn: () => getMyQuotations(),
  });

  const handleResume = async (id: string) => {
    setResumingId(id);
    const result = await resumePayment(id);
    setResumingId(null);

    if (!result.ok) {
      return;
    }
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

      {isError ? (
        <View style={styles.center}>
          <Pressable style={styles.errorBox} onPress={() => refetch()}>
            <Text style={styles.errorText}>Gagal memuat pesanan. Ketuk untuk coba lagi.</Text>
          </Pressable>
        </View>
      ) : isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => o.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={isFetching && !isLoading} onRefresh={() => refetch()} />
          }
          ListEmptyComponent={<Text style={styles.empty}>Belum ada pesanan.</Text>}
          renderItem={({ item }: { item: QuotationOrder }) => {
            const tone = statusTone(item.status);
            return (
              <View style={styles.card}>
                <View style={styles.cardTopRow}>
                  <Text style={styles.orderId}>{item.id}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      tone === "done" && styles.statusBadgeDone,
                      tone === "muted" && styles.statusBadgeMuted,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        tone === "done" && styles.statusTextDone,
                        tone === "muted" && styles.statusTextMuted,
                      ]}
                    >
                      {statusLabel(item.status)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.orderDate}>{item.date}</Text>
                <View style={styles.cardBottomRow}>
                  <Text style={styles.orderTotal}>{formatIDR(item.total)}</Text>
                  {isResumable(item.status) && (
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
              </View>
            );
          }}
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
    backgroundColor: "#FFF3D6",
  },
  statusBadgeDone: { backgroundColor: colors.successContainer },
  statusBadgeMuted: { backgroundColor: colors.surfaceContainer },
  statusText: { fontSize: 10, fontFamily: fonts.body.bold, color: "#8A6A1E" },
  statusTextDone: { color: colors.success },
  statusTextMuted: { color: colors.onSurfaceVariant },
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
