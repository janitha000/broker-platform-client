import { useEffect, type ReactNode } from "react";
import { setUnauthorizedHandler } from "../api/http";
import { useAppDispatch } from "../store/hooks";
import { restoreSession, sessionUnauthorized } from "./authSlice";

const LEGACY_SESSION_KEY = "broker.session";

export function AuthBootstrap({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    localStorage.removeItem(LEGACY_SESSION_KEY);

    setUnauthorizedHandler(() => {
      void dispatch(sessionUnauthorized());
    });

    void dispatch(restoreSession());

    return () => setUnauthorizedHandler(undefined);
  }, [dispatch]);

  return children;
}
