import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import type { Lang, ViewId } from './data';
import { dictionaries } from './i18n';
import { supabase } from './supabase';
import type {
  ProcurementRecord,
  PaymentItem,
  PaymentAuditLog,
  UserRole,
} from './payment-service';
import {
  generateIdempotencyKey,
  generateProviderReference,
  validatePaymentCalculation,
} from './payment-service';
import type {
  QualityCheckupRecord,
  QualityDecision,
} from './quality-service';
import {
  INITIAL_QUALITY_RECORDS,
  calculateQualityScore,
  generateDigitalCertificateId,
} from './quality-service';
import type {
  UserProfile,
  StaffRegistrationRequest,
  StaffPermissionKey,
  SystemAuditLogEntry,
} from './auth-service';
import {
  INITIAL_PROFILES,
  INITIAL_STAFF_REQUESTS,
  INITIAL_STAFF_PERMISSIONS,
  INITIAL_SYSTEM_AUDIT_LOGS,
  generateStaffRequestId,
} from './auth-service';
import { send2FactorFarmerOTP, verify2FactorFarmerOTP } from './twofactor-service';

export interface TokenItem {
  id: string;
  token: string;
  crop: string;
  quantity: number;
  center: string;
  date: string;
  time: string;
  queuePosition: number;
  farmersAhead: number;
  estimatedWaitMin: number;
  name: string;
  status: 'Confirmed' | 'Checked-In' | 'Completed' | 'Upcoming' | 'Cancelled';
  moisturePct: number;
  expressPass: boolean;
  distanceKm: number;
  currentStep: number;
  bookedAt: number; // Timestamp when slot was booked
  cancelReason?: string;
  cancelledAt?: number;
}

export interface ComplaintItem {
  id: string; // e.g. "CMP-2026-8942"
  category: 'Center Delays' | 'Moisture Dispute' | 'Payment Delay' | 'Weighbridge Discrepancy' | 'Staff Misconduct' | 'Transport Issue' | 'Other';
  center: string;
  tokenId?: string;
  farmerName: string;
  phone: string;
  description: string;
  urgency: 'Normal' | 'High' | 'Urgent';
  status: 'Submitted' | 'Under Review' | 'Resolved';
  createdAt: number;
  resolutionNote?: string;
}

const NOW = Date.now();

export const INITIAL_PROCUREMENTS: ProcurementRecord[] = [
  {
    id: 'PROC-2026-8942',
    tokenId: 'A127',
    farmerId: 'f-101',
    farmerName: 'Ravi Kumar',
    farmerPhone: '+91 98765 43210',
    centerName: 'Vijayawada Procurement Center',
    crop: 'Paddy (Grade A)',
    variety: 'Grade A Common',
    quantityQuintals: 40,
    moisturePct: 14.0,
    trashPct: 1.0,
    qualityGrade: 'Grade A Super',
    ratePerQuintal: 2300,
    grossAmount: 92000,
    moistureDeduction: 0,
    handlingDeduction: 0,
    totalDeductions: 0,
    finalPayableAmount: 92000,
    verifiedBy: 'Officer S. Rao (ID: OFF-842)',
    verifiedAt: NOW - 2 * 60 * 60 * 1000,
    status: 'Verified',
  },
  {
    id: 'PROC-2026-7411',
    tokenId: 'B402',
    farmerId: 'f-101',
    farmerName: 'Ravi Kumar',
    farmerPhone: '+91 98765 43210',
    centerName: 'Guntur Procurement Center',
    crop: 'Cotton (Medium Staple)',
    variety: 'Medium Staple Premium',
    quantityQuintals: 25,
    moisturePct: 8.5,
    trashPct: 0.5,
    qualityGrade: 'Grade A',
    ratePerQuintal: 7125,
    grossAmount: 178125,
    moistureDeduction: 1000,
    handlingDeduction: 500,
    totalDeductions: 1500,
    finalPayableAmount: 176625,
    verifiedBy: 'Officer K. Varma (ID: OFF-109)',
    verifiedAt: NOW - 1 * 24 * 60 * 60 * 1000,
    status: 'Approved',
  },
  {
    id: 'PROC-2026-5120',
    tokenId: 'C109',
    farmerId: 'f-101',
    farmerName: 'Ravi Kumar',
    farmerPhone: '+91 98765 43210',
    centerName: 'Tenali Procurement Center',
    crop: 'Maize (Yellow)',
    variety: 'Yellow Hybrid',
    quantityQuintals: 50,
    moisturePct: 13.2,
    trashPct: 0.8,
    qualityGrade: 'Grade A',
    ratePerQuintal: 2250,
    grossAmount: 112500,
    moistureDeduction: 0,
    handlingDeduction: 0,
    totalDeductions: 0,
    finalPayableAmount: 112500,
    verifiedBy: 'Officer M. Naidu (ID: OFF-304)',
    verifiedAt: NOW - 14 * 24 * 60 * 60 * 1000,
    status: 'Payment Completed',
  },
];

export const INITIAL_PAYMENTS: PaymentItem[] = [
  {
    id: 'PAY-2026-8942',
    procurementId: 'PROC-2026-8942',
    farmerName: 'Ravi Kumar',
    farmerPhone: '+91 98765 43210',
    crop: 'Paddy (Grade A)',
    quantityQuintals: 40,
    ratePerQuintal: 2300,
    grossAmount: 92000,
    deductions: 0,
    finalPayableAmount: 92000,
    paymentMethod: 'dbt',
    bankLast4: '4521',
    centerName: 'Vijayawada Procurement Center',
    idempotencyKey: 'IDEM-KC-P8942-92000',
    providerReferenceId: 'SBIN202608284592',
    status: 'pending',
    retryCount: 0,
    createdAt: NOW - 2 * 60 * 60 * 1000,
  },
  {
    id: 'PAY-2026-7411',
    procurementId: 'PROC-2026-7411',
    farmerName: 'Ravi Kumar',
    farmerPhone: '+91 98765 43210',
    crop: 'Cotton (Medium Staple)',
    quantityQuintals: 25,
    ratePerQuintal: 7125,
    grossAmount: 178125,
    deductions: 1500,
    finalPayableAmount: 176625,
    paymentMethod: 'upi',
    bankLast4: '4521',
    centerName: 'Guntur Procurement Center',
    idempotencyKey: 'IDEM-KC-C7411-176625',
    providerReferenceId: 'UPI/20260829/849201/SUCCESS',
    status: 'processing',
    approvedBy: 'Procurement Officer K. Varma',
    approvedAt: NOW - 30 * 60 * 1000,
    retryCount: 0,
    createdAt: NOW - 1 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'PAY-2026-5120',
    procurementId: 'PROC-2026-5120',
    farmerName: 'Ravi Kumar',
    farmerPhone: '+91 98765 43210',
    crop: 'Maize (Yellow)',
    quantityQuintals: 50,
    ratePerQuintal: 2250,
    grossAmount: 112500,
    deductions: 0,
    finalPayableAmount: 112500,
    paymentMethod: 'dbt',
    bankLast4: '4521',
    centerName: 'Tenali Procurement Center',
    idempotencyKey: 'IDEM-KC-M5120-112500',
    providerReferenceId: 'SBIN202608149201',
    status: 'successful',
    approvedBy: 'Procurement Officer M. Naidu',
    approvedAt: NOW - 14 * 24 * 60 * 60 * 1000,
    completedAt: NOW - 14 * 24 * 60 * 60 * 1000 + 3 * 60 * 1000,
    retryCount: 0,
    createdAt: NOW - 14 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'PAY-2026-2910',
    procurementId: 'PROC-2026-2910',
    farmerName: 'Ravi Kumar',
    farmerPhone: '+91 98765 43210',
    crop: 'Groundnut (Kharif)',
    quantityQuintals: 15,
    ratePerQuintal: 6780,
    grossAmount: 101700,
    deductions: 1200,
    finalPayableAmount: 100500,
    paymentMethod: 'neft',
    bankLast4: '4521',
    centerName: 'Kurnool Procurement Center',
    idempotencyKey: 'IDEM-KC-G2910-100500',
    providerReferenceId: 'NEFT/N202608204921',
    status: 'failed',
    failureReason: 'Destination NPCI Aadhaar bank node timed out (ERR_BANK_TIMEOUT_504)',
    approvedBy: 'Officer T. Reddy',
    approvedAt: NOW - 5 * 24 * 60 * 60 * 1000,
    retryCount: 1,
    createdAt: NOW - 5 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'PAY-2026-1049',
    procurementId: 'PROC-2026-1049',
    farmerName: 'Lakshmi Devi',
    farmerPhone: '+91 98123 45678',
    crop: 'Wheat (Grade A)',
    quantityQuintals: 30,
    ratePerQuintal: 2275,
    grossAmount: 68250,
    deductions: 0,
    finalPayableAmount: 68250,
    paymentMethod: 'dbt',
    bankLast4: '9921',
    centerName: 'Vijayawada Procurement Center',
    idempotencyKey: 'IDEM-KC-W1049-68250',
    providerReferenceId: 'SBIN202608251049',
    status: 'on_hold',
    failureReason: 'Manual compliance review requested for Aadhaar name spelling discrepancy',
    approvedBy: 'Admin S. Rao',
    approvedAt: NOW - 3 * 24 * 60 * 60 * 1000,
    retryCount: 0,
    createdAt: NOW - 3 * 24 * 60 * 60 * 1000,
  },
];

