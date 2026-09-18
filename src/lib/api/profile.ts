import { apiRequest, isApiConfigured } from "./client";

export type MyAddress = {
  addressName: string | null;
  line1: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
};

export async function getMyAddress(): Promise<MyAddress | null> {
  if (!isApiConfigured()) {
    return { addressName: null, line1: "", city: "", latitude: null, longitude: null };
  }
  try {
    return await apiRequest<MyAddress | null>("/api/mobile/auth/me/address", { auth: true });
  } catch {
    return null;
  }
}
