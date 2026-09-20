import { useEffect, useState, useMemo } from 'react';
import {
  CheckCircle2,
  QrCode,
  Printer,
  TrendingUp,
  FileText,
  Sparkles,
  ChevronRight,
  ArrowLeft,
  Bell,
  Award,
  Volume2,
  FastForward,
  RotateCcw,
  Zap,
  ListOrdered,
  X,
  ChevronLeft,
} from 'lucide-react';
import { useApp, formatRupee } from '@/lib/app-context';
import { Reveal } from '@/components/Reveal';
import {
  getDefaultJourneyData,
  subscribeToProcurementUpdates,
  markFarmerArrived,
  computeCurrentStepNumber,
  speakStageStatus,
  advanceJourneyState,
  STAGE_DICTIONARY,
  type ProcurementJourneyData,
} from '@/lib/procurement-tracking-service';

const STEP_GUIDE_DETAILS: Record<number, {
  icon: string;
  actionRequired: string;
  actionRequiredTe: string;
  actionRequiredHi: string;
  docsNeeded: string[];
}> = {
  1: {
    icon: '📅',
    actionRequired: 'Your appointment is booked. Bring your harvested produce to the center on your scheduled date & time.',
    actionRequiredTe: 'మీ అపాయింట్‌మెంట్ బుక్ చేయబడింది. కేటాయించిన తేదీ మరియు సమయానికి మీ ధాన్యాన్ని కేంద్రానికి తీసుకురండి.',
    actionRequiredHi: 'आपका स्लॉट बुक है। अपनी फसल को तय समय पर खरीद केंद्र लेकर आएं।',
    docsNeeded: ['Pattadar Passbook / Land record', 'Aadhaar Card', 'Slot Booking Slip'],
  },
  2: {
    icon: '🎟️',
    actionRequired: 'Smart Mandi entry token generated. Keep this token number ready for check-in.',
    actionRequiredTe: 'స్మార్ట్ మండి టోకెన్ జారీ చేయబడింది. చెక్-ఇన్ కోసం ఈ టోకెన్ నంబర్‌ను సిద్ధంగా ఉంచుకోండి.',
    actionRequiredHi: 'स्मार्ट मंडी टोकन तैयार है। एंट्री के लिए टोकन नंबर तैयार रखें।',
    docsNeeded: ['Smart Token ID', 'Farmer Phone Number'],
  },
  3: {
    icon: '📱',
    actionRequired: 'Show this digital QR Pass at the Mandi gate scanner for entry validation.',
    actionRequiredTe: 'మండి ప్రవేశ ద్వారం వద్ద అనుకూల స్కానర్ కోసం ఈ QR కోడ్‌ను చూపించండి.',
    actionRequiredHi: 'मंडी गेट पर ऑटोमैटिक स्कैनर को यह QR कोड दिखाएं।',
    docsNeeded: ['Digital QR Code on App screen'],
  },
  4: {
    icon: '🚚',
    actionRequired: 'Upon reaching the Mandi gate, tap "I Have Arrived" to log your check-in time.',
    actionRequiredTe: 'మండి గేటు వద్దకు చేరుకున్న వెంటనే "నేను చేరుకున్నాను" బటన్‌ను నొక్కండి.',
    actionRequiredHi: 'मंडी गेट पहुंचते ही "मैं पहुंच गया हूं" बटन दबाएं।',
    docsNeeded: ['Vehicle Registration Number', 'Gate Pass QR'],
  },
  5: {
    icon: '⏳',
    actionRequired: 'Your vehicle is in the live queue. Stay nearby and monitor your queue position on the app.',
    actionRequiredTe: 'మీ వాహనం లైవ్ క్యూలో ఉంది. క్యూ స్థానాన్ని యాప్‌లో గమనిస్తూ ఉండండి.',
    actionRequiredHi: 'आपकी गाड़ी लाइव कतार में है। ऐप पर अपना कतार नंबर देखें।',
    docsNeeded: ['Live Token Ticket on App'],
  },
  6: {
    icon: '🔔',
    actionRequired: 'Token called! Proceed immediately to the designated counter (Counter 2).',
    actionRequiredTe: 'టోకెన్ పిలవబడింది! వెంటనే నియమించబడిన కౌంటర్ 2 వద్దకు వెళ్ళండి.',
    actionRequiredHi: 'टोकन बुलाया गया! तुरंत काउंटर 2 पर पहुंचें।',
    docsNeeded: ['Token Slip', 'Original Aadhaar'],
  },
  7: {
    icon: '🪪',
    actionRequired: 'Procurement Officer verifies your identity, land records, and crop quota allotment.',
    actionRequiredTe: 'కొనుగోలు అధికారి మీ గుర్తింపు, భూమి వివరాలు మరియు ధాన్యం కోటాను ధృవీకరిస్తారు.',
    actionRequiredHi: 'अधिकारी आपकी पहचान और जमीन का रिकॉर्ड सत्यापित करेंगे।',
    docsNeeded: ['Aadhaar Card', 'Bank Passbook Front Page'],
  },
  8: {
    icon: '🔬',
    actionRequired: 'Quality Assay Laboratory tests moisture content, foreign matter %, and grain grade.',
    actionRequiredTe: 'నాణ్యతా ల్యాబ్ ధాన్యం తేమ %, చెత్త %, మరియు గ్రేడ్‌ను పరిశీలిస్తుంది.',
    actionRequiredHi: 'गुणवत्ता लैब अनाज नमी और ग्रेड का परीक्षण करेगी।',
    docsNeeded: ['Grain Sample Bag (taken at counter)'],
  },
  9: {
    icon: '⚖️',
    actionRequired: 'Drive vehicle onto digital weighbridge. Gross weight and Tare weight recorded.',
    actionRequiredTe: 'డిజిటల్ తూకం స్కేలుపైకి వాహనాన్ని నడపండి. మొత్తం మరియు ఖాళీ బరువు నమోదు చేయబడుతుంది.',
    actionRequiredHi: 'गाड़ी को डिजिटल वजन कांटे पर चढ़ाएं। शुद्ध वजन दर्ज होगा।',
    docsNeeded: ['Weighbridge Gate Pass'],
  },
  10: {
    icon: '💵',
    actionRequired: 'Base MSP rate ₹2,300/Qtl + Quality bonus applied. Review your itemized invoice.',
    actionRequiredTe: 'మద్దతు ధర ₹2,300/క్వింటాల్ + బోనస్ గణన చేయబడుతుంది. మీ బిల్లును పరిశీలించండి.',
    actionRequiredHi: 'सरकारी समर्थन मूल्य ₹2,300/क्विंटल पर बिल तैयार होगा।',
    docsNeeded: ['Assay Quality Certificate', 'Weight Receipt'],
  },
  11: {
    icon: '✍️',
    actionRequired: 'Mandi Superintendent signs off on your procurement batch. Goods Received Note issued.',
    actionRequiredTe: 'కొనుగోలు అధికారి మీ లాట్‌కు డిజిటల్ ఆమోదం తెలుపుతారు.',
    actionRequiredHi: 'मंडी अधिकारी लॉट को मंजूरी देंगे और GRN जारी करेंगे।',
    docsNeeded: ['Goods Received Note (GRN)'],
  },
  12: {
    icon: '🏦',
    actionRequired: 'Direct Benefit Transfer (DBT) initiated to your Aadhaar-linked bank account.',
    actionRequiredTe: 'మీ ఖాతాకు నేరుగా బ్యాంక్ బదిలీ (DBT) ప్రారంభించబడుతుంది.',
    actionRequiredHi: 'आपके आधार-लिंक्ड बैंक खाते में सीधा पैसा भेजा जाएगा।',
    docsNeeded: ['Aadhaar-seeded Active Bank Account'],
  },
  13: {
    icon: '🧾',
    actionRequired: 'Procurement complete! Download and print your official Mandi tax certificate.',
    actionRequiredTe: 'కొనుగోలు పూర్తయింది! మీ అధికారిక డిజిటల్ రసీదును డౌన్‌లోడ్ చేసుకోండి.',
    actionRequiredHi: 'खरीद पूरी हुई! अपनी आधिकारिक डिजिटल रसीद डाउनलोड करें।',
    docsNeeded: ['Final Mandi Procurement Certificate'],
  },
};

