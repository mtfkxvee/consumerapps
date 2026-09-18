import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Screen } from "../components/Screen";
import { Text } from "../components/Text";
import { Pressable } from "../components/Pressable";
import { colors, fonts, radius, spacing, typography } from "../theme/colors";
import { formatIDR } from "../lib/format";
import { useAuth } from "../state/AuthContext";
import { useTabBarSpace } from "../hooks/useTabBarSpace";
import { getMyLoyaltyStatus } from "../lib/api/loyalty";
import { getMyOrders } from "../lib/api/orders";
import { LoginScreen } from "./LoginScreen";

export function AccountScreen() {
  const navigation = useNavigation();
  const { user, isLoading, isLoggedIn, logout } = useAuth();
  const tabBarSpace = useTabBarSpace();

  const { data: loyalty, refetch: refetchLoyalty, isFetching: loyaltyFetching } = useQuery({
    queryKey: ["loyalty-status"],
    queryFn: () => getMyLoyaltyStatus(),
    enabled: isLoggedIn,
  });

  const {
    data: orders,
    isLoading: ordersLoading,
    isFetching: ordersFetching,
    isError: ordersError,
    refetch: refetchOrders,
  } = useQuery({
    queryKey: ["my-orders"],
    queryFn: () => getMyOrders(),
    enabled: isLoggedIn,
  });

  const refreshing = !ordersLoading && (ordersFetching || loyaltyFetching);
  const onRefresh = () => {
    refetchLoyalty();
    refetchOrders();
  };

  if (isLoading) {
    return (
      <Screen>
        <View style={styles.loadingCenter}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </Screen>
    );
  }
  if (!isLoggedIn) return <LoginScreen />;

  const displayName = user?.customer?.name ?? user?.email ?? "";

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ padding: spacing.md, paddingBottom: tabBarSpace }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Akun Saya</Text>
            <Text style={styles.greeting}>
              Halo,{" "}
              <Text style={{ color: colors.primary, fontFamily: fonts.body.bold }}>{displayName}</Text>
            </Text>
          </View>
          <Pressable style={styles.logoutButton} onPress={logout}>
            <Ionicons name="log-out-outline" size={16} color={colors.error} />
            <Text style={styles.logoutText}>Keluar</Text>
          </Pressable>
        </View>

        <Pressable style={styles.memberCard} onPress={() => navigation.navigate("MemberBarcode" as never)}>
          <Text style={styles.memberLevel}>{loyalty?.level ?? "Member"}</Text>
          <Text style={styles.memberName}>{displayName}</Text>
          <View style={styles.memberFooter}>
            <Text style={styles.memberId}>{user?.customer?.kodePelanggan ?? user?.customer?.id}</Text>
            <Ionicons name="barcode-outline" size={28} color={colors.onPrimary} />
          </View>
        </Pressable>

        <Pressable
          style={styles.editProfileRow}
          onPress={() => navigation.navigate("EditProfile" as never)}
        >
          <Ionicons name="create-outline" size={16} color={colors.primary} />
          <Text style={styles.editProfileText}>Ubah Data Diri</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.onSurfaceVariant} />
        </Pressable>

        <View style={styles.pointsCard}>
          <Ionicons name="star" size={28} color={colors.primary} />
          <Text style={styles.pointsLabel}>Saldo Poin Anda</Text>
          <Text style={styles.pointsValue}>{loyalty?.points ?? 0}</Text>
        </View>

        <Text style={styles.sectionTitle}>Riwayat Transaksi</Text>
        {ordersError ? (
          <Pressable style={styles.errorBox} onPress={() => refetchOrders()}>
            <Text style={styles.errorText}>Gagal memuat riwayat transaksi. Ketuk untuk coba lagi.</Text>
          </Pressable>
        ) : ordersLoading ? (
          <View style={styles.card}>
            <ActivityIndicator color={colors.primary} style={{ padding: spacing.lg }} />
          </View>
        ) : (orders?.length ?? 0) === 0 ? (
          <View style={styles.card}>
            <Text style={styles.emptyText}>Belum ada transaksi.</Text>
          </View>
        ) : (
          <View style={styles.card}>
            {orders?.map((o, idx) => (
              <Pressable
                key={o.id}
                style={[styles.orderRow, idx > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}
                onPress={() =>
                  (navigation.navigate as (name: string, params?: object) => void)("OrderDetail", {
                    id: o.id,
                  })
                }
              >
                <View>
                  <Text style={styles.orderId}>{o.id}</Text>
                  <Text style={styles.orderDate}>{o.date}</Text>
                </View>
                <View style={{ alignItems: "flex-end", flexDirection: "row", gap: 6 }}>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.orderTotal}>{formatIDR(o.total)}</Text>
                    <Text style={styles.orderStatus}>{o.status}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.onSurfaceVariant} />
                </View>
              </Pressable>
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
  logoutText: { color: colors.error, fontSize: 12, fontFamily: fonts.body.bold },
  memberCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    minHeight: 140,
    justifyContent: "space-between",
  },
  memberLevel: {
    color: colors.primaryFixed,
    fontSize: 11,
    fontFamily: fonts.body.bold,
    textTransform: "uppercase",
  },
  memberName: { color: colors.onPrimary, fontSize: 20, fontFamily: fonts.display.extraBold, marginTop: 4 },
  memberFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  memberId: { color: colors.primaryFixed, fontSize: 12, letterSpacing: 1 },
  editProfileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
    shadowColor: colors.primary,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  editProfileText: { flex: 1, fontSize: 13, fontFamily: fonts.body.semiBold, color: colors.onSurface },
  pointsCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    alignItems: "center",
    marginBottom: spacing.lg,
    shadowColor: colors.primary,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  pointsLabel: { color: colors.onSurfaceVariant, fontSize: 12, marginTop: spacing.xs },
  pointsValue: { ...typography.display, color: colors.primary, marginTop: 4 },
  sectionTitle: { ...typography.headlineMd, fontSize: 16, color: colors.onSurface, marginBottom: spacing.sm },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: "hidden",
    shadowColor: colors.primary,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  emptyText: { color: colors.onSurfaceVariant, textAlign: "center", padding: spacing.lg },
  errorBox: {
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.errorContainer,
    alignItems: "center",
  },
  errorText: { color: colors.error, fontSize: 13, fontFamily: fonts.body.semiBold, textAlign: "center" },
  orderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: spacing.md,
  },
  orderId: { fontFamily: fonts.body.bold, color: colors.onSurface, fontSize: 13 },
  orderDate: { color: colors.onSurfaceVariant, fontSize: 12 },
  orderTotal: { fontFamily: fonts.body.extraBold, color: colors.onSurface, fontSize: 13 },
  orderStatus: { color: colors.success, fontSize: 11, fontFamily: fonts.body.bold },
  loadingCenter: { flex: 1, alignItems: "center", justifyContent: "center" },
});
