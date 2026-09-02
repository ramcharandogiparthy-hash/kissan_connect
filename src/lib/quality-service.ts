export type QualityStepStatus = 'completed' | 'in_progress' | 'pending' | 'failed';

export type QualityDecision = 'accepted' | 'in_progress' | 'rejected' | 'review_required';

export interface QualityParameter {
  id: string;
  name: string;
  measuredValue: string;
  numericValue: number;
  targetRange: string;
  unit: string;
  status: 'good' | 'attention' | 'outside_limit';
  note: string;
}

export interface QualityAuditEntry {
  id: string;
  timestamp: number;
  timeStr: string;
  title: string;
  description: string;
  actorRole: 'system' | 'ai' | 'staff' | 'officer';
  actorName: string;
  status: QualityStepStatus;
}

export interface QualityCheckupRecord {
  id: string;
  tokenId: string;
  farmerName: string;
  farmerPhone: string;
  crop: string;
  quantityQuintals: number;
  centerName: string;
  dateStr: string;
  score: number; // 0 to 100
  scoreLabel: string; // e.g. "Good Quality"
  moisturePct: number;
  moistureStatus: 'good' | 'attention' | 'high';
  qualityGrade: string; // e.g. "Grade A"
  decision: QualityDecision;
  rejectionReason?: string;
  rejectionParameter?: string;
  rejectionAction?: string;
  aiInsightText: string;
  aiRecommendations: string[];
  parameters: QualityParameter[];
  timeline: {
    received: { status: QualityStepStatus; timeStr: string; actor: string; note: string };
    sampleCollected: { status: QualityStepStatus; timeStr: string; actor: string; note: string };
    moistureTested: { status: QualityStepStatus; timeStr: string; actor: string; note: string };
    qualityAssessment: { status: QualityStepStatus; timeStr: string; actor: string; note: string };
    finalVerification: { status: QualityStepStatus; timeStr: string; actor: string; note: string };
    decisionMade: { status: QualityStepStatus; timeStr: string; actor: string; note: string };
  };
  aiAssessmentCompleted: boolean;
  aiAssessmentTimeStr?: string;
  staffVerified: boolean;
  verifiedBy?: string;
  verifiedById?: string;
  verifiedAt?: number;
  verifiedAtStr?: string;
  certificateId?: string;
  auditTrail: QualityAuditEntry[];
}

