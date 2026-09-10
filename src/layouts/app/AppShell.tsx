import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import styles from "./AppShell.module.css";
import { ThemeToggle } from "../../components/ThemeToggle";
import { Button } from "../../components/Button";
import { ErrorBoundary } from "react-error-boundary";
import { AppErrorFallback } from "./AppErrorFallback";
import { useNotificationHub } from "../../realtime/useNotificationHub";

export function AppShell() {
  const location = useLocation();
  const { user, signOut } = useAuth();
  useNotificationHub();

  return (
    <div className={styles.frame}>
      <header className={styles.header}>
        <p className={styles.brand}>
          <NavLink to="/cases">Broker</NavLink>
        </p>
        <div className={styles.tools}>
          <p className={styles.email}>{user?.email}</p>
          <ThemeToggle />
          <Button variant="secondary" onClick={() => void signOut()}>
            Sign out
          </Button>
        </div>
      </header>
      <nav className={styles.nav} aria-label="Main">
        <NavLink
          to="/cases"
          end
          className={({ isActive }) => (isActive ? styles.current : undefined)}
        >
          Cases
        </NavLink>
        <NavLink
          to="/cases/board"
          className={({ isActive }) => (isActive ? styles.current : undefined)}
        >
          Board
        </NavLink>
      </nav>
      <main>
        <ErrorBoundary
          FallbackComponent={AppErrorFallback}
          resetKeys={[location.pathname]}
          onError={(error) => {
            console.error(error);
          }}
        >
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
}
