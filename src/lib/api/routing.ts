import { apiRequest, isApiConfigured } from "./client";

export type LatLng = { lat: number; lng: number };

// One-to-many real road distance (via the server's OSRM proxy), used both
// to sort outlets by distance and to show the distance on Checkout — see
// xsha-app's getRoadDistancesKm for why one batched call beats N single
// ones. Returns km per destination in the same order, null for any the
// server couldn't resolve (never throws — distance is a display/sort
// nicety, not something that should block the screen).
export async function getRoadDistancesKm(origin: LatLng, destinations: LatLng[]): Promise<(number | null)[]> {
  if (!isApiConfigured() || destinations.length === 0) return destinations.map(() => null);
  try {
    const res = await apiRequest<{ distancesKm: (number | null)[] }>("/api/mobile/route-distance", {
      method: "POST",
      body: { origin, destinations },
    });
    return res.distancesKm;
  } catch {
    return destinations.map(() => null);
  }
}
