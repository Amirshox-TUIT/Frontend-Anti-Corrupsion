import { CORRUPTION_TYPES } from './reference.js';

const buildPreview = (label, background = '#102a4f', accent = '#b3212d') =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420" viewBox="0 0 640 420">
      <rect width="640" height="420" rx="28" fill="${background}" />
      <rect x="42" y="42" width="556" height="336" rx="20" fill="none" stroke="${accent}" stroke-width="3" stroke-dasharray="16 10" />
      <text x="320" y="185" text-anchor="middle" fill="#ffffff" font-size="34" font-family="IBM Plex Sans, Arial, sans-serif" font-weight="700">${label}</text>
      <text x="320" y="235" text-anchor="middle" fill="#c5d5f6" font-size="18" font-family="IBM Plex Sans, Arial, sans-serif">Mock evidence preview</text>
    </svg>`,
  )}`;

const createTimeline = ({
  submittedAt,
  acceptedAt,
  rejectedAt,
  rejectedMessage,
  doneAt,
  doneMessage,
}) => {
  const timeline = [
    {
      status: 'pending',
      date: submittedAt,
      titleKey: 'status.timeline.pending.title',
      descriptionKey: 'status.timeline.pending.description',
    },
  ];

  if (acceptedAt) {
    timeline.push({
      status: 'accepted',
      date: acceptedAt,
      titleKey: 'status.timeline.accepted.title',
      descriptionKey: 'status.timeline.accepted.description',
    });
  }

  if (rejectedAt) {
    timeline.push({
      status: 'rejected',
      date: rejectedAt,
      titleKey: 'status.timeline.rejected.title',
      descriptionKey: 'status.timeline.rejected.description',
      message: rejectedMessage || '',
    });
  }

  if (doneAt) {
    timeline.push({
      status: 'done',
      date: doneAt,
      titleKey: 'status.timeline.done.title',
      descriptionKey: 'status.timeline.done.description',
      message: doneMessage || '',
    });
  }

  return timeline;
};

const type = (id) => CORRUPTION_TYPES.find((item) => item.id === id)?.id || 'other';

