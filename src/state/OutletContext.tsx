import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";
import { getOutlets } from "../lib/api/outlets";
import { distanceKm } from "../lib/geo";
import type { Outlet } from "../lib/types";

export type OutletWithDistance = Outlet & { distanceKm: number | null };

type OutletContextValue = {
  // Sorted nearest-first when the customer's location is known (outlets
  // without a pin, or before location resolves, keep the server's own
  // order and get `distanceKm: null`).
  outlets: OutletWithDistance[];
  outletCode: string;
  selectedOutlet: OutletWithDistance | null;
  setOutletCode: (code: string) => void;
};

const OutletContext = createContext<OutletContextValue | null>(null);

const STORAGE_KEY = "xsha_outlet";

// Mirrors the web's outlet-context.tsx (localStorage there, AsyncStorage
// here) — picking an outlet filters the catalog/search to that outlet's
// warehouse stock, same as the web's top-nav outlet selector.
export function OutletProvider({ children }: { children: ReactNode }) {
  const { data: outlets } = useQuery({
    queryKey: ["outlets"],
    queryFn: () => getOutlets(),
    staleTime: 10 * 60_000,
  });

  const [outletCode, setOutletCodeState] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored) setOutletCodeState(stored);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    // Best-effort: silently skip if permission is denied or location fails —
    // the outlet list just falls back to its default (unsorted) order.
    (async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        let granted = status === "granted";
        if (status === "undetermined") {
          granted = (await Location.requestForegroundPermissionsAsync()).status === "granted";
        }
        if (!granted) return;
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      } catch {
        // GPS off, timed out, etc. — no recommendation, not an error state.
      }
    })();
  }, []);

  const setOutletCode = (code: string) => {
    setOutletCodeState(code);
    if (code) AsyncStorage.setItem(STORAGE_KEY, code).catch(() => {});
    else AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  };

  const value = useMemo<OutletContextValue>(() => {
    // Only outlets linked to a warehouse can be used for stock filtering.
    const withDistance: OutletWithDistance[] = (outlets ?? [])
      .filter((o) => o.warehouse)
      .map((o) => ({
        ...o,
        distanceKm:
          coords && o.latitude != null && o.longitude != null
            ? distanceKm(coords, { lat: o.latitude, lng: o.longitude })
            : null,
      }));

    // Nearest first when we have a distance; outlets without one (no pin,
    // or location unknown) keep the server's order, after the sorted ones.
    const list = coords
      ? [...withDistance].sort((a, b) => {
          if (a.distanceKm == null) return b.distanceKm == null ? 0 : 1;
          if (b.distanceKm == null) return -1;
          return a.distanceKm - b.distanceKm;
        })
      : withDistance;

    return {
      outlets: list,
      outletCode,
      selectedOutlet: list.find((o) => o.code === outletCode) ?? null,
      setOutletCode,
    };
  }, [outlets, outletCode, coords]);

  return <OutletContext.Provider value={value}>{children}</OutletContext.Provider>;
}

export function useOutlet(): OutletContextValue {
  const ctx = useContext(OutletContext);
  if (!ctx) throw new Error("useOutlet must be used within OutletProvider");
  return ctx;
}
