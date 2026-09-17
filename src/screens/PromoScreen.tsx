import { useWindowDimensions } from "react-native";
import { FlatList, StyleSheet, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Screen } from "../components/Screen";
import { ProductCard } from "../components/ProductCard";
import { ProductCardSkeleton } from "../components/ProductCardSkeleton";
import { CartButton } from "../components/CartButton";
import { PromoBannerImage } from "../components/PromoBannerImage";
import { Text } from "../components/Text";
import { Pressable } from "../components/Pressable";
import { colors, fonts, radius, spacing, typography } from "../theme/colors";
import { useCart } from "../state/CartContext";
import { useOutlet } from "../state/OutletContext";
import { useTabBarSpace } from "../hooks/useTabBarSpace";
import { getPromoBanners, getPromoProducts } from "../lib/api/products";
import type { PromoStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<PromoStackParamList, "Promo">;

export function PromoScreen({ navigation }: Props) {
  const { add } = useCart();
  const { width } = useWindowDimensions();
  const { selectedOutlet } = useOutlet();
  const warehouse = selectedOutlet?.warehouse ?? undefined;
  const tabBarSpace = useTabBarSpace();

  const { data: banners } = useQuery({
    queryKey: ["promo-banners"],
    queryFn: () => getPromoBanners(),
  });

  const {
    data: products,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["promo-products", warehouse],
    queryFn: () => getPromoProducts(warehouse),
    retry: 2,
  });

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.title}>Promo</Text>
            <Text style={styles.subtitle}>Penawaran terbaik untuk Anda minggu ini</Text>
          </View>
          <CartButton />
        </View>
        {selectedOutlet && (
          <Text style={styles.outletHint}>
            Menampilkan promo yang stoknya tersedia di{" "}
            <Text style={{ fontFamily: fonts.body.bold, color: colors.primary }}>
              {selectedOutlet.name}
            </Text>
          </Text>
        )}
      </View>

      {isLoading ? (
        <View style={[styles.list, styles.grid]}>
          {Array.from({ length: 6 }).map((_, i) => (
            <View key={i} style={styles.gridItem}>
              <ProductCardSkeleton />
            </View>
          ))}
        </View>
      ) : (
      <FlatList
        data={products}
        numColumns={2}
        key="grid"
        keyExtractor={(p) => p.id}
        contentContainerStyle={[styles.list, { paddingBottom: tabBarSpace }]}
        columnWrapperStyle={{ gap: spacing.sm }}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        ListHeaderComponent={
          (banners?.length ?? 0) > 0 ? (
            <FlatList
              data={banners}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(b) => b.id}
              contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.lg }}
              renderItem={({ item }) => <PromoBannerImage uri={item.image} width={width * 0.52} />}
            />
          ) : null
        }
        ListEmptyComponent={
          isError ? (
            <Pressable style={styles.errorBox} onPress={() => refetch()}>
              <Text style={styles.errorText}>Gagal memuat promo. Coba lagi.</Text>
            </Pressable>
          ) : !isLoading ? (
            <Text style={styles.empty}>Belum ada promo aktif saat ini.</Text>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={{ flex: 1 }}>
            <ProductCard
              product={item}
              onPress={() => navigation.navigate("ProductDetail", { id: item.id })}
              onAdd={() =>
                add({
                  id: item.id,
                  name: item.name,
                  price: item.price,
                  oldPrice: item.oldPrice,
                  image: item.image,
                  alt: item.alt,
                })
              }
            />
          </View>
        )}
      />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.xs },
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  title: { ...typography.headlineMd, color: colors.onSurface },
  subtitle: { color: colors.onSurfaceVariant, fontSize: 12, marginTop: 2 },
  outletHint: { color: colors.onSurfaceVariant, fontSize: 11, marginTop: spacing.xs },
  list: { padding: spacing.md, paddingTop: spacing.xs },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  gridItem: { width: "47.5%" },
  empty: { textAlign: "center", color: colors.onSurfaceVariant, paddingVertical: spacing.xxl },
  errorBox: {
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.errorContainer,
    alignItems: "center",
  },
  errorText: { color: colors.error, fontSize: 13, fontFamily: fonts.body.semiBold },
});
