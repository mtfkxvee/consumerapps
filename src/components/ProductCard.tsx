import { Image, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "./Text";
import { Pressable } from "./Pressable";
import { colors, fonts, radius, spacing, typography } from "../theme/colors";
import { formatIDR } from "../lib/format";
import type { Product, PromoProduct } from "../lib/types";

type Props = {
  product: Product | PromoProduct;
  onPress: () => void;
  onAdd: () => void;
};

function isPromo(p: Product | PromoProduct): p is PromoProduct {
  return "discountPercent" in p;
}

export function ProductCard({ product, onPress, onAdd }: Props) {
  const promo = isPromo(product) ? product : null;

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: product.image }} style={styles.image} resizeMode="cover" />
        {promo && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>-{promo.discountPercent}%</Text>
          </View>
        )}
      </View>
      <Text style={styles.category} numberOfLines={1}>
        {product.category}
      </Text>
      <Text style={styles.name} numberOfLines={2}>
        {product.name}
      </Text>
      <View style={styles.footer}>
        <View style={{ flexShrink: 1 }}>
          <Text style={styles.price} numberOfLines={1}>
            {formatIDR(product.price)}
          </Text>
          {promo && (
            <Text style={styles.oldPrice} numberOfLines={1}>
              {formatIDR(promo.oldPrice)}
            </Text>
          )}
        </View>
        <Pressable
          style={styles.addButton}
          hitSlop={8}
          onPress={(e) => {
            e.stopPropagation();
            onAdd();
          }}
        >
          <Ionicons name="add" size={18} color={colors.onPrimary} />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.sm,
    // A soft, brand-tinted shadow instead of a border — separation without
    // the "card = border + shadow + white bg" look every AI-generated grid
    // defaults to.
    shadowColor: colors.primary,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  imageWrap: {
    aspectRatio: 1,
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: colors.surfaceContainer,
    marginBottom: spacing.sm,
  },
  image: { width: "100%", height: "100%" },
  badge: {
    position: "absolute",
    left: 8,
    top: 8,
    backgroundColor: colors.secondary,
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: { color: colors.onPrimary, fontSize: 10, fontFamily: fonts.body.extraBold },
  category: { fontSize: 11, color: colors.secondary, marginBottom: 2 },
  name: { fontSize: 13, fontFamily: fonts.body.semiBold, color: colors.onSurface, minHeight: 34 },
  footer: {
    marginTop: spacing.xs,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  price: { ...typography.price, color: colors.primary, fontSize: 14 },
  oldPrice: { fontSize: 11, color: colors.onSurfaceVariant, textDecorationLine: "line-through" },
  addButton: {
    width: 30,
    height: 30,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
