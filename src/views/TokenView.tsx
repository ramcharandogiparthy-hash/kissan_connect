import React, { useEffect, useState } from 'react';
import {
  Ticket,
  Plus,
  QrCode,
  Wheat,
  MapPin,
  Calendar,
  Clock,
  Users,
  Sprout,
  CheckCircle2,
  Navigation,
  Share2,
  ShieldCheck,
  Zap,
  Maximize2,
  X,
  XCircle,
  Ban,
  Award,
} from 'lucide-react';
import { useApp, type TokenItem } from '@/lib/app-context';
import { Reveal } from '@/components/Reveal';
import { openGoogleMapsNavigation } from '@/lib/use-navigation';
import { CancelSlotModal } from '@/components/CancelSlotModal';
import { BookSlotModal } from '@/components/BookSlotModal';

function QRCodeSVG({ seedValue = 73 }: { seedValue?: number }) {
  const cells = [];
  const size = 21;
  const grid: boolean[][] = [];
  let seed = seedValue;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  for (let i = 0; i < size; i++) {
    grid[i] = [];
    for (let j = 0; j < size; j++) {
      grid[i][j] = rand() > 0.5;
    }
  }
  const finder = (r: number, c: number) => {
    for (let i = -1; i <= 7; i++) {
      for (let j = -1; j <= 7; j++) {
        const ri = r + i;
        const cj = c + j;
        if (ri < 0 || ri >= size || cj < 0 || cj >= size) continue;
        if (i === -1 || i === 7 || j === -1 || j === 7) grid[ri][cj] = false;
        else if (i === 0 || i === 6 || j === 0 || j === 6) grid[ri][cj] = true;
        else if (i >= 2 && i <= 4 && j >= 2 && j <= 4) grid[ri][cj] = true;
        else if (i >= 1 && i <= 5 && j >= 1 && j <= 5) grid[ri][cj] = false;
      }
    }
  };
  finder(0, 0);
  finder(0, size - 7);
  finder(size - 7, 0);

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (grid[i][j]) cells.push(<rect key={`${i}-${j}`} x={j} y={i} width="1" height="1" fill="#0f3d2e" />);
    }
  }
  return (
    <svg viewBox="0 0 21 21" className="h-full w-full" shapeRendering="crispEdges">
      <rect width="21" height="21" fill="white" />
      {cells}
    </svg>
  );
}

