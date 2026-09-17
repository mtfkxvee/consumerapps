import { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../components/Text";
import { Pressable } from "../components/Pressable";
import { colors, fonts, radius, spacing, typography, TAB_BAR_SPACE } from "../theme/colors";
import { useAuth } from "../state/AuthContext";

// Shown once, right after a first-time "Daftar dengan Google" — the account
// only has an email and display name at that point, so we still need a
// phone number (for delivery/WhatsApp) and address before the customer
// record is actually usable for checkout.
export function CompleteProfileScreen() {
  const { user, completeProfile, logout } = useAuth();
  const [name, setName] = useState(user?.customer?.name ?? "");
  const [mobile, setMobile] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [city, setCity] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    if (!name.trim() || !mobile.trim()) {
      setError("Nama lengkap dan nomor HP wajib diisi.");
      return;
    }
    setLoading(true);
    const res = await completeProfile({
      name: name.trim(),
      mobile: mobile.trim(),
      addressLine1: addressLine1.trim(),
      city: city.trim(),
    });
    setLoading(false);
    if (!res.ok) setError(res.message);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.root}>
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.title}>Lengkapi Profil Anda</Text>
            <Text style={styles.subtitle}>
              Sebelum melanjutkan, lengkapi data berikut agar pesanan Anda bisa kami proses.
            </Text>

            <Text style={styles.fieldLabel}>Nama Lengkap</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="person-outline" size={18} color={colors.onSurfaceVariant} />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Nama lengkap Anda"
                placeholderTextColor={colors.onSurfaceVariant}
              />
            </View>

            <Text style={styles.fieldLabel}>Nomor HP</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="call-outline" size={18} color={colors.onSurfaceVariant} />
              <TextInput
                style={styles.input}
                value={mobile}
                onChangeText={setMobile}
                placeholder="08xxxxxxxxxx"
                placeholderTextColor={colors.onSurfaceVariant}
                keyboardType="phone-pad"
              />
            </View>

            <Text style={styles.fieldLabel}>Alamat</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="location-outline" size={18} color={colors.onSurfaceVariant} />
              <TextInput
                style={styles.input}
                value={addressLine1}
                onChangeText={setAddressLine1}
                placeholder="Nama jalan, nomor rumah, dll."
                placeholderTextColor={colors.onSurfaceVariant}
              />
            </View>

            <Text style={styles.fieldLabel}>Kota</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="business-outline" size={18} color={colors.onSurfaceVariant} />
              <TextInput
                style={styles.input}
                value={city}
                onChangeText={setCity}
                placeholder="Kota domisili Anda"
                placeholderTextColor={colors.onSurfaceVariant}
              />
            </View>

            {error && <Text style={styles.error}>{error}</Text>}

            <Pressable style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
              {loading ? (
                <ActivityIndicator color={colors.onPrimary} />
              ) : (
                <Text style={styles.submitButtonText}>Simpan &amp; Lanjutkan</Text>
              )}
            </Pressable>

            <Pressable onPress={logout} style={styles.logoutRow}>
              <Text style={styles.logoutText}>Keluar</Text>
            </Pressable>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingTop: spacing.xxl, paddingBottom: TAB_BAR_SPACE },
  title: {
    ...typography.headlineLg,
    fontSize: 22,
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.lg,
    lineHeight: 18,
  },
  fieldLabel: {
    fontSize: 12,
    fontFamily: fonts.body.semiBold,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.xs,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    height: 50,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  input: { flex: 1, color: colors.onSurface, fontSize: 14 },
  error: { color: colors.error, fontSize: 12, marginBottom: spacing.sm, textAlign: "center" },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: spacing.xs,
  },
  submitButtonText: { color: colors.onPrimary, fontFamily: fonts.body.bold, fontSize: 15 },
  logoutRow: { alignItems: "center", marginTop: spacing.lg },
  logoutText: { fontSize: 13, fontFamily: fonts.body.bold, color: colors.secondary },
});
