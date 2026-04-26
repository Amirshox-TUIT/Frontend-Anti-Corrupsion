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
    reports: '/api/reports/',
    reportById: (id) => `/api/reports/${id}/`,
    statistics: '/api/statistics/',
    organizationStatistics: '/api/statistics/organizations/',
    adminLogin: '/api/admin/login/',
    adminReports: '/api/admin/reports/',
    adminReportById: (id) => `/api/admin/reports/${id}/`,
    adminRewardAssign: (id) => `/api/admin/reports/${id}/reward/`,
    rewardClaim: '/api/rewards/claim/',
};

// ─── Axios instance ───────────────────────────────────────────────────────────
const http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000',
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

// ─── Yordamchi funksiyalar ────────────────────────────────────────────────────
const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));
const shouldUseMock = () => import.meta.env.VITE_USE_MOCK === 'true';
const unwrapResponse = (response) => response?.data?.data ?? response?.data ?? response;

const withBackendFallback = async (backendFn, fallbackFn) => {
    if (shouldUseMock()) return fallbackFn();
    try {
        return await backendFn();
    } catch (error) {
        if (import.meta.env.DEV) {
            console.warn('Backend is not reachable, switched to local fallback:', error?.message || error);
        }
        return fallbackFn();
    }
};

const mockToken = 'mock-admin-token';
const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const createIdSegment = (length) =>
    Array.from({ length }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
const buildTrackingId = (regionId) => {
    const region = regionId?.slice(0, 3).toUpperCase() || 'GEN';
    return `UZ-${new Date().getFullYear().toString().slice(-2)}-${region}-${createIdSegment(4)}`;
};
const buildInternalId = () => `REP-${Date.now().toString().slice(-6)}`;

const sortReports = (reports) =>
    [...reports].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

const normalizeReport = (report) => normalizeReportShape(report);
const getReports = () => sortReports(getStoredReports().map(normalizeReport));
const saveReports = (reports) => setStoredReports(sortReports(reports.map(normalizeReport)));

const getTypeLabel = (typeId, t) =>
    t(CORRUPTION_TYPES.find((item) => item.id === typeId)?.labelKey || 'report.types.other');
const getStatusLabel = (statusId, t) =>
    t(REPORT_STATUSES.find((item) => item.id === statusId)?.labelKey || 'status.labels.pending');

const stripRuntimeFields = (evidence = []) =>
    evidence.map((item) => { const next = { ...item }; delete next.rawFile; return next; });

const upsertLocalReport = (report) => {
    const reports = getReports();
    const index = reports.findIndex((item) => item.id === report.id);
    if (index === -1) reports.unshift(report);
    else reports[index] = report;
    saveReports(reports);
};

// ─── Mock funksiyalar ─────────────────────────────────────────────────────────
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
    if (!report) throw new Error('Report not found');
    return report;
};

const getStatisticsLocal = async (language = 'uz', t = (v) => v) => {
    await delay(500);
    const reports = getReports();
    const byRegion = uzbekistanRegions.map((region) => ({
        id: region.id,
        name: getLocalizedText(region.name, language),
        count: reports.filter((r) => r.regionId === region.id).length,
    }));
    const statusDistribution = REPORT_STATUSES.map((status) => ({
        id: status.id,
        name: getStatusLabel(status.id, t),
        value: reports.filter((r) => r.status === status.id).length,
    }));
    const organizationCounts = reports.reduce((acc, report) => {
        const org = findOrganization(report.regionId, report.cityId, report.organizationTypeId, report.organizationId);
        const label = getLocalizedText(org?.name, language) || report.organizationId;
        acc[label] = (acc[label] || 0) + 1;
        return acc;
    }, {});
    const topOrganizations = Object.entries(organizationCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);
    const drilldown = uzbekistanRegions.reduce((acc, region) => {
        const regionReports = reports.filter((r) => r.regionId === region.id);
        acc[region.id] = {
            regionName: getLocalizedText(region.name, language),
            total: regionReports.length,
            cities: region.cities.map((city) => {
                const cityReports = regionReports.filter((r) => r.cityId === city.id);
                const organizations = city.organizationTypes.flatMap((ot) =>
                    ot.organizations.map((org) => ({
                        id: org.id,
                        name: getLocalizedText(org.name, language),
                        count: cityReports.filter((r) => r.organizationId === org.id).length,
                    })),
                );
                return {
                    id: city.id,
                    name: getLocalizedText(city.name, language),
                    count: cityReports.length,
                    organizations: organizations.filter((o) => o.count > 0).sort((a, b) => b.count - a.count),
                };
            }),
        };
        return acc;
    }, {});
    const hotspotRegions = [...byRegion].sort((a, b) => b.count - a.count).filter((r) => r.count > 0).slice(0, 3);
    return {
        totals: {
            reports: reports.length,
            accepted: reports.filter((r) => r.status === 'accepted').length,
            done: reports.filter((r) => r.status === 'done').length,
            pending: reports.filter((r) => r.status === 'pending').length,
            rejected: reports.filter((r) => r.status === 'rejected').length,
        },
        byRegion,
        statusDistribution,
        topOrganizations,
        drilldown,
        hotspotRegions,
    };
};

