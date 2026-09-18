import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { API_URL, apiRequest, clearToken, isApiConfigured, setToken } from "./client";
import type { CurrentUser } from "../types";

// Linking.createURL builds the right return URL for however the app is
// currently running: the "xsha://" scheme from app.json in a standalone/
// dev-client build, but an "exp://<lan-ip>:8081/--/auth" URL when running
// in Expo Go — Expo Go isn't registered for "xsha://" at all, so a
// hardcoded scheme here would leave the in-app browser with nowhere to
// return to once Google finishes. The server echoes whatever we send back
// unmodified (see google/start's `client_redirect` param), so this one
// call keeps both environments working without any extra configuration.
function googleAuthReturnUrl(): string {
  return Linking.createURL("auth");
}

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
    kodePelanggan: "XAPP00000",
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

export async function loginWithGoogle(): Promise<
  { ok: true; isNewSignup: boolean } | { ok: false; message: string }
> {
  if (!isApiConfigured() || !API_URL) {
    return { ok: false, message: "Login Google butuh koneksi ke server." };
  }

  const returnUrl = googleAuthReturnUrl();
  const authUrl = `${API_URL}/api/mobile/auth/google/start?client_redirect=${encodeURIComponent(returnUrl)}`;
  const result = await WebBrowser.openAuthSessionAsync(authUrl, returnUrl);

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
  return { ok: true, isNewSignup: parsed.searchParams.get("isNew") === "1" };
}

export async function completeProfile(data: {
  name: string;
  mobile: string;
  addressLine1?: string;
  city?: string;
  latitude?: number | null;
  longitude?: number | null;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!isApiConfigured()) return { ok: true };

  return apiRequest<{ ok: true } | { ok: false; message: string }>(
    "/api/mobile/auth/complete-profile",
    { method: "POST", body: data, auth: true },
  );
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
