import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { CasePage } from "./pages/CasePage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/public/LoginPage";
import { RegisterPage } from "./pages/public/RegisterPage";
import { GuestLayout } from "./layouts/public/GuestLayout";
import { AppShell } from "./layouts/app/AppShell";
import { CasesLayout } from "./layouts/app/CasesLayout";

function AppRoutes() {
  return (
    <Routes>
      <Route element={<GuestLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/cases" replace />} />
        <Route path="cases" element={<CasesLayout />}>
          <Route index element={<HomePage />} />
          <Route path=":caseId" element={<CasePage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/cases" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
