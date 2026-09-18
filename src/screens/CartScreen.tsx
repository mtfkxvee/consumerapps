import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Linking,
  Modal,
  StyleSheet,
  View,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Screen } from "../components/Screen";
import { Text } from "../components/Text";
import { Pressable } from "../components/Pressable";
import { colors, fonts, radius, spacing, typography } from "../theme/colors";
import { formatIDR } from "../lib/format";
import { useCart } from "../state/CartContext";
import { useAuth } from "../state/AuthContext";
import { createOrder } from "../lib/api/orders";
import { WHATSAPP_NUMBER } from "../lib/mock-data";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Cart">;

export function CartScreen({ navigation }: Props) {
  const { items, remove, setQty, toggleSelected, selectAll, allSelected, selectedTotal } = useCart();
  const { isLoggedIn } = useAuth();
  const insets = useSafeAreaInsets();
  const [checkingOut, setCheckingOut] = useState(false);
  const [methodSheetOpen, setMethodSheetOpen] = useState(false);

  const sendToWhatsapp = (selectedItems: typeof items) => {
    const lines = selectedItems
      .map((i) => `- ${i.name} x${i.qty} (${formatIDR(i.price * i.qty)})`)
      .join("\n");
    const message = `Halo X-SHA, saya ingin memesan:\n${lines}\n\nTotal: ${formatIDR(selectedTotal)}`;
    Linking.openURL(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`);
  };

  // "Manual" always ends up on WhatsApp regardless of what the order
  // creation returns (the shopper explicitly chose to coordinate with
  // staff directly, not to pay online) — "Otomatis" opens DOKU's payment
  // page when the backend provides one, so staff no longer have to chase
  // payment confirmation over chat for that order.
  const checkout = async (method: "manual" | "automatic") => {
    setMethodSheetOpen(false);
    const selectedItems = items.filter((i) => i.selected);
    if (selectedItems.length === 0) return;

    setCheckingOut(true);
    if (isLoggedIn) {
      const result = await createOrder(
        selectedItems.map((i) => ({ itemCode: i.id, itemName: i.name, qty: i.qty, rate: i.price })),
      );
      setCheckingOut(false);

      if (method === "automatic") {
        if (result.ok && result.paymentUrl) {
          await WebBrowser.openBrowserAsync(result.paymentUrl);
          Alert.alert(
            "Pembayaran diproses",
            `Pesanan ${result.orderId} dibuat. Cek status pembayarannya di Riwayat Transaksi.`,
          );
          return;
        }
        Alert.alert(
          "Pembayaran otomatis belum tersedia",
          result.ok
            ? `Pesanan ${result.orderId} tetap tersimpan di akun Anda. Silakan gunakan Checkout Manual untuk saat ini.`
            : "Coba gunakan Checkout Manual untuk saat ini.",
        );
        return;
      }

      if (result.ok) {
        Alert.alert("Pesanan tercatat", `Pesanan ${result.orderId} tersimpan di akun X-SHA Anda.`);
      } else if (result.reason === "erpnext_error") {
        Alert.alert(
          "Belum tercatat di sistem",
          "Pesanan belum tersimpan di akun, tapi tetap bisa dikirim via WhatsApp.",
        );
      }
    } else {
      setCheckingOut(false);
    }

    sendToWhatsapp(selectedItems);
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
          style={[styles.checkoutButton, (selectedTotal === 0 || checkingOut) && styles.checkoutButtonDisabled]}
          onPress={() => setMethodSheetOpen(true)}
          disabled={selectedTotal === 0 || checkingOut}
        >
          {checkingOut ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.checkoutText}>Checkout</Text>
          )}
        </Pressable>
        {!isLoggedIn && (
          <Text style={styles.loginHint}>Masuk ke akun Anda agar pesanan tersimpan otomatis.</Text>
        )}
      </View>
      <View style={{ height: insets.bottom, backgroundColor: colors.surface }} />

      <Modal
        visible={methodSheetOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setMethodSheetOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setMethodSheetOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.grabber} />
            <Text style={styles.sheetTitle}>Pilih Cara Checkout</Text>
            <Text style={styles.sheetHint}>Pilih cara Anda ingin menyelesaikan pesanan ini.</Text>

            <Pressable style={styles.methodOption} onPress={() => checkout("automatic")}>
              <View style={[styles.methodIconWrap, { backgroundColor: colors.primaryFixed }]}>
                <Ionicons name="card-outline" size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.methodTitle}>Checkout Otomatis</Text>
                <Text style={styles.methodDesc}>
                  Bayar langsung online (transfer, e-wallet, kartu, dll). Pesanan diproses otomatis
                  setelah pembayaran berhasil.
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.onSurfaceVariant} />
            </Pressable>

            <Pressable style={styles.methodOption} onPress={() => checkout("manual")}>
              <View style={[styles.methodIconWrap, { backgroundColor: "#DCF3E4" }]}>
                <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.methodTitle}>Checkout Manual</Text>
                <Text style={styles.methodDesc}>
                  Pesanan dikirim ke WhatsApp X-SHA, staf kami yang lanjutkan proses dan pembayarannya
                  bersama Anda.
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.onSurfaceVariant} />
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
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
  loginHint: {
    marginTop: spacing.sm,
    textAlign: "center",
    fontSize: 11,
    color: colors.onSurfaceVariant,
  },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  grabber: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  sheetTitle: { fontSize: 16, fontFamily: fonts.display.bold, color: colors.onSurface, textAlign: "center" },
  sheetHint: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
    textAlign: "center",
    marginTop: 4,
    marginBottom: spacing.lg,
  },
  methodOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  methodIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  methodTitle: { fontSize: 14, fontFamily: fonts.body.bold, color: colors.onSurface, marginBottom: 2 },
  methodDesc: { fontSize: 11, color: colors.onSurfaceVariant, lineHeight: 15 },
});
