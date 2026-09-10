import { z } from "zod";

export const realtimeNotificationSchema = z.object({
  type: z.string(),
  tenantId: z.string().uuid(),
  caseId: z.string().uuid().nullable().optional(),
  notificationId: z.string().uuid().nullable().optional(),
});

export type RealtimeNotification = z.infer<typeof realtimeNotificationSchema>;
