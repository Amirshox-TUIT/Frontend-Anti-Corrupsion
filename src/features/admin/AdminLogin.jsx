import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext.jsx';

export default function AdminLogin() {
  const { t } = useTranslation();
  const { login, authLoading } = useAuth();
  const [form, setForm] = useState({
    email: 'inspector@anticor.uz',
    password: 'SecureAdmin123!',
  });
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    const result = await login(form);

    if (!result.success) {
      setError(t(result.message));
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <section className="surface-card p-6 sm:p-8">
        <h2 className="font-display text-3xl font-semibold text-slate-950">{t('admin.loginTitle')}</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">{t('admin.loginBody')}</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-900">{t('admin.fields.email')}</label>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              className="field-shell"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-900">{t('admin.fields.password')}</label>
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              className="field-shell"
            />
          </div>
          {error ? (
            <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </p>
          ) : null}
          <button type="submit" disabled={authLoading} className="action-primary w-full">
            {authLoading ? t('admin.authenticating') : t('admin.loginAction')}
          </button>
        </form>
      </section>

      <section className="surface-dark p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
          {t('admin.restrictedAccess')}
        </p>
        <h3 className="mt-4 font-display text-3xl font-semibold text-white">
          {t('admin.accessRulesTitle')}
        </h3>
        <ul className="mt-6 space-y-4 text-sm leading-6 text-slate-300">
          <li>{t('admin.accessRules.one')}</li>
          <li>{t('admin.accessRules.two')}</li>
          <li>{t('admin.accessRules.three')}</li>
        </ul>

        <div className="mt-8 rounded-[28px] border border-white/10 bg-white/5 p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-300">{t('admin.mockCredentials')}</p>
          <p className="mt-3 font-mono text-sm text-white">inspector@anticor.uz</p>
          <p className="mt-1 font-mono text-sm text-white">SecureAdmin123!</p>
        </div>
      </section>
    </div>
  );
}
