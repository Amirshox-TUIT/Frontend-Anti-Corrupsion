import axios from 'axios';
import { CORRUPTION_TYPES, REPORT_STATUSES } from '../data/reference.js';
import {
  findOrganization,
  findRegion,
  getLocalizedText,
  uzbekistanRegions,
} from '../data/uzbekistan.js';
import { getStoredAdminSession, getStoredReports, setStoredReports } from './storage.js';
import {
  canTransitionStatus,
  createDecisionReport,
  createTimelineEntry,
  getCompositeOrganizationKey,
  normalizeReportShape,
  requiresDecisionMessage,
} from './reportUtils.js';

export const endpoints = {
  reports: '/api/reports',
  reportById: (id) => `/api/reports/${id}`,
  statistics: '/api/statistics',
  organizationStatistics: '/api/statistics/organizations',
  adminLogin: '/api/admin/login',
  adminReports: '/api/admin/reports',
  adminReportById: (id) => `/api/admin/reports/${id}`,
};

const http = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/api`,
  timeout: 15000,
});

http.interceptors.request.use((config) => {
  const session = getStoredAdminSession();
  if (session?.token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Token ${session.token}`;
  }
  return config;
});

const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));
const shouldUseMock = () => import.meta.env.VITE_USE_MOCK === 'true';
const unwrapResponse = (response) => response?.data?.data ?? response?.data ?? response;

const withBackendFallback = async (backendFn, fallbackFn) => {
  if (shouldUseMock()) {
    return fallbackFn();
  }

  try {
    return await backendFn();
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('Backend is not reachable, switched to local fallback:', error?.message || error);
    }
    return fallbackFn();
  }
};

const token = 'mock-admin-token';
const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const createIdSegment = (length) =>
  Array.from({ length }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');

const buildTrackingId = (regionId) => {
  const region = regionId?.slice(0, 3).toUpperCase() || 'GEN';
  return `UZ-${new Date().getFullYear().toString().slice(-2)}-${region}-${createIdSegment(4)}`;
};

const buildInternalId = () => `REP-${Date.now().toString().slice(-6)}`;

const sortReports = (reports) =>
  [...reports].sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));

const normalizeReport = (report) => normalizeReportShape(report);

const getReports = () => sortReports(getStoredReports().map(normalizeReport));

const saveReports = (reports) => setStoredReports(sortReports(reports.map(normalizeReport)));

const getTypeLabel = (typeId, t) =>
  t(CORRUPTION_TYPES.find((item) => item.id === typeId)?.labelKey || 'report.types.other');

const getStatusLabel = (statusId, t) =>
  t(REPORT_STATUSES.find((item) => item.id === statusId)?.labelKey || 'status.labels.pending');

const stripRuntimeFields = (evidence = []) =>
  evidence.map((item) => {
    const next = { ...item };
    delete next.rawFile;
    return next;
  });

const upsertLocalReport = (report) => {
  const reports = getReports();
  const index = reports.findIndex((item) => item.id === report.id);
  if (index === -1) {
    reports.unshift(report);
  } else {
    reports[index] = report;
  }
  saveReports(reports);
};

const createReportLocal = async (payload) => {
  await delay(800);

  const now = new Date().toISOString();
  const newReport = {
    id: buildInternalId(),
    trackingId: buildTrackingId(payload.regionId),
    corruptionType: payload.corruptionType,
    description: payload.description.trim(),
    incidentDate: payload.incidentDate,
    regionId: payload.regionId,
    cityId: payload.cityId,
    organizationTypeId: payload.organizationTypeId,
    organizationId: payload.organizationId,
    contact: payload.contact?.trim() || '',
    evidence: stripRuntimeFields(payload.evidence || []),
    status: 'pending',
    createdAt: now,
    updatedAt: now,
    decisionReport: null,
    timeline: [createTimelineEntry('pending', now)],
  };

  const normalized = normalizeReport(newReport);
  upsertLocalReport(normalized);
  return normalized;
};

