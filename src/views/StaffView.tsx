import { useState } from 'react';
import {
  Store,
  CheckCircle2,
  PhoneCall,
  Search,
  Droplets,
  ShieldCheck,
  Zap,
  Loader2,
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { Reveal } from '@/components/Reveal';

interface QueueItem {
  token: string;
  farmer: string;
  phone: string;
  crop: string;
  qty: number;
  time: string;
  status: 'Processing' | 'Waiting' | 'Completed' | 'Rejected';
  moisturePct: number;
}

const INITIAL_STAFF_QUEUE: QueueItem[] = [
  { token: 'A124', farmer: 'Venkat Rao', phone: '+91 94401 23456', crop: 'Paddy', qty: 40, time: '10:15 AM', status: 'Processing', moisturePct: 14.0 },
  { token: 'A125', farmer: 'Srinivas Reddi', phone: '+91 98480 88776', crop: 'Paddy', qty: 35, time: '10:20 AM', status: 'Waiting', moisturePct: 15.2 },
  { token: 'A126', farmer: 'Koteswara Rao', phone: '+91 94900 11223', crop: 'Cotton', qty: 20, time: '10:25 AM', status: 'Waiting', moisturePct: 8.0 },
  { token: 'A127', farmer: 'Ravi Kumar (You)', phone: '+91 98765 43210', crop: 'Paddy', qty: 40, time: '10:30 AM', status: 'Waiting', moisturePct: 14.0 },
  { token: 'A128', farmer: 'Anjaneyulu M.', phone: '+91 94412 55443', crop: 'Maize', qty: 50, time: '10:45 AM', status: 'Waiting', moisturePct: 13.5 },
];

export function StaffView() {
  const {
    lang,
    addProcurementRecord,
    qualityReportsList,
    verifyQualityByStaff,
    updateQualityMeasurements,
    setView,
    userProfile,
    staffPermissionsMap,
  } = useApp();

  const activeUserId = userProfile?.userId || 'usr-staff-1';
  const activePermissions = staffPermissionsMap[activeUserId] ?? [
    'quality_check',
    'weighing',
    'procurement_management',
    'payment_verification',
    'transport_management',
    'complaint_management',
    'farmer_management',
    'analytics_view',
  ];
  const [queue, setQueue] = useState<QueueItem[]>(INITIAL_STAFF_QUEUE);
  const [activeTokenIdx, setActiveTokenIdx] = useState(0);
  const [search, setSearch] = useState('');
  const [callingNext, setCallingNext] = useState(false);
  const [processingDbt, setProcessingDbt] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Quality Management Panel State
  const [selectedQualityToken, setSelectedQualityToken] = useState<string | null>(null);
  const [editingMoisture, setEditingMoisture] = useState<number>(13.2);
  const [editingGrade, setEditingGrade] = useState<string>('Grade A');

  const activeFarmer = queue[activeTokenIdx] ?? queue[0];

  const handleCallNext = () => {
    setCallingNext(true);
    setTimeout(() => {
      setCallingNext(false);
      const nextIdx = (activeTokenIdx + 1) % queue.length;
      setActiveTokenIdx(nextIdx);
      const updated = [...queue];
      updated[activeTokenIdx].status = 'Completed';
      updated[nextIdx].status = 'Processing';
      setQueue(updated);
      setToastMsg(
        lang === 'te'
          ? `రైతు ${updated[nextIdx].farmer} (టోకెన్ #${updated[nextIdx].token}) పిలువబడ్డారు.`
          : lang === 'hi'
          ? `किसान ${updated[nextIdx].farmer} (टोकन #${updated[nextIdx].token}) को बुलाया गया।`
          : `Called Farmer ${updated[nextIdx].farmer} (Token #${updated[nextIdx].token}). SMS sent!`
      );
      setTimeout(() => setToastMsg(null), 4000);
    }, 600);
  };

  const handleProcessDbt = () => {
    setProcessingDbt(true);
    setTimeout(() => {
      setProcessingDbt(false);

      // Automated Payment Engine Workflow Trigger
      addProcurementRecord({
        tokenId: activeFarmer.token,
        farmerName: activeFarmer.farmer,
        crop: `${activeFarmer.crop} (Grade A)`,
        quantityQuintals: activeFarmer.qty,
        ratePerQuintal: 2300,
        moisturePct: activeFarmer.moisturePct,
        verifiedBy: 'Officer S. Rao (Center Gate 2)',
      });

      setToastMsg(
        lang === 'te'
          ? `₹92,400 మద్దతు నిధులు రైతు ${activeFarmer.farmer} ఖాతాకు ధృవీకరించబడ్డాయి!`
          : `Verified & Generated Payout of ₹${(activeFarmer.qty * 2300).toLocaleString('en-IN')} for ${activeFarmer.farmer}!`
      );
      setTimeout(() => setToastMsg(null), 4000);
    }, 800);
  };

  const filteredQueue = search.trim()
    ? queue.filter(
        (q) =>
          q.farmer.toLowerCase().includes(search.toLowerCase()) ||
          q.token.toLowerCase().includes(search.toLowerCase())
      )
    : queue;

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-28 lg:px-8 lg:pb-12">
      {/* Toast alert */}
      {toastMsg && (
        <div className="fixed top-20 right-4 z-50 rounded-2xl bg-forest-900 px-5 py-3 text-sm font-bold text-white shadow-glass-lg animate-slide-in-right">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-leaf-400" />
            <span>{toastMsg}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <Reveal>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="section-eyebrow">
              <Store className="h-3.5 w-3.5" /> {lang === 'te' ? 'సిబ్బంది కొనుగోలు నిర్వహణ పోర్టల్' : 'Authorized Procurement Staff Portal'}
            </span>
            <h1 className="mt-2 display-heading text-3xl sm:text-4xl">
              Welcome, {userProfile?.fullName || 'Officer S. Rao'}
            </h1>
            <p className="mt-1 text-forest-600">
              Assigned Center: <span className="font-bold text-forest-900">Vijayawada Procurement Center A</span> • Role: <span className="font-bold text-forest-900">Procurement Staff</span>
            </p>
          </div>

          <div className="flex flex-col items-end gap-1 shrink-0">
            <div className="flex items-center gap-2 rounded-2xl bg-leaf-100 border border-leaf-300 px-4 py-2 text-xs font-extrabold text-leaf-800">
              <ShieldCheck className="h-4 w-4 text-leaf-600" />
              <span>Account Status: 🟢 Approved</span>
            </div>
            <span className="text-[11px] text-forest-500 font-medium">ID: ST-1024 • Auth Verified</span>
          </div>
        </div>
      </Reveal>

      {/* Stats Counter Bar */}
      <Reveal delay={80}>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-3xl glass p-4 card-hover">
            <p className="text-xs font-semibold text-forest-500">{lang === 'te' ? 'షెడ్యూల్ రైతులు' : 'Scheduled'}</p>
            <p className="font-display text-2xl font-extrabold text-forest-900 mt-1">128</p>
          </div>
          <div className="rounded-3xl glass p-4 card-hover">
            <p className="text-xs font-semibold text-forest-500">{lang === 'te' ? 'మొత్తం టోకెన్లు' : 'Tokens'}</p>
            <p className="font-display text-2xl font-extrabold text-forest-900 mt-1">142</p>
          </div>
          <div className="rounded-3xl glass p-4 card-hover">
            <p className="text-xs font-semibold text-forest-500">{lang === 'te' ? 'పూర్తయినవి' : 'Processed'}</p>
            <p className="font-display text-2xl font-extrabold text-leaf-600 mt-1">87</p>
          </div>
          <div className="rounded-3xl glass p-4 card-hover">
            <p className="text-xs font-semibold text-forest-500">{lang === 'te' ? 'క్యూలో ఉన్నారు' : 'Waiting'}</p>
            <p className="font-display text-2xl font-extrabold text-amber-600 mt-1">41</p>
          </div>
          <div className="rounded-3xl glass p-4 card-hover">
            <p className="text-xs font-semibold text-forest-500">{lang === 'te' ? 'స్వీకరించిన పంట' : 'Produce'}</p>
            <p className="font-display text-2xl font-extrabold text-forest-900 mt-1">384 Qtl</p>
          </div>
          <div className="rounded-3xl glass p-4 card-hover">
            <p className="text-xs font-semibold text-forest-500">{lang === 'te' ? 'పెండింగ్ నిధులు' : 'Pending'}</p>
            <p className="font-display text-2xl font-extrabold text-forest-900 mt-1">₹8.4L</p>
          </div>
        </div>
      </Reveal>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {/* Active Farmer Processing Card */}
        <Reveal className="lg:col-span-2">
          <div className="rounded-5xl bg-gradient-to-br from-forest-800 to-forest-900 p-6 text-white shadow-glass-lg sm:p-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-leaf-300">
                  {lang === 'te' ? 'ప్రస్తుతం ప్రాసెస్ అవుతున్న రైతు టోకెన్' : 'Currently Processing Farmer'}
                </span>
                <h2 className="mt-1 font-display text-3xl font-extrabold text-white">
                  Token #{activeFarmer.token} — {activeFarmer.farmer}
                </h2>
              </div>

              <button
                onClick={handleCallNext}
                disabled={callingNext}
                className="btn-gold text-sm disabled:opacity-60"
              >
                {callingNext ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> {lang === 'te' ? 'పిలుస్తోంది…' : 'Calling…'}
                  </>
                ) : (
                  <>
                    <PhoneCall className="h-4 w-4" /> {lang === 'te' ? 'తదుపరి రైతును పిలవండి' : 'Call Next Farmer'}
                  </>
                )}
              </button>
            </div>

            {/* Farmer Details */}
            <div className="mt-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              <div>
                <p className="text-xs text-white/60">{lang === 'te' ? 'ఫోన్ నంబర్' : 'Phone'}</p>
                <p className="font-semibold text-white">{activeFarmer.phone}</p>
              </div>
              <div>
                <p className="text-xs text-white/60">{lang === 'te' ? 'పంట & రకం' : 'Crop'}</p>
                <p className="font-semibold text-white">{activeFarmer.crop} (Grade A)</p>
              </div>
              <div>
                <p className="text-xs text-white/60">{lang === 'te' ? 'పరిమాణం' : 'Quantity'}</p>
                <p className="font-semibold text-white">{activeFarmer.qty} Quintals</p>
              </div>
              <div>
                <p className="text-xs text-white/60">{lang === 'te' ? 'తేమ శాతం' : 'Moisture'}</p>
                <p className="font-semibold text-leaf-300">{activeFarmer.moisturePct}% (Passed)</p>
              </div>
            </div>

            {/* Staff Controls */}
            <div className="mt-6 grid gap-3 sm:grid-cols-3 border-t border-white/10 pt-5">
              {activePermissions.includes('quality_check') ? (
                <button
                  onClick={() => {
                    setToastMsg(lang === 'te' ? 'నాణ్యత తనిఖీ పూర్తయింది — గ్రేడ్-A ధృవీకరించబడింది!' : 'Moisture check verified — Grade A Approved!');
                    setTimeout(() => setToastMsg(null), 4000);
                  }}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-xs font-bold text-white hover:bg-white/20 backdrop-blur"
                >
                  <Droplets className="h-4 w-4 text-blue-400" />
                  {lang === 'te' ? 'నాణ్యత ధృవీకరణ నివేదిక' : 'Verify Moisture Check'}
                </button>
              ) : (
                <div className="flex items-center justify-center p-3 text-[11px] font-semibold text-white/40 bg-white/5 rounded-2xl border border-white/10">
                  🔒 Moisture Check (No Permission)
                </div>
              )}

              {activePermissions.includes('procurement_management') ? (
                <button
                  onClick={() => {
                    setToastMsg(lang === 'te' ? 'పంట విజయవంతంగా కొనుగోలు స్వీకరించబడింది!' : 'Produce Batch Accepted & Weighed!');
                    setTimeout(() => setToastMsg(null), 4000);
                  }}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-leaf-500/30 px-4 py-3 text-xs font-bold text-leaf-200 hover:bg-leaf-500/40 border border-leaf-400/40 backdrop-blur"
                >
                  <CheckCircle2 className="h-4 w-4 text-leaf-300" />
                  {lang === 'te' ? 'పంట స్వీకరించు' : 'Accept Produce Lot'}
                </button>
              ) : (
                <div className="flex items-center justify-center p-3 text-[11px] font-semibold text-white/40 bg-white/5 rounded-2xl border border-white/10">
                  🔒 Accept Lot (No Permission)
                </div>
              )}

              {activePermissions.includes('payment_verification') ? (
                <button
                  onClick={handleProcessDbt}
                  disabled={processingDbt}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-leaf-500 to-emerald-600 px-4 py-3 text-xs font-bold text-white shadow-glow hover:brightness-110 disabled:opacity-60"
                >
                  {processingDbt ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Zap className="h-4 w-4 text-gold-300" />
                  )}
                  {lang === 'te' ? 'తక్షణ DBT జమ' : 'Process DBT Payment'}
                </button>
              ) : (
                <div className="flex items-center justify-center p-3 text-[11px] font-semibold text-white/40 bg-white/5 rounded-2xl border border-white/10">
                  🔒 Process DBT (No Permission)
                </div>
              )}
            </div>
          </div>
        </Reveal>

        {/* Live Queue Panel */}
        <Reveal delay={120}>
          <div className="rounded-5xl glass p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-forest-900">
                {lang === 'te' ? 'లైవ్ క్యూ జాబితా' : 'Live Queue Control'}
              </h3>
              <span className="chip bg-leaf-100 text-leaf-700">
                {queue.length} {lang === 'te' ? 'రైతులు' : 'Waiting'}
              </span>
            </div>

            <div className="relative mt-3 mb-2">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-forest-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={lang === 'te' ? 'రైతు లేదా టోకెన్ శోధించండి…' : 'Search farmer or token…'}
                className="w-full rounded-xl border border-forest-100 bg-white/70 py-1.5 pl-9 pr-3 text-xs font-medium text-forest-800 outline-none placeholder:text-forest-400 focus:border-leaf-400 focus:bg-white"
              />
            </div>

            <div className="mt-4 space-y-2 max-h-[340px] overflow-y-auto pr-1">
              {filteredQueue.map((item, idx) => {
                const isActive = activeFarmer.token === item.token;
                return (
                  <button
                    key={item.token}
                    onClick={() => setActiveTokenIdx(idx)}
                    className={`w-full flex items-center justify-between rounded-3xl p-3.5 text-left transition-all border ${
                      isActive
                        ? 'border-leaf-500 bg-leaf-50/90 ring-2 ring-leaf-400 shadow-sm'
                        : 'border-forest-100 bg-white hover:bg-cream-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display text-base font-extrabold text-forest-900">
                          #{item.token}
                        </span>
                        <span className="font-bold text-forest-800 text-sm">{item.farmer}</span>
                      </div>
                      <p className="text-xs text-forest-500 mt-0.5">
                        {item.crop} • {item.qty} Qtl • {item.time}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${
                        item.status === 'Processing'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : item.status === 'Completed'
                          ? 'bg-leaf-100 text-leaf-700 border border-leaf-300'
                          : 'bg-forest-100 text-forest-700'
                      }`}
                    >
                      {item.status}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </Reveal>
      </div>

      {/* REQUIREMENT #12: STAFF / ADMIN QUALITY CONTROL MANAGEMENT PANEL */}
      <div className="mt-12">
        <Reveal delay={150}>
          <div className="rounded-5xl glass p-6 sm:p-8 border border-forest-100 shadow-glass-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-forest-100 pb-5">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-leaf-600">
                  Authorized Quality Operations
                </span>
                <h2 className="mt-1 font-display text-2xl font-bold text-forest-950">
                  🌾 Quality Checks Management Panel
                </h2>
                <p className="text-xs text-forest-600">
                  Review grain moisture, record quality grades, and issue official procurement approvals.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setView('quality')}
                  className="rounded-2xl bg-forest-900 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-forest-950 transition"
                >
                  View Farmer Quality Page
                </button>
              </div>
            </div>

            {/* Quality Summary Metrics Grid */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="rounded-2xl bg-forest-50 p-4 border border-forest-100">
                <span className="text-[10px] font-bold uppercase text-forest-500">Quality Checks Today</span>
                <p className="font-display text-2xl font-black text-forest-950 mt-1">128</p>
              </div>
              <div className="rounded-2xl bg-leaf-50 p-4 border border-leaf-200">
                <span className="text-[10px] font-bold uppercase text-leaf-700">Passed / Accepted</span>
                <p className="font-display text-2xl font-black text-leaf-800 mt-1">104</p>
              </div>
              <div className="rounded-2xl bg-amber-50 p-4 border border-amber-200">
                <span className="text-[10px] font-bold uppercase text-amber-800">Under Review</span>
                <p className="font-display text-2xl font-black text-amber-900 mt-1">16</p>
              </div>
              <div className="rounded-2xl bg-red-50 p-4 border border-red-200">
                <span className="text-[10px] font-bold uppercase text-red-800">Rejected</span>
                <p className="font-display text-2xl font-black text-red-900 mt-1">8</p>
              </div>
              <div className="col-span-2 sm:col-span-1 rounded-2xl bg-blue-50 p-4 border border-blue-200">
                <span className="text-[10px] font-bold uppercase text-blue-800">Average Moisture</span>
                <p className="font-display text-2xl font-black text-blue-900 mt-1">13.6%</p>
              </div>
            </div>

            {/* Quality Checks Table */}
            <div className="mt-6 overflow-x-auto rounded-3xl border border-forest-100 bg-white/60">
              <table className="w-full text-left text-xs">
                <thead className="bg-forest-900 text-white font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5">Token</th>
                    <th className="p-3.5">Farmer</th>
                    <th className="p-3.5">Crop</th>
                    <th className="p-3.5">Quantity</th>
                    <th className="p-3.5">Moisture</th>
                    <th className="p-3.5">Grade</th>
                    <th className="p-3.5">Decision Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-forest-100 font-medium">
                  {qualityReportsList.map((rec) => (
                    <tr key={rec.id} className="hover:bg-cream-50/70 transition">
                      <td className="p-3.5 font-bold font-mono text-forest-900">#{rec.tokenId}</td>
                      <td className="p-3.5 font-bold text-forest-900">{rec.farmerName}</td>
                      <td className="p-3.5 text-forest-700">{rec.crop}</td>
                      <td className="p-3.5 text-forest-700">{rec.quantityQuintals} Q</td>
                      <td className="p-3.5 font-bold">
                        <span className={rec.moisturePct <= 14.0 ? 'text-leaf-700' : 'text-red-600'}>
                          {rec.moisturePct}%
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-forest-900">{rec.qualityGrade}</td>
                      <td className="p-3.5">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                            rec.decision === 'accepted'
                              ? 'bg-leaf-100 text-leaf-800 border border-leaf-300'
                              : rec.decision === 'rejected'
                              ? 'bg-red-100 text-red-800 border border-red-300'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}
                        >
                          {rec.decision.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-1.5">
                        <button
                          onClick={() => {
                            setSelectedQualityToken(rec.tokenId);
                            setEditingMoisture(rec.moisturePct);
                            setEditingGrade(rec.qualityGrade);
                          }}
                          className="rounded-xl bg-forest-100 px-3 py-1.5 text-[11px] font-bold text-forest-800 hover:bg-forest-200 transition"
                        >
                          Open Check / Edit
                        </button>
                        <button
                          onClick={() => {
                            const res = verifyQualityByStaff(rec.id, 'accepted');
                            setToastMsg(res.message);
                            setTimeout(() => setToastMsg(null), 4000);
                          }}
                          className="rounded-xl bg-leaf-500 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm hover:bg-leaf-600 transition"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            const res = verifyQualityByStaff(rec.id, 'rejected', 'Moisture level 17.8% exceeds limits');
                            setToastMsg(res.message);
                            setTimeout(() => setToastMsg(null), 4000);
                          }}
                          className="rounded-xl bg-red-100 px-3 py-1.5 text-[11px] font-bold text-red-700 hover:bg-red-200 transition"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Staff Edit Quality Measurement Modal */}
      {selectedQualityToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-4xl bg-white p-6 shadow-2xl border border-forest-100 animate-scale-in">
            <h3 className="font-display text-lg font-bold text-forest-950">
              Update Quality Check — Token #{selectedQualityToken}
            </h3>
            <p className="text-xs text-forest-600 mt-1">
              Enter official weighbridge moisture sensor readings and quality grade.
            </p>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-forest-900 block mb-1">Measured Grain Moisture (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={editingMoisture}
                  onChange={(e) => setEditingMoisture(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl border border-forest-200 p-2.5 font-bold outline-none focus:border-leaf-500"
                />
              </div>

              <div>
                <label className="font-bold text-forest-900 block mb-1">Assigned Quality Grade</label>
                <select
                  value={editingGrade}
                  onChange={(e) => setEditingGrade(e.target.value)}
                  className="w-full rounded-xl border border-forest-200 p-2.5 font-bold outline-none focus:border-leaf-500"
                >
                  <option value="Grade A">Grade A (Superior)</option>
                  <option value="Common Grade">Common Grade</option>
                  <option value="Grade B">Grade B</option>
                  <option value="Under Review">Under Review</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedQualityToken(null)}
                className="rounded-xl bg-forest-100 px-4 py-2 text-xs font-bold text-forest-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const res = updateQualityMeasurements(selectedQualityToken, editingMoisture, editingGrade);
                  setToastMsg(res.message);
                  setSelectedQualityToken(null);
                  setTimeout(() => setToastMsg(null), 4000);
                }}
                className="btn-gold text-xs shadow-md"
              >
                Save Measurements
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
