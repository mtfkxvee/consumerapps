import { Animated, StyleSheet } from "react-native";
import Svg, { Circle, G, Path, Rect } from "react-native-svg";
import { colors } from "../../theme/colors";

// Ported closely from a reference composition the user supplied (waves,
// a dripping canopy, per-screen spotlight halos, one continuous dashed
// route threading through with anchor rings at the seams, plus per-screen
// FMCG/fashion icon clusters) — recolored to X-SHA's own palette rather
// than the reference's literal hex values, and using the icon shapes
// already designed/checked earlier in illustrations.tsx and the previous
// pass here, rather than re-deriving new ones.
//
// Coordinate system matches the reference 1:1 (640 units per slide, 1080
// tall) so its relative composition (wave curves, spotlight centers, route
// path) ports over correctly regardless of the actual device size — the
// Svg stretches this virtual canvas to fit via preserveAspectRatio="none",
// same mechanism as before.
const UNIT = 640;
const VIEW_HEIGHT = 1080;

export function OnboardingBackdrop({
  slideCount,
  screenWidth,
  translateX,
}: {
  slideCount: number;
  screenWidth: number;
  translateX: Animated.AnimatedInterpolation<number>;
}) {
  const totalUnits = UNIT * slideCount;
  const totalWidth = screenWidth * slideCount;

  return (
    <Animated.View
      style={[styles.container, { width: totalWidth, transform: [{ translateX }] }]}
      pointerEvents="none"
    >
      <Svg width={totalWidth} height="100%" viewBox={`0 0 ${totalUnits} ${VIEW_HEIGHT}`} preserveAspectRatio="none">
        {/* dripping canopy along the top edge */}
        <Path
          d="M 0,0 L 200,0 C 220,160 300,220 350,160 C 380,110 430,0 500,0 L 780,0 C 820,180 910,240 980,170 C 1030,120 1060,0 1180,0 L 1460,0 C 1510,170 1590,230 1670,170 C 1720,130 1760,0 1920,0 L 1920,240 C 1800,320 1660,280 1540,340 C 1400,420 1240,310 1100,380 C 920,460 740,310 570,360 C 380,420 200,290 0,350 Z"
          fill={colors.primaryContainer}
          opacity={0.22}
        />

        {/* two overlapping waves along the bottom edge */}
        <Path d="M 0,720 Q 320,810 640,700 T 1280,670 T 1920,740 L 1920,1080 L 0,1080 Z" fill={colors.onSurface} opacity={0.16} />
        <Path d="M 0,840 Q 320,750 640,820 T 1280,810 T 1920,790 L 1920,1080 L 0,1080 Z" fill={colors.primaryContainer} opacity={0.45} />

        {/* soft spotlight halo behind where each slide's illustration sits */}
        {Array.from({ length: slideCount }).map((_, i) => {
          const cx = 320 + i * UNIT;
          return (
            <G key={`spot-${i}`}>
              <Circle cx={cx} cy={460} r={190} fill={colors.surface} opacity={0.08} />
              <Circle cx={cx} cy={460} r={160} fill={colors.surface} opacity={0.06} />
            </G>
          );
        })}

        {/* one continuous dashed route threading through every slide */}
        <Path
          d="M 140,520 C 300,600 470,610 640,560 C 810,510 1020,650 1280,540 C 1450,470 1620,560 1780,480"
          stroke={colors.tertiaryContainer}
          strokeWidth={5}
          strokeDasharray="14 14"
          strokeLinecap="round"
          fill="none"
          opacity={0.85}
        />
        <Path
          d="M 100,430 C 320,320 460,400 640,380 C 840,360 1060,290 1280,370 C 1470,440 1670,330 1840,400"
          stroke={colors.surface}
          strokeWidth={3}
          strokeDasharray="10 10"
          strokeLinecap="round"
          fill="none"
          opacity={0.35}
        />

        {/* anchor rings marking where the route crosses between slides */}
        {Array.from({ length: slideCount - 1 }).map((_, i) => {
          const seamX = UNIT * (i + 1);
          return (
            <G key={`seam-${i}`}>
              <Circle cx={seamX} cy={280} r={36} stroke={colors.surface} strokeWidth={4} fill="none" opacity={0.4} />
              <Circle cx={seamX} cy={280} r={10} fill={colors.tertiaryContainer} />
              <Circle cx={seamX} cy={560} r={10} fill={colors.tertiaryContainer} stroke={colors.surface} strokeWidth={3} />
              <Circle cx={seamX} cy={820} r={44} stroke={colors.primaryContainer} strokeWidth={5} strokeDasharray="8 8" fill="none" opacity={0.55} />
            </G>
          );
        })}

        {SCREEN_ICONS.filter((ic) => ic.x < totalUnits + 80).map((ic, i) => (
          <ThemeIcon key={i} {...ic} />
        ))}
        {ACCENT_SPARKLES.filter((s) => s.x < totalUnits + 60).map((s, i) => (
          <Sparkle key={i} x={s.x} y={s.y} size={s.size} opacity={s.opacity} />
        ))}
        {ACCENT_PLUSES.filter((p) => p.x < totalUnits + 40).map((p, i) => (
          <Plus key={i} {...p} />
        ))}
        {ACCENT_RINGS.filter((r) => r.x < totalUnits + 60).map((r, i) => (
          <Circle key={i} cx={r.x} cy={r.y} r={r.r} stroke={colors.primaryContainer} strokeWidth={4} fill="none" opacity={0.4} />
        ))}
      </Svg>
    </Animated.View>
  );
}

