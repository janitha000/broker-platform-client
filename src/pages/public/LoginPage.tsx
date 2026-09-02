import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ApiError } from "../../api/http";
import { useAuth } from "../../auth/AuthContext";
import { Alert } from "../../components/Alert";
import { Button } from "../../components/Button";
import { Form } from "../../components/Form";
import styles from "../../layouts/public/guestScreen.module.css";
import { TextField } from "../../components/TextField";

export function LoginPage() {
  const { user, ready, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (!ready) {
    return null;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      await signIn(email, password);
      navigate("/", { replace: true });
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 401) {
        setError("Email or password is wrong.");
      } else {
        setError("Could not sign in. Is Identity running?");
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <h1 className={styles.title}>Sign in</h1>
      <Form onSubmit={onSubmit}>
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error ? <Alert>{error}</Alert> : null}
        <Button type="submit" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </Form>
      <p>
        New brokerage? <Link to="/register">Register</Link>
      </p>
    </>
  );
}
