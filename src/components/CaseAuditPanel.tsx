import { Link } from "react-router-dom";
import { ApiError } from "../api/http";
import { useAuth } from "../auth/useAuth";
import { useAuditEventsQuery } from "../hooks/useAuditEvents";
import { AuditTimeline } from "./AuditTimeline";
import { ListSkeleton } from "./ListSkeleton";
import { QueryError } from "./QueryError";
import styles from "./CaseDocumentsPanel.module.css";

export function CaseAuditPanel({ caseId }: { caseId: string }) {
  const { canReadAudit } = useAuth();
  const auditQuery = useAuditEventsQuery({ caseId, take: 50 });

  if (!canReadAudit) {
    return null;
  }

  const forbidden =
    auditQuery.error instanceof ApiError && auditQuery.error.status === 403;
  const loadError =
    auditQuery.isError &&
    !forbidden &&
    !(auditQuery.error instanceof ApiError && auditQuery.error.status === 401)
      ? "Could not load this case’s audit events. Is Audit reachable?"
      : null;

  return (
    <section className={styles.section} aria-labelledby="audit-title">
      <div className={styles.heading}>
        <div>
          <h2 id="audit-title">Audit</h2>
          <p>Who opened or changed this case.</p>
        </div>
        <Link to={`/audit?caseId=${encodeURIComponent(caseId)}`}>
          Open in Audit
        </Link>
      </div>

      {auditQuery.isPending ? (
        <ListSkeleton rows={3} />
      ) : forbidden ? (
        <QueryError
          message="You do not have permission to read audit events."
          onRetry={() => {
            void auditQuery.refetch();
          }}
        />
      ) : loadError ? (
        <QueryError
          message={loadError}
          onRetry={() => {
            void auditQuery.refetch();
          }}
        />
      ) : (
        <AuditTimeline
          items={auditQuery.data?.items ?? []}
          showCaseLink={false}
        />
      )}
    </section>
  );
}
