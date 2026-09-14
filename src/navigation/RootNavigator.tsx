import { NavigationContainer } from "@react-navigation/native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeScreen } from "../screens/HomeScreen";
import { CatalogScreen } from "../screens/CatalogScreen";
import { SearchScreen } from "../screens/SearchScreen";
import { PromoScreen } from "../screens/PromoScreen";
import { ProductDetailScreen } from "../screens/ProductDetailScreen";
import { CartScreen } from "../screens/CartScreen";
import { AccountScreen } from "../screens/AccountScreen";
import { FloatingTabBar } from "./FloatingTabBar";
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
  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="MainTabs" component={MainTabs} />
        <RootStack.Screen
          name="Cart"
          component={CartScreen}
          options={{ presentation: "modal", animation: "slide_from_right" }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
