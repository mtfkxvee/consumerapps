import Svg, { Circle, Ellipse, Path, Rect } from "react-native-svg";
import { colors } from "../../theme/colors";

type Props = { size?: number };

// All three sit inside the same light disc (see OnboardingScreen's
// illustrationDisc) — colors here are chosen to read clearly against that
// light background, not the violet page background behind it.
//
// Rendered to PNG and visually checked (react-native-svg mirrors plain SVG
// closely enough that a plain-web render is a faithful proxy) before being
// wired in here — the first pass looked rough close up (the pin swallowed
// the roof, the store windows had no contrast, the scooter's body/box/
// windshield didn't visually connect into one silhouette).

// Storefront with a location pin above it — "find the nearest store".
export function NearestStoreIllustration({ size = 120 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <Ellipse cx="60" cy="104" rx="34" ry="6" fill={colors.primary} opacity={0.12} />
      {/* roof */}
      <Path d="M16 56 L60 26 L104 56 Z" fill={colors.primary} />
      {/* body */}
      <Rect x="24" y="56" width="72" height="38" rx="4" fill={colors.surface} />
      {/* awning / sign stripe */}
      <Rect x="24" y="56" width="72" height="11" fill={colors.tertiaryContainer} />
      {/* windows */}
      <Rect x="32" y="70" width="15" height="15" rx="2" fill={colors.surfaceContainer} stroke={colors.primaryContainer} strokeWidth={2} />
      <Rect x="73" y="70" width="15" height="15" rx="2" fill={colors.surfaceContainer} stroke={colors.primaryContainer} strokeWidth={2} />
      {/* door */}
      <Rect x="52" y="74" width="16" height="20" rx="2" fill={colors.primaryContainer} />
      <Circle cx="64" cy="84" r="1.6" fill={colors.primaryFixed} />
      {/* pin, floating just above the roof apex */}
      <Path
        d="M60 4C51.163 4 44 11.163 44 20C44 31.5 60 46 60 46C60 46 76 31.5 76 20C76 11.163 68.837 4 60 4Z"
        fill={colors.secondary}
      />
      <Circle cx="60" cy="19" r="7" fill={colors.surface} />
    </Svg>
  );
}

// A phone with shopping bubbles orbiting it — "pick your daily needs".
export function ShopNeedsIllustration({ size = 120 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      {/* phone */}
      <Rect x="42" y="24" width="36" height="72" rx="10" fill={colors.primary} />
      <Rect x="47" y="32" width="26" height="48" rx="3" fill={colors.surface} />
      <Rect x="52" y="38" width="16" height="6" rx="3" fill={colors.primaryFixed} />
      <Rect x="52" y="48" width="16" height="4" rx="2" fill={colors.outlineVariant} />
      <Rect x="52" y="56" width="10" height="4" rx="2" fill={colors.outlineVariant} />
      <Circle cx="60" cy="88" r="3" fill={colors.primaryFixed} />

      {/* shopping bag bubble */}
      <Circle cx="20" cy="34" r="14" fill={colors.tertiaryContainer} />
      <Path d="M17 30 Q17 23 20 23 Q23 23 23 30" stroke={colors.surface} strokeWidth={2} fill="none" />
      <Path d="M12 30 L28 30 L26 44 L14 44 Z" fill={colors.surface} />

      {/* percent/discount bubble */}
      <Circle cx="98" cy="30" r="13" fill={colors.secondaryContainer} opacity={0.9} />
      <Path d="M92 34 L104 22" stroke={colors.surface} strokeWidth={2.2} strokeLinecap="round" />
      <Circle cx="92.5" cy="25.5" r="2.4" fill={colors.surface} />
      <Circle cx="103.5" cy="30.5" r="2.4" fill={colors.surface} />

      {/* checkmark bubble */}
      <Circle cx="16" cy="80" r="12" fill={colors.primaryFixed} />
      <Path d="M10 79l4 5 8-9" stroke={colors.primary} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" fill="none" />

      {/* cart bubble */}
      <Circle cx="100" cy="78" r="14" fill={colors.tertiaryContainer} opacity={0.9} />
      <Path
        d="M92 70 L96 70 L99 82 L109 82 L112 73 L97 73"
        stroke={colors.surface}
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="100" cy="87" r="2" fill={colors.surface} />
      <Circle cx="107" cy="87" r="2" fill={colors.surface} />
    </Svg>
  );
}

// A delivery scooter with a parcel box on the back — "fast delivery".
// Built from a few overlapping rounded shapes sharing one fill (a low
// chassis pill + a tall front blob merge into one silhouette) rather than
// one hand-drawn body path — far more forgiving than a custom path, and it
// reads immediately as a friendly, rounded scooter instead of the sharp,
// disconnected shapes the first two attempts produced.
export function FastDeliveryIllustration({ size = 120 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <Ellipse cx="58" cy="98" rx="42" ry="5" fill={colors.primary} opacity={0.12} />
      {/* wheels */}
      <Circle cx="34" cy="88" r="11" fill={colors.onSurface} />
      <Circle cx="34" cy="88" r="4.5" fill={colors.surface} />
      <Circle cx="88" cy="88" r="11" fill={colors.onSurface} />
      <Circle cx="88" cy="88" r="4.5" fill={colors.surface} />
      {/* chassis + front blob (same fill, merge into one silhouette) */}
      <Rect x="24" y="70" width="72" height="18" rx="9" fill={colors.primary} />
      <Rect x="74" y="46" width="26" height="34" rx="13" fill={colors.primary} />
      {/* seat */}
      <Rect x="52" y="63" width="18" height="9" rx="4.5" fill={colors.onSurface} opacity={0.55} />
      {/* visor stripe */}
      <Rect x="79" y="53" width="16" height="5" rx="2.5" fill={colors.primaryFixed} opacity={0.9} />
      {/* handlebar */}
      <Rect x="93" y="40" width="4" height="12" rx="2" fill={colors.onSurface} />
      <Rect x="88" y="37" width="14" height="4.5" rx="2.25" fill={colors.onSurface} />
      {/* delivery box */}
      <Rect x="13" y="43" width="31" height="31" rx="6" fill={colors.tertiaryContainer} />
      <Rect x="19" y="51" width="19" height="4" rx="2" fill={colors.surface} opacity={0.75} />
      <Rect x="19" y="60" width="19" height="4" rx="2" fill={colors.surface} opacity={0.75} />
    </Svg>
  );
}
