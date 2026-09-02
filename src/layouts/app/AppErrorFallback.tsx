import type { FallbackProps } from "react-error-boundary";
import { Link } from "react-router-dom";
import { Button } from "../../components/Button";
import styles from "./appScreen.module.css";

export function AppErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const message = error instanceof Error ? error.message : "Unknown error";

  return (
    <>
      <h1 className={styles.title}>Something went wrong</h1>
      <p>This screen failed to render. Your session is still here.</p>
      {import.meta.env.DEV ? <p>{message}</p> : null}
      <Button type="button" onClick={resetErrorBoundary}>
        Try again
      </Button>
      <p>
        <Link to="/cases">All cases</Link>
      </p>
    </>
  );
}
