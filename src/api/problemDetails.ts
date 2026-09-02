import type { FactFindPayload } from "./factFindSchema";

const FACT_FIND_FIELDS = [
  "objectives",
  "income",
  "expenses",
  "assets",
  "debts",
] as const satisfies ReadonlyArray<keyof FactFindPayload>;

function normalizeFieldName(raw: string): string {
  const segment = raw.includes(".") ? (raw.split(".").pop() ?? raw) : raw;
  if (segment.length === 0) {
    return segment;
  }
  return segment.charAt(0).toLowerCase() + segment.slice(1);
}

export function fieldErrorsFromProblem(
  errors: Readonly<Record<string, string>>,
): Partial<Record<keyof FactFindPayload, string>> {
  const mapped: Partial<Record<keyof FactFindPayload, string>> = {};

  for (const [rawKey, message] of Object.entries(errors)) {
    const key = normalizeFieldName(rawKey);
    if (
      (FACT_FIND_FIELDS as readonly string[]).includes(key) &&
      mapped[key as keyof FactFindPayload] === undefined
    ) {
      mapped[key as keyof FactFindPayload] = message;
    }
  }

  return mapped;
}
