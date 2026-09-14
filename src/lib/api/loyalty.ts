import { apiRequest, isApiConfigured } from "./client";
import { mockLoyalty } from "../mock-data";
import { getCurrentCustomer } from "./auth";
import type { LoyaltyStatus } from "../types";

export async function getMyLoyaltyStatus(): Promise<LoyaltyStatus | null> {
  if (!isApiConfigured()) {
    const user = await getCurrentCustomer();
    return user?.customer ? mockLoyalty : null;
  }
  try {
    return await apiRequest<LoyaltyStatus | null>("/api/mobile/loyalty", { auth: true });
  } catch {
    return null;
  }
}
