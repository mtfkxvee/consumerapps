import { Text as RNText, type TextProps } from "react-native";
import { fonts } from "../theme/colors";

// Drop-in replacement for RN's <Text> that defaults to the body typeface
// (matching the web app's `font-body` base) instead of the OS default —
// RN's Text has no defaultProps mechanism of its own (it's a function
// component under React 19, not a class), so screens that render plain
// text with no explicit fontFamily would otherwise silently fall back to
// San Francisco/Roboto.
export function Text({ style, ...rest }: TextProps) {
  return <RNText style={[{ fontFamily: fonts.body.regular }, style]} {...rest} />;
}