export const INITIAL_QUALITY_RECORDS: QualityCheckupRecord[] = [
  {
    id: 'QC-2026-A127',
    tokenId: 'A127',
    farmerName: 'Ravi Kumar',
    farmerPhone: '+91 98765 43210',
    crop: 'Paddy (Grade A)',
    quantityQuintals: 40,
    centerName: 'Kisan Procurement Center A',
    dateStr: '1 September 2026',
    score: 92,
    scoreLabel: 'Good Quality',
    moisturePct: 13.2,
    moistureStatus: 'good',
    qualityGrade: 'Grade A',
    decision: 'in_progress',
    aiInsightText:
      'Your uploaded sample data indicates good preliminary quality. Moisture level (13.2%) is within the configured target range for MSP procurement.',
    aiRecommendations: [
      'Keep produce protected from rain or morning dew',
      'Store grain bags in a well-ventilated, dry area',
      'Avoid mixing different crop varieties or quality grades',
      'Bring required gate pass token A127 and Aadhaar card',
    ],
    parameters: [
      {
        id: 'moisture',
        name: 'Moisture',
        measuredValue: '13.2%',
        numericValue: 13.2,
        targetRange: '12.0% - 14.0%',
        unit: '%',
        status: 'good',
        note: 'Within acceptable range',
      },
      {
        id: 'foreign_matter',
        name: 'Foreign Matter',
        measuredValue: '0.4%',
        numericValue: 0.4,
        targetRange: 'Max 1.0%',
        unit: '%',
        status: 'good',
        note: 'Within acceptable range',
      },
      {
        id: 'grain_quality',
        name: 'Grain Quality',
        measuredValue: 'Grade A',
        numericValue: 95,
        targetRange: 'Grade A / Common',
        unit: 'Grade',
        status: 'good',
        note: 'Good lustre & size',
      },
      {
        id: 'damaged_grains',
        name: 'Damaged Grains',
        measuredValue: '1.2%',
        numericValue: 1.2,
        targetRange: 'Max 2.0%',
        unit: '%',
        status: 'good',
        note: 'Within acceptable range',
      },
      {
        id: 'broken_grains',
        name: 'Broken Grains',
        measuredValue: '2.1%',
        numericValue: 2.1,
        targetRange: 'Max 4.0%',
        unit: '%',
        status: 'good',
        note: 'Within acceptable range',
      },
    ],
    timeline: {
      received: {
        status: 'completed',
        timeStr: '10:15 AM',
        actor: 'Gate Inspector (Gate 2)',
        note: 'Produce batch arrived and weighed at weighbridge #1',
      },
      sampleCollected: {
        status: 'completed',
        timeStr: '10:24 AM',
        actor: 'Sampling Technician K. Reddi',
        note: 'Sample collected successfully',
      },
      moistureTested: {
        status: 'completed',
        timeStr: '10:31 AM',
        actor: 'Digital Moisture Scanner #3',
        note: 'Moisture measurement completed',
      },
      qualityAssessment: {
        status: 'in_progress',
        timeStr: '10:45 AM',
        actor: 'Kisan AI Vision & Quality Analyzer',
        note: 'In progress...',
      },
      finalVerification: {
        status: 'pending',
        timeStr: 'Pending',
        actor: 'Authorized Procurement Officer',
        note: 'Waiting for authorized staff verification',
      },
      decisionMade: {
        status: 'pending',
        timeStr: 'Pending',
        actor: 'Procurement Center Supervisor',
        note: 'Final official procurement decision pending verification',
      },
    },
    aiAssessmentCompleted: true,
    aiAssessmentTimeStr: '10:45 AM',
    staffVerified: false,
    auditTrail: [
      {
        id: 'aud-qc-1',
        timestamp: Date.now() - 35 * 60 * 1000,
        timeStr: '10:15 AM',
        title: 'Produce Received',
        description: 'Batch of 40 Quintals Paddy received at Kisan Procurement Center A',
        actorRole: 'system',
        actorName: 'Gate Weighbridge Scanner',
        status: 'completed',
      },
      {
        id: 'aud-qc-2',
        timestamp: Date.now() - 26 * 60 * 1000,
        timeStr: '10:24 AM',
        title: 'Sample Collected',
        description: 'Sample collected successfully (#SMP-8842 drawn and tagged)',
        actorRole: 'staff',
        actorName: 'Sampling Tech K. Reddi',
        status: 'completed',
      },
      {
        id: 'aud-qc-3',
        timestamp: Date.now() - 19 * 60 * 1000,
        timeStr: '10:31 AM',
        title: 'Moisture Measurement Completed',
        description: 'Digital sensor recorded 13.2% moisture level',
        actorRole: 'ai',
        actorName: 'Digital Moisture Probe #3',
        status: 'completed',
      },
      {
        id: 'aud-qc-4',
        timestamp: Date.now() - 5 * 60 * 1000,
        timeStr: '10:45 AM',
        title: 'Quality Assessment Started',
        description: 'AI vision model evaluated grain lustre, size, and damage % (Score: 92/100)',
        actorRole: 'ai',
        actorName: 'Kisan Vision AI Model v2.4',
        status: 'in_progress',
      },
    ],
  },
  {
    id: 'QC-2026-A124',
    tokenId: 'A124',
    farmerName: 'Venkat Rao',
    farmerPhone: '+91 94401 23456',
    crop: 'Paddy (Grade A)',
    quantityQuintals: 45,
    centerName: 'Kisan Procurement Center A',
    dateStr: '1 September 2026',
    score: 95,
    scoreLabel: 'Superior Quality',
    moisturePct: 12.8,
    moistureStatus: 'good',
    qualityGrade: 'Grade A',
    decision: 'accepted',
    aiInsightText: 'Exceptional grain quality with low moisture (12.8%). Approved for full MSP rate payout.',
    aiRecommendations: [
      'Proceed to gate exit with signed receipt',
      'Bank disbursement will process within 24 hours',
    ],
    parameters: [
      { id: 'moisture', name: 'Moisture', measuredValue: '12.8%', numericValue: 12.8, targetRange: '12.0% - 14.0%', unit: '%', status: 'good', note: 'Within acceptable range' },
      { id: 'foreign_matter', name: 'Foreign Matter', measuredValue: '0.2%', numericValue: 0.2, targetRange: 'Max 1.0%', unit: '%', status: 'good', note: 'Within acceptable range' },
      { id: 'grain_quality', name: 'Grain Quality', measuredValue: 'Grade A', numericValue: 98, targetRange: 'Grade A', unit: 'Grade', status: 'good', note: 'Good lustre & size' },
      { id: 'damaged_grains', name: 'Damaged Grains', measuredValue: '0.8%', numericValue: 0.8, targetRange: 'Max 2.0%', unit: '%', status: 'good', note: 'Within acceptable range' },
      { id: 'broken_grains', name: 'Broken Grains', measuredValue: '1.5%', numericValue: 1.5, targetRange: 'Max 4.0%', unit: '%', status: 'good', note: 'Within acceptable range' },
    ],
    timeline: {
      received: { status: 'completed', timeStr: '09:30 AM', actor: 'Gate Officer', note: 'Received' },
      sampleCollected: { status: 'completed', timeStr: '09:40 AM', actor: 'Tech R. Varma', note: 'Sample drawn' },
      moistureTested: { status: 'completed', timeStr: '09:45 AM', actor: 'Digital Sensor', note: '12.8% recorded' },
      qualityAssessment: { status: 'completed', timeStr: '09:50 AM', actor: 'Vision AI', note: 'Grade A confirmed' },
      finalVerification: { status: 'completed', timeStr: '10:00 AM', actor: 'Procurement Officer S. Rao', note: 'Verified & Signed' },
      decisionMade: { status: 'completed', timeStr: '10:05 AM', actor: 'Supervisor M. Naidu', note: 'Accepted for MSP Payout' },
    },
    aiAssessmentCompleted: true,
    aiAssessmentTimeStr: '09:50 AM',
    staffVerified: true,
    verifiedBy: 'Officer S. Rao (ID: OFF-842)',
    verifiedById: 'OFF-842',
    verifiedAt: Date.now() - 60 * 60 * 1000,
    verifiedAtStr: '10:05 AM, 1 Sep 2026',
    certificateId: 'KC-QC-2026-A124-8842',
    auditTrail: [
      { id: 'aud-v1', timestamp: Date.now() - 60 * 60 * 1000, timeStr: '10:05 AM', title: 'Official Quality Acceptance', description: 'Batch officially accepted by Officer S. Rao', actorRole: 'officer', actorName: 'Officer S. Rao', status: 'completed' },
    ],
  },
  {
    id: 'QC-2026-A125',
    tokenId: 'A125',
    farmerName: 'Srinivas Reddi',
    farmerPhone: '+91 98480 88776',
    crop: 'Paddy (Common)',
    quantityQuintals: 35,
    centerName: 'Kisan Procurement Center A',
    dateStr: '1 September 2026',
    score: 64,
    scoreLabel: 'Attention Required',
    moisturePct: 17.8,
    moistureStatus: 'high',
    qualityGrade: 'Under Review',
    decision: 'rejected',
    rejectionReason: 'Moisture level above configured limit',
    rejectionParameter: 'Moisture — 17.8%',
    rejectionAction: 'Please contact the procurement center for clarification or follow the displayed corrective/review process.',
    aiInsightText:
      'High moisture content (17.8%) detected. Grain requires additional drying before official procurement acceptance.',
    aiRecommendations: [
      'Spread grain on tarpaulins under direct sunlight for 4 to 6 hours',
      'Re-test moisture at the quality kiosk before re-entering queue',
      'Consult the center supervisor for moisture relaxation guidelines if applicable',
    ],
    parameters: [
      { id: 'moisture', name: 'Moisture', measuredValue: '17.8%', numericValue: 17.8, targetRange: '12.0% - 14.0%', unit: '%', status: 'outside_limit', note: 'Exceeds limit' },
      { id: 'foreign_matter', name: 'Foreign Matter', measuredValue: '1.2%', numericValue: 1.2, targetRange: 'Max 1.0%', unit: '%', status: 'attention', note: 'Slightly elevated' },
      { id: 'grain_quality', name: 'Grain Quality', measuredValue: 'Common Grade', numericValue: 70, targetRange: 'Grade A / Common', unit: 'Grade', status: 'good', note: 'Fair grain size' },
      { id: 'damaged_grains', name: 'Damaged Grains', measuredValue: '2.4%', numericValue: 2.4, targetRange: 'Max 2.0%', unit: '%', status: 'attention', note: 'Slightly elevated' },
      { id: 'broken_grains', name: 'Broken Grains', measuredValue: '4.8%', numericValue: 4.8, targetRange: 'Max 4.0%', unit: '%', status: 'outside_limit', note: 'Elevated broken %' },
    ],
    timeline: {
      received: { status: 'completed', timeStr: '09:15 AM', actor: 'Gate Officer', note: 'Received' },
      sampleCollected: { status: 'completed', timeStr: '09:25 AM', actor: 'Tech K. Reddi', note: 'Sample drawn' },
      moistureTested: { status: 'completed', timeStr: '09:30 AM', actor: 'Digital Sensor', note: '17.8% recorded' },
      qualityAssessment: { status: 'completed', timeStr: '09:35 AM', actor: 'Vision AI', note: 'High Moisture Alert' },
      finalVerification: { status: 'failed', timeStr: '09:45 AM', actor: 'Officer S. Rao', note: 'Rejected due to high moisture' },
      decisionMade: { status: 'failed', timeStr: '09:50 AM', actor: 'Supervisor M. Naidu', note: 'Rejection notice issued' },
    },
    aiAssessmentCompleted: true,
    aiAssessmentTimeStr: '09:35 AM',
    staffVerified: true,
    verifiedBy: 'Officer S. Rao (ID: OFF-842)',
    verifiedById: 'OFF-842',
    verifiedAt: Date.now() - 90 * 60 * 1000,
    verifiedAtStr: '09:50 AM, 1 Sep 2026',
    auditTrail: [
      { id: 'aud-rej-1', timestamp: Date.now() - 90 * 60 * 1000, timeStr: '09:50 AM', title: 'Official Quality Rejection', description: 'Rejection notice issued due to 17.8% moisture level.', actorRole: 'officer', actorName: 'Officer S. Rao', status: 'failed' },
    ],
  },
];

