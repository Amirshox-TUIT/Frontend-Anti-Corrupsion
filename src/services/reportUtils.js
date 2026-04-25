export const FINAL_STATUSES = ['rejected', 'done'];

export const STATUS_TRANSITIONS = {
  pending: ['accepted', 'rejected'],
  accepted: ['done', 'rejected'],
  rejected: [],
  done: [],
};

const TIMELINE_COPY = {
  pending: {
    titleKey: 'status.timeline.pending.title',
    descriptionKey: 'status.timeline.pending.description',
  },
  accepted: {
    titleKey: 'status.timeline.accepted.title',
    descriptionKey: 'status.timeline.accepted.description',
  },
  rejected: {
    titleKey: 'status.timeline.rejected.title',
    descriptionKey: 'status.timeline.rejected.description',
  },
  done: {
    titleKey: 'status.timeline.done.title',
    descriptionKey: 'status.timeline.done.description',
  },
};

export function isFinalStatus(status) {
  return FINAL_STATUSES.includes(status);
}

export function requiresDecisionMessage(status) {
  return isFinalStatus(status);
}

export function canTransitionStatus(currentStatus, nextStatus) {
  if (!currentStatus || !nextStatus) {
    return false;
  }

  if (currentStatus === nextStatus) {
    return true;
  }

  return STATUS_TRANSITIONS[currentStatus]?.includes(nextStatus) || false;
}

export function createDecisionReport(status, message, createdAt) {
  if (!requiresDecisionMessage(status) || !message?.trim()) {
    return null;
  }

  return {
    status,
    message: message.trim(),
    createdAt,
    visibleToPublic: true,
  };
}

export function createTimelineEntry(status, date, options = {}) {
  return {
    status,
    date,
    ...TIMELINE_COPY[status],
    message: options.message?.trim() || '',
  };
}

export function normalizeReportShape(report) {
  const decisionReport =
    report.decisionReport || report.decision_report
      ? {
          status:
            report.decisionReport?.status ||
            report.decision_report?.status ||
            report.status ||
            '',
          message:
            report.decisionReport?.message || report.decision_report?.message || '',
          createdAt:
            report.decisionReport?.createdAt ||
            report.decisionReport?.created_at ||
            report.decision_report?.createdAt ||
            report.decision_report?.created_at ||
            report.updatedAt ||
            report.updated_at ||
            '',
          visibleToPublic:
            report.decisionReport?.visibleToPublic ??
            report.decisionReport?.visible_to_public ??
            report.decision_report?.visibleToPublic ??
            report.decision_report?.visible_to_public ??
            true,
        }
      : null;

  return {
    ...report,
    decisionReport:
      decisionReport?.message && requiresDecisionMessage(decisionReport.status) ? decisionReport : null,
    evidence: (report.evidence || []).map((item, index) => ({
      id: item.id || `e-${index + 1}`,
      name: item.name || item.originalFilename || item.original_name || 'evidence',
      size: item.size ?? item.fileSize ?? item.file_size ?? 0,
      type: item.type || item.mimeType || item.mime_type || 'application/octet-stream',
      previewUrl: item.previewUrl || item.preview_url || '',
    })),
    timeline: (report.timeline || []).map((entry) => ({
      status: entry.status,
      date: entry.date,
      titleKey: entry.titleKey || entry.title_key || entry.title,
      descriptionKey: entry.descriptionKey || entry.description_key || entry.description,
      message: entry.message || '',
    })),
  };
}

export function getCompositeOrganizationKey(report) {
  return [report.regionId, report.cityId, report.organizationTypeId, report.organizationId].join('::');
}
