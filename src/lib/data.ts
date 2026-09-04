export type ViewId =
  | 'home'
  | 'dashboard'
  | 'produce'
  | 'map'
  | 'token'
  | 'payment'
  | 'quality'
  | 'analytics'
  | 'msp'
  | 'staff'
  | 'admin'
  | 'auth';

export type Lang = 'en' | 'te' | 'hi' | 'ta' | 'kn' | 'ml' | 'mr' | 'bn' | 'gu' | 'pa' | 'or';

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

export function getFarmerData(lang: Lang) {
  if (lang === 'te') {
    return {
      name: 'రవి కుమార్',
      crop: 'వరి ధాన్యం',
      quantity: 40,
      center: 'విజయవాడ',
      date: '28 ఆగస్టు 2026',
      time: 'ఉదయం 10:30',
      token: 'A127',
      queuePosition: 4,
      farmersAhead: 3,
      estimatedWaitMin: 24,
      amount: 92400,
    };
  }
  if (lang === 'hi') {
    return {
      name: 'रवि कुमार',
      crop: 'धान',
      quantity: 40,
      center: 'विजयवाडा',
      date: '28 अगस्त 2026',
      time: 'सुबह 10:30',
      token: 'A127',
      queuePosition: 4,
      farmersAhead: 3,
      estimatedWaitMin: 24,
      amount: 92400,
    };
  }
  return FARMER;
}

export const CENTERS: ProcurementCenter[] = [
  { id: 'vij', name: 'Vijayawada Center', district: 'Krishna', crowd: 'low', farmersWaiting: 18, avgWaitMin: 24, capacityPct: 72, bestChoice: true, x: 52, y: 58 },
  { id: 'gun', name: 'Guntur Center', district: 'Guntur', crowd: 'low', farmersWaiting: 12, avgWaitMin: 18, capacityPct: 45, x: 40, y: 66 },
  { id: 'viz', name: 'Visakhapatnam Center', district: 'Visakhapatnam', crowd: 'high', farmersWaiting: 64, avgWaitMin: 88, capacityPct: 94, x: 72, y: 30 },
  { id: 'tir', name: 'Tirupati Center', district: 'Chittoor', crowd: 'moderate', farmersWaiting: 38, avgWaitMin: 52, capacityPct: 81, x: 46, y: 84 },
  { id: 'war', name: 'Warangal Center', district: 'Warangal', crowd: 'moderate', farmersWaiting: 31, avgWaitMin: 44, capacityPct: 68, x: 30, y: 44 },
  { id: 'kak', name: 'Kakinada Center', district: 'East Godavari', crowd: 'low', farmersWaiting: 9, avgWaitMin: 14, capacityPct: 38, x: 64, y: 44 },
  { id: 'nlg', name: 'Nalgonda Center', district: 'Nalgonda', crowd: 'high', farmersWaiting: 52, avgWaitMin: 76, capacityPct: 91, x: 34, y: 74 },
  { id: 'kurn', name: 'Kurnool Center', district: 'Kurnool', crowd: 'moderate', farmersWaiting: 27, avgWaitMin: 47, capacityPct: 63, x: 24, y: 78 },
  { id: 'ana', name: 'Anantapur Center', district: 'Anantapur', crowd: 'low', farmersWaiting: 14, avgWaitMin: 20, capacityPct: 50, x: 22, y: 88 },
  { id: 'rjy', name: 'Rajahmundry Center', district: 'East Godavari', crowd: 'moderate', farmersWaiting: 22, avgWaitMin: 30, capacityPct: 60, x: 58, y: 50 },
  { id: 'kdp', name: 'Kadapa Center', district: 'YSR Kadapa', crowd: 'low', farmersWaiting: 16, avgWaitMin: 22, capacityPct: 52, x: 38, y: 82 },
  { id: 'nzb', name: 'Nizamabad Center', district: 'Nizamabad', crowd: 'moderate', farmersWaiting: 35, avgWaitMin: 40, capacityPct: 70, x: 26, y: 32 },
  { id: 'khm', name: 'Khammam Center', district: 'Khammam', crowd: 'low', farmersWaiting: 11, avgWaitMin: 16, capacityPct: 42, x: 42, y: 48 },
  { id: 'elr', name: 'Eluru Center', district: 'West Godavari', crowd: 'low', farmersWaiting: 15, avgWaitMin: 22, capacityPct: 55, x: 50, y: 54 },
];

