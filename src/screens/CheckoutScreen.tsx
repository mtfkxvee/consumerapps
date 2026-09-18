import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Linking, ScrollView, StyleSheet, TextInput, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "../components/Screen";
import { Text } from "../components/Text";
import { Pressable } from "../components/Pressable";
import { colors, fonts, radius, spacing, typography } from "../theme/colors";
import { formatIDR } from "../lib/format";
import { useCart } from "../state/CartContext";
import { useAuth } from "../state/AuthContext";
import { createOrder } from "../lib/api/orders";
import { getMyAddress } from "../lib/api/profile";
import { WHATSAPP_NUMBER } from "../lib/mock-data";

type Fulfillment = "pickup" | "delivery";
type PaymentMethod = "automatic" | "manual";

export function CheckoutScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { items, selectedTotal, clear } = useCart();
  const { user, isLoggedIn } = useAuth();

  const selectedItems = items.filter((i) => i.selected);

  const [fulfillment, setFulfillment] = useState<Fulfillment>("pickup");
  const [useRegisteredAddress, setUseRegisteredAddress] = useState(true);
  const [addressLine1, setAddressLine1] = useState("");
  const [city, setCity] = useState("");
  const [registeredAddress, setRegisteredAddress] = useState<{ line1: string; city: string } | null>(null);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("automatic");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (fulfillment !== "delivery" || !isLoggedIn || registeredAddress) return;
    setLoadingAddress(true);
    getMyAddress()
      .then((addr) => {
        if (!addr) return;
        setRegisteredAddress({ line1: addr.line1, city: addr.city });
        if (useRegisteredAddress) {
          setAddressLine1(addr.line1);
          setCity(addr.city);
        }
      })
      .finally(() => setLoadingAddress(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fulfillment, isLoggedIn]);

  const selectRegisteredAddress = () => {
    setUseRegisteredAddress(true);
    if (registeredAddress) {
      setAddressLine1(registeredAddress.line1);
      setCity(registeredAddress.city);
    }
  };

  const selectOtherAddress = () => {
    setUseRegisteredAddress(false);
    setAddressLine1("");
    setCity("");
  };

  const sendToWhatsapp = (note: string) => {
    const lines = selectedItems
      .map((i) => `- ${i.name} x${i.qty} (${formatIDR(i.price * i.qty)})`)
      .join("\n");
    const message = `Halo X-SHA, saya ingin memesan:\n${lines}\n\n${note}\nTotal: ${formatIDR(selectedTotal)}`;
    Linking.openURL(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`);
  };

  const handleSubmit = async () => {
    if (selectedItems.length === 0) return;
    if (fulfillment === "delivery" && (!addressLine1.trim() || !city.trim())) {
      Alert.alert("Alamat belum lengkap", "Isi alamat dan kota tujuan pengiriman terlebih dahulu.");
      return;
    }

    const note =
      fulfillment === "pickup"
        ? "Metode: Ambil di outlet (Pick Up)"
        : `Metode: Diantar\nAlamat: ${addressLine1}, ${city}`;

    setSubmitting(true);

    if (isLoggedIn) {
      const result = await createOrder(
        selectedItems.map((i) => ({ itemCode: i.id, itemName: i.name, qty: i.qty, rate: i.price })),
        note,
      );
      setSubmitting(false);

      if (paymentMethod === "automatic") {
        if (result.ok && result.paymentUrl) {
          clear();
          await WebBrowser.openBrowserAsync(result.paymentUrl);
          Alert.alert(
            "Pembayaran diproses",
            `Pesanan ${result.orderId} dibuat. Cek status pembayarannya di Riwayat Transaksi.`,
          );
          navigation.goBack();
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
        clear();
        Alert.alert("Pesanan tercatat", `Pesanan ${result.orderId} tersimpan di akun X-SHA Anda.`);
      } else if (result.reason === "erpnext_error") {
        Alert.alert(
          "Belum tercatat di sistem",
          "Pesanan belum tersimpan di akun, tapi tetap bisa dikirim via WhatsApp.",
        );
      }
    } else {
      setSubmitting(false);
    }

    sendToWhatsapp(note);
    if (isLoggedIn) navigation.goBack();
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Ringkasan Pesanan</Text>
        <View style={styles.card}>
          {selectedItems.map((item, idx) => (
            <View
              key={item.id}
              style={[styles.itemRow, idx > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}
            >
              <Text style={styles.itemName} numberOfLines={1}>
                {item.qty}x {item.name}
              </Text>
              <Text style={styles.itemAmount}>{formatIDR(item.price * item.qty)}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Metode Pengambilan</Text>
        <View style={styles.optionRow}>
          <Pressable
            style={[styles.optionCard, fulfillment === "pickup" && styles.optionCardActive]}
            onPress={() => setFulfillment("pickup")}
          >
            <Ionicons
              name="storefront-outline"
              size={20}
              color={fulfillment === "pickup" ? colors.primary : colors.onSurfaceVariant}
            />
            <Text style={[styles.optionText, fulfillment === "pickup" && styles.optionTextActive]}>
              Ambil di Outlet
            </Text>
          </Pressable>
          <Pressable
            style={[styles.optionCard, fulfillment === "delivery" && styles.optionCardActive]}
            onPress={() => setFulfillment("delivery")}
          >
            <Ionicons
              name="bicycle-outline"
              size={20}
              color={fulfillment === "delivery" ? colors.primary : colors.onSurfaceVariant}
            />
            <Text style={[styles.optionText, fulfillment === "delivery" && styles.optionTextActive]}>
              Diantar
            </Text>
          </Pressable>
        </View>

        {fulfillment === "delivery" && (
          <View style={{ marginBottom: spacing.lg }}>
            <Text style={styles.sectionTitle}>Alamat Pengiriman</Text>

            {loadingAddress ? (
              <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.md }} />
            ) : (
              <>
                {registeredAddress && (
                  <View style={styles.addressChoiceRow}>
                    <Pressable
                      style={[styles.addressChoice, useRegisteredAddress && styles.addressChoiceActive]}
                      onPress={selectRegisteredAddress}
                    >
                      <Text
                        style={[
                          styles.addressChoiceText,
                          useRegisteredAddress && styles.addressChoiceTextActive,
                        ]}
                      >
                        Alamat Terdaftar
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[styles.addressChoice, !useRegisteredAddress && styles.addressChoiceActive]}
                      onPress={selectOtherAddress}
                    >
                      <Text
                        style={[
                          styles.addressChoiceText,
                          !useRegisteredAddress && styles.addressChoiceTextActive,
                        ]}
                      >
                        Alamat Lain
                      </Text>
                    </Pressable>
                  </View>
                )}

                <View style={styles.inputWrap}>
                  <Ionicons name="location-outline" size={18} color={colors.onSurfaceVariant} />
                  <TextInput
                    style={styles.input}
                    value={addressLine1}
                    onChangeText={(t) => {
                      setAddressLine1(t);
                      setUseRegisteredAddress(false);
                    }}
                    placeholder="Nama jalan, nomor rumah, dll."
                    placeholderTextColor={colors.onSurfaceVariant}
                  />
                </View>
                <View style={styles.inputWrap}>
                  <Ionicons name="business-outline" size={18} color={colors.onSurfaceVariant} />
                  <TextInput
                    style={styles.input}
                    value={city}
                    onChangeText={(t) => {
                      setCity(t);
                      setUseRegisteredAddress(false);
                    }}
                    placeholder="Kota tujuan"
                    placeholderTextColor={colors.onSurfaceVariant}
                  />
                </View>
              </>
            )}
          </View>
        )}

        <Text style={styles.sectionTitle}>Kode Promo</Text>
        <View style={styles.promoRow}>
          <View style={[styles.inputWrap, { flex: 1, marginBottom: 0 }]}>
            <Ionicons name="pricetag-outline" size={18} color={colors.onSurfaceVariant} />
            <TextInput
              style={styles.input}
              value={promoCode}
              onChangeText={setPromoCode}
              placeholder="Masukkan kode promo"
              placeholderTextColor={colors.onSurfaceVariant}
              autoCapitalize="characters"
            />
          </View>
          <Pressable
            style={styles.promoButton}
            onPress={() =>
              Alert.alert("Segera Hadir", "Fitur kode promo akan segera tersedia di X-SHA.")
            }
          >
            <Text style={styles.promoButtonText}>Terapkan</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Metode Pembayaran</Text>
        <Pressable
          style={[styles.methodOption, paymentMethod === "automatic" && styles.methodOptionActive]}
          onPress={() => setPaymentMethod("automatic")}
        >
          <View style={[styles.radio, paymentMethod === "automatic" && styles.radioActive]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.methodTitle}>Checkout Otomatis</Text>
            <Text style={styles.methodDesc}>
              Bayar langsung online (transfer, e-wallet, kartu, dll).
            </Text>
          </View>
          <Ionicons name="card-outline" size={20} color={colors.onSurfaceVariant} />
        </Pressable>
        <Pressable
          style={[styles.methodOption, paymentMethod === "manual" && styles.methodOptionActive]}
          onPress={() => setPaymentMethod("manual")}
        >
          <View style={[styles.radio, paymentMethod === "manual" && styles.radioActive]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.methodTitle}>Checkout Manual</Text>
            <Text style={styles.methodDesc}>Pesanan dikirim ke WhatsApp, staf kami lanjutkan proses.</Text>
          </View>
          <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
        </Pressable>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Pembayaran</Text>
          <Text style={styles.totalValue}>{formatIDR(selectedTotal)}</Text>
        </View>
        <Pressable
          style={[styles.submitButton, (selectedItems.length === 0 || submitting) && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={selectedItems.length === 0 || submitting}
        >
          {submitting ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.submitButtonText}>Buat Pesanan</Text>
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
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  sectionTitle: {
    fontSize: 13,
    fontFamily: fonts.body.bold,
    color: colors.onSurface,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
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
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: spacing.md,
    gap: spacing.sm,
  },
  itemName: { flex: 1, fontSize: 13, color: colors.onSurface },
  itemAmount: { fontSize: 13, fontFamily: fonts.body.bold, color: colors.onSurface },
  optionRow: { flexDirection: "row", gap: spacing.sm },
  optionCard: {
    flex: 1,
    alignItems: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
  },
  optionCardActive: { borderColor: colors.primary, backgroundColor: colors.primaryFixed },
  optionText: { fontSize: 12, fontFamily: fonts.body.semiBold, color: colors.onSurfaceVariant },
  optionTextActive: { color: colors.primary },
  addressChoiceRow: { flexDirection: "row", gap: spacing.xs, marginBottom: spacing.sm },
  addressChoice: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainer,
  },
  addressChoiceActive: { backgroundColor: colors.primary },
  addressChoiceText: { fontSize: 12, fontFamily: fonts.body.semiBold, color: colors.onSurfaceVariant },
  addressChoiceTextActive: { color: colors.onPrimary },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    height: 48,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  input: { flex: 1, color: colors.onSurface, fontSize: 13 },
  promoRow: { flexDirection: "row", gap: spacing.sm, alignItems: "center" },
  promoButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  promoButtonText: { color: colors.onPrimary, fontFamily: fonts.body.bold, fontSize: 13 },
  methodOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  methodOptionActive: { borderColor: colors.primary, backgroundColor: colors.primaryFixed },
  radio: {
    width: 18,
    height: 18,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.outline,
  },
  radioActive: { borderColor: colors.primary, borderWidth: 5.5 },
  methodTitle: { fontSize: 13, fontFamily: fonts.body.bold, color: colors.onSurface },
  methodDesc: { fontSize: 11, color: colors.onSurfaceVariant, marginTop: 2 },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  totalLabel: { fontSize: 13, color: colors.onSurfaceVariant },
  totalValue: { ...typography.headlineMd, fontSize: 18, color: colors.onSurface },
  submitButton: {
    backgroundColor: colors.secondary,
    borderRadius: radius.full,
    paddingVertical: 14,
    alignItems: "center",
  },
  submitButtonDisabled: { opacity: 0.4 },
  submitButtonText: { color: colors.white, fontFamily: fonts.body.bold, fontSize: 15 },
});
