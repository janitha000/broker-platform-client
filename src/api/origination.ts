/**
 * Origination API only. Maps to CasesController:
 *   POST /cases
 *   GET  /cases
 *   GET  /cases/{caseId}
 *   PUT  /cases/{caseId}/fact-find
 *
 * Every call needs the JWT from Identity (token).
 */

import { request } from "./http";

const originationUrl =
  import.meta.env.VITE_ORIGINATION_API_URL ?? "http://localhost:5135";

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

export function listCases(token: string): Promise<CaseList> {
  return request<CaseList>(originationUrl, "/cases", {
    method: "GET",
    token,
  });
}

export function createCase(token: string, inquiryNotes: string): Promise<CaseSummary> {
  return request<CaseSummary>(originationUrl, "/cases", {
    method: "POST",
    token,
    body: { inquiryNotes },
  });
}

export function getCase(token: string, caseId: string): Promise<CaseDetail> {
  return request<CaseDetail>(originationUrl, `/cases/${caseId}`, {
    method: "GET",
    token,
  });
}

export function completeFactFind(
  token: string,
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
    token,
    body: factFind,
  });
}