const getReportByTrackingIdLocal = async (trackingId) => {
  await delay(400);
  const report = getReports().find(
    (item) => item.trackingId.toLowerCase() === trackingId.trim().toLowerCase(),
  );
  if (!report) {
    throw new Error('Report not found');
  }
  return report;
};

const getStatisticsLocal = async (language = 'uz', t = (value) => value) => {
  await delay(500);

  const reports = getReports();
  const byRegion = uzbekistanRegions.map((region) => {
    const count = reports.filter((report) => report.regionId === region.id).length;
    return {
      id: region.id,
      name: getLocalizedText(region.name, language),
      count,
    };
  });

  const statusDistribution = REPORT_STATUSES.map((status) => ({
    id: status.id,
    name: getStatusLabel(status.id, t),
    value: reports.filter((report) => report.status === status.id).length,
  }));

  const organizationCounts = reports.reduce((accumulator, report) => {
    const organization = findOrganization(
      report.regionId,
      report.cityId,
      report.organizationTypeId,
      report.organizationId,
    );
    const label = getLocalizedText(organization?.name, language) || report.organizationId;
    accumulator[label] = (accumulator[label] || 0) + 1;
    return accumulator;
  }, {});

  const topOrganizations = Object.entries(organizationCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((left, right) => right.count - left.count)
    .slice(0, 8);

  const drilldown = uzbekistanRegions.reduce((accumulator, region) => {
    const regionReports = reports.filter((report) => report.regionId === region.id);

    accumulator[region.id] = {
      regionName: getLocalizedText(region.name, language),
      total: regionReports.length,
      cities: region.cities.map((city) => {
        const cityReports = regionReports.filter((report) => report.cityId === city.id);
        const organizations = city.organizationTypes.flatMap((organizationType) =>
          organizationType.organizations.map((organization) => ({
            id: organization.id,
            name: getLocalizedText(organization.name, language),
            count: cityReports.filter((report) => report.organizationId === organization.id).length,
          })),
        );

        return {
          id: city.id,
          name: getLocalizedText(city.name, language),
          count: cityReports.length,
          organizations: organizations
            .filter((item) => item.count > 0)
            .sort((left, right) => right.count - left.count),
        };
      }),
    };

    return accumulator;
  }, {});

  const hotspotRegions = [...byRegion]
    .sort((left, right) => right.count - left.count)
    .filter((item) => item.count > 0)
    .slice(0, 3);

  return {
    totals: {
      reports: reports.length,
      accepted: reports.filter((report) => report.status === 'accepted').length,
      done: reports.filter((report) => report.status === 'done').length,
      pending: reports.filter((report) => report.status === 'pending').length,
      rejected: reports.filter((report) => report.status === 'rejected').length,
    },
    byRegion,
    statusDistribution,
    topOrganizations,
    drilldown,
    hotspotRegions,
  };
};

const buildOrganizationProfilesLocal = async (language = 'uz', t = (value) => value) => {
  await delay(350);

  const reports = getReports();

  const directory = uzbekistanRegions.flatMap((region) =>
    region.cities.flatMap((city) =>
      city.organizationTypes.flatMap((organizationType) =>
        organizationType.organizations.map((organization) => ({
          key: [region.id, city.id, organizationType.id, organization.id].join('::'),
          regionId: region.id,
          cityId: city.id,
          organizationTypeId: organizationType.id,
          organizationId: organization.id,
          regionName: getLocalizedText(region.name, language),
          cityName: getLocalizedText(city.name, language),
          organizationTypeLabel: t(`report.organizationTypes.${organizationType.id}`),
          organizationName: getLocalizedText(organization.name, language),
        })),
      ),
    ),
  );

  return directory
    .map((entry) => {
      const organizationReports = reports
        .filter((report) => getCompositeOrganizationKey(report) === entry.key)
        .map((report) => ({
          ...report,
          organizationName: entry.organizationName,
          organizationTypeLabel: entry.organizationTypeLabel,
          regionName: entry.regionName,
          cityName: entry.cityName,
          corruptionTypeLabel: getTypeLabel(report.corruptionType, t),
          statusLabel: getStatusLabel(report.status, t),
        }))
        .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));

      return {
        ...entry,
        totalReports: organizationReports.length,
        latestActivityAt: organizationReports[0]?.updatedAt || organizationReports[0]?.createdAt || '',
        statusCounts: REPORT_STATUSES.reduce(
          (accumulator, status) => ({
            ...accumulator,
            [status.id]: organizationReports.filter((report) => report.status === status.id).length,
          }),
          {},
        ),
        reports: organizationReports,
      };
    })
    .sort((left, right) => {
      if (right.totalReports !== left.totalReports) {
        return right.totalReports - left.totalReports;
      }
      return left.organizationName.localeCompare(right.organizationName);
    });
};

