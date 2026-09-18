import { type FormEvent } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { ApiError } from "../api/http";
import { AUDIT_ACTION_LABELS } from "../audit/auditLabels";
import { useAuth } from "../auth/useAuth";
import { AuditTimeline } from "../components/AuditTimeline";
import { Button } from "../components/Button";
import { Form } from "../components/Form";
import { ListSkeleton } from "../components/ListSkeleton";
import { QueryError } from "../components/QueryError";
import { TextField } from "../components/TextField";
import { useAuditEventsQuery } from "../hooks/useAuditEvents";
import type { AuditListFilters } from "../api/queryKeys";
import screen from "../layouts/app/appScreen.module.css";
import styles from "./AuditPage.module.css";

function isoToDatetimeLocal(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function datetimeLocalToIso(value: string): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

function readFilters(params: URLSearchParams): AuditListFilters {
  return {
    caseId: params.get("caseId") || undefined,
    action: params.get("action") || undefined,
    outcome: params.get("outcome") || undefined,
    from: params.get("from") || undefined,
    to: params.get("to") || undefined,
    take: 50,
  };
}

export function AuditPage() {
  const { canReadAudit } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = readFilters(searchParams);
  const auditQuery = useAuditEventsQuery(filters);

  if (!canReadAudit) {
    return <Navigate to="/cases" replace />;
  }

  const forbidden =
    auditQuery.error instanceof ApiError && auditQuery.error.status === 403;
  const loadError =
    auditQuery.isError &&
    !forbidden &&
    !(auditQuery.error instanceof ApiError && auditQuery.error.status === 401)
      ? "Could not load audit events. Is Audit reachable?"
      : null;

  function onApply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const next = new URLSearchParams();
    const caseId = String(form.get("caseId") ?? "").trim();
    const action = String(form.get("action") ?? "").trim();
    const outcome = String(form.get("outcome") ?? "").trim();
    const from = datetimeLocalToIso(String(form.get("from") ?? ""));
    const to = datetimeLocalToIso(String(form.get("to") ?? ""));
    if (caseId) next.set("caseId", caseId);
    if (action) next.set("action", action);
    if (outcome) next.set("outcome", outcome);
    if (from) next.set("from", from);
    if (to) next.set("to", to);
    setSearchParams(next, { replace: true });
  }

  return (
    <>
      <h1 className={screen.title}>Audit</h1>
      <p className={styles.lead}>Tenant access and change log. Newest first.</p>

      <Form key={searchParams.toString()} onSubmit={onApply}>
        <TextField
          label="Case id"
          name="caseId"
          defaultValue={filters.caseId ?? ""}
        />
        <label className={styles.field}>
          <span>Action</span>
          <select name="action" defaultValue={filters.action ?? ""}>
            <option value="">All actions</option>
            {Object.entries(AUDIT_ACTION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          <span>Outcome</span>
          <select name="outcome" defaultValue={filters.outcome ?? ""}>
            <option value="">All outcomes</option>
            <option value="allow">Allowed</option>
            <option value="deny">Denied</option>
          </select>
        </label>
        <TextField
          label="From"
          name="from"
          type="datetime-local"
          defaultValue={isoToDatetimeLocal(filters.from ?? null)}
        />
        <TextField
          label="To"
          name="to"
          type="datetime-local"
          defaultValue={isoToDatetimeLocal(filters.to ?? null)}
        />
        <Button type="submit">Apply filters</Button>
      </Form>

      <div className={styles.results}>
        {auditQuery.isPending ? (
          <ListSkeleton rows={5} />
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
          <AuditTimeline items={auditQuery.data?.items ?? []} />
        )}
      </div>
    </>
  );
}