export function getCentersData(lang: Lang): ProcurementCenter[] {
  if (lang === 'te') {
    return [
      { id: 'vij', name: 'విజయవాడ కొనుగోలు కేంద్రం', district: 'కృష్ణా', crowd: 'low', farmersWaiting: 18, avgWaitMin: 24, capacityPct: 72, bestChoice: true, x: 52, y: 58 },
      { id: 'gun', name: 'గుంటూరు కొనుగోలు కేంద్రం', district: 'గుంటూరు', crowd: 'low', farmersWaiting: 12, avgWaitMin: 18, capacityPct: 45, x: 40, y: 66 },
      { id: 'viz', name: 'విశాఖపట్నం కొనుగోలు కేంద్రం', district: 'విశాఖపట్నం', crowd: 'high', farmersWaiting: 64, avgWaitMin: 88, capacityPct: 94, x: 72, y: 30 },
      { id: 'tir', name: 'తిరుపతి కొనుగోలు కేంద్రం', district: 'చిత్తూరు', crowd: 'moderate', farmersWaiting: 38, avgWaitMin: 52, capacityPct: 81, x: 46, y: 84 },
      { id: 'war', name: 'వరంగల్ కొనుగోలు కేంద్రం', district: 'వరంగల్', crowd: 'moderate', farmersWaiting: 31, avgWaitMin: 44, capacityPct: 68, x: 30, y: 44 },
      { id: 'kak', name: 'కాకినాడ కొనుగోలు కేంద్రం', district: 'తూర్పు గోదావరి', crowd: 'low', farmersWaiting: 9, avgWaitMin: 14, capacityPct: 38, x: 64, y: 44 },
      { id: 'nlg', name: 'నల్గొండ కొనుగోలు కేంద్రం', district: 'నల్గొండ', crowd: 'high', farmersWaiting: 52, avgWaitMin: 76, capacityPct: 91, x: 34, y: 74 },
      { id: 'kurn', name: 'కర్నూలు కొనుగోలు కేంద్రం', district: 'కర్నూలు', crowd: 'moderate', farmersWaiting: 27, avgWaitMin: 47, capacityPct: 63, x: 24, y: 78 },
      { id: 'ana', name: 'అనంతపురం కొనుగోలు కేంద్రం', district: 'అనంతపురం', crowd: 'low', farmersWaiting: 14, avgWaitMin: 20, capacityPct: 50, x: 22, y: 88 },
      { id: 'rjy', name: 'రాజమండ్రి కొనుగోలు కేంద్రం', district: 'తూర్పు గోదావరి', crowd: 'moderate', farmersWaiting: 22, avgWaitMin: 30, capacityPct: 60, x: 58, y: 50 },
      { id: 'kdp', name: 'కడప కొనుగోలు కేంద్రం', district: 'వైఎస్సార్ కడప', crowd: 'low', farmersWaiting: 16, avgWaitMin: 22, capacityPct: 52, x: 38, y: 82 },
      { id: 'nzb', name: 'నిజామాబాద్ కొనుగోలు కేంద్రం', district: 'నిజామాబాద్', crowd: 'moderate', farmersWaiting: 35, avgWaitMin: 40, capacityPct: 70, x: 26, y: 32 },
      { id: 'khm', name: 'ఖమ్మం కొనుగోలు కేంద్రం', district: 'ఖమ్మం', crowd: 'low', farmersWaiting: 11, avgWaitMin: 16, capacityPct: 42, x: 42, y: 48 },
      { id: 'elr', name: 'ఏలూరు కొనుగోలు కేంద్రం', district: 'పశ్చిమ గోదావరి', crowd: 'low', farmersWaiting: 15, avgWaitMin: 22, capacityPct: 55, x: 50, y: 54 },
    ];
  }
  if (lang === 'hi') {
    return [
      { id: 'vij', name: 'विजयवाडा खरीद केंद्र', district: 'कृष्णा', crowd: 'low', farmersWaiting: 18, avgWaitMin: 24, capacityPct: 72, bestChoice: true, x: 52, y: 58 },
      { id: 'gun', name: 'गुंटूर खरीद केंद्र', district: 'गुंटूर', crowd: 'low', farmersWaiting: 12, avgWaitMin: 18, capacityPct: 45, x: 40, y: 66 },
      { id: 'viz', name: 'विशाखापट्टनम खरीद केंद्र', district: 'विशाखापट्टनम', crowd: 'high', farmersWaiting: 64, avgWaitMin: 88, capacityPct: 94, x: 72, y: 30 },
      { id: 'tir', name: 'तिरुपति खरीद केंद्र', district: 'चित्तूर', crowd: 'moderate', farmersWaiting: 38, avgWaitMin: 52, capacityPct: 81, x: 46, y: 84 },
      { id: 'war', name: 'वरंगल खरीद केंद्र', district: 'वरंगल', crowd: 'moderate', farmersWaiting: 31, avgWaitMin: 44, capacityPct: 68, x: 30, y: 44 },
      { id: 'kak', name: 'काकीनाडा खरीद केंद्र', district: 'पूर्वी गोदावरी', crowd: 'low', farmersWaiting: 9, avgWaitMin: 14, capacityPct: 38, x: 64, y: 44 },
      { id: 'nlg', name: 'नलगोंडा खरीद केंद्र', district: 'नलगोंडा', crowd: 'high', farmersWaiting: 52, avgWaitMin: 76, capacityPct: 91, x: 34, y: 74 },
      { id: 'kurn', name: 'कुरनूल खरीद केंद्र', district: 'कुरनूल', crowd: 'moderate', farmersWaiting: 27, avgWaitMin: 47, capacityPct: 63, x: 24, y: 78 },
      { id: 'ana', name: 'अनंतपुर खरीद केंद्र', district: 'अनंतपुर', crowd: 'low', farmersWaiting: 14, avgWaitMin: 20, capacityPct: 50, x: 22, y: 88 },
      { id: 'rjy', name: 'राजमुंदरी खरीद केंद्र', district: 'पूर्वी गोदावरी', crowd: 'moderate', farmersWaiting: 22, avgWaitMin: 30, capacityPct: 60, x: 58, y: 50 },
      { id: 'kdp', name: 'कडपा खरीद केंद्र', district: 'वाईएसआर कडपा', crowd: 'low', farmersWaiting: 16, avgWaitMin: 22, capacityPct: 52, x: 38, y: 82 },
      { id: 'nzb', name: 'निज़ामाबाद खरीद केंद्र', district: 'निज़ामाबाद', crowd: 'moderate', farmersWaiting: 35, avgWaitMin: 40, capacityPct: 70, x: 26, y: 32 },
      { id: 'khm', name: 'खम्मम खरीद केंद्र', district: 'खम्मम', crowd: 'low', farmersWaiting: 11, avgWaitMin: 16, capacityPct: 42, x: 42, y: 48 },
      { id: 'elr', name: 'एलूरु खरीद केंद्र', district: 'पश्चिम गोदावरी', crowd: 'low', farmersWaiting: 15, avgWaitMin: 22, capacityPct: 55, x: 50, y: 54 },
    ];
  }
  return CENTERS;
}

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

