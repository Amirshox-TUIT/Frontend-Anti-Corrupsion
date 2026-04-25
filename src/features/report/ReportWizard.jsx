import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CORRUPTION_TYPES } from '../../data/reference.js';
import {
  findCity,
  findOrganization,
  findOrganizationType,
  findRegion,
  getLocalizedText,
  uzbekistanRegions,
} from '../../data/uzbekistan.js';
import { reportService } from '../../services/api.js';
import StatusBadge from '../../components/shared/StatusBadge.jsx';
import EvidenceDropzone from './components/EvidenceDropzone.jsx';
import ReportStepper from './components/ReportStepper.jsx';

const initialForm = {
  corruptionType: '',
  description: '',
  incidentDate: '',
  regionId: '',
  cityId: '',
  organizationTypeId: '',
  organizationId: '',
  contact: '',
};

const createPreviewFile = (file) => ({
  id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  name: file.name,
  size: file.size,
  type: file.type,
  previewUrl: URL.createObjectURL(file),
  rawFile: file,
});

const releaseFiles = (items) => {
  items.forEach((item) => {
    if (item.previewUrl) {
      URL.revokeObjectURL(item.previewUrl);
    }
  });
};

export default function ReportWizard() {
  const { t, i18n } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [files, setFiles] = useState([]);
  const filesRef = useRef([]);
  const [submission, setSubmission] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [shareContact, setShareContact] = useState(false);
  const [copyState, setCopyState] = useState('');

  const language = i18n.resolvedLanguage || 'uz';

  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  useEffect(() => {
    return () => {
      releaseFiles(filesRef.current);
    };
  }, []);

  const steps = [
    { id: 'incident', short: '01', title: t('report.steps.incident') },
    { id: 'location', short: '02', title: t('report.steps.location') },
    { id: 'evidence', short: '03', title: t('report.steps.evidence') },
    { id: 'contact', short: '04', title: t('report.steps.contact') },
  ];

  const selectedRegion = form.regionId ? findRegion(form.regionId) : null;
  const selectedCity = form.regionId && form.cityId ? findCity(form.regionId, form.cityId) : null;
  const selectedType =
    form.regionId && form.cityId && form.organizationTypeId
      ? findOrganizationType(form.regionId, form.cityId, form.organizationTypeId)
      : null;
  const selectedOrganization =
    form.regionId && form.cityId && form.organizationTypeId && form.organizationId
      ? findOrganization(form.regionId, form.cityId, form.organizationTypeId, form.organizationId)
      : null;

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  };

  const resetDownstream = (field, value) => {
    if (field === 'regionId') {
      setForm((current) => ({
        ...current,
        regionId: value,
        cityId: '',
        organizationTypeId: '',
        organizationId: '',
      }));
      return;
    }

    if (field === 'cityId') {
      setForm((current) => ({
        ...current,
        cityId: value,
        organizationTypeId: '',
        organizationId: '',
      }));
      return;
    }

    if (field === 'organizationTypeId') {
      setForm((current) => ({
        ...current,
        organizationTypeId: value,
        organizationId: '',
      }));
    }
  };

  const validateStep = (stepIndex) => {
    const nextErrors = {};

    if (stepIndex === 0) {
      if (!form.corruptionType) {
        nextErrors.corruptionType = t('report.validation.corruptionType');
      }

      if (form.description.trim().length < 40) {
        nextErrors.description = t('report.validation.description');
      }

      if (!form.incidentDate) {
        nextErrors.incidentDate = t('report.validation.incidentDate');
      }
    }

    if (stepIndex === 1) {
      if (!form.regionId) {
        nextErrors.regionId = t('report.validation.region');
      }

      if (!form.cityId) {
        nextErrors.cityId = t('report.validation.city');
      }

      if (!form.organizationTypeId) {
        nextErrors.organizationTypeId = t('report.validation.organizationType');
      }

      if (!form.organizationId) {
        nextErrors.organizationId = t('report.validation.organization');
      }
    }

    if (stepIndex === 2) {
      const invalidFile = files.find((file) => file.invalid);
      if (invalidFile) {
        nextErrors.files = t('report.validation.files');
      }
    }

    if (stepIndex === 3 && shareContact && form.contact) {
      const hasEmail = /.+@.+\..+/.test(form.contact);
      const hasPhone = /^\+?\d[\d\s-]{7,}$/.test(form.contact);

      if (!hasEmail && !hasPhone) {
        nextErrors.contact = t('report.validation.contact');
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const moveStep = (direction) => {
    if (direction === 'next') {
      if (!validateStep(currentStep)) {
        return;
      }

      setCurrentStep((value) => Math.min(value + 1, steps.length - 1));
      return;
    }

    setCurrentStep((value) => Math.max(value - 1, 0));
  };

  const addFiles = (items) => {
    const created = items.map((item) => (item instanceof File ? createPreviewFile(item) : item));
    setFiles((current) => [...current, ...created]);
  };

  const removeFile = (id) => {
    setFiles((current) => {
      const target = current.find((item) => item.id === id || item.name === id);
      if (target) {
        releaseFiles([target]);
      }

      return current.filter((item) => item.id !== id && item.name !== id);
    });
  };

  const submit = async (event) => {
    event.preventDefault();

    if (!validateStep(3)) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await reportService.createReport({
        ...form,
        contact: shareContact ? form.contact : '',
        evidence: files.filter((item) => !item.invalid),
      });
      setSubmission(response);
      setCopyState('');
    } finally {
      setSubmitting(false);
    }
  };

  const copyTrackingId = async () => {
    if (!submission?.trackingId) {
      return;
    }

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(submission.trackingId);
      } else {
        const input = document.createElement('input');
        input.value = submission.trackingId;
        document.body.append(input);
        input.select();
        document.execCommand('copy');
        input.remove();
      }

      setCopyState('copied');
    } catch {
      setCopyState('failed');
    }
  };

  if (submission) {
    return (
      <section className="surface-card p-6 sm:p-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <svg viewBox="0 0 24 24" className="h-8 w-8 fill-current">
              <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          </div>
          <div>
            <h2 className="font-display text-3xl font-semibold text-slate-950">
              {t('report.success.title')}
            </h2>
            <p className="mt-3 max-w-2xl text-base text-slate-600">{t('report.success.body')}</p>
          </div>

          <div className="surface-dark p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-300">
                  {t('report.success.trackingId')}
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <p className="font-mono text-3xl font-semibold tracking-[0.18em] text-white">
                    {submission.trackingId}
                  </p>
                  <button
                    type="button"
                    onClick={copyTrackingId}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/15"
                    aria-label={t('report.success.copyTrackingId')}
                    title={t('report.success.copyTrackingId')}
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                      <path d="M16 1H6C4.9 1 4 1.9 4 3v14h2V3h10V1Zm3 4H10C8.9 5 8 5.9 8 7v14c0 1.1.9 2 2 2h9c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2Zm0 16H10V7h9v14Z" />
                    </svg>
                  </button>
                </div>
                {copyState ? (
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-300">
                    {copyState === 'copied'
                      ? t('report.success.copied')
                      : t('report.success.copyFailed')}
                  </p>
                ) : null}
              </div>
              <StatusBadge status={submission.status} label={t('status.labels.pending')} />
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-6">
            <p className="text-sm leading-7 text-slate-700">
              {submission.contact
                ? t('report.success.contactProvided')
                : t('report.success.contactMissing')}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/status" className="action-primary">
              {t('report.success.checkStatus')}
            </Link>
            <button
              type="button"
              onClick={() => {
                releaseFiles(filesRef.current);
                setSubmission(null);
                setForm(initialForm);
                setCurrentStep(0);
                setFiles([]);
                setErrors({});
                setShareContact(false);
                setCopyState('');
              }}
              className="action-secondary"
            >
              {t('report.success.newReport')}
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="surface-dark p-6 sm:p-8">
        <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-300">
              {t('report.trustStatement')}
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-white">
              {t('report.bannerTitle')}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
              {t('report.bannerBody')}
            </p>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-300">
              {t('report.bannerFactTitle')}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-100">{t('report.bannerFactBody')}</p>
          </div>
        </div>
      </div>

      <ReportStepper steps={steps} currentStep={currentStep} />

      <section className="surface-card p-6 sm:p-8">
        {currentStep === 0 ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-2 lg:col-span-2">
              <label className="text-sm font-semibold text-slate-900">
                {t('report.fields.corruptionType')}
              </label>
              <select
                value={form.corruptionType}
                onChange={(event) => updateField('corruptionType', event.target.value)}
                className="field-shell"
              >
                <option value="">{t('report.placeholders.corruptionType')}</option>
                {CORRUPTION_TYPES.map((type) => (
                  <option key={type.id} value={type.id}>
                    {t(type.labelKey)}
                  </option>
                ))}
              </select>
              {errors.corruptionType ? (
                <p className="text-sm text-rose-600">{errors.corruptionType}</p>
              ) : null}
            </div>

            <div className="space-y-2 lg:col-span-2">
              <label className="text-sm font-semibold text-slate-900">
                {t('report.fields.description')}
              </label>
              <textarea
                rows={7}
                value={form.description}
                onChange={(event) => updateField('description', event.target.value)}
                className="field-shell resize-y"
                placeholder={t('report.placeholders.description')}
              />
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  {t('report.descriptionHint')}
                </p>
                <p className="text-xs text-slate-500">{form.description.trim().length}/40</p>
              </div>
              {errors.description ? <p className="text-sm text-rose-600">{errors.description}</p> : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">
                {t('report.fields.incidentDate')}
              </label>
              <input
                type="date"
                value={form.incidentDate}
                onChange={(event) => updateField('incidentDate', event.target.value)}
                className="field-shell"
              />
              {errors.incidentDate ? (
                <p className="text-sm text-rose-600">{errors.incidentDate}</p>
              ) : null}
            </div>
          </div>
        ) : null}

        {currentStep === 1 ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">{t('report.fields.region')}</label>
              <select
                value={form.regionId}
                onChange={(event) => {
                  setErrors({});
                  resetDownstream('regionId', event.target.value);
                }}
                className="field-shell"
              >
                <option value="">{t('report.placeholders.region')}</option>
                {uzbekistanRegions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {getLocalizedText(region.name, language)}
                  </option>
                ))}
              </select>
              {errors.regionId ? <p className="text-sm text-rose-600">{errors.regionId}</p> : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">{t('report.fields.city')}</label>
              <select
                value={form.cityId}
                onChange={(event) => {
                  setErrors({});
                  resetDownstream('cityId', event.target.value);
                }}
                disabled={!selectedRegion}
                className="field-shell disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                <option value="">{t('report.placeholders.city')}</option>
                {selectedRegion?.cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {getLocalizedText(city.name, language)}
                  </option>
                ))}
              </select>
              {errors.cityId ? <p className="text-sm text-rose-600">{errors.cityId}</p> : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">
                {t('report.fields.organizationType')}
              </label>
              <select
                value={form.organizationTypeId}
                onChange={(event) => {
                  setErrors({});
                  resetDownstream('organizationTypeId', event.target.value);
                }}
                disabled={!selectedCity}
                className="field-shell disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                <option value="">{t('report.placeholders.organizationType')}</option>
                {selectedCity?.organizationTypes.map((organizationType) => (
                  <option key={organizationType.id} value={organizationType.id}>
                    {t(`report.organizationTypes.${organizationType.id}`)}
                  </option>
                ))}
              </select>
              {errors.organizationTypeId ? (
                <p className="text-sm text-rose-600">{errors.organizationTypeId}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">
                {t('report.fields.organization')}
              </label>
              <select
                value={form.organizationId}
                onChange={(event) => updateField('organizationId', event.target.value)}
                disabled={!selectedType}
                className="field-shell disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                <option value="">{t('report.placeholders.organization')}</option>
                {selectedType?.organizations.map((organization) => (
                  <option key={organization.id} value={organization.id}>
                    {getLocalizedText(organization.name, language)}
                  </option>
                ))}
              </select>
              {errors.organizationId ? (
                <p className="text-sm text-rose-600">{errors.organizationId}</p>
              ) : null}
            </div>

            <div className="rounded-[28px] border border-[#183665]/10 bg-[#183665]/5 p-5 lg:col-span-2">
              <p className="text-xs uppercase tracking-[0.22em] text-[#183665]">
                {t('report.locationSummaryTitle')}
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-700">
                {selectedOrganization
                  ? `${getLocalizedText(selectedRegion?.name, language)} -> ${getLocalizedText(
                      selectedCity?.name,
                      language,
                    )} -> ${t(`report.organizationTypes.${selectedType?.id}`)} -> ${getLocalizedText(
                      selectedOrganization.name,
                      language,
                    )}`
                  : t('report.locationSummaryPlaceholder')}
              </p>
            </div>
          </div>
        ) : null}

        {currentStep === 2 ? (
          <div className="space-y-5">
            <div>
              <h3 className="text-xl font-semibold text-slate-950">{t('report.evidenceTitle')}</h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                {t('report.evidenceDescription')}
              </p>
            </div>
            <EvidenceDropzone
              files={files}
              onAddFiles={addFiles}
              onRemoveFile={removeFile}
              error={errors.files}
            />
          </div>
        ) : null}

        {currentStep === 3 ? (
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-950">{t('report.contactTitle')}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{t('report.contactDescription')}</p>
              </div>
              <label className="flex items-start gap-3 rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
                <input
                  type="checkbox"
                  checked={shareContact}
                  onChange={(event) => {
                    const enabled = event.target.checked;
                    setShareContact(enabled);
                    if (!enabled) {
                      setForm((current) => ({ ...current, contact: '' }));
                      setErrors((current) => ({ ...current, contact: '' }));
                    }
                  }}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-[#183665] focus:ring-[#183665]"
                />
                <span>
                  <span className="block text-sm font-semibold text-slate-900">
                    {t('report.contactToggle')}
                  </span>
                  <span className="mt-1 block text-sm text-slate-600">{t('report.contactNote')}</span>
                </span>
              </label>

              {shareContact ? (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900">
                    {t('report.fields.contact')}
                  </label>
                  <input
                    type="text"
                    value={form.contact}
                    onChange={(event) => updateField('contact', event.target.value)}
                    className="field-shell"
                    placeholder={t('report.placeholders.contact')}
                  />
                  <p className="text-sm text-slate-500">{t('report.contactHint')}</p>
                  {errors.contact ? <p className="text-sm text-rose-600">{errors.contact}</p> : null}
                </div>
              ) : null}
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-6">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                {t('report.reviewTitle')}
              </p>
              <dl className="mt-4 space-y-4 text-sm">
                <div>
                  <dt className="font-semibold text-slate-900">{t('report.fields.corruptionType')}</dt>
                  <dd className="mt-1 text-slate-600">
                    {t(CORRUPTION_TYPES.find((type) => type.id === form.corruptionType)?.labelKey)}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-900">{t('report.fields.location')}</dt>
                  <dd className="mt-1 text-slate-600">
                    {`${getLocalizedText(selectedRegion?.name, language)} / ${getLocalizedText(
                      selectedCity?.name,
                      language,
                    )} / ${getLocalizedText(selectedOrganization?.name, language)}`}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-900">{t('report.fields.evidenceCount')}</dt>
                  <dd className="mt-1 text-slate-600">
                    {t('report.evidenceCountValue', { count: files.filter((file) => !file.invalid).length })}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-900">{t('report.fields.contact')}</dt>
                  <dd className="mt-1 text-slate-600">
                    {shareContact && form.contact ? form.contact : t('report.noContactProvided')}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        ) : null}
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-slate-500">{t('report.stepCounter', { current: currentStep + 1, total: steps.length })}</div>
        <div className="flex flex-col gap-3 sm:flex-row">
          {currentStep > 0 ? (
            <button type="button" onClick={() => moveStep('back')} className="action-secondary">
              {t('common.back')}
            </button>
          ) : null}
          {currentStep < steps.length - 1 ? (
            <button type="button" onClick={() => moveStep('next')} className="action-primary">
              {t('common.next')}
            </button>
          ) : (
            <button type="submit" disabled={submitting} className="action-primary">
              {submitting ? t('report.submitting') : t('report.submit')}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
