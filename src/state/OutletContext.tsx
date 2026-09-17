import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";
import { getOutlets } from "../lib/api/outlets";
import type { Outlet } from "../lib/types";

type OutletContextValue = {
  outlets: Outlet[];
  outletCode: string;
  selectedOutlet: Outlet | null;
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

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored) setOutletCodeState(stored);
      })
      .catch(() => {});
  }, []);

  const setOutletCode = (code: string) => {
    setOutletCodeState(code);
    if (code) AsyncStorage.setItem(STORAGE_KEY, code).catch(() => {});
    else AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  };

  const value = useMemo<OutletContextValue>(() => {
    // Only outlets linked to a warehouse can be used for stock filtering.
    const list = (outlets ?? []).filter((o) => o.warehouse);
    return {
      outlets: list,
      outletCode,
      selectedOutlet: list.find((o) => o.code === outletCode) ?? null,
      setOutletCode,
    };
  }, [outlets, outletCode]);

  return <OutletContext.Provider value={value}>{children}</OutletContext.Provider>;
}

export function useOutlet(): OutletContextValue {
  const ctx = useContext(OutletContext);
  if (!ctx) throw new Error("useOutlet must be used within OutletProvider");
  return ctx;
}