export const seedReports = [
  {
    id: 'REP-1001',
    trackingId: 'UZ-26-TAS-31A9',
    corruptionType: type('bribery'),
    description:
      'A licensing clerk requested an unofficial payment before releasing university accreditation paperwork that had already been approved.',
    incidentDate: '2026-03-07',
    regionId: 'tashkent',
    cityId: 'tashkent-city',
    organizationTypeId: 'government-office',
    organizationId: 'tashkent-cadastre',
    contact: '',
    status: 'accepted',
    createdAt: '2026-03-08T08:15:00.000Z',
    updatedAt: '2026-03-09T11:10:00.000Z',
    timeline: createTimeline({
      submittedAt: '2026-03-08T08:15:00.000Z',
      acceptedAt: '2026-03-09T11:10:00.000Z',
    }),
    evidence: [
      {
        id: 'e-1001-1',
        name: 'voice-note-summary.jpg',
        size: 948000,
        type: 'image/jpeg',
        previewUrl: buildPreview('Licensing File'),
      },
    ],
  },
  {
    id: 'REP-1002',
    trackingId: 'UZ-26-SAM-6B2F',
    corruptionType: type('procurement'),
    description:
      'Medical equipment procurement was awarded to a connected supplier despite a higher cost and missing compliance documents.',
    incidentDate: '2026-02-28',
    regionId: 'samarkand',
    cityId: 'samarkand-city',
    organizationTypeId: 'hospital',
    organizationId: 'samarkand-regional-hospital',
    contact: 'observer@proton.me',
    status: 'done',
    createdAt: '2026-03-01T09:20:00.000Z',
    updatedAt: '2026-03-12T15:42:00.000Z',
    decisionReport: {
      status: 'done',
      message:
        'Procurement documents were audited, the vendor award was canceled, and the case was forwarded for disciplinary review.',
      createdAt: '2026-03-12T15:42:00.000Z',
      visibleToPublic: true,
    },
    timeline: createTimeline({
      submittedAt: '2026-03-01T09:20:00.000Z',
      acceptedAt: '2026-03-03T10:00:00.000Z',
      doneAt: '2026-03-12T15:42:00.000Z',
      doneMessage:
        'Procurement documents were audited, the vendor award was canceled, and the case was forwarded for disciplinary review.',
    }),
    evidence: [
      {
        id: 'e-1002-1',
        name: 'invoice-scan.png',
        size: 1240000,
        type: 'image/png',
        previewUrl: buildPreview('Invoice Scan', '#112b57', '#d07c12'),
      },
    ],
  },
  {
    id: 'REP-1003',
    trackingId: 'UZ-26-BUK-55D1',
    corruptionType: type('embezzlement'),
    description:
      'Funds assigned to student housing repairs were recorded as spent, but the dormitory blocks remain in the same damaged condition.',
    incidentDate: '2026-01-16',
    regionId: 'bukhara',
    cityId: 'bukhara-city',
    organizationTypeId: 'university',
    organizationId: 'buxdu',
    contact: '',
    status: 'pending',
    createdAt: '2026-01-17T13:05:00.000Z',
    updatedAt: '2026-01-17T13:05:00.000Z',
    timeline: createTimeline({
      submittedAt: '2026-01-17T13:05:00.000Z',
    }),
    evidence: [],
  },
  {
    id: 'REP-1004',
    trackingId: 'UZ-26-FER-91X4',
    corruptionType: type('extortion'),
    description:
      'Cargo drivers were routinely told to pay cash at an inspection point to avoid fabricated paperwork delays.',
    incidentDate: '2026-02-02',
    regionId: 'fergana',
    cityId: 'fergana-city',
    organizationTypeId: 'government-office',
    organizationId: 'fergana-transport',
    contact: '+998901112233',
    status: 'done',
    createdAt: '2026-02-03T06:15:00.000Z',
    updatedAt: '2026-02-14T18:00:00.000Z',
    decisionReport: {
      status: 'done',
      message:
        'Checkpoint supervisors were replaced, the payment scheme was documented, and transport inspections were moved to a monitored register.',
      createdAt: '2026-02-14T18:00:00.000Z',
      visibleToPublic: true,
    },
    timeline: createTimeline({
      submittedAt: '2026-02-03T06:15:00.000Z',
      acceptedAt: '2026-02-05T09:45:00.000Z',
      doneAt: '2026-02-14T18:00:00.000Z',
      doneMessage:
        'Checkpoint supervisors were replaced, the payment scheme was documented, and transport inspections were moved to a monitored register.',
    }),
    evidence: [
      {
        id: 'e-1004-1',
        name: 'checkpoint-video.mp4',
        size: 4200000,
        type: 'video/mp4',
      },
    ],
  },
  {
    id: 'REP-1005',
    trackingId: 'UZ-26-AND-77Q9',
    corruptionType: type('abuse-of-power'),
    description:
      'A district official used inspection authority to pressure a hospital contractor into using a relative-owned supplier.',
    incidentDate: '2026-03-11',
    regionId: 'andijan',
    cityId: 'andijan-city',
    organizationTypeId: 'hospital',
    organizationId: 'andijan-clinic',
    contact: '',
    status: 'accepted',
    createdAt: '2026-03-12T11:35:00.000Z',
    updatedAt: '2026-03-13T10:25:00.000Z',
    timeline: createTimeline({
      submittedAt: '2026-03-12T11:35:00.000Z',
      acceptedAt: '2026-03-13T10:25:00.000Z',
    }),
    evidence: [],
  },
  {
    id: 'REP-1006',
    trackingId: 'UZ-26-NAM-13P7',
    corruptionType: type('bribery'),
    description:
      'Applicants were told to make a payment through an intermediary to secure admission in a competitive faculty.',
    incidentDate: '2026-02-24',
    regionId: 'namangan',
    cityId: 'namangan-city',
    organizationTypeId: 'university',
    organizationId: 'namdu',
    contact: '',
    status: 'rejected',
    createdAt: '2026-02-25T12:11:00.000Z',
    updatedAt: '2026-03-01T09:30:00.000Z',
    decisionReport: {
      status: 'rejected',
      message:
        'The claim could not be escalated because no supporting evidence or independently verifiable facts were attached.',
      createdAt: '2026-03-01T09:30:00.000Z',
      visibleToPublic: true,
    },
    timeline: createTimeline({
      submittedAt: '2026-02-25T12:11:00.000Z',
      rejectedAt: '2026-03-01T09:30:00.000Z',
      rejectedMessage:
        'The claim could not be escalated because no supporting evidence or independently verifiable facts were attached.',
    }),
    evidence: [],
  },
  {
    id: 'REP-1007',
    trackingId: 'UZ-26-NAV-88K1',
    corruptionType: type('procurement'),
    description:
      'Mining safety equipment was purchased at an inflated rate from a vendor tied to the procurement commission.',
    incidentDate: '2026-01-23',
    regionId: 'navoi',
    cityId: 'navoi-city',
    organizationTypeId: 'government-office',
    organizationId: 'navoi-procurement',
    contact: '',
    status: 'accepted',
    createdAt: '2026-01-24T07:48:00.000Z',
    updatedAt: '2026-01-26T08:10:00.000Z',
    timeline: createTimeline({
      submittedAt: '2026-01-24T07:48:00.000Z',
      acceptedAt: '2026-01-26T08:10:00.000Z',
    }),
    evidence: [
      {
        id: 'e-1007-1',
        name: 'contract-summary.png',
        size: 840000,
        type: 'image/png',
        previewUrl: buildPreview('Contract Summary', '#15315f', '#24a0ed'),
      },
    ],
  },
  {
    id: 'REP-1008',
    trackingId: 'UZ-26-QAS-42M6',
    corruptionType: type('embezzlement'),
    description:
      'Agricultural support payments were routed to ghost beneficiaries connected to local officials.',
    incidentDate: '2026-03-03',
    regionId: 'kashkadarya',
    cityId: 'qarshi',
    organizationTypeId: 'government-office',
    organizationId: 'qarshi-agency',
    contact: 'securemail@pm.me',
    status: 'pending',
    createdAt: '2026-03-03T14:50:00.000Z',
    updatedAt: '2026-03-03T14:50:00.000Z',
    timeline: createTimeline({
      submittedAt: '2026-03-03T14:50:00.000Z',
    }),
    evidence: [],
  },
  {
    id: 'REP-1009',
    trackingId: 'UZ-26-SUR-19R5',
    corruptionType: type('bribery'),
    description:
      'Border area medicine deliveries were delayed unless suppliers provided off-book payments to release stock.',
    incidentDate: '2026-03-18',
    regionId: 'surkhandarya',
    cityId: 'termez',
    organizationTypeId: 'hospital',
    organizationId: 'termez-border-clinic',
    contact: '',
    status: 'accepted',
    createdAt: '2026-03-19T10:10:00.000Z',
    updatedAt: '2026-03-20T12:25:00.000Z',
    timeline: createTimeline({
      submittedAt: '2026-03-19T10:10:00.000Z',
      acceptedAt: '2026-03-20T12:25:00.000Z',
    }),
    evidence: [],
  },
  {
    id: 'REP-1010',
    trackingId: 'UZ-26-JIZ-83T2',
    corruptionType: type('abuse-of-power'),
    description:
      'A roadworks manager rejected qualified bidders after instructions from a supervising official to favor a single contractor.',
    incidentDate: '2026-02-09',
    regionId: 'jizzakh',
    cityId: 'jizzakh-city',
    organizationTypeId: 'government-office',
    organizationId: 'jizzakh-roads',
    contact: '',
    status: 'done',
    createdAt: '2026-02-10T08:40:00.000Z',
    updatedAt: '2026-02-19T16:00:00.000Z',
    decisionReport: {
      status: 'done',
      message:
        'The bid review was reopened, the noncompliant award was suspended, and the procurement file was transferred to internal control.',
      createdAt: '2026-02-19T16:00:00.000Z',
      visibleToPublic: true,
    },
    timeline: createTimeline({
      submittedAt: '2026-02-10T08:40:00.000Z',
      acceptedAt: '2026-02-12T09:10:00.000Z',
      doneAt: '2026-02-19T16:00:00.000Z',
      doneMessage:
        'The bid review was reopened, the noncompliant award was suspended, and the procurement file was transferred to internal control.',
    }),
    evidence: [
      {
        id: 'e-1010-1',
        name: 'bid-comparison.jpg',
        size: 720000,
        type: 'image/jpeg',
        previewUrl: buildPreview('Bid Comparison', '#0c2445', '#0d8a6a'),
      },
    ],
  },
  {
    id: 'REP-1011',
    trackingId: 'UZ-26-SIR-28C8',
    corruptionType: type('other'),
    description:
      'Public housing approval lists were reportedly changed after undisclosed side payments to municipal staff.',
    incidentDate: '2026-03-04',
    regionId: 'syrdarya',
    cityId: 'yangiyer',
    organizationTypeId: 'government-office',
    organizationId: 'yangiyer-housing',
    contact: '',
    status: 'pending',
    createdAt: '2026-03-05T09:55:00.000Z',
    updatedAt: '2026-03-05T09:55:00.000Z',
    timeline: createTimeline({
      submittedAt: '2026-03-05T09:55:00.000Z',
    }),
    evidence: [],
  },
  {
    id: 'REP-1012',
    trackingId: 'UZ-26-XOR-64L0',
    corruptionType: type('extortion'),
    description:
      'A heritage permit officer repeatedly demanded informal payments before processing hotel renovation approvals.',
    incidentDate: '2026-01-29',
    regionId: 'khorezm',
    cityId: 'khiva',
    organizationTypeId: 'government-office',
    organizationId: 'khiva-heritage',
    contact: '',
    status: 'accepted',
    createdAt: '2026-01-30T11:08:00.000Z',
    updatedAt: '2026-01-31T07:20:00.000Z',
    timeline: createTimeline({
      submittedAt: '2026-01-30T11:08:00.000Z',
      acceptedAt: '2026-01-31T07:20:00.000Z',
    }),
    evidence: [],
  },
];
