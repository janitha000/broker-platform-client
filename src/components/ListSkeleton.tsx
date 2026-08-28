import styles from "./ListSkeleton.module.css";

export function ListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className={styles.list} aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className={styles.row} />
      ))}
    </div>
  );
}
