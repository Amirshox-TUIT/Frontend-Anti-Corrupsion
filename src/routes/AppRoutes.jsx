import { Route, Routes } from 'react-router-dom';
import AppShell from '../components/layout/AppShell.jsx';
import AdminPage from '../pages/AdminPage.jsx';
import CheckStatusPage from '../pages/CheckStatusPage.jsx';
import HomePage from '../pages/HomePage.jsx';
import StatisticsPage from '../pages/StatisticsPage.jsx';
import SubmitReportPage from '../pages/SubmitReportPage.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/submit" element={<SubmitReportPage />} />
        <Route path="/statistics" element={<StatisticsPage />} />
        <Route path="/status" element={<CheckStatusPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Route>
    </Routes>
  );
}
