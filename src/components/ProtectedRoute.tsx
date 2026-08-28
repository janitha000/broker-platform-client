import type { ReactNode } from "react";
import { useAuth } from "../auth/AuthContext";
import { Navigate } from "react-router-dom";

// If there is no JWT, send the user to /login. Used around private pages.
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
