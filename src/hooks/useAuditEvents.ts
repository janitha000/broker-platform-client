import { useQuery } from "@tanstack/react-query";
import { listAuditEvents } from "../api/audit";
import {
  auditKeys,
  compactAuditFilters,
  type AuditListFilters,
} from "../api/queryKeys";
import { useAuth } from "../auth/useAuth";

export function useAuditEventsQuery(filters: AuditListFilters = {}) {
  const { user, canReadAudit } = useAuth();
  const compact = compactAuditFilters(filters);

  return useQuery({
    queryKey: auditKeys.list(compact),
    queryFn: () => listAuditEvents(compact),
    enabled: Boolean(user && canReadAudit),
  });
}
