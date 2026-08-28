import { Link, useNavigate } from "react-router-dom";
import { ApiError } from "../api/http";
import { useAuth } from "../auth/AuthContext";
import { Alert } from "../components/Alert";
import { Button } from "../components/Button";
import { Form } from "../components/Form";
import { Page } from "../components/Page";
import { TextField } from "../components/TextField";
import { useCaseListQuery, useCreateCaseMutation } from "../hooks/useCases";
import styles from "./HomePage.module.css";
import { EmptyState } from "../components/EmptyState";
import { ListSkeleton } from "../components/ListSkeleton";
import { QueryError } from "../components/QueryError";

export function HomePage() {
  const { user, signOut } = useAuth();
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
    <Page title="Broker">
      <p>Signed in as {user?.email}</p>

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

      <h2 className={styles.heading}>
        Cases
        {casesQuery.isFetching && !casesQuery.isPending ? (
          <span className={styles.updating}> Updating…</span>
        ) : null}
      </h2>
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

      <Button variant="secondary" onClick={() => void signOut()}>
        Sign out
      </Button>
    </Page>
  );
}