export function getNotifications(lang: Lang): NotificationItem[] {
  if (lang === 'te') {
    return [
      { id: 'n1', type: 'reminder', title: 'అపాయింట్‌మెంట్ జ్ఞాపిక', body: 'మీ కొనుగోలు స్లాట్ మరో 1 గంటలో ప్రారంభమవుతుంది.', time: 'ఉదయం 9:30' },
      { id: 'n2', type: 'queue', title: 'క్యూ లైవ్ సమాచారం', body: 'మీ కంటే ముందు కేవలం 2 రైతులు ఉన్నారు!', time: 'ఉదయం 10:06' },
      { id: 'n3', type: 'produce', title: 'కొనుగోలు పరిశీలన', body: 'మీ పంట నాణ్యత తనిఖీ విజయవంతంగా పూర్తయింది.', time: 'ఉదయం 10:48' },
      { id: 'n4', type: 'payment', title: 'చెల్లింపు నోటిఫికేషన్', body: '₹92,400 మీ బ్యాంక్ ఖాతాలో విజయవంతంగా జమ చేయబడింది.', time: 'ఉదయం 11:02' },
    ];
  }
  if (lang === 'hi') {
    return [
      { id: 'n1', type: 'reminder', title: 'अपॉइंटमेंट रिमाइंडर', body: 'आपका स्लॉट 1 घंटे में शुरू हो रहा है।', time: '9:30 AM' },
      { id: 'n2', type: 'queue', title: 'कतार अपडेट', body: 'आपके आगे केवल 2 किसान हैं!', time: '10:06 AM' },
      { id: 'n3', type: 'produce', title: 'खरीद अपडेट', body: 'आपकी फसल का गुणवत्ता परीक्षण सफल रहा।', time: '10:48 AM' },
      { id: 'n4', type: 'payment', title: 'भुगतान अपडेट', body: '₹92,400 आपके खाते में जमा हो चुके हैं।', time: '11:02 AM' },
    ];
  }
  return NOTIFICATIONS;
}

