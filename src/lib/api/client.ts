import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

// When set (EXPO_PUBLIC_API_URL in .env), the app talks to xsha-app's
// /api/mobile/* REST endpoints, which proxy to ERPNext server-side (same
// backend the website uses). Without it, every lib/api/* function below
// falls back to local mock data, so the app is fully browsable offline.
export const API_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") || null;

export function isApiConfigured(): boolean {
  return API_URL !== null;
}

// The backend can return relative asset paths (e.g. its own placeholder
// image) alongside absolute ERPNext file URLs — resolve the relative ones
// against the API host so <Image> always gets something loadable.
// Release Android builds block cleartext http:// by default, and the backend
// has been handing back http:// image URLs behind its TLS-terminating proxy
// (they only redirect to https after the blocked request). Upgrade them here
// so banners load in APKs, not just in Expo Go where cleartext is allowed.
export function resolveImageUrl(url: string): string {
  const upgraded = url.replace(/^http:\/\/x-sha\.id\//, "https://x-sha.id/");
  if (!API_URL || !upgraded.startsWith("/")) return upgraded;
  return `${API_URL}${upgraded}`;
}

const TOKEN_KEY = "xsha_auth_token";

// expo-secure-store has no native keychain on web — fall back to
// localStorage there so auth still works when previewing in a browser.
export async function getToken(): Promise<string | null> {
  if (Platform.OS === "web") return window.localStorage.getItem(TOKEN_KEY);
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  if (Platform.OS === "web") return window.localStorage.setItem(TOKEN_KEY, token);
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  if (Platform.OS === "web") return window.localStorage.removeItem(TOKEN_KEY);
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  // The `message` the server put in its JSON answer, when it sent one — an
  // already customer-facing sentence ("Pesanan ini sudah dibayar.") as
  // opposed to `message`, which is a debugging string with the request path.
  serverMessage?: string;
  constructor(message: string, status: number, serverMessage?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.serverMessage = serverMessage;
  }
}

// The request never got an answer — no internet, a dead connection, or one
// so slow it was given up on. Kept separate from ApiError(status >= 400)
// because the right response differs: the customer can't fix a server
// error, but can usually fix this one (and nothing was received, so it is
// safe to simply try again).
export class NetworkError extends ApiError {
  timedOut: boolean;
  constructor(timedOut: boolean) {
    super(
      timedOut
        ? "Koneksi terlalu lambat sehingga permintaan dihentikan. Periksa sinyal Anda, lalu coba lagi."
        : "Tidak ada koneksi internet. Periksa sinyal atau Wi-Fi Anda, lalu coba lagi.",
      0,
    );
    this.name = "NetworkError";
    this.timedOut = timedOut;
  }
}

export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError;
}

// A customer-facing Indonesian message for any thrown error. ApiError's own
// `message` carries the request path and a response excerpt for debugging,
// which must never be shown to a shopper.
export function describeError(error: unknown, fallback = "Terjadi kesalahan. Silakan coba lagi."): string {
  if (error instanceof NetworkError) return error.message;
  if (error instanceof ApiError && error.status >= 400 && error.status < 500 && error.serverMessage) {
    return error.serverMessage;
  }
  if (error instanceof ApiError && error.status >= 500) {
    return "Server sedang bermasalah. Silakan coba lagi beberapa saat lagi.";
  }
  return fallback;
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  params?: Record<string, string | undefined>;
  body?: unknown;
  auth?: boolean;
  // Give up (as a NetworkError) if no answer arrives in this long. Without
  // it a bad connection leaves the screen spinning indefinitely.
  timeoutMs?: number;
};

const DEFAULT_TIMEOUT_MS = 25_000;

function buildUrl(path: string, params?: RequestOptions["params"]) {
  const url = new URL(API_URL + path);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, value);
    }
  }
  return url.toString();
}

export async function apiRequest<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  if (!API_URL) throw new ApiError("API belum dikonfigurasi", 503);

  const headers: Record<string, string> = { Accept: "application/json" };
  if (opts.auth) {
    const token = await getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(buildUrl(path, opts.params), {
      method: opts.method ?? "GET",
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      signal: controller.signal,
    });
  } catch {
    // fetch only rejects when no HTTP answer arrived at all.
    throw new NetworkError(controller.signal.aborted);
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let serverMessage: string | undefined;
    try {
      const parsed = JSON.parse(text) as { message?: unknown };
      if (typeof parsed.message === "string") serverMessage = parsed.message;
    } catch {
      // Not JSON (e.g. an HTML error page) — no customer-facing message.
    }
    throw new ApiError(`${path} gagal (${res.status}): ${text.slice(0, 300)}`, res.status, serverMessage);
  }

  return (await res.json()) as T;
}
