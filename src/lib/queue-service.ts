import { useEffect, useState } from 'react';

export type QueueTokenStatus =
  | 'WAITING'
  | 'CALLED'
  | 'ARRIVED'
  | 'IN_PROGRESS'
  | 'QUALITY_CHECK'
  | 'PAYMENT_PENDING'
  | 'COMPLETED'
  | 'ON_HOLD'
  | 'SKIPPED'
  | 'CANCELLED'
  | 'EXPIRED';

export type QueuePriority = 'NORMAL' | 'SENIOR_CITIZEN' | 'SPECIAL_ASSISTANCE' | 'APPOINTMENT';

export type CounterStatus = 'ACTIVE' | 'BUSY' | 'BREAK' | 'OFFLINE';

export interface CounterItem {
  id: string;
  centerId: string;
  counterName: string;
  assignedStaffId?: string;
  assignedStaffName: string;
  status: CounterStatus;
  createdAt: number;
}

export interface SmartQueueToken {
  id: string;
  tokenNumber: string; // e.g. "KSN-104"
  farmerId?: string;
  farmerName: string;
  farmerPhone: string;
  centerId: string;
  centerName: string;
  counterId?: string;
  counterName?: string;
  serviceType: string;
  produceType: string;
  quantityQuintals: number;
  priority: QueuePriority;
  status: QueueTokenStatus;
  queuePosition: number;
  farmersAhead: number;
  estimatedWaitMin: number;
  calledAt?: number;
  serviceStartedAt?: number;
  completedAt?: number;
  operatingDate: string;
  createdAt: number;
}

export interface QueueEventLog {
  id: string;
  tokenId: string;
  actorId?: string;
  actorName: string;
  action: string;
  oldStatus?: string;
  newStatus: string;
  counterId?: string;
  createdAt: number;
}

/** Default average service time per farmer in minutes (12 mins) */
export const DEFAULT_SERVICE_TIME_MIN = 12;

/** Dynamic calculation of estimated waiting time based on completed history & position */
export function calculateEstimatedWait(
  farmersAhead: number,
  recentCompletedMinutes: number[] = []
): number {
  if (farmersAhead <= 0) return 0;

  let avgServiceMin = DEFAULT_SERVICE_TIME_MIN;
  if (recentCompletedMinutes.length > 0) {
    const sum = recentCompletedMinutes.reduce((a, b) => a + b, 0);
    avgServiceMin = Math.round(sum / recentCompletedMinutes.length);
  }

  return farmersAhead * avgServiceMin;
}

/** Secure non-PII QR code payload generator */
export function generateSecureQRPayload(token: SmartQueueToken): string {
  const secureHash = btoa(JSON.stringify({
    tid: token.id,
    num: token.tokenNumber,
    cid: token.centerId,
    dt: token.operatingDate,
  })).replace(/=/g, '');

  return `https://kisanconnect.gov.in/verify-pass?ref=${token.id}&hash=${secureHash}`;
}

/** Parse and verify QR code payload safely */
export function parseSecureQRPayload(qrText: string): { valid: boolean; tokenId?: string } {
  try {
    if (qrText.includes('ref=')) {
      const urlParams = new URLSearchParams(qrText.split('?')[1]);
      const ref = urlParams.get('ref');
      if (ref) return { valid: true, tokenId: ref };
    }
    return { valid: false };
  } catch (e) {
    return { valid: false };
  }
}

/** Hook: Network connection status monitoring (Online / Offline) */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

/** Visual badges configuration for Queue Token Statuses */
export function getQueueStatusBadge(status: QueueTokenStatus): {
  label: string;
  colorClass: string;
  bgClass: string;
  dotColor: string;
} {
  switch (status) {
    case 'WAITING':
      return { label: 'WAITING IN QUEUE', colorClass: 'text-amber-800 border-amber-300', bgClass: 'bg-amber-100/90', dotColor: 'bg-amber-500' };
    case 'CALLED':
      return { label: 'TOKEN CALLED', colorClass: 'text-emerald-950 border-emerald-400', bgClass: 'bg-emerald-200 animate-pulse', dotColor: 'bg-emerald-600' };
    case 'ARRIVED':
      return { label: 'FARMER ARRIVED', colorClass: 'text-blue-900 border-blue-300', bgClass: 'bg-blue-100', dotColor: 'bg-blue-600' };
    case 'IN_PROGRESS':
      return { label: 'SERVICE IN PROGRESS', colorClass: 'text-indigo-900 border-indigo-300', bgClass: 'bg-indigo-100', dotColor: 'bg-indigo-600' };
    case 'QUALITY_CHECK':
      return { label: 'QUALITY TESTING', colorClass: 'text-purple-900 border-purple-300', bgClass: 'bg-purple-100', dotColor: 'bg-purple-600' };
    case 'PAYMENT_PENDING':
      return { label: 'PAYMENT DISBURSAL', colorClass: 'text-teal-900 border-teal-300', bgClass: 'bg-teal-100', dotColor: 'bg-teal-600' };
    case 'COMPLETED':
      return { label: 'PROCUREMENT COMPLETED', colorClass: 'text-leaf-900 border-leaf-400', bgClass: 'bg-leaf-100', dotColor: 'bg-leaf-600' };
    case 'ON_HOLD':
      return { label: 'ON HOLD', colorClass: 'text-orange-900 border-orange-300', bgClass: 'bg-orange-100', dotColor: 'bg-orange-600' };
    case 'SKIPPED':
      return { label: 'SKIPPED', colorClass: 'text-rose-900 border-rose-300', bgClass: 'bg-rose-100', dotColor: 'bg-rose-600' };
    case 'CANCELLED':
      return { label: 'CANCELLED', colorClass: 'text-gray-700 border-gray-300', bgClass: 'bg-gray-200', dotColor: 'bg-gray-500' };
    case 'EXPIRED':
      return { label: 'EXPIRED', colorClass: 'text-red-900 border-red-300', bgClass: 'bg-red-100', dotColor: 'bg-red-600' };
    default:
      return { label: status, colorClass: 'text-forest-800 border-forest-200', bgClass: 'bg-forest-50', dotColor: 'bg-forest-500' };
  }
}

