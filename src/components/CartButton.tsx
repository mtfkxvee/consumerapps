import { StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "./Text";
import { Pressable } from "./Pressable";
import { colors, fonts, radius } from "../theme/colors";
import { useCart } from "../state/CartContext";

type Props = { tone?: "light" | "dark" };

// Cart is reached from this icon (top-right of the main screens) rather than
// a bottom tab — tapping it pushes the full-screen Cart route registered on
// the root stack (see navigation/RootNavigator.tsx), covering the tab bar.
export function CartButton({ tone = "dark" }: Props) {
  const navigation = useNavigation();
  const { count } = useCart();
  const isLight = tone === "light";

  return (
    <Pressable
      style={[styles.button, isLight && styles.buttonLight]}
      onPress={() => navigation.navigate("Cart" as never)}
    >
      <Ionicons name="cart-outline" size={18} color={isLight ? colors.onPrimary : colors.onSurface} />
      {count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count > 9 ? "9+" : count}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceContainerLow,
  },
  buttonLight: { backgroundColor: "rgba(255,255,255,0.15)" },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: radius.full,
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: { color: colors.white, fontSize: 9, fontFamily: fonts.body.extraBold },
});
