import { apiRequest, clearToken, isApiConfigured, setToken } from "./client";
import type { CurrentUser } from "../types";

const MOCK_USER: CurrentUser = {
  email: "demo@x-sha.id",
  customer: {
    id: "CUST-DEMO-001",
    name: "Pelanggan Demo",
    group: "Gold Member",
    mobile: "081234567890",
    email: "demo@x-sha.id",
    loyaltyProgram: "MEMBER",
    birthDate: null,
  },
};

let mockLoggedIn = false;

export async function loginCustomer(
  usr: string,
  pwd: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!isApiConfigured()) {
    if (!usr || !pwd) return { ok: false, message: "Email dan kata sandi wajib diisi." };
    mockLoggedIn = true;
    return { ok: true };
  }

  const res = await apiRequest<{ ok: true; token: string } | { ok: false; message: string }>(
    "/api/mobile/auth/login",
    { method: "POST", body: { usr, pwd } },
  );
  if (res.ok) {
    await setToken(res.token);
    return { ok: true };
  }
  return res;
}

export async function logoutCustomer(): Promise<void> {
  if (!isApiConfigured()) {
    mockLoggedIn = false;
    return;
  }
  await apiRequest("/api/mobile/auth/logout", { method: "POST", auth: true }).catch(() => {});
  await clearToken();
}

export async function getCurrentCustomer(): Promise<CurrentUser | null> {
  if (!isApiConfigured()) {
    return mockLoggedIn ? MOCK_USER : null;
  }
  try {
    return await apiRequest<CurrentUser | null>("/api/mobile/auth/me", { auth: true });
  } catch {
    return null;
  }
}