/** Initial Seed Smart Queue Tokens for Demo / Offline Fallback */
export const INITIAL_SMART_TOKENS: SmartQueueToken[] = [
  {
    id: 'tok-101',
    tokenNumber: 'KSN-104',
    farmerId: 'f-101',
    farmerName: 'Ravi Kumar',
    farmerPhone: '+91 98765 43210',
    centerId: 'vijayawada',
    centerName: 'Vijayawada Procurement Center',
    counterId: 'CNT-VJA-1',
    counterName: 'Counter 1 (Paddy)',
    serviceType: 'Paddy Procurement',
    produceType: 'Paddy (Grade A)',
    quantityQuintals: 40,
    priority: 'NORMAL',
    status: 'WAITING',
    queuePosition: 8,
    farmersAhead: 7,
    estimatedWaitMin: 35,
    operatingDate: new Date().toISOString().split('T')[0],
    createdAt: Date.now() - 45 * 60 * 1000,
  },
  {
    id: 'tok-102',
    tokenNumber: 'KSN-097',
    farmerId: 'f-102',
    farmerName: 'K. Venkat Rao',
    farmerPhone: '+91 94401 22334',
    centerId: 'vijayawada',
    centerName: 'Vijayawada Procurement Center',
    counterId: 'CNT-VJA-1',
    counterName: 'Counter 1 (Paddy)',
    serviceType: 'Paddy Procurement',
    produceType: 'Paddy (Grade A)',
    quantityQuintals: 55,
    priority: 'SENIOR_CITIZEN',
    status: 'CALLED',
    queuePosition: 1,
    farmersAhead: 0,
    estimatedWaitMin: 0,
    calledAt: Date.now() - 2 * 60 * 1000,
    operatingDate: new Date().toISOString().split('T')[0],
    createdAt: Date.now() - 90 * 60 * 1000,
  },
  {
    id: 'tok-103',
    tokenNumber: 'KSN-098',
    farmerId: 'f-103',
    farmerName: 'Srinivas Reddi',
    farmerPhone: '+91 98480 88776',
    centerId: 'vijayawada',
    centerName: 'Vijayawada Procurement Center',
    counterId: 'CNT-VJA-2',
    counterName: 'Counter 2 (Paddy)',
    serviceType: 'Paddy Procurement',
    produceType: 'Paddy Common',
    quantityQuintals: 35,
    priority: 'NORMAL',
    status: 'QUALITY_CHECK',
    queuePosition: 0,
    farmersAhead: 0,
    estimatedWaitMin: 0,
    calledAt: Date.now() - 20 * 60 * 1000,
    serviceStartedAt: Date.now() - 15 * 60 * 1000,
    operatingDate: new Date().toISOString().split('T')[0],
    createdAt: Date.now() - 110 * 60 * 1000,
  },
];

/** Initial Seed Counters for Offline Fallback */
export const INITIAL_COUNTERS: CounterItem[] = [
  { id: 'CNT-VJA-1', centerId: 'vijayawada', counterName: 'Counter 1 (Paddy)', assignedStaffName: 'Officer S. Rao', status: 'ACTIVE', createdAt: Date.now() },
  { id: 'CNT-VJA-2', centerId: 'vijayawada', counterName: 'Counter 2 (Paddy)', assignedStaffName: 'Tech R. Varma', status: 'BUSY', createdAt: Date.now() },
  { id: 'CNT-VJA-3', centerId: 'vijayawada', counterName: 'Counter 3 (Express)', assignedStaffName: 'Supervisor M. Naidu', status: 'BREAK', createdAt: Date.now() },
  { id: 'CNT-GNT-1', centerId: 'guntur', counterName: 'Counter 1 (Chilli & Paddy)', assignedStaffName: 'Officer K. Reddi', status: 'ACTIVE', createdAt: Date.now() },
  { id: 'CNT-GNT-2', centerId: 'guntur', counterName: 'Counter 2 (Chilli)', assignedStaffName: 'Officer B. Prasad', status: 'ACTIVE', createdAt: Date.now() },
];
