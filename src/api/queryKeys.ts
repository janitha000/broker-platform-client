export const caseKeys = {
  all: ["cases"] as const,
  list: () => [...caseKeys.all, "list"] as const,
  detail: (caseId: string) => [...caseKeys.all, "detail", caseId] as const,
};
