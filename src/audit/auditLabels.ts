export const AUDIT_ACTION_LABELS: Record<string, string> = {
  "authz.deny": "Access denied",
  "case.view": "Opened case",
  "case.fact-find.complete": "Completed fact-find",
  "document.upload-url.issued": "Issued upload URL",
  "document.upload.completed": "Completed upload",
  "document.download-url.issued": "Issued download URL",
  "document.scan.succeeded": "Scan clean",
  "document.scan.quarantined": "Quarantined",
  "document.scan.rejected": "Scan rejected",
  "identity.tenant.registered": "Registered tenant",
};

export function auditActionLabel(action: string): string {
  return AUDIT_ACTION_LABELS[action] ?? action;
}

export function auditOutcomeLabel(outcome: string): string {
  if (outcome === "deny") return "Denied";
  if (outcome === "allow") return "Allowed";
  return outcome;
}

export function auditActorLabel(
  actorType: string,
  brokerId: string | null,
): string {
  if (actorType === "worker") return "System";
  if (brokerId) return `Broker ${brokerId.slice(0, 8)}`;
  return actorType === "user" ? "Broker" : actorType;
}
