import { Link, Navigate } from "react-router-dom";
import { beginLogin } from "../../api/identity";
import { useAuth } from "../../auth/useAuth";
import { Button } from "../../components/Button";
import styles from "../../layouts/public/guestScreen.module.css";

export function LoginPage() {
  const { user, ready } = useAuth();

  if (!ready) {
    return null;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <h1 className={styles.title}>Sign in</h1>
      <Button type="button" onClick={() => beginLogin()}>
        Sign in
      </Button>
      <p>
        New brokerage? <Link to="/register">Register</Link>
      </p>
    </>
  );
}
