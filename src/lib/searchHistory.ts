import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "xsha_search_history";
const MAX_ENTRIES = 10;

export async function getSearchHistory(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((t): t is string => typeof t === "string") : [];
  } catch {
    return [];
  }
}

// Most-recent-first, deduped (a repeated search jumps back to the top
// instead of appearing twice), capped so it never grows unbounded.
export async function addSearchTerm(term: string): Promise<string[]> {
  const trimmed = term.trim();
  if (!trimmed) return getSearchHistory();

  const current = await getSearchHistory();
  const next = [trimmed, ...current.filter((t) => t.toLowerCase() !== trimmed.toLowerCase())].slice(
    0,
    MAX_ENTRIES,
  );
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  return next;
}

export async function removeSearchTerm(term: string): Promise<string[]> {
  const current = await getSearchHistory();
  const next = current.filter((t) => t !== term);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  return next;
}

export async function clearSearchHistory(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
}
