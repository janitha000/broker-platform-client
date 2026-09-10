import { ApiError } from "../api/http";
import { ListSkeleton } from "../components/ListSkeleton";
import { QueryError } from "../components/QueryError";
import { useCaseBoardQuery } from "../hooks/useCases";
import screen from "../layouts/app/appScreen.module.css";
import { CaseBoard } from "./board/CaseBoard";
import styles from "./BoardPage.module.css";

export function BoardPage() {
  const { query, columns } = useCaseBoardQuery();

  const listError =
    query.isError &&
    !(query.error instanceof ApiError && query.error.status === 401)
      ? "Could not load cases. Is Origination reachable?"
      : null;

  return (
    <>
      <h1 className={screen.title}>
        Board
        {query.isFetching && !query.isPending ? (
          <span className={styles.updating}> Updating…</span>
        ) : null}
      </h1>

      {query.isPending ? (
        <ListSkeleton rows={5} />
      ) : listError ? (
        <QueryError
          message={listError}
          onRetry={() => {
            void query.refetch();
          }}
        />
      ) : (
        <CaseBoard
          columns={columns}
          isUpdating={query.isFetching && !query.isPending}
        />
      )}
    </>
  );
}
