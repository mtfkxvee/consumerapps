import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import PagerView, { type PagerViewOnPageScrollEvent } from "react-native-pager-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../components/Text";
import { Pressable } from "../components/Pressable";
import { OnboardingBackdrop } from "../components/onboarding/OnboardingBackdrop";
import {
  FastDeliveryIllustration,
  NearestStoreIllustration,
  ShopNeedsIllustration,
} from "../components/onboarding/illustrations";
import { colors, fonts, radius, spacing, typography } from "../theme/colors";

type Slide = {
  key: string;
  bgColor: string;
  Illustration: (props: { size?: number }) => React.JSX.Element;
  title: string;
  subtitle: string;
};

// Each slide has its own tint from the same violet family already in the
// palette — distinct enough to tell slides apart, close enough that
// interpolating between them (see bgColor below) reads as one continuous
// wash rather than a hard cut.
const SLIDES: Slide[] = [
  {
    key: "nearest-store",
    bgColor: colors.primary,
    Illustration: NearestStoreIllustration,
    title: "Temukan Toko X-SHA Terdekat",
    subtitle:
      "Temukan toko kelontong, minimarket, dan supermarket X-SHA terdekat untuk memenuhi kebutuhan harianmu dengan mudah.",
  },
  {
    key: "shop-needs",
    bgColor: colors.primaryContainer,
    Illustration: ShopNeedsIllustration,
    title: "Pilih Kebutuhan Harianmu",
    subtitle: "Belanja sembako, perlengkapan rumah tangga, hingga camilan favorit dengan diskon dan promo spesial setiap hari.",
  },
  {
    key: "fast-delivery",
    bgColor: colors.secondary,
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

  // Continuous 0..2 value tracking real-time drag position (not just the
  // settled page index), so the background tween follows the finger during
  // a swipe instead of snapping only once a page change commits.
  const scrollProgress = useRef(new Animated.Value(0)).current;
  const handlePageScroll = (e: PagerViewOnPageScrollEvent) => {
    const { position, offset } = e.nativeEvent;
    scrollProgress.setValue(position + offset);
  };
  const backgroundColor = scrollProgress.interpolate({
    inputRange: SLIDES.map((_, i) => i),
    outputRange: SLIDES.map((s) => s.bgColor),
  });
  const backdropTranslateX = scrollProgress.interpolate({
    inputRange: [0, SLIDES.length - 1],
    outputRange: [0, -40],
  });

  const goToPage = (index: number) => {
    pagerRef.current?.setPage(index);
  };

  return (
    <Animated.View style={[styles.container, { backgroundColor }, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateX: backdropTranslateX }] }]}>
        <OnboardingBackdrop />
      </Animated.View>

      <View style={styles.header}>
        <Pressable
          onPress={() => goToPage(page - 1)}
          disabled={page === 0}
          hitSlop={12}
          style={[styles.backButton, page === 0 && { opacity: 0 }]}
        >
          <Ionicons name="chevron-back" size={20} color={colors.onPrimary} />
        </Pressable>
      </View>

      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={(e) => setPage(e.nativeEvent.position)}
        onPageScroll={handlePageScroll}
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
          <Text style={styles.skipText}>{isLast ? "SELESAI" : "LEWATI"}</Text>
        </Pressable>

        {isLast ? (
          <Pressable style={styles.ctaButton} onPress={onFinish}>
            <Text style={styles.ctaButtonText}>MULAI SEKARANG</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.nextButton} onPress={() => goToPage(page + 1)}>
            <Ionicons name="arrow-forward" size={22} color={colors.onTertiaryContainer} />
          </Pressable>
        )}
      </View>
    </Animated.View>
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
      <Animated.View style={[styles.illustrationDisc, { opacity: anim, transform: [{ translateY }] }]}>
        <Illustration size={132} />
      </Animated.View>

      <Animated.View style={{ opacity: anim, transform: [{ translateY }] }}>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.subtitle}>{slide.subtitle}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary },
  header: {
    height: 44,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  illustrationDisc: {
    width: 224,
    height: 224,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
    backgroundColor: colors.primaryFixed,
  },
  title: {
    ...typography.headlineLg,
    color: colors.onPrimary,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: fonts.body.regular,
    color: colors.primaryFixed,
    textAlign: "center",
    lineHeight: 21,
    opacity: 0.9,
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
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  dotActive: { width: 24, backgroundColor: colors.tertiaryContainer },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  skipText: {
    fontSize: 11,
    fontFamily: fonts.body.bold,
    color: colors.primaryFixed,
    letterSpacing: 1.2,
  },
  nextButton: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.tertiaryContainer,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.black,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  ctaButton: {
    backgroundColor: colors.tertiaryContainer,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
  },
  ctaButtonText: {
    color: colors.onTertiaryContainer,
    fontFamily: fonts.body.bold,
    fontSize: 13,
    letterSpacing: 0.6,
  },
});
