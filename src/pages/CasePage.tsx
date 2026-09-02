import { type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { ApiError } from "../api/http";
import { Alert } from "../components/Alert";
import { Button } from "../components/Button";
import { Form } from "../components/Form";
import { TextField } from "../components/TextField";
import { useCaseQuery, useCompleteFactFindMutation } from "../hooks/useCases";
import screen from "../layouts/app/appScreen.module.css";
import styles from "./CasePage.module.css";
import { ListSkeleton } from "../components/ListSkeleton";
import { QueryError } from "../components/QueryError";

export function CasePage() {
  const { caseId } = useParams();
  const caseQuery = useCaseQuery(caseId);
  const factFindMutation = useCompleteFactFindMutation(caseId ?? "");

  const caseItem = caseQuery.data;
  const queryError = caseQuery.error;
  const mutationError = factFindMutation.error;
  const loadError =
    queryError instanceof ApiError && queryError.status === 404
      ? "This case was not found for your brokerage."
      : caseQuery.isError &&
          !(queryError instanceof ApiError && queryError.status === 401)
        ? "Could not load this case. Is Origination reachable?"
        : null;
  const saveError =
    factFindMutation.isError &&
    !(mutationError instanceof ApiError && mutationError.status === 401)
      ? "Could not save the fact-find."
      : null;

  function onCompleteFactFind(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!caseId) return;
    const data = new FormData(event.currentTarget);
    factFindMutation.mutate({
      objectives: String(data.get("objectives") ?? ""),
      income: Number(data.get("income")),
      expenses: Number(data.get("expenses")),
      assets: Number(data.get("assets")),
      debts: Number(data.get("debts")),
    });
  }

  return (
    <>
      <h1 className={screen.title}>Case</h1>
      {caseQuery.isPending ? (
        <ListSkeleton rows={3} />
      ) : loadError ? (
        <QueryError
          message={loadError}
          onRetry={() => {
            void caseQuery.refetch();
          }}
        />
      ) : caseItem ? (
        <>
          <span className={styles.status}>
            {caseItem.status}
            {caseQuery.isFetching && !caseQuery.isPending ? (
              <span className={styles.updating}> Updating…</span>
            ) : null}
          </span>
          <p className={styles.notes}>
            {caseItem.inquiryNotes.trim() || "No inquiry notes."}
          </p>
          {saveError ? <Alert>{saveError}</Alert> : null}

          {caseItem.status === "Inquiry" ? (
            <Form onSubmit={onCompleteFactFind}>
              <TextField label="Objectives" name="objectives" required />
              <TextField
                label="Income"
                name="income"
                type="number"
                min={0}
                step="0.01"
                required
              />
              <TextField
                label="Expenses"
                name="expenses"
                type="number"
                min={0}
                step="0.01"
                required
              />
              <TextField
                label="Assets"
                name="assets"
                type="number"
                min={0}
                step="0.01"
                required
              />
              <TextField
                label="Debts"
                name="debts"
                type="number"
                min={0}
                step="0.01"
                required
              />
              <Button type="submit" disabled={factFindMutation.isPending}>
                {factFindMutation.isPending ? "Saving…" : "Complete fact-find"}
              </Button>
            </Form>
          ) : caseItem.factFind ? (
            <dl className={styles.facts}>
              <dt>Objectives</dt>
              <dd>{caseItem.factFind.objectives}</dd>
              <dt>Income</dt>
              <dd>{caseItem.factFind.income}</dd>
              <dt>Expenses</dt>
              <dd>{caseItem.factFind.expenses}</dd>
              <dt>Assets</dt>
              <dd>{caseItem.factFind.assets}</dd>
              <dt>Debts</dt>
              <dd>{caseItem.factFind.debts}</dd>
              <dt>Completed</dt>
              <dd>
                {new Date(caseItem.factFind.completedAt).toLocaleString()}
              </dd>
            </dl>
          ) : null}
        </>
      ) : null}

      <Link className={styles.back} to="/cases">
        All cases
      </Link>
    </>
  );
}
