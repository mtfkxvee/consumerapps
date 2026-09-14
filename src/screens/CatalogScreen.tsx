import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Screen } from "../components/Screen";
import { ProductCard } from "../components/ProductCard";
import { CartButton } from "../components/CartButton";
import { colors, radius, spacing, typography, TAB_BAR_SPACE } from "../theme/colors";
import { useCart } from "../state/CartContext";
import { getItemGroupChildren, getProducts } from "../lib/api/products";
import type { CatalogStackParamList } from "../navigation/types";
import type { ProductQuery } from "../lib/types";

const PAGE_SIZE = 12;

type Props = NativeStackScreenProps<CatalogStackParamList, "Catalog">;

export function CatalogScreen({ navigation, route }: Props) {
  const { add } = useCart();
  const [department, setDepartment] = useState("");
  const [sort, setSort] = useState<ProductQuery["sort"]>("relevance");
  const [page, setPage] = useState(1);
  const query = route.params?.q ?? "";

  const { data: departments } = useQuery({
    queryKey: ["item-groups", "root"],
    queryFn: () => getItemGroupChildren(),
    staleTime: 10 * 60_000,
  });

  const productQuery: ProductQuery = useMemo(
    () => ({
      search: query || undefined,
      itemGroup: department || undefined,
      sort,
      page,
      pageSize: PAGE_SIZE,
    }),
    [query, department, sort, page],
  );

  const { data, isLoading } = useQuery({
    queryKey: ["products", productQuery],
    queryFn: () => getProducts(productQuery),
  });

  const products = data?.products ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Katalog Produk</Text>
          <CartButton />
        </View>

        <FlatList
          data={[{ name: "", label: "Semua" }, ...(departments ?? [])]}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(d) => d.name || "all"}
          contentContainerStyle={{ gap: spacing.xs, paddingVertical: spacing.sm }}
          renderItem={({ item }) => {
            const active = department === item.name;
            return (
              <Pressable
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => {
                  setDepartment(item.name);
                  setPage(1);
                }}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{item.label}</Text>
              </Pressable>
            );
          }}
        />

        <View style={styles.sortRow}>
          {(
            [
              { label: "Relevan", value: "relevance" as const },
              { label: "Termurah", value: "price_asc" as const },
              { label: "Termahal", value: "price_desc" as const },
            ] as const
          ).map((s) => (
            <Pressable
              key={s.value}
              style={[styles.sortChip, sort === s.value && styles.sortChipActive]}
              onPress={() => {
                setSort(s.value);
                setPage(1);
              }}
            >
              <Text style={[styles.sortText, sort === s.value && styles.sortTextActive]}>
                {s.label}
              </Text>
            </Pressable>
          ))}
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
        ListEmptyComponent={
          !isLoading ? <Text style={styles.empty}>Tidak ada produk yang cocok.</Text> : null
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
        ListFooterComponent={
          totalPages > 1 ? (
            <View style={styles.pagination}>
              <Pressable
                style={[styles.pageButton, page <= 1 && styles.pageButtonDisabled]}
                disabled={page <= 1}
                onPress={() => setPage((p) => Math.max(1, p - 1))}
              >
                <Text style={styles.pageButtonText}>Sebelumnya</Text>
              </Pressable>
              <Text style={styles.pageInfo}>
                {page} / {totalPages}
              </Text>
              <Pressable
                style={[styles.pageButton, page >= totalPages && styles.pageButtonDisabled]}
                disabled={page >= totalPages}
                onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <Text style={styles.pageButtonText}>Berikutnya</Text>
              </Pressable>
            </View>
          ) : null
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.md, paddingTop: spacing.sm },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  title: { ...typography.headlineMd, color: colors.onSurface },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainer,
  },
  chipActive: { backgroundColor: colors.primary },
  chipText: { fontSize: 12, fontWeight: "600", color: colors.onSurfaceVariant },
  chipTextActive: { color: colors.onPrimary },
  sortRow: { flexDirection: "row", gap: spacing.xs, marginBottom: spacing.sm },
  sortChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sortChipActive: { borderColor: colors.primary, backgroundColor: colors.primaryFixed },
  sortText: { fontSize: 11, color: colors.onSurfaceVariant },
  sortTextActive: { color: colors.primary, fontWeight: "700" },
  list: { padding: spacing.md, paddingTop: spacing.xs, paddingBottom: TAB_BAR_SPACE },
  empty: { textAlign: "center", color: colors.onSurfaceVariant, paddingVertical: spacing.xxl },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  pageButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pageButtonDisabled: { opacity: 0.4 },
  pageButtonText: { fontSize: 12, fontWeight: "600", color: colors.onSurface },
  pageInfo: { fontSize: 12, color: colors.onSurfaceVariant },
});
