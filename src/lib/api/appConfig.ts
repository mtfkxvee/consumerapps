import { apiRequest, isApiConfigured } from "./client";

// The oldest app version the server still supports ("0.0.0" = everyone).
// Any failure answers "everyone": being unable to reach the server must
// never lock a customer out of an app that would otherwise work offline.
export async function getMinimumVersion(): Promise<string> {
  if (!isApiConfigured()) return "0.0.0";
  try {
    const res = await apiRequest<{ minVersion?: string }>("/api/mobile/app-config", { timeoutMs: 8000 });
    return typeof res.minVersion === "string" && res.minVersion ? res.minVersion : "0.0.0";
  } catch {
    return "0.0.0";
  }
}

function parts(version: string): number[] {
  return version
    .split(".")
    .map((p) => parseInt(p, 10))
    .map((n) => (Number.isNaN(n) ? 0 : n));
}

// True when `current` is strictly older than `minimum` (numeric, per
// segment: "1.10.0" is newer than "1.9.0"; missing segments count as 0).
export function isVersionBelow(current: string, minimum: string): boolean {
  const a = parts(current);
  const b = parts(minimum);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const x = a[i] ?? 0;
    const y = b[i] ?? 0;
    if (x !== y) return x < y;
  }
  return false;
}
