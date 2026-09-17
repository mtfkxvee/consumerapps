import { StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import Barcode from "react-native-barcode-svg";
import { Text } from "../components/Text";
import { Pressable } from "../components/Pressable";
import { colors, fonts, radius, spacing } from "../theme/colors";
import { useAuth } from "../state/AuthContext";

// Full-screen barcode of the member's Kode Pelanggan, for outlet staff to
// scan at checkout — same code as printed on a physical membership card,
// or the XAPP##### one minted for an app/web sign-up.
export function MemberBarcodeScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const code = user?.customer?.kodePelanggan;

  return (
    <View style={styles.root}>
      <Pressable style={styles.closeButton} onPress={() => navigation.goBack()} hitSlop={12}>
        <Ionicons name="close" size={22} color={colors.onSurface} />
      </Pressable>

      <View style={styles.content}>
        <Text style={styles.title}>Kartu Member</Text>
        <Text style={styles.subtitle}>{user?.customer?.name ?? user?.email}</Text>

        <View style={styles.barcodeWrap}>
          {code ? (
            <Barcode
              value={code}
              format="CODE128"
              height={110}
              maxWidth={260}
              lineColor={colors.onSurface}
              backgroundColor={colors.surface}
            />
          ) : (
            <Text style={styles.noCode}>Kode pelanggan belum tersedia.</Text>
          )}
        </View>

        {code && <Text style={styles.code}>{code}</Text>}
        <Text style={styles.hint}>Tunjukkan barcode ini ke kasir untuk dipindai.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  closeButton: {
    position: "absolute",
    top: spacing.xl,
    right: spacing.md,
    zIndex: 1,
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceContainerLow,
  },
  content: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg },
  title: { fontSize: 20, fontFamily: fonts.display.bold, color: colors.onSurface },
  subtitle: { fontSize: 13, color: colors.onSurfaceVariant, marginTop: 4, marginBottom: spacing.xl },
  barcodeWrap: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: radius.xl,
    shadowColor: colors.primary,
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    minHeight: 140,
    minWidth: 280,
    alignItems: "center",
    justifyContent: "center",
  },
  noCode: { color: colors.onSurfaceVariant, textAlign: "center", fontSize: 13, maxWidth: 200 },
  code: {
    marginTop: spacing.lg,
    fontSize: 18,
    fontFamily: fonts.body.extraBold,
    color: colors.primary,
    letterSpacing: 2,
  },
  hint: { marginTop: spacing.sm, fontSize: 12, color: colors.onSurfaceVariant },
});
