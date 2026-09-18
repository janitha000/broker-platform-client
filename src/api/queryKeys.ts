export const caseKeys = {
  all: ["cases"] as const,
  list: () => [...caseKeys.all, "list"] as const,
  detail: (caseId: string) => [...caseKeys.all, "detail", caseId] as const,
};

export const documentKeys = {
  all: ["documents"] as const,
  byCase: (caseId: string) => [...documentKeys.all, "case", caseId] as const,
};

export type AuditListFilters = {
  from?: string;
  to?: string;
  caseId?: string;
  action?: string;
  outcome?: string;
  take?: number;
};

export function compactAuditFilters(filters: AuditListFilters): AuditListFilters {
  return {
    ...(filters.from ? { from: filters.from } : {}),
    ...(filters.to ? { to: filters.to } : {}),
    ...(filters.caseId ? { caseId: filters.caseId } : {}),
    ...(filters.action ? { action: filters.action } : {}),
    ...(filters.outcome ? { outcome: filters.outcome } : {}),
    ...(filters.take != null ? { take: filters.take } : {}),
  };
}

export const auditKeys = {
  all: ["audit"] as const,
  list: (filters: AuditListFilters) =>
    [...auditKeys.all, "list", compactAuditFilters(filters)] as const,
};
