import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { AuthUser } from "../api/identity";
import {
  beginLogout,
  getMe,
  registerTenant,
} from "../api/identity";
import { setUnauthorizedHandler } from "../api/http";
import { queryClient } from "../api/queryClient";

const LEGACY_SESSION_KEY = "broker.session";

type AuthContextValue = {
  user: AuthUser | null;
  ready: boolean;
  register: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  function signOut() {
    queryClient.clear();
    setUser(null);
    beginLogout();
  }

  useEffect(() => {
    localStorage.removeItem(LEGACY_SESSION_KEY);
    setUnauthorizedHandler(() => {
      setUser(null);
      queryClient.clear();
    });
    getMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setReady(true));
    return () => setUnauthorizedHandler(undefined);
  }, []);

  async function register(name: string, email: string, password: string) {
    const next = await registerTenant(name, email, password);
    setUser(next);
  }

  return (
    <AuthContext.Provider value={{ user, ready, register, signOut }}>
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
