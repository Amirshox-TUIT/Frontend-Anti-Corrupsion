import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import EmptyState from '../../components/shared/EmptyState.jsx';
import StatusBadge from '../../components/shared/StatusBadge.jsx';
import { decorateReport, reportService } from '../../services/api.js';
import { getLocationLabel } from '../../data/uzbekistan.js';

const formatDate = (value, language) =>
  new Intl.DateTimeFormat(language, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));

export default function StatusLookup() {
  const { t, i18n } = useTranslation();
  const [trackingId, setTrackingId] = useState('');
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLookup = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await reportService.getReportByTrackingId(trackingId);
      setReport(decorateReport(response, i18n.resolvedLanguage, t));
    } catch {
      setReport(null);
      setError(t('status.notFound'));
    } finally {
      setLoading(false);
    }
  };

  const location = report ? getLocationLabel(report, i18n.resolvedLanguage) : null;

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="surface-card p-6 sm:p-8">
        <h3 className="text-2xl font-semibold text-slate-950">{t('status.lookupTitle')}</h3>
        <p className="mt-3 text-sm leading-6 text-slate-600">{t('status.lookupBody')}</p>

        <form onSubmit={handleLookup} className="mt-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-900">{t('status.trackingLabel')}</label>
            <input
              type="text"
              value={trackingId}
              onChange={(event) => setTrackingId(event.target.value)}
              className="field-shell font-mono uppercase tracking-[0.12em]"
              placeholder="UZ-26-TAS-31A9"
            />
          </div>

          {error ? (
            <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </p>
          ) : null}

          <button type="submit" disabled={loading} className="action-primary w-full">
            {loading ? t('status.loading') : t('status.submit')}
          </button>
        </form>
      </section>

      <section className="space-y-6">
        {report ? (
          <>
            <div className="surface-card p-6 sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                    {t('status.currentStatus')}
                  </p>
                  <h3 className="mt-2 font-display text-3xl font-semibold text-slate-950">
                    {report.trackingId}
                  </h3>
                </div>
                <StatusBadge status={report.status} label={report.statusLabel} />
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    {t('status.reportedEntity')}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{location.organization}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {location.region} / {location.city}
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    {t('status.reportType')}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{report.corruptionTypeLabel}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {formatDate(report.createdAt, i18n.resolvedLanguage)}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-3xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  {t('status.reportDescription')}
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-700">{report.description}</p>
              </div>

              <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  {t('status.publicResult')}
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-700">
                  {report.decisionReport?.message || t('status.publicResultPending')}
                </p>
                {report.decisionReport?.createdAt ? (
                  <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">
                    {formatDate(report.decisionReport.createdAt, i18n.resolvedLanguage)}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="surface-card p-6 sm:p-8">
              <h3 className="text-2xl font-semibold text-slate-950">{t('status.timelineTitle')}</h3>
              <div className="mt-6 space-y-5">
                {report.timeline.map((entry, index) => (
                  <div key={`${entry.status}-${entry.date}-${index}`} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span className="mt-1 h-3 w-3 rounded-full bg-[#183665]" />
                      {index < report.timeline.length - 1 ? (
                        <span className="h-full w-px bg-slate-200" />
                      ) : null}
                    </div>
                    <div className="pb-6">
                      <p className="text-sm font-semibold text-slate-900">
                        {entry.titleKey ? t(entry.titleKey) : entry.title}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {entry.descriptionKey ? t(entry.descriptionKey) : entry.description}
                      </p>
                      {entry.message ? (
                        <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                            {entry.status === 'rejected'
                              ? t('status.rejectionReport')
                              : t('status.doneReport')}
                          </p>
                          <p className="mt-2 leading-6">{entry.message}</p>
                        </div>
                      ) : null}
                      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                        {formatDate(entry.date, i18n.resolvedLanguage)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <EmptyState title={t('status.emptyTitle')} description={t('status.emptyBody')} />
        )}
      </section>
    </div>
  );
}