const buildOrganizationProfilesLocal = async (language = 'uz', t = (v) => v) => {
    await delay(350);
    const reports = getReports();
    const directory = uzbekistanRegions.flatMap((region) =>
        region.cities.flatMap((city) =>
            city.organizationTypes.flatMap((ot) =>
                ot.organizations.map((org) => ({
                    key: [region.id, city.id, ot.id, org.id].join('::'),
                    regionId: region.id, cityId: city.id,
                    organizationTypeId: ot.id, organizationId: org.id,
                    regionName: getLocalizedText(region.name, language),
                    cityName: getLocalizedText(city.name, language),
                    organizationTypeLabel: t(`report.organizationTypes.${ot.id}`),
                    organizationName: getLocalizedText(org.name, language),
                })),
            ),
        ),
    );
    return directory
        .map((entry) => {
            const orgReports = reports
                .filter((r) => getCompositeOrganizationKey(r) === entry.key)
                .map((r) => ({
                    ...r,
                    organizationName: entry.organizationName,
                    organizationTypeLabel: entry.organizationTypeLabel,
                    regionName: entry.regionName,
                    cityName: entry.cityName,
                    corruptionTypeLabel: getTypeLabel(r.corruptionType, t),
                    statusLabel: getStatusLabel(r.status, t),
                }))
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            return {
                ...entry,
                totalReports: orgReports.length,
                latestActivityAt: orgReports[0]?.updatedAt || orgReports[0]?.createdAt || '',
                statusCounts: REPORT_STATUSES.reduce(
                    (acc, s) => ({ ...acc, [s.id]: orgReports.filter((r) => r.status === s.id).length }),
                    {},
                ),
                reports: orgReports,
            };
        })
        .sort((a, b) =>
            b.totalReports !== a.totalReports
                ? b.totalReports - a.totalReports
                : a.organizationName.localeCompare(b.organizationName),
        );
};

const getAdminReportsLocal = async (filters = {}) => {
    await delay(350);
    return getReports().filter((report) => {
        const org = findOrganization(report.regionId, report.cityId, report.organizationTypeId, report.organizationId);
        const orgName = [org?.name?.uz, org?.name?.en, org?.name?.ru, report.organizationId]
            .filter(Boolean).join(' ').toLowerCase();
        const search = (filters.organization || '').toLowerCase();
        if (filters.regionId && report.regionId !== filters.regionId) return false;
        if (filters.status && filters.status !== 'all' && report.status !== filters.status) return false;
        if (search && !orgName.includes(search)) return false;
        return true;
    });
};

const updateStatusLocal = async (reportId, nextStatus, message = '') => {
    await delay(300);
    const reports = getReports();
    const index = reports.findIndex((item) => item.id === reportId);
    if (index === -1) throw new Error('Report not found.');
    const currentReport = reports[index];
    if (!canTransitionStatus(currentReport.status, nextStatus)) throw new Error('admin.statusLocked');
    if (requiresDecisionMessage(nextStatus) && !message.trim()) throw new Error('admin.decisionReportRequired');
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

// ─── Report service ───────────────────────────────────────────────────────────
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
                const response = await http.post('/api/reports/', formData);
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
                const response = await http.get(`/api/reports/${encodeURIComponent(trackingId.trim())}/`);
                const report = normalizeReport(unwrapResponse(response));
                upsertLocalReport(report);
                return report;
            },
            async () => getReportByTrackingIdLocal(trackingId),
        );
    },

    // FIX 4: claimReward metodi qo'shildi
    async claimReward(trackingId, wallet) {
        return withBackendFallback(
            async () => {
                const response = await http.post('/api/rewards/claim/', { trackingId, wallet });
                return unwrapResponse(response);
            },
            async () => {
                await delay(400);
                throw new Error('Reward claim is only available with a live backend.');
            },
        );
    },
};

