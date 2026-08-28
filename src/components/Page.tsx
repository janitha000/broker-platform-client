import type { ReactNode } from "react";
import styles from "./Page.module.css";
import { ThemeToggle } from "./ThemeToggle";

export function Page({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        <ThemeToggle />
      </header>
      {children}
    </main>
  );
}
