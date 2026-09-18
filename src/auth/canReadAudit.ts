import type { AuthUser } from "../api/identity";

export function canReadAudit(user: AuthUser | null | undefined): boolean {
  if (!user) return false;
  if (user.permissions?.includes("audit:read")) return true;
  return user.role?.toLowerCase() === "principal";
}