// ─── Statistics service ───────────────────────────────────────────────────────
export const statisticsService = {
    async getStatistics(language = 'uz', t = (v) => v) {
        return withBackendFallback(
            async () => {
                const response = await http.get('/api/statistics/', { params: { language } });
                const stats = unwrapResponse(response);
                return {
                    ...stats,
                    byRegion: (stats.byRegion || []).map((item) => {
                        const region = findRegion(item.id);
                        return { ...item, name: item.name || getLocalizedText(region?.name, language) || item.id };
                    }),
                    statusDistribution: (stats.statusDistribution || []).map((item) => ({
                        ...item,
                        name: item.name || getStatusLabel(item.id, t),
                    })),
                    hotspotRegions: (stats.hotspotRegions || []).map((item) => {
                        const region = findRegion(item.id);
                        return { ...item, name: item.name || getLocalizedText(region?.name, language) || item.id };
                    }),
                };
            },
            async () => getStatisticsLocal(language, t),
        );
    },

    async getOrganizationProfiles(language = 'uz', t = (v) => v) {
        return withBackendFallback(
            async () => {
                const response = await http.get('/api/statistics/organizations/', { params: { language } });
                const profiles = unwrapResponse(response) || [];
                return profiles.map((profile) => ({
                    ...profile,
                    key: profile.key || [profile.regionId, profile.cityId, profile.organizationTypeId, profile.organizationId].join('::'),
                    regionName: profile.regionName || getLocalizedText(findRegion(profile.regionId)?.name, language) || profile.regionId,
                    cityName: profile.cityName || profile.cityId,
                    organizationTypeLabel: profile.organizationTypeLabel || t(`report.organizationTypes.${profile.organizationTypeId}`),
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

// ─── Admin service ────────────────────────────────────────────────────────────
export const adminService = {
    // FIX 3: ham { email, password } object, ham (email, password) shaklini qabul qiladi
    async login(emailOrObj, password) {
        let email, pwd;
        if (typeof emailOrObj === 'object' && emailOrObj !== null) {
            email = emailOrObj.email;
            pwd = emailOrObj.password;
        } else {
            email = emailOrObj;
            pwd = password;
        }
        return withBackendFallback(
            async () => {
                try {
                    const response = await http.post('/api/admin/login/', { email, password: pwd });
                    return unwrapResponse(response);
                } catch {
                    throw new Error('admin.invalidCredentials');
                }
            },
            async () => {
                await delay(450);
                if (email === 'inspector@anticor.uz' && pwd === 'SecureAdmin123!') {
                    return { token: mockToken, email, name: 'Senior Compliance Officer' };
                }
                throw new Error('admin.invalidCredentials');
            },
        );
    },

    async getReports(filters = {}) {
        return withBackendFallback(
            async () => {
                const params = {};
                if (filters.regionId) params.regionId = filters.regionId;
                if (filters.status) params.status = filters.status;
                const response = await http.get('/api/admin/reports/', { params });
                const reports = (unwrapResponse(response) || []).map(normalizeReport);
                const search = (filters.organization || '').toLowerCase();
                const filtered = reports.filter((report) => {
                    if (!search) return true;
                    const org = findOrganization(report.regionId, report.cityId, report.organizationTypeId, report.organizationId);
                    const orgName = [org?.name?.uz, org?.name?.en, org?.name?.ru, report.organizationId]
                        .filter(Boolean).join(' ').toLowerCase();
                    return orgName.includes(search);
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
                const response = await http.patch(`/api/admin/reports/${encodeURIComponent(reportId)}/`, {
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

    // FIX 2: assignReward metodi qo'shildi (AdminDashboard.jsx ishlatadi)
    async assignReward(reportId, amount) {
        return withBackendFallback(
            async () => {
                const response = await http.post(
                    `/api/admin/reports/${encodeURIComponent(reportId)}/reward/`,
                    { amount },
                );
                const updated = normalizeReport(unwrapResponse(response));
                upsertLocalReport(updated);
                return updated;
            },
            async () => {
                await delay(300);
                const reports = getReports();
                const index = reports.findIndex((r) => r.id === reportId);
                if (index === -1) throw new Error('Report not found.');
                const updated = {
                    ...reports[index],
                    rewardInfo: {
                        amount: String(amount),
                        currency: 'USDT',
                        claimed: false,
                        claimedAt: null,
                        wallet: '',
                        txHash: null,
                    },
                    updatedAt: new Date().toISOString(),
                };
                reports[index] = updated;
                saveReports(reports);
                return normalizeReport(updated);
            },
        );
    },
};

// ─── decorateReport ───────────────────────────────────────────────────────────
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