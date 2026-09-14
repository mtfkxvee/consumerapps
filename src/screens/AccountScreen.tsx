import { useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Screen } from "../components/Screen";
import { colors, radius, spacing, typography, TAB_BAR_SPACE } from "../theme/colors";
import { formatIDR } from "../lib/format";
import { useAuth } from "../state/AuthContext";
import { getMyLoyaltyStatus } from "../lib/api/loyalty";
import { getMyOrders } from "../lib/api/orders";
import { LoginScreen } from "./LoginScreen";

export function AccountScreen() {
  const { user, isLoading, isLoggedIn, logout } = useAuth();

  const { data: loyalty } = useQuery({
    queryKey: ["loyalty-status"],
    queryFn: () => getMyLoyaltyStatus(),
    enabled: isLoggedIn,
  });

  const { data: orders } = useQuery({
    queryKey: ["my-orders"],
    queryFn: () => getMyOrders(),
    enabled: isLoggedIn,
  });

  if (isLoading) return <Screen />;
  if (!isLoggedIn) return <LoginScreen />;

  const displayName = user?.customer?.name ?? user?.email ?? "";

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: TAB_BAR_SPACE }}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Akun Saya</Text>
            <Text style={styles.greeting}>
              Halo, <Text style={{ color: colors.primary, fontWeight: "700" }}>{displayName}</Text>
            </Text>
          </View>
          <Pressable style={styles.logoutButton} onPress={logout}>
            <Ionicons name="log-out-outline" size={16} color={colors.error} />
            <Text style={styles.logoutText}>Keluar</Text>
          </Pressable>
        </View>

        <View style={styles.memberCard}>
          <Text style={styles.memberLevel}>{loyalty?.level ?? "Member"}</Text>
          <Text style={styles.memberName}>{displayName}</Text>
          <View style={styles.memberFooter}>
            <Text style={styles.memberId}>{user?.customer?.id}</Text>
            <Ionicons name="qr-code-outline" size={28} color={colors.onPrimary} />
          </View>
        </View>

        <View style={styles.pointsCard}>
          <Ionicons name="star" size={28} color={colors.primary} />
          <Text style={styles.pointsLabel}>Saldo Poin Anda</Text>
          <Text style={styles.pointsValue}>{loyalty?.points ?? 0}</Text>
        </View>

        <Text style={styles.sectionTitle}>Riwayat Transaksi</Text>
        {(orders?.length ?? 0) === 0 ? (
          <View style={styles.card}>
            <Text style={styles.emptyText}>Belum ada transaksi.</Text>
          </View>
        ) : (
          <View style={styles.card}>
            {orders?.map((o, idx) => (
              <View
                key={o.id}
                style={[styles.orderRow, idx > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}
              >
                <View>
                  <Text style={styles.orderId}>{o.id}</Text>
                  <Text style={styles.orderDate}>{o.date}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.orderTotal}>{formatIDR(o.total)}</Text>
                  <Text style={styles.orderStatus}>{o.status}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  title: { ...typography.headlineLg, fontSize: 22, color: colors.onSurface },
  greeting: { color: colors.onSurfaceVariant, marginTop: 2 },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  logoutText: { color: colors.error, fontSize: 12, fontWeight: "700" },
  memberCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    minHeight: 140,
    justifyContent: "space-between",
  },
  memberLevel: { color: colors.primaryFixed, fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
  memberName: { color: colors.onPrimary, fontSize: 20, fontWeight: "800", marginTop: 4 },
  memberFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  memberId: { color: colors.primaryFixed, fontSize: 12, letterSpacing: 1 },
  pointsCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  pointsLabel: { color: colors.onSurfaceVariant, fontSize: 12, marginTop: spacing.xs },
  pointsValue: { ...typography.display, color: colors.primary, marginTop: 4 },
  sectionTitle: { ...typography.headlineMd, fontSize: 16, color: colors.onSurface, marginBottom: spacing.sm },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  emptyText: { color: colors.onSurfaceVariant, textAlign: "center", padding: spacing.lg },
  orderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: spacing.md,
  },
  orderId: { fontWeight: "700", color: colors.onSurface, fontSize: 13 },
  orderDate: { color: colors.onSurfaceVariant, fontSize: 12 },
  orderTotal: { fontWeight: "800", color: colors.onSurface, fontSize: 13 },
  orderStatus: { color: colors.success, fontSize: 11, fontWeight: "700" },
});
