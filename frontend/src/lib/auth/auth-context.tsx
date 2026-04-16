"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import { authApi, type User } from "@/lib/api/auth-api";
import { ApiError } from "@/lib/api/api-client";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, mfaCode?: string) => Promise<{ requiresMfa?: boolean }>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  googleLogin: () => void;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const initialized = useRef(false);

  const refetchUser = useCallback(async () => {
    try {
      const data = await authApi.me();
      setUser(data);
    } catch {
      setUser(null);
    }
  }, []);

  // Check auth once on mount — no retry loop
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    refetchUser().finally(() => setIsLoading(false));
  }, [refetchUser]);

  const login = useCallback(async (email: string, password: string, mfaCode?: string) => {
    const data = await authApi.login({ email, password, mfaCode });

    if ("requiresMfa" in data && data.requiresMfa) {
      return { requiresMfa: true };
    }

    const authData = data as { user: User };
    setUser(authData.user);
    return {};
  }, []);

  const register = useCallback(async (email: string, password: string, name?: string) => {
    await authApi.register({ email, password, name });
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore — user may already be logged out
    }
    setUser(null);
  }, []);

  const googleLogin = useCallback(() => {
    authApi.googleLogin();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        googleLogin,
        refetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