export const PAYMENT_TIMELINE: PaymentTimelineStep[] = [
  { label: 'Produce Accepted', done: true, icon: 'wheat' },
  { label: 'Payment Verified', done: true, icon: 'check' },
  { label: 'Payment Generated', done: true, icon: 'file' },
  { label: 'Money Sent', done: true, icon: 'wallet' },
];

export function getPaymentTimeline(lang: Lang): PaymentTimelineStep[] {
  if (lang === 'te') {
    return [
      { label: 'పంట స్వీకరించబడింది', done: true, icon: 'wheat' },
      { label: 'చెల్లింపు నాణ్యత ధృవీకరించబడింది', done: true, icon: 'check' },
      { label: 'బిల్లు/ఆర్డర్ జనరేట్ చేయబడింది', done: true, icon: 'file' },
      { label: 'నగదు ఖాతాలో జమయైంది', done: true, icon: 'wallet' },
    ];
  }
  if (lang === 'hi') {
    return [
      { label: 'फसल स्वीकार की गई', done: true, icon: 'wheat' },
      { label: 'भुगतान सत्यापित', done: true, icon: 'check' },
      { label: 'भुगतान रसीद तैयार', done: true, icon: 'file' },
      { label: 'राशि खाते में भेजी गई', done: true, icon: 'wallet' },
    ];
  }
  return PAYMENT_TIMELINE;
}

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

export function getJourneySteps(lang: Lang) {
  if (lang === 'te') {
    return [
      { n: '01', icon: 'sprout', title: 'నమోదు చేయండి', desc: 'రెండు నిమిషాల్లో మీ రైతు ప్రొఫైల్‌ను సృష్టించండి.' },
      { n: '02', icon: 'wheat', title: 'పంట వివరాలు నమోదు', desc: 'మీ పంట, పరిమాణం మరియు రకం వివరాలను నమోదు చేయండి.' },
      { n: '03', icon: 'ticket', title: 'స్మార్ట్ టోకెన్ పొందండి', desc: 'AI ఆధారంగా త్వరిత స్లాట్ కేటాయించబడుతుంది.' },
      { n: '04', icon: 'mapPin', title: 'కేంద్రాన్ని సందర్శించండి', desc: 'మీరు ఎంచుకున్న సమయానికి వెళ్ళండి — రద్దీ ఉండదు.' },
      { n: '05', icon: 'scanSearch', title: 'నాణ్యత తనిఖీ', desc: 'కేంద్రం వద్ద పారదర్శక నాణ్యతా నిర్ధారణ.' },
      { n: '06', icon: 'wallet', title: 'చెల్లింపు పొందండి', desc: 'నేరుగా మీ బ్యాంక్ ఖాతాకే నిధులు జమ.' },
    ];
  }
  if (lang === 'hi') {
    return [
      { n: '01', icon: 'sprout', title: 'पंजीकरण करें', desc: 'कुछ ही मिनटों में अपना किसान प्रोफाइल बनाएं।' },
      { n: '02', icon: 'wheat', title: 'फसल दर्ज करें', desc: 'अपनी फसल, मात्रा और ग्रेड जोड़ें।' },
      { n: '03', icon: 'ticket', title: 'स्मार्ट टोकन लें', desc: 'AI सबसे तेज़ स्लॉट आवंटित करता है।' },
      { n: '04', icon: 'mapPin', title: 'केंद्र पर जाएं', desc: 'अपने चुने समय पर पहुँचें — कोई भीड़ नहीं।' },
      { n: '05', icon: 'scanSearch', title: 'गुणवत्ता जांच', desc: 'केंद्र पर पारदर्शी ग्रेडिंग प्रक्रिया।' },
      { n: '06', icon: 'wallet', title: 'भुगतान पाएं', desc: 'सीधे आपके बैंक खाते में राशि ट्रांसफर।' },
    ];
  }
  return JOURNEY_STEPS;
}

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

