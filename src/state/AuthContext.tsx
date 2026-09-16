import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { getCurrentCustomer, loginCustomer, loginWithGoogle, logoutCustomer } from "../lib/api/auth";
import type { CurrentUser } from "../lib/types";

type AuthContextValue = {
  user: CurrentUser | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (usr: string, pwd: string) => Promise<{ ok: true } | { ok: false; message: string }>;
  loginGoogle: () => Promise<{ ok: true } | { ok: false; message: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const current = await getCurrentCustomer();
    setUser(current);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(
    async (usr: string, pwd: string) => {
      const res = await loginCustomer(usr, pwd);
      if (res.ok) await refresh();
      return res;
    },
    [refresh],
  );

  const loginGoogle = useCallback(async () => {
    const res = await loginWithGoogle();
    if (res.ok) await refresh();
    return res;
  }, [refresh]);

  const logout = useCallback(async () => {
    await logoutCustomer();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isLoggedIn: user !== null, login, loginGoogle, logout, refresh }}
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
