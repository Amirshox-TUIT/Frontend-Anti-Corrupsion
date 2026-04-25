import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../shared/LanguageSwitcher.jsx';

const NAV_LINKS = [
  { to: '/', key: 'nav.home' },
  { to: '/submit', key: 'nav.submit' },
  { to: '/statistics', key: 'nav.statistics' },
  { to: '/status', key: 'nav.status' },
];

export default function Navbar() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#08172f]/90 text-white backdrop-blur-xl">
      <div className="shell-container">
        <div className="flex min-h-[76px] items-center justify-between gap-4">
          <NavLink to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              <span className="h-3.5 w-3.5 rounded-full bg-[#b3212d] shadow-[0_0_24px_rgba(179,33,45,0.8)]" />
            </div>
            <div>
              <p className="font-display text-base font-semibold tracking-[0.03em]">
                {t('nav.brand')}
              </p>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-300">
                {t('nav.trustLine')}
              </p>
            </div>
          </NavLink>

          <nav className="hidden items-center gap-2 lg:flex">
            {NAV_LINKS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                {t(item.key)}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden xl:flex">
              <LanguageSwitcher />
            </div>
            <NavLink to="/submit" className="action-primary hidden sm:inline-flex">
              {t('nav.submit')}
            </NavLink>
            <button
              type="button"
              onClick={() => setOpen((current) => !current)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white lg:hidden"
            >
              <span className="sr-only">{t('nav.toggleMenu')}</span>
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                {open ? (
                  <path d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L10.58 13.4l-6.29 6.3-1.42-1.42L9.17 12 2.87 5.71 4.29 4.29l6.29 6.3 6.31-6.3z" />
                ) : (
                  <path d="M4 7h16v2H4zm0 6h16v2H4zm0 6h16v2H4z" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {open && (
          <div className="animate-rise-in space-y-3 border-t border-white/10 py-4 lg:hidden">
            <LanguageSwitcher />
            <div className="grid gap-2">
              {NAV_LINKS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `rounded-2xl px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? 'bg-white/10 text-white'
                        : 'bg-white/[0.03] text-slate-300 hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  {t(item.key)}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
