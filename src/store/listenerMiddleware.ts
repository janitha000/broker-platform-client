import { createListenerMiddleware } from "@reduxjs/toolkit";
import { sessionCleared } from "../auth/authSlice";
import { queryClient } from "../api/queryClient";

export const listenerMiddleware = createListenerMiddleware();

listenerMiddleware.startListening({
  actionCreator: sessionCleared,
  effect: () => {
    queryClient.clear();
  },
});