export function getWowFeatures(lang: Lang) {
  if (lang === 'te') {
    return [
      { icon: 'brain', title: 'AI వేచియుండే సమయ అంచనా', desc: 'లైవ్ క్యూ ఆధారంగా వేచియుండే సమయాన్ని అంచనా వేస్తుంది.' },
      { icon: 'sparkles', title: 'AI స్లాట్ అన్వేషణ', desc: 'మీకు వేగవంతమైన కొనుగోలు స్లాట్‌ను సిఫార్సు చేస్తుంది.' },
      { icon: 'mapPin', title: 'స్మార్ట్ కేంద్రం సిఫార్సు', desc: 'తక్కువ రద్దీ ఉన్న సమీప కేంద్రాలను కనుగొనండి.' },
      { icon: 'mic', title: 'వాయిస్ రైతు అసిస్టెంట్', desc: 'మీ మాతృభాషలోనే మాట్లాడి సమాచారం పొందండి.' },
      { icon: 'languages', title: 'బహుభాషా సౌలభ్యం', desc: 'తెలుగు, హిందీ మరియు ఆంగ్ల భాషల మద్దతు.' },
      { icon: 'signal', title: 'తక్కువ ఇంటర్నెట్ మోడ్', desc: 'నెట్‌వర్క్ లేకున్నా టోకెన్ సమాచారం లభిస్తుంది.' },
      { icon: 'bell', title: 'స్మార్ట్ నోటిఫికేషన్లు', desc: 'క్యూ మరియు సమయ మార్పులపై స్వయంచాలక హెచ్చరికలు.' },
      { icon: 'shieldCheck', title: 'పారదర్శక చెల్లింపులు', desc: 'ప్రతి దశలో చెల్లింపు పురోగతిని ట్రాక్ చేయండి.' },
    ];
  }
  if (lang === 'hi') {
    return [
      { icon: 'brain', title: 'AI प्रतीक्षा अनुमान', desc: 'लाइव कतार डेटा से प्रतीक्षा समय बताता है।' },
      { icon: 'sparkles', title: 'AI स्लॉट सुझाव', desc: 'सबसे तेज़ खरीद स्लॉट की सिफारिश करता है।' },
      { icon: 'mapPin', title: 'स्मार्ट केंद्र सुझाव', desc: 'कम भीड़ वाले पास के केंद्र खोजें।' },
      { icon: 'mic', title: 'वॉयस किसान सहायक', desc: 'अपनी भाषा में बोलकर जानकारी प्राप्त करें।' },
      { icon: 'languages', title: 'बहुभाषी इंटरफ़ेस', desc: 'तेलुगु, हिंदी और अंग्रेजी का पूरा समर्थन।' },
      { icon: 'signal', title: 'लो-इंटरनेट मोड', desc: 'इंटरनेट धीमा होने पर भी टोकन सुरक्षित।' },
      { icon: 'bell', title: 'स्मार्ट नोटिफिकेशन', desc: 'कतार बदलाव पर तुरंत अलर्ट।' },
      { icon: 'shieldCheck', title: 'पारदर्शी भुगतान', desc: 'भुगतान की हर स्थिति को लाइव देखें।' },
    ];
  }
  return WOW_FEATURES;
}

export const STATS = [
  { value: 25000, suffix: '+', label: 'Farmers Connected', icon: 'users' },
  { value: 150, suffix: '+', label: 'Procurement Centers', icon: 'store' },
  { value: 1200000, suffix: '+', label: 'Quintals Procured', icon: 'wheat', format: 'compact' as const },
  { value: 45, suffix: 'Cr+', label: 'Payments Processed', icon: 'wallet', format: 'rupee' as const },
];

export function getStats(lang: Lang) {
  if (lang === 'te') {
    return [
      { value: 25000, suffix: '+', label: 'అనుసంధానమైన రైతులు', icon: 'users' },
      { value: 150, suffix: '+', label: 'కొనుగోలు కేంద్రాలు', icon: 'store' },
      { value: 1200000, suffix: '+', label: 'సేకరించిన క్వింటాళ్లు', icon: 'wheat', format: 'compact' as const },
      { value: 45, suffix: 'కోట్లు+', label: 'పూర్తయిన చెల్లింపులు', icon: 'wallet', format: 'rupee' as const },
    ];
  }
  if (lang === 'hi') {
    return [
      { value: 25000, suffix: '+', label: 'जुड़े हुए किसान', icon: 'users' },
      { value: 150, suffix: '+', label: 'खरीद केंद्र', icon: 'store' },
      { value: 1200000, suffix: '+', label: 'कुल क्विंटल खरीद', icon: 'wheat', format: 'compact' as const },
      { value: 45, suffix: 'करोड़+', label: 'प्रसंस्कृत भुगतान', icon: 'wallet', format: 'rupee' as const },
    ];
  }
  return STATS;
}

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

