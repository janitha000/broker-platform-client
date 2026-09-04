import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ApiError } from "../../api/http";
import { useAuth } from "../../auth/useAuth";
import { Alert } from "../../components/Alert";
import { Button } from "../../components/Button";
import { Form } from "../../components/Form";
import { TextField } from "../../components/TextField";
import styles from "../../layouts/public/guestScreen.module.css";

export function RegisterPage() {
  const { user, ready, register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
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
      await register({ name, email, password });
      navigate("/", { replace: true });
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 409) {
        setError("That email is already registered.");
      } else {
        setError("Could not register. Is Identity running?");
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <h1 className={styles.title}>Register brokerage</h1>
      <Form onSubmit={onSubmit}>
        <TextField
          label="Brokerage name"
          type="text"
          autoComplete="organization"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
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
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error ? <Alert>{error}</Alert> : null}
        <Button type="submit" disabled={pending}>
          {pending ? "Registering…" : "Register"}
        </Button>
      </Form>
      <p>
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </>
  );
}
