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
export function resolveImageUrl(url: string): string {
  if (!API_URL || !url.startsWith("/")) return url;
  return `${API_URL}${url}`;
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
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  params?: Record<string, string | undefined>;
  body?: unknown;
  auth?: boolean;
};

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

  const res = await fetch(buildUrl(path, opts.params), {
    method: opts.method ?? "GET",
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new ApiError(`${path} gagal (${res.status}): ${text.slice(0, 300)}`, res.status);
  }

  return (await res.json()) as T;
}
