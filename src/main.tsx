import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import App from "./App.tsx";
import { queryClient } from "./api/queryClient.ts";
// import { AuthProvider } from "./auth/AuthContext.tsx";
import { ThemeProvider } from "./theme/ThemeContext.tsx";
import { Provider } from "react-redux";
import { store } from "./store/index.ts";
import { AuthBootstrap } from "./auth/AuthBootstrap.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Provider store={store}>
          <AuthBootstrap>
            {/* <AuthProvider> */}
            <App />
            {/* </AuthProvider> */}
          </AuthBootstrap>
        </Provider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
);
