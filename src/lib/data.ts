export type ViewId =
  | 'home'
  | 'dashboard'
  | 'map'
  | 'token'
  | 'payment'
  | 'analytics'
  | 'msp';

export type Lang = 'en' | 'te' | 'hi';

export type CrowdLevel = 'low' | 'moderate' | 'high';

export interface ProcurementCenter {
  id: string;
  name: string;
  district: string;
  crowd: CrowdLevel;
  farmersWaiting: number;
  avgWaitMin: number;
  capacityPct: number;
  bestChoice?: boolean;
  x: number; // map position %
  y: number;
}

export interface QueueEntry {
  token: string;
  status: 'processing' | 'waiting';
  isYou?: boolean;
}

export interface NotificationItem {
  id: string;
  type: 'reminder' | 'queue' | 'produce' | 'payment';
  title: string;
  body: string;
  time: string;
}

export interface PaymentTimelineStep {
  label: string;
  done: boolean;
  icon: string;
}

export const FARMER = {
  name: 'Ravi Kumar',
  crop: 'Paddy',
  quantity: 40,
  center: 'Vijayawada',
  date: '28 August 2026',
  time: '10:30 AM',
  token: 'A127',
  queuePosition: 4,
  farmersAhead: 3,
  estimatedWaitMin: 24,
  amount: 92400,
};

export const CENTERS: ProcurementCenter[] = [
  { id: 'vij', name: 'Vijayawada Center', district: 'Krishna', crowd: 'low', farmersWaiting: 18, avgWaitMin: 24, capacityPct: 72, bestChoice: true, x: 52, y: 58 },
  { id: 'gun', name: 'Guntur Center', district: 'Guntur', crowd: 'low', farmersWaiting: 12, avgWaitMin: 18, capacityPct: 45, x: 40, y: 66 },
  { id: 'viz', name: 'Visakhapatnam Center', district: 'Visakhapatnam', crowd: 'high', farmersWaiting: 64, avgWaitMin: 88, capacityPct: 94, x: 72, y: 30 },
  { id: 'tir', name: 'Tirupati Center', district: 'Chittoor', crowd: 'moderate', farmersWaiting: 38, avgWaitMin: 52, capacityPct: 81, x: 46, y: 84 },
  { id: 'war', name: 'Warangal Center', district: 'Warangal', crowd: 'moderate', farmersWaiting: 31, avgWaitMin: 44, capacityPct: 68, x: 30, y: 44 },
  { id: 'kak', name: 'Kakinada Center', district: 'East Godavari', crowd: 'low', farmersWaiting: 9, avgWaitMin: 14, capacityPct: 38, x: 64, y: 44 },
  { id: 'nlg', name: 'Nalgonda Center', district: 'Nalgonda', crowd: 'high', farmersWaiting: 52, avgWaitMin: 76, capacityPct: 91, x: 34, y: 74 },
  { id: 'kurn', name: 'Kurnool Center', district: 'Kurnool', crowd: 'moderate', farmersWaiting: 27, avgWaitMin: 47, capacityPct: 63, x: 24, y: 78 },
];

export const QUEUE: QueueEntry[] = [
  { token: 'A124', status: 'processing' },
  { token: 'A125', status: 'waiting' },
  { token: 'A126', status: 'waiting' },
  { token: 'A127', status: 'waiting', isYou: true },
];

export const NOTIFICATIONS: NotificationItem[] = [
  { id: 'n1', type: 'reminder', title: 'Appointment Reminder', body: 'Your procurement slot starts in 1 hour.', time: '9:30 AM' },
  { id: 'n2', type: 'queue', title: 'Queue Update', body: 'Only 2 farmers are ahead of you!', time: '10:06 AM' },
  { id: 'n3', type: 'produce', title: 'Procurement Update', body: 'Your produce has passed quality verification.', time: '10:48 AM' },
  { id: 'n4', type: 'payment', title: 'Payment Update', body: '₹92,400 has been successfully processed.', time: '11:02 AM' },
];

export const PAYMENT_TIMELINE: PaymentTimelineStep[] = [
  { label: 'Produce Accepted', done: true, icon: 'wheat' },
  { label: 'Payment Verified', done: true, icon: 'check' },
  { label: 'Payment Generated', done: true, icon: 'file' },
  { label: 'Money Sent', done: true, icon: 'wallet' },
];

export const CENTER_DASH = {
  farmersToday: 128,
  tokens: 142,
  waiting: 41,
  completed: 87,
  quintals: 384,
  paymentsLakh: 8.4,
  capacityPct: 72,
};

export const JOURNEY_STEPS = [
  { n: '01', icon: 'sprout', title: 'Register', desc: 'Create your farmer profile in minutes.' },
  { n: '02', icon: 'wheat', title: 'Add Produce', desc: 'Log your crop, quantity, and grade.' },
  { n: '03', icon: 'ticket', title: 'Get Smart Token', desc: 'AI assigns the fastest procurement slot.' },
  { n: '04', icon: 'mapPin', title: 'Visit Center', desc: 'Arrive at your chosen time — no crowd.' },
  { n: '05', icon: 'scanSearch', title: 'Quality Check', desc: 'Transparent grading at the center.' },
  { n: '06', icon: 'wallet', title: 'Get Paid', desc: 'Payment sent directly to your account.' },
];

