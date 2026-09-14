import { apiRequest, isApiConfigured } from "./client";
import { mockOrders } from "../mock-data";
import { getCurrentCustomer } from "./auth";
import type { Order, OrderLine } from "../types";

export type CreateOrderResult =
  | { ok: true; orderId: string }
  | { ok: false; reason: "not_configured" | "not_authenticated" | "erpnext_error"; message?: string };

export async function getMyOrders(): Promise<Order[]> {
  if (!isApiConfigured()) {
    const user = await getCurrentCustomer();
    return user?.customer ? mockOrders : [];
  }
  try {
    return await apiRequest<Order[]>("/api/mobile/orders", { auth: true });
  } catch {
    return [];
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
