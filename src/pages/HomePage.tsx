import { Link, useNavigate } from "react-router-dom";
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

export function HomePage() {
  const navigate = useNavigate();
  const casesQuery = useCaseListQuery();
  const createCaseMutation = useCreateCaseMutation();

  const cases = casesQuery.data ?? [];
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
          <EmptyState title="No cases for this brokerage yet.">
            Create a new case to get started.
          </EmptyState>
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
