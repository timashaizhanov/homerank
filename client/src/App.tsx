import { Route, Routes } from "react-router-dom";
import { AdminRoute } from "./components/auth/AdminRoute";
import { AppShell } from "./components/layout/AppShell";
import { AdminPage } from "./pages/AdminPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { AuthPage } from "./pages/AuthPage";
import { CatalogPage } from "./pages/CatalogPage";
import { DashboardPage } from "./pages/DashboardPage";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { PropertyPage } from "./pages/PropertyPage";
import { ReportPage } from "./pages/ReportPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/properties/:id" element={<PropertyPage />} />
        <Route path="/reports/:id" element={<ReportPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
