import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { ApiError } from "../api/http";
import { completeFactFind, getCase, type CaseDetail } from "../api/origination";
import { useAuth } from "../auth/AuthContext";
import { Alert } from "../components/Alert";
import { Button } from "../components/Button";
import { Form } from "../components/Form";
import { Page } from "../components/Page";
import { TextField } from "../components/TextField";
import styles from "./CasePage.module.css";

export function CasePage() {
  const { caseId } = useParams();
  const { user, signOut } = useAuth();
  const [caseItem, setCaseItem] = useState<CaseDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setCaseItem(null);

    if (!caseId || !user?.accessToken) {
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    const token = user.accessToken;
    const id = caseId;

    async function load() {
      try {
        const result = await getCase(token, id);
        if (!cancelled) {
          setCaseItem(result);
        }
      } catch (caught) {
        if (cancelled) return;
        if (caught instanceof ApiError && caught.status === 401) {
          signOut();
          return;
        }
        if (caught instanceof ApiError && caught.status === 404) {
          setError("This case was not found for your brokerage.");
          return;
        }
        setError("Could not load this case. Is Origination reachable?");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [caseId, user, signOut]);

  async function onCompleteFactFind(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!caseId || !user) return;
    const data = new FormData(event.currentTarget);
    setError(null);
    setPending(true);
    try {
      await completeFactFind(user.accessToken, caseId, {
        objectives: String(data.get("objectives") ?? ""),
        income: Number(data.get("income")),
        expenses: Number(data.get("expenses")),
        assets: Number(data.get("assets")),
        debts: Number(data.get("debts")),
      });
      const updated = await getCase(user.accessToken, caseId);
      setCaseItem(updated);
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 401) {
        signOut();
        return;
      }
      setError("Could not save the fact-find.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Page title="Case">
      {loading ? (
        <p>Loading…</p>
      ) : error ? (
        <Alert>{error}</Alert>
      ) : caseItem ? (
        <>
          <span className={styles.status}>{caseItem.status}</span>
          <p className={styles.notes}>{caseItem.inquiryNotes.trim() || "No inquiry notes."}</p>

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
              <Button type="submit" disabled={pending}>
                {pending ? "Saving…" : "Complete fact-find"}
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
              <dd>{new Date(caseItem.factFind.completedAt).toLocaleString()}</dd>
            </dl>
          ) : null}
        </>
      ) : null}

      <Link className={styles.back} to="/">
        All cases
      </Link>
    </Page>
  );
}
