import { apiRequest, isApiConfigured } from "./client";
import { mockOrders } from "../mock-data";
import { getCurrentCustomer } from "./auth";
import type { Order, OrderDetail, OrderLine } from "../types";

export type CreateOrderResult =
  | { ok: true; orderId: string }
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

export async function createOrder(items: OrderLine[], note?: string): Promise<CreateOrderResult> {
  if (!isApiConfigured()) {
    return { ok: true, orderId: `DEMO-${Date.now()}` };
  }
  return apiRequest<CreateOrderResult>("/api/mobile/orders", {
    method: "POST",
    auth: true,
    body: { items, note },
  });
}
