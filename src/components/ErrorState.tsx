import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "./Text";
import { Pressable } from "./Pressable";
import { colors, fonts, radius, spacing, typography } from "../theme/colors";

type Props = {
  // "offline" for no internet / too-slow connection, "error" for anything
  // else (server problem, unexpected failure).
  variant?: "offline" | "error";
  title: string;
  message: string;
  primaryLabel?: string;
  onPrimary?: () => void;
  primaryLoading?: boolean;
  secondaryLabel?: string;
  onSecondary?: () => void;
};

// One full-area "something went wrong" state, in Indonesian, used wherever
// a failed request would otherwise leave the customer on a dead screen —
// today the checkout and the payment page.
export function ErrorState({
  variant = "error",
  title,
  message,
  primaryLabel,
  onPrimary,
  primaryLoading,
  secondaryLabel,
  onSecondary,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons
          name={variant === "offline" ? "cloud-offline-outline" : "alert-circle-outline"}
          size={48}
          color={colors.primary}
        />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      {primaryLabel && onPrimary && (
        <Pressable style={styles.primaryButton} onPress={onPrimary} disabled={primaryLoading}>
          {primaryLoading ? (
            <ActivityIndicator color={colors.onPrimary} />
          ) : (
            <Text style={styles.primaryText}>{primaryLabel}</Text>
          )}
        </Pressable>
      )}
      {secondaryLabel && onSecondary && (
        <Pressable style={styles.secondaryButton} onPress={onSecondary}>
          <Text style={styles.secondaryText}>{secondaryLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    gap: spacing.sm,
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: radius.full,
    backgroundColor: colors.primaryFixed,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  title: { ...typography.headlineMd, color: colors.onSurface, textAlign: "center" },
  message: {
    color: colors.onSurfaceVariant,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  primaryButton: {
    alignSelf: "stretch",
    backgroundColor: colors.secondary,
    borderRadius: radius.full,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryText: { color: colors.white, fontFamily: fonts.body.bold, fontSize: 15 },
  secondaryButton: {
    alignSelf: "stretch",
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryText: { color: colors.primary, fontFamily: fonts.body.bold, fontSize: 15 },
});
