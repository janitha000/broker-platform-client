import { Link } from "react-router-dom";
import type { AuditEventItem } from "../api/audit";
import {
  auditActionLabel,
  auditActorLabel,
  auditOutcomeLabel,
} from "../audit/auditLabels";
import { formatDateTime } from "../helpers/date";
import { EmptyState } from "./EmptyState";
import styles from "./AuditTimeline.module.css";

export function AuditTimeline({
  items,
  showCaseLink = true,
}: {
  items: AuditEventItem[];
  showCaseLink?: boolean;
}) {
  if (items.length === 0) {
    return <EmptyState title="No audit events for this filter." />;
  }

  return (
    <ol className={styles.list}>
      {items.map((item) => (
        <li
          key={item.eventId}
          className={item.outcome === "deny" ? styles.deny : styles.item}
        >
          <p className={styles.when}>{formatDateTime(item.occurredAt)}</p>
          <p className={styles.action}>{auditActionLabel(item.action)}</p>
          <p className={styles.meta}>
            <span>{auditOutcomeLabel(item.outcome)}</span>
            <span>{auditActorLabel(item.actorType, item.brokerId)}</span>
            {showCaseLink && item.caseId ? (
              <Link to={`/cases/${item.caseId}`}>Case</Link>
            ) : null}
          </p>
          {item.dataJson ? (
            <details className={styles.details}>
              <summary>Details</summary>
              <pre>{item.dataJson}</pre>
            </details>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
