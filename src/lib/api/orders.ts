import * as Linking from "expo-linking";
import { apiRequest, isApiConfigured } from "./client";
import { mockOrders } from "../mock-data";
import { getCurrentCustomer } from "./auth";
import type { Order, OrderDetail, OrderLine, Pesanan } from "../types";

export type CreateOrderResult =
  | { ok: true; orderId: string; paymentUrl?: string; paymentError?: string }
  | { ok: false; reason: "not_configured" | "not_authenticated" | "erpnext_error"; message?: string };

// Lets a real fetch failure surface as useQuery's isError instead of
// silently looking identical to "no orders yet" — AccountScreen shows a
// retry state for the former and an empty state for the latter.
export async function getMyOrders(): Promise<Order[]> {
  if (!isApiConfigured()) {
    const user = await getCurrentCustomer();
    return user?.customer ? mockOrders : [];
  }
  return apiRequest<Order[]>("/api/mobile/orders", { auth: true });
}

export async function getOrderDetail(id: string): Promise<OrderDetail | null> {
  if (!isApiConfigured()) {
    const order = mockOrders.find((o) => o.id === id);
    if (!order) return null;
    return { ...order, items: [] };
  }
  try {
    return await apiRequest<OrderDetail>(`/api/mobile/orders/${encodeURIComponent(id)}`, { auth: true });
  } catch {
    return null;
  }
}

// "Pesanan Saya" — the customer's own checkout-created orders, tracked
// through their full lifecycle (unpaid/preparing/shipping/completed —
// see the Pesanan/OrderStage doc comment in ../types), distinct from
// getMyOrders above (completed in-store Sales Invoices, unrelated to the
// app's own checkout).
export async function getMyPesanan(): Promise<Pesanan[]> {
  if (!isApiConfigured()) return [];
  return apiRequest<Pesanan[]>("/api/mobile/quotations", { auth: true });
}

export async function getQuotationDetail(id: string): Promise<OrderDetail | null> {
  if (!isApiConfigured()) return null;
  try {
    return await apiRequest<OrderDetail>(`/api/mobile/quotations/${encodeURIComponent(id)}`, { auth: true });
  } catch {
    return null;
  }
}

export async function resumePayment(
  quotationId: string,
): Promise<{ ok: true; paymentUrl: string } | { ok: false; message: string }> {
  if (!isApiConfigured()) return { ok: false, message: "API belum dikonfigurasi." };
  const returnUrl = Linking.createURL("payment-result");
  return apiRequest<{ ok: true; paymentUrl: string } | { ok: false; message: string }>(
    `/api/mobile/quotations/${encodeURIComponent(quotationId)}/resume-payment`,
    { method: "POST", auth: true, body: { returnUrl } },
  );
}

export async function createOrder(items: OrderLine[], note?: string): Promise<CreateOrderResult> {
  if (!isApiConfigured()) {
    return { ok: true, orderId: `DEMO-${Date.now()}` };
  }
  // Same deep-link the server hands back once DOKU Checkout finishes, as
  // the app's own return URL — same idea as the Google login flow, and
  // for the same reason: Expo Go can't be reached via the app's real
  // "xsha://" scheme, so this resolves to whatever actually works in
  // however the app is currently running.
  const returnUrl = Linking.createURL("payment-result");
  return apiRequest<CreateOrderResult>("/api/mobile/orders", {
    method: "POST",
    auth: true,
    body: { items, note, returnUrl },
  });
}