/** Helper: Calculate preliminary quality score based on parameters */
export function calculateQualityScore(parameters: QualityParameter[]): number {
  let score = 100;
  parameters.forEach((p) => {
    if (p.status === 'attention') score -= 12;
    if (p.status === 'outside_limit') score -= 30;
  });
  return Math.max(0, Math.min(100, score));
}

/** Helper: Generate Digital Certificate Verification ID */
export function generateDigitalCertificateId(tokenId: string): string {
  const randNum = Math.floor(1000 + Math.random() * 9000);
  return `KC-QC-2026-${tokenId}-${randNum}`;
}

/** Helper: Get Status Badge configuration for Quality Decision */
export function getQualityDecisionBadge(decision: QualityDecision): {
  label: string;
  colorClass: string;
  bgClass: string;
  icon: string;
} {
  switch (decision) {
    case 'accepted':
      return {
        label: 'ACCEPTED',
        colorClass: 'text-leaf-700 border-leaf-300 bg-leaf-100',
        bgClass: 'bg-leaf-500',
        icon: '🟢',
      };
    case 'in_progress':
      return {
        label: 'QUALITY CHECK IN PROGRESS',
        colorClass: 'text-amber-800 border-amber-300 bg-amber-50',
        bgClass: 'bg-amber-500',
        icon: '🟡',
      };
    case 'rejected':
      return {
        label: 'REJECTED / ACTION REQUIRED',
        colorClass: 'text-red-800 border-red-300 bg-red-50',
        bgClass: 'bg-red-500',
        icon: '🔴',
      };
    case 'review_required':
      return {
        label: 'OFFICIAL REVIEW REQUIRED',
        colorClass: 'text-orange-800 border-orange-300 bg-orange-50',
        bgClass: 'bg-orange-500',
        icon: '⚠️',
      };
  }
}

/** Helper: Export Quality Records to CSV */
export function exportQualityReportCSV(records: QualityCheckupRecord[]) {
  const headers = ['Record ID', 'Token', 'Farmer Name', 'Crop', 'Quantity (Q)', 'Moisture %', 'Grade', 'Quality Score', 'Status', 'Verified By'];
  const rows = records.map((r) => [
    r.id,
    r.tokenId,
    `"${r.farmerName}"`,
    `"${r.crop}"`,
    r.quantityQuintals,
    `${r.moisturePct}%`,
    r.qualityGrade,
    `${r.score}/100`,
    r.decision.toUpperCase(),
    `"${r.verifiedBy ?? 'Pending'}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `kisan_connect_quality_report_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
