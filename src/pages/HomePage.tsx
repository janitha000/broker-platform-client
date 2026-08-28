import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError } from "../api/http";
import { createCase, listCases, type CaseListItem } from "../api/origination";
import { useAuth } from "../auth/AuthContext";
import { Alert } from "../components/Alert";
import { Button } from "../components/Button";
import { Form } from "../components/Form";
import { Page } from "../components/Page";
import { TextField } from "../components/TextField";
import styles from "./HomePage.module.css";

export function HomePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [cases, setCases] = useState<CaseListItem[]>([]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const result = await listCases(user!.accessToken);
        if (!cancelled) {
          setCases(result.cases);
          setError(null);
        }
      } catch (caught) {
        if (cancelled) return;
        if (caught instanceof ApiError && caught.status === 401) {
          signOut();
          return;
        }
        setError("Could not load cases. Is Origination reachable?");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [user, signOut]);

  async function onCreate(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      const created = await createCase(user!.accessToken, notes);
      navigate(`/cases/${created.caseId}`);
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 401) {
        signOut();
        return;
      }
      setError("Could not create a case. Is Origination reachable?");
    } finally {
      setPending(false);
    }
  }

  return (
    <Page title="Broker">
      <p>Signed in as {user?.email}</p>

      <Form onSubmit={onCreate}>
        <TextField
          label="New inquiry"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <Button type="submit" disabled={pending}>
          {pending ? "Creating…" : "Create case"}
        </Button>
      </Form>

      {error ? <Alert>{error}</Alert> : null}

      <h2 className={styles.heading}>Cases</h2>
      {loading ? (
        <p>Loading…</p>
      ) : cases.length === 0 ? (
        <p>No cases for this brokerage yet.</p>
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

      <Button variant="secondary" onClick={signOut}>
        Sign out
      </Button>
    </Page>
  );
}
