import { Pressable as RNPressable, type PressableProps } from "react-native";

// Drop-in replacement for RN's <Pressable> that dims and slightly shrinks on
// press by default — RN's own Pressable gives zero visual feedback unless
// every call site remembers to handle the `pressed` state itself, which
// nothing in this app did.
export function Pressable({ style, ...rest }: PressableProps) {
  return (
    <RNPressable
      style={(state) => [
        typeof style === "function" ? style(state) : style,
        state.pressed && { opacity: 0.7, transform: [{ scale: 0.97 }] },
      ]}
      {...rest}
    />
  );
}
