import { EmptyState } from "../../components/EmptyState";
import type { CaseListItem } from "../../api/origination";
import type { PipelineColumn } from "../pipeline";
import { BoardCard } from "./BoardCard";
import styles from "./BoardColumn.module.css";

type BoardColumnProps = {
  column: PipelineColumn;
  cases: CaseListItem[];
};

export function BoardColumn({ column, cases }: BoardColumnProps) {
  const countLabel = cases.length === 1 ? "1 case" : `${cases.length} cases`;

  return (
    <section className={styles.column} role="listitem">
      <h2 className={styles.heading}>
        {column.label}, {countLabel}
      </h2>
      <div className={styles.body}>
        {cases.length === 0 ? (
          <EmptyState title={column.emptyTitle}>{column.emptyBody}</EmptyState>
        ) : (
          <ul className={styles.list}>
            {cases.map((item) => (
              <li key={item.caseId}>
                <BoardCard item={item} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
