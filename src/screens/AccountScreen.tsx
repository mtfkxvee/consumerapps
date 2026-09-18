import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Screen } from "../components/Screen";
import { Text } from "../components/Text";
import { Pressable } from "../components/Pressable";
import { colors, fonts, radius, spacing, typography } from "../theme/colors";
import { useAuth } from "../state/AuthContext";
import { useTabBarSpace } from "../hooks/useTabBarSpace";
import { getMyLoyaltyStatus } from "../lib/api/loyalty";
import { LoginScreen } from "./LoginScreen";

export function AccountScreen() {
  const navigation = useNavigation();
  const { user, isLoading, isLoggedIn, logout } = useAuth();
  const tabBarSpace = useTabBarSpace();

  const {
    data: loyalty,
    refetch: refetchLoyalty,
    isFetching: loyaltyFetching,
  } = useQuery({
    queryKey: ["loyalty-status"],
    queryFn: () => getMyLoyaltyStatus(),
    enabled: isLoggedIn,
  });

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
        refreshControl={<RefreshControl refreshing={loyaltyFetching} onRefresh={() => refetchLoyalty()} />}
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

        <View style={styles.menuCard}>
          <Pressable style={styles.menuRow} onPress={() => navigation.navigate("Orders" as never)}>
            <Ionicons name="receipt-outline" size={18} color={colors.primary} />
            <Text style={styles.menuText}>Pesanan Saya</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.onSurfaceVariant} />
          </Pressable>
          <Pressable
            style={[styles.menuRow, { borderTopWidth: 1, borderTopColor: colors.border }]}
            onPress={() => navigation.navigate("Settings" as never)}
          >
            <Ionicons name="settings-outline" size={18} color={colors.primary} />
            <Text style={styles.menuText}>Pengaturan</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.onSurfaceVariant} />
          </Pressable>
        </View>

        <View style={styles.pointsCard}>
          <Ionicons name="star" size={28} color={colors.primary} />
          <Text style={styles.pointsLabel}>Saldo Poin Anda</Text>
          <Text style={styles.pointsValue}>{loyalty?.points ?? 0}</Text>
        </View>
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
  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: "hidden",
    marginBottom: spacing.lg,
    shadowColor: colors.primary,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  menuText: { flex: 1, fontSize: 13, fontFamily: fonts.body.semiBold, color: colors.onSurface },
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
  loadingCenter: { flex: 1, alignItems: "center", justifyContent: "center" },
});
