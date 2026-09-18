import { useState } from "react";
import { ActivityIndicator, Alert, FlatList, Image, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Screen } from "../components/Screen";
import { Text } from "../components/Text";
import { Pressable } from "../components/Pressable";
import { OutletPicker } from "../components/OutletPicker";
import { colors, fonts, radius, spacing, typography } from "../theme/colors";
import { formatIDR } from "../lib/format";
import { useCart } from "../state/CartContext";
import { useOutlet } from "../state/OutletContext";
import { checkStock } from "../lib/api/products";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Cart">;

export function CartScreen({ navigation }: Props) {
  const { items, remove, setQty, toggleSelected, selectAll, allSelected, selectedTotal } = useCart();
  const { selectedOutlet } = useOutlet();
  const insets = useSafeAreaInsets();
  const [checkingStock, setCheckingStock] = useState(false);

  // Verified against whichever outlet is currently selected, right before
  // handing off to Checkout — an outlet is required for this (there's no
  // single warehouse to check against for "Semua Outlet"), and catches an
  // item that's since sold out there instead of it only surfacing later.
  const handleCheckoutPress = async () => {
    if (!selectedOutlet) {
      Alert.alert("Pilih Outlet", "Pilih outlet terlebih dahulu untuk memeriksa ketersediaan barang.");
      return;
    }
    const selectedItems = items.filter((i) => i.selected);
    if (selectedItems.length === 0) return;

    setCheckingStock(true);
    const outOfStock = selectedOutlet.warehouse
      ? await checkStock(selectedItems.map((i) => i.id), selectedOutlet.warehouse)
      : [];
    setCheckingStock(false);

    if (outOfStock.length > 0) {
      const names = selectedItems.filter((i) => outOfStock.includes(i.id)).map((i) => i.name);
      Alert.alert(
        "Stok Tidak Tersedia",
        `Barang berikut tidak tersedia di ${selectedOutlet.name}:\n\n${names.join("\n")}\n\nHapus atau ganti outlet untuk melanjutkan.`,
      );
      return;
    }

    navigation.navigate("Checkout");
  };

  if (items.length === 0) {
    return (
      <Screen>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
            <Ionicons name="chevron-back" size={22} color={colors.onSurface} />
          </Pressable>
          <Text style={styles.headerTitle}>Keranjang Saya</Text>
          <View style={{ width: 22 }} />
        </View>
        <View style={styles.empty}>
          <Ionicons name="cart-outline" size={48} color={colors.onSurfaceVariant} />
          <Text style={styles.emptyText}>Keranjang Anda masih kosong.</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Keranjang Saya</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.outletRow}>
        <OutletPicker />
      </View>

      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: spacing.md, gap: spacing.sm }}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Pressable
              style={[styles.checkbox, item.selected && styles.checkboxChecked]}
              onPress={() => toggleSelected(item.id)}
              hitSlop={8}
            >
              {item.selected && <Ionicons name="checkmark" size={13} color={colors.onPrimary} />}
            </Pressable>

            <Image source={{ uri: item.image }} style={styles.image} />

            <View style={{ flex: 1 }}>
              <Text style={styles.itemName} numberOfLines={2}>
                {item.name}
              </Text>

              <View style={styles.priceRow}>
                <Text style={styles.itemPrice}>{formatIDR(item.price)}</Text>
                {item.oldPrice && item.oldPrice > item.price && (
                  <Text style={styles.oldPrice}>{formatIDR(item.oldPrice)}</Text>
                )}
              </View>

              <View style={styles.bottomRow}>
                <Pressable onPress={() => remove(item.id)} hitSlop={8}>
                  <Ionicons name="heart-outline" size={18} color={colors.onSurfaceVariant} />
                </Pressable>
                <View style={styles.qtyRow}>
                  <Pressable style={styles.qtyButton} onPress={() => setQty(item.id, item.qty - 1)}>
                    <Ionicons name="remove" size={14} color={colors.primary} />
                  </Pressable>
                  <Text style={styles.qtyText}>{item.qty}</Text>
                  <Pressable style={styles.qtyButton} onPress={() => setQty(item.id, item.qty + 1)}>
                    <Ionicons name="add" size={14} color={colors.primary} />
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.footerTopRow}>
          <Pressable style={styles.selectAllRow} onPress={() => selectAll(!allSelected)}>
            <View style={[styles.checkbox, allSelected && styles.checkboxChecked]}>
              {allSelected && <Ionicons name="checkmark" size={13} color={colors.onPrimary} />}
            </View>
            <Text style={styles.selectAllText}>Pilih Semua</Text>
          </Pressable>
          <View>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatIDR(selectedTotal)}</Text>
          </View>
        </View>
        <Pressable
          style={[
            styles.checkoutButton,
            (selectedTotal === 0 || checkingStock) && styles.checkoutButtonDisabled,
          ]}
          onPress={handleCheckoutPress}
          disabled={selectedTotal === 0 || checkingStock}
        >
          {checkingStock ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.checkoutText}>Checkout</Text>
          )}
        </Pressable>
      </View>
      <View style={{ height: insets.bottom, backgroundColor: colors.surface }} />
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
  outletRow: { paddingHorizontal: spacing.md, paddingBottom: spacing.xs },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.sm },
  emptyText: { color: colors.onSurfaceVariant },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.sm,
    alignItems: "flex-start",
    shadowColor: colors.primary,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.outline,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xs,
  },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  image: { width: 64, height: 64, borderRadius: radius.md, backgroundColor: colors.surfaceContainer },
  itemName: { fontSize: 13, fontFamily: fonts.body.semiBold, color: colors.onSurface, marginBottom: 4 },
  priceRow: { flexDirection: "row", alignItems: "baseline", gap: spacing.xs, marginBottom: spacing.xs },
  itemPrice: { fontSize: 14, fontFamily: fonts.body.extraBold, color: colors.onSurface },
  oldPrice: { fontSize: 11, color: colors.onSurfaceVariant, textDecorationLine: "line-through" },
  bottomRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  qtyButton: {
    width: 22,
    height: 22,
    borderRadius: radius.full,
    backgroundColor: colors.primaryFixed,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyText: {
    fontSize: 13,
    fontFamily: fonts.body.bold,
    color: colors.onSurface,
    minWidth: 14,
    textAlign: "center",
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  footerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  selectAllRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  selectAllText: { fontSize: 13, color: colors.onSurface, fontFamily: fonts.body.semiBold },
  totalLabel: { fontSize: 11, color: colors.onSurfaceVariant, textAlign: "right" },
  totalValue: { ...typography.headlineMd, fontSize: 18, color: colors.onSurface },
  checkoutButton: {
    backgroundColor: colors.secondary,
    borderRadius: radius.full,
    paddingVertical: 14,
    alignItems: "center",
  },
  checkoutButtonDisabled: { opacity: 0.4 },
  checkoutText: { color: colors.white, fontFamily: fonts.body.bold, fontSize: 15 },
});
