export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  alt: string;
};

export type PromoProduct = Product & { discountPercent: number; oldPrice: number };

export type ItemGroup = {
  name: string;
  label: string;
  parent: string | null;
  isGroup: boolean;
};

export type Outlet = {
  code: string;
  name: string;
  city: string | null;
  territory: string | null;
  whatsapp: string;
  warehouse: string | null;
  image: string | null;
  description: string | null;
};

export type Customer = {
  id: string;
  name: string;
  group: string | null;
  mobile: string | null;
  email: string | null;
  loyaltyProgram: string | null;
  birthDate: string | null;
  kodePelanggan: string | null;
};

export type CurrentUser = {
  email: string;
  customer: Customer | null;
};

export type Order = {
  id: string;
  date: string;
  status: string;
  total: number;
};

export type OrderDetailLine = {
  itemCode: string;
  itemName: string;
  qty: number;
  rate: number;
  amount: number;
  uom: string;
};

export type OrderDetail = Order & {
  items: OrderDetailLine[];
};

export type OrderLine = {
  itemCode: string;
  itemName: string;
  qty: number;
  rate: number;
};

// "Pesanan" — an order placed via the app's own checkout, tracked through
// its full lifecycle, distinct from Order above (a completed in-store
// Sales Invoice, unrelated to the app's own checkout):
//   unpaid     awaiting DOKU payment confirmation
//   preparing  paid, converted to a Sales Order, no delivery linked yet
//   shipping   a Delivery Request is linked, not yet marked "Terkirim"
//   completed  that Delivery Request is "Terkirim" (delivered)
export type OrderStage = "unpaid" | "preparing" | "shipping" | "completed";

export type Pesanan = {
  id: string;
  date: string;
  status: string;
  total: number;
  stage: OrderStage;
  deliveryStatus: string | null;
};

export type LoyaltyStatus = {
  points: number;
  level: string | null;
  loyaltyProgram: string | null;
};

export type PromoBanner = {
  id: string;
  title: string;
  image: string;
};

export type ProductQuery = {
  search?: string;
  itemGroup?: string;
  itemGroupIsGroup?: boolean;
  warehouse?: string;
  page?: number;
  pageSize?: number;
  sort?: "relevance" | "price_asc" | "price_desc";
};

export type ProductPage = {
  products: Product[];
  total: number;
};