export function getDemoFlow(lang: Lang) {
  if (lang === 'te') {
    return [
      { icon: 'smartphone', text: 'రైతు కిసాన్‌కనెక్ట్ ఓపెన్ చేస్తారు' },
      { icon: 'wheat', text: '40 క్వింటాళ్ల వరి ధాన్యం నమోదు చేస్తారు' },
      { icon: 'brain', text: 'AI కొనుగోలు కేంద్రాలను విశ్లేషిస్తుంది' },
      { icon: 'sparkles', text: 'AI త్వరిత కేంద్రాన్ని సిఫార్సు చేస్తుంది' },
      { icon: 'ticket', text: 'రైతుకు టోకెన్ A127 లభిస్తుంది' },
      { icon: 'mapPin', text: 'రైతు లైవ్ క్యూను ట్రాక్ చేస్తారు' },
      { icon: 'bell', text: '“మీ వంతు సమయం దగ్గరపడింది!”' },
      { icon: 'store', text: 'రైతు కేంద్రానికి చేరుకుంటారు' },
      { icon: 'scanSearch', text: 'నాణ్యతా తనిఖీ పూర్తయింది' },
      { icon: 'check', text: 'ధాన్యం స్వీకరించబడింది' },
      { icon: 'wallet', text: '₹92,400 చెల్లింపు పూర్తయింది' },
      { icon: 'partyPopper', text: 'పంట విజయవంతంగా విక్రయించబడింది!' },
    ];
  }
  if (lang === 'hi') {
    return [
      { icon: 'smartphone', text: 'किसान ने किसानकनेक्ट खोला' },
      { icon: 'wheat', text: '40 क्विंटल धान दर्ज किया' },
      { icon: 'brain', text: 'AI ने खरीद केंद्रों का विश्लेषण किया' },
      { icon: 'sparkles', text: 'AI ने सबसे तेज़ केंद्र का सुझाव दिया' },
      { icon: 'ticket', text: 'किसान को टोकन A127 मिला' },
      { icon: 'mapPin', text: 'किसान ने लाइव कतार देखी' },
      { icon: 'bell', text: '“आपकी बारी पास आ रही है!”' },
      { icon: 'store', text: 'किसान केंद्र पहुँचा' },
      { icon: 'scanSearch', text: 'गुणवत्ता जांच संपन्न' },
      { icon: 'check', text: 'फसल स्वीकार की गई' },
      { icon: 'wallet', text: '₹92,400 का भुगतान हुआ' },
      { icon: 'partyPopper', text: 'फसल सफलतापूर्वक जमा हुई!' },
    ];
  }
  return DEMO_FLOW;
}

export const CROP_DATA = [
  { crop: 'Paddy', pct: 42, color: '#22c55e' },
  { crop: 'Cotton', pct: 24, color: '#fbbf24' },
  { crop: 'Maize', pct: 18, color: '#f59e0b' },
  { crop: 'Groundnut', pct: 10, color: '#3a7d57' },
  { crop: 'Others', pct: 6, color: '#86efac' },
];

export function getCropData(lang: Lang) {
  if (lang === 'te') {
    return [
      { crop: 'వరి (ప్యాడీ)', pct: 42, color: '#22c55e' },
      { crop: 'పత్తి (కాటన్)', pct: 24, color: '#fbbf24' },
      { crop: 'మొక్కజొన్న', pct: 18, color: '#f59e0b' },
      { crop: 'వేరుశనగ', pct: 10, color: '#3a7d57' },
      { crop: 'ఇతర పంటలు', pct: 6, color: '#86efac' },
    ];
  }
  if (lang === 'hi') {
    return [
      { crop: 'धान', pct: 42, color: '#22c55e' },
      { crop: 'कपास', pct: 24, color: '#fbbf24' },
      { crop: 'मक्का', pct: 18, color: '#f59e0b' },
      { crop: 'मूंगफली', pct: 10, color: '#3a7d57' },
      { crop: 'अन्य', pct: 6, color: '#86efac' },
    ];
  }
  return CROP_DATA;
}

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
  { id: 'f9', crop: 'Moong (Green Gram)', variety: 'Special', msp_per_quintal: 8558, market_price_per_quintal: 8650, unit: 'Quintal', season: 'Kharif 2026', change_pct: 4.2, is_active: true },
  { id: 'f10', crop: 'Urad (Black Gram)', variety: 'Common', msp_per_quintal: 7400, market_price_per_quintal: 7500, unit: 'Quintal', season: 'Kharif 2026', change_pct: 3.5, is_active: true },
  { id: 'f11', crop: 'Guntur Red Chilli', variety: 'Dry Premium', msp_per_quintal: 12500, market_price_per_quintal: 13200, unit: 'Quintal', season: 'Rabi 2026', change_pct: 6.1, is_active: true },
  { id: 'f12', crop: 'Sugarcane', variety: 'FRP Standard', msp_per_quintal: 315, market_price_per_quintal: 325, unit: 'Quintal', season: 'Annual 2026', change_pct: 3.1, is_active: true },
  { id: 'f13', crop: 'Mustard / Rapeseed', variety: 'Bold Seed', msp_per_quintal: 5950, market_price_per_quintal: 6100, unit: 'Quintal', season: 'Rabi 2026', change_pct: 2.8, is_active: true },
  { id: 'f14', crop: 'Bengal Gram (Chana)', variety: 'Desi', msp_per_quintal: 5440, market_price_per_quintal: 5520, unit: 'Quintal', season: 'Rabi 2026', change_pct: 3.4, is_active: true },
];