export const WOW_FEATURES = [
  { icon: 'brain', title: 'AI Waiting Prediction', desc: 'Predict waiting time using live queue data.' },
  { icon: 'sparkles', title: 'AI Slot Optimization', desc: 'Recommend the fastest procurement slot.' },
  { icon: 'mapPin', title: 'Smart Center Recommendation', desc: 'Find nearby centers with lower crowds.' },
  { icon: 'mic', title: 'Voice Farmer Assistant', desc: 'Interact using your voice, in your language.' },
  { icon: 'languages', title: 'Multilingual Interface', desc: 'Telugu, Hindi, and English.' },
  { icon: 'signal', title: 'Low-Internet Mode', desc: 'Token and appointment info stays accessible.' },
  { icon: 'bell', title: 'Smart Notifications', desc: 'Automatic alerts for schedule & queue changes.' },
  { icon: 'shieldCheck', title: 'Transparent Payments', desc: 'Complete payment lifecycle tracking.' },
];

export const STATS = [
  { value: 25000, suffix: '+', label: 'Farmers Connected', icon: 'users' },
  { value: 150, suffix: '+', label: 'Procurement Centers', icon: 'store' },
  { value: 1200000, suffix: '+', label: 'Quintals Procured', icon: 'wheat', format: 'compact' as const },
  { value: 45, suffix: 'Cr+', label: 'Payments Processed', icon: 'wallet', format: 'rupee' as const },
];

export const DEMO_FLOW = [
  { icon: 'smartphone', text: 'Farmer opens KisanConnect' },
  { icon: 'wheat', text: 'Adds 40 Quintals of Paddy' },
  { icon: 'brain', text: 'AI analyzes procurement centers' },
  { icon: 'sparkles', text: 'AI recommends the fastest center' },
  { icon: 'ticket', text: 'Farmer receives Token A127' },
  { icon: 'mapPin', text: 'Farmer tracks live queue' },
  { icon: 'bell', text: '“Your turn is approaching!”' },
  { icon: 'store', text: 'Farmer reaches center' },
  { icon: 'scanSearch', text: 'Quality check completed' },
  { icon: 'check', text: 'Produce accepted' },
  { icon: 'wallet', text: '₹92,400 Payment Processed' },
  { icon: 'partyPopper', text: 'Harvest Successfully Delivered!' },
];

export const CROP_DATA = [
  { crop: 'Paddy', pct: 42, color: '#22c55e' },
  { crop: 'Cotton', pct: 24, color: '#fbbf24' },
  { crop: 'Maize', pct: 18, color: '#f59e0b' },
  { crop: 'Groundnut', pct: 10, color: '#3a7d57' },
  { crop: 'Others', pct: 6, color: '#86efac' },
];

export const WEEK_VOLUME = [
  { day: 'Mon', value: 58 },
  { day: 'Tue', value: 72 },
  { day: 'Wed', value: 65 },
  { day: 'Thu', value: 91 },
  { day: 'Fri', value: 84 },
  { day: 'Sat', value: 103 },
  { day: 'Sun', value: 47 },
];

export const SATISFACTION = [
  { label: '5 Star', pct: 68 },
  { label: '4 Star', pct: 22 },
  { label: '3 Star', pct: 7 },
  { label: '2 Star', pct: 2 },
  { label: '1 Star', pct: 1 },
];

export const MSP_FALLBACK = [
  { id: 'f1', crop: 'Paddy', variety: 'Common', msp_per_quintal: 2300, market_price_per_quintal: 2310, unit: 'Quintal', season: 'Kharif 2026', change_pct: 5.0, is_active: true },
  { id: 'f2', crop: 'Cotton', variety: 'Medium Staple', msp_per_quintal: 7125, market_price_per_quintal: 7200, unit: 'Quintal', season: 'Kharif 2026', change_pct: 3.7, is_active: true },
  { id: 'f3', crop: 'Maize', variety: 'Yellow', msp_per_quintal: 2250, market_price_per_quintal: 2180, unit: 'Quintal', season: 'Kharif 2026', change_pct: 4.7, is_active: true },
  { id: 'f4', crop: 'Groundnut', variety: 'Common', msp_per_quintal: 6780, market_price_per_quintal: 6900, unit: 'Quintal', season: 'Kharif 2026', change_pct: 2.0, is_active: true },
  { id: 'f5', crop: 'Wheat', variety: 'Grade A', msp_per_quintal: 2275, market_price_per_quintal: 2300, unit: 'Quintal', season: 'Rabi 2026', change_pct: 2.3, is_active: true },
  { id: 'f6', crop: 'Soybean', variety: 'Yellow', msp_per_quintal: 4980, market_price_per_quintal: 5050, unit: 'Quintal', season: 'Kharif 2026', change_pct: 3.3, is_active: true },
  { id: 'f7', crop: 'Tur (Arhar)', variety: 'Common', msp_per_quintal: 7525, market_price_per_quintal: 7600, unit: 'Quintal', season: 'Kharif 2026', change_pct: 4.9, is_active: true },
  { id: 'f8', crop: 'Sunflower', variety: 'Common', msp_per_quintal: 7980, market_price_per_quintal: 8100, unit: 'Quintal', season: 'Kharif 2026', change_pct: 1.9, is_active: true },
];
