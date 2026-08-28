import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { AuthUser } from "../api/identity";
import { login as loginRequest, registerTenant } from "../api/identity";
import { saveSession, loadSession, clearSession } from "./session";
import { setUnauthorizedHandler } from "../api/http";
import { queryClient } from "../api/queryClient";

type AuthContextValue = {
  user: AuthUser | null;
  signIn: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => loadSession());

  function signOut() {
    clearSession();
    setUser(null);
    queryClient.clear();
  }

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession();
      setUser(null);
      queryClient.clear();
    });
    return () => setUnauthorizedHandler(undefined);
  }, []);

  async function signIn(email: string, password: string) {
    const next = await loginRequest(email, password);
    saveSession(next);
    setUser(next);
  }

  async function register(name: string, email: string, password: string) {
    const next = await registerTenant(name, email, password);
    saveSession(next);
    setUser(next);
  }

  return (
    <AuthContext.Provider value={{ user, signIn, register, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return value;
}
