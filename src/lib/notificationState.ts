import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Pesanan } from "./types";

// What the Notifikasi list and the home-screen dot both agree on:
//  - a notification is one order *in one state* (order + stage + courier
//    status), so a status change is a new notification;
//  - "dismissed" ones the customer cleared never come back;
//  - "seen" ones were on screen when the list was opened, so they no
//    longer count as unread.
export const DISMISSED_KEY = "xsha_dismissed_notifications";
export const SEEN_KEY = "xsha_seen_notifications";
const MAX_ENTRIES = 200;

export function notificationKey(p: Pick<Pesanan, "id" | "stage" | "deliveryStatus">): string {
  return `${p.id}|${p.stage}|${p.deliveryStatus ?? ""}`;
}

export async function loadKeys(storageKey: string): Promise<string[]> {
  try {
    const stored = await AsyncStorage.getItem(storageKey);
    const parsed = stored ? (JSON.parse(stored) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((k): k is string => typeof k === "string") : [];
  } catch {
    return [];
  }
}

export async function addKeys(storageKey: string, keys: string[]): Promise<string[]> {
  const merged = [...new Set([...(await loadKeys(storageKey)), ...keys])].slice(-MAX_ENTRIES);
  try {
    await AsyncStorage.setItem(storageKey, JSON.stringify(merged));
  } catch {
    // Best-effort: a failed write only means the dot may reappear once.
  }
  return merged;
}

// Pure, so it can be reasoned about (and tested) without a device.
export function countUnread(
  pesanan: Pick<Pesanan, "id" | "stage" | "deliveryStatus">[],
  dismissed: string[],
  seen: string[],
): number {
  const skip = new Set([...dismissed, ...seen]);
  return pesanan.filter((p) => !skip.has(notificationKey(p))).length;
}
