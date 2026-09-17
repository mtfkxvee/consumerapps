import { useState } from "react";
import {
  FlatList,
  ImageBackground,
  Linking,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Screen } from "../components/Screen";
import { ProductCard } from "../components/ProductCard";
import { ProductCardSkeleton } from "../components/ProductCardSkeleton";
import { CartButton } from "../components/CartButton";
import { PromoBannerImage } from "../components/PromoBannerImage";
import { OutletPicker } from "../components/OutletPicker";
import { Text } from "../components/Text";
import { Pressable } from "../components/Pressable";
import { colors, fonts, radius, spacing, typography, TAB_BAR_SPACE } from "../theme/colors";
import { useCart } from "../state/CartContext";
import { useAuth } from "../state/AuthContext";
import {
  getItemGroupChildren,
  getPromoBanners,
  getPromoProducts,
  getProducts,
} from "../lib/api/products";
import { getMyLoyaltyStatus } from "../lib/api/loyalty";
import { WHATSAPP_NUMBER } from "../lib/mock-data";
import type { HomeStackParamList } from "../navigation/types";

const HEADER_IMAGE = require("../../assets/login-hero.jpg");

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

type Props = NativeStackScreenProps<HomeStackParamList, "Home">;

export function HomeScreen({ navigation }: Props) {
  const { add } = useCart();
  const { width } = useWindowDimensions();
  const { user, isLoggedIn } = useAuth();
  const [searchText, setSearchText] = useState("");

  const goToTab = (tab: string) => navigation.getParent()?.navigate(tab as never);

  // Typing happens right here on Beranda — only submitting (pressing
  // enter/search on the keyboard) hands off to the Search tab, passing the
  // typed text along as its initial query.
  const submitSearch = () => {
    const q = searchText.trim();
    const parentNavigate = navigation.getParent()?.navigate as
      | ((name: string, params?: object) => void)
      | undefined;
    parentNavigate?.("SearchTab", { screen: "Search", params: q ? { q } : undefined });
    setSearchText("");
  };

  const { data: departments } = useQuery({
    queryKey: ["item-groups", "root"],
    queryFn: () => getItemGroupChildren(),
    staleTime: 10 * 60_000,
  });

  const { data: loyalty } = useQuery({
    queryKey: ["loyalty-status"],
    queryFn: () => getMyLoyaltyStatus(),
    enabled: isLoggedIn,
  });

  const {
    data: deals,
    isLoading: dealsLoading,
    isError: dealsError,
    refetch: refetchDeals,
  } = useQuery({
    queryKey: ["promo-products"],
    queryFn: () => getPromoProducts(),
    retry: 2,
  });

  const { data: banners } = useQuery({
    queryKey: ["promo-banners"],
    queryFn: () => getPromoBanners(),
  });

  const { data: productsPage, isLoading: productsLoading } = useQuery({
    queryKey: ["products", { pageSize: 6 }],
    queryFn: () => getProducts({ page: 1, pageSize: 6 }),
  });

  const products = productsPage?.products ?? [];
  const displayName = user?.customer?.name ?? user?.email ?? "Tamu";

  return (
    <Screen style={{ backgroundColor: colors.primary }}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ImageBackground
          source={HEADER_IMAGE}
          style={styles.header}
          imageStyle={styles.headerImage}
        >
          <View style={styles.headerOverlay} />
          <View style={styles.headerTopRow}>
            <View>
              <Text style={styles.brand}>X-SHA</Text>
            </View>
            <View style={styles.headerIcons}>
              <Pressable style={styles.headerIconButton} onPress={() => goToTab("AccountTab")}>
                <Ionicons name="notifications-outline" size={18} color={colors.onPrimary} />
                <View style={styles.headerIconBadge} />
              </Pressable>
              <Pressable
                style={styles.headerIconButton}
                onPress={() => Linking.openURL(`https://wa.me/${WHATSAPP_NUMBER}`)}
              >
                <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.onPrimary} />
              </Pressable>
              <CartButton tone="light" />
            </View>
          </View>

          <Text style={styles.greeting}>
            Selamat datang,{"\n"}
            <Text style={styles.greetingName}>{displayName}</Text> 👋
          </Text>

          <View style={{ marginBottom: spacing.md }}>
            <OutletPicker />
          </View>

          <View style={styles.searchBar}>
            <Ionicons name="search" size={16} color={colors.onSurfaceVariant} />
            <TextInput
              style={styles.searchInput}
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={submitSearch}
              returnKeyType="search"
              placeholder="Cari produk halal favorit kamu..."
              placeholderTextColor={colors.onSurfaceVariant}
            />
          </View>

          {isLoggedIn ? (
            <Pressable style={styles.pointsBanner} onPress={() => goToTab("AccountTab")}>
              <View style={{ flex: 1 }}>
                <Text style={styles.pointsLabel}>XSHA LOVERS</Text>
                <Text style={styles.pointsValue}>{loyalty?.points ?? 0} Poin Tersedia</Text>
                <Text style={styles.pointsSubtext}>Tukarkan poin untuk diskon menarik</Text>
              </View>
              <Ionicons name="star" size={30} color={colors.onPrimary} />
            </Pressable>
          ) : (
            <Pressable style={styles.pointsBanner} onPress={() => goToTab("AccountTab")}>
              <View style={{ flex: 1 }}>
                <Text style={styles.pointsLabel}>MEMBER X-SHA</Text>
                <Text style={styles.pointsValue}>Masuk untuk mulai kumpulkan poin</Text>
              </View>
              <Ionicons name="arrow-forward-circle" size={30} color={colors.onPrimary} />
            </Pressable>
          )}
        </ImageBackground>

        <View style={styles.body}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Kategori</Text>
              <Pressable onPress={() => goToTab("CatalogTab")}>
                <Text style={styles.seeAll}>Semua →</Text>
              </Pressable>
            </View>
            <View style={styles.categoryGrid}>
              {(departments ?? []).slice(0, 8).map((d) => (
                <Pressable key={d.name} style={styles.categoryItem} onPress={() => goToTab("CatalogTab")}>
                  <View style={styles.categoryIconWrap}>
                    <Ionicons name={iconForGroup(d.name)} size={20} color={colors.primary} />
                  </View>
                  <Text style={styles.categoryLabel} numberOfLines={1}>
                    {d.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {(banners?.length ?? 0) > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Promo Aktif</Text>
                <Pressable onPress={() => goToTab("CatalogTab")}>
                  <Text style={styles.seeAll}>Lihat semua →</Text>
                </Pressable>
              </View>
              <FlatList
                data={banners}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(b) => b.id}
                contentContainerStyle={{ gap: spacing.sm, paddingHorizontal: spacing.md }}
                renderItem={({ item }) => <PromoBannerImage uri={item.image} width={width * 0.48} />}
              />
            </View>
          )}

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Penawaran Kilat</Text>
            </View>
            {dealsError ? (
              <Pressable style={styles.errorBox} onPress={() => refetchDeals()}>
                <Text style={styles.errorText}>Gagal memuat promo. Coba lagi.</Text>
              </Pressable>
            ) : dealsLoading ? (
              <FlatList
                data={[0, 1, 2, 3]}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(i) => `skeleton-${i}`}
                contentContainerStyle={{ gap: spacing.sm, paddingHorizontal: spacing.md }}
                renderItem={() => (
                  <View style={{ width: 160 }}>
                    <ProductCardSkeleton />
                  </View>
                )}
              />
            ) : (deals?.length ?? 0) === 0 ? (
              <Text style={styles.emptyText}>Belum ada promo aktif saat ini.</Text>
            ) : (
              <FlatList
                data={deals}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(p) => p.id}
                contentContainerStyle={{ gap: spacing.sm, paddingHorizontal: spacing.md }}
                renderItem={({ item }) => (
                  <View style={{ width: 160 }}>
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
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Produk Pilihan</Text>
            </View>
            <View style={styles.grid}>
              {productsLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <View key={i} style={styles.gridItem}>
                      <ProductCardSkeleton />
                    </View>
                  ))
                : products.map((p) => (
                    <View key={p.id} style={styles.gridItem}>
                      <ProductCard
                        product={p}
                        onPress={() => navigation.navigate("ProductDetail", { id: p.id })}
                        onAdd={() =>
                          add({ id: p.id, name: p.name, price: p.price, image: p.image, alt: p.alt })
                        }
                      />
                    </View>
                  ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: TAB_BAR_SPACE },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: radius.xl + 8,
    borderBottomRightRadius: radius.xl + 8,
    overflow: "hidden",
  },
  headerImage: {
    borderBottomLeftRadius: radius.xl + 8,
    borderBottomRightRadius: radius.xl + 8,
  },
  headerOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.primary,
    opacity: 0.55,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  brand: { color: colors.onPrimary, fontSize: 20, fontFamily: fonts.display.extraBold, letterSpacing: 0.5 },
  headerIcons: { flexDirection: "row", gap: spacing.sm },
  headerIconButton: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerIconBadge: {
    position: "absolute",
    top: 7,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: radius.full,
    backgroundColor: colors.secondary,
  },
  greeting: { color: colors.primaryFixed, fontSize: 14, lineHeight: 20, marginBottom: spacing.md },
  greetingName: { color: colors.onPrimary, fontFamily: fonts.body.extraBold, fontSize: 16 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    height: 46,
    marginBottom: spacing.md,
  },
  searchInput: { flex: 1, color: colors.onSurface, fontSize: 13 },
  pointsBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.secondary,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  pointsLabel: {
    color: colors.white,
    fontSize: 10,
    fontFamily: fonts.body.extraBold,
    letterSpacing: 1,
    opacity: 0.85,
    marginBottom: 2,
  },
  pointsValue: { color: colors.white, fontSize: 15, fontFamily: fonts.body.extraBold },
  pointsSubtext: { color: colors.white, fontSize: 11, opacity: 0.85, marginTop: 2 },
  body: { backgroundColor: colors.background, paddingTop: spacing.lg },
  section: { marginBottom: spacing.lg },
  sectionHeader: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: { ...typography.headlineMd, fontSize: 17, color: colors.onSurface },
  seeAll: { fontSize: 12, fontFamily: fonts.body.bold, color: colors.secondary },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: spacing.md,
    rowGap: spacing.md,
  },
  categoryItem: { width: "25%", alignItems: "center", gap: 6 },
  categoryIconWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryFixed,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryLabel: { fontSize: 10, color: colors.onSurfaceVariant, textAlign: "center" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  gridItem: { width: "31%" },
  errorBox: {
    marginHorizontal: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.errorContainer,
    alignItems: "center",
  },
  errorText: { color: colors.error, fontSize: 13, fontFamily: fonts.body.semiBold },
  emptyText: {
    marginHorizontal: spacing.md,
    color: colors.onSurfaceVariant,
    fontSize: 13,
    paddingVertical: spacing.md,
  },
});
