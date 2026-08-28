import { Alert } from "./Alert";
import { Button } from "./Button";
import styles from "./QueryError.module.css";

export function QueryError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className={styles.wrap}>
      <Alert>{message}</Alert>
      <Button type="button" variant="secondary" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}
