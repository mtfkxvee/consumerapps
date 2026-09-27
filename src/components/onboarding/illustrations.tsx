import Svg, { Circle, Ellipse, Path, Rect } from "react-native-svg";
import { colors } from "../../theme/colors";

type Props = { size?: number };

// All three sit inside the same light disc (see OnboardingScreen's
// illustrationDisc) — colors here are chosen to read clearly against that
// light background, not the violet page background behind it.

// Storefront with a location pin above it — "find the nearest store".
export function NearestStoreIllustration({ size = 120 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <Ellipse cx="60" cy="104" rx="34" ry="6" fill={colors.primary} opacity={0.12} />
      {/* store body */}
      <Rect x="26" y="52" width="68" height="42" rx="4" fill={colors.surface} />
      <Path d="M22 52 L60 30 L98 52 Z" fill={colors.primary} />
      <Rect x="26" y="52" width="68" height="8" fill={colors.tertiaryContainer} />
      {/* door */}
      <Rect x="52" y="70" width="16" height="24" rx="2" fill={colors.primaryContainer} />
      {/* windows */}
      <Rect x="32" y="66" width="14" height="14" rx="2" fill={colors.primaryFixed} />
      <Rect x="74" y="66" width="14" height="14" rx="2" fill={colors.primaryFixed} />
      {/* awning stripes */}
      <Path d="M26 60 L94 60 L90 66 L30 66 Z" fill={colors.secondary} opacity={0.85} />
      {/* pin */}
      <Path
        d="M60 6C48.9543 6 40 14.9543 40 26C40 40 60 58 60 58C60 58 80 40 80 26C80 14.9543 71.0457 6 60 6Z"
        fill={colors.secondary}
      />
      <Circle cx="60" cy="25" r="9" fill={colors.surface} />
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

      {/* orbiting bubbles */}
      <Circle cx="20" cy="34" r="14" fill={colors.tertiaryContainer} opacity={0.9} />
      <Path d="M14 32h12l-1.5 8h-9L14 32Z" fill={colors.surface} />
      <Rect x="16.5" y="27" width="7" height="5" rx="2.5" stroke={colors.surface} strokeWidth={1.6} fill="none" />

      <Circle cx="98" cy="30" r="13" fill={colors.secondaryContainer} opacity={0.85} />
      <Path d="M92 27h12v10a6 6 0 0 1-12 0v-10Z" fill={colors.surface} />

      <Circle cx="16" cy="80" r="12" fill={colors.primaryFixed} />
      <Path d="M10 79l4 5 8-9" stroke={colors.primary} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" fill="none" />

      <Circle cx="100" cy="78" r="14" fill={colors.tertiaryContainer} opacity={0.9} />
      <Rect x="93" y="72" width="14" height="12" rx="2" fill={colors.surface} />
      <Path d="M96 72v-2a4 4 0 0 1 8 0v2" stroke={colors.surface} strokeWidth={1.6} fill="none" />
    </Svg>
  );
}

// A delivery scooter with a stacked parcel box — "fast delivery to your door".
export function FastDeliveryIllustration({ size = 120 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <Ellipse cx="60" cy="100" rx="38" ry="6" fill={colors.primary} opacity={0.12} />
      {/* wheels */}
      <Circle cx="34" cy="88" r="11" fill={colors.onSurface} />
      <Circle cx="34" cy="88" r="4.5" fill={colors.surface} />
      <Circle cx="90" cy="88" r="11" fill={colors.onSurface} />
      <Circle cx="90" cy="88" r="4.5" fill={colors.surface} />
      {/* body */}
      <Path
        d="M28 88c0-10 8-14 16-14h10l6-16h14"
        stroke={colors.primary}
        strokeWidth={6}
        strokeLinecap="round"
        fill="none"
      />
      <Path d="M78 88H60l6-14h10Z" fill={colors.secondary} />
      <Rect x="20" y="82" width="16" height="8" rx="4" fill={colors.primary} />
      {/* seat + parcel */}
      <Rect x="62" y="46" width="24" height="20" rx="3" fill={colors.tertiaryContainer} />
      <Rect x="66" y="50" width="16" height="4" rx="2" fill={colors.surface} opacity={0.7} />
      <Rect x="66" y="57" width="16" height="4" rx="2" fill={colors.surface} opacity={0.7} />
      {/* handlebar */}
      <Path d="M92 58v-8h8" stroke={colors.onSurface} strokeWidth={4} strokeLinecap="round" fill="none" />
    </Svg>
  );
}
