import { Link } from "react-router-dom";
import type { CaseListItem } from "../../api/origination";
import { PIPELINE_COLUMNS } from "../pipeline";
import styles from "./BoardCard.module.css";

type BoardCardProps = {
  item: CaseListItem;
};

export function BoardCard({ item }: BoardCardProps) {
  const statusLabel =
    PIPELINE_COLUMNS.find((column) => column.status === item.status)?.label ??
    item.status;
  const notes = item.inquiryNotes.trim() || "No notes";

  return (
    <Link className={styles.card} to={`/cases/${item.caseId}`}>
      <span className={styles.notes}>{notes}</span>
      <span className={styles.status}>{statusLabel}</span>
    </Link>
  );
}
