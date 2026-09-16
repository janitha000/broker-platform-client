import {
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../auth/useAuth";
import { tryRefresh } from "../api/http";
import { caseKeys } from "../api/queryKeys";
import { realtimeNotificationSchema } from "./notificationPayload";

export function useNotificationHub() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) {
      return;
    }

    const connection = new HubConnectionBuilder()
      .withUrl("/hubs/notifications", { withCredentials: true })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    connection.on("notification", (raw: unknown) => {
      const parsed = realtimeNotificationSchema.safeParse(raw);
      if (!parsed.success) {
        return;
      }

      void queryClient.invalidateQueries({ queryKey: caseKeys.list() });
      if (parsed.data.caseId) {
        void queryClient.invalidateQueries({
          queryKey: caseKeys.detail(parsed.data.caseId),
        });
      }
    });

    void connection
      .start()
      .catch(async (error: unknown) => {
        if (await tryRefresh()) {
          await connection.start();
          return;
        }
        throw error;
      })
      .catch((error: unknown) => {
        console.error(error);
      });

    return () => {
      connection.off("notification");
      if (connection.state !== HubConnectionState.Disconnected) {
        void connection.stop();
      }
    };
  }, [user, queryClient]);
}
