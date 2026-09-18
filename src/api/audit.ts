/**
 * Audit API. Cookie holds the JWT; this module only maps JSON shapes.
 *   GET /audit?from&to&caseId&action&outcome&take
 */

import { request } from "./http";
import { compactAuditFilters, type AuditListFilters } from "./queryKeys";

const GUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const auditUrl = import.meta.env.VITE_AUDIT_API_URL ?? "";

export type AuditOutcome = "allow" | "deny";

export type AuditEventItem = {
  eventId: string;
  occurredAt: string;
  action: string;
  outcome: string;
  actorType: string;
  brokerId: string | null;
  resourceType: string;
  resourceId: string;
  caseId: string | null;
  sensitivity: string | null;
  correlationId: string | null;
  dataJson: string | null;
  recordHash: string;
};

export type ListAuditEventsResult = {
  items: AuditEventItem[];
};

export function listAuditEvents(
  filters: AuditListFilters = {},
): Promise<ListAuditEventsResult> {
  const compact = compactAuditFilters(filters);
  const query = new URLSearchParams();
  if (compact.from) query.set("from", compact.from);
  if (compact.to) query.set("to", compact.to);
  if (compact.caseId && GUID.test(compact.caseId))
    query.set("caseId", compact.caseId);
  if (compact.action) query.set("action", compact.action);
  if (compact.outcome) query.set("outcome", compact.outcome);
  if (compact.take != null) query.set("take", String(compact.take));

  const suffix = query.size > 0 ? `?${query.toString()}` : "";
  return request<ListAuditEventsResult>(auditUrl, `/audit${suffix}`, {
    method: "GET",
  });
}
