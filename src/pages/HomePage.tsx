import { useAuth } from "../auth/AuthContext";
import { Button } from "../components/Button";
import { Page } from "../components/Page";

export function HomePage() {
  const { user, signOut } = useAuth();

  return (
    <Page title="Broker">
      <p>Signed in as {user?.email}</p>
      <Button variant="secondary" onClick={signOut}>
        Sign out
      </Button>
    </Page>
  );
}
