import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { MaterialTopTabBarProps } from "@react-navigation/material-top-tabs";
import { Text } from "../components/Text";
import { Pressable } from "../components/Pressable";
import { colors, fonts, radius, spacing } from "../theme/colors";

const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  HomeTab: "home",
  CatalogTab: "grid",
  SearchTab: "search",
  PromoTab: "pricetag",
  AccountTab: "person",
};

const LABELS: Record<string, string> = {
  HomeTab: "Beranda",
  CatalogTab: "Katalog",
  SearchTab: "Cari",
  PromoTab: "Promo",
  AccountTab: "Akun",
};

const DOT_SIZE = 6;

export function FloatingTabBar({ state, navigation }: MaterialTopTabBarProps) {
  const insets = useSafeAreaInsets();
  const [rowWidth, setRowWidth] = useState(0);
  const slide = useRef(new Animated.Value(state.index)).current;

  const tabWidth = state.routes.length > 0 ? rowWidth / state.routes.length : 0;

  useEffect(() => {
    Animated.spring(slide, {
      toValue: state.index,
      useNativeDriver: true,
      speed: 16,
      bounciness: 6,
    }).start();
  }, [state.index]);

  return (
    <View style={[styles.wrap, { bottom: Math.max(insets.bottom, spacing.sm) + spacing.xs }]}>
      <View style={styles.bar}>
        <View style={styles.row} onLayout={(e) => setRowWidth(e.nativeEvent.layout.width)}>
          {tabWidth > 0 && (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.dot,
                {
                  transform: [
                    {
                      translateX: slide.interpolate({
                        inputRange: state.routes.map((_, i) => i),
                        outputRange: state.routes.map(
                          (_, i) => i * tabWidth + tabWidth / 2 - DOT_SIZE / 2,
                        ),
                      }),
                    },
                  ],
                },
              ]}
            />
          )}

          {state.routes.map((route, index) => {
            const focused = state.index === index;
            const iconName = ICONS[route.name] ?? "ellipse";
            const tint = focused ? colors.secondary : colors.onSurfaceVariant;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
            };

            return (
              <Pressable key={route.key} style={styles.tab} onPress={onPress}>
                <Ionicons
                  name={focused ? iconName : (`${iconName}-outline` as keyof typeof Ionicons.glyphMap)}
                  size={20}
                  color={tint}
                />
                <Text style={[styles.label, { color: tint }]} numberOfLines={1}>
                  {LABELS[route.name] ?? route.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    alignItems: "center",
  },
  bar: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    paddingTop: 14,
    paddingBottom: 8,
    paddingHorizontal: spacing.xs,
    width: "100%",
    shadowColor: colors.black,
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  row: { flexDirection: "row", width: "100%" },
  dot: {
    position: "absolute",
    top: -9,
    left: 0,
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: radius.full,
    backgroundColor: colors.secondary,
  },
  tab: { flex: 1, alignItems: "center", justifyContent: "center", gap: 4 },
  label: { fontSize: 9.5, fontFamily: fonts.body.semiBold },
});
