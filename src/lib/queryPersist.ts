import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import type { PersistedClient } from "@tanstack/react-query-persist-client";
import type { Query } from "@tanstack/react-query";

// How long a saved copy of the catalog may be shown while the fresh one is
// still loading. The in-memory `gcTime` must be at least this long or the
// restored entries would be dropped straight away.
export const CACHE_MAX_AGE_MS = 12 * 60 * 60_000;

const STORAGE_KEY = "xsha_query_cache";

// Only public, not-per-customer data is written to disk: the catalog, stock-
// filtered product lists, promos, categories and outlets. Anything tied to
// the signed-in customer (orders, loyalty, order detail) is deliberately
// left out, so nothing personal sits on the phone after logout and a second
// account on the same device can never see it.
const PERSISTED_KEYS = new Set([
  "outlets",
  "item-groups",
  "products",
  "products-infinite",
  "product",
  "promo-products",
  "promo-banners",
  "promo-rule-products",
]);

// What survives if the whole cache grows too large. Android reads an
// AsyncStorage value through a ~2 MB window, so one oversized entry would
// make restoring fail entirely; staying under this keeps it readable.
const MAX_BYTES = 1_500_000;
const ESSENTIAL_KEYS = new Set(["outlets", "item-groups", "promo-banners"]);

export function shouldPersistQuery(query: Query): boolean {
  return query.state.status === "success" && PERSISTED_KEYS.has(String(query.queryKey[0]));
}

function serialize(client: PersistedClient): string {
  const full = JSON.stringify(client);
  if (full.length <= MAX_BYTES) return full;

  const essential = JSON.stringify({
    ...client,
    clientState: {
      ...client.clientState,
      queries: client.clientState.queries.filter((q) => ESSENTIAL_KEYS.has(String(q.queryKey[0]))),
    },
  });
  if (essential.length <= MAX_BYTES) return essential;

  return JSON.stringify({ ...client, clientState: { mutations: [], queries: [] } });
}

export const queryPersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: STORAGE_KEY,
  // Writes are batched: scrolling a catalog fires many query updates.
  throttleTime: 2000,
  serialize,
});

// Keys of the customer-specific queries — cleared on logout (see
// AuthContext) because they stay in memory for up to CACHE_MAX_AGE_MS.
export const PERSONAL_QUERY_KEYS = ["my-pesanan", "my-orders", "order-detail", "loyalty-status"] as const;
