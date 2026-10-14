import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "./Text";
import { colors, fonts, radius, spacing } from "../theme/colors";
import type { OrderStage } from "../lib/types";

const STEPS: { stage: OrderStage; label: string }[] = [
  { stage: "unpaid", label: "Dibuat" },
  { stage: "preparing", label: "Disiapkan" },
  { stage: "shipping", label: "Dikirim" },
  { stage: "completed", label: "Diterima" },
];

type Props = {
  stage: OrderStage;
  // Short note under the step the order is currently on, e.g. the courier's
  // status ("Dalam Perjalanan").
  note?: string | null;
};

// Where an order is, at a glance: finished steps filled, the current one
// ringed, the rest muted. Replaces the raw ERPNext status word that used to
// be shown here ("Ordered", "Open").
export function OrderTimeline({ stage, note }: Props) {
  const current = STEPS.findIndex((s) => s.stage === stage);

  return (
    <View
      style={styles.container}
      accessible
      accessibilityLabel={`Tahap pesanan: ${STEPS[current]?.label ?? ""}${note ? `, ${note}` : ""}`}
    >
      <View style={styles.row}>
        {STEPS.map((step, i) => {
          const done = i < current || stage === "completed";
          const active = i === current && stage !== "completed";
          return (
            <View key={step.stage} style={styles.stepWrap}>
              {i > 0 && <View style={[styles.line, (done || active) && styles.lineDone]} />}
              <View style={[styles.dot, done && styles.dotDone, active && styles.dotActive]}>
                {done ? (
                  <Ionicons name="checkmark" size={12} color={colors.onPrimary} />
                ) : active ? (
                  <View style={styles.dotInner} />
                ) : null}
              </View>
            </View>
          );
        })}
      </View>
      <View style={styles.labels}>
        {STEPS.map((step, i) => {
          const reached = i <= current;
          return (
            <Text key={step.stage} style={[styles.label, reached && styles.labelReached]}>
              {step.label}
            </Text>
          );
        })}
      </View>
      {note ? <Text style={styles.note}>{note}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: spacing.sm },
  row: { flexDirection: "row", alignItems: "center" },
  stepWrap: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "flex-end" },
  line: { flex: 1, height: 2, backgroundColor: colors.border },
  lineDone: { backgroundColor: colors.primary },
  dot: {
    width: 22,
    height: 22,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  dotDone: { backgroundColor: colors.primary, borderColor: colors.primary },
  dotActive: { borderColor: colors.primary },
  dotInner: { width: 8, height: 8, borderRadius: radius.full, backgroundColor: colors.primary },
  labels: { flexDirection: "row", marginTop: spacing.xs },
  label: {
    flex: 1,
    textAlign: "right",
    fontSize: 10,
    fontFamily: fonts.body.medium,
    color: colors.onSurfaceVariant,
  },
  labelReached: { color: colors.primary, fontFamily: fonts.body.bold },
  note: {
    marginTop: spacing.xs,
    fontSize: 12,
    fontFamily: fonts.body.semiBold,
    color: colors.onSurface,
  },
});
