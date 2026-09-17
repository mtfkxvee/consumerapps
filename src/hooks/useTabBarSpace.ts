import { useSafeAreaInsets } from "react-native-safe-area-context";
import { spacing } from "../theme/colors";

// The floating tab bar's own visual height, independent of the device's
// bottom safe-area inset — paddingTop(14) + paddingBottom(8) + icon(20) +
// gap(4) + label line(~12) from FloatingTabBar's styles, plus a little
// breathing room above the bar so content isn't flush against it.
const BAR_VISUAL_HEIGHT = 58;
const BREATHING_ROOM = spacing.sm;

// TAB_BAR_SPACE (theme/colors.ts) is a fixed guess that undershoots on
// devices with a tall bottom inset (three-button nav on many Android
// phones can be 40-50dp, well past the ~95 the constant assumed) — the
// last bit of scrollable content ends up hidden behind the floating bar.
// This mirrors FloatingTabBar's own `bottom` offset calculation
// (Math.max(insets.bottom, spacing.sm) + spacing.xs) so the reserved space
// always matches where the bar actually sits on *this* device.
export function useTabBarSpace(): number {
  const insets = useSafeAreaInsets();
  return Math.max(insets.bottom, spacing.sm) + spacing.xs + BAR_VISUAL_HEIGHT + BREATHING_ROOM;
}