export function ProcurementTrackingView() {
  const {
    trackingProcurementId,
    setTrackingProcurementId,
    setView,
    lang,
    tokensList,
    smartTokensList,
    procurementsList,
  } = useApp();

  const [journey, setJourney] = useState<ProcurementJourneyData>(() =>
    getDefaultJourneyData(trackingProcurementId || 'PROC-2026-8942')
  );
  const [showQRModal, setShowQRModal] = useState(false);
  const [showQualityModal, setShowQualityModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [arrivedLoading, setArrivedLoading] = useState(false);
  const [arrivedSuccessMsg, setArrivedSuccessMsg] = useState<string | null>(null);
  const [realtimeConnected, setRealtimeConnected] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showStepByStepModal, setShowStepByStepModal] = useState(false);
  const [selectedGuideStep, setSelectedGuideStep] = useState(1);

  // Check URL hash for direct step-by-step requested navigation
  useEffect(() => {
    if (window.location.hash === '#step-by-step' || window.location.hash === '#steps') {
      setShowStepByStepModal(true);
    }
  }, []);

  // Aggregate all tokens/procurements available for this farmer
  const allFarmerTokens = useMemo(() => {
    const list: Array<{ id: string; tokenNumber: string; crop: string; status: string; center: string; date: string }> = [];

    if (tokensList && tokensList.length > 0) {
      tokensList.forEach((t) => {
        list.push({
          id: t.id || t.token,
          tokenNumber: t.token,
          crop: t.crop,
          status: t.status,
          center: t.center,
          date: t.date,
        });
      });
    }

    if (smartTokensList && smartTokensList.length > 0) {
      smartTokensList.forEach((st) => {
        if (!list.some((existing) => existing.tokenNumber === st.tokenNumber)) {
          list.push({
            id: st.id,
            tokenNumber: st.tokenNumber,
            crop: st.serviceType || st.produceType || 'Paddy',
            status: st.status,
            center: st.centerName,
            date: st.operatingDate,
          });
        }
      });
    }

    if (procurementsList && procurementsList.length > 0) {
      procurementsList.forEach((pr) => {
        if (!list.some((existing) => existing.id === pr.id || existing.tokenNumber === pr.tokenId)) {
          list.push({
            id: pr.id,
            tokenNumber: pr.tokenId || pr.id,
            crop: pr.crop,
            status: pr.status,
            center: pr.centerName,
            date: new Date(pr.verifiedAt || Date.now()).toLocaleDateString(),
          });
        }
      });
    }

    const defaultTokens = [
      { id: 'PROC-2026-8942', tokenNumber: 'A127', crop: 'Paddy (Grade A)', status: 'Verified', center: 'Vijayawada Hub', date: '28 Aug 2026' },
      { id: 'PROC-2026-7411', tokenNumber: 'B402', crop: 'Cotton (Medium Staple)', status: 'Approved', center: 'Guntur Center', date: '27 Aug 2026' },
      { id: 'PROC-2026-5120', tokenNumber: 'C109', crop: 'Maize (Yellow)', status: 'Payment Completed', center: 'Tenali Center', date: '14 Aug 2026' },
      { id: 'KSN-042', tokenNumber: 'KSN-042', crop: 'Paddy', status: 'Quality Check', center: 'Vijayawada Hub', date: '5 Sep 2026' },
    ];

    defaultTokens.forEach((dt) => {
      if (!list.some((item) => item.id === dt.id || item.tokenNumber === dt.tokenNumber)) {
        list.push(dt);
      }
    });

    return list;
  }, [tokensList, smartTokensList, procurementsList]);

  // Sync journey data when trackingProcurementId changes
  useEffect(() => {
    const initial = getDefaultJourneyData(trackingProcurementId || 'PROC-2026-8942');
    setJourney(initial);

    const unsubscribe = subscribeToProcurementUpdates(
      initial.procurementId,
      initial.tokenNumber,
      (updatedData) => {
        setJourney((prev) => ({
          ...prev,
          ...updatedData,
          currentStepNumber: computeCurrentStepNumber({ ...prev, ...updatedData }),
        }));
        setRealtimeConnected(true);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [trackingProcurementId]);

  const currentStep = useMemo(() => computeCurrentStepNumber(journey), [journey]);
  const progressPct = useMemo(() => Math.round((currentStep / 13) * 100), [currentStep]);

  const handleSpeakAudio = () => {
    setIsSpeaking(true);
    speakStageStatus(journey, lang === 'te' ? 'te' : lang === 'hi' ? 'hi' : 'en');
    setTimeout(() => setIsSpeaking(false), 5000);
  };

  const handleFastForwardStage = () => {
    setJourney((prev) => advanceJourneyState(prev));
  };

  const handleResetStage = () => {
    setJourney((prev) => ({
      ...prev,
      currentStepNumber: 1,
      arrivedAt: undefined,
      calledAt: undefined,
      verifiedAt: undefined,
      qualityCompletedAt: undefined,
      weighingCompletedAt: undefined,
      approvedAt: undefined,
      paymentCompletedAt: undefined,
      paymentStatus: 'pending',
    }));
  };

  const handleArrivalClick = async () => {
    setArrivedLoading(true);
    setArrivedSuccessMsg(null);
    const result = await markFarmerArrived(journey.tokenNumber);
    setArrivedLoading(false);
    setArrivedSuccessMsg(result.message);

    setJourney((prev) => {
      const updated = {
        ...prev,
        arrivedAt: Date.now(),
        overallStatus: 'IN_QUEUE' as const,
        queuePosition: Math.max(1, prev.queuePosition),
      };
      return {
        ...updated,
        currentStepNumber: computeCurrentStepNumber(updated),
      };
    });
  };

  const handlePrintSlip = () => {
    window.print();
  };

  const tr = (enText: string, teText: string, hiText: string) => {
    if (lang === 'te') return teText;
    if (lang === 'hi') return hiText;
    return enText;
  };

  return (
    <div className="mx-auto max-w-5xl px-4 pt-24 pb-32 sm:px-6 lg:px-8">
      {/* SIH JUDGE PRESENTATION MODE BANNER */}
      <div className="mb-6 rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-4 sm:p-5 text-white shadow-xl border border-amber-300/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 h-40 w-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/20 backdrop-blur-md text-amber-100 border border-white/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-black/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-200">
                ⭐ SIH Flagship Feature • KisanConnect Engine
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white leading-snug">
                {tr('Complete A-to-Z Real-Time Procurement Journey', 'సంపూర్ణ నిజ-సమయ పంట కొనుగోలు ప్రయాణం', 'संपूर्ण रियल-टाइम खरीद प्रक्रिया')}
              </h2>
            </div>
          </div>
          <div className="text-xs text-amber-100 max-w-md bg-black/15 p-2.5 rounded-2xl border border-white/10">
            {tr(
              '«After booking a slot, the farmer tracks every stage from mandi gate entry to direct bank payout in real-time.»',
              '«స్లాట్ బుక్ చేసిన తర్వాత, ప్రవేశ ద్వారం నుండి నేరుగా బ్యాంక్ చెల్లింపు వరకు ప్రతి దశను రైతు నిజ-సమయంలో పరిశీలించవచ్చు.»',
              '«स्लॉट बुक करने के बाद, किसान मंडी गेट से सीधे बैंक भुगतान तक हर चरण का लाइव ट्रैक कर सकता है।»'
            )}
          </div>
        </div>
      </div>

      {/* SIH DEMO FAST-FORWARD TOOLBAR */}
      <div className="mb-6 rounded-3xl bg-purple-950 p-4 text-white shadow-xl border border-purple-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-purple-800 text-purple-200">
            <Zap className="h-5 w-5 text-amber-300" />
          </span>
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-purple-300">
              {tr('SIH Judge Live Simulation Toolbar', 'SIH ప్రత్యక్ష డెమో నియంత్రణ సాధనం', 'SIH लाइव सिमुलेशन टूलबार')}
            </p>
            <p className="text-xs text-purple-200">
              {tr('Test live stage transitions & audio announcements', 'నిజ-సమయ దశల మార్పులు & ఆడియో సమాచారాన్ని పరీక్షించండి', 'लाइव चरण परिवर्तन और ऑडियो घोषणाओं का परीक्षण करें')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          <button
            onClick={handleFastForwardStage}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-2xl bg-amber-400 px-3.5 py-2 text-xs font-extrabold text-purple-950 hover:bg-amber-300 shadow-glow transition"
          >
            <FastForward className="h-4 w-4" /> {tr('⚡ Advance Stage', '⚡ తదుపరి దశకు వెళ్ళండి', '⚡ आगे का चरण')}
          </button>
          <button
            onClick={handleResetStage}
            className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-white/10 px-3 py-2 text-xs font-bold text-white hover:bg-white/20 border border-white/15"
          >
            <RotateCcw className="h-3.5 w-3.5" /> {tr('Reset', 'పునఃసమర్పణ (రీసెట్)', 'रीसेट करें')}
          </button>
        </div>
      </div>

      {/* HEADER BAR & BACK NAVIGATION */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => setView('dashboard')}
          className="inline-flex items-center gap-2 rounded-2xl glass px-4 py-2 text-xs font-bold text-forest-700 hover:bg-white/80 transition-all shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          {lang === 'te' ? 'డాష్‌బోర్డ్‌కు తిరిగెళ్ళండి' : lang === 'hi' ? 'डैशबोर्ड पर वापस जाएं' : 'Back to Dashboard'}
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSpeakAudio}
            className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-extrabold text-white shadow-glow transition-all ${
              isSpeaking
                ? 'bg-rose-600 animate-pulse'
                : 'bg-gradient-to-r from-emerald-600 to-leaf-600 hover:from-emerald-500 hover:to-leaf-500'
            }`}
          >
            <Volume2 className="h-4 w-4" />
            <span>
              {lang === 'te' ? '🔊 కిసాన్ ఆడియో వినండి' : lang === 'hi' ? '🔊 किसान ऑडियो सुनें' : '🔊 Listen Status (Audio)'}
            </span>
          </button>

          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            {realtimeConnected ? 'Live Realtime Active' : 'Reconnecting...'}
          </div>
        </div>
      </div>

      {/* MULTI-TOKEN SELECTOR BAR */}
      <div className="mb-6 rounded-3xl glass p-4 shadow-sm border border-forest-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎟️</span>
            <h3 className="font-display text-sm font-extrabold text-forest-950">
              {tr('Select Token Journey', 'మీ టోకెన్ ప్రయాణాన్ని ఎంచుకోండి', 'अपनी टोकन यात्रा चुनें')} ({allFarmerTokens.length} {tr('Available', 'అందుబాటులో ఉన్నాయి', 'उपलब्ध')})
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-forest-500">
            {tr(
              'Click any token below to view its A-to-Z procurement journey',
              'దాని సంపూర్ణ కొనుగోలు ప్రయాణాన్ని చూడటానికి కింద ఉన్న టోకెన్‌ను నొక్కండి',
              'अपनी ए-टू-जेड खरीद यात्रा देखने के लिए नीचे किसी भी टोकन पर क्लिक करें'
            )}
          </span>
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 scrollbar-none">
          {allFarmerTokens.map((item) => {
            const active = journey.tokenNumber === item.tokenNumber || journey.procurementId === item.id;
            return (
              <button
                key={item.id + item.tokenNumber}
                onClick={() => {
                  if (typeof setTrackingProcurementId === 'function') {
                    setTrackingProcurementId(item.id || item.tokenNumber);
                  } else {
                    setJourney(getDefaultJourneyData(item.id || item.tokenNumber));
                  }
                }}
                className={`flex items-center gap-2 rounded-2xl px-3.5 py-2 text-xs font-bold transition-all shrink-0 border ${
                  active
                    ? 'bg-forest-900 text-white shadow-glow border-forest-800 scale-[1.02]'
                    : 'glass text-forest-800 hover:bg-white border-forest-100'
                }`}
              >
                <span className="font-mono text-xs font-black">#{item.tokenNumber}</span>
                <span className="opacity-80">({item.crop})</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                  active ? 'bg-leaf-400 text-forest-950' : 'bg-forest-100 text-forest-800'
                }`}>
                  {item.status}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MOBILE STICKY STATUS HEADER */}
      <div className="sticky top-20 z-30 mb-6 rounded-3xl bg-forest-900/95 p-4 text-white shadow-2xl backdrop-blur-xl border border-leaf-500/30 sm:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="h-3 w-3 animate-ping rounded-full bg-leaf-400" />
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-leaf-300">
                🟢 {tr('CURRENT STATUS', 'ప్రస్తుత స్థితి', 'वर्तमान स्थिति')} ({progressPct}%)
              </p>
              <p className="text-sm font-bold text-white">
                {tr('Step', 'దశ', 'चरण')} {currentStep} {tr('of 13', '13 లో', '13 में से')}: {lang === 'te' ? STAGE_DICTIONARY[currentStep]?.titleTe : lang === 'hi' ? STAGE_DICTIONARY[currentStep]?.titleHi : STAGE_DICTIONARY[currentStep]?.titleEn}
              </p>
            </div>
          </div>
          <span className="rounded-full bg-leaf-500/20 px-3 py-1 text-xs font-extrabold text-leaf-300 border border-leaf-400/30">
            {tr('Token', 'టోకెన్', 'टोकन')} #{journey.tokenNumber}
          </span>
        </div>
      </div>

      {/* SECTION 2: TOP BOOKING CONFIRMATION CARD & PROGRESS RING */}
      <Reveal>
        <div className="mb-8 rounded-5xl glass p-6 sm:p-8 shadow-glass-lg border border-leaf-200/80 relative overflow-hidden bg-gradient-to-br from-white/90 via-cream-50/80 to-leaf-50/60">
          <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-leaf-400/10 blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-forest-100">
            <div className="flex items-start gap-4">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-3xl bg-gradient-to-br from-leaf-500 to-forest-600 text-white shadow-glow">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-300">
                    {tr('✅ Slot Booked & Verified', '✅ స్లాట్ బుక్ చేయబడింది & ధృవీకరించబడింది', '✅ स्लॉट बुक और सत्यापित')}
                  </span>
                  <span className="text-xs font-semibold text-forest-500">
                    ID: {journey.procurementId}
                  </span>
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-forest-950 mt-1">
                  {tr('Procurement Journey Pass', 'కొనుగోలు ప్రయాణ పాస్ కార్డ్', 'खरीद यात्रा पास')}
                </h1>
                <p className="text-xs sm:text-sm text-forest-600">
                  {tr('Farmer:', 'రైతు పేరు:', 'किसान:')} <strong className="text-forest-900">{journey.farmerName}</strong> ({journey.farmerPhone})
                </p>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full lg:w-72 rounded-3xl glass p-4 border border-forest-100/70">
              <div className="flex items-center justify-between text-xs font-extrabold text-forest-900 mb-1.5">
                <span>{tr('Overall Progress', 'మొత్తం ప్రగతి', 'कुल प्रगति')}</span>
                <span className="text-leaf-700">{progressPct}%</span>
              </div>
              <div className="h-3 w-full rounded-full bg-forest-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-leaf-400 to-emerald-600 transition-all duration-700"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="text-[10px] font-semibold text-forest-500 text-center mt-1.5">
                {tr('Stage', 'దశ', 'चरण')} {currentStep} {tr('of 13', '13 లో', '13 में से')} • {lang === 'te' ? STAGE_DICTIONARY[currentStep]?.titleTe : lang === 'hi' ? STAGE_DICTIONARY[currentStep]?.titleHi : STAGE_DICTIONARY[currentStep]?.titleEn}
              </p>
            </div>

            <div className="flex items-center gap-2.5 w-full lg:w-auto flex-wrap">
              <button
                onClick={() => {
                  setSelectedGuideStep(currentStep);
                  setShowStepByStepModal(true);
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-xs sm:text-sm px-4 py-2.5 shadow-md transition hover:scale-[1.02] flex-1 lg:flex-initial"
              >
                <ListOrdered className="h-4 w-4 text-purple-950" />
                {tr('📋 View Step by Step', '📋 దశల వారీ వివరాలు', '📋 चरण-दर-चरण विवरण')}
              </button>
              <button
                onClick={() => setShowQRModal(true)}
                className="btn-secondary flex-1 lg:flex-initial text-xs sm:text-sm"
              >
                <QrCode className="h-4 w-4" />
                {tr('View QR Code', 'QR కోడ్ చూడండి', 'QR कोड देखें')}
              </button>
              <button
                onClick={handlePrintSlip}
                className="btn-primary flex-1 lg:flex-initial text-xs sm:text-sm"
              >
                <Printer className="h-4 w-4" />
                {tr('Print Slip', 'రసీదు ప్రింట్ చేయండి', 'रसीद प्रिंट करें')}
              </button>
            </div>
          </div>

          {/* Details Grid */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl glass p-3.5 border border-forest-100/60">
              <p className="text-[11px] font-semibold text-forest-500 uppercase tracking-wider">
                {tr('Token Number', 'టోకెన్ సంఖ్య', 'टोकन नंबर')}
              </p>
              <p className="text-lg font-black text-leaf-700 mt-0.5">{journey.tokenNumber}</p>
            </div>
            <div className="rounded-2xl glass p-3.5 border border-forest-100/60">
              <p className="text-[11px] font-semibold text-forest-500 uppercase tracking-wider">
                {tr('Procurement Center', 'కొనుగోలు కేంద్రం', 'खरीद केंद्र')}
              </p>
              <p className="text-xs sm:text-sm font-bold text-forest-900 mt-0.5 truncate">{journey.centerName}</p>
            </div>
            <div className="rounded-2xl glass p-3.5 border border-forest-100/60">
              <p className="text-[11px] font-semibold text-forest-500 uppercase tracking-wider">
                {tr('Crop & Variety', 'పంట & రకం', 'फसल और किस्म')}
              </p>
              <p className="text-xs sm:text-sm font-bold text-forest-900 mt-0.5">{journey.crop}</p>
            </div>
            <div className="rounded-2xl glass p-3.5 border border-forest-100/60">
              <p className="text-[11px] font-semibold text-forest-500 uppercase tracking-wider">
                {tr('Appointment', 'అపాయింట్‌మెంట్ సమయం', 'नियुक्त समय')}
              </p>
              <p className="text-xs sm:text-sm font-bold text-forest-900 mt-0.5">{journey.appointmentDate} • {journey.appointmentTime}</p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* TOKEN CALLED NOTIFICATION BANNER */}
      {journey.calledAt && currentStep === 6 && (
        <div className="mb-8 rounded-3xl bg-gradient-to-r from-amber-500 to-orange-600 p-5 text-white shadow-xl animate-bounce-slow border-2 border-white/40">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/20 text-white backdrop-blur-md">
              <Bell className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-white">
                {tr('🔔 Your Token Has Been Called!', '🔔 మీ టోకెన్ పిలవబడింది!', '🔔 आपका टोकन बुलाया गया है!')}
              </h3>
              <p className="text-xs sm:text-sm text-amber-100 font-medium">
                {tr('Token', 'టోకెన్ సంఖ్య', 'टोकन')} <strong className="text-white font-extrabold">{journey.tokenNumber}</strong> — {tr('Please proceed immediately to', 'వెంటనే ఈ కౌంటర్‌కు వెళ్ళండి:', 'कृपया तुरंत यहां पहुंचें:')}{' '}
                <span className="underline decoration-white font-bold">{journey.currentCounterName || 'Counter 2'}</span>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: MAIN FEATURE — 13-STAGE VERTICAL TIMELINE */}
      <Reveal>
        <div className="rounded-5xl glass p-6 sm:p-10 shadow-glass-lg border border-forest-100">
          <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-forest-100 pb-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-forest-950">
                {tr('A-to-Z Procurement Timeline', 'సంపూర్ణ కొనుగోలు కాలక్రమం', 'ए-टू-ज़ेड खरीद समय-सीमा')}
              </h2>
              <p className="text-xs sm:text-sm text-forest-600 mt-1">
                {tr(
                  'Real-time tracking of your produce from slot booking to direct bank payout',
                  'స్లాట్ బుకింగ్ నుండి నేరుగా బ్యాంక్ చెల్లింపు వరకు మీ ధాన్యం తక్షణ సమాచారం',
                  'स्लॉट बुकिंग से लेकर सीधे बैंक ट्रांसफर तक आपकी फसल की लाइव ट्रैकिंग'
                )}
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => {
                  setSelectedGuideStep(currentStep);
                  setShowStepByStepModal(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-purple-950 px-3.5 py-2 text-xs font-black transition border border-amber-300 shadow-sm"
              >
                <ListOrdered className="h-4 w-4 text-purple-950" />
                <span>{tr('📋 Step-by-Step Overview', '📋 దశల వారీ వివరాలు', '📋 चरण-दर-चरण विवरण')}</span>
              </button>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-forest-600 bg-white/60 px-3 py-1.5 rounded-2xl border border-forest-100">
                <span className="h-3 w-3 rounded-full bg-emerald-500" /> {tr('Done', 'పూర్తయింది', 'पूर्ण')}
                <span className="h-3 w-3 rounded-full bg-amber-500 ml-2" /> {tr('Current', 'ప్రస్తుతం', 'वर्तमान')}
                <span className="h-3 w-3 rounded-full bg-gray-300 ml-2" /> {tr('Pending', 'పెండింగ్', 'लंबित')}
              </div>
            </div>
          </div>

          <div className="relative space-y-8 before:absolute before:left-6 before:top-4 before:bottom-4 before:w-1 before:bg-gradient-to-b before:from-emerald-500 before:via-amber-400 before:to-gray-200">

            {/* STEP 1 — SLOT BOOKED */}
            <div className="relative flex items-start gap-4 sm:gap-6 pl-2">
              <div className="z-10 grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-emerald-500 text-white font-bold shadow-glow text-sm">
                ✓
              </div>
              <div className="flex-1 rounded-3xl glass p-5 border border-emerald-200 bg-emerald-50/30">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Step 1 • Slot Booked</span>
                  <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-[11px] font-bold text-emerald-800">Completed ✅</span>
                </div>
                <h3 className="font-display text-lg font-bold text-forest-900 mt-1">Booking Confirmed</h3>
                <p className="text-xs text-forest-600 mt-1">
                  Procurement slot successfully booked for {journey.crop} ({journey.expectedQuantityQuintals} Quintals) on {journey.bookingDate}.
                </p>
                <div className="mt-3 flex items-center gap-3 text-xs text-forest-700 font-medium">
                  <span>🆔 Procurement ID: <strong>{journey.procurementId}</strong></span>
                  <span>📅 Date: {journey.appointmentDate}</span>
                </div>
              </div>
            </div>

            {/* STEP 2 — TOKEN GENERATED */}
            <div className="relative flex items-start gap-4 sm:gap-6 pl-2">
              <div className="z-10 grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-emerald-500 text-white font-bold shadow-glow text-sm">
                ✓
              </div>
              <div className="flex-1 rounded-3xl glass p-5 border border-emerald-200 bg-emerald-50/30">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Step 2 • Token Generated</span>
                  <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-[11px] font-bold text-emerald-800">Completed ✅</span>
                </div>
                <h3 className="font-display text-lg font-bold text-forest-900 mt-1">Smart Token #{journey.tokenNumber}</h3>
                <p className="text-xs text-forest-600 mt-1">
                  Assigned initial queue position #{journey.queuePosition} for {journey.centerName}.
                </p>
              </div>
            </div>

            {/* STEP 3 — QR GENERATED */}
            <div className="relative flex items-start gap-4 sm:gap-6 pl-2">
              <div className="z-10 grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-emerald-500 text-white font-bold shadow-glow text-sm">
                ✓
              </div>
              <div className="flex-1 rounded-3xl glass p-5 border border-emerald-200 bg-emerald-50/30">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Step 3 • Digital QR Code</span>
                  <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-[11px] font-bold text-emerald-800">Completed ✅</span>
                </div>
                <div className="mt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-display text-base font-bold text-forest-900">Dynamic Non-PII Secure QR Pass</h3>
                    <p className="text-xs text-forest-600">
                      Contains encrypted token reference ID for Mandi scanner verification. No personal PII stored inside QR payload.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowQRModal(true)}
                    className="btn-secondary text-xs shrink-0"
                  >
                    <QrCode className="h-4 w-4" /> Show QR Pass
                  </button>
                </div>
              </div>
            </div>

            {/* STEP 4 — ARRIVAL AT PROCUREMENT CENTER */}
            <div className="relative flex items-start gap-4 sm:gap-6 pl-2">
              <div className={`z-10 grid h-10 w-10 shrink-0 place-items-center rounded-2xl font-bold text-sm shadow-glow ${
                currentStep > 4 ? 'bg-emerald-500 text-white' : currentStep === 4 ? 'bg-amber-500 text-white ring-4 ring-amber-200' : 'bg-gray-200 text-gray-500'
              }`}>
                {currentStep > 4 ? '✓' : '4'}
              </div>
              <div className={`flex-1 rounded-3xl glass p-5 border ${
                currentStep > 4 ? 'border-emerald-200 bg-emerald-50/20' : currentStep === 4 ? 'border-amber-300 bg-amber-50/40 ring-1 ring-amber-300' : 'border-gray-200'
              }`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-forest-700">Step 4 • Mandi Arrival</span>
                  {journey.arrivedAt ? (
                    <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-[11px] font-bold text-emerald-800">Arrived ✅</span>
                  ) : (
                    <span className="rounded-full bg-amber-100 px-3 py-0.5 text-[11px] font-bold text-amber-800">Waiting for Arrival ⏳</span>
                  )}
                </div>
                <h3 className="font-display text-base font-bold text-forest-900 mt-1">Arrival at Procurement Center</h3>
                <p className="text-xs text-forest-600 mt-1">
                  Please arrive at {journey.centerName} during your assigned time slot ({journey.appointmentTime}).
                </p>

                {arrivedSuccessMsg && (
                  <div className="mt-3 rounded-2xl bg-emerald-100 p-3 text-xs font-bold text-emerald-900 border border-emerald-300">
                    ✨ {arrivedSuccessMsg}
                  </div>
                )}

                {!journey.arrivedAt && (
                  <button
                    onClick={handleArrivalClick}
                    disabled={arrivedLoading}
                    className="mt-3 btn-primary text-xs"
                  >
                    {arrivedLoading ? 'Updating Supabase...' : '📍 I Have Arrived at Center'}
                  </button>
                )}
              </div>
            </div>

            {/* STEP 5 — QUEUE */}
            <div className="relative flex items-start gap-4 sm:gap-6 pl-2">
              <div className={`z-10 grid h-10 w-10 shrink-0 place-items-center rounded-2xl font-bold text-sm shadow-glow ${
                currentStep > 5 ? 'bg-emerald-500 text-white' : currentStep === 5 ? 'bg-amber-500 text-white ring-4 ring-amber-200' : 'bg-gray-200 text-gray-500'
              }`}>
                {currentStep > 5 ? '✓' : '5'}
              </div>
              <div className={`flex-1 rounded-3xl glass p-5 border ${
                currentStep > 5 ? 'border-emerald-200 bg-emerald-50/20' : currentStep === 5 ? 'border-amber-300 bg-amber-50/40 ring-1 ring-amber-300' : 'border-gray-200'
              }`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-forest-700">Step 5 • Live Queue</span>
                  <span className="rounded-full bg-blue-100 px-3 py-0.5 text-[11px] font-bold text-blue-800 border border-blue-200">
                    ⚡ Live Realtime Queue
                  </span>
                </div>
                <h3 className="font-display text-base font-bold text-forest-900 mt-1">Smart Queue Position</h3>

                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-2xl glass p-3 text-center border border-forest-100">
                    <p className="text-[10px] font-bold uppercase text-forest-500">Your Position</p>
                    <p className="text-2xl font-black text-leaf-700">#{journey.queuePosition}</p>
                  </div>
                  <div className="rounded-2xl glass p-3 text-center border border-forest-100">
                    <p className="text-[10px] font-bold uppercase text-forest-500">Farmers Ahead</p>
                    <p className="text-2xl font-black text-amber-600">{Math.max(0, journey.queuePosition - 1)}</p>
                  </div>
                  <div className="rounded-2xl glass p-3 text-center border border-forest-100">
                    <p className="text-[10px] font-bold uppercase text-forest-500">Current Token</p>
                    <p className="text-xl font-bold text-forest-900">{journey.currentServingTokenNumber || 'KSN-039'}</p>
                  </div>
                  <div className="rounded-2xl glass p-3 text-center border border-forest-100">
                    <p className="text-[10px] font-bold uppercase text-forest-500">Est. Wait</p>
                    <p className="text-2xl font-black text-purple-700">{journey.estimatedWaitMinutes} min</p>
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 6 — TOKEN CALLED */}
            <div className="relative flex items-start gap-4 sm:gap-6 pl-2">
              <div className={`z-10 grid h-10 w-10 shrink-0 place-items-center rounded-2xl font-bold text-sm shadow-glow ${
                currentStep > 6 ? 'bg-emerald-500 text-white' : currentStep === 6 ? 'bg-amber-500 text-white ring-4 ring-amber-200' : 'bg-gray-200 text-gray-500'
              }`}>
                {currentStep > 6 ? '✓' : '6'}
              </div>
              <div className={`flex-1 rounded-3xl glass p-5 border ${
                currentStep > 6 ? 'border-emerald-200 bg-emerald-50/20' : currentStep === 6 ? 'border-amber-300 bg-amber-50/40' : 'border-gray-200'
              }`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-forest-700">Step 6 • Token Called</span>
                  {currentStep >= 6 ? (
                    <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-[11px] font-bold text-emerald-800">Token Called ✅</span>
                  ) : (
                    <span className="rounded-full bg-gray-100 px-3 py-0.5 text-[11px] font-semibold text-gray-600">Pending</span>
                  )}
                </div>
                <h3 className="font-display text-base font-bold text-forest-900 mt-1">Counter Announcement</h3>
                <p className="text-xs text-forest-600 mt-0.5">
                  Assigned Officer: <strong>{journey.currentCounterName || 'Counter 2 (Paddy Procurements)'}</strong>
                </p>
              </div>
            </div>

            {/* STEP 7 — FARMER VERIFICATION */}
            <div className="relative flex items-start gap-4 sm:gap-6 pl-2">
              <div className={`z-10 grid h-10 w-10 shrink-0 place-items-center rounded-2xl font-bold text-sm shadow-glow ${
                currentStep > 7 ? 'bg-emerald-500 text-white' : currentStep === 7 ? 'bg-amber-500 text-white ring-4 ring-amber-200' : 'bg-gray-200 text-gray-500'
              }`}>
                {currentStep > 7 ? '✓' : '7'}
              </div>
              <div className={`flex-1 rounded-3xl glass p-5 border ${
                currentStep > 7 ? 'border-emerald-200 bg-emerald-50/20' : currentStep === 7 ? 'border-amber-300 bg-amber-50/40' : 'border-gray-200'
              }`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-forest-700">Step 7 • Gate Verification</span>
                  {currentStep >= 7 ? (
                    <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-[11px] font-bold text-emerald-800">Farmer Verified ✅</span>
                  ) : (
                    <span className="rounded-full bg-gray-100 px-3 py-0.5 text-[11px] font-semibold text-gray-600">Pending Verification</span>
                  )}
                </div>
                <h3 className="font-display text-base font-bold text-forest-900 mt-1">Identity & Booking Verification</h3>
                <p className="text-xs text-forest-600 mt-0.5">
                  Verified by: <strong>{journey.verifiedBy || 'Officer S. Rao (ID: OFF-842)'}</strong>
                </p>
              </div>
            </div>

            {/* STEP 8 — QUALITY CHECK WITH VISUAL MOISTURE GAUGE */}
            <div className="relative flex items-start gap-4 sm:gap-6 pl-2">
              <div className={`z-10 grid h-10 w-10 shrink-0 place-items-center rounded-2xl font-bold text-sm shadow-glow ${
                currentStep > 8 ? 'bg-emerald-500 text-white' : currentStep === 8 ? 'bg-amber-500 text-white ring-4 ring-amber-200' : 'bg-gray-200 text-gray-500'
              }`}>
                {currentStep > 8 ? '✓' : '8'}
              </div>
              <div className={`flex-1 rounded-3xl glass p-5 border ${
                currentStep > 8 ? 'border-emerald-200 bg-emerald-50/20' : currentStep === 8 ? 'border-amber-300 bg-amber-50/40 ring-1 ring-amber-300' : 'border-gray-200'
              }`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-forest-700">Step 8 • Quality Inspection</span>
                  <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-[11px] font-bold text-emerald-800">
                    Grade: {journey.qualityGrade || 'Grade A Super'} ✅
                  </span>
                </div>
                <h3 className="font-display text-base font-bold text-forest-900 mt-1">Grain Moisture & Quality Parameters</h3>

                {/* Visual Moisture Gauge */}
                <div className="mt-3 rounded-2xl glass p-3.5 border border-forest-100">
                  <div className="flex items-center justify-between text-xs font-bold text-forest-900 mb-1">
                    <span>💧 Moisture Gauge ({journey.moisturePct || 13.8}%)</span>
                    <span className="text-emerald-700 font-extrabold">Optimal Level (&lt; 14%)</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-gray-200 overflow-hidden relative">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-blue-500 to-amber-500"
                      style={{ width: `${Math.min(100, ((journey.moisturePct || 13.8) / 20) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-forest-500 font-medium mt-1">
                    <span>10% (Dry)</span>
                    <span className="font-bold text-emerald-800">14% (FCI Standard)</span>
                    <span>20% (Wet)</span>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-2xl glass p-2.5 text-center border border-forest-100">
                    <p className="text-[10px] font-bold uppercase text-forest-500">Quality Score</p>
                    <p className="text-lg font-black text-emerald-700">{journey.qualityScore || 92}/100</p>
                  </div>
                  <div className="rounded-2xl glass p-2.5 text-center border border-forest-100">
                    <p className="text-[10px] font-bold uppercase text-forest-500">Moisture Content</p>
                    <p className="text-lg font-black text-blue-700">{journey.moisturePct || 13.8}%</p>
                  </div>
                  <div className="rounded-2xl glass p-2.5 text-center border border-forest-100">
                    <p className="text-[10px] font-bold uppercase text-forest-500">Foreign Matter</p>
                    <p className="text-lg font-bold text-forest-900">{journey.trashPct || 0.8}%</p>
                  </div>
                  <div className="rounded-2xl glass p-2.5 text-center border border-forest-100">
                    <p className="text-[10px] font-bold uppercase text-forest-500">Decision</p>
                    <p className="text-lg font-black text-emerald-600">{journey.qualityDecision || 'ACCEPTED'}</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xs text-forest-600 italic">
                    "{journey.qualityRemarks}"
                  </p>
                  <button
                    onClick={() => setShowQualityModal(true)}
                    className="btn-secondary text-xs shrink-0"
                  >
                    View Full Certificate
                  </button>
                </div>
              </div>
            </div>

            {/* STEP 9 — WEIGHING WITH VISUAL BALANCE SCALE */}
            <div className="relative flex items-start gap-4 sm:gap-6 pl-2">
              <div className={`z-10 grid h-10 w-10 shrink-0 place-items-center rounded-2xl font-bold text-sm shadow-glow ${
                currentStep > 9 ? 'bg-emerald-500 text-white' : currentStep === 9 ? 'bg-amber-500 text-white ring-4 ring-amber-200' : 'bg-gray-200 text-gray-500'
              }`}>
                {currentStep > 9 ? '✓' : '9'}
              </div>
              <div className={`flex-1 rounded-3xl glass p-5 border ${
                currentStep > 9 ? 'border-emerald-200 bg-emerald-50/20' : currentStep === 9 ? 'border-amber-300 bg-amber-50/40' : 'border-gray-200'
              }`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-forest-700">Step 9 • Weighbridge</span>
                  {currentStep >= 9 ? (
                    <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-[11px] font-bold text-emerald-800">Weighing Complete ✅</span>
                  ) : (
                    <span className="rounded-full bg-gray-100 px-3 py-0.5 text-[11px] font-semibold text-gray-600">Pending</span>
                  )}
                </div>
                <h3 className="font-display text-base font-bold text-forest-900 mt-1">Electronic Weighbridge Batch Record</h3>

                <div className="mt-3 rounded-2xl bg-forest-950 p-4 text-white">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-[10px] font-medium text-forest-300 uppercase">Gross Weight</p>
                      <p className="text-lg font-bold text-white">{journey.grossWeightKg || 4120} kg</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-forest-300 uppercase">Tare Weight</p>
                      <p className="text-lg font-bold text-amber-300">− {journey.tareWeightKg || 120} kg</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-leaf-300 uppercase">Net Weight</p>
                      <p className="text-xl font-extrabold text-leaf-400">
                        {journey.netWeightKg || 4000} kg ({((journey.netWeightKg || 4000) / 100).toFixed(0)} Qtl)
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 text-center text-[11px] text-forest-400 font-mono">
                    Scale Formula: Net Weight ({journey.netWeightKg || 4000} kg) = Gross ({journey.grossWeightKg || 4120} kg) − Tare ({journey.tareWeightKg || 120} kg)
                  </p>
                </div>
              </div>
            </div>

            {/* STEP 10 — PRICE CALCULATION */}
            <div className="relative flex items-start gap-4 sm:gap-6 pl-2">
              <div className={`z-10 grid h-10 w-10 shrink-0 place-items-center rounded-2xl font-bold text-sm shadow-glow ${
                currentStep > 10 ? 'bg-emerald-500 text-white' : currentStep === 10 ? 'bg-amber-500 text-white ring-4 ring-amber-200' : 'bg-gray-200 text-gray-500'
              }`}>
                {currentStep > 10 ? '✓' : '10'}
              </div>
              <div className={`flex-1 rounded-3xl glass p-5 border ${
                currentStep > 10 ? 'border-emerald-200 bg-emerald-50/20' : currentStep === 10 ? 'border-amber-300 bg-amber-50/40' : 'border-gray-200'
              }`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-forest-700">
                    {tr('Step 10 • MSP Price Valuation', 'దశ 10 • MSP ధరల గణన', 'चरण 10 • MSP मूल्य मूल्यांकन')}
                  </span>
                  <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-[11px] font-bold text-emerald-800">
                    {tr('Transparent Rate ✅', 'పారదర్శక ధర ✅', 'पारदर्शी दर ✅')}
                  </span>
                </div>
                <h3 className="font-display text-base font-bold text-forest-900 mt-1">
                  {tr('Government MSP Rate Valuation', 'ప్రభుత్వ మద్దతు ధర (MSP) లెక్కలు', 'सरकारी समर्थन मूल्य मूल्यांकन')}
                </h3>

                <div className="mt-3 rounded-2xl glass p-4 border border-forest-100 space-y-2 text-xs">
                  <div className="flex justify-between text-forest-700">
                    <span>{tr('Applicable Govt MSP Rate:', 'ప్రభుత్వ కనీస మద్దతు ధర:', 'लागू सरकारी समर्थन मूल्य:')}</span>
                    <strong className="text-forest-950">{formatRupee(journey.ratePerQuintal || 2300)} / {tr('Quintal', 'క్వింటాల్', 'क्विंटल')}</strong>
                  </div>
                  <div className="flex justify-between text-forest-700">
                    <span>{tr('Procured Net Quantity:', 'కొనుగోలు చేసిన నికర పరిమాణం:', 'खरीदी गई शुद्ध मात्रा:')}</span>
                    <strong className="text-forest-950">{((journey.netWeightKg || 4000) / 100).toFixed(0)} {tr('Quintals', 'క్వింటాళ్ళు', 'क्विंटल')} (4,000 kg)</strong>
                  </div>
                  <div className="flex justify-between text-forest-700">
                    <span>{tr('Gross Produce Valuation:', 'మొత్తం ధాన్యం విలువ:', 'कुल फसल मूल्यांकन:')}</span>
                    <strong className="text-forest-950">{formatRupee((journey.ratePerQuintal || 2300) * ((journey.netWeightKg || 4000) / 100))}</strong>
                  </div>
                  <div className="flex justify-between text-forest-700">
                    <span>{tr('Moisture / Trash Deductions:', 'తేమ / చెత్త మినహాయింపులు:', 'नमी व कचरा कटौती:')}</span>
                    <strong className="text-emerald-700">₹0 ({tr('Zero Deduction', 'సున్నా మినహాయింపు', 'शून्य कटौती')})</strong>
                  </div>
                  <div className="pt-2 border-t border-forest-200 flex justify-between text-sm font-extrabold text-forest-950">
                    <span>{tr('Net Payable Amount:', 'రైతుకు నికర చెల్లింపు:', 'शुद्ध देय राशि:')}</span>
                    <span className="text-lg text-leaf-700">{formatRupee(journey.finalPayableAmount || 92000)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 11 — PROCUREMENT APPROVAL */}
            <div className="relative flex items-start gap-4 sm:gap-6 pl-2">
              <div className={`z-10 grid h-10 w-10 shrink-0 place-items-center rounded-2xl font-bold text-sm shadow-glow ${
                currentStep > 11 ? 'bg-emerald-500 text-white' : currentStep === 11 ? 'bg-amber-500 text-white ring-4 ring-amber-200' : 'bg-gray-200 text-gray-500'
              }`}>
                {currentStep > 11 ? '✓' : '11'}
              </div>
              <div className={`flex-1 rounded-3xl glass p-5 border ${
                currentStep > 11 ? 'border-emerald-200 bg-emerald-50/20' : currentStep === 11 ? 'border-amber-300 bg-amber-50/40' : 'border-gray-200'
              }`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-forest-700">
                    {tr('Step 11 • Officer Approval', 'దశ 11 • అధికారి ఆమోదం', 'चरण 11 • अधिकारी स्वीकृति')}
                  </span>
                  <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-[11px] font-bold text-emerald-800">
                    {journey.approvalStatus || 'APPROVED'} ✅
                  </span>
                </div>
                <h3 className="font-display text-base font-bold text-forest-900 mt-1">
                  {tr('Authorized Audit Sign-Off', 'అధికారిక ఆడిట్ ఆమోదం', 'अधिकृत ऑडिट स्वीकृति')}
                </h3>
                <p className="text-xs text-forest-600 mt-0.5">
                  {tr('Approved by:', 'ఆమోదించిన వారు:', 'स्वीकृतकर्ता:')} <strong>{journey.approvedBy || 'Regional Officer S. Rao'}</strong>
                </p>
              </div>
            </div>

            {/* STEP 12 — PAYMENT */}
            <div className="relative flex items-start gap-4 sm:gap-6 pl-2">
              <div className={`z-10 grid h-10 w-10 shrink-0 place-items-center rounded-2xl font-bold text-sm shadow-glow ${
                currentStep > 12 ? 'bg-emerald-500 text-white' : currentStep === 12 ? 'bg-amber-500 text-white ring-4 ring-amber-200' : 'bg-gray-200 text-gray-500'
              }`}>
                {currentStep > 12 ? '✓' : '12'}
              </div>
              <div className={`flex-1 rounded-3xl glass p-5 border ${
                currentStep > 12 ? 'border-emerald-200 bg-emerald-50/20' : currentStep === 12 ? 'border-amber-300 bg-amber-50/40 ring-1 ring-amber-300' : 'border-gray-200'
              }`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-forest-700">
                    {tr('Step 12 • Direct Payout', 'దశ 12 • నేరుగా బ్యాంక్ చెల్లింపు', 'चरण 12 • सीधा बैंक भुगतान')}
                  </span>
                  <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-[11px] font-bold text-emerald-800">
                    {tr('Payment Successful 🟢', 'చెల్లింపు విజయవంతమైంది 🟢', 'भुगतान सफल 🟢')}
                  </span>
                </div>
                <h3 className="font-display text-base font-bold text-forest-900 mt-1">
                  {tr('DBT / NPCI Bank Transfer', 'నేరుగా బ్యాంక్ బదిలీ (DBT / NPCI)', 'डीबीटी / एनपीसीआई बैंक ट्रांसफर')}
                </h3>

                <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl bg-emerald-50 p-4 border border-emerald-200">
                  <div>
                    <p className="text-xs text-emerald-900 font-bold">
                      {tr('Payable Amount:', 'చెల్లించవలసిన మొత్తం:', 'देय राशि:')} <span className="text-base text-emerald-700">{formatRupee(journey.finalPayableAmount || 92000)}</span>
                    </p>
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      {tr('Bank Reference UTR:', 'బ్యాంక్ UTR సంఖ్య:', 'बैंक UTR नंबर:')} <strong>{journey.paymentReferenceId || 'UTR-SBIN20260905-94821'}</strong> ({journey.paymentMethod})
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-[11px] font-extrabold text-amber-900 border border-amber-300">
                    ⚠️ DEMO PAYMENT — NO REAL MONEY TRANSFERRED
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 13 — DIGITAL RECEIPT */}
            <div className="relative flex items-start gap-4 sm:gap-6 pl-2">
              <div className="z-10 grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-emerald-500 text-white font-bold shadow-glow text-sm">
                ✓
              </div>
              <div className="flex-1 rounded-3xl glass p-5 border border-emerald-200 bg-emerald-50/40">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                    {tr('Step 13 • Digital Receipt', 'దశ 13 • డిజిటల్ రసీదు', 'चरण 13 • डिजिटल रसीद')}
                  </span>
                  <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-[11px] font-bold text-emerald-800">
                    {tr('Procurement Completed 🎉', 'కొనుగోలు పూర్తయింది 🎉', 'खरीद पूरी हुई 🎉')}
                  </span>
                </div>
                <h3 className="font-display text-lg font-extrabold text-forest-950 mt-1">
                  {tr('Final Mandi Procurement Receipt', 'అధికారిక డిజిటల్ మండి రసీదు', 'अंतिम मंडी खरीद रसीद')}
                </h3>
                <p className="text-xs text-forest-600 mt-0.5">
                  {tr(
                    'Official government procurement certificate generated with verifiable audit log.',
                    'రైతు కోసం అధికారిక డిజిటల్ కొనుగోలు పత్రం సిద్ధంగా ఉంది.',
                    'सत्यापन योग्य ऑडिट लॉग के साथ आधिकारिक सरकारी खरीद प्रमाण पत्र जारी।'
                  )}
                </p>

                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={() => setShowReceiptModal(true)}
                    className="btn-primary text-xs flex items-center gap-1.5"
                  >
                    <FileText className="h-4 w-4" /> {tr('View Official Mandi Receipt', 'అధికారిక మండి రసీదు చూడండి', 'आधिकारिक मंडी रसीद देखें')}
                  </button>
                  <button
                    onClick={handlePrintSlip}
                    className="btn-secondary text-xs flex items-center gap-1.5"
                  >
                    <Printer className="h-4 w-4" /> {tr('Print Receipt', 'రసీదు ప్రింట్ చేయండి', 'रसीद प्रिंट करें')}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </Reveal>

      {/* SECTION 4: FINAL COMPLETION CARD */}
      <Reveal>
        <div className="mt-8 rounded-5xl bg-gradient-to-br from-forest-900 via-forest-950 to-black p-8 text-white shadow-2xl border border-leaf-500/30 text-center relative overflow-hidden">
          <div className="absolute right-0 bottom-0 h-64 w-64 rounded-full bg-leaf-500/10 blur-3xl pointer-events-none" />

          <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-leaf-400 to-forest-600 text-white shadow-glow mb-4">
            <Award className="h-8 w-8" />
          </div>

          <h2 className="font-display text-3xl font-extrabold text-white">
            🎉 Procurement Completed Successfully
          </h2>
          <p className="text-sm text-forest-200 mt-2 max-w-xl mx-auto">
            {journey.netWeightKg || 4000} kg {journey.crop} ({journey.qualityGrade || 'Grade A'}) successfully procured at {journey.centerName}.
          </p>

          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-6 rounded-3xl bg-white/10 p-4 backdrop-blur-md border border-white/15">
            <div>
              <p className="text-[10px] font-bold text-forest-300 uppercase">Procured Quantity</p>
              <p className="text-xl font-bold text-white">{((journey.netWeightKg || 4000) / 100).toFixed(0)} Qtl ({journey.netWeightKg || 4000} kg)</p>
            </div>
            <div className="h-8 w-px bg-white/20 hidden sm:block" />
            <div>
              <p className="text-[10px] font-bold text-forest-300 uppercase">Quality Grade</p>
              <p className="text-xl font-bold text-leaf-300">{journey.qualityGrade || 'Grade A Super'}</p>
            </div>
            <div className="h-8 w-px bg-white/20 hidden sm:block" />
            <div>
              <p className="text-[10px] font-bold text-forest-300 uppercase">Final Amount</p>
              <p className="text-xl font-black text-amber-300">{formatRupee(journey.finalPayableAmount || 92000)}</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => setShowReceiptModal(true)}
              className="btn-primary"
            >
              <FileText className="h-4 w-4" /> View Full Receipt
            </button>
            <button
              onClick={() => setView('payment')}
              className="btn-secondary text-white border-white/30 hover:bg-white/10"
            >
              <TrendingUp className="h-4 w-4" /> View Transaction History
            </button>
          </div>
        </div>
      </Reveal>

      {/* QR MODAL */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-md animate-fade-in">
          <div className="rounded-5xl glass p-8 shadow-glass-lg max-w-md w-full text-center space-y-4 border border-leaf-200">
            <h3 className="font-display text-2xl font-bold text-forest-950">Mandi Verification QR Pass</h3>
            <p className="text-xs text-forest-600">
              Scan this QR code at the procurement gate counter for instant entry.
            </p>

            <div className="mx-auto grid h-48 w-48 place-items-center rounded-3xl bg-white p-4 shadow-md border-2 border-forest-900">
              <QrCode className="h-36 w-36 text-forest-950" />
            </div>

            <div className="rounded-2xl bg-forest-50 p-3 text-left text-xs text-forest-700 space-y-1">
              <p><strong>Token #:</strong> {journey.tokenNumber}</p>
              <p><strong>Ref ID:</strong> {journey.procurementId}</p>
              <p><strong>Center:</strong> {journey.centerName}</p>
            </div>

            <button
              onClick={() => setShowQRModal(false)}
              className="btn-primary w-full"
            >
              Close QR Code
            </button>
          </div>
        </div>
      )}

      {/* QUALITY CERTIFICATE MODAL */}
      {showQualityModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-md animate-fade-in">
          <div className="rounded-5xl glass p-8 shadow-glass-lg max-w-lg w-full text-left space-y-4 border border-leaf-200">
            <div className="flex items-center justify-between border-b border-forest-100 pb-3">
              <h3 className="font-display text-xl font-bold text-forest-950">Official Quality Assessment Certificate</h3>
              <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800">
                Grade: {journey.qualityGrade || 'Grade A'}
              </span>
            </div>

            <div className="space-y-3 text-xs text-forest-800">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 glass rounded-2xl">
                  <p className="text-[10px] text-forest-500 font-semibold uppercase">Overall Quality Score</p>
                  <p className="text-lg font-black text-emerald-700">{journey.qualityScore || 92}/100</p>
                </div>
                <div className="p-3 glass rounded-2xl">
                  <p className="text-[10px] text-forest-500 font-semibold uppercase">Moisture Level</p>
                  <p className="text-lg font-black text-blue-700">{journey.moisturePct || 13.8}%</p>
                </div>
                <div className="p-3 glass rounded-2xl">
                  <p className="text-[10px] text-forest-500 font-semibold uppercase">Foreign Matter / Trash</p>
                  <p className="text-base font-bold text-forest-900">{journey.trashPct || 0.8}%</p>
                </div>
                <div className="p-3 glass rounded-2xl">
                  <p className="text-[10px] text-forest-500 font-semibold uppercase">Damaged Grains</p>
                  <p className="text-base font-bold text-forest-900">{journey.damagedGrainsPct || 0.4}%</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                <p className="font-bold text-emerald-950">Official Decision: ACCEPTED</p>
                <p className="text-[11px] text-emerald-800 mt-0.5">"{journey.qualityRemarks}"</p>
              </div>
            </div>

            <button
              onClick={() => setShowQualityModal(false)}
              className="btn-primary w-full"
            >
              Close Certificate
            </button>
          </div>
        </div>
      )}

      {/* FULL RECEIPT MODAL */}
      {showReceiptModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-md animate-fade-in">
          <div className="rounded-5xl glass p-8 shadow-glass-lg max-w-xl w-full text-left space-y-4 border border-leaf-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-forest-100 pb-4">
              <div>
                <h3 className="font-display text-xl font-bold text-forest-950">Government Procurement Receipt</h3>
                <p className="text-xs text-forest-500">Ref: {journey.procurementId}</p>
              </div>
              <button
                onClick={handlePrintSlip}
                className="btn-secondary text-xs"
              >
                <Printer className="h-4 w-4" /> Print
              </button>
            </div>

            <div className="space-y-3 text-xs text-forest-800">
              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-cream-100/60 border border-forest-200/50">
                <div>
                  <p className="text-[10px] uppercase font-bold text-forest-500">Farmer Name</p>
                  <p className="font-bold text-forest-900">{journey.farmerName}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-forest-500">Procurement Center</p>
                  <p className="font-bold text-forest-900">{journey.centerName}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-forest-500">Crop & Grade</p>
                  <p className="font-bold text-forest-900">{journey.crop} ({journey.qualityGrade || 'Grade A'})</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-forest-500">Net Quantity</p>
                  <p className="font-bold text-forest-900">{((journey.netWeightKg || 4000) / 100).toFixed(0)} Quintals ({journey.netWeightKg || 4000} kg)</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-forest-500">Rate per Quintal</p>
                  <p className="font-bold text-forest-900">{formatRupee(journey.ratePerQuintal || 2300)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-forest-500">Final Amount Paid</p>
                  <p className="font-extrabold text-leaf-700 text-sm">{formatRupee(journey.finalPayableAmount || 92000)}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowReceiptModal(false)}
              className="btn-primary w-full"
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}

      {/* FULL STEP-BY-STEP GUIDED TOUR MODAL */}
      {showStepByStepModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-md animate-fade-in">
          <div className="rounded-5xl glass p-6 sm:p-8 shadow-2xl max-w-3xl w-full text-left space-y-6 border-2 border-amber-400/50 bg-gradient-to-b from-white via-cream-50 to-amber-50/30 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-forest-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-400 text-purple-950 font-black text-xl shadow-glow">
                  📋
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-amber-900 border border-amber-300">
                    A-to-Z Guided Tour
                  </div>
                  <h3 className="font-display text-xl sm:text-2xl font-black text-forest-950">
                    {lang === 'te' ? 'పూర్తి కొనుగోలు దశల వారీ వివరాలు' : lang === 'hi' ? 'खरीद की चरण-दर-चरण प्रक्रिया' : 'Complete Step-by-Step Journey'}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setShowStepByStepModal(false)}
                className="grid h-9 w-9 place-items-center rounded-full bg-forest-100 text-forest-700 hover:bg-forest-200 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Step Pills Selector Bar (Steps 1 to 13) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-forest-100">
              {Array.from({ length: 13 }, (_, index) => {
                const stepNum = index + 1;
                const isSelected = selectedGuideStep === stepNum;
                const isDone = stepNum < currentStep;
                const isCurrent = stepNum === currentStep;

                return (
                  <button
                    key={`step-pill-${stepNum}`}
                    onClick={() => setSelectedGuideStep(stepNum)}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-extrabold shrink-0 transition-all border ${
                      isSelected
                        ? 'bg-purple-950 text-amber-300 border-purple-900 shadow-glow scale-[1.03]'
                        : isDone
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200'
                        : isCurrent
                        ? 'bg-amber-400 text-purple-950 border-amber-500 animate-pulse'
                        : 'bg-white text-forest-700 border-forest-100 hover:bg-forest-50'
                    }`}
                  >
                    <span>Step {stepNum}</span>
                    {isDone && <span>✅</span>}
                    {isCurrent && <span>⚡</span>}
                  </button>
                );
              })}
            </div>

            {/* Selected Step Card Details */}
            {(() => {
              const info = STAGE_DICTIONARY[selectedGuideStep];
              const details = STEP_GUIDE_DETAILS[selectedGuideStep] || STEP_GUIDE_DETAILS[1];
              const isDone = selectedGuideStep < currentStep;
              const isCurrent = selectedGuideStep === currentStep;

              return (
                <div className="rounded-4xl glass p-5 sm:p-7 border-2 border-forest-200/80 bg-white/90 shadow-md space-y-5">
                  {/* Step Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-forest-100 pb-4">
                    <div className="flex items-start gap-3">
                      <span className="text-3xl sm:text-4xl">{details.icon}</span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-black text-purple-950 uppercase bg-purple-100 px-2.5 py-0.5 rounded-full border border-purple-200">
                            Stage {selectedGuideStep} of 13
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${
                              isDone
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : isCurrent
                                ? 'bg-amber-400 text-purple-950 border border-amber-500 animate-pulse'
                                : 'bg-gray-100 text-gray-700 border border-gray-300'
                            }`}
                          >
                            {isDone ? 'Completed ✅' : isCurrent ? 'Current Live Stage ⚡' : 'Upcoming Stage ⏳'}
                          </span>
                        </div>
                        <h4 className="font-display text-lg sm:text-xl font-black text-forest-950 mt-1">
                          {lang === 'te' ? info?.titleTe : lang === 'hi' ? info?.titleHi : info?.titleEn}
                        </h4>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if ('speechSynthesis' in window && info) {
                          window.speechSynthesis.cancel();
                          const msg = new SpeechSynthesisUtterance(
                            lang === 'te' ? info.speakTe : lang === 'hi' ? info.speakHi : info.speakEn
                          );
                          msg.lang = lang === 'te' ? 'te-IN' : lang === 'hi' ? 'hi-IN' : 'en-US';
                          window.speechSynthesis.speak(msg);
                        }
                      }}
                      className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-leaf-600 hover:bg-leaf-500 text-white font-extrabold text-xs px-3.5 py-2 transition shadow-sm"
                    >
                      <Volume2 className="h-4 w-4" />
                      <span>{lang === 'te' ? 'ఆడియో వినండి' : lang === 'hi' ? 'ऑडियो सुनें' : 'Listen Audio'}</span>
                    </button>
                  </div>

                  {/* Explanation */}
                  <div className="space-y-1.5">
                    <p className="text-xs font-black uppercase tracking-wider text-forest-500">What Happens at this Stage:</p>
                    <p className="text-sm font-semibold text-forest-900 bg-cream-50 p-3.5 rounded-2xl border border-forest-100 leading-relaxed">
                      {lang === 'te' ? info?.speakTe : lang === 'hi' ? info?.speakHi : info?.speakEn}
                    </p>
                  </div>

                  {/* Requirements & Action Needed */}
                  <div className="space-y-2">
                    <p className="text-xs font-black uppercase tracking-wider text-amber-800">Action & Documents Required from Farmer:</p>
                    <div className="rounded-2xl bg-amber-50 p-4 border border-amber-200/80 space-y-2">
                      <p className="text-xs font-bold text-amber-950">
                        👉 {lang === 'te' ? details.actionRequiredTe : lang === 'hi' ? details.actionRequiredHi : details.actionRequired}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap pt-1">
                        <span className="text-[11px] font-bold text-amber-900">Documents Needed:</span>
                        {details.docsNeeded.map((doc, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold text-forest-900 border border-amber-300"
                          >
                            📄 {doc}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Recorded Timestamp or Live Milestone Data */}
                  <div className="rounded-2xl bg-forest-900 p-4 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-semibold">
                    <span>
                      {isDone ? 'Recorded Milestone Verification:' : isCurrent ? 'Active Live Stage Status:' : 'Scheduled Stage:'}
                    </span>
                    <span className="font-bold text-leaf-300">
                      {isDone
                        ? 'Verified & Recorded in Supabase Ledger'
                        : isCurrent
                        ? `Token #${journey.tokenNumber} Active at Mandi Center`
                        : 'Awaiting Previous Steps Completion'}
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Modal Footer Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-forest-100 pt-4">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  disabled={selectedGuideStep <= 1}
                  onClick={() => setSelectedGuideStep((prev) => Math.max(1, prev - 1))}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 rounded-2xl glass px-4 py-2.5 text-xs font-bold text-forest-800 hover:bg-white disabled:opacity-40 border border-forest-200"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous Step
                </button>
                <button
                  disabled={selectedGuideStep >= 13}
                  onClick={() => setSelectedGuideStep((prev) => Math.min(13, prev + 1))}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 rounded-2xl bg-forest-900 text-white hover:bg-forest-800 px-4 py-2.5 text-xs font-bold disabled:opacity-40"
                >
                  Next Step <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setSelectedGuideStep(currentStep)}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 rounded-2xl bg-amber-400 hover:bg-amber-300 text-purple-950 px-3.5 py-2.5 text-xs font-black"
                >
                  🎯 Target My Current Step ({currentStep})
                </button>
                <button
                  onClick={() => setShowStepByStepModal(false)}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center rounded-2xl glass px-4 py-2.5 text-xs font-bold text-forest-700 hover:bg-white border border-forest-200"
                >
                  Close Guide
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
