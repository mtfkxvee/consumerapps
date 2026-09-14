import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Screen } from "../components/Screen";
import { colors, radius, spacing, typography, TAB_BAR_SPACE } from "../theme/colors";
import { formatIDR } from "../lib/format";
import { useCart } from "../state/CartContext";
import { getProductById } from "../lib/api/products";

type Props = {
  route: { params: { id: string } };
  navigation: {
    goBack: () => void;
    navigate: (name: never, params?: never) => void;
  };
};

export function ProductDetailScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const { add } = useCart();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id),
  });

  if (isLoading || !product) {
    return (
      <Screen>
        <View style={styles.loading}>
          <Text style={{ color: colors.onSurfaceVariant }}>Memuat...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={20} color={colors.onSurface} />
        </Pressable>
        <Image source={{ uri: product.image }} style={styles.image} resizeMode="cover" />
        <View style={styles.content}>
          <Text style={styles.category}>{product.category}</Text>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.price}>{formatIDR(product.price)}</Text>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Pressable
          style={styles.addButton}
          onPress={() => {
            add({
              id: product.id,
              name: product.name,
              price: product.price,
              image: product.image,
              alt: product.alt,
            });
            navigation.navigate("Cart" as never);
          }}
        >
          <Ionicons name="cart" size={18} color={colors.onPrimary} />
          <Text style={styles.addButtonText}>Tambah ke Keranjang</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  backButton: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.sm,
    zIndex: 1,
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  image: { width: "100%", aspectRatio: 1, backgroundColor: colors.surfaceContainer },
  content: { padding: spacing.md },
  category: { color: colors.secondary, fontSize: 12, marginBottom: spacing.xs },
  name: { ...typography.headlineMd, color: colors.onSurface, marginBottom: spacing.sm },
  price: { ...typography.display, fontSize: 22, color: colors.primary },
  footer: {
    padding: spacing.md,
    paddingBottom: TAB_BAR_SPACE,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  addButton: {
    flexDirection: "row",
    gap: spacing.xs,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: { color: colors.onPrimary, fontWeight: "700" },
});
