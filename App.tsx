import { useCallback, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { CartProvider } from "./src/state/CartContext";
import { AuthProvider } from "./src/state/AuthContext";
import { OutletProvider } from "./src/state/OutletContext";
import { fonts } from "./src/theme/colors";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

export default function App() {
  // Importing single weight files directly (instead of destructuring from
  // each package's barrel index) keeps Metro from bundling every weight and
  // italic in the family — the index re-exports all ~30 font files, and
  // static analysis can't tree-shake require() calls inside it.
  const [fontsLoaded, fontError] = useFonts({
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    [fonts.body.regular]: require("@expo-google-fonts/plus-jakarta-sans/400Regular/PlusJakartaSans_400Regular.ttf"),
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    [fonts.body.medium]: require("@expo-google-fonts/plus-jakarta-sans/500Medium/PlusJakartaSans_500Medium.ttf"),
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    [fonts.body.semiBold]: require("@expo-google-fonts/plus-jakarta-sans/600SemiBold/PlusJakartaSans_600SemiBold.ttf"),
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    [fonts.body.bold]: require("@expo-google-fonts/plus-jakarta-sans/700Bold/PlusJakartaSans_700Bold.ttf"),
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    [fonts.body.extraBold]: require("@expo-google-fonts/plus-jakarta-sans/800ExtraBold/PlusJakartaSans_800ExtraBold.ttf"),
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    [fonts.display.semiBold]: require("@expo-google-fonts/bricolage-grotesque/600SemiBold/BricolageGrotesque_600SemiBold.ttf"),
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    [fonts.display.bold]: require("@expo-google-fonts/bricolage-grotesque/700Bold/BricolageGrotesque_700Bold.ttf"),
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    [fonts.display.extraBold]: require("@expo-google-fonts/bricolage-grotesque/800ExtraBold/BricolageGrotesque_800ExtraBold.ttf"),
  });

  const onLayout = useCallback(async () => {
    if (fontsLoaded || fontError) await SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    onLayout();
  }, [onLayout]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <OutletProvider>
            <CartProvider>
              <RootNavigator />
              <StatusBar style="dark" />
            </CartProvider>
          </OutletProvider>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
