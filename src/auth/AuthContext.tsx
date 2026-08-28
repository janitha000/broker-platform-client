import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { AuthUser } from "../api/identity";
import {
  getMe,
  login as loginRequest,
  logout as logoutRequest,
  registerTenant,
} from "../api/identity";
import { setUnauthorizedHandler } from "../api/http";
import { queryClient } from "../api/queryClient";

const LEGACY_SESSION_KEY = "broker.session";

type AuthContextValue = {
  user: AuthUser | null;
  ready: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  async function signOut() {
    try {
      await logoutRequest();
    } catch {
      /* cookie may already be gone */
    }
    setUser(null);
    queryClient.clear();
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

  async function signIn(email: string, password: string) {
    const next = await loginRequest(email, password);
    setUser(next);
  }

  async function register(name: string, email: string, password: string) {
    const next = await registerTenant(name, email, password);
    setUser(next);
  }

  return (
    <AuthContext.Provider value={{ user, ready, signIn, register, signOut }}>
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
