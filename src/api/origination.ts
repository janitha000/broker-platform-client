/**
 * Origination API only. Maps to CasesController:
 *   POST /cases
 *   GET  /cases
 *   GET  /cases/{caseId}
 *   PUT  /cases/{caseId}/fact-find
 *
 * Cookie auth: the browser sends broker.access; do not pass a JWT.
 */

import { request } from "./http";

const originationUrl = import.meta.env.VITE_ORIGINATION_API_URL ?? "";

export type CaseStatus = "Inquiry" | "FactFindCompleted";

export type FactFind = {
  objectives: string;
  income: number;
  expenses: number;
  assets: number;
  debts: number;
  completedAt: string;
};

export type CaseSummary = {
  caseId: string;
  status: CaseStatus;
};

export type CaseListItem = CaseSummary & {
  inquiryNotes: string;
};

export type CaseList = {
  cases: CaseListItem[];
};

export type CaseDetail = CaseSummary & {
  inquiryNotes: string;
  factFind: FactFind | null;
};

export function listCases(): Promise<CaseList> {
  return request<CaseList>(originationUrl, "/cases", {
    method: "GET",
  });
}

export function createCase(inquiryNotes: string): Promise<CaseSummary> {
  return request<CaseSummary>(originationUrl, "/cases", {
    method: "POST",
    body: { inquiryNotes },
  });
}

export function getCase(caseId: string): Promise<CaseDetail> {
  return request<CaseDetail>(originationUrl, `/cases/${caseId}`, {
    method: "GET",
  });
}

export function completeFactFind(
  caseId: string,
  factFind: {
    objectives: string;
    income: number;
    expenses: number;
    assets: number;
    debts: number;
  },
): Promise<CaseSummary> {
  return request<CaseSummary>(originationUrl, `/cases/${caseId}/fact-find`, {
    method: "PUT",
    body: factFind,
  });
}

export function parseCaseStatusParam(
  value: string | null,
): CaseStatus | undefined {
  if (value === "Inquiry" || value === "FactFindCompleted") {
    return value;
  }
  return undefined;
}
