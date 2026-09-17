import { useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Screen } from "../components/Screen";
import { ProductCard } from "../components/ProductCard";
import { CartButton } from "../components/CartButton";
import { ProductCardSkeleton } from "../components/ProductCardSkeleton";
import { Text } from "../components/Text";
import { Pressable } from "../components/Pressable";
import { colors, fonts, radius, spacing, typography } from "../theme/colors";
import { useCart } from "../state/CartContext";
import { useOutlet } from "../state/OutletContext";
import { useTabBarSpace } from "../hooks/useTabBarSpace";
import { getItemGroupChildren, getProducts } from "../lib/api/products";
import type { CatalogStackParamList } from "../navigation/types";
import type { ItemGroup, ProductQuery } from "../lib/types";

const PAGE_SIZE = 12;

type Props = NativeStackScreenProps<CatalogStackParamList, "Catalog">;

// A row of level-filter chips ("Semua <level>" + each child group), used for
// department / category / sub-category — matching the web's cascading
// Departemen → Kategori → Sub Kategori selects, just rendered as chips
// instead of <select>s since that reads better on a phone.
function GroupChipRow({
  allLabel,
  groups,
  selected,
  onSelect,
}: {
  allLabel: string;
  groups: ItemGroup[];
  selected: string;
  onSelect: (name: string) => void;
}) {
  return (
    <FlatList
      data={[{ name: "", label: allLabel, parent: null, isGroup: true }, ...groups]}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(g) => g.name || "all"}
      contentContainerStyle={{ gap: spacing.xs, paddingVertical: 6 }}
      renderItem={({ item }) => {
        const active = selected === item.name;
        return (
          <Pressable style={[styles.chip, active && styles.chipActive]} onPress={() => onSelect(item.name)}>
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{item.label}</Text>
          </Pressable>
        );
      }}
    />
  );
}

export function CatalogScreen({ navigation, route }: Props) {
  const { add } = useCart();
  const { selectedOutlet } = useOutlet();
  const tabBarSpace = useTabBarSpace();
  const [department, setDepartment] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [sort, setSort] = useState<ProductQuery["sort"]>("relevance");
  const [page, setPage] = useState(1);
  const query = route.params?.q ?? "";

  useEffect(() => {
    setPage(1);
  }, [selectedOutlet]);

  const { data: departments } = useQuery({
    queryKey: ["item-groups", "root"],
    queryFn: () => getItemGroupChildren(),
    staleTime: 10 * 60_000,
  });

  const { data: categories } = useQuery({
    queryKey: ["item-groups", department],
    queryFn: () => getItemGroupChildren(department),
    enabled: department !== "",
    staleTime: 10 * 60_000,
  });

  const { data: subCategories } = useQuery({
    queryKey: ["item-groups", category],
    queryFn: () => getItemGroupChildren(category),
    enabled: category !== "",
    staleTime: 10 * 60_000,
  });

  // The deepest level picked wins, and its own isGroup decides how
  // getProducts matches it (exact leaf vs. "descendants of" branch) —
  // same rule the web's katalog.tsx uses.
  const selected =
    subCategories?.find((g) => g.name === subCategory) ??
    categories?.find((g) => g.name === category) ??
    departments?.find((g) => g.name === department);

  const productQuery: ProductQuery = useMemo(
    () => ({
      search: query || undefined,
      itemGroup: selected?.name,
      itemGroupIsGroup: selected?.isGroup,
      warehouse: selectedOutlet?.warehouse ?? undefined,
      sort,
      page,
      pageSize: PAGE_SIZE,
    }),
    [query, selected, selectedOutlet, sort, page],
  );

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery({
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

        <GroupChipRow
          allLabel="Semua"
          groups={departments ?? []}
          selected={department}
          onSelect={(name) => {
            setDepartment(name);
            setCategory("");
            setSubCategory("");
            setPage(1);
          }}
        />

        {department !== "" && (categories?.length ?? 0) > 0 && (
          <GroupChipRow
            allLabel="Semua Kategori"
            groups={categories ?? []}
            selected={category}
            onSelect={(name) => {
              setCategory(name);
              setSubCategory("");
              setPage(1);
            }}
          />
        )}

        {category !== "" && (subCategories?.length ?? 0) > 0 && (
          <GroupChipRow
            allLabel="Semua Sub Kategori"
            groups={subCategories ?? []}
            selected={subCategory}
            onSelect={(name) => {
              setSubCategory(name);
              setPage(1);
            }}
          />
        )}

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

      {isError ? (
        <View style={styles.center}>
          <Pressable style={styles.errorBox} onPress={() => refetch()}>
            <Text style={styles.errorText}>Gagal memuat produk. Ketuk untuk coba lagi.</Text>
          </Pressable>
        </View>
      ) : isLoading && products.length === 0 ? (
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
        key="grid"
        numColumns={2}
        keyExtractor={(p) => p.id}
        contentContainerStyle={[styles.list, { paddingBottom: tabBarSpace }]}
        columnWrapperStyle={{ gap: spacing.sm }}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        ListEmptyComponent={<Text style={styles.empty}>Tidak ada produk yang cocok.</Text>}
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
      )}
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
  chipText: { fontSize: 12, fontFamily: fonts.body.semiBold, color: colors.onSurfaceVariant },
  chipTextActive: { color: colors.onPrimary },
  sortRow: { flexDirection: "row", gap: spacing.xs, marginTop: spacing.xs, marginBottom: spacing.sm },
  sortChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sortChipActive: { borderColor: colors.primary, backgroundColor: colors.primaryFixed },
  sortText: { fontSize: 11, color: colors.onSurfaceVariant },
  sortTextActive: { color: colors.primary, fontFamily: fonts.body.bold },
  list: { padding: spacing.md, paddingTop: spacing.xs },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  gridItem: { width: "47.5%" },
  empty: { textAlign: "center", color: colors.onSurfaceVariant, paddingVertical: spacing.xxl },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg },
  errorBox: { padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.errorContainer },
  errorText: { color: colors.error, fontSize: 13, fontFamily: fonts.body.semiBold, textAlign: "center" },
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
  pageButtonText: { fontSize: 12, fontFamily: fonts.body.semiBold, color: colors.onSurface },
  pageInfo: { fontSize: 12, color: colors.onSurfaceVariant },
});
