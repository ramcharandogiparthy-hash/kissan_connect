import { useState } from 'react';
import {
  Award,
  CheckCircle2,
  Clock,
  Droplets,
  FileText,
  HelpCircle,
  Info,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  UserCheck,
  XCircle,
  ChevronDown,
  ChevronUp,
  Bot,
  Loader2,
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { Reveal } from '@/components/Reveal';
import {
  type QualityStepStatus,
  getQualityDecisionBadge,
} from '@/lib/quality-service';
import { QualityCertificateModal } from '@/components/QualityCertificateModal';

export function QualityView() {
  const { lang, activeQualityRecord, verifyQualityByStaff, setMitraOpen } = useApp();
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [expandedHistory, setExpandedHistory] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  const record = activeQualityRecord;
  const decisionBadge = getQualityDecisionBadge(record.decision);

  const handleRunAiQualityScan = () => {
    setScanning(true);
    setTimeout(() => {
      verifyQualityByStaff(record.id || record.tokenId, 'accepted');
      setScanning(false);
    }, 1200);
  };

  const getStepIcon = (status: QualityStepStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-leaf-600 shrink-0" />;
      case 'in_progress':
        return <RefreshCw className="h-5 w-5 text-amber-500 animate-spin shrink-0" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500 shrink-0" />;
      default:
        return <Clock className="h-5 w-5 text-forest-300 shrink-0" />;
    }
  };

  const getStepBadgeStyle = (status: QualityStepStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-leaf-100 text-leaf-800 border-leaf-300';
      case 'in_progress':
        return 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-forest-50 text-forest-500 border-forest-200';
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-28 pt-28 lg:px-8 lg:pb-16">
      {/* Header Banner */}
      <Reveal>
        <div className="rounded-5xl glass p-6 sm:p-8 border border-forest-100 shadow-glass-lg relative overflow-hidden">
          <div className="absolute -top-12 -right-12 h-56 w-56 rounded-full bg-leaf-500/10 blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div>
              <span className="section-eyebrow">
                🌾 {lang === 'te' ? 'నాణ్యతా పరిరక్షణ వ్యవస్థ' : lang === 'hi' ? 'गुणवत्ता जांच प्रणाली' : 'Quality Checkup'}
              </span>
              <h1 className="mt-2 display-heading text-3xl sm:text-4xl font-extrabold text-forest-950">
                {lang === 'te'
                  ? 'మీ పంట నాణ్యత మరియు తేమ శాతాన్ని తనిఖీ చేయండి'
                  : 'Know your produce quality before procurement'}
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-forest-600 max-w-2xl">
                Real-time quality parameter testing, AI preliminary grading, and official staff verification status.
              </p>
            </div>

            {/* Decision Status Pill */}
            <div className="shrink-0 flex flex-col items-start lg:items-end">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-forest-500 mb-1">
                Current Status
              </span>
              <div
                className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-black border ${decisionBadge.colorClass} shadow-sm`}
              >
                <span>{decisionBadge.icon}</span>
                <span>{decisionBadge.label}</span>
              </div>
            </div>
          </div>

          {/* Farmer & Procurement Info Header Strip */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-3 pt-6 border-t border-forest-100 text-xs">
            <div className="rounded-2xl bg-forest-50/70 p-3 border border-forest-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-forest-400">Crop Name</span>
              <p className="font-extrabold text-forest-900 mt-0.5">{record.crop}</p>
            </div>
            <div className="rounded-2xl bg-forest-50/70 p-3 border border-forest-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-forest-400">Token ID</span>
              <p className="font-extrabold text-forest-900 mt-0.5">#{record.tokenId}</p>
            </div>
            <div className="rounded-2xl bg-forest-50/70 p-3 border border-forest-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-forest-400">Quantity</span>
              <p className="font-extrabold text-forest-900 mt-0.5">{record.quantityQuintals} Quintals</p>
            </div>
            <div className="rounded-2xl bg-forest-50/70 p-3 border border-forest-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-forest-400">Procurement Center</span>
              <p className="font-extrabold text-forest-900 mt-0.5 truncate">{record.centerName}</p>
            </div>
            <div className="col-span-2 sm:col-span-1 rounded-2xl bg-forest-50/70 p-3 border border-forest-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-forest-400">Date</span>
              <p className="font-extrabold text-forest-900 mt-0.5">{record.dateStr}</p>
            </div>
          </div>

          {/* Quality Assessment Upgrade Action Banner */}
          {record.decision === 'in_progress' && (
            <div className="mt-5 rounded-3xl bg-gradient-to-r from-amber-500/20 via-leaf-500/20 to-emerald-500/20 border-2 border-leaf-400 p-4 sm:p-5 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-500 text-white shrink-0 shadow-glow">
                  <Sparkles className="h-6 w-6 animate-spin" />
                </div>
                <div>
                  <h4 className="font-display text-sm sm:text-base font-bold text-forest-950">
                    {lang === 'te' ? 'నాణ్యత పరిశీలన స్థితి: ఇన్-ప్రోగ్రెస్ / పౌజ్ పద్ధతిలో ఉంది' : 'Quality Assessment Status: Paused / In Progress'}
                  </h4>
                  <p className="text-xs text-forest-700">
                    {lang === 'te' ? 'AI నాణ్యత తనిఖీని రన్ చేసి ధృవీకరించడానికి క్లిక్ చేయండి' : 'Run instant AI produce scan to verify quality parameters & upgrade pathway status to Step 4 (Quality Verified).'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleRunAiQualityScan}
                disabled={scanning}
                className="btn-primary text-xs shrink-0 shadow-lg px-6 py-3"
              >
                {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4 text-gold-300" />}
                <span>{scanning ? 'Running AI Scan...' : '⚡ Verify & Complete Assessment'}</span>
              </button>
            </div>
          )}
        </div>
      </Reveal>

      {/* Main 2-Column Responsive Layout */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN (PC: 7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          {/* 1. VISUAL QUALITY STATUS TIMELINE */}
          <Reveal delay={60}>
            <div className="rounded-4xl glass p-6 border border-forest-100 shadow-glass">
              <div className="flex items-center justify-between border-b border-forest-100 pb-4 mb-6">
                <div>
                  <h3 className="font-display text-lg font-bold text-forest-900 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-leaf-600" />
                    Quality Checkup Timeline
                  </h3>
                  <p className="text-xs text-forest-500">Live step-by-step produce inspection status</p>
                </div>
                <span className="rounded-xl bg-forest-100 px-3 py-1 text-[11px] font-bold text-forest-700">
                  Step 4 of 6
                </span>
              </div>

              {/* Timeline Steps List */}
              <div className="space-y-4 relative before:absolute before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-forest-200">
                {/* Step 1: Produce Received */}
                <div className="relative pl-10">
                  <span className="absolute left-1.5 top-0.5 -translate-x-1/2">
                    {getStepIcon(record.timeline.received.status)}
                  </span>
                  <div className="rounded-2xl bg-forest-50/70 p-3.5 border border-forest-100">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-forest-900">✓ Produce Received</p>
                      <span className="text-[10px] font-semibold text-forest-500">{record.timeline.received.timeStr}</span>
                    </div>
                    <p className="text-xs text-forest-600 mt-1 font-medium">{record.timeline.received.note}</p>
                    <span className="text-[10px] text-forest-400 mt-1 block">Role: {record.timeline.received.actor}</span>
                  </div>
                </div>

                {/* Step 2: Sample Collected */}
                <div className="relative pl-10">
                  <span className="absolute left-1.5 top-0.5 -translate-x-1/2">
                    {getStepIcon(record.timeline.sampleCollected.status)}
                  </span>
                  <div className="rounded-2xl bg-forest-50/70 p-3.5 border border-forest-100">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-forest-900">✓ Sample Collected</p>
                      <span className="text-[10px] font-semibold text-forest-500">{record.timeline.sampleCollected.timeStr}</span>
                    </div>
                    <p className="text-xs text-forest-600 mt-1 font-medium">{record.timeline.sampleCollected.note}</p>
                    <span className="text-[10px] text-forest-400 mt-1 block">Role: {record.timeline.sampleCollected.actor}</span>
                  </div>
                </div>

                {/* Step 3: Moisture Tested */}
                <div className="relative pl-10">
                  <span className="absolute left-1.5 top-0.5 -translate-x-1/2">
                    {getStepIcon(record.timeline.moistureTested.status)}
                  </span>
                  <div className="rounded-2xl bg-forest-50/70 p-3.5 border border-forest-100">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-forest-900">✓ Moisture Tested</p>
                      <span className="text-[10px] font-semibold text-forest-500">{record.timeline.moistureTested.timeStr}</span>
                    </div>
                    <p className="text-xs text-forest-600 mt-1 font-medium">{record.timeline.moistureTested.note}</p>
                    <span className="text-[10px] text-forest-400 mt-1 block">Role: {record.timeline.moistureTested.actor}</span>
                  </div>
                </div>

                {/* Step 4: Quality Assessment */}
                <div className="relative pl-10">
                  <span className="absolute left-1.5 top-0.5 -translate-x-1/2">
                    {getStepIcon(record.timeline.qualityAssessment.status)}
                  </span>
                  <div className="rounded-2xl bg-amber-50/80 p-3.5 border border-amber-200 shadow-sm">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                        ● Quality Assessment
                      </p>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${getStepBadgeStyle(record.timeline.qualityAssessment.status)}`}>
                        {record.timeline.qualityAssessment.status === 'in_progress' ? 'In progress...' : record.timeline.qualityAssessment.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-amber-900 mt-1 font-medium">{record.timeline.qualityAssessment.note}</p>
                    <span className="text-[10px] text-amber-700 mt-1 block">Role: {record.timeline.qualityAssessment.actor}</span>
                  </div>
                </div>

                {/* Step 5: Final Verification */}
                <div className="relative pl-10">
                  <span className="absolute left-1.5 top-0.5 -translate-x-1/2">
                    {getStepIcon(record.timeline.finalVerification.status)}
                  </span>
                  <div className="rounded-2xl bg-forest-50/40 p-3.5 border border-forest-100">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-forest-800">○ Final Verification</p>
                      <span className="text-[10px] font-semibold text-forest-400">{record.timeline.finalVerification.timeStr}</span>
                    </div>
                    <p className="text-xs text-forest-500 mt-1">{record.timeline.finalVerification.note}</p>
                  </div>
                </div>

                {/* Step 6: Procurement Decision */}
                <div className="relative pl-10">
                  <span className="absolute left-1.5 top-0.5 -translate-x-1/2">
                    {getStepIcon(record.timeline.decisionMade.status)}
                  </span>
                  <div className="rounded-2xl bg-forest-50/40 p-3.5 border border-forest-100">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-forest-800">○ Procurement Decision</p>
                      <span className="text-[10px] font-semibold text-forest-400">{record.timeline.decisionMade.timeStr}</span>
                    </div>
                    <p className="text-xs text-forest-500 mt-1">{record.timeline.decisionMade.note}</p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* 2. QUALITY PARAMETERS REPORT CARD */}
          <Reveal delay={120}>
            <div className="rounded-4xl glass p-6 border border-forest-100 shadow-glass">
              <div className="flex items-center justify-between border-b border-forest-100 pb-4 mb-4">
                <h3 className="font-display text-lg font-bold text-forest-900 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-leaf-600" />
                  QUALITY REPORT
                </h3>
                <span className="text-xs font-bold text-forest-500">Configured Parameters</span>
              </div>

              <div className="space-y-3">
                {record.parameters.map((param) => (
                  <div
                    key={param.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-forest-50/70 border border-forest-100 gap-2"
                  >
                    <div>
                      <p className="text-xs font-extrabold text-forest-900">{param.name}</p>
                      <p className="text-[10px] text-forest-500">Target Range: {param.targetRange}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-black text-forest-950">{param.measuredValue}</span>
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-xl border ${
                          param.status === 'good'
                            ? 'bg-leaf-100 text-leaf-800 border-leaf-300'
                            : param.status === 'attention'
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-red-100 text-red-900 border-red-300'
                        }`}
                      >
                        {param.status === 'good' && '✓ Within acceptable range'}
                        {param.status === 'attention' && '⚠ Attention needed'}
                        {param.status === 'outside_limit' && '✕ Outside limit'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* 3. DEDICATED MOISTURE ASSESSMENT CARD */}
          <Reveal delay={180}>
            <div className="rounded-4xl glass p-6 border border-forest-100 shadow-glass">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-bold text-forest-900 flex items-center gap-2">
                  <Droplets className="h-5 w-5 text-blue-600" />
                  💧 Moisture Level Assessment
                </h3>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                  {record.moistureStatus === 'good' ? '🟢 Within Target Range' : '🔴 High Moisture'}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-3xl bg-gradient-to-r from-blue-50 to-leaf-50 border border-blue-100">
                <div>
                  <span className="text-[10px] font-bold uppercase text-blue-700">Measured Grain Moisture</span>
                  <p className="font-mono text-3xl font-black text-forest-950 mt-0.5">{record.moisturePct}%</p>
                </div>

                {/* Horizontal Meter */}
                <div className="w-48 text-right">
                  <span className="text-[10px] font-bold text-forest-500">Low ─────────●───────── High</span>
                  <div className="w-full bg-forest-200 h-2 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className={`h-full ${record.moisturePct <= 14.0 ? 'bg-leaf-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(100, (record.moisturePct / 20) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-forest-400 block mt-1">Target MSP Limit: 14.0% Max</span>
                </div>
              </div>

              <p className="mt-4 text-xs text-forest-600 bg-forest-50/80 p-3 rounded-2xl border border-forest-100">
                💡 Lower/optimal moisture may help maintain quality and reduce deductions, depending on applicable procurement rules.
              </p>
            </div>
          </Reveal>
        </div>

        {/* RIGHT COLUMN (PC: 5 cols) */}
        <div className="lg:col-span-5 space-y-8">
          {/* 4. VISUAL QUALITY SCORE */}
          <Reveal delay={90}>
            <div className="rounded-4xl glass p-6 border border-forest-100 shadow-glass relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-forest-500 flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-gold-500" />
                  QUALITY SCORE
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                  <Info className="h-3 w-3" /> Preliminary AI Assessment
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <span className="font-display text-4xl font-black text-forest-950">
                  {record.score} <span className="text-xl font-bold text-forest-400">/ 100</span>
                </span>
                <span className="rounded-2xl bg-leaf-100 px-3.5 py-1.5 text-xs font-black text-leaf-800 border border-leaf-300">
                  🟢 {record.scoreLabel}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mt-4 w-full bg-forest-100 h-3.5 rounded-full overflow-hidden p-0.5">
                <div
                  className="bg-gradient-to-r from-leaf-400 to-forest-600 h-full rounded-full transition-all duration-1000 shadow-glow"
                  style={{ width: `${record.score}%` }}
                />
              </div>

              <p className="mt-3 text-xs text-forest-600">
                "Your produce currently meets the configured preliminary quality criteria."
              </p>

              {/* Disclaimer Rule #18 Compliance */}
              <div className="mt-4 flex items-start gap-2 rounded-2xl bg-amber-50/90 p-3 border border-amber-200 text-[11px] text-amber-900">
                <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  AI-assisted results are preliminary. Final quality grading and procurement decisions are made by authorized procurement personnel according to applicable rules.
                </span>
              </div>
            </div>
          </Reveal>

          {/* 5. OFFICIAL STAFF VERIFICATION SEPARATION */}
          <Reveal delay={150}>
            <div className="rounded-4xl glass p-6 border border-forest-100 shadow-glass space-y-4">
              <h3 className="font-display text-base font-bold text-forest-900 border-b border-forest-100 pb-3 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-leaf-600" />
                VERIFICATION STAGES
              </h3>

              {/* Stage 1: Preliminary AI */}
              <div className="rounded-2xl bg-leaf-50/80 p-3.5 border border-leaf-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-leaf-700" />
                    <span className="text-xs font-extrabold text-leaf-950">PRELIMINARY AI ASSESSMENT</span>
                  </div>
                  <span className="text-[10px] font-bold text-leaf-700 bg-leaf-200 px-2 py-0.5 rounded-full">
                    🤖 AI-assisted • Completed
                  </span>
                </div>
                <p className="text-[11px] text-leaf-800 mt-1">
                  Automated computer vision and moisture sensor analysis complete ({record.aiAssessmentTimeStr}).
                </p>
              </div>

              {/* Stage 2: Official Staff Verification */}
              <div className={`rounded-2xl p-3.5 border ${record.staffVerified ? 'bg-leaf-50 border-leaf-300' : 'bg-amber-50/80 border-amber-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-forest-800" />
                    <span className="text-xs font-extrabold text-forest-950">OFFICIAL STAFF VERIFICATION</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${record.staffVerified ? 'bg-leaf-500 text-white' : 'bg-amber-200 text-amber-900'}`}>
                    👨‍💼 {record.staffVerified ? 'Verified' : 'Pending Staff Verification'}
                  </span>
                </div>

                {record.staffVerified ? (
                  <div className="mt-2 text-[11px] text-forest-800 space-y-1">
                    <p>✓ <span className="font-bold">Verified By:</span> {record.verifiedBy}</p>
                    <p>✓ <span className="font-bold">Timestamp:</span> {record.verifiedAtStr}</p>
                  </div>
                ) : (
                  <p className="text-[11px] text-amber-900 mt-1">
                    Waiting for authorized procurement staff to verify physical sample and sign off.
                  </p>
                )}
              </div>
            </div>
          </Reveal>

          {/* 6. AI QUALITY INSIGHT CARD */}
          <Reveal delay={210}>
            <div className="rounded-4xl glass p-6 border border-forest-100 shadow-glass">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display text-base font-bold text-forest-900 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-gold-500" />
                  🤖 AI Quality Insight
                </h3>
              </div>

              <p className="text-xs text-forest-700 bg-forest-50 p-3 rounded-2xl border border-forest-100">
                "{record.aiInsightText}"
              </p>

              <div className="mt-4 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-forest-500">Recommendations:</span>
                {record.aiRecommendations.map((rec, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-forest-800">
                    <CheckCircle2 className="h-4 w-4 text-leaf-600 shrink-0" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setMitraOpen(true)}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-forest-900 py-3 text-xs font-bold text-white shadow-sm hover:bg-forest-950 transition"
              >
                <Bot className="h-4 w-4 text-gold-400" /> Ask Kisan AI Assistant
              </button>
            </div>
          </Reveal>

          {/* 7. DIGITAL QUALITY CERTIFICATE PREVIEW & ACTIONS */}
          <Reveal delay={270}>
            <div className="rounded-4xl glass p-6 border border-forest-100 shadow-glass text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-3xl bg-gradient-to-br from-leaf-500 to-forest-700 text-white shadow-glow mb-3">
                <Award className="h-7 w-7" />
              </div>
              <h3 className="font-display text-lg font-bold text-forest-950">Digital Quality Certificate</h3>
              <p className="text-xs text-forest-600 mt-1">
                Official accredited certificate generated upon authorized staff sign-off.
              </p>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => setShowCertificateModal(true)}
                  className="btn-gold text-xs shadow-lg flex items-center gap-2"
                >
                  <Award className="h-4 w-4" /> View Certificate
                </button>
                <button
                  onClick={() => setShowCertificateModal(true)}
                  className="rounded-2xl bg-forest-100 px-4 py-2.5 text-xs font-bold text-forest-700 hover:bg-forest-200 transition"
                >
                  Share / Download
                </button>
              </div>
            </div>
          </Reveal>

          {/* 8. FARMER-FRIENDLY EXPLANATION SECTION ("What does this mean?") */}
          <Reveal delay={310}>
            <div className="rounded-4xl glass p-6 border border-forest-100 shadow-glass space-y-3">
              <h3 className="font-display text-base font-bold text-forest-900 flex items-center gap-2 border-b border-forest-100 pb-3">
                <HelpCircle className="h-5 w-5 text-leaf-600" />
                What does this mean?
              </h3>

              <div className="space-y-2.5 text-xs text-forest-700">
                <div className="p-3 rounded-2xl bg-forest-50/70 border border-forest-100">
                  <p className="font-bold text-forest-900 flex items-center gap-1.5">🌾 Quality:</p>
                  <p className="mt-0.5 text-forest-600">Your produce has been assessed for configured quality parameters.</p>
                </div>
                <div className="p-3 rounded-2xl bg-forest-50/70 border border-forest-100">
                  <p className="font-bold text-forest-900 flex items-center gap-1.5">💧 Moisture:</p>
                  <p className="mt-0.5 text-forest-600">Shows the measured moisture level (Target 12%-14%).</p>
                </div>
                <div className="p-3 rounded-2xl bg-forest-50/70 border border-forest-100">
                  <p className="font-bold text-forest-900 flex items-center gap-1.5">⚖️ Quantity:</p>
                  <p className="mt-0.5 text-forest-600">Shows the officially recorded quantity when available.</p>
                </div>
                <div className="p-3 rounded-2xl bg-forest-50/70 border border-forest-100">
                  <p className="font-bold text-forest-900 flex items-center gap-1.5">💰 Payment:</p>
                  <p className="mt-0.5 text-forest-600">Payment calculation is based on official procurement decision and applicable rules.</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* 9. QUALITY HISTORY & AUDIT TRAIL */}
      <div className="mt-12">
        <Reveal delay={350}>
          <div className="rounded-4xl glass p-6 sm:p-8 border border-forest-100 shadow-glass">
            <h3 className="font-display text-xl font-bold text-forest-950 flex items-center gap-2 mb-4">
              <Clock className="h-6 w-6 text-leaf-600" />
              QUALITY CHECK HISTORY & AUDIT TRAIL
            </h3>

            <div className="space-y-3">
              {record.auditTrail.map((entry) => {
                const isExpanded = expandedHistory === entry.id;
                return (
                  <div
                    key={entry.id}
                    className="rounded-3xl bg-forest-50/70 border border-forest-100 overflow-hidden transition"
                  >
                    <button
                      onClick={() => setExpandedHistory(isExpanded ? null : entry.id)}
                      className="w-full p-4 text-left flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold text-forest-500">{entry.timeStr}</span>
                        <span className="font-bold text-xs text-forest-900">{entry.title}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getStepBadgeStyle(entry.status)}`}>
                          {entry.status.toUpperCase()}
                        </span>
                        {isExpanded ? <ChevronUp className="h-4 w-4 text-forest-400" /> : <ChevronDown className="h-4 w-4 text-forest-400" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 border-t border-forest-100 text-xs text-forest-700 bg-white/50">
                        <p>{entry.description}</p>
                        <div className="mt-2 text-[10px] text-forest-500 flex items-center gap-4">
                          <span>Role: <strong className="text-forest-900">{entry.actorRole.toUpperCase()}</strong></span>
                          <span>Actor: <strong className="text-forest-900">{entry.actorName}</strong></span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>
      </div>

      {/* Digital Quality Certificate Modal */}
      {showCertificateModal && (
        <QualityCertificateModal
          record={record}
          onClose={() => setShowCertificateModal(false)}
        />
      )}
    </div>
  );
}
