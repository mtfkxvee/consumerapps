import { useRef, useState } from "react";
import { Animated, StyleSheet, useWindowDimensions, View } from "react-native";
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
  Illustration: (props: { size?: number }) => React.JSX.Element;
  title: string;
  subtitle: string;
};

const SLIDES: Slide[] = [
  {
    key: "nearest-store",
    Illustration: NearestStoreIllustration,
    title: "Temukan Toko X-SHA Terdekat",
    subtitle:
      "Temukan toko kelontong, minimarket, dan supermarket X-SHA terdekat untuk memenuhi kebutuhan harianmu dengan mudah.",
  },
  {
    key: "shop-needs",
    Illustration: ShopNeedsIllustration,
    title: "Pilih Kebutuhan Harianmu",
    subtitle: "Belanja sembako, perlengkapan rumah tangga, hingga camilan favorit dengan diskon dan promo spesial setiap hari.",
  },
  {
    key: "fast-delivery",
    Illustration: FastDeliveryIllustration,
    title: "Pengantaran Cepat ke Rumah",
    subtitle: "Pesanan kebutuhan pokok dan belanjaanmu langsung diantar kilat sampai depan pintu, aman dan praktis.",
  },
];

type Props = { onFinish: () => void };

const NEXT_BUTTON_SIZE = 56;
const CTA_WIDTH = 188;

