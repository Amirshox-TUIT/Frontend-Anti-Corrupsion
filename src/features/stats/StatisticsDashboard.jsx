import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import EmptyState from '../../components/shared/EmptyState.jsx';
import StatusBadge from '../../components/shared/StatusBadge.jsx';
import { statisticsService } from '../../services/api.js';

const COLORS = ['#183665', '#b3212d', '#0d8a6a', '#d07c12'];

const formatDate = (value, language) =>
  value
    ? new Intl.DateTimeFormat(language, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(value))
    : '';

export default function StatisticsDashboard() {
  const { t, i18n } = useTranslation();
  const [stats, setStats] = useState(null);
  const [organizationProfiles, setOrganizationProfiles] = useState([]);
  const [selectedRegionId, setSelectedRegionId] = useState('');
  const [organizationQuery, setOrganizationQuery] = useState('');
  const [selectedOrganizationKey, setSelectedOrganizationKey] = useState('');

  useEffect(() => {
    Promise.all([
      statisticsService.getStatistics(i18n.resolvedLanguage, t),
      statisticsService.getOrganizationProfiles(i18n.resolvedLanguage, t),
    ]).then(([statsResponse, organizationResponse]) => {
      setStats(statsResponse);
      setOrganizationProfiles(organizationResponse);
      setSelectedRegionId(statsResponse.byRegion[0]?.id || '');
      setSelectedOrganizationKey(
        organizationResponse.find((item) => item.totalReports > 0)?.key || organizationResponse[0]?.key || '',
      );
    });
  }, [i18n.resolvedLanguage, t]);

  if (!stats) {
    return <EmptyState title={t('stats.loadingTitle')} description={t('stats.loadingBody')} />;
  }

  const regionDetail = stats.drilldown[selectedRegionId];
  const normalizedQuery = organizationQuery.trim().toLowerCase();
  const matchingOrganizations = organizationProfiles
    .filter((profile) =>
      [
        profile.organizationName,
        profile.organizationTypeLabel,
        profile.regionName,
        profile.cityName,
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery),
    )
    .slice(0, 8);

  const selectedOrganization =
    organizationProfiles.find((item) => item.key === selectedOrganizationKey) ||
    matchingOrganizations[0] ||
    organizationProfiles[0] ||
    null;

  const recentSignals = organizationProfiles
    .flatMap((profile) =>
      profile.reports.map((report) => ({
        ...report,
        organizationName: profile.organizationName,
        regionName: profile.regionName,
        cityName: profile.cityName,
      })),
    )
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
    .slice(0, 6);

  return (
    <div className="space-y-8">
      <section className="grid gap-5 lg:grid-cols-5">
        {[
          ['reports', t('stats.cards.reports')],
          ['accepted', t('stats.cards.accepted')],
          ['done', t('stats.cards.done')],
          ['pending', t('stats.cards.pending')],
          ['rejected', t('stats.cards.rejected')],
        ].map(([key, label]) => (
          <article key={key} className="surface-card p-6">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-3 font-display text-4xl font-semibold text-slate-950">
              {stats.totals[key]}
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="surface-card p-6 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-2xl font-semibold text-slate-950">{t('stats.regionChartTitle')}</h3>
              <p className="mt-2 text-sm text-slate-600">{t('stats.regionChartBody')}</p>
            </div>
          </div>
          <div className="mt-8 h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.byRegion}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d8e0ec" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-20} textAnchor="end" height={70} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                  {stats.byRegion.map((item, index) => (
                    <Cell key={item.id} fill={index % 2 === 0 ? '#183665' : '#b3212d'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="surface-card p-6 sm:p-8">
          <h3 className="text-2xl font-semibold text-slate-950">{t('stats.statusChartTitle')}</h3>
          <p className="mt-2 text-sm text-slate-600">{t('stats.statusChartBody')}</p>
          <div className="mt-6 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.statusDistribution}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={4}
                >
                  {stats.statusDistribution.map((entry, index) => (
                    <Cell key={entry.id} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {stats.statusDistribution.map((entry, index) => (
              <div key={entry.id} className="rounded-2xl bg-slate-50 p-3">
                <div className="flex items-center gap-3">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <p className="text-sm font-medium text-slate-900">{entry.name}</p>
                </div>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{entry.value}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <article className="surface-card p-6 sm:p-8">
          <h3 className="text-2xl font-semibold text-slate-950">{t('stats.hotspotsTitle')}</h3>
          <p className="mt-2 text-sm text-slate-600">{t('stats.hotspotsBody')}</p>
          <div className="mt-6 space-y-3">
            {stats.hotspotRegions.map((region, index) => (
              <button
                key={region.id}
                type="button"
                onClick={() => setSelectedRegionId(region.id)}
                className={`flex w-full items-center justify-between rounded-[24px] border px-5 py-4 text-left transition ${
                  selectedRegionId === region.id
                    ? 'border-[#183665] bg-[#183665] text-white'
                    : 'border-slate-200 bg-white text-slate-900 hover:border-slate-300'
                }`}
              >
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] opacity-75">
                    {t('stats.hotspotLabel', { rank: index + 1 })}
                  </p>
                  <p className="mt-2 text-base font-semibold">{region.name}</p>
                </div>
                <span className="text-3xl font-semibold">{region.count}</span>
              </button>
            ))}
          </div>
        </article>

        <article className="surface-card p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-2xl font-semibold text-slate-950">{t('stats.drilldownTitle')}</h3>
              <p className="mt-2 text-sm text-slate-600">{t('stats.drilldownBody')}</p>
            </div>
            <select
              value={selectedRegionId}
              onChange={(event) => setSelectedRegionId(event.target.value)}
              className="field-shell max-w-xs"
            >
              {stats.byRegion.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name}
                </option>
              ))}
            </select>
          </div>

          {regionDetail ? (
            <div className="mt-6 space-y-5">
              <div className="rounded-[24px] border border-[#183665]/10 bg-[#183665]/5 p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-[#183665]">
                  {t('stats.regionSummary')}
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-950">{regionDetail.regionName}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {t('stats.regionSummaryValue', { count: regionDetail.total })}
                </p>
              </div>

              <div className="grid gap-4">
                {regionDetail.cities.map((city) => (
                  <div key={city.id} className="rounded-[24px] border border-slate-200 bg-white p-5">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="text-lg font-semibold text-slate-950">{city.name}</h4>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">
                        {city.count}
                      </span>
                    </div>
                    {city.organizations.length > 0 ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {city.organizations.map((organization) => (
                          <span
                            key={organization.id}
                            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                          >
                            {organization.name}: {organization.count}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-4 text-sm text-slate-500">{t('stats.noCityReports')}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <article className="surface-card p-6 sm:p-8">
          <h3 className="text-2xl font-semibold text-slate-950">{t('stats.organizationTitle')}</h3>
          <p className="mt-2 text-sm text-slate-600">{t('stats.organizationBody')}</p>
          <div className="mt-8 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.topOrganizations} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d8e0ec" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis dataKey="name" type="category" width={170} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[0, 10, 10, 0]} fill="#b3212d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="surface-card p-6 sm:p-8">
          <h3 className="text-2xl font-semibold text-slate-950">{t('stats.recentSignalsTitle')}</h3>
          <p className="mt-2 text-sm text-slate-600">{t('stats.recentSignalsBody')}</p>
          <div className="mt-6 space-y-3">
            {recentSignals.map((report) => (
              <div key={report.id} className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{report.organizationName}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {report.regionName} / {report.cityName}
                    </p>
                  </div>
                  <StatusBadge status={report.status} label={report.statusLabel} />
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-700">{report.description}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">
                  {formatDate(report.createdAt, i18n.resolvedLanguage)}
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <article className="surface-card p-6 sm:p-8">
          <h3 className="text-2xl font-semibold text-slate-950">{t('stats.organizationSearchTitle')}</h3>
          <p className="mt-2 text-sm text-slate-600">{t('stats.organizationSearchBody')}</p>
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">
                {t('stats.organizationSearchLabel')}
              </label>
              <input
                type="text"
                value={organizationQuery}
                onChange={(event) => setOrganizationQuery(event.target.value)}
                className="field-shell"
                placeholder={t('stats.organizationSearchPlaceholder')}
              />
            </div>

            <div className="space-y-3">
              {(normalizedQuery ? matchingOrganizations : organizationProfiles.slice(0, 8)).map((profile) => (
                <button
                  key={profile.key}
                  type="button"
                  onClick={() => setSelectedOrganizationKey(profile.key)}
                  className={`w-full rounded-[24px] border px-5 py-4 text-left transition ${
                    selectedOrganization?.key === profile.key
                      ? 'border-[#183665] bg-[#183665] text-white'
                      : 'border-slate-200 bg-white text-slate-900 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-base font-semibold">{profile.organizationName}</p>
                      <p className="mt-1 text-sm opacity-80">
                        {profile.regionName} / {profile.cityName}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] opacity-75">
                        {profile.organizationTypeLabel}
                      </p>
                    </div>
                    <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-inherit">
                      {t('stats.reportCountShort', { count: profile.totalReports })}
                    </span>
                  </div>
                </button>
              ))}

              {normalizedQuery && matchingOrganizations.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-slate-300 px-5 py-6 text-sm text-slate-500">
                  {t('stats.organizationSearchEmpty')}
                </div>
              ) : null}
            </div>
          </div>
        </article>

        <article className="surface-card p-6 sm:p-8">
          {selectedOrganization ? (
            <div className="space-y-6">
              <div className="rounded-[28px] border border-[#183665]/10 bg-[#183665]/5 p-6">
                <p className="text-xs uppercase tracking-[0.22em] text-[#183665]">
                  {t('stats.organizationProfile')}
                </p>
                <h3 className="mt-3 text-2xl font-semibold text-slate-950">
                  {selectedOrganization.organizationName}
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  {selectedOrganization.organizationTypeLabel} / {selectedOrganization.regionName} /{' '}
                  {selectedOrganization.cityName}
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {['pending', 'accepted', 'rejected', 'done'].map((status) => (
                    <div key={status} className="rounded-2xl bg-white px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        {t(`status.labels.${status}`)}
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-slate-950">
                        {selectedOrganization.statusCounts?.[status] || 0}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-sm text-slate-600">
                  {selectedOrganization.latestActivityAt
                    ? t('stats.organizationLastActivity', {
                        date: formatDate(selectedOrganization.latestActivityAt, i18n.resolvedLanguage),
                      })
                    : t('stats.organizationNoActivity')}
                </p>
              </div>

              {selectedOrganization.reports.length > 0 ? (
                <div className="space-y-4">
                  {selectedOrganization.reports.map((report) => (
                    <article key={report.id} className="rounded-[28px] border border-slate-200 bg-white p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                            {report.trackingId}
                          </p>
                          <h4 className="mt-2 text-lg font-semibold text-slate-950">
                            {report.corruptionTypeLabel}
                          </h4>
                          <p className="mt-2 text-sm text-slate-500">
                            {formatDate(report.createdAt, i18n.resolvedLanguage)}
                          </p>
                        </div>
                        <StatusBadge status={report.status} label={report.statusLabel} />
                      </div>

                      <p className="mt-4 text-sm leading-7 text-slate-700">{report.description}</p>

                      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                          {t('stats.applicationResult')}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-700">
                          {report.decisionReport?.message || t('stats.applicationResultPending')}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-[28px] border border-dashed border-slate-300 px-5 py-8 text-sm text-slate-500">
                  {t('stats.organizationNoReports')}
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              title={t('stats.organizationSearchTitle')}
              description={t('stats.organizationSearchBody')}
            />
          )}
        </article>
      </section>
    </div>
  );
}
