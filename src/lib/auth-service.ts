export type UserRole = 'farmer' | 'staff' | 'admin';

export type AccountStatus = 'active' | 'pending' | 'approved' | 'rejected' | 'suspended';

export type StaffPermissionKey =
  | 'quality_check'
  | 'weighing'
  | 'procurement_management'
  | 'payment_verification'
  | 'transport_management'
  | 'complaint_management'
  | 'farmer_management'
  | 'analytics_view';

export interface UserProfile {
  id: string;
  userId: string;
  fullName: string;
  phone?: string;
  email?: string;
  role: UserRole;
  status: AccountStatus;
  village?: string;
  district?: string;
  state?: string;
  preferredLanguage?: string;
  primaryCrop?: string;
  landAcres?: number;
  kisanCardId?: string;
  createdAt: number;
}

export interface StaffRegistrationRequest {
  id: string;
  userId: string;
  fullName: string;
  officialEmail: string;
  phone: string;
  staffId: string;
  department: string;
  designation: string;
  procurementCenter: string;
  status: AccountStatus;
  rejectionReason?: string;
  approvedBy?: string;
  approvedAt?: number;
  createdAt: number;
}

export interface SystemAuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  targetUserId?: string;
  targetUserName?: string;
  previousStatus?: string;
  newStatus?: string;
  reason?: string;
  timestamp: number;
  timeStr: string;
}

// All available granular staff permissions
export const ALL_STAFF_PERMISSIONS: { key: StaffPermissionKey; label: string; description: string }[] = [
  { key: 'quality_check', label: 'Quality Check & Grading', description: 'Perform moisture testing and assign quality grades' },
  { key: 'weighing', label: 'Weighbridge Operations', description: 'Record official produce weights at center weighbridge' },
  { key: 'procurement_management', label: 'Procurement Queue & Call', description: 'Call tokens, manage queues, and accept lots' },
  { key: 'payment_verification', label: 'Payment Payout Verification', description: 'Verify MSP calculations and initiate DBT disburse' },
  { key: 'transport_management', label: 'Logistics & Transport', description: 'Assign trucks, lorries, and manage slot arrivals' },
  { key: 'complaint_management', label: 'Grievance Resolution', description: 'Review farmer complaints and post official resolutions' },
  { key: 'farmer_management', label: 'Farmer Check-In', description: 'Verify farmer tokens and scan gate entry passes' },
  { key: 'analytics_view', label: 'Center Analytics View', description: 'View center arrival trends and daily volume charts' },
];

export const INITIAL_PROFILES: UserProfile[] = [
  {
    id: 'prof-admin',
    userId: 'usr-admin-1',
    fullName: 'Master Administrator',
    email: 'admin1234@gmail.com',
    phone: '+91 99999 88888',
    role: 'admin',
    status: 'active',
    district: 'State HQ',
    state: 'Andhra Pradesh',
    preferredLanguage: 'en',
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'prof-staff-app',
    userId: 'usr-staff-1',
    fullName: 'Officer S. Rao',
    email: 'staff@kisanconnect.com',
    phone: '+91 94401 99887',
    role: 'staff',
    status: 'approved',
    district: 'Krishna',
    state: 'Andhra Pradesh',
    preferredLanguage: 'te',
    createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'prof-staff-pend',
    userId: 'usr-staff-2',
    fullName: 'K. Venkatesh (Assistant Officer)',
    email: 'pending.staff@kisanconnect.com',
    phone: '+91 98480 11223',
    role: 'staff',
    status: 'pending',
    district: 'Guntur',
    state: 'Andhra Pradesh',
    preferredLanguage: 'te',
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'prof-staff-rej',
    userId: 'usr-staff-3',
    fullName: 'M. Ramesh',
    email: 'rejected.staff@kisanconnect.com',
    phone: '+91 94900 55443',
    role: 'staff',
    status: 'rejected',
    district: 'Prakasam',
    state: 'Andhra Pradesh',
    preferredLanguage: 'en',
    createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'prof-staff-susp',
    userId: 'usr-staff-4',
    fullName: 'P. Suresh',
    email: 'suspended.staff@kisanconnect.com',
    phone: '+91 98765 00112',
    role: 'staff',
    status: 'suspended',
    district: 'Krishna',
    state: 'Andhra Pradesh',
    preferredLanguage: 'te',
    createdAt: Date.now() - 15 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'prof-farmer-1',
    userId: 'usr-farmer-1',
    fullName: 'Ravi Kumar',
    phone: '+91 98765 43210',
    role: 'farmer',
    status: 'active',
    village: 'Kankipadu',
    district: 'Krishna',
    state: 'Andhra Pradesh',
    primaryCrop: 'Paddy (Grade A)',
    landAcres: 4.5,
    kisanCardId: 'KC-AP-2026-8812',
    preferredLanguage: 'te',
    createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'prof-farmer-2',
    userId: 'usr-farmer-2',
    fullName: 'Venkat Rao',
    phone: '+91 94401 23456',
    role: 'farmer',
    status: 'approved',
    village: 'Gudivada',
    district: 'Krishna',
    state: 'Andhra Pradesh',
    primaryCrop: 'Paddy (Super Fine)',
    landAcres: 6.0,
    kisanCardId: 'KC-AP-2026-9041',
    preferredLanguage: 'te',
    createdAt: Date.now() - 45 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'prof-farmer-3',
    userId: 'usr-farmer-3',
    fullName: 'Srinivas Reddi',
    phone: '+91 98480 88776',
    role: 'farmer',
    status: 'active',
    village: 'Mangalagiri',
    district: 'Guntur',
    state: 'Andhra Pradesh',
    primaryCrop: 'Cotton (Long Staple)',
    landAcres: 8.2,
    kisanCardId: 'KC-AP-2026-7734',
    preferredLanguage: 'te',
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'prof-farmer-4',
    userId: 'usr-farmer-4',
    fullName: 'Koteswara Rao',
    phone: '+91 94900 11223',
    role: 'farmer',
    status: 'active',
    village: 'Tenali Rural',
    district: 'Guntur',
    state: 'Andhra Pradesh',
    primaryCrop: 'Maize (Yellow)',
    landAcres: 5.0,
    kisanCardId: 'KC-AP-2026-6651',
    preferredLanguage: 'te',
    createdAt: Date.now() - 14 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'prof-farmer-5',
    userId: 'usr-farmer-5',
    fullName: 'Lakshmi Devi',
    phone: '+91 98499 55112',
    role: 'farmer',
    status: 'pending',
    village: 'Nuzvid',
    district: 'Eluru',
    state: 'Andhra Pradesh',
    primaryCrop: 'Chilly (Red)',
    landAcres: 3.2,
    kisanCardId: 'KC-AP-2026-5419',
    preferredLanguage: 'te',
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
  },
];

