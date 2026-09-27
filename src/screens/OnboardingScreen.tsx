import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import PagerView from "react-native-pager-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../components/Text";
import { Pressable } from "../components/Pressable";
import {
  FastDeliveryIllustration,
  NearestStoreIllustration,
  ShopNeedsIllustration,
} from "../components/onboarding/illustrations";
import { colors, fonts, radius, spacing, typography } from "../theme/colors";

type Slide = {
  key: string;
  blobColor: string;
  Illustration: (props: { size?: number }) => React.JSX.Element;
  title: string;
  subtitle: string;
};

const SLIDES: Slide[] = [
  {
    key: "nearest-store",
    blobColor: colors.primaryFixed,
    Illustration: NearestStoreIllustration,
    title: "Temukan Toko X-SHA Terdekat",
    subtitle:
      "Temukan toko kelontong, minimarket, dan supermarket X-SHA terdekat untuk memenuhi kebutuhan harianmu dengan mudah.",
  },
  {
    key: "shop-needs",
    blobColor: colors.secondaryContainer,
    Illustration: ShopNeedsIllustration,
    title: "Pilih Kebutuhan Harianmu",
    subtitle: "Belanja sembako, perlengkapan rumah tangga, hingga camilan favorit dengan diskon dan promo spesial setiap hari.",
  },
  {
    key: "fast-delivery",
    blobColor: colors.tertiaryContainer,
    Illustration: FastDeliveryIllustration,
    title: "Pengantaran Cepat ke Rumah",
    subtitle: "Pesanan kebutuhan pokok dan belanjaanmu langsung diantar kilat sampai depan pintu, aman dan praktis.",
  },
];

type Props = { onFinish: () => void };

export function OnboardingScreen({ onFinish }: Props) {
  const insets = useSafeAreaInsets();
  const pagerRef = useRef<PagerView>(null);
  const [page, setPage] = useState(0);
  const isLast = page === SLIDES.length - 1;

  const goToPage = (index: number) => {
    pagerRef.current?.setPage(index);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => goToPage(page - 1)}
          disabled={page === 0}
          hitSlop={12}
          style={{ opacity: page === 0 ? 0 : 1 }}
        >
          <Ionicons name="chevron-back" size={24} color={colors.onSurface} />
        </Pressable>
      </View>

      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={(e) => setPage(e.nativeEvent.position)}
      >
        {SLIDES.map((slide, index) => (
          <OnboardingSlide key={slide.key} slide={slide} active={page === index} />
        ))}
      </PagerView>

      <View style={styles.dotsRow}>
        {SLIDES.map((slide, index) => (
          <View key={slide.key} style={[styles.dot, index === page && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.footer}>
        <Pressable onPress={onFinish} hitSlop={8}>
          <Text style={styles.skipText}>{isLast ? "Selesai" : "Lewati"}</Text>
        </Pressable>

        {isLast ? (
          <Pressable style={styles.ctaButton} onPress={onFinish}>
            <Text style={styles.ctaButtonText}>Mulai Sekarang</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.nextButton} onPress={() => goToPage(page + 1)}>
            <Ionicons name="arrow-forward" size={22} color={colors.onPrimary} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

function OnboardingSlide({ slide, active }: { slide: Slide; active: boolean }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) return;
    anim.setValue(0);
    Animated.spring(anim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 55,
      friction: 9,
    }).start();
  }, [active, anim]);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [28, 0] });
  const Illustration = slide.Illustration;

  return (
    <View style={styles.slide}>
      <Animated.View style={[styles.blob, { backgroundColor: slide.blobColor, opacity: anim, transform: [{ translateY }] }]}>
        <Illustration size={128} />
      </Animated.View>

      <Animated.View style={{ opacity: anim, transform: [{ translateY }] }}>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.subtitle}>{slide.subtitle}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    height: 44,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  blob: {
    width: 220,
    height: 220,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.headlineLg,
    color: colors.onSurface,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: fonts.body.regular,
    color: colors.onSurfaceVariant,
    textAlign: "center",
    lineHeight: 21,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.outlineVariant,
  },
  dotActive: { width: 24, backgroundColor: colors.primary },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  skipText: { fontSize: 14, fontFamily: fonts.body.semiBold, color: colors.onSurfaceVariant },
  nextButton: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaButton: {
    backgroundColor: colors.secondary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
  },
  ctaButtonText: { color: colors.onSecondary, fontFamily: fonts.body.bold, fontSize: 14 },
});
