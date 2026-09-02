import { useState } from 'react';
import {
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Layers,
  Zap,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { Reveal } from '@/components/Reveal';
import { AnalyticsView } from './AnalyticsView';
import { ALL_STAFF_PERMISSIONS, type StaffRegistrationRequest } from '@/lib/auth-service';

export function AdminView() {
  const {
    lang,
    setUserRole,
    setView,
    staffRequestsList,
    staffPermissionsMap,
    systemAuditLogs,
    approveStaffRequest,
    rejectStaffRequest,
    suspendStaffAccount,
    reactivateStaffAccount,
    updateStaffPermissions,
  } = useApp();
  const [dateFilter, setDateFilter] = useState<'today' | '7d' | '30d' | '1y'>('30d');
  const [alertApplied, setAlertApplied] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Staff Management State
  const [staffTab, setStaffTab] = useState<'pending' | 'approved' | 'suspended' | 'rejected' | 'audit_logs'>('pending');
  const [selectedStaffDetails, setSelectedStaffDetails] = useState<StaffRegistrationRequest | null>(null);
  const [approveConfirmReq, setApproveConfirmReq] = useState<StaffRegistrationRequest | null>(null);
  const [rejectModalReq, setRejectModalReq] = useState<StaffRegistrationRequest | null>(null);
  const [suspendModalUserId, setSuspendModalUserId] = useState<string | null>(null);
  const [managingPermissionsUserId, setManagingPermissionsUserId] = useState<string | null>(null);
  const [rejectionReasonText, setRejectionReasonText] = useState('');

  const pendingStaffRequests = staffRequestsList.filter((r) => r.status === 'pending');
  const approvedStaffRequests = staffRequestsList.filter((r) => r.status === 'approved');
  const suspendedStaffRequests = staffRequestsList.filter((r) => r.status === 'suspended');
  const rejectedStaffRequests = staffRequestsList.filter((r) => r.status === 'rejected');

  const handleApplyRecommendation = () => {
    setAlertApplied(true);
    setToastMsg(
      lang === 'te'
        ? 'AI సిఫార్సు అమలు చేయబడింది — 18 మంది రైతులు గుంటూరు కొనుగోలు కేంద్రానికి మళ్లించబడ్డారు!'
        : lang === 'hi'
        ? 'AI सुझाव लागू — 18 किसानों को गुंटूर खरीद केंद्र पर पुनर्निर्देशित किया गया!'
        : 'AI Recommendation Applied — 18 farmers successfully redirected to Guntur Center!'
    );
    setTimeout(() => setToastMsg(null), 5000);
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
                : 'Monitor statewide center capacity, real-time volume intake, DBT disbursal speed, and farmer satisfaction.'}
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

      {/* Tab Selector for Admin Controls */}
      <Reveal delay={90}>
        <div className="mt-6 flex flex-wrap border-b border-forest-100 pb-3 gap-3">
          <button
            onClick={() => setUserRole('admin')}
            className="flex items-center gap-2 rounded-2xl bg-forest-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm"
          >
            📊 {lang === 'te' ? 'ప్లాట్‌ఫారమ్ విశ్లేషణలు' : 'Platform Analytics'}
          </button>
          <button
            onClick={() => setView('payment')}
            className="flex items-center gap-2 rounded-2xl bg-leaf-500 px-4 py-2.5 text-xs font-bold text-white shadow-glow hover:bg-leaf-600 transition"
          >
            💳 {lang === 'te' ? 'రైతు మద్దతు ధర చెల్లింపుల నియంత్రణ' : 'Farmer Payouts & Audit Logs'}
          </button>
        </div>
      </Reveal>

      {/* REQUIREMENT #7 & #16: ADMIN STAFF APPROVAL & MANAGEMENT PORTAL */}
      <div className="mt-8">
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

            {/* Staff Management KPI Counters */}
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
                <span className="text-[10px] text-amber-700 font-semibold">Awaiting Verification</span>
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
                <span className="text-[10px] text-leaf-700 font-semibold">Active Portal Access</span>
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
                <span className="text-[10px] text-orange-700 font-semibold">Access Blocked</span>
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
                <span className="text-[10px] text-rose-700 font-semibold">Verification Failed</span>
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

            {/* TAB CONTENT 1: PENDING REQUESTS */}
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

            {/* TAB CONTENT 2: APPROVED STAFF */}
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

            {/* TAB CONTENT 3: SUSPENDED STAFF */}
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
                              setToastMsg(res.message);
                              setTimeout(() => setToastMsg(null), 4000);
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

            {/* TAB CONTENT 4: REJECTED REQUESTS */}
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

            {/* TAB CONTENT 5: SYSTEM AUDIT LOGS */}
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

      {/* =================================================== */}
      {/* MODAL 1: STAFF DETAILS VIEW                         */}
      {/* =================================================== */}
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

      {/* =================================================== */}
      {/* MODAL 2: CONFIRM APPROVE STAFF                      */}
      {/* =================================================== */}
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
                  setToastMsg(res.message);
                  setApproveConfirmReq(null);
                  setTimeout(() => setToastMsg(null), 4000);
                }}
                className="rounded-xl bg-leaf-500 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-leaf-600"
              >
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================== */}
      {/* MODAL 3: REJECT STAFF WITH REASON                   */}
      {/* =================================================== */}
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
                  setToastMsg(res.message);
                  setRejectModalReq(null);
                  setRejectionReasonText('');
                  setTimeout(() => setToastMsg(null), 4000);
                }}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-rose-700"
              >
                Reject Registration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================== */}
      {/* MODAL 4: SUSPEND STAFF CONFIRMATION                 */}
      {/* =================================================== */}
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
                  setToastMsg(res.message);
                  setSuspendModalUserId(null);
                  setRejectionReasonText('');
                  setTimeout(() => setToastMsg(null), 4000);
                }}
                className="rounded-xl bg-orange-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-orange-700"
              >
                Suspend Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================== */}
      {/* MODAL 5: GRANULAR STAFF PERMISSIONS MANAGER         */}
      {/* =================================================== */}
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

      {/* Main Analytics Engine */}
      <div className="mt-6">
        <AnalyticsView />
      </div>
    </div>
  );
}