export const INITIAL_STAFF_REQUESTS: StaffRegistrationRequest[] = [
  {
    id: 'req-1029',
    userId: 'usr-staff-2',
    fullName: 'K. Venkatesh',
    officialEmail: 'pending.staff@kisanconnect.com',
    phone: '+91 98480 11223',
    staffId: 'ST-1029',
    department: 'Quality Inspection',
    designation: 'Assistant Quality Inspector',
    procurementCenter: 'Vijayawada Procurement Center A',
    status: 'pending',
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'req-1024',
    userId: 'usr-staff-1',
    fullName: 'Officer S. Rao',
    officialEmail: 'staff@kisanconnect.com',
    phone: '+91 94401 99887',
    staffId: 'ST-1024',
    department: 'Procurement & Payouts',
    designation: 'Senior Procurement Officer',
    procurementCenter: 'Vijayawada Procurement Center A',
    status: 'approved',
    approvedBy: 'usr-admin-1',
    approvedAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
    createdAt: Date.now() - 12 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'req-1018',
    userId: 'usr-staff-3',
    fullName: 'M. Ramesh',
    officialEmail: 'rejected.staff@kisanconnect.com',
    phone: '+91 94900 55443',
    staffId: 'ST-1018',
    department: 'Logistics',
    designation: 'Transport Coordinator',
    procurementCenter: 'Guntur Center B',
    status: 'rejected',
    rejectionReason: 'Employee ID ST-1018 could not be verified with Department HR record',
    createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'req-1012',
    userId: 'usr-staff-4',
    fullName: 'P. Suresh',
    officialEmail: 'suspended.staff@kisanconnect.com',
    phone: '+91 98765 00112',
    staffId: 'ST-1012',
    department: 'Weighbridge',
    designation: 'Weighbridge Operator',
    procurementCenter: 'Tenali Procurement Center',
    status: 'suspended',
    rejectionReason: 'Suspended pending audit review of weighbridge logs',
    createdAt: Date.now() - 15 * 24 * 60 * 60 * 1000,
  },
];

export const INITIAL_STAFF_PERMISSIONS: Record<string, StaffPermissionKey[]> = {
  'usr-staff-1': [
    'quality_check',
    'weighing',
    'procurement_management',
    'payment_verification',
    'transport_management',
    'complaint_management',
    'farmer_management',
    'analytics_view',
  ],
  'usr-staff-2': ['quality_check', 'weighing', 'farmer_management'],
};

export const INITIAL_SYSTEM_AUDIT_LOGS: SystemAuditLogEntry[] = [
  {
    id: 'aud-sys-1',
    userId: 'usr-admin-1',
    userName: 'Master Administrator',
    userRole: 'admin',
    action: 'Approved Staff Registration Request',
    targetUserId: 'usr-staff-1',
    targetUserName: 'Officer S. Rao (ST-1024)',
    previousStatus: 'pending',
    newStatus: 'approved',
    reason: 'Verified employee credentials with Agriculture Department HR database',
    timestamp: Date.now() - 10 * 24 * 60 * 60 * 1000,
    timeStr: '10:15 AM, 22 Aug 2026',
  },
  {
    id: 'aud-sys-2',
    userId: 'usr-admin-1',
    userName: 'Master Administrator',
    userRole: 'admin',
    action: 'Rejected Staff Registration Request',
    targetUserId: 'usr-staff-3',
    targetUserName: 'M. Ramesh (ST-1018)',
    previousStatus: 'pending',
    newStatus: 'rejected',
    reason: 'Employee ID ST-1018 could not be verified with Department HR record',
    timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
    timeStr: '02:30 PM, 27 Aug 2026',
  },
  {
    id: 'aud-sys-3',
    userId: 'usr-admin-1',
    userName: 'Master Administrator',
    userRole: 'admin',
    action: 'Suspended Staff Account',
    targetUserId: 'usr-staff-4',
    targetUserName: 'P. Suresh (ST-1012)',
    previousStatus: 'approved',
    newStatus: 'suspended',
    reason: 'Suspended pending audit review of weighbridge logs',
    timestamp: Date.now() - 15 * 24 * 60 * 60 * 1000,
    timeStr: '11:45 AM, 17 Aug 2026',
  },
];

/** Helper: Generate unique registration request ID */
export function generateStaffRequestId(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `ST-${num}`;
}