export function getMspFallbackData(lang: Lang) {
  if (lang === 'te') {
    return [
      { id: 'f1', crop: 'వరి (ప్యాడీ)', variety: 'సాధారణ రకం', msp_per_quintal: 2300, market_price_per_quintal: 2310, unit: 'క్వింటాల్', season: 'ఖరీఫ్ 2026', change_pct: 5.0, is_active: true },
      { id: 'f2', crop: 'పత్తి (కాటన్)', variety: 'మధ్యస్థ రకం', msp_per_quintal: 7125, market_price_per_quintal: 7200, unit: 'క్వింటాల్', season: 'ఖరీఫ్ 2026', change_pct: 3.7, is_active: true },
      { id: 'f3', crop: 'మొక్కజొన్న', variety: 'పసుపు పచ్చ', msp_per_quintal: 2250, market_price_per_quintal: 2180, unit: 'క్వింటాల్', season: 'ఖరీఫ్ 2026', change_pct: 4.7, is_active: true },
      { id: 'f4', crop: 'వేరుశనగ', variety: 'సాధారణ రకం', msp_per_quintal: 6780, market_price_per_quintal: 6900, unit: 'క్వింటాల్', season: 'ఖరీఫ్ 2026', change_pct: 2.0, is_active: true },
      { id: 'f5', crop: 'గోధుమలు', variety: 'గ్రేడ్-A', msp_per_quintal: 2275, market_price_per_quintal: 2300, unit: 'క్వింటాల్', season: 'రబీ 2026', change_pct: 2.3, is_active: true },
      { id: 'f6', crop: 'సోయాబీన్', variety: 'పసుపు పచ్చ', msp_per_quintal: 4980, market_price_per_quintal: 5050, unit: 'క్వింటాల్', season: 'ఖరీఫ్ 2026', change_pct: 3.3, is_active: true },
      { id: 'f7', crop: 'కందులు (తూర్)', variety: 'సాధారణ రకం', msp_per_quintal: 7525, market_price_per_quintal: 7600, unit: 'క్వింటాల్', season: 'ఖరీఫ్ 2026', change_pct: 4.9, is_active: true },
      { id: 'f8', crop: 'పొద్దుతిరుగుడు', variety: 'సాధారణ రకం', msp_per_quintal: 7980, market_price_per_quintal: 8100, unit: 'క్వింటాల్', season: 'ఖరీఫ్ 2026', change_pct: 1.9, is_active: true },
      { id: 'f9', crop: 'పెసలు (మూంగ్)', variety: 'ప్రత్యేక రకం', msp_per_quintal: 8558, market_price_per_quintal: 8650, unit: 'క్వింటాల్', season: 'ఖరీఫ్ 2026', change_pct: 4.2, is_active: true },
      { id: 'f10', crop: 'మినుములు (ఉరద్)', variety: 'సాధారణ రకం', msp_per_quintal: 7400, market_price_per_quintal: 7500, unit: 'క్వింటాల్', season: 'ఖరీఫ్ 2026', change_pct: 3.5, is_active: true },
      { id: 'f11', crop: 'గుంటూరు ఎండు మిర్చి', variety: 'ప్రీమియం డ్రై', msp_per_quintal: 12500, market_price_per_quintal: 13200, unit: 'క్వింటాల్', season: 'రబీ 2026', change_pct: 6.1, is_active: true },
      { id: 'f12', crop: 'చెరకు (షుగర్‌కేన్)', variety: 'FRP ప్రామాణికం', msp_per_quintal: 315, market_price_per_quintal: 325, unit: 'క్వింటాల్', season: 'వార్షిక 2026', change_pct: 3.1, is_active: true },
      { id: 'f13', crop: 'ఆవాలు (మస్టర్డ్)', variety: 'సాధారణ విత్తనం', msp_per_quintal: 5950, market_price_per_quintal: 6100, unit: 'క్వింటాల్', season: 'రబీ 2026', change_pct: 2.8, is_active: true },
      { id: 'f14', crop: 'శనగలు (శనగ)', variety: 'దేశీ రకం', msp_per_quintal: 5440, market_price_per_quintal: 5520, unit: 'క్వింటాల్', season: 'రబీ 2026', change_pct: 3.4, is_active: true },
    ];
  }
  if (lang === 'hi') {
    return [
      { id: 'f1', crop: 'धान', variety: 'सामान्य', msp_per_quintal: 2300, market_price_per_quintal: 2310, unit: 'क्विंटल', season: 'खरीफ 2026', change_pct: 5.0, is_active: true },
      { id: 'f2', crop: 'कपास', variety: 'मध्यम धागा', msp_per_quintal: 7125, market_price_per_quintal: 7200, unit: 'क्विंटल', season: 'खरीफ 2026', change_pct: 3.7, is_active: true },
      { id: 'f3', crop: 'मक्का', variety: 'पीला', msp_per_quintal: 2250, market_price_per_quintal: 2180, unit: 'क्विंटल', season: 'खरीफ 2026', change_pct: 4.7, is_active: true },
      { id: 'f4', crop: 'मूंगफली', variety: 'सामान्य', msp_per_quintal: 6780, market_price_per_quintal: 6900, unit: 'क्विंटल', season: 'खरीफ 2026', change_pct: 2.0, is_active: true },
      { id: 'f5', crop: 'गेहूं', variety: 'ग्रेड ए', msp_per_quintal: 2275, market_price_per_quintal: 2300, unit: 'क्विंटल', season: 'रबी 2026', change_pct: 2.3, is_active: true },
      { id: 'f6', crop: 'सोयाबीन', variety: 'पीला', msp_per_quintal: 4980, market_price_per_quintal: 5050, unit: 'क्विंटल', season: 'खरीफ 2026', change_pct: 3.3, is_active: true },
      { id: 'f7', crop: 'तूर (अरहर)', variety: 'सामान्य', msp_per_quintal: 7525, market_price_per_quintal: 7600, unit: 'क्विंटल', season: 'खरीफ 2026', change_pct: 4.9, is_active: true },
      { id: 'f8', crop: 'सूरजमुखी', variety: 'सामान्य', msp_per_quintal: 7980, market_price_per_quintal: 8100, unit: 'क्विंटल', season: 'खरीफ 2026', change_pct: 1.9, is_active: true },
      { id: 'f9', crop: 'मूंग', variety: 'विशेष', msp_per_quintal: 8558, market_price_per_quintal: 8650, unit: 'क्विंटल', season: 'खरीफ 2026', change_pct: 4.2, is_active: true },
      { id: 'f10', crop: 'उड़द', variety: 'सामान्य', msp_per_quintal: 7400, market_price_per_quintal: 7500, unit: 'क्विंटल', season: 'खरीफ 2026', change_pct: 3.5, is_active: true },
      { id: 'f11', crop: 'गुंटूर लाल मिर्च', variety: 'प्रीमियम सूखी', msp_per_quintal: 12500, market_price_per_quintal: 13200, unit: 'क्विंटल', season: 'रबी 2026', change_pct: 6.1, is_active: true },
      { id: 'f12', crop: 'गन्ना', variety: 'FRP मानक', msp_per_quintal: 315, market_price_per_quintal: 325, unit: 'क्विंटल', season: 'वार्षिक 2026', change_pct: 3.1, is_active: true },
      { id: 'f13', crop: 'सरसों', variety: 'मोटा बीज', msp_per_quintal: 5950, market_price_per_quintal: 6100, unit: 'क्विंटल', season: 'रबी 2026', change_pct: 2.8, is_active: true },
      { id: 'f14', crop: 'चना (बंगाल ग्राम)', variety: 'देशी', msp_per_quintal: 5440, market_price_per_quintal: 5520, unit: 'क्विंटल', season: 'रबी 2026', change_pct: 3.4, is_active: true },
    ];
  }
  return MSP_FALLBACK;
}
