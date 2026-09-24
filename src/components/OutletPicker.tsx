import { Modal, ScrollView, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "./Text";
import { Pressable } from "./Pressable";
import { colors, fonts, radius, spacing } from "../theme/colors";
import { useOutlet } from "../state/OutletContext";
import { useState } from "react";

// Mirrors the web's top-nav outlet dropdown ("Cek stok & promo di outlet")
// — a small button here instead, since mobile has no persistent nav bar to
// put it in. Picking an outlet filters the catalog/search to that outlet's
// warehouse stock everywhere this control is shown.
export function OutletPicker() {
  const { outlets, outletCode, selectedOutlet, setOutletCode } = useOutlet();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable style={styles.button} onPress={() => setOpen(true)}>
        <Ionicons name="storefront-outline" size={14} color={colors.primary} />
        <Text style={styles.buttonText} numberOfLines={1}>
          {selectedOutlet ? selectedOutlet.name : "Semua Outlet"}
        </Text>
        <Ionicons name="chevron-down" size={12} color={colors.onSurfaceVariant} />
      </Pressable>

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Pilih Outlet</Text>
              <Pressable onPress={() => setOpen(false)} hitSlop={8}>
                <Ionicons name="close" size={20} color={colors.onSurface} />
              </Pressable>
            </View>
            <Text style={styles.sheetHint}>Cek stok &amp; promo yang tersedia di outlet pilihanmu.</Text>

            <ScrollView
              style={styles.optionList}
              contentContainerStyle={{ paddingBottom: spacing.md }}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <Pressable
                style={styles.option}
                onPress={() => {
                  setOutletCode("");
                  setOpen(false);
                }}
              >
                <Text style={[styles.optionText, outletCode === "" && styles.optionTextActive]}>
                  Semua Outlet
                </Text>
                {outletCode === "" && <Ionicons name="checkmark" size={18} color={colors.primary} />}
              </Pressable>

              {outlets.map((o, index) => (
                <Pressable
                  key={o.code}
                  style={styles.option}
                  onPress={() => {
                    setOutletCode(o.code);
                    setOpen(false);
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <View style={styles.optionNameRow}>
                      <Text style={[styles.optionText, outletCode === o.code && styles.optionTextActive]}>
                        {o.name}
                      </Text>
                      {index === 0 && o.distanceKm != null && (
                        <View style={styles.nearestBadge}>
                          <Text style={styles.nearestBadgeText}>Terdekat</Text>
                        </View>
                      )}
                    </View>
                    {(o.city || o.distanceKm != null) && (
                      <Text style={styles.optionCity}>
                        {[o.city, o.distanceKm != null ? `${o.distanceKm.toFixed(1)} km` : null]
                          .filter(Boolean)
                          .join(" • ")}
                      </Text>
                    )}
                  </View>
                  {outletCode === o.code && <Ionicons name="checkmark" size={18} color={colors.primary} />}
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    backgroundColor: colors.primaryFixed,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    maxWidth: 180,
  },
  buttonText: { fontSize: 11, fontFamily: fonts.body.bold, color: colors.primary, flexShrink: 1 },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    maxHeight: "70%",
  },
  sheetHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sheetTitle: { fontSize: 16, fontFamily: fonts.display.bold, color: colors.onSurface },
  sheetHint: { fontSize: 12, color: colors.onSurfaceVariant, marginTop: 4, marginBottom: spacing.md },
  optionList: { flexShrink: 1 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  optionNameRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  optionText: { fontSize: 14, color: colors.onSurface },
  optionTextActive: { fontFamily: fonts.body.bold, color: colors.primary },
  optionCity: { fontSize: 11, color: colors.onSurfaceVariant, marginTop: 2 },
  nearestBadge: {
    backgroundColor: colors.primaryFixed,
    borderRadius: radius.full,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  nearestBadgeText: { fontSize: 9, fontFamily: fonts.body.bold, color: colors.primary },
});
