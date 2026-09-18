import { useEffect, useMemo, useState } from "react";
import { FlatList, Modal, RefreshControl, StyleSheet, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Screen } from "../components/Screen";
import { ProductCard } from "../components/ProductCard";
import { ProductCardSkeleton } from "../components/ProductCardSkeleton";
import { CartButton } from "../components/CartButton";
import { Text } from "../components/Text";
import { Pressable } from "../components/Pressable";
import { colors, fonts, radius, spacing, typography } from "../theme/colors";
import { useCart } from "../state/CartContext";
import { useOutlet } from "../state/OutletContext";
import { useTabBarSpace } from "../hooks/useTabBarSpace";
import { getItemGroupChildren, getProducts } from "../lib/api/products";
import { addSearchTerm, clearSearchHistory, getSearchHistory, removeSearchTerm } from "../lib/searchHistory";
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

const SORT_OPTIONS = [
  { label: "Relevan", value: "relevance" as const },
  { label: "Termurah", value: "price_asc" as const },
  { label: "Termahal", value: "price_desc" as const },
];

type Props = NativeStackScreenProps<SearchStackParamList, "Search">;

export function SearchScreen({ navigation, route }: Props) {
  const { add } = useCart();
  const { selectedOutlet } = useOutlet();
  const tabBarSpace = useTabBarSpace();
  const [query, setQuery] = useState(route.params?.q ?? "");
  const [department, setDepartment] = useState("");
  const [sort, setSort] = useState<ProductQuery["sort"]>("relevance");
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    getSearchHistory().then(setHistory);
  }, []);

  // The Search tab stays mounted once visited, so arriving here again from
  // Beranda's search bar (a new navigation with a different `q`) wouldn't
  // otherwise update anything — this re-syncs the query whenever `q` itself
  // actually changes, and still saves it to history like a normal search.
  useEffect(() => {
    if (route.params?.q !== undefined) {
      setQuery(route.params.q);
      setPage(1);
      if (route.params.q.trim()) addSearchTerm(route.params.q.trim()).then(setHistory);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params?.q]);

  const runSearch = (term: string) => {
    setQuery(term);
    setPage(1);
    const trimmed = term.trim();
    if (trimmed) addSearchTerm(trimmed).then(setHistory);
  };

  const { data: departments } = useQuery({
    queryKey: ["item-groups", "root"],
    queryFn: () => getItemGroupChildren(),
    staleTime: 10 * 60_000,
  });

  const productQuery: ProductQuery = useMemo(
    () => ({
      search: query || undefined,
      itemGroup: department || undefined,
      warehouse: selectedOutlet?.warehouse ?? undefined,
      sort,
      page,
      pageSize: PAGE_SIZE,
    }),
    [query, department, selectedOutlet, sort, page],
  );

  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["products", "search", productQuery],
    queryFn: () => getProducts(productQuery),
    enabled: query.length > 0 || department.length > 0,
  });

  const products = data?.products ?? [];
  const isBrowsing = query.length > 0 || department.length > 0;
  const activeFilterCount = (department ? 1 : 0) + (sort !== "relevance" ? 1 : 0);

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
              returnKeyType="search"
              onChangeText={(t) => {
                setQuery(t);
                setPage(1);
              }}
              onSubmitEditing={() => runSearch(query)}
            />
            <Pressable onPress={() => setFilterOpen(true)} hitSlop={8}>
              <View>
                <Ionicons name="options-outline" size={18} color={colors.primary} />
                {activeFilterCount > 0 && <View style={styles.filterBadge} />}
              </View>
            </Pressable>
          </View>
          <CartButton />
        </View>
      </View>

      {isBrowsing && isError ? (
        <View style={styles.center}>
          <Pressable style={styles.errorBox} onPress={() => refetch()}>
            <Text style={styles.errorText}>Gagal memuat produk. Ketuk untuk coba lagi.</Text>
          </Pressable>
        </View>
      ) : isBrowsing && isLoading ? (
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
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={() => refetch()}
            tintColor={colors.primary}
            colors={[colors.primary]}
            progressBackgroundColor={colors.surface}
          />
        }
        ListHeaderComponent={
          <>
            {!isBrowsing && history.length > 0 && (
              <View style={{ marginBottom: spacing.lg }}>
                <View style={styles.recommendHeader}>
                  <Text style={styles.sectionTitle}>Riwayat Pencarian</Text>
                  <Pressable
                    onPress={() => {
                      clearSearchHistory();
                      setHistory([]);
                    }}
                  >
                    <Text style={styles.resetText}>Hapus Semua</Text>
                  </Pressable>
                </View>
                <View style={styles.historyList}>
                  {history.map((term) => (
                    <Pressable key={term} style={styles.historyChip} onPress={() => runSearch(term)}>
                      <Ionicons name="time-outline" size={13} color={colors.onSurfaceVariant} />
                      <Text style={styles.historyChipText} numberOfLines={1}>
                        {term}
                      </Text>
                      <Pressable
                        hitSlop={8}
                        onPress={() => removeSearchTerm(term).then(setHistory)}
                      >
                        <Ionicons name="close" size={14} color={colors.onSurfaceVariant} />
                      </Pressable>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

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
                    setSort("relevance");
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
      )}

      <Modal visible={filterOpen} animationType="slide" transparent onRequestClose={() => setFilterOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setFilterOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Filter Pencarian</Text>
              <Pressable onPress={() => setFilterOpen(false)} hitSlop={8}>
                <Ionicons name="close" size={20} color={colors.onSurface} />
              </Pressable>
            </View>

            <Text style={styles.sheetLabel}>Kategori</Text>
            <View style={styles.sheetChipRow}>
              {[{ name: "", label: "Semua" }, ...(departments ?? [])].map((d) => {
                const active = department === d.name;
                return (
                  <Pressable
                    key={d.name || "all"}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => {
                      setDepartment(d.name);
                      setPage(1);
                    }}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{d.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.sheetLabel}>Urutkan</Text>
            <View style={styles.sheetChipRow}>
              {SORT_OPTIONS.map((s) => {
                const active = sort === s.value;
                return (
                  <Pressable
                    key={s.value}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => {
                      setSort(s.value);
                      setPage(1);
                    }}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{s.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.sheetActions}>
              <Pressable
                style={styles.resetButton}
                onPress={() => {
                  setDepartment("");
                  setSort("relevance");
                  setPage(1);
                }}
              >
                <Text style={styles.resetButtonText}>Reset Filter</Text>
              </Pressable>
              <Pressable style={styles.applyButton} onPress={() => setFilterOpen(false)}>
                <Text style={styles.applyButtonText}>Terapkan</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
  filterBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 7,
    height: 7,
    borderRadius: radius.full,
    backgroundColor: colors.secondary,
  },
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
  resetText: { fontSize: 12, fontFamily: fonts.body.bold, color: colors.secondary },
  historyList: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  historyChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    maxWidth: "100%",
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainer,
  },
  historyChipText: { fontSize: 12, color: colors.onSurface, flexShrink: 1 },
  list: { padding: spacing.md, paddingTop: spacing.xs },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  gridItem: { width: "47.5%" },
  empty: { textAlign: "center", color: colors.onSurfaceVariant, paddingVertical: spacing.xxl },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg },
  errorBox: { padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.errorContainer },
  errorText: { color: colors.error, fontSize: 13, fontFamily: fonts.body.semiBold, textAlign: "center" },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  sheetTitle: { fontSize: 16, fontFamily: fonts.display.bold, color: colors.onSurface },
  sheetLabel: {
    fontSize: 12,
    fontFamily: fonts.body.semiBold,
    color: colors.onSurfaceVariant,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  sheetChipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainer,
  },
  chipActive: { backgroundColor: colors.primary },
  chipText: { fontSize: 12, fontFamily: fonts.body.semiBold, color: colors.onSurfaceVariant },
  chipTextActive: { color: colors.onPrimary },
  sheetActions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.lg },
  resetButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: 12,
    alignItems: "center",
  },
  resetButtonText: { color: colors.primary, fontFamily: fonts.body.bold, fontSize: 13 },
  applyButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: 12,
    alignItems: "center",
  },
  applyButtonText: { color: colors.onPrimary, fontFamily: fonts.body.bold, fontSize: 13 },
});
