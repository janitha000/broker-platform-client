import type { CaseStatus } from "../api/origination";

export type PipelineColumn = {
  status: CaseStatus;
  label: string;
  emptyTitle: string;
  emptyBody: string;
};

export const PIPELINE_COLUMNS: PipelineColumn[] = [
  {
    status: "Inquiry",
    label: "Inquiry",
    emptyTitle: "No inquiry cases.",
    emptyBody: "Create a case from the list view.",
  },
  {
    status: "FactFindCompleted",
    label: "Fact-find completed",
    emptyTitle: "No fact-find completed cases.",
    emptyBody: "Complete a fact-find on a case.",
  },
];

/** Future DnD: Inquiry → FactFindCompleted is false (needs the form). */
export const ALLOWED_TRANSITIONS: Record<CaseStatus, CaseStatus[]> = {
  Inquiry: [],
  FactFindCompleted: [],
};
