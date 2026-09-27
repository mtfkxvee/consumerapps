import { Alert, Linking, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "../components/Screen";
import { Text } from "../components/Text";
import { Pressable } from "../components/Pressable";
import { colors, fonts, radius, spacing, typography } from "../theme/colors";
import { WHATSAPP_NUMBER } from "../lib/mock-data";
import { getDiagnostics, recordError } from "../lib/crashlytics";

type SettingsRow = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
};

export function SettingsScreen() {
  const navigation = useNavigation();

  const rows: SettingsRow[] = [
    {
      icon: "person-circle-outline",
      label: "Atur Profil",
      onPress: () => (navigation.navigate as (name: string) => void)("EditProfile"),
    },
    {
      icon: "lock-closed-outline",
      label: "Ganti Kata Sandi",
      onPress: () => Alert.alert("Segera Hadir", "Fitur ganti kata sandi akan segera tersedia di X-SHA."),
    },
    {
      icon: "help-circle-outline",
      label: "Bantuan",
      onPress: () =>
        Linking.openURL(
          `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Halo X-SHA, saya butuh bantuan seputar aplikasi.")}`,
        ),
    },
  ];

  // Only ever present in a dev build, never in what ships to customers —
  // checks the SDK is actually wired up (native module, Firebase project,
  // Play Services) instead of just assuming success, since whether the
  // report actually reaches Firebase's dashboard also depends on a
  // background upload that's easy to lose track of (delay, no network,
  // MIUI-style background kill, etc).
  if (__DEV__) {
    rows.push({
      icon: "bug-outline",
      label: "Cek Status Crashlytics (dev only)",
      onPress: async () => {
        const d = await getDiagnostics();
        if (!d.moduleLinked) {
          Alert.alert(
            "Modul Crashlytics TIDAK terpasang",
            "Native module tidak ditemukan. Ini bukan masalah jaringan — build APK-nya sendiri belum benar (misal: masih pakai Expo Go, atau APK dari build lama sebelum Crashlytics ditambahkan).",
          );
          return;
        }
        if (!d.playServicesAvailable) {
          Alert.alert(
            "Google Play Services bermasalah",
            `Modul Crashlytics sudah terpasang, tapi Play Services di HP ini tidak tersedia (${d.playServicesError ?? "tidak diketahui sebabnya"}). Tanpa Play Services, laporan tidak akan pernah terkirim ke Firebase, apa pun yang dilakukan di sisi aplikasi.`,
          );
          return;
        }
        recordError(new Error("Test error dari Pengaturan"), "Manual test dari SettingsScreen");
        Alert.alert(
          "Semua terpasang dengan benar",
          [
            `App ID: ${d.appId}`,
            `Project ID: ${d.projectId}`,
            `Play Services: tersedia`,
            `Crash sebelumnya: ${d.crashedLastRun ? "ya" : "tidak"}`,
            "",
            "Error uji baru saja dikirim. Modul dan Play Services keduanya sehat — kalau laporan tetap tidak muncul di Firebase Console setelah beberapa menit, penyebabnya di pengaturan baterai/latar belakang HP ini (umum di HP Xiaomi/MIUI), bukan di aplikasi.",
          ].join("\n"),
        );
      },
    });
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Pengaturan</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          {rows.map((row, idx) => (
            <Pressable
              key={row.label}
              style={[styles.row, idx > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}
              onPress={row.onPress}
            >
              <Ionicons name={row.icon} size={20} color={colors.primary} />
              <Text style={styles.rowLabel}>{row.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.onSurfaceVariant} />
            </Pressable>
          ))}
        </View>
      </View>
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
  content: { padding: spacing.md },
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  rowLabel: { flex: 1, fontSize: 14, fontFamily: fonts.body.semiBold, color: colors.onSurface },
});
