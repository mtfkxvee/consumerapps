// Fallback data used only when EXPO_PUBLIC_API_URL is not configured (local
// dev / preview before the backend is wired up), mirroring xsha-app's own
// mock-data.ts so both apps look consistent out of the box.
import type {
  ItemGroup,
  LoyaltyStatus,
  Order,
  Outlet,
  Product,
  PromoBanner,
  PromoProduct,
} from "./types";

const PLACEHOLDER = (seed: string, w = 600, h = 600) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;

export const mockProducts: Product[] = [
  {
    id: "batik-royal",
    name: "Batik Tasik Royal Violet",
    category: "Fashion • Batik",
    price: 450000,
    image: PLACEHOLDER("batik-royal"),
    alt: "Kain batik Tasik Royal Violet dengan motif tradisional ungu keemasan",
  },
  {
    id: "tenun-heritage",
    name: "Modern Tenun Heritage",
    category: "Fashion • Tenun",
    price: 890000,
    image: PLACEHOLDER("tenun-heritage"),
    alt: "Kemeja tenun heritage modern pada manekin minimalis",
  },
  {
    id: "signature-wallet",
    name: "Signature Wallet Series",
    category: "Aksesoris • Kulit",
    price: 325000,
    image: PLACEHOLDER("signature-wallet"),
    alt: "Set aksesoris kulit mewah bernuansa violet di studio minimalis",
  },
  {
    id: "eco-woven",
    name: "Eco-Woven Storage Set",
    category: "Home Decor • Anyaman",
    price: 210000,
    image: PLACEHOLDER("eco-woven"),
    alt: "Keranjang anyaman tangan untuk dekorasi rumah modern",
  },
  {
    id: "galunggung-arabica",
    name: "Galunggung Arabica Gold",
    category: "Gourmet • Kopi",
    price: 125000,
    image: PLACEHOLDER("galunggung-arabica"),
    alt: "Biji kopi arabika Tasikmalaya dalam kemasan ungu premium",
  },
  {
    id: "kelom-geulis",
    name: "Kelom Geulis Modern Art",
    category: "Fashion • Alas Kaki",
    price: 420000,
    image: PLACEHOLDER("kelom-geulis"),
    alt: "Kelom geulis kayu dengan ukiran artistik modern",
  },
];

export const mockItemGroups: ItemGroup[] = [
  { name: "Fashion • Batik", label: "Fashion • Batik", parent: null, isGroup: false },
  { name: "Fashion • Tenun", label: "Fashion • Tenun", parent: null, isGroup: false },
  { name: "Aksesoris • Kulit", label: "Aksesoris • Kulit", parent: null, isGroup: false },
  { name: "Home Decor • Anyaman", label: "Home Decor • Anyaman", parent: null, isGroup: false },
  { name: "Gourmet • Kopi", label: "Gourmet • Kopi", parent: null, isGroup: false },
  { name: "Fashion • Alas Kaki", label: "Fashion • Alas Kaki", parent: null, isGroup: false },
];

export const mockPromoProducts: PromoProduct[] = mockProducts.slice(0, 4).map((p, i) => {
  const discountPercent = [25, 20, 15, 30][i];
  return {
    ...p,
    discountPercent,
    oldPrice: p.price,
    price: Math.round((p.price * (100 - discountPercent)) / 100),
  };
});

export const mockPromoBanners: PromoBanner[] = [
  { id: "promo-1", title: "Koleksi Batik Signature", image: PLACEHOLDER("banner-1", 800, 400) },
  { id: "promo-2", title: "Promo Kopi Galunggung", image: PLACEHOLDER("banner-2", 800, 400) },
];

export const mockOutlets: Outlet[] = [
  {
    code: "XSC",
    name: "X-SHA Cikiray",
    city: "Tasikmalaya",
    territory: null,
    whatsapp: "6288299633581",
    latitude: -7.3274,
    longitude: 108.2207,
    warehouse: "SELLING AREA XSC - X",
    image: PLACEHOLDER("outlet-xsc", 800, 500),
    description: "Outlet flagship X-SHA dengan koleksi fashion dan kebutuhan rumah tangga lengkap.",
  },
  {
    code: "XCW",
    name: "X-SHA Ciawi",
    city: "Ciawi",
    territory: null,
    whatsapp: "6288299633581",
    latitude: -7.3691,
    longitude: 108.2027,
    warehouse: "SELLING AREA XCW - X",
    image: null,
    description: null,
  },
];

export const mockOrders: Order[] = [
  { id: "DEMO-0001", date: "2026-08-14", status: "Selesai", total: 1250000 },
  { id: "DEMO-0002", date: "2026-08-08", status: "Selesai", total: 545000 },
];

export const mockLoyalty: LoyaltyStatus = {
  points: 750,
  level: "Gold Member",
  loyaltyProgram: "MEMBER",
};

export const WHATSAPP_NUMBER = "6288299633581";
