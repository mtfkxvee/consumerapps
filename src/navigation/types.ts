import type { NavigatorScreenParams } from "@react-navigation/native";

export type HomeStackParamList = {
  Home: undefined;
  ProductDetail: { id: string };
  PromoDetail: undefined;
};

export type CatalogStackParamList = {
  Catalog: { q?: string } | undefined;
  ProductDetail: { id: string };
};

export type SearchStackParamList = {
  Search: { q?: string } | undefined;
  ProductDetail: { id: string };
};

export type PromoStackParamList = {
  Promo: { ruleId?: string; title?: string } | undefined;
  ProductDetail: { id: string };
};

export type AccountStackParamList = {
  Account: undefined;
  Login: undefined;
  Profile: undefined;
  Orders: undefined;
};

export type RootTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  CatalogTab: NavigatorScreenParams<CatalogStackParamList>;
  SearchTab: NavigatorScreenParams<SearchStackParamList>;
  PromoTab: NavigatorScreenParams<PromoStackParamList>;
  AccountTab: NavigatorScreenParams<AccountStackParamList>;
};

// The tabs live inside this root stack so the cart can be pushed as a full
// screen that covers the floating tab bar too, reached from a cart icon in
// each tab's header rather than being a tab itself.
export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<RootTabParamList>;
  Cart: undefined;
  Checkout: undefined;
  MapPicker: {
    initialLat?: number | null;
    initialLng?: number | null;
    onSelect: (lat: number, lng: number) => void;
  };
  MemberBarcode: undefined;
  EditProfile: undefined;
  Settings: undefined;
  Orders: undefined;
  OrderDetail: { id: string };
  Notifications: undefined;
  PaymentResult: { orderId: string };
};
