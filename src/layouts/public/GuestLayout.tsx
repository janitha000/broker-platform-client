import { ErrorBoundary } from "react-error-boundary";
import { Outlet, useLocation } from "react-router-dom";
import { ThemeToggle } from "../../components/ThemeToggle";
import { GuestErrorFallback } from "./GuestErrorFallback";
import styles from "./GuestLayout.module.css";

export function GuestLayout() {
  const location = useLocation();

  return (
    <div className={styles.frame}>
      <header className={styles.header}>
        <p className={styles.brand}>Broker</p>
        <ThemeToggle />
      </header>
      <main>
        <ErrorBoundary
          FallbackComponent={GuestErrorFallback}
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