const getAdminReportsLocal = async (filters = {}) => {
  await delay(350);

  return getReports().filter((report) => {
    const organization = findOrganization(
      report.regionId,
      report.cityId,
      report.organizationTypeId,
      report.organizationId,
    );
    const organizationName = [
      organization?.name?.uz,
      organization?.name?.en,
      organization?.name?.ru,
      report.organizationId,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    const search = (filters.organization || '').toLowerCase();

    if (filters.regionId && report.regionId !== filters.regionId) {
      return false;
    }

    if (filters.status && filters.status !== 'all' && report.status !== filters.status) {
      return false;
    }

    if (search && !organizationName.includes(search)) {
      return false;
    }

    return true;
  });
};

const updateStatusLocal = async (reportId, nextStatus, message = '') => {
  await delay(300);
  const reports = getReports();
  const index = reports.findIndex((item) => item.id === reportId);
  if (index === -1) {
    throw new Error('Report not found.');
  }

  const currentReport = reports[index];
  if (!canTransitionStatus(currentReport.status, nextStatus)) {
    throw new Error('admin.statusLocked');
  }

  if (requiresDecisionMessage(nextStatus) && !message.trim()) {
    throw new Error('admin.decisionReportRequired');
  }

  const now = new Date().toISOString();
  const updated = {
    ...currentReport,
    status: nextStatus,
    updatedAt: now,
    decisionReport: createDecisionReport(nextStatus, message, now),
    timeline: [...currentReport.timeline, createTimelineEntry(nextStatus, now, { message })],
  };
  reports[index] = updated;
  saveReports(reports);
  return normalizeReport(updated);
};

export const reportService = {
  async createReport(payload) {
    return withBackendFallback(
      async () => {
        const formData = new FormData();
        formData.append('corruptionType', payload.corruptionType);
        formData.append('description', payload.description?.trim() || '');
        formData.append('incidentDate', payload.incidentDate);
        formData.append('regionId', payload.regionId);
        formData.append('cityId', payload.cityId);
        formData.append('organizationTypeId', payload.organizationTypeId);
        formData.append('organizationId', payload.organizationId);
        formData.append('contact', payload.contact?.trim() || '');

        (payload.evidence || [])
          .filter((item) => !item.invalid && item.rawFile instanceof File)
          .forEach((item) => formData.append('evidenceFiles', item.rawFile));

        const response = await http.post('/reports', formData);
        const report = normalizeReport(unwrapResponse(response));
        upsertLocalReport(report);
        return report;
      },
      async () => createReportLocal(payload),
    );
  },

  async getReportByTrackingId(trackingId) {
    return withBackendFallback(
      async () => {
        const response = await http.get(`/reports/${encodeURIComponent(trackingId.trim())}`);
        const report = normalizeReport(unwrapResponse(response));
        upsertLocalReport(report);
        return report;
      },
      async () => getReportByTrackingIdLocal(trackingId),
    );
  },
};

export const statisticsService = {
  async getStatistics(language = 'uz', t = (value) => value) {
    return withBackendFallback(
      async () => {
        const response = await http.get('/statistics', { params: { language } });
        const stats = unwrapResponse(response);
        return {
          ...stats,
          byRegion: (stats.byRegion || []).map((item) => {
            const region = findRegion(item.id);
            return {
              ...item,
              name: item.name || getLocalizedText(region?.name, language) || item.id,
            };
          }),
          statusDistribution: (stats.statusDistribution || []).map((item) => ({
            ...item,
            name: item.name || getStatusLabel(item.id, t),
          })),
          hotspotRegions: (stats.hotspotRegions || []).map((item) => {
            const region = findRegion(item.id);
            return {
              ...item,
              name: item.name || getLocalizedText(region?.name, language) || item.id,
            };
          }),
        };
      },
      async () => getStatisticsLocal(language, t),
    );
  },

  async getOrganizationProfiles(language = 'uz', t = (value) => value) {
    return withBackendFallback(
      async () => {
        const response = await http.get('/statistics/organizations', { params: { language } });
        const profiles = unwrapResponse(response) || [];

        return profiles.map((profile) => ({
          ...profile,
          key:
            profile.key ||
            [
              profile.regionId,
              profile.cityId,
              profile.organizationTypeId,
              profile.organizationId,
            ].join('::'),
          regionName:
            profile.regionName ||
            getLocalizedText(findRegion(profile.regionId)?.name, language) ||
            profile.regionId,
          cityName: profile.cityName || profile.cityId,
          organizationTypeLabel:
            profile.organizationTypeLabel || t(`report.organizationTypes.${profile.organizationTypeId}`),
          organizationName: profile.organizationName || profile.organizationId,
          reports: (profile.reports || []).map((report) => {
            const normalized = normalizeReport(report);
            return {
              ...normalized,
              corruptionTypeLabel: getTypeLabel(normalized.corruptionType, t),
              statusLabel: getStatusLabel(normalized.status, t),
            };
          }),
        }));
      },
      async () => buildOrganizationProfilesLocal(language, t),
    );
  },
};

export const adminService = {
  async login({ email, password }) {
    return withBackendFallback(
      async () => {
        try {
          const response = await http.post('/admin/login', { email, password });
          return unwrapResponse(response);
        } catch {
          throw new Error('admin.invalidCredentials');
        }
      },
      async () => {
        await delay(450);
        if (email === 'inspector@anticor.uz' && password === 'SecureAdmin123!') {
          return {
            token,
            email,
            name: 'Senior Compliance Officer',
          };
        }
        throw new Error('admin.invalidCredentials');
      },
    );
  },

  async getReports(filters = {}) {
    return withBackendFallback(
      async () => {
        const params = {};
        if (filters.regionId) {
          params.regionId = filters.regionId;
        }
        if (filters.status) {
          params.status = filters.status;
        }
        const response = await http.get('/admin/reports', { params });
        const reports = (unwrapResponse(response) || []).map(normalizeReport);

        const search = (filters.organization || '').toLowerCase();
        const filtered = reports.filter((report) => {
          if (!search) {
            return true;
          }
          const organization = findOrganization(
            report.regionId,
            report.cityId,
            report.organizationTypeId,
            report.organizationId,
          );
          const organizationName = [
            organization?.name?.uz,
            organization?.name?.en,
            organization?.name?.ru,
            report.organizationId,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
          return organizationName.includes(search);
        });

        if (!filters.regionId && (!filters.status || filters.status === 'all') && !filters.organization) {
          saveReports(filtered);
        }
        return filtered;
      },
      async () => getAdminReportsLocal(filters),
    );
  },

  async updateStatus(reportId, nextStatus, message = '') {
    return withBackendFallback(
      async () => {
        const response = await http.patch(`/admin/reports/${encodeURIComponent(reportId)}`, {
          status: nextStatus,
          decisionMessage: message.trim(),
        });
        const updated = normalizeReport(unwrapResponse(response));
        upsertLocalReport(updated);
        return updated;
      },
      async () => updateStatusLocal(reportId, nextStatus, message),
    );
  },
};

export function decorateReport(report, language, t) {
  const region = findRegion(report.regionId);
  const organization = findOrganization(
    report.regionId,
    report.cityId,
    report.organizationTypeId,
    report.organizationId,
  );

  return {
    ...report,
    regionName: getLocalizedText(region?.name, language),
    organizationName: getLocalizedText(organization?.name, language),
    corruptionTypeLabel: getTypeLabel(report.corruptionType, t),
    statusLabel: getStatusLabel(report.status, t),
  };
}

export default http;
