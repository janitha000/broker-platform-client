import { createContext, useContext, useState, type ReactNode } from "react";
import type { AuthUser } from "../api/identity";
import { login as loginRequest, registerTenant } from "../api/identity";
import { saveSession, loadSession, clearSession } from "./session";

type AuthContextValue = {
  user: AuthUser | null;
  signIn: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => loadSession());

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

  function signOut() {
    clearSession();
    setUser(null);
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
