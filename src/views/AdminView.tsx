import { useState } from 'react';
import {
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Layers,
  Zap,
  Clock,
  ShieldCheck,
  Users,
  UserCheck,
  Shield,
  Building2,
  Ticket,
  Award,
  CreditCard,
  BarChart3,
  Settings as SettingsIcon,
  Search,
  Filter,
  Plus,
  Download,
  FileText,
} from 'lucide-react';
import { useApp, formatRupee } from '@/lib/app-context';
import { Reveal } from '@/components/Reveal';
import { AnalyticsView } from './AnalyticsView';
import { ALL_STAFF_PERMISSIONS, type StaffRegistrationRequest } from '@/lib/auth-service';

export function AdminView() {
  const {
    lang,
    setUserRole,
    setView,
    profilesList,
    staffRequestsList,
    staffPermissionsMap,
    systemAuditLogs,
    approveStaffRequest,
    rejectStaffRequest,
    suspendStaffAccount,
    reactivateStaffAccount,
    updateStaffPermissions,
    smartTokensList,
    callNextQueueToken,
    paymentsList,
    qualityReportsList,
    verifyQualityByStaff,
    processPayout,
  } = useApp();

  const [dateFilter, setDateFilter] = useState<'today' | '7d' | '30d' | '1y'>('30d');
  const [adminSection, setAdminSection] = useState<'dashboard' | 'farmers' | 'staff' | 'permissions' | 'procurement' | 'queue' | 'quality' | 'payments' | 'reports' | 'settings'>('dashboard');
  const [alertApplied, setAlertApplied] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Farmers Management local state
  const [farmerSearch, setFarmerSearch] = useState('');
  const [farmerPriorityFilter, setFarmerPriorityFilter] = useState<string>('all');
  const [farmerPriorityOverrides, setFarmerPriorityOverrides] = useState<Record<string, 'P0' | 'P1' | 'P2' | 'P3'>>({
    'f-101': 'P1',
    'f-102': 'P2',
    'f-103': 'P0',
  });

  // Staff Management State
  const [staffTab, setStaffTab] = useState<'pending' | 'approved' | 'suspended' | 'rejected' | 'audit_logs'>('pending');
  const [selectedStaffDetails, setSelectedStaffDetails] = useState<StaffRegistrationRequest | null>(null);
  const [approveConfirmReq, setApproveConfirmReq] = useState<StaffRegistrationRequest | null>(null);
  const [rejectModalReq, setRejectModalReq] = useState<StaffRegistrationRequest | null>(null);
  const [suspendModalUserId, setSuspendModalUserId] = useState<string | null>(null);
  const [managingPermissionsUserId, setManagingPermissionsUserId] = useState<string | null>(null);
  const [rejectionReasonText, setRejectionReasonText] = useState('');

  // Queue Management state
  const [tokenPriorityFilter, setTokenPriorityFilter] = useState<string>('all');
  const [queueSearch, setQueueSearch] = useState('');
  const [tokenPriorityBoosts, setTokenPriorityBoosts] = useState<Record<string, string>>({});
  const [consecutivePreview, setConsecutivePreview] = useState<{ center: string; token1: string; token2: string } | null>(null);

  // Quality Management state
  const [moistureThreshold, setMoistureThreshold] = useState<number>(14.0);

  // Procurement Centers local state
  const [centersList, setCentersList] = useState([
    { id: 'c-1', name: 'Vijayawada Central Procurement Hub', district: 'Krishna', capacityPct: 92, activeCounters: 4, dailyIntake: '420 Quintals', status: 'congested' },
    { id: 'c-2', name: 'Guntur Regional Procurement Center', district: 'Guntur', capacityPct: 45, activeCounters: 6, dailyIntake: '680 Quintals', status: 'optimal' },
    { id: 'c-3', name: 'Eluru Grain Procurement Station', district: 'West Godavari', capacityPct: 62, activeCounters: 3, dailyIntake: '310 Quintals', status: 'optimal' },
    { id: 'c-4', name: 'Kurnool Commercial Cotton Center', district: 'Kurnool', capacityPct: 38, activeCounters: 5, dailyIntake: '540 Quintals', status: 'optimal' },
    { id: 'c-5', name: 'Visakhapatnam Paddy Depot', district: 'Visakhapatnam', capacityPct: 51, activeCounters: 4, dailyIntake: '390 Quintals', status: 'optimal' },
  ]);
  const [showAddCenterModal, setShowAddCenterModal] = useState(false);
  const [newCenterName, setNewCenterName] = useState('');
  const [newCenterDistrict, setNewCenterDistrict] = useState('Krishna');

  // Settings State
  const [settingsConfig, setSettingsConfig] = useState({
    elderlyAutoPriority: true,
    smallholderExpress: true,
    surgeAutoRebalance: true,
    smsNotifications: true,
    mfaEnforced: true,
  });

  const pendingStaffRequests = staffRequestsList.filter((r) => r.status === 'pending');
  const approvedStaffRequests = staffRequestsList.filter((r) => r.status === 'approved');
  const suspendedStaffRequests = staffRequestsList.filter((r) => r.status === 'suspended');
  const rejectedStaffRequests = staffRequestsList.filter((r) => r.status === 'rejected');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4500);
  };

  const handleApplyRecommendation = () => {
    setAlertApplied(true);
    setCentersList((prev) =>
      prev.map((c) =>
        c.id === 'c-1' ? { ...c, capacityPct: 68, status: 'optimal' } : c.id === 'c-2' ? { ...c, capacityPct: 64 } : c
      )
    );
    showToast(
      lang === 'te'
        ? 'AI సిఫార్సు అమలు చేయబడింది — 18 మంది రైతులు గుంటూరు కొనుగోలు కేంద్రానికి మళ్లించబడ్డారు!'
        : lang === 'hi'
        ? 'AI सुझाव लागू — 18 किसानों को गुंटूर खरीद केंद्र पर पुनर्निर्देशित किया गया!'
        : 'AI Recommendation Applied — 18 upcoming farmers redirected to Guntur Center!'
    );
  };

  // Helper to trigger consecutive token generation demo
  const handleSimulateConsecutiveTokens = () => {
    const center = 'Guntur Procurement Center';
    const num1 = 'GNT-' + Math.floor(100 + Math.random() * 800);
    const num2 = 'GNT-' + (parseInt(num1.split('-')[1], 10) + 1);
    setConsecutivePreview({ center, token1: num1, token2: num2 });
    showToast(`⚡ Consecutive Tokens Generated: ${num1} and ${num2} for ${center}! Synced in real-time across tabs & mobiles.`);
  };

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-28 lg:px-8 lg:pb-12">
      {/* Toast Alert */}
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
              <Layers className="h-3.5 w-3.5" /> {lang === 'te' ? 'రాష్ట్ర స్థాయి కంట్రోల్ హబ్' : lang === 'hi' ? 'राज्य स्तरीय एडमिन कंट्रोल' : 'State Executive Admin Control'}
            </span>
            <h1 className="mt-2 display-heading text-3xl sm:text-4xl">
              {lang === 'te' ? 'అడ్మిన్ అనలిటిక్స్ & కొనుగోలు నిర్వహణ' : lang === 'hi' ? 'एडमिन एनालिटिक्स एवं खरीद नियंत्रण' : 'Platform Operations & Intelligence'}
            </h1>
            <p className="mt-1 text-forest-600">
              {lang === 'te'
                ? 'రాష్ట్రవ్యాప్త కొనుగోలు కేంద్రాల పనితీరు, నిధుల జమ పురోగతి మరియు రద్దీ విశ్లేషణను పర్యవేక్షించండి.'
                : lang === 'hi'
                ? 'राज्यव्यापी खरीद केंद्रों के प्रदर्शन, निधि वितरण और लाइव कतार नियंत्रण की निगरानी करें।'
                : 'Monitor statewide center capacity, real-time volume intake, DBT disbursal speed, and priority routing.'}
            </p>
          </div>

          {/* Date Filter selector */}
          <div className="flex gap-1 rounded-2xl glass p-1.5 shrink-0 border border-forest-100">
            {(['today', '7d', '30d', '1y'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setDateFilter(f)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                  dateFilter === f
                    ? 'bg-forest-900 text-white shadow-sm'
                    : 'text-forest-700 hover:bg-cream-100'
                }`}
              >
                {f === 'today'
                  ? (lang === 'te' ? 'ఈ రోజు' : lang === 'hi' ? 'आज' : 'Today')
                  : f === '7d'
                  ? (lang === 'te' ? '7 రోజులు' : lang === 'hi' ? '7 दिन' : '7 Days')
                  : f === '30d'
                  ? (lang === 'te' ? '30 రోజులు' : lang === 'hi' ? '30 दिन' : '30 Days')
                  : (lang === 'te' ? '1 సంవత్సరం' : lang === 'hi' ? '1 वर्ष' : '1 Year')}
              </button>
            ))}
          </div>
        </div>
      </Reveal>

      {/* 10-SECTION ADMIN PORTAL SIDEBAR / NAVIGATION TABS */}
      <Reveal delay={90}>
        <div className="mt-6 flex overflow-x-auto scrollbar-hide rounded-3xl glass p-2 border border-forest-100 gap-1 text-xs font-bold">
          {[
            { id: 'dashboard', label: '📊 Dashboard', icon: BarChart3 },
            { id: 'farmers', label: '🌾 Farmers', icon: Users },
            { id: 'staff', label: `👨‍💼 Staff (${pendingStaffRequests.length})`, icon: UserCheck },
            { id: 'permissions', label: '🔑 Permissions', icon: Shield },
            { id: 'procurement', label: '🏬 Procurement', icon: Building2 },
            { id: 'queue', label: '🎟️ Queue System', icon: Ticket },
            { id: 'quality', label: '🔬 Quality Lab', icon: Award },
            { id: 'payments', label: '💳 Payouts & DBT', icon: CreditCard },
            { id: 'reports', label: '📈 Reports', icon: FileText },
            { id: 'settings', label: '⚙️ Settings', icon: SettingsIcon },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setAdminSection(item.id as typeof adminSection)}
              className={`rounded-2xl px-4 py-2.5 whitespace-nowrap transition-all flex items-center gap-2 ${
                adminSection === item.id
                  ? 'bg-forest-900 text-white shadow-glow-sm scale-[1.02]'
                  : 'text-forest-700 hover:bg-white/80 hover:text-forest-950'
              }`}
            >
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </Reveal>

      {/* Smart Alert System Banner */}
      <Reveal delay={80}>
        <div className={`mt-6 rounded-4xl p-6 text-white transition-all shadow-glass ${
          alertApplied
            ? 'bg-gradient-to-r from-forest-800 to-forest-900 border border-leaf-400/30'
            : 'bg-gradient-to-br from-red-500 via-red-600 to-amber-600 shadow-[0_20px_50px_rgba(239,68,68,0.3)]'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/20 backdrop-blur">
                {alertApplied ? <CheckCircle2 className="h-6 w-6 text-leaf-300" /> : <AlertTriangle className="h-6 w-6 text-white animate-pulse" />}
              </span>
              <div>
                <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-gold-300">
                  <Zap className="h-4 w-4" />
                  {alertApplied
                    ? (lang === 'te' ? 'AI సిఫార్సు విజయవంతంగా వర్తించబడింది' : lang === 'hi' ? 'AI सुझाव लागू' : 'AI Recommendation Applied')
                    : (lang === 'te' ? '🔴 అధిక రద్దీ హెచ్చరిక — విజయవాడ కొనుగోలు కేంద్రం' : lang === 'hi' ? '🔴 उच्च भीड़ चेतावनी — विजयवाड़ा केंद्र' : '🔴 High Crowd Alert — Vijayawada Center')}
                </p>
                <h3 className="mt-1 font-display text-xl font-bold text-white">
                  {alertApplied
                    ? (lang === 'te' ? 'క్యూ లోడ్ విజయవంతంగా సర్దుబాటు చేయబడింది' : lang === 'hi' ? 'कतार भार संतुलित' : 'Queue Load Successfully Rebalanced Across Regional Centers')
                    : (lang === 'te' ? 'విజయవాడ కేంద్రం 92% గరిష్ట సామర్థ్యానికి చేరుకుంది (52 మంది రైతులు వేచి ఉన్నారు).' : lang === 'hi' ? 'विजयवाड़ा केंद्र 92% क्षमता पर (52 किसान प्रतीक्षारत)।' : 'Vijayawada Center is approaching 92% capacity (52 farmers waiting).')}
                </h3>
                <p className="mt-1 text-xs text-white/80">
                  {alertApplied
                    ? (lang === 'te' ? '18 మంది రైతుల రాక గుంటూరు కేంద్రానికి మళ్లించబడింది. సగటు వేచియుండే సమయం 22 నిమిషాలకు తగ్గింది.' : lang === 'hi' ? '18 किसानों को गुंटूर भेजा गया। औसत प्रतीक्षा समय घटकर 22 मिनट हुआ।' : 'Redirected 18 upcoming farmers to Guntur Center. Average waiting time reduced to 22 mins.')
                    : (lang === 'te' ? 'AI సూచన: రాబోయే 18 మంది రైతులను సమీపంలోని గుంటూరు కేంద్రానికి మళ్లించండి.' : lang === 'hi' ? 'AI सुझाव: 18 किसानों को पास के गुंटूर केंद्र पर पुनर्निर्देशित करें।' : 'AI Recommendation: Redirect 18 upcoming farmers to nearby Guntur Center.')}
                </p>
              </div>
            </div>

            {!alertApplied && (
              <button
                onClick={handleApplyRecommendation}
                className="btn-gold shrink-0 text-sm shadow-lg"
              >
                <Sparkles className="h-4 w-4" />
                {lang === 'te' ? 'AI సిఫార్సు వర్తింపజేయండి' : lang === 'hi' ? 'AI सुझाव लागू करें' : 'Apply AI Recommendation'}
              </button>
            )}
          </div>
        </div>
      </Reveal>

      {/* Quick Action Navigation Buttons */}
      <Reveal delay={90}>
        <div className="mt-6 flex flex-wrap border-b border-forest-100 pb-3 gap-3">
          <button
            onClick={() => setUserRole('admin')}
            className="flex items-center gap-2 rounded-2xl bg-forest-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-forest-800 transition"
          >
            📊 {lang === 'te' ? 'ప్లాట్‌ఫారమ్ విశ్లేషణలు' : 'Platform Analytics'}
          </button>
          <button
            onClick={() => setView('payment')}
            className="flex items-center gap-2 rounded-2xl bg-leaf-500 px-4 py-2.5 text-xs font-bold text-white shadow-glow hover:bg-leaf-600 transition"
          >
            💳 {lang === 'te' ? 'రైతు మద్దతు ధర చెల్లింపుల నియంత్రణ' : 'Farmer Payouts & Audit Logs'}
          </button>
          <button
            onClick={handleSimulateConsecutiveTokens}
            className="flex items-center gap-2 rounded-2xl bg-purple-700 px-4 py-2.5 text-xs font-bold text-white shadow-glow hover:bg-purple-800 transition"
          >
            ⚡ Test Consecutive Queue Generator
          </button>
        </div>
      </Reveal>

      {/* ======================================================================== */}
      {/* SECTION 1: DASHBOARD                                                     */}
      {/* ======================================================================== */}
      {adminSection === 'dashboard' && (
        <div className="mt-8 space-y-6">
          <AnalyticsView />
        </div>
      )}

      {/* ======================================================================== */}
      {/* SECTION 2: FARMERS MANAGEMENT                                             */}
      {/* ======================================================================== */}
      {adminSection === 'farmers' && (
        <div className="mt-8 space-y-6">
          <Reveal delay={100}>
            <div className="rounded-5xl glass p-6 sm:p-8 border border-forest-100 shadow-glass-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-forest-100 pb-5">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-forest-700 flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-leaf-600" /> State Farmer Master Registry
                  </span>
                  <h2 className="mt-1 font-display text-2xl font-bold text-forest-950">
                    🌾 Registered Farmers & Priority Routing Management
                  </h2>
                  <p className="text-xs text-forest-600">
                    Manage farmer profiles, update priority status (Emergency P0, VIP P1, Smallholder P2), and view land validation.
                  </p>
                </div>
              </div>

              {/* Priority & Search Filters */}
              <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-3 h-4 w-4 text-forest-400" />
                  <input
                    type="text"
                    value={farmerSearch}
                    onChange={(e) => setFarmerSearch(e.target.value)}
                    placeholder="Search farmer by name, phone, district, or Kisan Card ID..."
                    className="w-full rounded-2xl border border-forest-200 bg-white/80 pl-10 pr-4 py-2.5 text-xs font-medium text-forest-900 outline-none focus:border-forest-800 focus:ring-2 focus:ring-forest-800/10"
                  />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto text-xs">
                  <span className="text-forest-500 font-bold flex items-center gap-1">
                    <Filter className="h-3.5 w-3.5" /> Priority Filter:
                  </span>
                  {[
                    { id: 'all', label: 'All Farmers' },
                    { id: 'P0', label: '🚨 Emergency (P0)' },
                    { id: 'P1', label: '⭐ VIP / Elderly (P1)' },
                    { id: 'P2', label: '🌱 Smallholder (P2)' },
                    { id: 'P3', label: 'Standard (P3)' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFarmerPriorityFilter(f.id)}
                      className={`rounded-xl px-3 py-1.5 font-bold transition whitespace-nowrap ${
                        farmerPriorityFilter === f.id
                          ? 'bg-forest-900 text-white shadow-sm'
                          : 'bg-forest-100/70 text-forest-800 hover:bg-forest-200'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Farmers Table */}
              <div className="mt-6 overflow-x-auto rounded-3xl border border-forest-100 bg-white/70">
                <table className="w-full text-left text-xs">
                  <thead className="bg-forest-900 text-white font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3.5">Farmer & ID</th>
                      <th className="p-3.5">Contact</th>
                      <th className="p-3.5">Location</th>
                      <th className="p-3.5">Land & Crop</th>
                      <th className="p-3.5">Priority Status</th>
                      <th className="p-3.5 text-right">Actions & Priority Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-forest-100 font-medium">
                    {profilesList
                      .filter((p) => p.role === 'farmer')
                      .filter((p) => {
                        const matchesSearch =
                          p.fullName.toLowerCase().includes(farmerSearch.toLowerCase()) ||
                          (p.phone && p.phone.includes(farmerSearch)) ||
                          (p.kisanCardId && p.kisanCardId.toLowerCase().includes(farmerSearch.toLowerCase()));
                        const priority = farmerPriorityOverrides[p.id] || (p.landAcres && p.landAcres < 3 ? 'P2' : 'P3');
                        const matchesPriority = farmerPriorityFilter === 'all' || priority === farmerPriorityFilter;
                        return matchesSearch && matchesPriority;
                      })
                      .map((f) => {
                        const priority = farmerPriorityOverrides[f.id] || (f.landAcres && f.landAcres < 3 ? 'P2' : 'P3');
                        return (
                          <tr key={f.id} className="hover:bg-cream-50/70 transition">
                            <td className="p-3.5">
                              <span className="font-bold text-forest-950 text-sm block">{f.fullName}</span>
                              <span className="font-mono text-[11px] text-forest-500">{f.kisanCardId || f.id}</span>
                            </td>
                            <td className="p-3.5 text-forest-700">
                              <div>{f.phone || 'N/A'}</div>
                              <div className="text-[11px] text-forest-400">{f.email || 'No email registered'}</div>
                            </td>
                            <td className="p-3.5 text-forest-700">
                              <span className="font-semibold">{f.village || 'Guntur Rural'}</span>
                              <div className="text-[11px] text-forest-500">{f.district || 'Guntur'}</div>
                            </td>
                            <td className="p-3.5 text-forest-700">
                              <span className="font-bold text-forest-900">{f.landAcres || 4.5} Acres</span>
                              <div className="text-[11px] text-leaf-700 font-semibold">{f.primaryCrop || 'Paddy (Grade A)'}</div>
                            </td>
                            <td className="p-3.5">
                              {priority === 'P0' && (
                                <span className="chip bg-rose-100 text-rose-800 font-extrabold text-[10px] border border-rose-300">
                                  🚨 Emergency P0
                                </span>
                              )}
                              {priority === 'P1' && (
                                <span className="chip bg-amber-100 text-amber-900 font-extrabold text-[10px] border border-amber-300">
                                  ⭐ VIP / Elderly P1
                                </span>
                              )}
                              {priority === 'P2' && (
                                <span className="chip bg-leaf-100 text-leaf-800 font-extrabold text-[10px] border border-leaf-300">
                                  🌱 Smallholder P2
                                </span>
                              )}
                              {priority === 'P3' && (
                                <span className="chip bg-slate-100 text-slate-700 font-semibold text-[10px] border border-slate-300">
                                  Standard P3
                                </span>
                              )}
                            </td>
                            <td className="p-3.5 text-right space-x-1">
                              <button
                                onClick={() => {
                                  const nextP = priority === 'P0' ? 'P3' : priority === 'P3' ? 'P2' : priority === 'P2' ? 'P1' : 'P0';
                                  setFarmerPriorityOverrides((prev) => ({ ...prev, [f.id]: nextP }));
                                  showToast(`Updated ${f.fullName}'s priority level to ${nextP}`);
                                }}
                                className="rounded-xl bg-forest-900 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm hover:bg-forest-800"
                              >
                                ⚡ Toggle Priority ({priority})
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </Reveal>
        </div>
      )}

      {/* ======================================================================== */}
      {/* SECTION 3: STAFF APPROVAL & PERMISSION MANAGEMENT                         */}
      {/* ======================================================================== */}
      {adminSection === 'staff' && (
        <div className="mt-8 space-y-6">
          <Reveal delay={110}>
            <div className="rounded-5xl glass p-6 sm:p-8 border border-forest-100 shadow-glass-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-forest-100 pb-5">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4" /> System Administrative Authorization
                  </span>
                  <h2 className="mt-1 font-display text-2xl font-bold text-forest-950">
                    👨‍💼 Staff Approval & Authorization Management
                  </h2>
                  <p className="text-xs text-forest-600">
                    Review staff registration requests, issue portal approvals, manage staff permissions, and enforce suspensions.
                  </p>
                </div>

                {pendingStaffRequests.length > 0 && (
                  <div className="flex items-center gap-2 rounded-2xl bg-amber-500/10 border border-amber-400/40 px-4 py-2 text-amber-800 text-xs font-bold animate-pulse">
                    <Clock className="h-4 w-4 text-amber-600" />
                    <span>🔔 {pendingStaffRequests.length} staff registrations waiting for approval</span>
                  </div>
                )}
              </div>

              {/* Staff KPI Badges */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={() => setStaffTab('pending')}
                  className={`rounded-3xl p-4 text-left border transition ${
                    staffTab === 'pending'
                      ? 'bg-amber-100/80 border-amber-400 ring-2 ring-amber-400'
                      : 'bg-amber-50/60 border-amber-200 hover:bg-amber-100/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800">Pending Requests</span>
                    <span className="grid h-7 w-7 place-items-center rounded-xl bg-amber-500 text-white font-bold text-xs shadow-sm">
                      {pendingStaffRequests.length}
                    </span>
                  </div>
                  <p className="font-display text-2xl font-black text-amber-950 mt-2">{pendingStaffRequests.length}</p>
                </button>

                <button
                  onClick={() => setStaffTab('approved')}
                  className={`rounded-3xl p-4 text-left border transition ${
                    staffTab === 'approved'
                      ? 'bg-leaf-100/80 border-leaf-400 ring-2 ring-leaf-400'
                      : 'bg-leaf-50/60 border-leaf-200 hover:bg-leaf-100/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-leaf-800">Approved Staff</span>
                    <span className="grid h-7 w-7 place-items-center rounded-xl bg-leaf-500 text-white font-bold text-xs shadow-sm">
                      {approvedStaffRequests.length}
                    </span>
                  </div>
                  <p className="font-display text-2xl font-black text-leaf-950 mt-2">{approvedStaffRequests.length}</p>
                </button>

                <button
                  onClick={() => setStaffTab('suspended')}
                  className={`rounded-3xl p-4 text-left border transition ${
                    staffTab === 'suspended'
                      ? 'bg-orange-100/80 border-orange-400 ring-2 ring-orange-400'
                      : 'bg-orange-50/60 border-orange-200 hover:bg-orange-100/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-800">Suspended Staff</span>
                    <span className="grid h-7 w-7 place-items-center rounded-xl bg-orange-500 text-white font-bold text-xs shadow-sm">
                      {suspendedStaffRequests.length}
                    </span>
                  </div>
                  <p className="font-display text-2xl font-black text-orange-950 mt-2">{suspendedStaffRequests.length}</p>
                </button>

                <button
                  onClick={() => setStaffTab('rejected')}
                  className={`rounded-3xl p-4 text-left border transition ${
                    staffTab === 'rejected'
                      ? 'bg-rose-100/80 border-rose-400 ring-2 ring-rose-400'
                      : 'bg-rose-50/60 border-rose-200 hover:bg-rose-100/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-800">Rejected Requests</span>
                    <span className="grid h-7 w-7 place-items-center rounded-xl bg-rose-500 text-white font-bold text-xs shadow-sm">
                      {rejectedStaffRequests.length}
                    </span>
                  </div>
                  <p className="font-display text-2xl font-black text-rose-950 mt-2">{rejectedStaffRequests.length}</p>
                </button>
              </div>

              {/* Navigation Tabs for Staff Sub-Views */}
              <div className="mt-6 flex border-b border-forest-100 pb-2 gap-2 overflow-x-auto text-xs">
                <button
                  onClick={() => setStaffTab('pending')}
                  className={`px-4 py-2 font-bold rounded-xl transition ${
                    staffTab === 'pending' ? 'bg-forest-900 text-white' : 'text-forest-700 hover:bg-forest-100'
                  }`}
                >
                  🟡 Pending Requests ({pendingStaffRequests.length})
                </button>
                <button
                  onClick={() => setStaffTab('approved')}
                  className={`px-4 py-2 font-bold rounded-xl transition ${
                    staffTab === 'approved' ? 'bg-forest-900 text-white' : 'text-forest-700 hover:bg-forest-100'
                  }`}
                >
                  🟢 Approved Staff ({approvedStaffRequests.length})
                </button>
                <button
                  onClick={() => setStaffTab('suspended')}
                  className={`px-4 py-2 font-bold rounded-xl transition ${
                    staffTab === 'suspended' ? 'bg-forest-900 text-white' : 'text-forest-700 hover:bg-forest-100'
                  }`}
                >
                  🟠 Suspended ({suspendedStaffRequests.length})
                </button>
                <button
                  onClick={() => setStaffTab('rejected')}
                  className={`px-4 py-2 font-bold rounded-xl transition ${
                    staffTab === 'rejected' ? 'bg-forest-900 text-white' : 'text-forest-700 hover:bg-forest-100'
                  }`}
                >
                  🔴 Rejected ({rejectedStaffRequests.length})
                </button>
                <button
                  onClick={() => setStaffTab('audit_logs')}
                  className={`px-4 py-2 font-bold rounded-xl transition ${
                    staffTab === 'audit_logs' ? 'bg-purple-900 text-white' : 'text-purple-700 hover:bg-purple-100'
                  }`}
                >
                  📜 System Audit Logs
                </button>
              </div>

              {/* STAFF PENDING REQUESTS */}
              {staffTab === 'pending' && (
                <div className="mt-6 space-y-4">
                  {pendingStaffRequests.length === 0 ? (
                    <div className="text-center py-12 rounded-3xl border border-dashed border-forest-200 bg-white/40">
                      <CheckCircle2 className="h-10 w-10 text-leaf-500 mx-auto" />
                      <p className="font-display text-base font-bold text-forest-900 mt-2">No Pending Staff Requests</p>
                      <p className="text-xs text-forest-500">All staff registration applications have been verified and processed.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {pendingStaffRequests.map((req) => (
                        <div key={req.id} className="rounded-3xl border border-amber-300/60 bg-amber-50/40 p-5 shadow-sm space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="font-mono text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                                {req.staffId}
                              </span>
                              <h4 className="font-display text-lg font-bold text-forest-950 mt-1">{req.fullName}</h4>
                              <p className="text-xs text-forest-600">{req.designation} • {req.department}</p>
                            </div>
                            <span className="chip bg-amber-100 text-amber-900 font-extrabold text-[10px] border border-amber-300">
                              🟡 Pending Approval
                            </span>
                          </div>

                          <div className="rounded-2xl bg-white p-3 text-xs space-y-1.5 border border-forest-100">
                            <div className="flex justify-between">
                              <span className="text-forest-500">Official Email:</span>
                              <span className="font-semibold text-forest-900">{req.officialEmail}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-forest-500">Phone:</span>
                              <span className="font-semibold text-forest-900">{req.phone}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-forest-500">Assigned Center:</span>
                              <span className="font-semibold text-forest-900">{req.procurementCenter}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-2">
                            <button
                              onClick={() => setSelectedStaffDetails(req)}
                              className="rounded-xl bg-forest-100 px-3 py-1.5 text-[11px] font-bold text-forest-800 hover:bg-forest-200"
                            >
                              View Details
                            </button>
                            <button
                              onClick={() => setApproveConfirmReq(req)}
                              className="rounded-xl bg-leaf-500 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm hover:bg-leaf-600"
                            >
                              ✓ APPROVE
                            </button>
                            <button
                              onClick={() => setRejectModalReq(req)}
                              className="rounded-xl bg-rose-100 px-3 py-1.5 text-[11px] font-bold text-rose-700 hover:bg-rose-200"
                            >
                              ✕ REJECT
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* STAFF APPROVED */}
              {staffTab === 'approved' && (
                <div className="mt-6 overflow-x-auto rounded-3xl border border-forest-100 bg-white/60">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-forest-900 text-white font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-3.5">Staff ID</th>
                        <th className="p-3.5">Name</th>
                        <th className="p-3.5">Email & Phone</th>
                        <th className="p-3.5">Department</th>
                        <th className="p-3.5">Procurement Center</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-forest-100 font-medium">
                      {approvedStaffRequests.map((req) => (
                        <tr key={req.id} className="hover:bg-cream-50/70 transition">
                          <td className="p-3.5 font-bold font-mono text-forest-900">{req.staffId}</td>
                          <td className="p-3.5 font-bold text-forest-900">{req.fullName}</td>
                          <td className="p-3.5 text-forest-700">
                            <div>{req.officialEmail}</div>
                            <div className="text-[11px] text-forest-500">{req.phone}</div>
                          </td>
                          <td className="p-3.5 text-forest-700">{req.department}</td>
                          <td className="p-3.5 text-forest-700">{req.procurementCenter}</td>
                          <td className="p-3.5">
                            <span className="chip bg-leaf-100 text-leaf-800 font-extrabold text-[10px] border border-leaf-300">
                              🟢 APPROVED
                            </span>
                          </td>
                          <td className="p-3.5 text-right space-x-1.5">
                            <button
                              onClick={() => setManagingPermissionsUserId(req.userId)}
                              className="rounded-xl bg-purple-100 px-3 py-1.5 text-[11px] font-bold text-purple-900 hover:bg-purple-200"
                            >
                              Permissions
                            </button>
                            <button
                              onClick={() => setSuspendModalUserId(req.userId)}
                              className="rounded-xl bg-orange-100 px-3 py-1.5 text-[11px] font-bold text-orange-800 hover:bg-orange-200"
                            >
                              Suspend
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* STAFF SUSPENDED */}
              {staffTab === 'suspended' && (
                <div className="mt-6 overflow-x-auto rounded-3xl border border-forest-100 bg-white/60">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-forest-900 text-white font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-3.5">Staff ID</th>
                        <th className="p-3.5">Name</th>
                        <th className="p-3.5">Email</th>
                        <th className="p-3.5">Suspension Reason</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-forest-100 font-medium">
                      {suspendedStaffRequests.map((req) => (
                        <tr key={req.id} className="hover:bg-cream-50/70 transition">
                          <td className="p-3.5 font-bold font-mono text-forest-900">{req.staffId}</td>
                          <td className="p-3.5 font-bold text-forest-900">{req.fullName}</td>
                          <td className="p-3.5 text-forest-700">{req.officialEmail}</td>
                          <td className="p-3.5 text-rose-700 font-bold">{req.rejectionReason || 'Suspended by Admin'}</td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={async () => {
                                const res = await reactivateStaffAccount(req.userId);
                                showToast(res.message);
                              }}
                              className="rounded-xl bg-leaf-500 px-3.5 py-1.5 text-[11px] font-bold text-white shadow-sm hover:bg-leaf-600"
                            >
                              Reactivate Staff
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* STAFF REJECTED */}
              {staffTab === 'rejected' && (
                <div className="mt-6 overflow-x-auto rounded-3xl border border-forest-100 bg-white/60">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-forest-900 text-white font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-3.5">Staff ID</th>
                        <th className="p-3.5">Name</th>
                        <th className="p-3.5">Official Email</th>
                        <th className="p-3.5">Rejection Reason</th>
                        <th className="p-3.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-forest-100 font-medium">
                      {rejectedStaffRequests.map((req) => (
                        <tr key={req.id} className="hover:bg-cream-50/70 transition">
                          <td className="p-3.5 font-bold font-mono text-forest-900">{req.staffId}</td>
                          <td className="p-3.5 font-bold text-forest-900">{req.fullName}</td>
                          <td className="p-3.5 text-forest-700">{req.officialEmail}</td>
                          <td className="p-3.5 text-rose-700 font-bold">{req.rejectionReason}</td>
                          <td className="p-3.5">
                            <span className="chip bg-rose-100 text-rose-800 font-extrabold text-[10px] border border-rose-300">
                              🔴 REJECTED
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* STAFF AUDIT LOGS */}
              {staffTab === 'audit_logs' && (
                <div className="mt-6 space-y-3">
                  {systemAuditLogs.map((log) => (
                    <div key={log.id} className="rounded-2xl border border-forest-100 bg-white/80 p-4 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="chip bg-purple-100 text-purple-900 font-bold text-[10px]">
                            {log.action}
                          </span>
                          <span className="font-bold text-forest-900">{log.targetUserName}</span>
                        </div>
                        {log.reason && (
                          <p className="text-forest-600 mt-1 italic">Reason: "{log.reason}"</p>
                        )}
                        <p className="text-[11px] text-forest-500 mt-0.5">By {log.userName} ({log.userRole})</p>
                      </div>
                      <span className="text-[11px] font-semibold text-forest-400 shrink-0">{log.timeStr}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Reveal>
        </div>
      )}

      {/* ======================================================================== */}
      {/* SECTION 4: PERMISSIONS & AUTHORIZATION MATRIX                             */}
      {/* ======================================================================== */}
      {adminSection === 'permissions' && (
        <div className="mt-8 space-y-6">
          <Reveal delay={100}>
            <div className="rounded-5xl glass p-6 sm:p-8 border border-forest-100 shadow-glass-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-forest-100 pb-5">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 flex items-center gap-1.5">
                    <Shield className="h-4 w-4" /> Role-Based Access Control (RBAC)
                  </span>
                  <h2 className="mt-1 font-display text-2xl font-bold text-forest-950">
                    🔑 Security Authorization & Role Hierarchy Matrix
                  </h2>
                  <p className="text-xs text-forest-600">
                    Configure systemic capabilities, staff operational limits, and security enforcement levels across all portals.
                  </p>
                </div>
              </div>

              {/* Roles Hierarchy Grid */}
              <div className="mt-6 grid gap-4 sm:grid-cols-4">
                {[
                  { title: 'Level 1: System Admin', badge: 'Tier 1 Priority', role: 'admin', color: 'bg-purple-900 text-white', desc: 'Full executive control over procurement, staff approvals, priority routing, and financial disbursals.' },
                  { title: 'Level 2: Center Manager', badge: 'Tier 2 Operational', role: 'staff', color: 'bg-forest-800 text-white', desc: 'Authorized to manage local queue tokens, open weighbridge counters, and handle crop weighments.' },
                  { title: 'Level 3: Quality Officer', badge: 'Tier 3 Quality Lab', role: 'staff', color: 'bg-leaf-700 text-white', desc: 'Authorized to run AI quality scans, issue grading certificates, and set moisture rejection flags.' },
                  { title: 'Level 4: Registered Farmer', badge: 'Tier 4 Producer', role: 'farmer', color: 'bg-amber-700 text-white', desc: 'Authorized to book tokens, view live queue status, request priority assistance, and track DBT payouts.' },
                ].map((r) => (
                  <div key={r.title} className="rounded-3xl border border-forest-100 bg-white/80 p-4 space-y-2">
                    <span className={`chip ${r.color} text-[10px] font-bold`}>{r.badge}</span>
                    <h3 className="font-display font-bold text-forest-950 text-base">{r.title}</h3>
                    <p className="text-xs text-forest-600 leading-relaxed">{r.desc}</p>
                  </div>
                ))}
              </div>

              {/* Capability Matrix Checklist */}
              <div className="mt-8">
                <h3 className="font-display text-lg font-bold text-forest-950 mb-3">
                  Operational Capability Controls
                </h3>
                <div className="space-y-3">
                  {ALL_STAFF_PERMISSIONS.map((perm) => (
                    <div key={perm.key} className="rounded-2xl border border-forest-100 bg-white/70 p-4 flex items-center justify-between gap-4">
                      <div>
                        <span className="font-bold text-forest-950 text-sm">{perm.label}</span>
                        <p className="text-xs text-forest-600 mt-0.5">{perm.description}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-mono font-bold text-purple-800 bg-purple-100 px-3 py-1 rounded-xl">
                          Active Policy
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      )}

      {/* ======================================================================== */}
      {/* SECTION 5: PROCUREMENT CENTERS & REBALANCING                            */}
      {/* ======================================================================== */}
      {adminSection === 'procurement' && (
        <div className="mt-8 space-y-6">
          <Reveal delay={100}>
            <div className="rounded-5xl glass p-6 sm:p-8 border border-forest-100 shadow-glass-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-forest-100 pb-5">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-leaf-700 flex items-center gap-1.5">
                    <Building2 className="h-4 w-4" /> State Procurement Infrastructure
                  </span>
                  <h2 className="mt-1 font-display text-2xl font-bold text-forest-950">
                    🏬 Regional Procurement Centers & Capacity Control
                  </h2>
                  <p className="text-xs text-forest-600">
                    Monitor live center capacity, open emergency reserve counters, and trigger automated AI load rebalancing.
                  </p>
                </div>

                <button
                  onClick={() => setShowAddCenterModal(true)}
                  className="btn-leaf text-xs shrink-0 flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" /> Add Procurement Center
                </button>
              </div>

              {/* Centers Grid */}
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {centersList.map((center) => (
                  <div
                    key={center.id}
                    className={`rounded-4xl p-5 border transition-all ${
                      center.capacityPct > 85
                        ? 'bg-rose-50/60 border-rose-300 ring-2 ring-rose-300'
                        : 'bg-white/80 border-forest-100 hover:shadow-lg'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-forest-500">{center.district} District</span>
                        <h3 className="font-display font-bold text-forest-950 text-base mt-0.5">{center.name}</h3>
                      </div>
                      <span className={`chip text-[10px] font-extrabold ${
                        center.capacityPct > 85
                          ? 'bg-rose-500 text-white animate-pulse'
                          : 'bg-leaf-100 text-leaf-800 border border-leaf-300'
                      }`}>
                        {center.capacityPct}% Load
                      </span>
                    </div>

                    {/* Meter bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-xs font-semibold text-forest-700 mb-1">
                        <span>Intake Capacity</span>
                        <span>{center.capacityPct}%</span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-forest-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            center.capacityPct > 85 ? 'bg-rose-500' : center.capacityPct > 60 ? 'bg-amber-500' : 'bg-leaf-500'
                          }`}
                          style={{ width: `${center.capacityPct}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs rounded-2xl bg-cream-50/80 p-3 border border-forest-100">
                      <div>
                        <span className="text-forest-500 block">Active Counters</span>
                        <span className="font-bold text-forest-900">{center.activeCounters} Weighbridges</span>
                      </div>
                      <div>
                        <span className="text-forest-500 block">Daily Intake</span>
                        <span className="font-bold text-forest-900">{center.dailyIntake}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-end gap-2 pt-2 border-t border-forest-100">
                      <button
                        onClick={() => {
                          setCentersList((prev) =>
                            prev.map((c) => (c.id === center.id ? { ...c, activeCounters: c.activeCounters + 1 } : c))
                          );
                          showToast(`Added reserve weighbridge counter at ${center.name}`);
                        }}
                        className="rounded-xl bg-forest-100 px-3 py-1.5 text-[11px] font-bold text-forest-800 hover:bg-forest-200"
                      >
                        + Add Counter
                      </button>

                      {center.capacityPct > 80 && (
                        <button
                          onClick={handleApplyRecommendation}
                          className="rounded-xl bg-rose-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm hover:bg-rose-700 animate-pulse"
                        >
                          ⚡ Rebalance Flow
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      )}

      {/* ======================================================================== */}
      {/* SECTION 6: QUEUE SYSTEM & PRIORITY TOKEN OVERRIDES                      */}
      {/* ======================================================================== */}
      {adminSection === 'queue' && (
        <div className="mt-8 space-y-6">
          <Reveal delay={100}>
            <div className="rounded-5xl glass p-6 sm:p-8 border border-forest-100 shadow-glass-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-forest-100 pb-5">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 flex items-center gap-1.5">
                    <Ticket className="h-4 w-4" /> Live Queue Token Administration
                  </span>
                  <h2 className="mt-1 font-display text-2xl font-bold text-forest-950">
                    🎟️ Queue Management & Priority Token Overrides
                  </h2>
                  <p className="text-xs text-forest-600">
                    Manage consecutive token generation, call next in queue, and elevate token priorities across all regional centers.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSimulateConsecutiveTokens}
                    className="rounded-2xl bg-purple-900 px-4 py-2.5 text-xs font-bold text-white shadow-glow hover:bg-purple-800 transition"
                  >
                    ⚡ Test Consecutive Tokens
                  </button>
                  <button
                    onClick={async () => {
                      const res = await callNextQueueToken('c-1', 'CNT-VJ-101');
                      showToast(res.message);
                    }}
                    className="btn-leaf text-xs shrink-0"
                  >
                    ⏩ Call Next Token
                  </button>
                </div>
              </div>

              {/* Consecutive Token Banner Preview */}
              {consecutivePreview && (
                <div className="mt-5 rounded-3xl bg-purple-900 p-4 text-white shadow-glow flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="chip bg-purple-700 text-gold-300 font-extrabold text-[10px]">
                      ⚡ Consecutive Token Generator Active
                    </span>
                    <h4 className="font-display text-lg font-bold mt-1">
                      Tokens {consecutivePreview.token1} & {consecutivePreview.token2} Assigned
                    </h4>
                    <p className="text-xs text-purple-200">
                      Two farmers registered at {consecutivePreview.center} received consecutive numbers. Synced in real-time across tabs & mobiles.
                    </p>
                  </div>
                  <button
                    onClick={() => setConsecutivePreview(null)}
                    className="rounded-xl bg-white/20 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/30"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Priority Filters */}
              <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-3 h-4 w-4 text-forest-400" />
                  <input
                    type="text"
                    value={queueSearch}
                    onChange={(e) => setQueueSearch(e.target.value)}
                    placeholder="Search by token number (e.g. VJ-104), farmer name, or produce..."
                    className="w-full rounded-2xl border border-forest-200 bg-white/80 pl-10 pr-4 py-2.5 text-xs font-medium text-forest-900 outline-none focus:border-forest-800"
                  />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto text-xs">
                  <span className="text-forest-500 font-bold">Priority Filter:</span>
                  {[
                    { id: 'all', label: 'All Tokens' },
                    { id: 'Emergency', label: '🚨 Emergency P0' },
                    { id: 'VIP', label: '⭐ VIP / Elderly P1' },
                    { id: 'Standard', label: 'Standard P3' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setTokenPriorityFilter(f.id)}
                      className={`rounded-xl px-3 py-1.5 font-bold transition whitespace-nowrap ${
                        tokenPriorityFilter === f.id
                          ? 'bg-forest-900 text-white shadow-sm'
                          : 'bg-forest-100/70 text-forest-800 hover:bg-forest-200'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tokens Table */}
              <div className="mt-6 overflow-x-auto rounded-3xl border border-forest-100 bg-white/70">
                <table className="w-full text-left text-xs">
                  <thead className="bg-forest-900 text-white font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3.5">Token #</th>
                      <th className="p-3.5">Farmer & Center</th>
                      <th className="p-3.5">Crop & Quantity</th>
                      <th className="p-3.5">Est. Wait</th>
                      <th className="p-3.5">Priority Level</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-forest-100 font-medium">
                    {smartTokensList
                      .filter((t) => {
                        const matchesSearch =
                          t.tokenNumber.toLowerCase().includes(queueSearch.toLowerCase()) ||
                          t.farmerName.toLowerCase().includes(queueSearch.toLowerCase()) ||
                          (t.produceType && t.produceType.toLowerCase().includes(queueSearch.toLowerCase()));
                        const isHighPriority = t.priority === 'SENIOR_CITIZEN' || t.priority === 'SPECIAL_ASSISTANCE';
                        const currentPriority = tokenPriorityBoosts[t.id] || (isHighPriority ? 'VIP' : 'Standard');
                        const matchesPriority = tokenPriorityFilter === 'all' || currentPriority === tokenPriorityFilter;
                        return matchesSearch && matchesPriority;
                      })
                      .map((t) => {
                        const isHighPriority = t.priority === 'SENIOR_CITIZEN' || t.priority === 'SPECIAL_ASSISTANCE';
                        const currentPriority = tokenPriorityBoosts[t.id] || (isHighPriority ? 'VIP' : 'Standard');
                        return (
                          <tr key={t.id} className="hover:bg-cream-50/70 transition">
                            <td className="p-3.5">
                              <span className="font-mono text-base font-black text-forest-950 block">{t.tokenNumber}</span>
                            </td>
                            <td className="p-3.5">
                              <span className="font-bold text-forest-900 block">{t.farmerName}</span>
                              <span className="text-[11px] text-forest-500">{t.centerName}</span>
                            </td>
                            <td className="p-3.5 text-forest-700">
                              <span className="font-semibold">{t.produceType || 'Paddy'}</span>
                              <div className="text-[11px] text-forest-500">{t.quantityQuintals} Quintals</div>
                            </td>
                            <td className="p-3.5 font-bold text-amber-900">
                              ~{t.estimatedWaitMin} mins
                            </td>
                            <td className="p-3.5">
                              <span className={`chip font-extrabold text-[10px] ${
                                currentPriority === 'Emergency'
                                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                  : currentPriority === 'VIP'
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : 'bg-slate-100 text-slate-700 border border-slate-300'
                              }`}>
                                {currentPriority === 'Emergency' ? '🚨 Emergency P0' : currentPriority === 'VIP' ? '⭐ VIP / Elderly P1' : 'Standard P3'}
                              </span>
                            </td>
                            <td className="p-3.5">
                              <span className="chip bg-leaf-100 text-leaf-800 font-bold text-[10px]">
                                {t.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="p-3.5 text-right space-x-1">
                              <button
                                onClick={() => {
                                  const nextP = currentPriority === 'Emergency' ? 'Standard' : 'Emergency';
                                  setTokenPriorityBoosts((prev) => ({ ...prev, [t.id]: nextP }));
                                  showToast(`Updated token ${t.tokenNumber} priority to ${nextP}`);
                                }}
                                className="rounded-xl bg-purple-900 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-purple-800"
                              >
                                ⚡ Boost Priority
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </Reveal>
        </div>
      )}

      {/* ======================================================================== */}
      {/* SECTION 7: QUALITY LAB & AI CERTIFICATION                                */}
      {/* ======================================================================== */}
      {adminSection === 'quality' && (
        <div className="mt-8 space-y-6">
          <Reveal delay={100}>
            <div className="rounded-5xl glass p-6 sm:p-8 border border-forest-100 shadow-glass-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-forest-100 pb-5">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-leaf-700 flex items-center gap-1.5">
                    <Award className="h-4 w-4" /> AI Crop Inspection & Grading System
                  </span>
                  <h2 className="mt-1 font-display text-2xl font-bold text-forest-950">
                    🔬 Quality Assessment & Moisture Threshold Control
                  </h2>
                  <p className="text-xs text-forest-600">
                    Review digital quality certificates, calibrate moisture limits for storm-affected harvest, and trigger AI auto-verification.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-forest-700">Moisture Limit:</span>
                  <input
                    type="number"
                    step="0.5"
                    value={moistureThreshold}
                    onChange={(e) => {
                      setMoistureThreshold(parseFloat(e.target.value) || 14);
                      showToast(`Adjusted state moisture threshold to ${e.target.value}%`);
                    }}
                    className="w-20 rounded-xl border border-forest-200 bg-white px-3 py-1.5 text-xs font-bold text-forest-900 outline-none"
                  />
                  <span className="text-xs font-bold text-forest-500">%</span>
                </div>
              </div>

              {/* Quality Reports Grid */}
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {qualityReportsList.map((q) => (
                  <div key={q.id} className="rounded-3xl border border-forest-100 bg-white/80 p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-[11px] font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded-md">
                          Cert ID: {q.id}
                        </span>
                        <h4 className="font-display text-lg font-bold text-forest-950 mt-1">{q.farmerName}</h4>
                        <p className="text-xs text-forest-600">{q.crop} • Token #{q.tokenId}</p>
                      </div>
                      <span className={`chip font-extrabold text-[10px] ${
                        q.decision === 'accepted' ? 'bg-leaf-100 text-leaf-800 border border-leaf-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}>
                        {q.qualityGrade} ({q.decision.toUpperCase()})
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center rounded-2xl bg-cream-50 p-3 text-xs font-bold border border-forest-100">
                      <div>
                        <span className="text-forest-400 text-[10px] block uppercase">Moisture</span>
                        <span className={q.moisturePct <= moistureThreshold ? 'text-leaf-700' : 'text-rose-700'}>
                          {q.moisturePct}%
                        </span>
                      </div>
                      <div>
                        <span className="text-forest-400 text-[10px] block uppercase">Quality Score</span>
                        <span className="text-purple-900">{q.score} / 100</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        onClick={async () => {
                          const res = await verifyQualityByStaff(q.tokenId, 'accepted');
                          showToast(res.message);
                        }}
                        className="rounded-xl bg-leaf-500 px-4 py-1.5 text-[11px] font-bold text-white shadow-sm hover:bg-leaf-600"
                      >
                        ⚡ Verify & Issue Certificate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      )}

      {/* ======================================================================== */}
      {/* SECTION 8: PAYMENTS & DBT DISBURSAL                                      */}
      {/* ======================================================================== */}
      {adminSection === 'payments' && (
        <div className="mt-8 space-y-6">
          <Reveal delay={100}>
            <div className="rounded-5xl glass p-6 sm:p-8 border border-forest-100 shadow-glass-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-forest-100 pb-5">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-leaf-700 flex items-center gap-1.5">
                    <CreditCard className="h-4 w-4" /> Direct Benefit Transfer (DBT) Payout Hub
                  </span>
                  <h2 className="mt-1 font-display text-2xl font-bold text-forest-950">
                    💳 Farmer Payout Prioritization & Disbursal Audit
                  </h2>
                  <p className="text-xs text-forest-600">
                    Process direct bank transfers, prioritize smallholder payout queue, and resolve payment holds.
                  </p>
                </div>
              </div>

              {/* Payments Table */}
              <div className="mt-6 overflow-x-auto rounded-3xl border border-forest-100 bg-white/70">
                <table className="w-full text-left text-xs">
                  <thead className="bg-forest-900 text-white font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3.5">Payment Ref</th>
                      <th className="p-3.5">Farmer & Account</th>
                      <th className="p-3.5">Procurement Details</th>
                      <th className="p-3.5">Payable Amount</th>
                      <th className="p-3.5">Payout Priority</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-forest-100 font-medium">
                    {paymentsList.map((p) => (
                      <tr key={p.id} className="hover:bg-cream-50/70 transition">
                        <td className="p-3.5 font-bold font-mono text-forest-900">{p.id}</td>
                        <td className="p-3.5">
                          <span className="font-bold text-forest-950 block">{p.farmerName}</span>
                          <span className="text-[11px] font-mono text-forest-500">A/C: •••• {p.bankLast4 || '4521'}</span>
                        </td>
                        <td className="p-3.5 text-forest-700">
                          <span className="font-semibold">{p.crop}</span>
                          <div className="text-[11px] text-forest-500">{p.quantityQuintals} Quintals</div>
                        </td>
                        <td className="p-3.5 font-display text-sm font-black text-leaf-800">
                          {formatRupee(p.finalPayableAmount)}
                        </td>
                        <td className="p-3.5">
                          <span className="chip bg-purple-100 text-purple-900 font-extrabold text-[10px]">
                            ⚡ Priority P1 (Direct DBT)
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className={`chip font-bold text-[10px] ${
                            p.status === 'successful' ? 'bg-leaf-100 text-leaf-800' : 'bg-amber-100 text-amber-900'
                          }`}>
                            {p.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-1">
                          {p.status !== 'successful' && (
                            <button
                              onClick={async () => {
                                const res = await processPayout(p.id);
                                showToast(res.message);
                              }}
                              className="rounded-xl bg-leaf-500 px-3.5 py-1.5 text-[11px] font-bold text-white shadow-sm hover:bg-leaf-600"
                            >
                              ⚡ Disburse Now
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Reveal>
        </div>
      )}

      {/* ======================================================================== */}
      {/* SECTION 9: EXECUTIVE REPORTS & EXPORTS                                   */}
      {/* ======================================================================== */}
      {adminSection === 'reports' && (
        <div className="mt-8 space-y-6">
          <Reveal delay={100}>
            <div className="rounded-5xl glass p-6 sm:p-8 border border-forest-100 shadow-glass-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-forest-100 pb-5">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-forest-700 flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-leaf-600" /> State Operations Reporting
                  </span>
                  <h2 className="mt-1 font-display text-2xl font-bold text-forest-950">
                    📈 Operations Intelligence & Export Center
                  </h2>
                  <p className="text-xs text-forest-600">
                    Generate district performance leaderboards, export audit trails, and download official procurement summaries.
                  </p>
                </div>
              </div>

              {/* Download Buttons */}
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <button
                  onClick={() => showToast('📥 Downloading Official State Procurement PDF Report...')}
                  className="rounded-3xl border border-forest-200 bg-white p-5 text-left hover:border-forest-800 transition shadow-sm group"
                >
                  <Download className="h-6 w-6 text-leaf-600 group-hover:scale-110 transition" />
                  <h4 className="font-display text-base font-bold text-forest-950 mt-2">Download State Summary (PDF)</h4>
                  <p className="text-xs text-forest-500 mt-0.5">Includes district breakdown, daily tonnage, and DBT disbursal progress.</p>
                </button>

                <button
                  onClick={() => showToast('📊 Exporting Full Transaction Log CSV...')}
                  className="rounded-3xl border border-forest-200 bg-white p-5 text-left hover:border-forest-800 transition shadow-sm group"
                >
                  <Download className="h-6 w-6 text-purple-600 group-hover:scale-110 transition" />
                  <h4 className="font-display text-base font-bold text-forest-950 mt-2">Export Transaction Ledger (CSV)</h4>
                  <p className="text-xs text-forest-500 mt-0.5">Raw transaction data with bank references and moisture deductions.</p>
                </button>

                <button
                  onClick={() => showToast('📜 Exporting Security & Staff Audit Trail...')}
                  className="rounded-3xl border border-forest-200 bg-white p-5 text-left hover:border-forest-800 transition shadow-sm group"
                >
                  <Download className="h-6 w-6 text-amber-600 group-hover:scale-110 transition" />
                  <h4 className="font-display text-base font-bold text-forest-950 mt-2">Security Audit Trail Log</h4>
                  <p className="text-xs text-forest-500 mt-0.5">Complete record of staff approvals, permission updates, and role overrides.</p>
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      )}

      {/* ======================================================================== */}
      {/* SECTION 10: SETTINGS & AUTO-PRIORITY RULES                              */}
      {/* ======================================================================== */}
      {adminSection === 'settings' && (
        <div className="mt-8 space-y-6">
          <Reveal delay={100}>
            <div className="rounded-5xl glass p-6 sm:p-8 border border-forest-100 shadow-glass-lg max-w-3xl mx-auto">
              <div className="border-b border-forest-100 pb-5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-forest-700 flex items-center gap-1.5">
                  <SettingsIcon className="h-4 w-4" /> Operational System Settings
                </span>
                <h2 className="mt-1 font-display text-2xl font-bold text-forest-950">
                  ⚙️ Smart Priority Rules & Platform Controls
                </h2>
                <p className="text-xs text-forest-600">
                  Automate priority boosts for elderly farmers, enable AI crowd surge rebalancing, and enforce multi-factor authentication.
                </p>
              </div>

              <div className="mt-6 space-y-4 text-xs">
                {[
                  { key: 'elderlyAutoPriority', label: '⭐ Elderly Farmer (60+ Yrs) Auto-Priority Boost', desc: 'Automatically assigns Priority Level 1 (P1) to senior citizen farmers during token booking.' },
                  { key: 'smallholderExpress', label: '🌱 Smallholder Farmer (<2 Acres) Express Queue', desc: 'Grants express weighbridge lane access to smallholder farmers to minimize waiting time.' },
                  { key: 'surgeAutoRebalance', label: '⚡ AI Queue Surge Auto-Rebalancing', desc: 'Automatically suggests load redirection when any center reaches >85% capacity threshold.' },
                  { key: 'smsNotifications', label: '📱 Instant SMS & WhatsApp Dispatch', desc: 'Sends live SMS updates for token status changes, quality approval, and bank disbursal.' },
                  { key: 'mfaEnforced', label: '🔒 Enforce Mandatory Multi-Factor Staff Verification', desc: 'Requires staff and admin accounts to perform OTP authentication upon initial portal login.' },
                ].map((item) => {
                  const isChecked = settingsConfig[item.key as keyof typeof settingsConfig];
                  return (
                    <label
                      key={item.key}
                      className={`flex items-start gap-4 p-4 rounded-3xl border cursor-pointer transition ${
                        isChecked ? 'border-leaf-400 bg-leaf-50/50' : 'border-forest-100 bg-white'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          setSettingsConfig((prev) => ({ ...prev, [item.key]: e.target.checked }));
                          showToast(`Updated ${item.label}`);
                        }}
                        className="mt-1 rounded text-leaf-600 focus:ring-leaf-500 h-4 w-4"
                      />
                      <div>
                        <span className="font-bold text-forest-950 text-sm block">{item.label}</span>
                        <p className="text-forest-600 mt-0.5">{item.desc}</p>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => showToast('💾 Priority & Platform Operational Rules Successfully Saved!')}
                  className="btn-leaf text-xs px-6 py-3 font-bold"
                >
                  💾 Save Priority Rules & Configurations
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      )}

      {/* =================================================== */}
      {/* MODALS                                              */}
      {/* =================================================== */}

      {/* MODAL: ADD NEW PROCUREMENT CENTER */}
      {showAddCenterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-4xl bg-white p-6 shadow-2xl border border-forest-100 animate-scale-in">
            <h3 className="font-display text-lg font-bold text-forest-950">
              Create New Regional Procurement Center
            </h3>
            <p className="text-xs text-forest-600 mt-1">
              Deploy a new procurement hub with initial weighbridge counters and staff allocations.
            </p>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-forest-800 block mb-1">Center Name:</label>
                <input
                  type="text"
                  value={newCenterName}
                  onChange={(e) => setNewCenterName(e.target.value)}
                  placeholder="e.g. Tenali Grain Collection Point"
                  className="w-full rounded-2xl border border-forest-200 p-3 font-medium outline-none focus:border-forest-800"
                />
              </div>

              <div>
                <label className="font-bold text-forest-800 block mb-1">District:</label>
                <select
                  value={newCenterDistrict}
                  onChange={(e) => setNewCenterDistrict(e.target.value)}
                  className="w-full rounded-2xl border border-forest-200 p-3 font-medium outline-none focus:border-forest-800"
                >
                  <option value="Krishna">Krishna</option>
                  <option value="Guntur">Guntur</option>
                  <option value="West Godavari">West Godavari</option>
                  <option value="Kurnool">Kurnool</option>
                  <option value="Visakhapatnam">Visakhapatnam</option>
                  <option value="Chittoor">Chittoor</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowAddCenterModal(false)}
                className="rounded-xl bg-forest-100 px-4 py-2 text-xs font-bold text-forest-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!newCenterName.trim()) return;
                  setCentersList((prev) => [
                    ...prev,
                    {
                      id: 'c-' + (prev.length + 1),
                      name: newCenterName,
                      district: newCenterDistrict,
                      capacityPct: 15,
                      activeCounters: 2,
                      dailyIntake: '0 Quintals',
                      status: 'optimal',
                    },
                  ]);
                  setShowAddCenterModal(false);
                  setNewCenterName('');
                  showToast(`Successfully registered ${newCenterName}!`);
                }}
                className="rounded-xl bg-leaf-500 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-leaf-600"
              >
                Deploy Center
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: STAFF DETAILS VIEW */}
      {selectedStaffDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-4xl bg-white p-6 shadow-2xl border border-forest-100 animate-scale-in">
            <h3 className="font-display text-xl font-bold text-forest-950 border-b border-forest-100 pb-3">
              Staff Registration Profile Details
            </h3>

            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
              <div>
                <span className="text-forest-500 block">Full Name:</span>
                <span className="font-bold text-forest-900">{selectedStaffDetails.fullName}</span>
              </div>
              <div>
                <span className="text-forest-500 block">Staff / Employee ID:</span>
                <span className="font-bold font-mono text-amber-900">{selectedStaffDetails.staffId}</span>
              </div>
              <div>
                <span className="text-forest-500 block">Official Email:</span>
                <span className="font-bold text-forest-900">{selectedStaffDetails.officialEmail}</span>
              </div>
              <div>
                <span className="text-forest-500 block">Phone Number:</span>
                <span className="font-bold text-forest-900">{selectedStaffDetails.phone}</span>
              </div>
              <div>
                <span className="text-forest-500 block">Department:</span>
                <span className="font-bold text-forest-900">{selectedStaffDetails.department}</span>
              </div>
              <div>
                <span className="text-forest-500 block">Designation:</span>
                <span className="font-bold text-forest-900">{selectedStaffDetails.designation}</span>
              </div>
              <div className="col-span-2">
                <span className="text-forest-500 block">Assigned Procurement Center:</span>
                <span className="font-bold text-forest-900">{selectedStaffDetails.procurementCenter}</span>
              </div>
              <div>
                <span className="text-forest-500 block">Current Status:</span>
                <span className="font-extrabold text-amber-800">🟡 {selectedStaffDetails.status.toUpperCase()}</span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2 pt-4 border-t border-forest-100">
              <button
                onClick={() => setSelectedStaffDetails(null)}
                className="rounded-xl bg-forest-100 px-4 py-2 text-xs font-bold text-forest-700"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setApproveConfirmReq(selectedStaffDetails);
                  setSelectedStaffDetails(null);
                }}
                className="rounded-xl bg-leaf-500 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-leaf-600"
              >
                ✓ Approve Staff
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIRM APPROVE STAFF */}
      {approveConfirmReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-4xl bg-white p-6 shadow-2xl border border-forest-100 text-center animate-scale-in">
            <CheckCircle2 className="h-12 w-12 text-leaf-500 mx-auto" />
            <h3 className="font-display text-lg font-bold text-forest-950 mt-3">
              Approve this staff account?
            </h3>
            <p className="text-xs text-forest-600 mt-1">
              Confirming approval will grant <span className="font-bold">{approveConfirmReq.fullName}</span> ({approveConfirmReq.staffId}) immediate active login access to the Staff Portal.
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => setApproveConfirmReq(null)}
                className="rounded-xl bg-forest-100 px-4 py-2 text-xs font-bold text-forest-700"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const res = await approveStaffRequest(approveConfirmReq.id);
                  showToast(res.message);
                  setApproveConfirmReq(null);
                }}
                className="rounded-xl bg-leaf-500 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-leaf-600"
              >
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: REJECT STAFF WITH REASON */}
      {rejectModalReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-4xl bg-white p-6 shadow-2xl border border-forest-100 animate-scale-in">
            <h3 className="font-display text-lg font-bold text-forest-950">
              Reason for Staff Rejection
            </h3>
            <p className="text-xs text-forest-600 mt-1">
              Provide a clear verification reason for rejecting <span className="font-bold">{rejectModalReq.fullName}</span>.
            </p>

            <textarea
              rows={3}
              value={rejectionReasonText}
              onChange={(e) => setRejectionReasonText(e.target.value)}
              placeholder="e.g. Employee ID could not be verified with Department HR database..."
              className="mt-4 w-full rounded-2xl border border-forest-200 p-3 text-xs font-medium outline-none focus:border-rose-500"
            />

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setRejectModalReq(null)}
                className="rounded-xl bg-forest-100 px-4 py-2 text-xs font-bold text-forest-700"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const res = await rejectStaffRequest(rejectModalReq.id, rejectionReasonText || 'Invalid details provided');
                  showToast(res.message);
                  setRejectModalReq(null);
                  setRejectionReasonText('');
                }}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-rose-700"
              >
                Reject Registration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: SUSPEND STAFF CONFIRMATION */}
      {suspendModalUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-4xl bg-white p-6 shadow-2xl border border-forest-100 animate-scale-in">
            <h3 className="font-display text-lg font-bold text-rose-950">
              Suspend Staff Account?
            </h3>
            <p className="text-xs text-forest-600 mt-1">
              Suspended staff immediately lose access to the Staff Portal until reactivated by Admin.
            </p>

            <textarea
              rows={2}
              value={rejectionReasonText}
              onChange={(e) => setRejectionReasonText(e.target.value)}
              placeholder="Enter suspension reason (e.g. Pending internal compliance audit)..."
              className="mt-4 w-full rounded-2xl border border-forest-200 p-3 text-xs font-medium outline-none focus:border-rose-500"
            />

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setSuspendModalUserId(null)}
                className="rounded-xl bg-forest-100 px-4 py-2 text-xs font-bold text-forest-700"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const res = await suspendStaffAccount(suspendModalUserId, rejectionReasonText || 'Suspended by Admin');
                  showToast(res.message);
                  setSuspendModalUserId(null);
                  setRejectionReasonText('');
                }}
                className="rounded-xl bg-orange-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-orange-700"
              >
                Suspend Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: GRANULAR STAFF PERMISSIONS MANAGER */}
      {managingPermissionsUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-4xl bg-white p-6 shadow-2xl border border-forest-100 animate-scale-in">
            <h3 className="font-display text-lg font-bold text-forest-950">
              Manage Staff Permissions
            </h3>
            <p className="text-xs text-forest-600 mt-1">
              Select specific operational modules authorized for this staff member.
            </p>

            <div className="mt-4 space-y-2 max-h-60 overflow-y-auto pr-1 text-xs">
              {ALL_STAFF_PERMISSIONS.map((p) => {
                const currentPerms = staffPermissionsMap[managingPermissionsUserId] ?? [
                  'quality_check',
                  'weighing',
                  'procurement_management',
                  'payment_verification',
                ];
                const isChecked = currentPerms.includes(p.key);

                return (
                  <label
                    key={p.key}
                    className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition ${
                      isChecked ? 'border-purple-300 bg-purple-50/70' : 'border-forest-100 bg-white'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        const newPerms = e.target.checked
                          ? [...currentPerms, p.key]
                          : currentPerms.filter((k) => k !== p.key);
                        updateStaffPermissions(managingPermissionsUserId, newPerms);
                      }}
                      className="mt-0.5 rounded text-purple-600 focus:ring-purple-500"
                    />
                    <div>
                      <span className="font-bold text-forest-900 block">{p.label}</span>
                      <span className="text-[11px] text-forest-500">{p.description}</span>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="mt-6 flex items-center justify-end">
              <button
                onClick={() => setManagingPermissionsUserId(null)}
                className="rounded-xl bg-forest-900 px-5 py-2 text-xs font-bold text-white shadow-sm"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
