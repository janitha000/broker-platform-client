import { Link } from "react-router-dom";
import type { FallbackProps } from "react-error-boundary";
import { Button } from "./Button";
import { Page } from "./Page";

export function RouteErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const message = error instanceof Error ? error.message : "Unknown error";

  return (
    <Page title="Something went wrong">
      <p>This screen failed to render. Your session is still here.</p>
      {import.meta.env.DEV ? <p>{message}</p> : null}
      <Button type="button" onClick={resetErrorBoundary}>
        Try again
      </Button>
      <p>
        <Link to="/">All cases</Link>
      </p>
    </Page>
  );
}
