import { useEffect, useState } from "react";
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
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../components/Text";
import { Pressable } from "../components/Pressable";
import { colors, fonts, radius, spacing, typography, TAB_BAR_SPACE } from "../theme/colors";
import { useAuth } from "../state/AuthContext";
import { getMyAddress } from "../lib/api/profile";

export function EditProfileScreen() {
  const navigation = useNavigation();
  const { user, completeProfile } = useAuth();
  const [name, setName] = useState(user?.customer?.name ?? "");
  const [mobile, setMobile] = useState(user?.customer?.mobile ?? "");
  const [addressLine1, setAddressLine1] = useState("");
  const [city, setCity] = useState("");
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getMyAddress().then((address) => {
      if (cancelled || !address) return;
      setAddressLine1(address.line1);
      setCity(address.city);
    }).finally(() => {
      if (!cancelled) setLoadingAddress(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async () => {
    setError(null);
    if (!name.trim() || !mobile.trim()) {
      setError("Nama lengkap dan nomor HP wajib diisi.");
      return;
    }
    setSaving(true);
    const res = await completeProfile({
      name: name.trim(),
      mobile: mobile.trim(),
      addressLine1: addressLine1.trim(),
      city: city.trim(),
    });
    setSaving(false);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.root}>
          <View style={styles.header}>
            <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
              <Ionicons name="chevron-back" size={24} color={colors.onSurface} />
            </Pressable>
            <Text style={styles.headerTitle}>Ubah Data Diri</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {loadingAddress ? (
              <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
            ) : (
              <>
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

                <Pressable style={styles.submitButton} onPress={handleSubmit} disabled={saving}>
                  {saving ? (
                    <ActivityIndicator color={colors.onPrimary} />
                  ) : (
                    <Text style={styles.submitButtonText}>Simpan Perubahan</Text>
                  )}
                </Pressable>
              </>
            )}
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
  },
  headerTitle: { ...typography.headlineMd, fontSize: 16, color: colors.onSurface },
  content: { padding: spacing.lg, paddingBottom: TAB_BAR_SPACE },
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
});
