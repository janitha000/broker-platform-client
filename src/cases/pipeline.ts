import type { CaseStatus } from "../api/origination";

export type PipelineColumn = {
  status: CaseStatus;
  label: string;
  emptyTitle: string;
  emptyBody: string;
};

export const PIPELINE_COLUMNS: PipelineColumn[] = [
  {
    status: "Enquiry",
    label: "Enquiry",
    emptyTitle: "No enquiries.",
    emptyBody: "Create a case from the list view.",
  },
  {
    status: "FactFindCompleted",
    label: "Fact find",
    emptyTitle: "No fact finds.",
    emptyBody: "Complete a fact-find on a case.",
  },
  {
    status: "Recommendation",
    label: "Recommendation",
    emptyTitle: "No recommendations.",
    emptyBody: "Present a recommendation after fact-find.",
  },
  {
    status: "Lodged",
    label: "Lodged",
    emptyTitle: "No lodged cases.",
    emptyBody: "Lodge an application with a lender.",
  },
  {
    status: "ConditionalApproval",
    label: "Conditional approval",
    emptyTitle: "No conditional approvals.",
    emptyBody: "Move a lodged case when the lender issues AIP/conditional approval.",
  },
  {
    status: "FormalApproval",
    label: "Formal approval",
    emptyTitle: "No formal approvals.",
    emptyBody: "Move a case when the lender issues formal (unconditional) approval.",
  },
  {
    status: "Settled",
    label: "Settled",
    emptyTitle: "No settled cases.",
    emptyBody: "Move a case when settlement has occurred.",
  },
  {
    status: "NotProceeded",
    label: "Not proceeded",
    emptyTitle: "No NPW cases.",
    emptyBody: "Move a case that was lost, declined, or withdrawn.",
  },
];

/**
 * Enquiry → Fact find is never a drop (needs the form).
 * Later edges match a typical AU broker board; commands come later.
 * Not proceeded is reachable from any live stage.
 */
export const ALLOWED_TRANSITIONS: Record<CaseStatus, CaseStatus[]> = {
  Enquiry: [],
  FactFindCompleted: ["Recommendation", "NotProceeded"],
  Recommendation: ["Lodged", "NotProceeded"],
  Lodged: ["ConditionalApproval", "NotProceeded"],
  ConditionalApproval: ["FormalApproval", "NotProceeded"],
  FormalApproval: ["Settled", "NotProceeded"],
  Settled: [],
  NotProceeded: [],
};

export function canTransition(from: CaseStatus, to: CaseStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}