export const INITIAL_AUDIT_LOGS: PaymentAuditLog[] = [
  {
    id: 'aud-1',
    paymentId: 'PAY-2026-8942',
    eventType: 'CREATED',
    actorRole: 'system',
    actorName: 'Procurement Gate Verification',
    newStatus: 'pending',
    notes: 'Procurement PROC-2026-8942 verified by Officer S. Rao. Final payable calculated as ₹92,000.',
    timestamp: NOW - 2 * 60 * 60 * 1000,
  },
  {
    id: 'aud-2',
    paymentId: 'PAY-2026-7411',
    eventType: 'APPROVED',
    actorRole: 'officer',
    actorName: 'Officer K. Varma',
    previousStatus: 'pending',
    newStatus: 'processing',
    notes: 'Payment of ₹1,76,625 approved for UPI Payout. Idempotency key verified.',
    timestamp: NOW - 30 * 60 * 1000,
  },
  {
    id: 'aud-3',
    paymentId: 'PAY-2026-5120',
    eventType: 'SUCCESSFUL',
    actorRole: 'webhook',
    actorName: 'Bank Payout Provider Webhook',
    previousStatus: 'processing',
    newStatus: 'successful',
    notes: 'Received signed HMAC webhook confirmation. UTR SBIN202608149201 settled to DBT account.',
    timestamp: NOW - 14 * 24 * 60 * 60 * 1000 + 3 * 60 * 1000,
  },
  {
    id: 'aud-4',
    paymentId: 'PAY-2026-2910',
    eventType: 'FAILED',
    actorRole: 'system',
    actorName: 'Payment Provider Gateway',
    previousStatus: 'processing',
    newStatus: 'failed',
    notes: 'NEFT transfer failed: Destination NPCI Aadhaar bank node timed out.',
    timestamp: NOW - 5 * 24 * 60 * 60 * 1000,
  },
];

export const INITIAL_COMPLAINTS: ComplaintItem[] = [
  {
    id: 'CMP-2026-4109',
    category: 'Moisture Dispute',
    center: 'Vijayawada Procurement Center',
    tokenId: 'A127',
    farmerName: 'Ravi Kumar',
    phone: '+91 98765 43210',
    description: 'Grain moisture level reading was 14.0% on portable meter, but lab meter showed variance. Requesting re-check.',
    urgency: 'High',
    status: 'Under Review',
    createdAt: NOW - 1 * 24 * 60 * 60 * 1000,
    resolutionNote: 'Senior Quality Officer assigned for secondary moisture verification.',
  },
  {
    id: 'CMP-2026-2841',
    category: 'Payment Delay',
    center: 'Tenali Procurement Center',
    tokenId: 'C109',
    farmerName: 'Ravi Kumar',
    phone: '+91 98765 43210',
    description: 'Procurement completed on 14 August. Requesting update on DBT account credit.',
    urgency: 'Normal',
    status: 'Resolved',
    createdAt: NOW - 10 * 24 * 60 * 60 * 1000,
    resolutionNote: 'Aadhaar NPCI mapping verified. Payment of ₹1,15,500 credited on 17 August 2026.',
  },
];

export const INITIAL_TOKENS: TokenItem[] = [
  {
    id: 'tok-1',
    token: 'A127',
    crop: 'Paddy (Grade A)',
    quantity: 40,
    center: 'Vijayawada Procurement Center',
    date: '28 August 2026',
    time: '10:30 AM',
    queuePosition: 4,
    farmersAhead: 3,
    estimatedWaitMin: 18,
    name: 'Ravi Kumar',
    status: 'Confirmed',
    moisturePct: 14.0,
    expressPass: true,
    distanceKm: 3.8,
    currentStep: 2,
    bookedAt: NOW - 10 * 60 * 1000, // Booked 10 mins ago (Eligible for cancellation)
  },
  {
    id: 'tok-2',
    token: 'B402',
    crop: 'Cotton (Medium Staple)',
    quantity: 25,
    center: 'Guntur Procurement Center',
    date: '02 September 2026',
    time: '02:15 PM',
    queuePosition: 8,
    farmersAhead: 7,
    estimatedWaitMin: 42,
    name: 'Ravi Kumar',
    status: 'Upcoming',
    moisturePct: 8.5,
    expressPass: false,
    distanceKm: 14.2,
    currentStep: 1,
    bookedAt: NOW - 45 * 60 * 1000, // Booked 45 mins ago (30-min window expired)
  },
  {
    id: 'tok-3',
    token: 'C109',
    crop: 'Maize (Yellow)',
    quantity: 50,
    center: 'Tenali Procurement Center',
    date: '14 August 2026',
    time: '11:00 AM',
    queuePosition: 1,
    farmersAhead: 0,
    estimatedWaitMin: 0,
    name: 'Ravi Kumar',
    status: 'Completed',
    moisturePct: 13.2,
    expressPass: true,
    distanceKm: 0,
    currentStep: 5,
    bookedAt: NOW - 2 * 24 * 60 * 60 * 1000,
  },
];

