import { Animated, StyleSheet } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";
import { colors } from "../../theme/colors";

// One wide virtual canvas (400 units per slide) rather than one backdrop per
// slide — a single dashed "journey" line winds continuously through all 3
// panels, and the top drip shapes tile continuously across the whole
// width. Panned by `translateX` (driven by real swipe position, see
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

  const dripXs: number[] = [];
  for (let x = 20; x < totalUnits; x += 64) dripXs.push(x);

  const sparkleXs = [70, 250, 340, 520, 610, 780, 900, 1050];

  return (
    <Animated.View
      style={[styles.container, { width: totalWidth, transform: [{ translateX }] }]}
      pointerEvents="none"
    >
      <Svg width={totalWidth} height="100%" viewBox={`0 0 ${totalUnits} 800`} preserveAspectRatio="none">
        {dripXs.map((x, i) => (
          <Rect key={i} x={x} y={0} width={26} height={i % 2 === 0 ? 78 : 56} rx={13} fill={colors.surface} opacity={0.08} />
        ))}

        <Path
          d={buildJourneyPath(totalUnits)}
          stroke={colors.tertiaryContainer}
          strokeWidth={3}
          strokeDasharray="9 7"
          strokeLinecap="round"
          opacity={0.5}
          fill="none"
        />

        {sparkleXs.map((x, i) => (
          <Sparkle key={i} x={x} y={140 + ((i * 97) % 480)} size={12 + (i % 3) * 4} opacity={0.18 + (i % 2) * 0.06} />
        ))}
      </Svg>
    </Animated.View>
  );
}

// A single winding dashed line covering the whole canvas — reads as one
// continuous route rather than 3 separate decorations.
function buildJourneyPath(totalUnits: number): string {
  const points: [number, number][] = [];
  const step = 200;
  let y = 260;
  for (let x = 0; x <= totalUnits; x += step) {
    points.push([x, y]);
    y = y === 260 ? 420 : 260;
  }
  return points.reduce((d, [x, y], i) => {
    if (i === 0) return `M${x} ${y}`;
    const [px, py] = points[i - 1];
    const midX = (px + x) / 2;
    return `${d} C${midX} ${py}, ${midX} ${y}, ${x} ${y}`;
  }, "");
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

const styles = StyleSheet.create({
  // Deliberately not StyleSheet.absoluteFill — that also pins `right: 0`,
  // which would fight the explicit (wider-than-screen) width set inline.
  container: { position: "absolute", top: 0, left: 0, bottom: 0 },
});