type IconType = "bag" | "shirt" | "bottle" | "tag" | "basket";

// Same icons designed and PNG-checked earlier in this file's history —
// reused here rather than re-deriving new shapes from the reference's own
// (unvalidated) hand-drawn versions.
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

function Sparkle({ x, y, size, opacity }: { x: number; y: number; size: number; opacity: number }) {
  const half = size / 2;
  return (
    <Path
      d={`M${x} ${y - half} Q${x} ${y} ${x + half} ${y} Q${x} ${y} ${x} ${y + half} Q${x} ${y} ${x - half} ${y} Q${x} ${y} ${x} ${y - half} Z`}
      fill={colors.tertiaryContainer}
      opacity={opacity}
    />
  );
}

function Plus({ x, y, size, opacity }: { x: number; y: number; size: number; opacity: number }) {
  const thickness = size * 0.28;
  return (
    <G opacity={opacity}>
      <Rect x={x - size / 2} y={y - thickness / 2} width={size} height={thickness} rx={thickness / 2} fill={colors.surface} />
      <Rect x={x - thickness / 2} y={y - size / 2} width={thickness} height={size} rx={thickness / 2} fill={colors.surface} />
    </G>
  );
}

// Per-screen thematic clusters, positioned using the reference's own zone
// coordinates (same coordinate system) — screen 1 (toko): bag + basket,
// screen 2 (katalog): shirt + bottle, screen 3 (pengantaran): tag + a
// parcel-like bag standing in for the reference's ribboned box.
const SCREEN_ICONS: { type: IconType; x: number; y: number; size: number; opacity: number; rotation?: number }[] = [
  { type: "bag", x: 145, y: 290, size: 66, opacity: 0.5, rotation: -8 },
  { type: "basket", x: 222, y: 655, size: 52, opacity: 0.4 },
  { type: "shirt", x: 752, y: 272, size: 68, opacity: 0.5 },
  { type: "bottle", x: 1151, y: 258, size: 54, opacity: 0.42, rotation: 4 },
  { type: "tag", x: 1800, y: 258, size: 56, opacity: 0.5 },
  { type: "bag", x: 1428, y: 257, size: 58, opacity: 0.4, rotation: 6 },
];

const ACCENT_SPARKLES: { x: number; y: number; size: number; opacity: number }[] = [
  { x: 140, y: 200, size: 20, opacity: 0.55 },
  { x: 520, y: 680, size: 18, opacity: 0.45 },
  { x: 770, y: 210, size: 20, opacity: 0.5 },
  { x: 1150, y: 640, size: 18, opacity: 0.45 },
  { x: 1450, y: 210, size: 20, opacity: 0.5 },
  { x: 1800, y: 320, size: 16, opacity: 0.4 },
];

const ACCENT_PLUSES: { x: number; y: number; size: number; opacity: number }[] = [
  { x: 479, y: 332, size: 18, opacity: 0.55 },
  { x: 98, y: 552, size: 16, opacity: 0.45 },
  { x: 1189, y: 322, size: 18, opacity: 0.5 },
  { x: 758, y: 592, size: 16, opacity: 0.45 },
  { x: 1449, y: 602, size: 18, opacity: 0.5 },
  { x: 1798, y: 422, size: 16, opacity: 0.45 },
];

const ACCENT_RINGS: { x: number; y: number; r: number }[] = [
  { x: 170, y: 350, r: 22 },
  { x: 560, y: 490, r: 14 },
  { x: 800, y: 420, r: 26 },
  { x: 1190, y: 480, r: 16 },
  { x: 1390, y: 440, r: 20 },
  { x: 1820, y: 550, r: 30 },
];

const styles = StyleSheet.create({
  // Deliberately not StyleSheet.absoluteFill — that also pins `right: 0`,
  // which would fight the explicit (wider-than-screen) width set inline.
  container: { position: "absolute", top: 0, left: 0, bottom: 0 },
});
