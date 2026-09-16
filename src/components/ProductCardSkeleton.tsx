import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { colors, radius, spacing } from "../theme/colors";

// Mirrors ProductCard's exact shape (image square, category line, two-line
// name, price row) so the grid doesn't jump when real cards swap in.
export function ProductCardSkeleton() {
  const pulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <View style={styles.card}>
      <Animated.View style={[styles.block, styles.image, { opacity: pulse }]} />
      <Animated.View style={[styles.block, styles.category, { opacity: pulse }]} />
      <Animated.View style={[styles.block, styles.nameLine, { opacity: pulse }]} />
      <Animated.View style={[styles.block, styles.nameLineShort, { opacity: pulse }]} />
      <View style={styles.footer}>
        <Animated.View style={[styles.block, styles.price, { opacity: pulse }]} />
        <Animated.View style={[styles.block, styles.addButton, { opacity: pulse }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.sm,
  },
  block: { backgroundColor: colors.surfaceContainer, borderRadius: radius.sm },
  image: { aspectRatio: 1, borderRadius: radius.md, marginBottom: spacing.sm },
  category: { width: "40%", height: 10, marginBottom: 6 },
  nameLine: { width: "90%", height: 11, marginBottom: 5 },
  nameLineShort: { width: "60%", height: 11, marginBottom: spacing.xs },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  price: { width: "45%", height: 14 },
  addButton: { width: 30, height: 30, borderRadius: radius.full },
});
