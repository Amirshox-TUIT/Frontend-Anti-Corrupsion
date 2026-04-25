import { useTranslation } from 'react-i18next';
import ProtectedRoute from '../routes/ProtectedRoute.jsx';
import AdminDashboard from '../features/admin/AdminDashboard.jsx';
import AdminLogin from '../features/admin/AdminLogin.jsx';

export default function AdminPage() {
  const { t } = useTranslation();

  return (
    <div className="shell-container space-y-8">
      <div className="surface-dark p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
          {t('admin.eyebrow')}
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-white sm:text-4xl">
          {t('admin.title')}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">{t('admin.description')}</p>
      </div>
      <ProtectedRoute fallback={<AdminLogin />}>
        <AdminDashboard />
      </ProtectedRoute>
    </div>
  );
}
