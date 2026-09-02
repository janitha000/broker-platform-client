import { ApiError } from "../api/http";
import { Alert } from "../components/Alert";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { Form } from "../components/Form";
import { ListSkeleton } from "../components/ListSkeleton";
import { QueryError } from "../components/QueryError";
import { TextField } from "../components/TextField";
import { useCaseListQuery, useCreateCaseMutation } from "../hooks/useCases";
import screen from "../layouts/app/appScreen.module.css";
import styles from "./HomePage.module.css";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { parseCaseStatusParam, type CaseStatus } from "../api/origination";

const STATUS_FILTERS: { label: string; status?: CaseStatus }[] = [
  { label: "All" },
  { label: "Inquiry", status: "Inquiry" },
  { label: "Fact-find completed", status: "FactFindCompleted" },
];

function emptyListCopy(status?: CaseStatus): { title: string; body: string } {
  if (status === "Inquiry") {
    return {
      title: "No inquiry cases.",
      body: "Create a new case, or choose All.",
    };
  }
  if (status === "FactFindCompleted") {
    return {
      title: "No fact-find completed cases.",
      body: "Complete a fact-find, or choose All.",
    };
  }
  return {
    title: "No cases for this brokerage yet.",
    body: "Create a new case to get started.",
  };
}

export function HomePage() {
  const navigate = useNavigate();
  const casesQuery = useCaseListQuery();
  const createCaseMutation = useCreateCaseMutation();

  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = parseCaseStatusParam(searchParams.get("status"));

  const cases = statusFilter
    ? (casesQuery.data ?? []).filter((item) => item.status === statusFilter)
    : (casesQuery.data ?? []);

  const listError =
    casesQuery.isError &&
    !(casesQuery.error instanceof ApiError && casesQuery.error.status === 401)
      ? "Could not load cases. Is Origination reachable?"
      : null;
  const createError =
    createCaseMutation.isError &&
    !(
      createCaseMutation.error instanceof ApiError &&
      createCaseMutation.error.status === 401
    )
      ? "Could not create a case. Is Origination reachable?"
      : null;

  function setStatusFilter(next?: CaseStatus) {
    setSearchParams(
      (current) => {
        const params = new URLSearchParams(current);
        if (next) {
          params.set("status", next);
        } else {
          params.delete("status");
        }
        return params;
      },
      { replace: true },
    );
  }

  const empty = emptyListCopy(statusFilter);

  return (
    <>
      <h1 className={screen.title}>
        Cases
        {casesQuery.isFetching && !casesQuery.isPending ? (
          <span className={styles.updating}> Updating…</span>
        ) : null}
      </h1>

      <Form
        onSubmit={(event) => {
          event.preventDefault();
          const notes = String(
            new FormData(event.currentTarget).get("inquiryNotes") ?? "",
          );
          createCaseMutation.mutate(notes, {
            onSuccess: (created) => navigate(`/cases/${created.caseId}`),
          });
        }}
      >
        <TextField label="New inquiry" name="inquiryNotes" />
        <Button type="submit" disabled={createCaseMutation.isPending}>
          {createCaseMutation.isPending ? "Creating…" : "Create case"}
        </Button>
      </Form>

      {createError ? <Alert>{createError}</Alert> : null}

      <nav className={styles.filters} aria-label="Filter cases">
        {STATUS_FILTERS.map((item) => {
          const isCurrent = item.status === statusFilter;
          return (
            <button
              key={item.label}
              type="button"
              className={isCurrent ? styles.filterCurrent : styles.filter}
              aria-current={isCurrent ? "true" : undefined}
              onClick={() => setStatusFilter(item.status)}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className={styles.results}>
        {casesQuery.isPending ? (
          <ListSkeleton rows={5} />
        ) : listError ? (
          <QueryError
            message={listError}
            onRetry={() => {
              void casesQuery.refetch();
            }}
          />
        ) : cases.length === 0 ? (
          <EmptyState title={empty.title}>{empty.body}</EmptyState>
        ) : (
          <ul className={styles.list}>
            {cases.map((item) => (
              <li key={item.caseId}>
                <Link className={styles.item} to={`/cases/${item.caseId}`}>
                  <span className={styles.status}>{item.status}</span>
                  <span>{item.inquiryNotes.trim() || "No notes"}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
