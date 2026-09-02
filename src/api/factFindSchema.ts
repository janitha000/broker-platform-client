import { z } from "zod";

const money = z
  .string()
  .trim()
  .min(1, "Enter an amount.")
  .refine(
    (value) => /^\d+(\.\d{1,2})?$/.test(value),
    "Use a number with up to 2 decimal places.",
  )
  .transform((value) => Number(value))
  .refine(
    (value) => Number.isFinite(value) && value >= 0,
    "Amount cannot be negative.",
  );

export const factFindSchema = z.object({
  objectives: z.string().trim().min(1, "Enter objectives."),
  income: money,
  expenses: money,
  assets: money,
  debts: money,
});

export type FactFindPayload = z.output<typeof factFindSchema>;

export function parseFactFindForm(data: FormData) {
  return factFindSchema.safeParse({
    objectives: String(data.get("objectives") ?? ""),
    income: String(data.get("income") ?? ""),
    expenses: String(data.get("expenses") ?? ""),
    assets: String(data.get("assets") ?? ""),
    debts: String(data.get("debts") ?? ""),
  });
}

export function fieldErrorsFromZod(
  error: z.ZodError,
): Partial<Record<keyof FactFindPayload, string>> {
  const errors: Partial<Record<keyof FactFindPayload, string>> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (
      typeof key === "string" &&
      errors[key as keyof FactFindPayload] === undefined
    ) {
      errors[key as keyof FactFindPayload] = issue.message;
    }
  }
  return errors;
}
