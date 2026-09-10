import type { CaseListItem, CaseStatus } from "../../api/origination";
import { PIPELINE_COLUMNS } from "../pipeline";
import { BoardColumn } from "./BoardColumn";
import styles from "./CaseBoard.module.css";

type CaseBoardProps = {
  columns: Map<CaseStatus, CaseListItem[]>;
  isUpdating: boolean;
};

export function CaseBoard({ columns, isUpdating }: CaseBoardProps) {
  return (
    <div
      className={styles.board}
      role="list"
      aria-label="Case pipeline"
      aria-busy={isUpdating || undefined}
    >
      {PIPELINE_COLUMNS.map((column) => (
        <BoardColumn
          key={column.status}
          column={column}
          cases={columns.get(column.status) ?? []}
        />
      ))}
    </div>
  );
}