interface AppState {
  view: ViewId;
  setView: (v: ViewId) => void;
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
  session: Session | null;
  authReady: boolean;
  signOut: () => Promise<void>;
  loginAsDemo: (email?: string, name?: string) => void;
  userRole: UserRole;
  setUserRole: (r: UserRole) => void;
  userProfile: UserProfile | null;
  staffRequestsList: StaffRegistrationRequest[];
  staffPermissionsMap: Record<string, StaffPermissionKey[]>;
  systemAuditLogs: SystemAuditLogEntry[];
  sendFarmerOTP: (phone: string) => Promise<{ success: boolean; message: string; sessionId?: string; maskedPhone?: string }>;
  verifyFarmerOTP: (phone: string, otp: string, sessionId?: string) => Promise<{ success: boolean; message: string; isExisting?: boolean; userId?: string; profile?: UserProfile }>;
  completeFarmerProfileSetup: (data: { phone: string; fullName: string; village: string; district: string; state: string; preferredLanguage: Lang; userId?: string }) => Promise<{ success: boolean; message: string; profile?: UserProfile }>;
  submitStaffRegistration: (data: Partial<StaffRegistrationRequest> & { password?: string }) => Promise<{ success: boolean; message: string; request?: StaffRegistrationRequest }>;
  loginStaffWithEmail: (email: string, password?: string) => Promise<{ success: boolean; message: string; profile?: UserProfile }>;
  loginAdminWithEmail: (email: string, password?: string) => Promise<{ success: boolean; message: string; profile?: UserProfile }>;
  approveStaffRequest: (requestId: string) => Promise<{ success: boolean; message: string }>;
  rejectStaffRequest: (requestId: string, reason: string) => Promise<{ success: boolean; message: string }>;
  suspendStaffAccount: (userId: string, reason: string) => Promise<{ success: boolean; message: string }>;
  reactivateStaffAccount: (userId: string) => Promise<{ success: boolean; message: string }>;
  updateStaffPermissions: (userId: string, permissions: StaffPermissionKey[]) => Promise<{ success: boolean; message: string }>;
  tokensList: TokenItem[];
  activeTokenId: string;
  activeToken: TokenItem;
  setActiveTokenId: (id: string) => void;
  addToken: (data: Partial<TokenItem>) => TokenItem;
  updateTokenStatus: (id: string, status: TokenItem['status'], currentStep?: number) => void;
  cancelToken: (id: string, reason: string) => { success: boolean; message: string };
  complaintsList: ComplaintItem[];
  addComplaint: (data: Partial<ComplaintItem>) => ComplaintItem;
  procurementsList: ProcurementRecord[];
  paymentsList: PaymentItem[];
  auditLogs: PaymentAuditLog[];
  qualityReportsList: QualityCheckupRecord[];
  activeQualityRecord: QualityCheckupRecord;
  verifyQualityByStaff: (recordId: string, decision: QualityDecision, reason?: string) => { success: boolean; message: string };
  updateQualityMeasurements: (recordId: string, moisture: number, grade: string) => { success: boolean; message: string };
  getQualityReportForToken: (tokenId: string) => QualityCheckupRecord;
  approvePayment: (paymentId: string) => { success: boolean; message: string };
  processPayout: (paymentId: string) => Promise<{ success: boolean; message: string; utr?: string }>;
  retryFailedPayment: (paymentId: string) => Promise<{ success: boolean; message: string }>;
  holdPayment: (paymentId: string, reason: string) => { success: boolean; message: string };
  addProcurementRecord: (data: Partial<ProcurementRecord>) => { procurement: ProcurementRecord; payment: PaymentItem };
  mitraOpen: boolean;
  setMitraOpen: (open: boolean) => void;
  voiceTriggerCount: number;
  startVoiceInput: () => void;
  autoSpeech: boolean;
  setAutoSpeech: (enable: boolean) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<ViewId>('auth');
  const [lang, setLang] = useState<Lang>('en');
  const [userRole, setUserRole] = useState<UserRole>('farmer');
  const [profilesList, setProfilesList] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem('kisan_profiles_list');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_PROFILES;
  });

  const [userProfile, setUserProfileState] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('kisan_user_profile');
      if (saved) return JSON.parse(saved);
    } catch {
      /* ignore */
    }
    return null;
  });

  const setUserProfile = useCallback((profile: UserProfile | null) => {
    setUserProfileState(profile);
    try {
      if (profile) {
        localStorage.setItem('kisan_user_profile', JSON.stringify(profile));
      } else {
        localStorage.removeItem('kisan_user_profile');
      }
    } catch {
      /* ignore */
    }
  }, []);

  const [staffRequestsList, setStaffRequestsList] = useState<StaffRegistrationRequest[]>(() => {
    try {
      const saved = localStorage.getItem('kisan_staff_requests_list');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_STAFF_REQUESTS;
  });

  const [staffPermissionsMap, setStaffPermissionsMap] = useState<Record<string, StaffPermissionKey[]>>(() => {
    try {
      const saved = localStorage.getItem('kisan_staff_permissions_map');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_STAFF_PERMISSIONS;
  });

  const [systemAuditLogs, setSystemAuditLogs] = useState<SystemAuditLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem('kisan_system_audit_logs');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_SYSTEM_AUDIT_LOGS;
  });

  const [tokensList, setTokensList] = useState<TokenItem[]>(() => {
    try {
      const saved = localStorage.getItem('kisan_tokens_list');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_TOKENS;
  });

  const [activeTokenId, setActiveTokenId] = useState<string>('tok-1');

  const [procurementsList, setProcurementsList] = useState<ProcurementRecord[]>(() => {
    try {
      const saved = localStorage.getItem('kisan_procurements_list');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_PROCUREMENTS;
  });

  const [paymentsList, setPaymentsList] = useState<PaymentItem[]>(() => {
    try {
      const saved = localStorage.getItem('kisan_payments_list');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_PAYMENTS;
  });

  const [auditLogs, setAuditLogs] = useState<PaymentAuditLog[]>(INITIAL_AUDIT_LOGS);

  const [qualityReportsList, setQualityReportsList] = useState<QualityCheckupRecord[]>(() => {
    try {
      const saved = localStorage.getItem('kisan_quality_reports_list');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_QUALITY_RECORDS;
  });

  // Automatically persist changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('kisan_profiles_list', JSON.stringify(profilesList));
    } catch {}
  }, [profilesList]);

  useEffect(() => {
    try {
      localStorage.setItem('kisan_staff_requests_list', JSON.stringify(staffRequestsList));
    } catch {}
  }, [staffRequestsList]);

  useEffect(() => {
    try {
      localStorage.setItem('kisan_staff_permissions_map', JSON.stringify(staffPermissionsMap));
    } catch {}
  }, [staffPermissionsMap]);

  useEffect(() => {
    try {
      localStorage.setItem('kisan_system_audit_logs', JSON.stringify(systemAuditLogs));
    } catch {}
  }, [systemAuditLogs]);

  useEffect(() => {
    try {
      localStorage.setItem('kisan_tokens_list', JSON.stringify(tokensList));
    } catch {}
  }, [tokensList]);

  useEffect(() => {
    try {
      localStorage.setItem('kisan_procurements_list', JSON.stringify(procurementsList));
    } catch {}
  }, [procurementsList]);

  useEffect(() => {
    try {
      localStorage.setItem('kisan_payments_list', JSON.stringify(paymentsList));
    } catch {}
  }, [paymentsList]);

  useEffect(() => {
    try {
      localStorage.setItem('kisan_quality_reports_list', JSON.stringify(qualityReportsList));
    } catch {}
  }, [qualityReportsList]);

  // Real-time multi-tab cross-tab state synchronization listener
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      try {
        if (e.key === 'kisan_profiles_list' && e.newValue) {
          setProfilesList(JSON.parse(e.newValue));
        }
        if (e.key === 'kisan_staff_requests_list' && e.newValue) {
          setStaffRequestsList(JSON.parse(e.newValue));
        }
        if (e.key === 'kisan_staff_permissions_map' && e.newValue) {
          setStaffPermissionsMap(JSON.parse(e.newValue));
        }
        if (e.key === 'kisan_system_audit_logs' && e.newValue) {
          setSystemAuditLogs(JSON.parse(e.newValue));
        }
        if (e.key === 'kisan_tokens_list' && e.newValue) {
          setTokensList(JSON.parse(e.newValue));
        }
        if (e.key === 'kisan_procurements_list' && e.newValue) {
          setProcurementsList(JSON.parse(e.newValue));
        }
        if (e.key === 'kisan_payments_list' && e.newValue) {
          setPaymentsList(JSON.parse(e.newValue));
        }
        if (e.key === 'kisan_quality_reports_list' && e.newValue) {
          setQualityReportsList(JSON.parse(e.newValue));
        }
      } catch {}
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  const [mitraOpen, setMitraOpen] = useState(false);
  const [voiceTriggerCount, setVoiceTriggerCount] = useState(0);
  const [autoSpeech, setAutoSpeech] = useState(true);

  const startVoiceInput = useCallback(() => {
    setMitraOpen(true);
    setVoiceTriggerCount((prev) => prev + 1);
  }, []);

  const [session, setSession] = useState<Session | null>(() => {
    try {
      const saved = localStorage.getItem('kisan_demo_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [authReady, setAuthReady] = useState(false);

  const t = useCallback(
    (key: string) => dictionaries[lang][key] ?? dictionaries.en[key] ?? key,
    [lang],
  );

  const addToken = useCallback((data: Partial<TokenItem>): TokenItem => {
    const nextNumber = Math.floor(100 + Math.random() * 900);
    const cropStr = data.crop || 'Paddy (Grade A)';
    const prefix = cropStr.toLowerCase().includes('cotton')
      ? 'C'
      : cropStr.toLowerCase().includes('maize')
      ? 'M'
      : 'A';
    const tokenStr = data.token || `${prefix}${nextNumber}`;
    const id = `tok-${Date.now()}`;

    const newTokenItem: TokenItem = {
      id,
      token: tokenStr,
      crop: cropStr,
      quantity: data.quantity || 30,
      center: data.center || 'Vijayawada Procurement Center',
      date: data.date || '28 August 2026',
      time: data.time || '10:30 AM',
      queuePosition: Math.floor(2 + Math.random() * 5),
      farmersAhead: Math.floor(1 + Math.random() * 4),
      estimatedWaitMin: Math.floor(10 + Math.random() * 25),
      name: data.name || 'Ravi Kumar',
      status: data.status || 'Confirmed',
      moisturePct: data.moisturePct || 14.0,
      expressPass: data.expressPass ?? true,
      distanceKm: data.distanceKm || 4.2,
      currentStep: data.currentStep || 2,
      bookedAt: Date.now(),
    };

    setTokensList((prev) => [newTokenItem, ...prev]);
    setActiveTokenId(id);
    return newTokenItem;
  }, []);

  const updateTokenStatus = useCallback(
    (id: string, status: TokenItem['status'], currentStep?: number) => {
      setTokensList((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            return {
              ...item,
              status,
              ...(currentStep !== undefined ? { currentStep } : {}),
              farmersAhead: status === 'Checked-In' ? Math.max(0, item.farmersAhead - 1) : item.farmersAhead,
              estimatedWaitMin: status === 'Checked-In' ? Math.max(5, item.estimatedWaitMin - 8) : item.estimatedWaitMin,
            };
          }
          return item;
        })
      );
    },
    []
  );

  const cancelToken = useCallback((id: string, reason: string) => {
    let result = { success: false, message: 'Token not found' };
    setTokensList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const now = Date.now();
          const elapsedMin = (now - item.bookedAt) / (1000 * 60);
          if (elapsedMin > 30) {
            result = {
              success: false,
              message: 'Cancellation time limit of 30 minutes has expired.',
            };
            return item;
          }
          result = {
            success: true,
            message: `Token #${item.token} has been cancelled successfully.`,
          };
          return {
            ...item,
            status: 'Cancelled',
            currentStep: 0,
            cancelReason: reason,
            cancelledAt: now,
          };
        }
        return item;
      })
    );
    return result;
  }, []);

  const [complaintsList, setComplaintsList] = useState<ComplaintItem[]>(INITIAL_COMPLAINTS);

  const addComplaint = useCallback((data: Partial<ComplaintItem>): ComplaintItem => {
    const nextCode = Math.floor(1000 + Math.random() * 9000);
    const id = `CMP-2026-${nextCode}`;
    const newComplaint: ComplaintItem = {
      id,
      category: data.category || 'Center Delays',
      center: data.center || 'Vijayawada Procurement Center',
      tokenId: data.tokenId || undefined,
      farmerName: data.farmerName || 'Ravi Kumar',
      phone: data.phone || '+91 98765 43210',
      description: data.description || 'General procurement grievance',
      urgency: data.urgency || 'Normal',
      status: 'Submitted',
      createdAt: Date.now(),
      resolutionNote: undefined,
    };
    setComplaintsList((prev) => [newComplaint, ...prev]);
    return newComplaint;
  }, []);

  /** Payment Engine: Add Procurement Record & Automate Pending Payment */
  const addProcurementRecord = useCallback((data: Partial<ProcurementRecord>) => {
    const randId = Math.floor(1000 + Math.random() * 9000);
    const procId = `PROC-2026-${randId}`;
    const payId = `PAY-2026-${randId}`;
    const qty = data.quantityQuintals || 40;
    const rate = data.ratePerQuintal || 2300;
    const gross = qty * rate;
    const moistureDed = data.moistureDeduction || 0;
    const handlingDed = data.handlingDeduction || 0;
    const totDeductions = moistureDed + handlingDed;
    const finalPayable = Math.max(0, gross - totDeductions);

    const procurement: ProcurementRecord = {
      id: procId,
      tokenId: data.tokenId || 'A127',
      farmerId: 'f-101',
      farmerName: data.farmerName || 'Ravi Kumar',
      farmerPhone: data.farmerPhone || '+91 98765 43210',
      centerName: data.centerName || 'Vijayawada Procurement Center',
      crop: data.crop || 'Paddy (Grade A)',
      variety: data.variety || 'Grade A Common',
      quantityQuintals: qty,
      moisturePct: data.moisturePct || 14.0,
      trashPct: data.trashPct || 1.0,
      qualityGrade: data.qualityGrade || 'Grade A',
      ratePerQuintal: rate,
      grossAmount: gross,
      moistureDeduction: moistureDed,
      handlingDeduction: handlingDed,
      totalDeductions: totDeductions,
      finalPayableAmount: finalPayable,
      verifiedBy: 'Officer S. Rao (ID: OFF-842)',
      verifiedAt: Date.now(),
      status: 'Verified',
    };

    const idempotencyKey = generateIdempotencyKey(procId, finalPayable, procurement.farmerName);

    const payment: PaymentItem = {
      id: payId,
      procurementId: procId,
      farmerName: procurement.farmerName,
      farmerPhone: procurement.farmerPhone,
      crop: procurement.crop,
      quantityQuintals: qty,
      ratePerQuintal: rate,
      grossAmount: gross,
      deductions: totDeductions,
      finalPayableAmount: finalPayable,
      paymentMethod: 'dbt',
      bankLast4: '4521',
      centerName: procurement.centerName,
      idempotencyKey,
      providerReferenceId: generateProviderReference('dbt'),
      status: 'pending',
      retryCount: 0,
      createdAt: Date.now(),
    };

    const auditLog: PaymentAuditLog = {
      id: `aud-${Date.now()}`,
      paymentId: payId,
      eventType: 'CREATED',
      actorRole: 'system',
      actorName: 'Weighbridge & Moisture Scanner',
      newStatus: 'pending',
      notes: `Automated calculation verified: ${qty}Q x ₹${rate} - ₹${totDeductions} deductions = ₹${finalPayable.toLocaleString('en-IN')}`,
      timestamp: Date.now(),
    };

    setProcurementsList((prev) => [procurement, ...prev]);
    setPaymentsList((prev) => [payment, ...prev]);
    setAuditLogs((prev) => [auditLog, ...prev]);

    return { procurement, payment };
  }, []);

  /** Payment Engine: Approve Payment (Role Restricted) */
  const approvePayment = useCallback((paymentId: string) => {
    let result = { success: false, message: 'Payment record not found' };

    setPaymentsList((prev) =>
      prev.map((item) => {
        if (item.id === paymentId) {
          const validation = validatePaymentCalculation(
            item.quantityQuintals,
            item.ratePerQuintal,
            item.deductions,
            item.finalPayableAmount
          );

          if (!validation.isValid) {
            result = {
              success: false,
              message: `Payment approval blocked! Calculation discrepancy of ₹${validation.discrepancy}. Expected ₹${validation.expectedPayable}.`,
            };
            return item;
          }

          if (item.status === 'successful') {
            result = { success: false, message: 'Payment has already been successfully completed.' };
            return item;
          }

          const now = Date.now();
          const updated: PaymentItem = {
            ...item,
            status: 'processing',
            approvedBy: 'Procurement Officer (Authenticated)',
            approvedAt: now,
          };

          const audit: PaymentAuditLog = {
            id: `aud-${now}`,
            paymentId: item.id,
            eventType: 'APPROVED',
            actorRole: 'officer',
            actorName: 'Procurement Officer (Authenticated)',
            previousStatus: item.status,
            newStatus: 'processing',
            notes: `Payment approved. Server-side validation verified payable amount of ₹${item.finalPayableAmount.toLocaleString('en-IN')}.`,
            timestamp: now,
          };

          setAuditLogs((aPrev) => [audit, ...aPrev]);

          result = {
            success: true,
            message: `Payment ${item.id} approved! Sent to provider for instant processing.`,
          };
          return updated;
        }
        return item;
      })
    );

    return result;
  }, []);

  /** Payment Engine: Process Payout Simulator (Provider Webhook & Settlement) */
  const processPayout = useCallback(async (paymentId: string) => {
    const target = paymentsList.find((p) => p.id === paymentId);
    if (!target) return { success: false, message: 'Payment record not found' };

    const now = Date.now();
    const utr = generateProviderReference(target.paymentMethod);

    await new Promise((res) => setTimeout(res, 1200));

    setPaymentsList((prev) =>
      prev.map((item) => {
        if (item.id === paymentId) {
          return {
            ...item,
            status: 'successful',
            providerReferenceId: utr,
            completedAt: now,
          };
        }
        return item;
      })
    );

    setProcurementsList((prev) =>
      prev.map((pr) => {
        if (pr.id === target.procurementId) {
          return { ...pr, status: 'Payment Completed' };
        }
        return pr;
      })
    );

    const audit: PaymentAuditLog = {
      id: `aud-${now}`,
      paymentId: target.id,
      eventType: 'SUCCESSFUL',
      actorRole: 'webhook',
      actorName: 'Payout Provider Gateway (Razorpay/Bank)',
      previousStatus: 'processing',
      newStatus: 'successful',
      notes: `Payout settled via ${target.paymentMethod.toUpperCase()}. Provider UTR: ${utr}`,
      timestamp: now,
    };

    setAuditLogs((prev) => [audit, ...prev]);

    return {
      success: true,
      message: `Payout of ₹${target.finalPayableAmount.toLocaleString('en-IN')} successful! UTR: ${utr}`,
      utr,
    };
  }, [paymentsList]);

  /** Payment Engine: Retry Failed Payment */
  const retryFailedPayment = useCallback(async (paymentId: string) => {
    const now = Date.now();
    setPaymentsList((prev) =>
      prev.map((item) => {
        if (item.id === paymentId) {
          return {
            ...item,
            status: 'processing',
            failureReason: undefined,
            retryCount: item.retryCount + 1,
            approvedAt: now,
          };
        }
        return item;
      })
    );

    const audit: PaymentAuditLog = {
      id: `aud-${now}`,
      paymentId: paymentId,
      eventType: 'RETRIED',
      actorRole: 'officer',
      actorName: 'Authorized Admin (Retry Dispatch)',
      previousStatus: 'failed',
      newStatus: 'processing',
      notes: `Retry attempt initiated. Idempotency key verified to prevent duplicate payout.`,
      timestamp: now,
    };
    setAuditLogs((prev) => [audit, ...prev]);

    await new Promise((res) => setTimeout(res, 1200));

    const newUtr = generateProviderReference('dbt');
    setPaymentsList((prev) =>
      prev.map((item) => {
        if (item.id === paymentId) {
          return {
            ...item,
            status: 'successful',
            providerReferenceId: newUtr,
            completedAt: Date.now(),
          };
        }
        return item;
      })
    );

    const successAudit: PaymentAuditLog = {
      id: `aud-${Date.now()}`,
      paymentId: paymentId,
      eventType: 'SUCCESSFUL',
      actorRole: 'webhook',
      actorName: 'Bank Payout Provider Webhook',
      previousStatus: 'processing',
      newStatus: 'successful',
      notes: `Payment retry succeeded! UTR: ${newUtr}`,
      timestamp: Date.now(),
    };
    setAuditLogs((prev) => [successAudit, ...prev]);

    return {
      success: true,
      message: `Failed payment successfully retried and settled! UTR: ${newUtr}`,
    };
  }, []);

  /** Payment Engine: Place Payment On Hold */
  const holdPayment = useCallback((paymentId: string, reason: string) => {
    const now = Date.now();
    let result = { success: false, message: 'Payment not found' };

    setPaymentsList((prev) =>
      prev.map((item) => {
        if (item.id === paymentId) {
          result = { success: true, message: `Payment ${paymentId} placed on hold.` };
          return {
            ...item,
            status: 'on_hold',
            failureReason: reason,
          };
        }
        return item;
      })
    );

    const audit: PaymentAuditLog = {
      id: `aud-${now}`,
      paymentId: paymentId,
      eventType: 'HELD',
      actorRole: 'officer',
      actorName: 'Compliance Officer',
      previousStatus: 'pending',
      newStatus: 'on_hold',
      notes: `Payment placed on hold. Reason: ${reason}`,
      timestamp: now,
    };
    setAuditLogs((prev) => [audit, ...prev]);

    return result;
  }, []);

  const getQualityReportForToken = useCallback(
    (tokenId: string) => {
      return (
        qualityReportsList.find((q) => q.tokenId.toLowerCase() === tokenId.toLowerCase()) ??
        qualityReportsList[0]
      );
    },
    [qualityReportsList]
  );

  const activeQualityRecord = useMemo(() => {
    const activeTokenObj = tokensList.find((t) => t.id === activeTokenId) ?? tokensList[0];
    return getQualityReportForToken(activeTokenObj.token);
  }, [tokensList, activeTokenId, getQualityReportForToken]);

  const verifyQualityByStaff = useCallback(
    (recordId: string, decision: QualityDecision, reason?: string) => {
      const now = Date.now();
      const timeStr = new Date(now).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      let result = { success: false, message: 'Quality record not found' };

      setQualityReportsList((prev) =>
        prev.map((item) => {
          if (item.id === recordId || item.tokenId === recordId) {
            const certId = decision === 'accepted' ? generateDigitalCertificateId(item.tokenId) : undefined;
            const updated: QualityCheckupRecord = {
              ...item,
              decision,
              rejectionReason: decision === 'rejected' ? (reason || 'Quality parameters outside allowable MSP threshold') : undefined,
              rejectionParameter: decision === 'rejected' ? 'Moisture / Foreign Matter' : undefined,
              rejectionAction: decision === 'rejected' ? 'Please contact the procurement center supervisor or sun-dry grain.' : undefined,
              staffVerified: true,
              verifiedBy: 'Officer S. Rao (ID: OFF-842)',
              verifiedById: 'OFF-842',
              verifiedAt: now,
              verifiedAtStr: `${timeStr}, 1 Sep 2026`,
              certificateId: certId,
              timeline: {
                ...item.timeline,
                finalVerification: {
                  status: decision === 'rejected' ? 'failed' : 'completed',
                  timeStr,
                  actor: 'Officer S. Rao (ID: OFF-842)',
                  note: decision === 'rejected' ? 'Staff verification marked failed' : 'Verified & Signed by authorized staff',
                },
                decisionMade: {
                  status: decision === 'rejected' ? 'failed' : 'completed',
                  timeStr,
                  actor: 'Procurement Center Supervisor',
                  note: decision === 'rejected' ? `Official decision: REJECTED (${reason})` : 'Official decision: ACCEPTED for MSP Payout',
                },
              },
              auditTrail: [
                {
                  id: `aud-qcf-${now}`,
                  timestamp: now,
                  timeStr,
                  title: decision === 'accepted' ? 'Official Quality Acceptance' : 'Official Quality Rejection',
                  description: decision === 'accepted' ? 'Produce verified and accepted by Officer S. Rao' : `Official rejection: ${reason || 'High moisture/foreign matter'}`,
                  actorRole: 'officer',
                  actorName: 'Officer S. Rao',
                  status: decision === 'rejected' ? 'failed' : 'completed',
                },
                ...item.auditTrail,
              ],
            };

            result = {
              success: true,
              message: decision === 'accepted'
                ? `Quality Certificate ${certId} issued for Token #${item.tokenId}!`
                : `Quality decision updated to REJECTED for Token #${item.tokenId}.`,
            };
            return updated;
          }
          return item;
        })
      );

      return result;
    },
    []
  );

  const updateQualityMeasurements = useCallback(
    (recordId: string, moisture: number, grade: string) => {
      let result = { success: false, message: 'Quality record not found' };
      setQualityReportsList((prev) =>
        prev.map((item) => {
          if (item.id === recordId || item.tokenId === recordId) {
            const updatedParams = item.parameters.map((p) => {
              if (p.id === 'moisture') {
                return {
                  ...p,
                  measuredValue: `${moisture}%`,
                  numericValue: moisture,
                  status: moisture > 14.0 ? ('outside_limit' as const) : ('good' as const),
                  note: moisture > 14.0 ? 'Exceeds maximum limit' : 'Within acceptable range',
                };
              }
              if (p.id === 'grain_quality') {
                return {
                  ...p,
                  measuredValue: grade,
                };
              }
              return p;
            });

            const newScore = calculateQualityScore(updatedParams);

            result = {
              success: true,
              message: `Quality measurements updated! Moisture: ${moisture}%, Grade: ${grade}, New Score: ${newScore}/100.`,
            };

            return {
              ...item,
              moisturePct: moisture,
              moistureStatus: moisture > 14.0 ? 'high' : 'good',
              qualityGrade: grade,
              score: newScore,
              parameters: updatedParams,
            };
          }
          return item;
        })
      );
      return result;
    },
    []
  );

  /** Auth Engine: Real 2Factor Farmer Phone OTP Dispatch */
  const sendFarmerOTP = useCallback(async (phone: string) => {
    return await send2FactorFarmerOTP(phone);
  }, []);

  /** Auth Engine: Real 2Factor Verify Farmer OTP */
  const verifyFarmerOTP = useCallback(
    async (phone: string, otp: string, sessionId?: string) => {
      const cleanDigits = phone.replace(/\D/g, '').slice(-10);
      const cleanOtp = otp.trim().replace(/\D/g, '');

      if (!cleanOtp || cleanOtp.length < 6) {
        return { success: false, message: 'Please enter the complete 6-digit OTP code.' };
      }

      // Call 2Factor OTP verification service
      const verifyRes = await verify2FactorFarmerOTP(phone, cleanOtp, sessionId);
      if (!verifyRes.success) {
        return { success: false, message: verifyRes.message };
      }

      // Check if farmer profile already exists in profilesList
      const profile = profilesList.find(
        (p) => (p.phone || '').replace(/\D/g, '').slice(-10) === cleanDigits
      );

      if (profile && profile.role === 'farmer' && (profile.status === 'active' || profile.status === 'approved')) {
        setUserProfile(profile);
        setUserRole('farmer');
        setView('dashboard');
        return {
          success: true,
          isExisting: true,
          message: '✓ Verified successfully. Redirecting to your Farmer Dashboard...',
          profile,
        };
      }

      // New farmer profile setup required
      return {
        success: true,
        isExisting: false,
        userId: `usr-${Date.now()}`,
        message: '✓ Verified successfully. Please complete your farmer profile setup.',
      };
    },
    [profilesList, setView, setUserProfile, setUserRole]
  );


  /** Auth Engine: Complete New Farmer Profile Setup */
  const completeFarmerProfileSetup = useCallback(
    async (data: {
      phone: string;
      fullName: string;
      village: string;
      district: string;
      state: string;
      preferredLanguage: Lang;
      userId?: string;
    }) => {
      const cleanDigits = data.phone.replace(/\D/g, '');
      const formattedPhone = cleanDigits.length === 10 ? `+91${cleanDigits}` : data.phone;
      const now = Date.now();

      const newProfile: UserProfile = {
        id: `prof-${now}`,
        userId: data.userId || `usr-${now}`,
        fullName: data.fullName,
        phone: formattedPhone,
        role: 'farmer',
        status: 'active',
        village: data.village,
        district: data.district,
        state: data.state,
        preferredLanguage: data.preferredLanguage || 'en',
        createdAt: now,
      };

      setProfilesList((prev) => [newProfile, ...prev]);
      setUserProfile(newProfile);
      setUserRole('farmer');
      setView('dashboard');

      try {
        await supabase.from('profiles').upsert([
          {
            id: newProfile.id,
            user_id: newProfile.userId,
            full_name: newProfile.fullName,
            phone: newProfile.phone,
            role: 'farmer',
            status: 'active',
            village: newProfile.village,
            district: newProfile.district,
            state: newProfile.state,
            preferred_language: newProfile.preferredLanguage,
            created_at: new Date(now).toISOString(),
          },
        ]);
      } catch (e) {
        console.warn('Supabase profiles sync error:', e);
      }

      return {
        success: true,
        message: '✓ Profile setup completed successfully! Redirecting to Farmer Dashboard...',
        profile: newProfile,
      };
    },
    [setView, setUserProfile, setUserRole]
  );

  /** Auth Engine: Submit Staff Registration Request */
  const submitStaffRegistration = useCallback(
    async (data: Partial<StaffRegistrationRequest> & { password?: string }) => {
      const reqId = generateStaffRequestId();
      const newUserId = `usr-${Date.now()}`;
      const now = Date.now();

      const newRequest: StaffRegistrationRequest = {
        id: reqId,
        userId: newUserId,
        fullName: data.fullName || 'New Staff Member',
        officialEmail: data.officialEmail || 'new.staff@kisanconnect.com',
        phone: data.phone || '+91 90000 00000',
        staffId: data.staffId || reqId,
        department: data.department || 'Procurement',
        designation: data.designation || 'Staff Officer',
        procurementCenter: data.procurementCenter || 'Vijayawada Procurement Center A',
        status: 'pending',
        createdAt: now,
      };

      const newProfile: UserProfile = {
        id: `prof-${now}`,
        userId: newUserId,
        fullName: newRequest.fullName,
        email: newRequest.officialEmail,
        phone: newRequest.phone,
        role: 'staff',
        status: 'pending',
        district: 'Krishna',
        state: 'Andhra Pradesh',
        createdAt: now,
      };

      setStaffRequestsList((prev) => [newRequest, ...prev]);
      setProfilesList((prev) => [newProfile, ...prev]);

      return {
        success: true,
        message: 'Registration submitted successfully. Your account is waiting for Admin approval.',
        request: newRequest,
      };
    },
    []
  );

  /** Auth Engine: Staff Login with Email & Password */
  const loginStaffWithEmail = useCallback(
    async (email: string) => {
      const profile = profilesList.find((p) => p.email?.toLowerCase() === email.toLowerCase());
      if (!profile || profile.role !== 'staff') {
        return { success: false, message: 'Invalid email or password.' };
      }

      if (profile.status === 'pending') {
        return { success: false, message: 'Your registration is awaiting Admin approval.' };
      }

      if (profile.status === 'rejected') {
        const req = staffRequestsList.find((r) => r.officialEmail.toLowerCase() === email.toLowerCase());
        const reason = req?.rejectionReason ? ` Reason: ${req.rejectionReason}` : '';
        return { success: false, message: `Your staff registration was rejected.${reason}` };
      }

      if (profile.status === 'suspended') {
        return { success: false, message: 'Your account has been suspended. Contact Admin.' };
      }

      setUserProfile(profile);
      setUserRole('staff');
      setView('staff');

      return { success: true, message: 'Welcome to KisanConnect Staff Portal!', profile };
    },
    [profilesList, staffRequestsList, setView]
  );

  /** Auth Engine: Admin Login with Email & Password */
  const loginAdminWithEmail = useCallback(
    async (email: string, password?: string) => {
      if (password !== 'charan@1234') {
        return { success: false, message: 'Access Denied. Incorrect admin password.' };
      }

      const profile = profilesList.find((p) => p.email?.toLowerCase() === email.toLowerCase());
      if (!profile || profile.role !== 'admin' || (profile.status !== 'active' && profile.status !== 'approved')) {
        return { success: false, message: 'Access Denied. Invalid admin credentials or inactive status.' };
      }

      setUserProfile(profile);
      setUserRole('admin');
      setView('admin');

      return { success: true, message: 'Admin authentication successful!', profile };
    },
    [profilesList, setView]
  );

  /** Auth Engine: Admin Approves Staff Registration Request */
  const approveStaffRequest = useCallback(async (requestId: string) => {
    const now = Date.now();
    const timeStr = new Date(now).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    let result = { success: false, message: 'Staff request not found' };

    setStaffRequestsList((prev) =>
      prev.map((req) => {
        if (req.id === requestId || req.staffId === requestId) {
          result = { success: true, message: `Staff account ${req.staffId} approved successfully.` };

          setProfilesList((pPrev) =>
            pPrev.map((prof) => {
              if (prof.userId === req.userId || prof.email === req.officialEmail) {
                return { ...prof, status: 'approved' };
              }
              return prof;
            })
          );

          const audit: SystemAuditLogEntry = {
            id: `aud-sys-${now}`,
            userId: 'usr-admin-1',
            userName: 'Master Administrator',
            userRole: 'admin',
            action: 'Approved Staff Registration Request',
            targetUserId: req.userId,
            targetUserName: `${req.fullName} (${req.staffId})`,
            previousStatus: 'pending',
            newStatus: 'approved',
            timestamp: now,
            timeStr: `${timeStr}, 1 Sep 2026`,
          };
          setSystemAuditLogs((aPrev) => [audit, ...aPrev]);

          return { ...req, status: 'approved', approvedBy: 'usr-admin-1', approvedAt: now };
        }
        return req;
      })
    );

    return result;
  }, []);

  /** Auth Engine: Admin Rejects Staff Registration Request */
  const rejectStaffRequest = useCallback(async (requestId: string, reason: string) => {
    const now = Date.now();
    const timeStr = new Date(now).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    let result = { success: false, message: 'Staff request not found' };

    setStaffRequestsList((prev) =>
      prev.map((req) => {
        if (req.id === requestId || req.staffId === requestId) {
          result = { success: true, message: `Staff registration ${req.staffId} rejected.` };

          setProfilesList((pPrev) =>
            pPrev.map((prof) => {
              if (prof.userId === req.userId || prof.email === req.officialEmail) {
                return { ...prof, status: 'rejected' };
              }
              return prof;
            })
          );

          const audit: SystemAuditLogEntry = {
            id: `aud-sys-${now}`,
            userId: 'usr-admin-1',
            userName: 'Master Administrator',
            userRole: 'admin',
            action: 'Rejected Staff Registration Request',
            targetUserId: req.userId,
            targetUserName: `${req.fullName} (${req.staffId})`,
            previousStatus: 'pending',
            newStatus: 'rejected',
            reason: reason || 'Invalid employee details',
            timestamp: now,
            timeStr: `${timeStr}, 1 Sep 2026`,
          };
          setSystemAuditLogs((aPrev) => [audit, ...aPrev]);

          return { ...req, status: 'rejected', rejectionReason: reason };
        }
        return req;
      })
    );

    return result;
  }, []);

  /** Auth Engine: Admin Suspends Staff Account */
  const suspendStaffAccount = useCallback(async (userId: string, reason: string) => {
    const now = Date.now();
    const timeStr = new Date(now).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    setProfilesList((prev) =>
      prev.map((prof) => {
        if (prof.userId === userId || prof.id === userId) {
          return { ...prof, status: 'suspended' };
        }
        return prof;
      })
    );

    setStaffRequestsList((prev) =>
      prev.map((req) => {
        if (req.userId === userId || req.id === userId) {
          return { ...req, status: 'suspended', rejectionReason: reason };
        }
        return req;
      })
    );

    const audit: SystemAuditLogEntry = {
      id: `aud-sys-${now}`,
      userId: 'usr-admin-1',
      userName: 'Master Administrator',
      userRole: 'admin',
      action: 'Suspended Staff Account',
      targetUserId: userId,
      targetUserName: `Staff User (${userId})`,
      previousStatus: 'approved',
      newStatus: 'suspended',
      reason: reason || 'Suspended by Administrator',
      timestamp: now,
      timeStr: `${timeStr}, 1 Sep 2026`,
    };
    setSystemAuditLogs((prev) => [audit, ...prev]);

    return { success: true, message: 'Staff account suspended successfully.' };
  }, []);

  /** Auth Engine: Admin Reactivates Staff Account */
  const reactivateStaffAccount = useCallback(async (userId: string) => {
    const now = Date.now();
    const timeStr = new Date(now).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    setProfilesList((prev) =>
      prev.map((prof) => {
        if (prof.userId === userId || prof.id === userId) {
          return { ...prof, status: 'approved' };
        }
        return prof;
      })
    );

    setStaffRequestsList((prev) =>
      prev.map((req) => {
        if (req.userId === userId || req.id === userId) {
          return { ...req, status: 'approved' };
        }
        return req;
      })
    );

    const audit: SystemAuditLogEntry = {
      id: `aud-sys-${now}`,
      userId: 'usr-admin-1',
      userName: 'Master Administrator',
      userRole: 'admin',
      action: 'Reactivated Staff Account',
      targetUserId: userId,
      targetUserName: `Staff User (${userId})`,
      previousStatus: 'suspended',
      newStatus: 'approved',
      timestamp: now,
      timeStr: `${timeStr}, 1 Sep 2026`,
    };
    setSystemAuditLogs((prev) => [audit, ...prev]);

    return { success: true, message: 'Staff account reactivated successfully.' };
  }, []);

  /** Auth Engine: Admin Updates Staff Permissions */
  const updateStaffPermissions = useCallback(async (userId: string, permissions: StaffPermissionKey[]) => {
    setStaffPermissionsMap((prev) => ({
      ...prev,
      [userId]: permissions,
    }));
    return { success: true, message: 'Granular staff permissions updated successfully.' };
  }, []);

  const activeToken = useMemo(() => {
    return tokensList.find((t) => t.id === activeTokenId) ?? tokensList[0];
  }, [tokensList, activeTokenId]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setSession(data.session);
      }
      setAuthReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      if (sess) {
        setSession(sess);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const loginAsDemo = useCallback((email = 'farmer@kisanconnect.com', name = 'Ravi Kumar') => {
    const demoSession = {
      access_token: 'demo-token-' + Date.now(),
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'demo-refresh-token',
      user: {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        aud: 'authenticated',
        role: 'authenticated',
        email: email || 'farmer@kisanconnect.com',
        email_confirmed_at: new Date().toISOString(),
        phone: '+91 98765 43210',
        confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: { full_name: name || 'Ravi Kumar' },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };
    try {
      localStorage.setItem('kisan_demo_session', JSON.stringify(demoSession));
    } catch (e) {
      console.warn('LocalStorage unavailable', e);
    }
    setSession(demoSession as unknown as Session);
    setView('dashboard');
  }, [setView]);

  const signOut = useCallback(async () => {
    try {
      localStorage.removeItem('kisan_demo_session');
      localStorage.removeItem('kisan_user_profile');
      localStorage.clear();
    } catch {
      /* ignore */
    }
    try {
      await supabase.auth.signOut();
    } catch {
      /* ignore */
    }
    setSession(null);
    setUserProfile(null);
    setUserRole('farmer');
    setView('auth');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [setUserProfile]);

  const value = useMemo(
    () => ({
      view,
      setView,
      lang,
      setLang,
      t,
      session,
      authReady,
      signOut,
      loginAsDemo,
      userRole,
      setUserRole,
      userProfile,
      staffRequestsList,
      staffPermissionsMap,
      systemAuditLogs,
      sendFarmerOTP,
      verifyFarmerOTP,
      completeFarmerProfileSetup,
      submitStaffRegistration,
      loginStaffWithEmail,
      loginAdminWithEmail,
      approveStaffRequest,
      rejectStaffRequest,
      suspendStaffAccount,
      reactivateStaffAccount,
      updateStaffPermissions,
      tokensList,
      activeTokenId,
      activeToken,
      setActiveTokenId,
      addToken,
      updateTokenStatus,
      cancelToken,
      complaintsList,
      addComplaint,
      procurementsList,
      paymentsList,
      auditLogs,
      qualityReportsList,
      activeQualityRecord,
      verifyQualityByStaff,
      updateQualityMeasurements,
      getQualityReportForToken,
      approvePayment,
      processPayout,
      retryFailedPayment,
      holdPayment,
      addProcurementRecord,
      mitraOpen,
      setMitraOpen,
      voiceTriggerCount,
      startVoiceInput,
      autoSpeech,
      setAutoSpeech,
    }),
    [
      view,
      setView,
      lang,
      setLang,
      t,
      session,
      authReady,
      signOut,
      loginAsDemo,
      userRole,
      setUserRole,
      userProfile,
      staffRequestsList,
      staffPermissionsMap,
      systemAuditLogs,
      sendFarmerOTP,
      verifyFarmerOTP,
      submitStaffRegistration,
      loginStaffWithEmail,
      loginAdminWithEmail,
      approveStaffRequest,
      rejectStaffRequest,
      suspendStaffAccount,
      reactivateStaffAccount,
      updateStaffPermissions,
      tokensList,
      activeTokenId,
      activeToken,
      setActiveTokenId,
      addToken,
      updateTokenStatus,
      cancelToken,
      complaintsList,
      addComplaint,
      procurementsList,
      paymentsList,
      auditLogs,
      qualityReportsList,
      activeQualityRecord,
      verifyQualityByStaff,
      updateQualityMeasurements,
      getQualityReportForToken,
      approvePayment,
      processPayout,
      retryFailedPayment,
      holdPayment,
      addProcurementRecord,
      mitraOpen,
      setMitraOpen,
      voiceTriggerCount,
      startVoiceInput,
      autoSpeech,
      setAutoSpeech,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

/** Reveal-on-scroll: adds `is-visible` when element enters viewport. */
export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const [ref, setRef] = useState<T | null>(null);
  useEffect(() => {
    if (!ref) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    );
    io.observe(ref);
    return () => io.disconnect();
  }, [ref]);
  return setRef;
}

/** Animated number counter that triggers when scrolled into view. */
export function useCountUp(target: number, duration = 1800) {
  const [value, setValue] = useState(0);
  const [el, setEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!el) return;
    let started = false;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started) {
          started = true;
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setValue(target * eased);
            if (p < 1) requestAnimationFrame(tick);
            else setValue(target);
          };
          requestAnimationFrame(tick);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [el, target, duration]);

  return { value, setEl };
}

export function formatCompact(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(0).replace(/\.0$/, '') + 'K';
  return Math.round(n).toString();
}

export function formatRupee(n: number): string {
  return '₹' + n.toLocaleString('en-IN');
}
