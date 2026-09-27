import { Animated, StyleSheet } from "react-native";
import Svg, { Circle, G, Path, Rect } from "react-native-svg";
import { colors } from "../../theme/colors";

// One wide virtual canvas (400 units per slide) panned by `translateX`
// (driven by real swipe position, see OnboardingScreen) so the background
// visibly slides between slides, while the page's own solid color stays
// constant.
//
// Kept deliberately simple and on-theme after two rounds of feedback: the
// first pass (abstract journey line + waypoint dots + multiple glow orbs)
// was flagged as "too busy" — dropped in favor of a sparse scatter of
// outlined retail/FMCG/fashion icons (shopping bag, t-shirt, bottle, price
// tag, basket) at low opacity, plus the same minimal top drips as before.
export function OnboardingBackdrop({
  slideCount,
  screenWidth,
  translateX,
}: {
  slideCount: number;
  screenWidth: number;
  translateX: Animated.AnimatedInterpolation<number>;
}) {
  const unit = 400; // virtual units per slide, independent of actual device width
  const totalUnits = unit * slideCount;
  const totalWidth = screenWidth * slideCount;

  return (
    <Animated.View
      style={[styles.container, { width: totalWidth, transform: [{ translateX }] }]}
      pointerEvents="none"
    >
      <Svg width={totalWidth} height="100%" viewBox={`0 0 ${totalUnits} 800`} preserveAspectRatio="none">
        {buildDrips(totalUnits).map((d, i) => (
          <Rect key={i} x={d.x} y={0} width={d.w} height={d.h} rx={d.w / 2} fill={colors.surface} opacity={d.opacity} />
        ))}

        {THEME_ICONS.filter((ic) => ic.x < totalUnits + 60).map((ic, i) => (
          <ThemeIcon key={i} {...ic} />
        ))}
      </Svg>
    </Animated.View>
  );
}

type IconType = "bag" | "shirt" | "bottle" | "tag" | "basket";

// Each drawn once at a nominal 76-unit local scale, centered on its own
// origin — repositioned/resized per instance via a single translate+scale
// transform rather than recomputing coordinates.
function ThemeIcon({
  type,
  x,
  y,
  size,
  opacity,
  rotation = 0,
}: {
  type: IconType;
  x: number;
  y: number;
  size: number;
  opacity: number;
  rotation?: number;
}) {
  const scale = size / 76;
  return (
    <G transform={`translate(${x} ${y}) rotate(${rotation}) scale(${scale})`} opacity={opacity}>
      {ICON_PATHS[type]}
    </G>
  );
}

const strokeProps = {
  stroke: colors.surface,
  strokeWidth: 2.4,
  fill: "none" as const,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const ICON_PATHS: Record<IconType, React.JSX.Element> = {
  bag: (
    <>
      <Path d="M-16,-24 Q-16,-38 0,-38 Q16,-38 16,-24" {...strokeProps} />
      <Path d="M-22,-24 L22,-24 L18,30 L-18,30 Z" {...strokeProps} />
    </>
  ),
  shirt: (
    <Path
      d="M-18,-20 L-30,-12 L-24,-2 L-16,-6 L-16,28 L16,28 L16,-6 L24,-2 L30,-12 L18,-20 Q12,-14 0,-14 Q-12,-14 -18,-20 Z"
      {...strokeProps}
    />
  ),
  bottle: (
    <>
      <Path d="M-6,-36 L6,-36 L6,-24 L12,-16 L12,32 Q12,36 8,36 L-8,36 Q-12,36 -12,32 L-12,-16 L-6,-24 Z" {...strokeProps} />
      <Path d="M-12,4 L12,4" {...strokeProps} />
    </>
  ),
  tag: (
    <>
      <Path d="M-22,-16 L4,-16 L24,4 L4,24 L-22,24 Z" {...strokeProps} />
      <Circle cx={-10} cy={-2} r={3} stroke={colors.surface} strokeWidth={2.4} fill="none" />
    </>
  ),
  basket: (
    <>
      <Path d="M-24,-8 L24,-8 L18,26 L-18,26 Z" {...strokeProps} />
      <Path d="M-16,-8 Q-10,-26 0,-26 Q10,-26 16,-8" {...strokeProps} />
      <Path d="M-12,-8 L-8,16 M0,-8 L0,16 M12,-8 L8,16" {...strokeProps} />
    </>
  ),
};

// Sparse scatter across the whole canvas — roughly 2-3 per 400-unit panel,
// mixed types, varied size/rotation so it doesn't read as a repeated tile.
const THEME_ICONS: { type: IconType; x: number; y: number; size: number; opacity: number; rotation?: number }[] = [
  { type: "bag", x: 70, y: 220, size: 60, opacity: 0.14, rotation: -8 },
  { type: "tag", x: 300, y: 440, size: 46, opacity: 0.12, rotation: 10 },
  { type: "bottle", x: 470, y: 180, size: 56, opacity: 0.13, rotation: -6 },
  { type: "shirt", x: 640, y: 460, size: 58, opacity: 0.14, rotation: 8 },
  { type: "basket", x: 830, y: 220, size: 60, opacity: 0.13, rotation: -5 },
  { type: "bag", x: 1000, y: 480, size: 50, opacity: 0.12, rotation: 12 },
  { type: "shirt", x: 1150, y: 240, size: 54, opacity: 0.13, rotation: -10 },
];

// Irregular widths/heights/gaps instead of one repeated tile — reads as a
// deliberate scalloped edge rather than a mechanically stamped pattern.
function buildDrips(totalUnits: number): { x: number; w: number; h: number; opacity: number }[] {
  const pattern = [
    { w: 26, h: 78 },
    { w: 34, h: 52 },
    { w: 22, h: 96 },
    { w: 30, h: 64 },
    { w: 20, h: 44 },
  ];
  const drips: { x: number; w: number; h: number; opacity: number }[] = [];
  let x = 16;
  let i = 0;
  while (x < totalUnits) {
    const p = pattern[i % pattern.length];
    drips.push({ x, w: p.w, h: p.h, opacity: i % 2 === 0 ? 0.14 : 0.09 });
    x += p.w + 26;
    i++;
  }
  return drips;
}

const styles = StyleSheet.create({
  // Deliberately not StyleSheet.absoluteFill — that also pins `right: 0`,
  // which would fight the explicit (wider-than-screen) width set inline.
  container: { position: "absolute", top: 0, left: 0, bottom: 0 },
});
