import { Animated, StyleSheet } from "react-native";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import { colors } from "../../theme/colors";

// One wide virtual canvas (400 units per slide) rather than one backdrop per
// slide — a single dashed "journey" line winds continuously through all 3
// panels, layered glow orbs and drips give it real depth, and it's all
// panned by `translateX` (driven by real swipe position, see
// OnboardingScreen) so the background visibly slides as you move between
// slides, while the page's own solid color stays constant.
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

  const journeyPoints = buildJourneyPoints(totalUnits);
  const journeyPath = pointsToPath(journeyPoints);

  return (
    <Animated.View
      style={[styles.container, { width: totalWidth, transform: [{ translateX }] }]}
      pointerEvents="none"
    >
      <Svg width={totalWidth} height="100%" viewBox={`0 0 ${totalUnits} 800`} preserveAspectRatio="none">
        {/* soft layered glow orbs — depth, not just flat decoration */}
        {GLOW_ORBS.filter((o) => o.x < totalUnits + 100).map((o, i) => (
          <Glow key={i} x={o.x} y={o.y} r={o.r} color={o.color} />
        ))}

        {/* top drip shapes — varied width/height instead of one uniform tile */}
        {buildDrips(totalUnits).map((d, i) => (
          <Rect key={i} x={d.x} y={0} width={d.w} height={d.h} rx={d.w / 2} fill={colors.surface} opacity={d.opacity} />
        ))}

        {/* the winding journey line + a waypoint marker at each turn */}
        <Path d={journeyPath} stroke={colors.tertiaryContainer} strokeWidth={3} strokeDasharray="9 7" strokeLinecap="round" opacity={0.55} fill="none" />
        {journeyPoints.map(([x, y], i) => (
          <Circle key={i} cx={x} cy={y} r={i === 0 || i === journeyPoints.length - 1 ? 0 : 5} fill={colors.tertiaryContainer} opacity={0.8} />
        ))}

        {SPARKLES.filter((s) => s.x < totalUnits + 60).map((s, i) => (
          <Sparkle key={i} x={s.x} y={s.y} size={s.size} opacity={s.opacity} />
        ))}
      </Svg>
    </Animated.View>
  );
}

// Three concentric circles fading outward — the closest RN/SVG gets to a
// soft radial-gradient glow without an actual gradient def.
function Glow({ x, y, r, color }: { x: number; y: number; r: number; color: string }) {
  return (
    <>
      <Circle cx={x} cy={y} r={r} fill={color} opacity={0.06} />
      <Circle cx={x} cy={y} r={r * 0.66} fill={color} opacity={0.09} />
      <Circle cx={x} cy={y} r={r * 0.36} fill={color} opacity={0.14} />
    </>
  );
}

function Sparkle({ x, y, size, opacity }: { x: number; y: number; size: number; opacity: number }) {
  const half = size / 2;
  return (
    <Path
      d={`M${x} ${y - half} Q${x} ${y} ${x + half} ${y} Q${x} ${y} ${x} ${y + half} Q${x} ${y} ${x - half} ${y} Q${x} ${y} ${x} ${y - half} Z`}
      fill={colors.surface}
      opacity={opacity}
    />
  );
}

// One glow per virtual 400-unit panel, alternating tints from the existing
// palette so each slide's "third" of the canvas has its own accent without
// introducing new colors.
const GLOW_ORBS = [
  { x: 90, y: 180, r: 130, color: colors.secondary },
  { x: 340, y: 560, r: 100, color: colors.tertiaryContainer },
  { x: 460, y: 620, r: 150, color: colors.primaryContainer },
  { x: 700, y: 140, r: 110, color: colors.tertiaryContainer },
  { x: 860, y: 540, r: 140, color: colors.secondary },
  { x: 1080, y: 200, r: 120, color: colors.primaryContainer },
];

const SPARKLES = [
  { x: 60, y: 260, size: 14, opacity: 0.28 },
  { x: 150, y: 420, size: 10, opacity: 0.22 },
  { x: 300, y: 130, size: 16, opacity: 0.24 },
  { x: 380, y: 340, size: 11, opacity: 0.2 },
  { x: 470, y: 470, size: 14, opacity: 0.26 },
  { x: 560, y: 150, size: 10, opacity: 0.2 },
  { x: 680, y: 360, size: 15, opacity: 0.25 },
  { x: 780, y: 540, size: 11, opacity: 0.22 },
  { x: 900, y: 120, size: 13, opacity: 0.24 },
  { x: 990, y: 400, size: 10, opacity: 0.2 },
  { x: 1100, y: 300, size: 16, opacity: 0.26 },
  { x: 1180, y: 500, size: 12, opacity: 0.22 },
];

// Irregular widths/heights/gaps instead of one tile repeated — reads as a
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
    drips.push({ x, w: p.w, h: p.h, opacity: i % 2 === 0 ? 0.16 : 0.1 });
    x += p.w + 26;
    i++;
  }
  return drips;
}

// A gentle sine-like wave through the whole canvas — smooth C-curves
// between alternating high/low points rather than one repeated hump.
function buildJourneyPoints(totalUnits: number): [number, number][] {
  const points: [number, number][] = [];
  const step = 220;
  let y = 260;
  for (let x = 0; x <= totalUnits; x += step) {
    points.push([x, y]);
    y = y === 260 ? 440 : 260;
  }
  return points;
}

function pointsToPath(points: [number, number][]): string {
  return points.reduce((d, [x, y], i) => {
    if (i === 0) return `M${x} ${y}`;
    const [px, py] = points[i - 1];
    const midX = (px + x) / 2;
    return `${d} C${midX} ${py}, ${midX} ${y}, ${x} ${y}`;
  }, "");
}

const styles = StyleSheet.create({
  // Deliberately not StyleSheet.absoluteFill — that also pins `right: 0`,
  // which would fight the explicit (wider-than-screen) width set inline.
  container: { position: "absolute", top: 0, left: 0, bottom: 0 },
});
