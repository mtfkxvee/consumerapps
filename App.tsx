import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import Constants from "expo-constants";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { AppSplash } from "./src/components/AppSplash";
import { CartProvider } from "./src/state/CartContext";
import { AuthProvider } from "./src/state/AuthContext";
import { OutletProvider } from "./src/state/OutletContext";
import { fonts } from "./src/theme/colors";
import { installGlobalErrorHandlers } from "./src/lib/crashlytics";
import { CACHE_MAX_AGE_MS, queryPersister, shouldPersistQuery } from "./src/lib/queryPersist";

SplashScreen.preventAutoHideAsync();
installGlobalErrorHandlers();

// gcTime must be >= the persister's maxAge, or restored entries are
// garbage-collected the moment they're loaded back from disk.
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000, gcTime: CACHE_MAX_AGE_MS } },
});

// A new app version drops the saved cache, so a changed data shape can never
// be read back by code that expects the old one.
const CACHE_BUSTER = Constants.expoConfig?.version ?? "0";

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

  // Android 12+ only lets the native splash (app.json/expo-splash-screen)
  // show a small centered icon, never a full-bleed photo — so it's hidden
  // as soon as this component mounts, immediately handing off to
  // AppSplash below, which renders the same photo full-screen in JS
  // instead, for as long as fonts are still loading.
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  if (!fontsLoaded && !fontError) return <AppSplash />;

  return (
    <SafeAreaProvider>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister: queryPersister,
          maxAge: CACHE_MAX_AGE_MS,
          buster: CACHE_BUSTER,
          dehydrateOptions: { shouldDehydrateQuery: shouldPersistQuery },
        }}
      >
        <AuthProvider>
          <OutletProvider>
            <CartProvider>
              <RootNavigator />
              <StatusBar style="dark" />
            </CartProvider>
          </OutletProvider>
        </AuthProvider>
      </PersistQueryClientProvider>
    </SafeAreaProvider>
  );
}
