import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  completeProfile as completeProfileApi,
  getCurrentCustomer,
  loginCustomer,
  loginWithGoogle,
  logoutCustomer,
} from "../lib/api/auth";
import type { CurrentUser } from "../lib/types";
import { setCrashUser } from "../lib/crashlytics";
import { registerForPushNotifications, unregisterPushNotifications } from "../lib/pushNotifications";
import { PERSONAL_QUERY_KEYS } from "../lib/queryPersist";
import { describeError } from "../lib/api/client";

type AuthContextValue = {
  user: CurrentUser | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  // True right after a first-time Google sign-up, until completeProfile()
  // succeeds — the account only has an email + display name at that point,
  // so the app should block on a "finish your profile" form before letting
  // the user do anything that needs a phone number or address (checkout).
  needsProfileCompletion: boolean;
  login: (usr: string, pwd: string) => Promise<{ ok: true } | { ok: false; message: string }>;
  loginGoogle: () => Promise<{ ok: true } | { ok: false; message: string }>;
  completeProfile: (data: {
    name: string;
    mobile: string;
    addressLine1?: string;
    city?: string;
    latitude?: number | null;
    longitude?: number | null;
  }) => Promise<{ ok: true } | { ok: false; message: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const current = await getCurrentCustomer();
    setUser(current);
    setCrashUser(current?.customer?.id ?? null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Registers this device for order-update pushes once a customer is signed
  // in (re-runs on account switch; the server de-dupes per token).
  const customerId = user?.customer?.id ?? null;
  useEffect(() => {
    if (customerId) registerForPushNotifications();
  }, [customerId]);

  const login = useCallback(
    async (usr: string, pwd: string) => {
      // A thrown error (no internet, too many attempts, server down) must
      // come back as a normal failure so the form can show it — otherwise
      // the sign-in button would spin forever.
      try {
        const res = await loginCustomer(usr, pwd);
        if (res.ok) await refresh();
        return res;
      } catch (error) {
        return {
          ok: false as const,
          message: describeError(error, "Belum bisa masuk saat ini. Silakan coba lagi."),
        };
      }
    },
    [refresh],
  );

  const loginGoogle = useCallback(async () => {
    try {
      const res = await loginWithGoogle();
      if (res.ok) {
        setNeedsProfileCompletion(res.isNewSignup);
        await refresh();
      }
      return res;
    } catch (error) {
      return {
        ok: false as const,
        message: describeError(error, "Belum bisa masuk dengan Google saat ini. Silakan coba lagi."),
      };
    }
  }, [refresh]);

  const completeProfile = useCallback(
    async (data: {
      name: string;
      mobile: string;
      addressLine1?: string;
      city?: string;
      latitude?: number | null;
      longitude?: number | null;
    }) => {
      try {
        const res = await completeProfileApi(data);
        if (res.ok) {
          setNeedsProfileCompletion(false);
          await refresh();
        }
        return res;
      } catch (error) {
        return {
          ok: false as const,
          message: describeError(error, "Profil belum bisa disimpan saat ini. Silakan coba lagi."),
        };
      }
    },
    [refresh],
  );

  const logout = useCallback(async () => {
    await unregisterPushNotifications();
    await logoutCustomer();
    // Customer data stays in memory for hours (long gcTime) — drop it so the
    // next person to sign in on this phone never sees the previous one's.
    for (const key of PERSONAL_QUERY_KEYS) queryClient.removeQueries({ queryKey: [key] });
    setUser(null);
    setCrashUser(null);
    setNeedsProfileCompletion(false);
  }, [queryClient]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isLoggedIn: user !== null,
        needsProfileCompletion,
        login,
        loginGoogle,
        completeProfile,
        logout,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
