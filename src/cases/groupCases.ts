import type { CaseListItem, CaseStatus } from "../api/origination";
import { PIPELINE_COLUMNS } from "./pipeline";

export function groupCasesByStatus(
  cases: CaseListItem[],
): Map<CaseStatus, CaseListItem[]> {
  const columns = new Map<CaseStatus, CaseListItem[]>();

  for (const column of PIPELINE_COLUMNS) {
    columns.set(column.status, []);
  }

  for (const item of cases) {
    columns.get(item.status)?.push(item);
  }

  return columns;
}