export function OnboardingScreen({ onFinish }: Props) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const pagerRef = useRef<PagerView>(null);
  const [page, setPage] = useState(0);
  const isLast = page === SLIDES.length - 1;

  // Continuous 0..2 value tracking real-time drag position (not just the
  // settled page index), so the backdrop pans with the finger during a
  // swipe instead of snapping only once a page change commits. The page's
  // own background color stays a constant colors.primary — only this
  // decorative backdrop moves.
  const scrollProgress = useRef(new Animated.Value(0)).current;
  const handlePageScroll = (e: PagerViewOnPageScrollEvent) => {
    const { position, offset } = e.nativeEvent;
    scrollProgress.setValue(position + offset);
  };
  const backdropTranslateX = scrollProgress.interpolate({
    inputRange: [0, SLIDES.length - 1],
    outputRange: [0, -(SLIDES.length - 1) * screenWidth],
  });

  // Morphs the circular "next" button into the "Mulai Sekarang" pill
  // continuously over the last slide transition, rather than swapping
  // between two differently-shaped components the instant isLast flips —
  // same live-scroll-driven approach as the rest of this screen.
  const morphRange = [SLIDES.length - 2, SLIDES.length - 1];
  const ctaWidth = scrollProgress.interpolate({
    inputRange: morphRange,
    outputRange: [NEXT_BUTTON_SIZE, CTA_WIDTH],
    extrapolate: "clamp",
  });
  const arrowOpacity = scrollProgress.interpolate({
    inputRange: morphRange,
    outputRange: [1, 0],
    extrapolate: "clamp",
  });
  const ctaTextOpacity = scrollProgress.interpolate({
    inputRange: morphRange,
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const goToPage = (index: number) => {
    pagerRef.current?.setPage(index);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <OnboardingBackdrop slideCount={SLIDES.length} screenWidth={screenWidth} translateX={backdropTranslateX} />

      <View style={styles.header}>
        <Pressable
          onPress={() => goToPage(page - 1)}
          disabled={page === 0}
          hitSlop={12}
          style={[styles.backButton, page === 0 && { opacity: 0 }]}
        >
          <Ionicons name="chevron-back" size={20} color={colors.onPrimary} />
        </Pressable>
        <ProgressBar count={SLIDES.length} scrollProgress={scrollProgress} />
        <View style={{ width: 40, height: 40 }} />
      </View>

      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={(e) => setPage(e.nativeEvent.position)}
        onPageScroll={handlePageScroll}
      >
        {SLIDES.map((slide, index) => (
          <OnboardingSlide key={slide.key} slide={slide} index={index} scrollProgress={scrollProgress} />
        ))}
      </PagerView>

      <View style={styles.footer}>
        <Pressable onPress={onFinish} hitSlop={8}>
          <Text style={styles.skipText}>{isLast ? "SELESAI" : "LEWATI"}</Text>
        </Pressable>

        <Animated.View style={[styles.morphButton, { width: ctaWidth }]}>
          <Pressable
            style={styles.morphPressableFill}
            onPress={() => (isLast ? onFinish() : goToPage(page + 1))}
          >
            <Animated.View style={[styles.morphContent, { opacity: arrowOpacity }]}>
              <Ionicons name="arrow-forward" size={22} color={colors.onTertiaryContainer} />
            </Animated.View>
            <Animated.View style={[styles.morphContent, { opacity: ctaTextOpacity }]}>
              <Text style={styles.ctaButtonText} numberOfLines={1}>
                MULAI SEKARANG
              </Text>
            </Animated.View>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

// One continuous fill bar in the header rather than 3 discrete segments —
// driven directly by the live position+offset the PagerView reports (not
// the settled page index), so it grows in exact lockstep with the drag
// itself instead of jumping to "full" once a page change commits.
function ProgressBar({ count, scrollProgress }: { count: number; scrollProgress: Animated.Value }) {
  const fill = scrollProgress.interpolate({
    inputRange: [0, count - 1],
    outputRange: ["0%", "100%"],
    extrapolate: "clamp",
  });
  return (
    <View style={styles.progressTrack}>
      <Animated.View style={[styles.progressFill, { width: fill }]} />
    </View>
  );
}

// Content motion is derived continuously from scrollProgress (the same
// live value driving the backdrop/progress bar) instead of a spring
// triggered once the page settles — the previous "active" + Animated.spring
// approach left the incoming slide invisible for the whole drag (spring
// only fired after onPageSelected), so content popped in right as you
// stopped dragging: exactly what read as a flicker. Interpolating against
// this slide's own index means it fades/lifts in sync with the drag itself,
// same as the backdrop and progress bar.
function OnboardingSlide({
  slide,
  index,
  scrollProgress,
}: {
  slide: Slide;
  index: number;
  scrollProgress: Animated.Value;
}) {
  const opacity = scrollProgress.interpolate({
    inputRange: [index - 1, index, index + 1],
    outputRange: [0, 1, 0],
    extrapolate: "clamp",
  });
  const translateY = scrollProgress.interpolate({
    inputRange: [index - 1, index, index + 1],
    outputRange: [16, 0, 16],
    extrapolate: "clamp",
  });
  const Illustration = slide.Illustration;

  return (
    <View style={styles.slide}>
      <Animated.View style={[styles.illustrationDisc, { opacity, transform: [{ translateY }] }]}>
        <Illustration size={132} />
      </Animated.View>

      <Animated.View style={{ opacity, transform: [{ translateY }] }}>
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
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
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
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: "rgba(255,255,255,0.25)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: radius.full,
    backgroundColor: colors.tertiaryContainer,
  },
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
  // Width is animated (see ctaWidth); height/shape stay fixed throughout
  // the morph, so it's one continuously-resizing pill rather than two
  // differently-shaped components swapped at a breakpoint.
  morphButton: {
    height: NEXT_BUTTON_SIZE,
    borderRadius: radius.full,
    backgroundColor: colors.tertiaryContainer,
    overflow: "hidden",
    shadowColor: colors.black,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  morphPressableFill: { flex: 1 },
  // Arrow icon and CTA text sit stacked on the same spot (absolute fill)
  // and cross-fade via opacity, rather than sitting side by side.
  morphContent: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaButtonText: {
    color: colors.onTertiaryContainer,
    fontFamily: fonts.body.bold,
    fontSize: 13,
    letterSpacing: 0.6,
  },
});
