import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "../components/Screen";
import { Text } from "../components/Text";
import { Pressable } from "../components/Pressable";
import { colors, fonts, radius, spacing, typography, TAB_BAR_SPACE } from "../theme/colors";
import { formatIDR } from "../lib/format";
import { getOrderDetail } from "../lib/api/orders";

export function OrderDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params as { id: string };

  const {
    data: order,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["order-detail", id],
    queryFn: () => getOrderDetail(id),
  });

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Detail Pesanan</Text>
        <View style={{ width: 24 }} />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : isError || !order ? (
        <View style={styles.center}>
          <Pressable style={styles.errorBox} onPress={() => refetch()}>
            <Text style={styles.errorText}>Gagal memuat pesanan. Ketuk untuk coba lagi.</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={order.items}
          keyExtractor={(line) => line.itemCode}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>No. Pesanan</Text>
                <Text style={styles.summaryValue}>{order.id}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tanggal</Text>
                <Text style={styles.summaryValue}>{order.date}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Status</Text>
                <Text style={[styles.summaryValue, styles.statusValue]}>{order.status}</Text>
              </View>
              <View style={[styles.summaryRow, { marginTop: spacing.xs }]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{formatIDR(order.total)}</Text>
              </View>
            </View>
          }
          ListEmptyComponent={<Text style={styles.empty}>Rincian item tidak tersedia.</Text>}
          ItemSeparatorComponent={() => <View style={{ height: spacing.xs }} />}
          renderItem={({ item }) => (
            <View style={styles.itemRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.itemName}
                </Text>
                <Text style={styles.itemMeta}>
                  {item.qty} {item.uom} &times; {formatIDR(item.rate)}
                </Text>
              </View>
              <Text style={styles.itemAmount}>{formatIDR(item.amount)}</Text>
            </View>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
  },
  headerTitle: { ...typography.headlineMd, fontSize: 16, color: colors.onSurface },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg },
  errorBox: { padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.errorContainer },
  errorText: { color: colors.error, fontSize: 13, fontFamily: fonts.body.semiBold, textAlign: "center" },
  list: { padding: spacing.md, paddingBottom: TAB_BAR_SPACE },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: colors.primary,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  summaryLabel: { fontSize: 12, color: colors.onSurfaceVariant },
  summaryValue: { fontSize: 12, fontFamily: fonts.body.semiBold, color: colors.onSurface },
  statusValue: { color: colors.success },
  totalLabel: { fontSize: 13, fontFamily: fonts.body.bold, color: colors.onSurface },
  totalValue: { fontSize: 15, fontFamily: fonts.body.extraBold, color: colors.primary },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  itemName: { fontSize: 13, fontFamily: fonts.body.semiBold, color: colors.onSurface },
  itemMeta: { fontSize: 11, color: colors.onSurfaceVariant, marginTop: 2 },
  itemAmount: { fontSize: 13, fontFamily: fonts.body.bold, color: colors.onSurface },
  empty: { textAlign: "center", color: colors.onSurfaceVariant, paddingVertical: spacing.xxl },
});