export function TokenView() {
  const {
    t,
    lang,
    tokensList,
    setActiveTokenId,
    activeToken,
    updateTokenStatus,
    setView,
  } = useApp();
  const [saved, setSaved] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Time remaining in 30-min window for active token
  const elapsedSec = Math.floor((Date.now() - activeToken.bookedAt) / 1000);
  const remainingSec = Math.max(0, 30 * 60 - elapsedSec);
  const isWithin30Min = remainingSec > 0;
  const minsRemaining = Math.floor(remainingSec / 60);

  useEffect(() => {
    if (saved) {
      const timer = setTimeout(() => setShowSuccess(true), 300);
      return () => clearTimeout(timer);
    }
  }, [saved]);

  const handleGateCheckIn = () => {
    updateTokenStatus(activeToken.id, 'Checked-In', 3);
    setToastMsg(
      lang === 'te'
        ? 'గేట్ నమోదు పూర్తి కాబడింది! మీ టోకెన్ ప్రాసెస్ లైవ్‌లోకి వచ్చింది.'
        : lang === 'hi'
        ? 'गेट चेक-इन सफल! टोकन अब लाइव प्रोसेसिंग कतार में है।'
        : 'Gate Check-In Confirmed! Your token is now active in the center live queue.'
    );
    setTimeout(() => setToastMsg(null), 4500);
  };

  const handleSharePass = () => {
    setToastMsg(
      lang === 'te'
        ? 'డిజిటల్ పాస్ WhatsApp మరియు SMS ద్వారా షేర్ చేయబడింది!'
        : lang === 'hi'
        ? 'डिजिटल पास WhatsApp और SMS पर भेजा गया!'
        : 'Digital pass link sent to your registered phone via SMS & WhatsApp!'
    );
    setTimeout(() => setToastMsg(null), 4000);
  };

  const timelineSteps = [
    { label: lang === 'te' ? 'స్లాట్ బుకింగ్' : lang === 'hi' ? 'स्लाॉट बुकिंग' : 'Slot Booked', done: true },
    { label: lang === 'te' ? 'కేంద్రం వైపు మార్గం' : lang === 'hi' ? 'रास्ते में' : 'En-Route', done: activeToken.currentStep >= 2 },
    { label: lang === 'te' ? 'గేట్ నమోదు' : lang === 'hi' ? 'गेट चेक-इन' : 'Gate Check-In', done: activeToken.currentStep >= 3 },
    { label: lang === 'te' ? 'తేమ & నాణ్యత పరిశీలన' : lang === 'hi' ? 'गुणवत्ता जांच' : 'Quality Verified', done: activeToken.currentStep >= 4 },
    { label: lang === 'te' ? 'తూకం & నిధుల జమ' : lang === 'hi' ? 'तोल एवं भुगतान' : 'Weighed & Paid', done: activeToken.currentStep >= 5 },
  ];

  return (
    <div className="mx-auto max-w-4xl px-5 pb-24 pt-28 lg:px-8 lg:pb-12">
      {/* Toast Banner */}
      {toastMsg && (
        <div className="fixed top-20 right-4 z-50 rounded-2xl bg-forest-900 px-5 py-3 text-sm font-bold text-white shadow-glass-lg animate-slide-in-right border border-leaf-400/40">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-leaf-400" />
            <span>{toastMsg}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <Reveal>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <span className="section-eyebrow">
              <Ticket className="h-3.5 w-3.5 text-leaf-600" /> {t('token_title')}
            </span>
            <h1 className="mt-3 display-heading text-3xl sm:text-4xl">
              {lang === 'te' ? 'మీ కొనుగోలు డిజిటల్ పాస్' : lang === 'hi' ? 'डिजिटल खरीद पास एवं कतार ट्रैकिंग' : 'Digital Procurement Gate Pass'}
            </h1>
          </div>

          {/* Token Switcher Tabs */}
          <div className="flex rounded-2xl glass p-1.5 shrink-0 border border-forest-100">
            {tokensList.map((tok: TokenItem) => (
              <button
                key={tok.id}
                onClick={() => setActiveTokenId(tok.id)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  activeToken.id === tok.id
                    ? 'bg-forest-900 text-white shadow-sm'
                    : 'text-forest-600 hover:bg-cream-100'
                }`}
              >
                <span>#{tok.token}</span>
                <span
                  className={`h-2 w-2 rounded-full ${
                    tok.status === 'Completed'
                      ? 'bg-leaf-400'
                      : tok.status === 'Checked-In'
                      ? 'bg-amber-400'
                      : tok.status === 'Cancelled'
                      ? 'bg-rose-500'
                      : 'bg-gold-400'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Live Queue Radar Strip */}
      <Reveal delay={80}>
        <div className="mt-6 rounded-4xl bg-gradient-to-r from-forest-900 via-forest-800 to-emerald-950 p-5 text-white shadow-glass-lg border border-leaf-400/20">
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/10 backdrop-blur">
                <Users className="h-5 w-5 text-leaf-300" />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase text-leaf-200">
                  {lang === 'te' ? 'మీ కంటే ముందు ఉన్నవారు' : lang === 'hi' ? 'आगे किसान' : 'Farmers Ahead'}
                </p>
                <p className="font-display text-2xl font-extrabold">{activeToken.farmersAhead} Farmers</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/10 backdrop-blur">
                <Clock className="h-5 w-5 text-gold-300" />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase text-leaf-200">
                  {lang === 'te' ? 'అంచనా వేచియుండే సమయం' : lang === 'hi' ? 'अनुमानित प्रतीक्षा' : 'Estimated Wait'}
                </p>
                <p className="font-display text-2xl font-extrabold text-gold-300">~{activeToken.estimatedWaitMin} Mins</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/10 backdrop-blur">
                <Navigation className="h-5 w-5 text-leaf-300" />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase text-leaf-200">
                  {lang === 'te' ? 'కేంద్రానికి దూరం' : lang === 'hi' ? 'केंद्र दूरी' : 'Distance'}
                </p>
                <p className="font-display text-2xl font-extrabold">{activeToken.distanceKm} KM</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 sm:col-span-1 col-span-full">
              {activeToken.status === 'Cancelled' ? (
                <span className="chip bg-rose-500/20 text-rose-300 border border-rose-400/40 text-xs px-3 py-1.5 font-bold flex items-center gap-1">
                  <Ban className="h-4 w-4 text-rose-400" />
                  Cancelled
                </span>
              ) : activeToken.status === 'Confirmed' ? (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleGateCheckIn}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-2xl bg-leaf-500 px-4 py-2.5 text-xs font-bold text-white shadow-glow hover:bg-leaf-600 transition"
                  >
                    <Zap className="h-4 w-4 fill-white" />
                    {lang === 'te' ? 'గేట్ వద్ద నమోదయ్యాని చెప్పండి' : lang === 'hi' ? 'गेट चेक-इन करें' : 'Confirm Gate Arrival'}
                  </button>
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className={`inline-flex items-center gap-1 rounded-2xl px-3 py-2.5 text-xs font-bold transition border shrink-0 ${
                      isWithin30Min
                        ? 'bg-rose-500/20 text-rose-200 border-rose-400/40 hover:bg-rose-500/30'
                        : 'bg-gray-500/20 text-gray-300 border-gray-400/30 hover:bg-gray-500/30'
                    }`}
                  >
                    <XCircle className="h-4 w-4 text-rose-400" />
                    {isWithin30Min ? `Cancel (${minsRemaining}m left)` : 'Cancel (>30m)'}
                  </button>
                </div>
              ) : (
                <span className="chip bg-leaf-400/20 text-leaf-300 border border-leaf-400/40 text-xs px-3 py-1.5 font-bold">
                  <CheckCircle2 className="h-4 w-4 text-leaf-400" />
                  {activeToken.status}
                </span>
              )}
            </div>
          </div>
        </div>
      </Reveal>

      {/* Boarding Pass Digital Ticket */}
      <Reveal delay={100}>
        <div className="mt-6 overflow-hidden rounded-5xl bg-white shadow-glass-lg border border-forest-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-forest-800 to-forest-900 px-6 py-5 text-white sm:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15">
                  <Sprout className="h-5 w-5 text-leaf-300" />
                </span>
                <span className="font-display text-lg font-extrabold">KisanConnect Digital Pass</span>
              </div>
              <div className="flex items-center gap-2">
                {activeToken.expressPass && (
                  <span className="chip bg-amber-400/20 text-gold-200 border border-gold-300/40 text-[11px] font-bold">
                    <Zap className="h-3 w-3 text-gold-400 fill-gold-400" /> AI Express Slot
                  </span>
                )}
                <span className="text-xs font-semibold tracking-widest text-leaf-200">
                  #{activeToken.token}
                </span>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="relative px-6 py-7 sm:px-8">
            {activeToken.status === 'Cancelled' && (
              <div className="mb-6 rounded-3xl bg-rose-50 border-2 border-rose-200 p-4 text-rose-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-rose-500 text-white">
                    <Ban className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-display text-base font-extrabold text-rose-900">
                      {lang === 'te' ? 'ఈ స్లాట్ రద్దు చేయబడింది' : lang === 'hi' ? 'यह स्लॉट रद्द कर दिया गया है' : 'This Slot Has Been Cancelled'}
                    </p>
                    <p className="text-xs text-rose-700">
                      {activeToken.cancelReason
                        ? `${lang === 'te' ? 'కారణం:' : 'Reason:'} ${activeToken.cancelReason}`
                        : 'Slot token released back to center queue.'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowBookModal(true)}
                  className="rounded-2xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-glow hover:bg-rose-700 transition shrink-0"
                >
                  {lang === 'te' ? 'కొత్త స్లాట్ బుక్ చేయండి' : lang === 'hi' ? 'नया स्लॉट बुक करें' : 'Book New Slot'}
                </button>
              </div>
            )}

            {/* Perforation line */}
            <div className="absolute left-0 right-0 top-1/2 hidden -translate-y-1/2 sm:block">
              <div className="flex items-center">
                <div className="h-5 w-5 rounded-full bg-cream-50" />
                <div className="flex-1 border-t-2 border-dashed border-forest-100" />
                <div className="h-5 w-5 rounded-full bg-cream-50" />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              {/* Left 2 cols: details */}
              <div className="sm:col-span-2">
                <div className="flex items-baseline justify-between">
                  <div>
                    <p className="text-xs font-semibold tracking-wider text-forest-400 uppercase">
                      {lang === 'te' ? 'టోకెన్ సంఖ్య' : lang === 'hi' ? 'टोकन संख्या' : 'Token Pass Number'}
                    </p>
                    <p className="font-display text-5xl font-extrabold text-forest-900">
                      {activeToken.token}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="chip bg-forest-50 text-forest-700 font-bold text-xs border border-forest-100">
                      Queue Position #{activeToken.queuePosition}
                    </span>
                    <button
                      onClick={() => setView('quality')}
                      className="flex items-center gap-1.5 rounded-2xl bg-leaf-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-glow hover:bg-leaf-600 transition"
                    >
                      <Award className="h-4 w-4" /> {lang === 'te' ? 'పంట నాణ్యతా స్థితి' : 'Quality Checkup'}
                    </button>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4">
                  <div>
                    <p className="flex items-center gap-1 text-xs text-forest-400">
                      <Wheat className="h-3.5 w-3.5" /> {lang === 'te' ? 'పంట' : lang === 'hi' ? 'फसल' : 'Crop'}
                    </p>
                    <p className="font-semibold text-forest-800">{activeToken.crop}</p>
                  </div>
                  <div>
                    <p className="flex items-center gap-1 text-xs text-forest-400">
                      <Users className="h-3.5 w-3.5" /> {lang === 'te' ? 'పరిమాణం' : lang === 'hi' ? 'मात्रा' : 'Quantity'}
                    </p>
                    <p className="font-semibold text-forest-800">{activeToken.quantity} {lang === 'te' ? 'క్వింటాళ్లు' : lang === 'hi' ? 'क्विंटल' : 'Quintals'}</p>
                  </div>
                  <div>
                    <p className="flex items-center gap-1 text-xs text-forest-400">
                      <MapPin className="h-3.5 w-3.5" /> {lang === 'te' ? 'కేంద్రం' : lang === 'hi' ? 'केंद्र' : 'Center'}
                    </p>
                    <p className="font-semibold text-forest-800">{activeToken.center}</p>
                  </div>
                  <div>
                    <p className="flex items-center gap-1 text-xs text-forest-400">
                      <Calendar className="h-3.5 w-3.5" /> {lang === 'te' ? 'తేదీ & సమయం' : lang === 'hi' ? 'तिथि एवं समय' : 'Date & Time'}
                    </p>
                    <p className="font-semibold text-forest-800">{activeToken.date} • {activeToken.time}</p>
                  </div>
                </div>

                {/* Farmer Info */}
                <div className="mt-5 flex items-center justify-between rounded-2xl bg-cream-100 px-4 py-3">
                  <div>
                    <p className="text-[11px] text-forest-400 uppercase tracking-wider">{lang === 'te' ? 'రైతు పేరు' : lang === 'hi' ? 'किसान का नाम' : 'Farmer Name'}</p>
                    <p className="font-display text-base font-bold text-forest-900">{activeToken.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-forest-400 uppercase tracking-wider">Aadhaar Linked</p>
                    <p className="text-xs font-bold text-forest-700">XXXX XXXX 8849</p>
                  </div>
                </div>

                {/* Quality & Moisture Certification Badge */}
                <div className="mt-3 flex items-center justify-between rounded-2xl border border-leaf-200 bg-leaf-50 px-3.5 py-2.5 text-xs font-bold text-leaf-800">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-leaf-600 shrink-0" />
                    AI Moisture Certified ({activeToken.moisturePct}%)
                  </span>
                  <span className="text-leaf-700 font-extrabold">100% Full MSP Assured</span>
                </div>
              </div>

              {/* Right Col: Interactive QR Code */}
              <div className="flex flex-col items-center justify-center gap-3 border-t sm:border-t-0 sm:border-l border-forest-100 pt-5 sm:pt-0 sm:pl-6">
                <div
                  onClick={() => setShowQrModal(true)}
                  className="group relative cursor-pointer rounded-3xl bg-white p-3 shadow-glass border border-forest-100 transition hover:scale-105"
                >
                  <div className="h-36 w-36">
                    <QRCodeSVG seedValue={activeToken.token.charCodeAt(0) * 12} />
                  </div>
                  <div className="absolute inset-0 grid place-items-center bg-forest-900/60 opacity-0 group-hover:opacity-100 transition rounded-3xl backdrop-blur-xs text-white text-xs font-bold gap-1">
                    <Maximize2 className="h-5 w-5" />
                    Tap to Zoom
                  </div>
                </div>
                <p className="flex items-center gap-1.5 text-xs font-medium text-forest-500 text-center">
                  <QrCode className="h-3.5 w-3.5 text-leaf-600" /> {lang === 'te' ? 'కేంద్రం వద్ద స్కాన్ చేయండి' : lang === 'hi' ? 'गेट स्कैनर पर दिखाएं' : 'Show at procurement gate'}
                </p>
              </div>
            </div>
          </div>

          {/* Token Lifecycle Timeline Stepper */}
          <div className="border-t border-forest-100 bg-forest-50/60 px-6 py-4 sm:px-8">
            <p className="text-xs font-bold text-forest-700 uppercase tracking-wider mb-3">
              {lang === 'te' ? 'టోకెన్ పురోగతి దశలు' : lang === 'hi' ? 'टोकन प्रगति' : 'Token Progress Lifecycle'}
            </p>
            <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1">
              {timelineSteps.map((step, idx) => (
                <React.Fragment key={idx}>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`grid h-6 w-6 place-items-center rounded-full text-[10px] font-bold ${
                        step.done
                          ? 'bg-leaf-600 text-white'
                          : idx === activeToken.currentStep - 1
                          ? 'bg-amber-500 text-white animate-pulse'
                          : 'bg-forest-200 text-forest-600'
                      }`}
                    >
                      {step.done ? <CheckCircle2 className="h-3.5 w-3.5" /> : idx + 1}
                    </span>
                    <span className={`text-xs font-semibold ${step.done ? 'text-forest-900 font-bold' : 'text-forest-500'}`}>
                      {step.label}
                    </span>
                  </div>
                  {idx < timelineSteps.length - 1 && (
                    <div className={`h-0.5 min-w-[16px] flex-1 rounded ${step.done ? 'bg-leaf-500' : 'bg-forest-200'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Footer buttons */}
          <div className="border-t border-forest-50 bg-cream-50 px-6 py-4 sm:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs text-forest-400">{lang === 'te' ? 'టోకెన్ స్థితి' : lang === 'hi' ? 'स्थिति' : 'Token Status'}</p>
                <p className="flex items-center gap-1.5 font-semibold text-leaf-600">
                  <CheckCircle2 className="h-4 w-4 text-leaf-600" /> {activeToken.status}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => openGoogleMapsNavigation(activeToken.center)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-forest-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-forest-800 shadow-sm"
                >
                  <Navigation className="h-4 w-4 text-leaf-400 fill-leaf-400" />
                  {lang === 'te' ? 'నావిగేషన్' : lang === 'hi' ? 'नेविगेशन' : 'Get Navigation'}
                </button>

                <button
                  onClick={handleSharePass}
                  className="inline-flex items-center gap-2 rounded-2xl border border-forest-200 bg-white px-4 py-2.5 text-xs font-bold text-forest-700 transition hover:bg-cream-50 shadow-sm"
                >
                  <Share2 className="h-4 w-4 text-leaf-600" /> Share Ticket
                </button>

                {(activeToken.status === 'Confirmed' || activeToken.status === 'Upcoming') && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="inline-flex items-center gap-1.5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition shadow-sm"
                  >
                    <XCircle className="h-4 w-4 text-rose-600" />
                    {isWithin30Min ? `${t('cancel_slot')} (${minsRemaining}m left)` : `${t('cancel_slot')} (>30m)`}
                  </button>
                )}

                <button
                  onClick={() => setSaved(true)}
                  className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition shadow-sm ${
                    saved
                      ? 'bg-leaf-100 text-leaf-700'
                      : 'bg-leaf-500 text-white hover:bg-leaf-600'
                  }`}
                >
                  {saved ? <CheckCircle2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {saved ? (lang === 'te' ? 'భద్రపరచబడింది' : lang === 'hi' ? 'सुरक्षित' : 'Saved to Phone') : t('add_phone')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* QR Code Zoom Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-forest-950/75 p-4 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm rounded-5xl bg-white p-6 shadow-glass-lg text-center relative">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 grid h-9 w-9 place-items-center rounded-full bg-forest-50 text-forest-600 hover:bg-forest-100"
            >
              <X className="h-5 w-5" />
            </button>
            <span className="chip bg-leaf-100 text-leaf-800 text-xs font-bold mx-auto mb-3">
              Official Gate Check-In Pass
            </span>
            <h3 className="font-display text-2xl font-extrabold text-forest-900">
              Token #{activeToken.token}
            </h3>
            <p className="text-xs text-forest-500 mt-0.5">{activeToken.crop} • {activeToken.center}</p>

            <div className="mt-5 mx-auto h-56 w-56 rounded-3xl bg-white p-4 shadow-glass border-2 border-forest-100">
              <QRCodeSVG seedValue={activeToken.token.charCodeAt(0) * 12} />
            </div>

            <p className="mt-4 text-xs font-mono text-forest-400 bg-forest-50 py-1.5 px-3 rounded-xl">
              AUTH HASH: {activeToken.token}-8849-KC2026-GATE
            </p>

            <button
              onClick={() => setShowQrModal(false)}
              className="mt-5 w-full btn-primary text-sm py-3"
            >
              Close QR Scanner
            </button>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="mt-4 flex items-center gap-3 rounded-2xl glass p-4 animate-fade-up">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-leaf-100 text-leaf-600">
            <CheckCircle2 className="h-5 w-5" />
          </span>
          <p className="text-sm font-medium text-forest-700">
            {lang === 'te'
              ? 'టోకెన్ మీ ఫోన్‌లో భద్రపరచబడింది. మీ స్లాట్‌కు 1 గంట ముందు నోటిఫికేషన్ పొందుతారు.'
              : "Token pass synced to your device. Automatic SMS reminders scheduled for your appointment."}
          </p>
        </div>
      )}

      {/* Cancel Slot Modal */}
      <CancelSlotModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        token={activeToken}
      />

      {/* Book Slot Modal */}
      <BookSlotModal
        isOpen={showBookModal}
        onClose={() => setShowBookModal(false)}
      />
    </div>
  );
}
