import { NavigationContainer } from "@react-navigation/native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeScreen } from "../screens/HomeScreen";
import { CatalogScreen } from "../screens/CatalogScreen";
import { SearchScreen } from "../screens/SearchScreen";
import { PromoScreen } from "../screens/PromoScreen";
import { ProductDetailScreen } from "../screens/ProductDetailScreen";
import { CartScreen } from "../screens/CartScreen";
import { CheckoutScreen } from "../screens/CheckoutScreen";
import { MapPickerScreen } from "../screens/MapPickerScreen";
import { AccountScreen } from "../screens/AccountScreen";
import { CompleteProfileScreen } from "../screens/CompleteProfileScreen";
import { MemberBarcodeScreen } from "../screens/MemberBarcodeScreen";
import { EditProfileScreen } from "../screens/EditProfileScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { OrdersScreen } from "../screens/OrdersScreen";
import { OrderDetailScreen } from "../screens/OrderDetailScreen";
import { FloatingTabBar } from "./FloatingTabBar";
import { useAuth } from "../state/AuthContext";
import type {
  RootTabParamList,
  RootStackParamList,
  HomeStackParamList,
  CatalogStackParamList,
  SearchStackParamList,
  PromoStackParamList,
} from "./types";

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createMaterialTopTabNavigator<RootTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const CatalogStack = createNativeStackNavigator<CatalogStackParamList>();
const SearchStack = createNativeStackNavigator<SearchStackParamList>();
const PromoStack = createNativeStackNavigator<PromoStackParamList>();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="ProductDetail" component={ProductDetailScreen} />
    </HomeStack.Navigator>
  );
}

function CatalogStackNavigator() {
  return (
    <CatalogStack.Navigator screenOptions={{ headerShown: false }}>
      <CatalogStack.Screen name="Catalog" component={CatalogScreen} />
      <CatalogStack.Screen name="ProductDetail" component={ProductDetailScreen} />
    </CatalogStack.Navigator>
  );
}

function SearchStackNavigator() {
  return (
    <SearchStack.Navigator screenOptions={{ headerShown: false }}>
      <SearchStack.Screen name="Search" component={SearchScreen} />
      <SearchStack.Screen name="ProductDetail" component={ProductDetailScreen} />
    </SearchStack.Navigator>
  );
}

function PromoStackNavigator() {
  return (
    <PromoStack.Navigator screenOptions={{ headerShown: false }}>
      <PromoStack.Screen name="Promo" component={PromoScreen} />
      <PromoStack.Screen name="ProductDetail" component={ProductDetailScreen} />
    </PromoStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      tabBarPosition="bottom"
      tabBar={(props) => <FloatingTabBar {...props} />}
      // Whole-screen swipe-to-change-tab conflicted with horizontal content
      // inside a tab (the promo banner carousel especially) — a swipe meant
      // to scroll the banner kept getting captured as a tab switch instead,
      // landing on Akun since Promo sits right before it. Kept swipe-to-
      // switch enabled (still handy for the rest of the screen) — the
      // banner carousels themselves toggle this off for the duration of a
      // touch on them (see HomeScreen/PromoScreen) so they win that gesture.
      screenOptions={{ swipeEnabled: true, animationEnabled: true }}
    >
      <Tab.Screen name="HomeTab" component={HomeStackNavigator} options={{ title: "Beranda" }} />
      <Tab.Screen name="CatalogTab" component={CatalogStackNavigator} options={{ title: "Katalog" }} />
      <Tab.Screen name="SearchTab" component={SearchStackNavigator} options={{ title: "Cari" }} />
      <Tab.Screen name="PromoTab" component={PromoStackNavigator} options={{ title: "Promo" }} />
      <Tab.Screen name="AccountTab" component={AccountScreen} options={{ title: "Akun" }} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { needsProfileCompletion } = useAuth();

  // A fresh Google sign-up only has an email + display name in ERPNext —
  // block the whole app on the completion form before anything (browsing is
  // fine to skip since checkout needs it anyway) so the customer record is
  // usable the moment they're done.
  if (needsProfileCompletion) return <CompleteProfileScreen />;

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="MainTabs" component={MainTabs} />
        <RootStack.Screen
          name="Cart"
          component={CartScreen}
          options={{ presentation: "modal", animation: "slide_from_right" }}
        />
        <RootStack.Screen
          name="Checkout"
          component={CheckoutScreen}
          options={{ animation: "slide_from_right" }}
        />
        <RootStack.Screen
          name="MapPicker"
          component={MapPickerScreen}
          options={{ presentation: "modal" }}
        />
        <RootStack.Screen
          name="MemberBarcode"
          component={MemberBarcodeScreen}
          options={{ presentation: "modal" }}
        />
        <RootStack.Screen
          name="EditProfile"
          component={EditProfileScreen}
          options={{ presentation: "modal", animation: "slide_from_right" }}
        />
        <RootStack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ animation: "slide_from_right" }}
        />
        <RootStack.Screen
          name="Orders"
          component={OrdersScreen}
          options={{ animation: "slide_from_right" }}
        />
        <RootStack.Screen
          name="OrderDetail"
          component={OrderDetailScreen}
          options={{ animation: "slide_from_right" }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
