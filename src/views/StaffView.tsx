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
  UserCheck,
  UserPlus,
  Sprout,
  MapPin,
  Calendar,
  Filter,
  Plus,
  Phone,
  X,
  FileText,
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { Reveal } from '@/components/Reveal';
import type { UserProfile } from '@/lib/auth-service';

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
    smartTokensList,
    countersList,
    callNextQueueToken,
    updateQueueTokenStatus,
    updateCounterStatus,
    profilesList,
    completeFarmerProfileSetup,
  } = useApp();

  const [selectedCounterId, setSelectedCounterId] = useState<string>(countersList[0]?.id || 'CNT-VJA-1');

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

  // Staff Portal Section State
  const [staffSection, setStaffSection] = useState<'dashboard' | 'farmer_directory' | 'farmer_verification' | 'queue' | 'procurement' | 'quality_check' | 'payments' | 'profile'>('dashboard');

  // Farmer Directory & Registrations State
  const [farmerSearchQuery, setFarmerSearchQuery] = useState('');
  const [farmerFilterStatus, setFarmerFilterStatus] = useState<'all' | 'active' | 'pending'>('all');
  const [showAddFarmerModal, setShowAddFarmerModal] = useState(false);

  // New Farmer Registration Form State (Staff Entry)
  const [newFarmerName, setNewFarmerName] = useState('');
  const [newFarmerPhone, setNewFarmerPhone] = useState('');
  const [newFarmerVillage, setNewFarmerVillage] = useState('');
  const [newFarmerDistrict, setNewFarmerDistrict] = useState('Krishna');
  const [newFarmerState, setNewFarmerState] = useState('Andhra Pradesh');
  const [newFarmerCrop, setNewFarmerCrop] = useState('Paddy (Grade A)');
  const [newFarmerAcres, setNewFarmerAcres] = useState('4.0');
  const [newFarmerKisanId, setNewFarmerKisanId] = useState('');
  const [registeringFarmer, setRegisteringFarmer] = useState(false);

  const activeFarmer = queue[activeTokenIdx] ?? queue[0];

  // Registered Farmers List (filtered from profilesList)
  const registeredFarmersList = (profilesList || []).filter((p: UserProfile) => p.role === 'farmer');

  const filteredFarmerDirectory = registeredFarmersList.filter((farmer: UserProfile) => {
    const matchesSearch =
      (farmer.fullName || '').toLowerCase().includes(farmerSearchQuery.toLowerCase()) ||
      (farmer.phone || '').toLowerCase().includes(farmerSearchQuery.toLowerCase()) ||
      (farmer.village || '').toLowerCase().includes(farmerSearchQuery.toLowerCase()) ||
      (farmer.kisanCardId || '').toLowerCase().includes(farmerSearchQuery.toLowerCase());

    const matchesStatus =
      farmerFilterStatus === 'all'
        ? true
        : farmerFilterStatus === 'active'
        ? farmer.status === 'active' || farmer.status === 'approved'
        : farmer.status === 'pending';

    return matchesSearch && matchesStatus;
  });

  const handleCallNext = async () => {
    setCallingNext(true);
    const res = await callNextQueueToken('vijayawada', selectedCounterId, userProfile?.fullName || 'Officer S. Rao');
    setCallingNext(false);
    if (res.success) {
      const nextIdx = (activeTokenIdx + 1) % queue.length;
      setActiveTokenIdx(nextIdx);
      setToastMsg(`✅ ${res.message}`);
    } else {
      setToastMsg(`⚠️ ${res.message}`);
    }
    setTimeout(() => setToastMsg(null), 4000);
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

  const handleStaffRegisterFarmerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFarmerName.trim() || !newFarmerPhone.trim() || !newFarmerVillage.trim()) {
      alert('Please fill in all mandatory fields (Name, Mobile, Village).');
      return;
    }

    setRegisteringFarmer(true);
    const res = await completeFarmerProfileSetup({
      fullName: newFarmerName.trim(),
      phone: newFarmerPhone.trim(),
      village: newFarmerVillage.trim(),
      district: newFarmerDistrict.trim(),
      state: newFarmerState.trim(),
      primaryCrop: newFarmerCrop,
      landAcres: parseFloat(newFarmerAcres) || 3.5,
      kisanCardId: newFarmerKisanId.trim() || `KC-AP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      preferredLanguage: 'te',
    });
    setRegisteringFarmer(false);

    if (res.success) {
      setShowAddFarmerModal(false);
      setNewFarmerName('');
      setNewFarmerPhone('');
      setNewFarmerVillage('');
      setNewFarmerKisanId('');
      setToastMsg(`✓ Farmer profile registered successfully for ${newFarmerName}!`);
      setTimeout(() => setToastMsg(null), 4000);
    }
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

      {/* STAFF OPERATIONAL NAVIGATION BAR */}
      <Reveal delay={75}>
        <div className="mt-6 flex overflow-x-auto scrollbar-hide rounded-3xl glass p-2 border border-forest-100 gap-1 text-xs font-bold">
          {[
            { id: 'dashboard', label: '📊 Dashboard' },
            { id: 'farmer_directory', label: '👨‍🌾 Farmer Directory & Registrations' },
            { id: 'farmer_verification', label: '🔍 Gate Verification' },
            { id: 'queue', label: '🎟️ Operational Queue' },
            { id: 'procurement', label: '🏬 Process Procurement' },
            { id: 'quality_check', label: '🔬 Quality Inspection', perm: 'quality_check' },
            { id: 'payments', label: '💳 Payout Verification', perm: 'payment_verification' },
            { id: 'profile', label: '👤 Staff Profile' },
          ].map((item) => {
            const isPermitted = !item.perm || activePermissions.includes(item.perm as any);
            return (
              <button
                key={item.id}
                onClick={() => setStaffSection(item.id as typeof staffSection)}
                className={`rounded-2xl px-4 py-2.5 whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  staffSection === item.id
                    ? 'bg-forest-900 text-white shadow-glow-sm scale-[1.02]'
                    : isPermitted
                    ? 'text-forest-700 hover:bg-white/80 hover:text-forest-950'
                    : 'text-gray-400 bg-gray-100/50 hover:bg-gray-100'
                }`}
              >
                <span>{item.label}</span>
                {!isPermitted && <span className="text-[10px] text-rose-500">🔒</span>}
              </button>
            );
          })}
        </div>
      </Reveal>

      {/* SECTION 1: DASHBOARD VIEW */}
      {staffSection === 'dashboard' && (
        <>
          {/* Stats Counter Bar */}
          <Reveal delay={80}>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <div className="rounded-3xl glass p-4 card-hover">
                <p className="text-xs font-semibold text-forest-500">{lang === 'te' ? 'షెడ్యూల్ రైతులు' : 'Registered Farmers'}</p>
                <p className="font-display text-2xl font-extrabold text-forest-900 mt-1">{registeredFarmersList.length}</p>
              </div>
              <div className="rounded-3xl glass p-4 card-hover">
                <p className="text-xs font-semibold text-forest-500">{lang === 'te' ? 'మొత్తం టోకెన్లు' : 'Active Tokens'}</p>
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

                  <button
                    onClick={() => {
                      setToastMsg(lang === 'te' ? 'పంట విజయవంతంగా కొనుగోలు స్వీకరించబడింది!' : 'Produce Batch Accepted & Weighed!');
                      setTimeout(() => setToastMsg(null), 4000);
                    }}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-xs font-bold text-white hover:bg-white/20 backdrop-blur"
                  >
                    <Zap className="h-4 w-4 text-gold-300" />
                    {lang === 'te' ? 'తూకం నమోదు చేయి' : 'Record Weight'}
                  </button>

                  <button
                    onClick={handleProcessDbt}
                    disabled={processingDbt}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-leaf-500 to-emerald-600 px-4 py-3 text-xs font-bold text-white shadow-glow hover:brightness-110 disabled:opacity-60"
                  >
                    {processingDbt ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-gold-300" />
                    )}
                    {lang === 'te' ? 'DBT చెల్లింపు రసీదు జారీ' : 'Approve & Release DBT'}
                  </button>
                </div>
              </div>
            </Reveal>

            {/* Quick Farmer Registration Shortcut Card */}
            <Reveal delay={100}>
              <div className="rounded-5xl glass p-6 border border-forest-100 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-amber-600">
                    <UserPlus className="h-5 w-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">Staff Registration Tool</span>
                  </div>
                  <h3 className="mt-2 font-display text-xl font-bold text-forest-950">
                    Farmer Registrations
                  </h3>
                  <p className="text-xs text-forest-600 mt-1 leading-relaxed">
                    View registered farmer profiles, verify Kisan Cards, or directly enroll new farmers into the procurement system.
                  </p>

                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex justify-between p-2.5 rounded-xl bg-forest-50 border border-forest-100">
                      <span className="text-forest-600">Total Enrolled Farmers:</span>
                      <span className="font-bold font-mono text-forest-900">{registeredFarmersList.length} Farmers</span>
                    </div>
                    <div className="flex justify-between p-2.5 rounded-xl bg-leaf-50 border border-leaf-200">
                      <span className="text-forest-600">Verified Active Status:</span>
                      <span className="font-bold text-leaf-700">100% Verified</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <button
                    onClick={() => setStaffSection('farmer_directory')}
                    className="w-full rounded-2xl bg-forest-900 py-3 text-xs font-bold text-white shadow-sm hover:bg-forest-950 transition flex items-center justify-center gap-2"
                  >
                    <UserCheck className="h-4 w-4" />
                    <span>View All Registered Farmers</span>
                  </button>
                  <button
                    onClick={() => setShowAddFarmerModal(true)}
                    className="w-full rounded-2xl bg-leaf-500/10 border border-leaf-400/40 py-2.5 text-xs font-bold text-leaf-800 hover:bg-leaf-500/20 transition flex items-center justify-center gap-2"
                  >
                    <Plus className="h-4 w-4 text-leaf-600" />
                    <span>Register New Farmer</span>
                  </button>
                </div>
              </div>
            </Reveal>
          </div>
        </>
      )}

      {/* SECTION 2: FARMER DIRECTORY & REGISTRATIONS VIEW */}
      {staffSection === 'farmer_directory' && (
        <Reveal delay={80}>
          <div className="mt-6 space-y-6">
            {/* Header & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 glass p-6 rounded-4xl border border-forest-100">
              <div>
                <span className="chip bg-leaf-100 text-leaf-800 border border-leaf-300 font-extrabold text-[10px]">
                  🌾 Farmer Identity Database
                </span>
                <h2 className="mt-1 font-display text-2xl font-bold text-forest-950">
                  Registered Farmers & Profiles Directory
                </h2>
                <p className="text-xs text-forest-600 mt-0.5">
                  Manage official farmer registrations, Kisan Card IDs, village details, and crop allocations.
                </p>
              </div>

              <button
                onClick={() => setShowAddFarmerModal(true)}
                className="btn-gold text-xs font-bold py-3 px-5 shadow-md flex items-center justify-center gap-2 shrink-0"
              >
                <UserPlus className="h-4 w-4" />
                <span>+ Register New Farmer</span>
              </button>
            </div>

            {/* Directory Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-3xl glass p-4 border border-forest-100">
                <p className="text-xs text-forest-500 font-semibold">Total Farmers Enrolled</p>
                <p className="font-display text-2xl font-extrabold text-forest-900 mt-1">
                  {registeredFarmersList.length}
                </p>
              </div>
              <div className="rounded-3xl glass p-4 border border-forest-100">
                <p className="text-xs text-forest-500 font-semibold">Verified / Active</p>
                <p className="font-display text-2xl font-extrabold text-leaf-600 mt-1">
                  {registeredFarmersList.filter((f: UserProfile) => f.status === 'active' || f.status === 'approved').length}
                </p>
              </div>
              <div className="rounded-3xl glass p-4 border border-forest-100">
                <p className="text-xs text-forest-500 font-semibold">Pending Verification</p>
                <p className="font-display text-2xl font-extrabold text-amber-600 mt-1">
                  {registeredFarmersList.filter((f: UserProfile) => f.status === 'pending').length}
                </p>
              </div>
              <div className="rounded-3xl glass p-4 border border-forest-100">
                <p className="text-xs text-forest-500 font-semibold">Total Registered Acres</p>
                <p className="font-display text-2xl font-extrabold text-forest-900 mt-1">
                  {registeredFarmersList.reduce((acc: number, f: UserProfile) => acc + (f.landAcres || 4), 0).toFixed(1)} Acres
                </p>
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 glass p-3 rounded-3xl border border-forest-100">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-forest-400" />
                <input
                  type="text"
                  value={farmerSearchQuery}
                  onChange={(e) => setFarmerSearchQuery(e.target.value)}
                  placeholder="Search by Farmer Name, Phone, Kisan ID, Village..."
                  className="w-full rounded-2xl border border-forest-200 py-2.5 pl-10 pr-4 text-xs font-bold text-forest-900 outline-none focus:border-leaf-500 bg-white/70"
                />
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
                <Filter className="h-4 w-4 text-forest-500 shrink-0 ml-2" />
                {(['all', 'active', 'pending'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFarmerFilterStatus(status)}
                    className={`rounded-xl px-3.5 py-2 text-xs font-bold capitalize transition ${
                      farmerFilterStatus === status
                        ? 'bg-forest-900 text-white shadow-sm'
                        : 'bg-white/80 text-forest-700 hover:bg-forest-100'
                    }`}
                  >
                    {status === 'all' ? 'All Farmers' : status === 'active' ? '🟢 Active' : '🟡 Pending'}
                  </button>
                ))}
              </div>
            </div>

            {/* Registered Farmers Table / Grid */}
            <div className="overflow-x-auto rounded-3xl border border-forest-100 bg-white/80 shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-forest-900 text-white font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4">Farmer Details</th>
                    <th className="p-4">Mobile Phone</th>
                    <th className="p-4">Kisan Card ID</th>
                    <th className="p-4">Village & District</th>
                    <th className="p-4">Primary Crop & Land</th>
                    <th className="p-4">Account Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-forest-100 font-medium">
                  {filteredFarmerDirectory.map((farmer: UserProfile) => (
                    <tr key={farmer.id} className="hover:bg-leaf-50/50 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          <div className="grid h-9 w-9 place-items-center rounded-xl bg-leaf-100 text-leaf-800 font-bold">
                            👨‍🌾
                          </div>
                          <div>
                            <p className="font-bold text-forest-950 text-sm">{farmer.fullName}</p>
                            <p className="text-[11px] text-forest-500">ID: {farmer.id}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 font-mono font-bold text-forest-900">
                        {farmer.phone || 'N/A'}
                      </td>

                      <td className="p-4 font-mono font-bold text-amber-900">
                        {farmer.kisanCardId || 'KC-AP-2026-8812'}
                      </td>

                      <td className="p-4">
                        <p className="font-bold text-forest-900">{farmer.village || 'Kankipadu'}</p>
                        <p className="text-[11px] text-forest-500">{farmer.district || 'Krishna'}, {farmer.state || 'Andhra Pradesh'}</p>
                      </td>

                      <td className="p-4">
                        <p className="font-bold text-forest-900">{farmer.primaryCrop || 'Paddy (Grade A)'}</p>
                        <p className="text-[11px] text-leaf-700 font-bold">{farmer.landAcres || 4.5} Acres</p>
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold ${
                            farmer.status === 'active' || farmer.status === 'approved'
                              ? 'bg-leaf-100 text-leaf-800 border border-leaf-300'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}
                        >
                          {farmer.status === 'active' || farmer.status === 'approved' ? '🟢 Verified / Active' : '🟡 Pending Verification'}
                        </span>
                      </td>

                      <td className="p-4 text-right space-x-1">
                        <a
                          href={`tel:${farmer.phone}`}
                          className="inline-flex items-center gap-1 rounded-xl bg-forest-100 px-3 py-1.5 text-[11px] font-bold text-forest-800 hover:bg-forest-200 transition"
                        >
                          <Phone className="h-3 w-3" /> Call
                        </a>
                        <button
                          onClick={() => {
                            setToastMsg(`✓ Farmer ${farmer.fullName} verified for procurement gate pass!`);
                            setTimeout(() => setToastMsg(null), 4000);
                          }}
                          className="rounded-xl bg-leaf-500 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm hover:bg-leaf-600 transition"
                        >
                          Verify Pass
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filteredFarmerDirectory.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-forest-500 font-medium">
                        No farmer profiles matching "{farmerSearchQuery}". Click "+ Register New Farmer" to add a new profile.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>
      )}

      {/* SECTION 3: OTHER STAFF SECTIONS (OPERATIONAL QUEUE, QUALITY, PAYMENTS) */}
      {staffSection === 'quality_check' && (
        <Reveal delay={80}>
          <div className="mt-6 space-y-6">
            <div className="flex items-center justify-between glass p-6 rounded-4xl border border-forest-100">
              <div>
                <span className="chip bg-blue-100 text-blue-800 font-extrabold text-[10px]">
                  🔬 Quality Inspection Console
                </span>
                <h2 className="mt-1 font-display text-2xl font-bold text-forest-950">
                  Moisture Testing & Grading Records
                </h2>
              </div>
            </div>

            <div className="overflow-x-auto rounded-3xl border border-forest-100 bg-white/60">
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
                          Edit Grade
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>
      )}

      {/* STAFF ADD NEW FARMER REGISTRATION MODAL */}
      {showAddFarmerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg rounded-5xl bg-white p-6 sm:p-8 shadow-2xl border border-forest-100 max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-start justify-between border-b border-forest-100 pb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-leaf-700">
                  Staff Administrative Registration
                </span>
                <h3 className="font-display text-xl font-bold text-forest-950 mt-0.5">
                  👨‍🌾 Register New Farmer Profile
                </h3>
                <p className="text-xs text-forest-600">
                  Enter farmer details to generate an official KisanConnect identity card and gate pass.
                </p>
              </div>
              <button
                onClick={() => setShowAddFarmerModal(false)}
                className="rounded-full p-2 text-forest-400 hover:bg-forest-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleStaffRegisterFarmerSubmit} className="mt-4 space-y-3 text-xs font-medium">
              <div>
                <label className="font-bold text-forest-900 block mb-1">Farmer Full Name *</label>
                <input
                  type="text"
                  required
                  value={newFarmerName}
                  onChange={(e) => setNewFarmerName(e.target.value)}
                  placeholder="e.g. Kondala Rao"
                  className="w-full rounded-xl border border-forest-200 p-2.5 font-bold outline-none focus:border-leaf-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-forest-900 block mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={newFarmerPhone}
                    onChange={(e) => setNewFarmerPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    className="w-full rounded-xl border border-forest-200 p-2.5 font-bold outline-none focus:border-leaf-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-forest-900 block mb-1">Kisan Card ID (Optional)</label>
                  <input
                    type="text"
                    value={newFarmerKisanId}
                    onChange={(e) => setNewFarmerKisanId(e.target.value)}
                    placeholder="KC-AP-2026-XXXX"
                    className="w-full rounded-xl border border-forest-200 p-2.5 font-bold outline-none focus:border-leaf-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-forest-900 block mb-1">Village Name *</label>
                  <input
                    type="text"
                    required
                    value={newFarmerVillage}
                    onChange={(e) => setNewFarmerVillage(e.target.value)}
                    placeholder="e.g. Kankipadu"
                    className="w-full rounded-xl border border-forest-200 p-2.5 font-bold outline-none focus:border-leaf-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-forest-900 block mb-1">District</label>
                  <input
                    type="text"
                    required
                    value={newFarmerDistrict}
                    onChange={(e) => setNewFarmerDistrict(e.target.value)}
                    placeholder="Krishna"
                    className="w-full rounded-xl border border-forest-200 p-2.5 font-bold outline-none focus:border-leaf-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-forest-900 block mb-1">Primary Crop</label>
                  <select
                    value={newFarmerCrop}
                    onChange={(e) => setNewFarmerCrop(e.target.value)}
                    className="w-full rounded-xl border border-forest-200 p-2.5 font-bold outline-none focus:border-leaf-500"
                  >
                    <option value="Paddy (Grade A)">Paddy (Grade A)</option>
                    <option value="Paddy (Common)">Paddy (Common)</option>
                    <option value="Cotton (Long Staple)">Cotton (Long Staple)</option>
                    <option value="Maize (Yellow)">Maize (Yellow)</option>
                    <option value="Chilly (Red)">Chilly (Red)</option>
                    <option value="Pulses / Bengal Gram">Pulses / Bengal Gram</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-forest-900 block mb-1">Land Holding (Acres)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newFarmerAcres}
                    onChange={(e) => setNewFarmerAcres(e.target.value)}
                    placeholder="4.5"
                    className="w-full rounded-xl border border-forest-200 p-2.5 font-bold outline-none focus:border-leaf-500 font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-forest-100">
                <button
                  type="button"
                  onClick={() => setShowAddFarmerModal(false)}
                  className="rounded-xl bg-forest-100 px-4 py-2.5 text-xs font-bold text-forest-700 hover:bg-forest-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={registeringFarmer}
                  className="btn-gold text-xs font-bold py-2.5 px-6 shadow-md flex items-center gap-1.5"
                >
                  {registeringFarmer ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  <span>Complete Farmer Registration</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
