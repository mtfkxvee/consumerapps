import { StyleSheet, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { colors } from "../../theme/colors";

// Decorative full-bleed backdrop for the onboarding violet background —
// rounded "drip" bars hanging from the top edge, a dashed way-finding path
// with a location pin, and a scatter of small sparkles/dots. One consistent
// design reused across all 3 slides (not a unique one per screen) so the
// palette and motif stay coherent end to end.
export function OnboardingBackdrop() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={styles.dripRow}>
        {DRIP_HEIGHTS.map((h, i) => (
          <View key={i} style={[styles.drip, { height: h }]} />
        ))}
      </View>

      <Svg style={StyleSheet.absoluteFill} viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice">
        <Path
          d="M20 260 C 110 285, 200 310, 260 285 C 300 268, 330 255, 360 250"
          stroke={colors.tertiaryContainer}
          strokeWidth={3}
          strokeDasharray="9 7"
          strokeLinecap="round"
          opacity={0.55}
          fill="none"
        />
        <Circle cx="360" cy="250" r="5" fill={colors.tertiaryContainer} opacity={0.85} />

        <Sparkle x={44} y={150} size={14} opacity={0.22} />
        <Sparkle x={340} y={130} size={18} opacity={0.2} />
        <Sparkle x={70} y={600} size={16} opacity={0.2} />
        <Sparkle x={330} y={560} size={12} opacity={0.22} />

        <Circle cx="56" cy="320" r="4" fill={colors.surface} opacity={0.18} />
        <Circle cx="350" cy="420" r="5" fill={colors.tertiaryContainer} opacity={0.25} />
        <Circle cx="90" cy="480" r="3.5" fill={colors.surface} opacity={0.2} />
      </Svg>
    </View>
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

const DRIP_HEIGHTS = [70, 110, 84, 96, 64];

const styles = StyleSheet.create({
  dripRow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 22,
  },
  drip: {
    width: 34,
    backgroundColor: colors.surface,
    opacity: 0.08,
    borderBottomLeftRadius: 999,
    borderBottomRightRadius: 999,
  },
});
