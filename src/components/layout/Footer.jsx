import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-slate-200/80 bg-white/80 backdrop-blur">
      <div className="shell-container flex flex-col gap-4 py-8 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold text-slate-900">{t('footer.title')}</p>
          <p>{t('footer.subtitle')}</p>
        </div>
        <div className="space-y-1 text-xs uppercase tracking-[0.18em] text-slate-500">
          <p>{t('footer.anonymous')}</p>
          <p>{t('footer.noAdminLink')}</p>
        </div>
      </div>
    </footer>
  );
}
