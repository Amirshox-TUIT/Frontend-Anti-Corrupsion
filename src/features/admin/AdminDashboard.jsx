import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../../components/shared/Modal.jsx';
import StatusBadge from '../../components/shared/StatusBadge.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { getLocalizedText, getLocationLabel, uzbekistanRegions } from '../../data/uzbekistan.js';
import { adminService, decorateReport } from '../../services/api.js';
import { canTransitionStatus, isFinalStatus, requiresDecisionMessage } from '../../services/reportUtils.js';

const formatDate = (value, language) =>
  new Intl.DateTimeFormat(language, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));

export default function AdminDashboard() {
  const { t, i18n } = useTranslation();
  const { admin, logout } = useAuth();
  const [filters, setFilters] = useState({
    regionId: '',
    organization: '',
    status: 'all',
  });
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nextStatus, setNextStatus] = useState('');
  const [decisionMessage, setDecisionMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  const loadReports = async ({ showLoading = false } = {}) => {
    if (showLoading) {
      setLoading(true);
    }

    const response = await adminService.getReports(filters);
    setReports(response.map((report) => decorateReport(report, i18n.resolvedLanguage, t)));
    setLoading(false);
  };

  useEffect(() => {
    let active = true;

    const run = async () => {
      const response = await adminService.getReports(filters);
      if (!active) {
        return;
      }
      setReports(response.map((report) => decorateReport(report, i18n.resolvedLanguage, t)));
      setLoading(false);
    };

    run();

    return () => {
      active = false;
    };
  }, [filters, i18n.resolvedLanguage, t]);

  const openReport = (report) => {
    const firstAvailableStatus = ['accepted', 'rejected', 'done'].find((status) =>
      canTransitionStatus(report.status, status),
    );

    setSelectedReport(report);
    setNextStatus(firstAvailableStatus || '');
    setDecisionMessage('');
    setActionError('');
  };

  const submitStatusUpdate = async () => {
    if (!selectedReport || !nextStatus) {
      return;
    }

    if (!canTransitionStatus(selectedReport.status, nextStatus)) {
      setActionError(t('admin.errors.statusLocked'));
      return;
    }

    if (requiresDecisionMessage(nextStatus) && !decisionMessage.trim()) {
      setActionError(t('admin.errors.decisionReportRequired'));
      return;
    }

    setActionLoading(true);
    setActionError('');

    try {
      const response = await adminService.updateStatus(selectedReport.id, nextStatus, decisionMessage);
      const decorated = decorateReport(response, i18n.resolvedLanguage, t);
      setSelectedReport(decorated);
      setNextStatus('');
      setDecisionMessage('');
      await loadReports({ showLoading: true });
    } catch (error) {
      setActionError(t(error?.message || 'admin.errors.statusUpdateFailed'));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="surface-card p-6 sm:p-8">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">{t('admin.session')}</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">{admin?.name}</h2>
            <p className="mt-1 text-sm text-slate-600">{admin?.email}</p>
          </div>
          <div className="flex flex-col gap-3 md:flex-row">
            <select
              value={filters.regionId}
              onChange={(event) => setFilters((current) => ({ ...current, regionId: event.target.value }))}
              className="field-shell min-w-[180px]"
            >
              <option value="">{t('admin.filters.allRegions')}</option>
              {uzbekistanRegions.map((region) => (
                <option key={region.id} value={region.id}>
                  {getLocalizedText(region.name, i18n.resolvedLanguage)}
                </option>
              ))}
            </select>

            <input
              type="text"
              value={filters.organization}
              onChange={(event) =>
                setFilters((current) => ({ ...current, organization: event.target.value }))
              }
              className="field-shell min-w-[220px]"
              placeholder={t('admin.filters.organization')}
            />

            <select
              value={filters.status}
              onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
              className="field-shell min-w-[180px]"
            >
              <option value="all">{t('admin.filters.allStatuses')}</option>
              <option value="pending">{t('status.labels.pending')}</option>
              <option value="accepted">{t('status.labels.accepted')}</option>
              <option value="rejected">{t('status.labels.rejected')}</option>
              <option value="done">{t('status.labels.done')}</option>
            </select>

            <button type="button" onClick={logout} className="action-secondary">
              {t('admin.logout')}
            </button>
          </div>
        </div>
      </section>

      <section className="surface-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs uppercase tracking-[0.18em] text-slate-500">
                <th className="px-6 py-4">{t('admin.table.trackingId')}</th>
                <th className="px-6 py-4">{t('admin.table.location')}</th>
                <th className="px-6 py-4">{t('admin.table.organization')}</th>
                <th className="px-6 py-4">{t('admin.table.type')}</th>
                <th className="px-6 py-4">{t('admin.table.status')}</th>
                <th className="px-6 py-4">{t('admin.table.evidence')}</th>
                <th className="px-6 py-4">{t('admin.table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center text-sm text-slate-500">
                    {t('admin.loading')}
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center text-sm text-slate-500">
                    {t('admin.empty')}
                  </td>
                </tr>
              ) : (
                reports.map((report) => {
                  const location = getLocationLabel(report, i18n.resolvedLanguage);

                  return (
                    <tr key={report.id} className="align-top text-sm text-slate-700">
                      <td className="px-6 py-4 font-mono font-semibold text-slate-950">
                        {report.trackingId}
                        <p className="mt-2 text-xs font-normal text-slate-500">
                          {formatDate(report.createdAt, i18n.resolvedLanguage)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p>{location.region}</p>
                        <p className="mt-1 text-xs text-slate-500">{location.city}</p>
                      </td>
                      <td className="px-6 py-4">{report.organizationName}</td>
                      <td className="px-6 py-4">{report.corruptionTypeLabel}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={report.status} label={report.statusLabel} />
                      </td>
                      <td className="px-6 py-4">{report.evidence.length}</td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => openReport(report)}
                          className="action-secondary whitespace-nowrap px-4 py-2"
                        >
                          {t('admin.view')}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Modal
        open={Boolean(selectedReport)}
        onClose={() => {
          setSelectedReport(null);
          setActionError('');
        }}
        title={selectedReport?.trackingId || ''}
        subtitle={t('admin.modal.record')}
        closeLabel={t('admin.modal.close')}
      >
        {selectedReport ? (
          <div className="space-y-8">
            {selectedReport.decisionReport ? (
              <div className="rounded-[28px] border border-emerald-200 bg-emerald-50/80 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">
                  {selectedReport.decisionReport.status === 'rejected'
                    ? t('admin.modal.publicRejectionReport')
                    : t('admin.modal.publicDoneReport')}
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-700">
                  {selectedReport.decisionReport.message}
                </p>
                <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">
                  {formatDate(selectedReport.decisionReport.createdAt, i18n.resolvedLanguage)}
                </p>
              </div>
            ) : null}

            <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
              <div className="space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    {t('admin.modal.description')}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-700">{selectedReport.description}</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[24px] bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      {t('admin.modal.contact')}
                    </p>
                    <p className="mt-2 text-sm font-medium text-slate-900">
                      {selectedReport.contact || t('admin.modal.noContact')}
                    </p>
                  </div>
                  <div className="rounded-[24px] bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      {t('admin.modal.location')}
                    </p>
                    <p className="mt-2 text-sm font-medium text-slate-900">
                      {getLocationLabel(selectedReport, i18n.resolvedLanguage).region} /{' '}
                      {getLocationLabel(selectedReport, i18n.resolvedLanguage).city}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                  {t('admin.modal.statusActions')}
                </p>
                <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    {t('admin.modal.currentStatus')}
                  </p>
                  <div className="mt-3">
                    <StatusBadge status={selectedReport.status} label={selectedReport.statusLabel} />
                  </div>
                </div>
                {!isFinalStatus(selectedReport.status) ? (
                  <>
                    <div className="mt-4 grid gap-3">
                      {['accepted', 'rejected', 'done'].map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => setNextStatus(status)}
                          disabled={!canTransitionStatus(selectedReport.status, status)}
                          className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                            nextStatus === status
                              ? 'border-[#183665] bg-[#183665] text-white'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400'
                          }`}
                        >
                          {t(`status.labels.${status}`)}
                        </button>
                      ))}
                    </div>

                    {requiresDecisionMessage(nextStatus) ? (
                      <div className="mt-4 space-y-2">
                        <label className="text-sm font-semibold text-slate-900">
                          {nextStatus === 'rejected'
                            ? t('admin.modal.rejectionReason')
                            : t('admin.modal.doneReport')}
                        </label>
                        <textarea
                          rows={5}
                          value={decisionMessage}
                          onChange={(event) => setDecisionMessage(event.target.value)}
                          className="field-shell resize-y"
                          placeholder={
                            nextStatus === 'rejected'
                              ? t('admin.modal.rejectionPlaceholder')
                              : t('admin.modal.donePlaceholder')
                          }
                        />
                        <p className="text-sm text-slate-500">{t('admin.modal.publicVisibility')}</p>
                      </div>
                    ) : (
                      <p className="mt-4 text-sm text-slate-500">{t('admin.modal.acceptedHint')}</p>
                    )}

                    {actionError ? (
                      <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        {actionError}
                      </p>
                    ) : null}

                    <button
                      type="button"
                      onClick={submitStatusUpdate}
                      disabled={actionLoading || !nextStatus}
                      className="mt-4 action-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {actionLoading ? t('admin.modal.saving') : t('admin.modal.saveStatus')}
                    </button>
                  </>
                ) : (
                  <p className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                    {t('admin.modal.statusLocked')}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-xl font-semibold text-slate-950">{t('admin.modal.evidence')}</h4>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {selectedReport.evidence.length > 0 ? (
                  selectedReport.evidence.map((file) => (
                    <article key={file.id} className="overflow-hidden rounded-[24px] border border-slate-200">
                      <div className="aspect-[16/10] bg-slate-100">
                        {file.type.startsWith('image/') &&
                        file.previewUrl &&
                        !file.previewUrl.startsWith('blob:') ? (
                          <img src={file.previewUrl} alt={file.name} className="h-full w-full object-cover" />
                        ) : file.type.startsWith('video/') &&
                          file.previewUrl &&
                          !file.previewUrl.startsWith('blob:') ? (
                          <video src={file.previewUrl} className="h-full w-full object-cover" controls />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-[#183665]/5 text-[#183665]">
                            <svg viewBox="0 0 24 24" className="h-12 w-12 fill-current">
                              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2Zm-8 14H7v-2h4Zm6-4H7v-2h10Zm0-4H7V7h10Z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <p className="text-sm font-semibold text-slate-900">{file.name}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">
                          {file.type}
                        </p>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="rounded-[24px] border border-dashed border-slate-300 p-6 text-sm text-slate-500">
                    {t('admin.modal.noEvidence')}
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-xl font-semibold text-slate-950">{t('admin.modal.timeline')}</h4>
              <div className="mt-4 space-y-4">
                {selectedReport.timeline.map((entry, index) => (
                  <div key={`${entry.status}-${entry.date}-${index}`} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span className="mt-1 h-3 w-3 rounded-full bg-[#183665]" />
                      {index < selectedReport.timeline.length - 1 ? (
                        <span className="h-full w-px bg-slate-200" />
                      ) : null}
                    </div>
                    <div className="pb-4">
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
                              ? t('admin.modal.rejectionReason')
                              : entry.status === 'done'
                                ? t('admin.modal.doneReport')
                                : t('admin.modal.publicReport')}
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
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
