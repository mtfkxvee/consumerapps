import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Screen } from "../components/Screen";
import { ProductCard } from "../components/ProductCard";
import { CartButton } from "../components/CartButton";
import { colors, radius, spacing, typography, TAB_BAR_SPACE } from "../theme/colors";
import { useCart } from "../state/CartContext";
import { getItemGroupChildren, getProducts } from "../lib/api/products";
import type { SearchStackParamList } from "../navigation/types";
import type { ProductQuery } from "../lib/types";

const PAGE_SIZE = 20;

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  FASHION: "shirt-outline",
  FOOD: "fast-food-outline",
  FRESH: "nutrition-outline",
  GMS: "basket-outline",
  "HOME SUPPLIES": "home-outline",
};

function iconForGroup(name: string): keyof typeof Ionicons.glyphMap {
  return CATEGORY_ICONS[name.toUpperCase()] ?? "pricetag-outline";
}

type Props = NativeStackScreenProps<SearchStackParamList, "Search">;

export function SearchScreen({ navigation, route }: Props) {
  const { add } = useCart();
  const [query, setQuery] = useState(route.params?.q ?? "");
  const [department, setDepartment] = useState("");
  const [page, setPage] = useState(1);

  const { data: departments } = useQuery({
    queryKey: ["item-groups", "root"],
    queryFn: () => getItemGroupChildren(),
    staleTime: 10 * 60_000,
  });

  const productQuery: ProductQuery = useMemo(
    () => ({
      search: query || undefined,
      itemGroup: department || undefined,
      sort: "relevance",
      page,
      pageSize: PAGE_SIZE,
    }),
    [query, department, page],
  );

  const { data, isLoading } = useQuery({
    queryKey: ["products", "search", productQuery],
    queryFn: () => getProducts(productQuery),
    enabled: query.length > 0 || department.length > 0,
  });

  const products = data?.products ?? [];
  const isBrowsing = query.length > 0 || department.length > 0;

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={[styles.searchRow, { flex: 1 }]}>
            <Ionicons name="search" size={16} color={colors.onSurfaceVariant} />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari yang kamu butuhkan..."
              placeholderTextColor={colors.onSurfaceVariant}
              value={query}
              autoFocus
              onChangeText={(t) => {
                setQuery(t);
                setPage(1);
              }}
            />
            <Ionicons name="options-outline" size={18} color={colors.primary} />
          </View>
          <CartButton />
        </View>
      </View>

      <FlatList
        data={products}
        key="grid"
        numColumns={2}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.list}
        columnWrapperStyle={{ gap: spacing.sm }}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        ListHeaderComponent={
          <>
            {!isBrowsing && (
              <View style={{ marginBottom: spacing.lg }}>
                <Text style={styles.sectionTitle}>Pencarian Populer</Text>
                <View style={styles.categoryGrid}>
                  {(departments ?? []).slice(0, 8).map((d) => (
                    <Pressable
                      key={d.name}
                      style={styles.categoryChip}
                      onPress={() => {
                        setDepartment(d.name);
                        setPage(1);
                      }}
                    >
                      <View style={styles.categoryIconWrap}>
                        <Ionicons name={iconForGroup(d.name)} size={18} color={colors.primary} />
                      </View>
                      <Text style={styles.categoryLabel} numberOfLines={1}>
                        {d.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {isBrowsing && (
              <View style={styles.recommendHeader}>
                <Text style={styles.sectionTitle}>Hasil Pencarian</Text>
                <Pressable
                  onPress={() => {
                    setQuery("");
                    setDepartment("");
                    setPage(1);
                  }}
                >
                  <Text style={styles.resetText}>Reset</Text>
                </Pressable>
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          isBrowsing && !isLoading ? (
            <Text style={styles.empty}>Tidak ada produk yang cocok.</Text>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={{ flex: 1 }}>
            <ProductCard
              product={item}
              onPress={() => navigation.navigate("ProductDetail", { id: item.id })}
              onAdd={() =>
                add({ id: item.id, name: item.name, price: item.price, image: item.image, alt: item.alt })
              }
            />
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.xs },
  headerRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    height: 46,
  },
  searchInput: { flex: 1, color: colors.onSurface, fontSize: 14 },
  sectionTitle: { ...typography.headlineMd, fontSize: 16, color: colors.onSurface, marginBottom: spacing.sm },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  categoryChip: {
    width: "22.5%",
    alignItems: "center",
    gap: 6,
  },
  categoryIconWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryFixed,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryLabel: { fontSize: 10, color: colors.onSurfaceVariant, textAlign: "center" },
  recommendHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  resetText: { fontSize: 12, fontWeight: "700", color: colors.secondary },
  list: { padding: spacing.md, paddingTop: spacing.xs, paddingBottom: TAB_BAR_SPACE },
  empty: { textAlign: "center", color: colors.onSurfaceVariant, paddingVertical: spacing.xxl },
});
