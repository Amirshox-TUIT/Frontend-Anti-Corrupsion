import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SectionHeader from '../components/shared/SectionHeader.jsx';
import { statisticsService } from '../services/api.js';

const trustCards = ['anonymity', 'access', 'structure'];
const processSteps = ['document', 'locate', 'submit', 'track'];

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    statisticsService.getStatistics(i18n.resolvedLanguage, t).then(setStats);
  }, [i18n.resolvedLanguage, t]);

  return (
    <div className="space-y-12">
      <section className="shell-container">
        <div className="surface-dark overflow-hidden p-6 sm:p-8 lg:p-12">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="space-y-6">
              <span className="inline-flex rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.28em] text-slate-200">
                {t('home.badge')}
              </span>
              <div className="space-y-4">
                <h1 className="font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                  {t('home.title')}
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                  {t('home.description')}
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link to="/submit" className="action-primary">
                  {t('home.primaryCta')}
                </Link>
                <Link to="/status" className="action-secondary border-white/15 bg-white/5 text-white hover:bg-white/10">
                  {t('home.secondaryCta')}
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-300">
                    {t('home.identityProtected')}
                  </p>
                  <p className="mt-2 text-sm text-slate-100">{t('home.identityProtectedBody')}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-300">
                    {t('home.adminIsolation')}
                  </p>
                  <p className="mt-2 text-sm text-slate-100">{t('home.adminIsolationBody')}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-300">
                    {t('home.structuredIntake')}
                  </p>
                  <p className="mt-2 text-sm text-slate-100">{t('home.structuredIntakeBody')}</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 rounded-[32px] bg-[radial-gradient(circle_at_top,rgba(179,33,45,0.35),transparent_55%)]" />
              <div className="relative rounded-[32px] border border-white/10 bg-white/5 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
                  {t('home.signalBoard')}
                </p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl bg-white/90 p-5 text-slate-900">
                    <p className="text-sm text-slate-500">{t('home.totalReports')}</p>
                    <p className="mt-3 font-display text-4xl font-semibold">
                      {stats?.totals.reports ?? '--'}
                    </p>
                  </div>
                  <div className="rounded-3xl bg-[#b3212d] p-5 text-white">
                    <p className="text-sm text-red-100">{t('home.resolvedCases')}</p>
                    <p className="mt-3 font-display text-4xl font-semibold">
                      {stats?.totals.done ?? '--'}
                    </p>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-white sm:col-span-2">
                    <p className="text-sm text-slate-300">{t('home.hotspot')}</p>
                    <p className="mt-3 text-xl font-semibold">
                      {stats?.hotspotRegions[0]?.name || t('home.loadingRegion')}
                    </p>
                  </div>
                </div>
                <div className="mt-6 space-y-3">
                  {stats?.hotspotRegions?.map((region, index) => (
                    <div
                      key={region.id}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                    >
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                          {t('home.hotspotRank', { rank: index + 1 })}
                        </p>
                        <p className="text-sm font-medium text-white">{region.name}</p>
                      </div>
                      <span className="text-lg font-semibold text-white">{region.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="shell-container space-y-8">
        <SectionHeader
          eyebrow={t('home.trustEyebrow')}
          title={t('home.trustTitle')}
          description={t('home.trustDescription')}
        />
        <div className="grid gap-6 lg:grid-cols-3">
          {trustCards.map((key) => (
            <article key={key} className="surface-card p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#183665]/8 text-[#183665]">
                <span className="text-xl font-semibold">{key.slice(0, 1).toUpperCase()}</span>
              </div>
              <h3 className="mt-5 text-xl font-semibold text-slate-950">{t(`home.trustCards.${key}.title`)}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {t(`home.trustCards.${key}.description`)}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="shell-container space-y-8">
        <SectionHeader
          eyebrow={t('home.processEyebrow')}
          title={t('home.processTitle')}
          description={t('home.processDescription')}
        />
        <div className="grid gap-5 lg:grid-cols-4">
          {processSteps.map((step, index) => (
            <div key={step} className="surface-card relative overflow-hidden p-6">
              <div className="absolute inset-x-6 top-0 h-1 rounded-b-full bg-[#b3212d] animate-pulse-line" />
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#183665] text-sm font-semibold text-white">
                {index + 1}
              </span>
              <h3 className="mt-5 text-lg font-semibold text-slate-950">
                {t(`home.steps.${step}.title`)}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {t(`home.steps.${step}.description`)}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
