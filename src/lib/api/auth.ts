import * as WebBrowser from "expo-web-browser";
import { API_URL, apiRequest, clearToken, isApiConfigured, setToken } from "./client";
import type { CurrentUser } from "../types";

// Custom scheme registered in app.json ("scheme": "xsha") — the server's
// Google callback redirects here once sign-in/sign-up is done, and
// openAuthSessionAsync below watches for exactly this prefix to know the
// flow is finished.
const GOOGLE_AUTH_RETURN_URL = "xsha://auth";

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

export async function loginWithGoogle(): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!isApiConfigured() || !API_URL) {
    return { ok: false, message: "Login Google butuh koneksi ke server." };
  }

  const authUrl = `${API_URL}/api/mobile/auth/google/start`;
  const result = await WebBrowser.openAuthSessionAsync(authUrl, GOOGLE_AUTH_RETURN_URL);

  if (result.type !== "success" || !result.url) {
    return { ok: false, message: "Login Google dibatalkan." };
  }

  const parsed = new URL(result.url);
  const ok = parsed.searchParams.get("ok");
  if (ok !== "1") {
    const message = parsed.searchParams.get("message") ?? "Login Google gagal.";
    return { ok: false, message };
  }

  const token = parsed.searchParams.get("token");
  if (!token) return { ok: false, message: "Login Google gagal: token tidak ditemukan." };

  await setToken(token);
  return { ok: true };
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
