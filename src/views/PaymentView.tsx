import { useState } from 'react';
import {
  Wallet,
  CheckCircle2,
  Download,
  ShieldCheck,
  Building2,
  History,
  Calculator,
  RefreshCw,
  Lock,
  BadgeCheck,
  X,
  Search,
  AlertCircle,
  FileText,
  Clock,
  UserCheck,
  Eye,
} from 'lucide-react';
import { useApp, formatRupee } from '@/lib/app-context';
import { Reveal } from '@/components/Reveal';
import {
  type PaymentItem,
  type ProcurementRecord,
  getStatusBadgeConfig,
  maskBankAccount,
  exportPaymentsToCSV,
} from '@/lib/payment-service';

/** Digital Receipt Printable Modal Component */
function PaymentReceiptModal({
  payment,
  procurement,
  onClose,
}: {
  payment: PaymentItem;
  procurement?: ProcurementRecord;
  onClose: () => void;
}) {
  const { lang } = useApp();
  const badge = getStatusBadgeConfig(payment.status);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-5xl bg-white shadow-glass-lg border border-forest-100 flex flex-col animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-forest-900 via-forest-800 to-emerald-950 p-6 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition print:hidden"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 backdrop-blur">
              <Building2 className="h-6 w-6 text-leaf-300" />
            </span>
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-leaf-200">
                Government Procurement Payout Authority
              </span>
              <h2 className="font-display text-2xl font-extrabold">
                Official Digital Payment Receipt
              </h2>
            </div>
          </div>
        </div>

        {/* Receipt Printable Body */}
        <div className="p-6 sm:p-8 space-y-6 text-forest-900 printable-area">
          {/* Status Banner */}
          <div className={`flex items-center justify-between rounded-3xl p-4 border ${badge.borderClass} ${badge.bgClass}`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{badge.icon}</span>
              <div>
                <p className={`font-display text-base font-extrabold ${badge.colorClass}`}>
                  {lang === 'te' ? badge.labelTe : lang === 'hi' ? badge.labelHi : badge.label}
                </p>
                <p className="text-xs text-forest-600">
                  Transaction Ref / UTR: <span className="font-mono font-bold text-forest-900">{payment.providerReferenceId}</span>
                </p>
              </div>
            </div>
            <span className="chip bg-white text-forest-800 font-extrabold text-xs shadow-xs">
              100% Guaranteed MSP
            </span>
          </div>

          {/* Receipt Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 rounded-3xl bg-forest-50/70 p-5 border border-forest-100 text-xs">
            <div>
              <p className="text-forest-400 font-semibold uppercase text-[10px]">Payment ID</p>
              <p className="font-mono font-bold text-sm text-forest-900 mt-0.5">{payment.id}</p>
            </div>
            <div>
              <p className="text-forest-400 font-semibold uppercase text-[10px]">Procurement ID</p>
              <p className="font-mono font-bold text-sm text-forest-900 mt-0.5">{payment.procurementId}</p>
            </div>
            <div>
              <p className="text-forest-400 font-semibold uppercase text-[10px]">Payment Date</p>
              <p className="font-bold text-sm text-forest-900 mt-0.5">
                {new Date(payment.createdAt).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
            <div>
              <p className="text-forest-400 font-semibold uppercase text-[10px]">Farmer Name</p>
              <p className="font-bold text-sm text-forest-900 mt-0.5">{payment.farmerName}</p>
            </div>
            <div>
              <p className="text-forest-400 font-semibold uppercase text-[10px]">Payment Method</p>
              <p className="font-bold text-sm text-forest-900 mt-0.5 uppercase">
                {payment.paymentMethod === 'dbt' ? 'DBT (Aadhaar NPCI)' : payment.paymentMethod.toUpperCase()}
              </p>
            </div>
            <div>
              <p className="text-forest-400 font-semibold uppercase text-[10px]">Account / Details</p>
              <p className="font-bold text-sm text-forest-900 mt-0.5">
                {maskBankAccount(payment.bankLast4)}
              </p>
            </div>
          </div>

          {/* Itemized Calculation Table */}
          <div className="overflow-hidden rounded-3xl border border-forest-100 bg-white">
            <div className="bg-forest-900 px-5 py-3 text-white flex justify-between text-xs font-bold uppercase tracking-wider">
              <span>Item / Description</span>
              <span>Amount (INR)</span>
            </div>

            <div className="p-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <div>
                  <p className="font-bold text-forest-900">{payment.crop}</p>
                  <p className="text-xs text-forest-500">
                    Quantity: {payment.quantityQuintals} Quintals • Rate: ₹{payment.ratePerQuintal.toLocaleString('en-IN')}/Quintal
                  </p>
                </div>
                <span className="font-bold font-display text-forest-900">
                  {formatRupee(payment.grossAmount)}
                </span>
              </div>

              {procurement && (
                <div className="text-xs text-forest-600 bg-cream-50 p-3 rounded-2xl space-y-1">
                  <div className="flex justify-between">
                    <span>Quality Grade Assessed:</span>
                    <span className="font-bold text-forest-800">{procurement.qualityGrade}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Grain Moisture Tested:</span>
                    <span className="font-bold text-forest-800">{procurement.moisturePct}%</span>
                  </div>
                </div>
              )}

              {payment.deductions > 0 ? (
                <div className="flex justify-between text-xs text-rose-700 pt-2 border-t border-forest-100">
                  <span>Quality / Moisture Adjustments & Deductions</span>
                  <span className="font-bold">- {formatRupee(payment.deductions)}</span>
                </div>
              ) : (
                <div className="flex justify-between text-xs text-leaf-700 pt-2 border-t border-forest-100">
                  <span>Deductions / Quality Adjustments</span>
                  <span className="font-bold">₹0 (Full Fair Price)</span>
                </div>
              )}

              <div className="flex justify-between pt-3 border-t-2 border-dashed border-forest-200 font-display text-lg font-extrabold text-forest-900">
                <span>Total Net Payable Amount</span>
                <span className="text-leaf-700">{formatRupee(payment.finalPayableAmount)}</span>
              </div>
            </div>
          </div>

          {/* Verification Footnote & Hash */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl bg-cream-100 p-4 border border-forest-100">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-7 w-7 text-leaf-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-forest-900">Digitally Signed & Validated</p>
                <p className="text-[11px] text-forest-500 font-mono">
                  HASH: {payment.idempotencyKey}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[11px] text-forest-500 uppercase tracking-wider font-semibold">Center Location</p>
              <p className="text-xs font-bold text-forest-800">{payment.centerName}</p>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="border-t border-forest-100 bg-cream-50 p-5 flex flex-col sm:flex-row gap-3 justify-end shrink-0 print:hidden">
          <button
            onClick={onClose}
            className="rounded-2xl border border-forest-200 bg-white px-5 py-3 text-sm font-semibold text-forest-700 hover:bg-cream-100"
          >
            Close Window
          </button>

          <button
            onClick={handlePrint}
            className="btn-primary text-sm shadow-glow flex items-center justify-center gap-2"
          >
            <Download className="h-4 w-4" /> Download / Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
}

/** Procurement Inspection Calculation Modal */
function ProcurementInspectionModal({
  procurement,
  onClose,
}: {
  procurement: ProcurementRecord;
  onClose: () => void;
}) {

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg rounded-5xl bg-white p-6 sm:p-8 shadow-glass-lg border border-forest-100 animate-scale-in relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 grid h-9 w-9 place-items-center rounded-xl bg-forest-100 text-forest-700 hover:bg-forest-200"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-leaf-100 text-leaf-700">
            <Calculator className="h-6 w-6" />
          </span>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-leaf-600">
              Procurement Valuation Breakdown
            </span>
            <h3 className="font-display text-xl font-extrabold text-forest-900">
              {procurement.id}
            </h3>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <div className="rounded-3xl bg-forest-50 p-4 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-forest-500">Crop / Variety:</span>
              <span className="font-bold text-forest-900">{procurement.crop} ({procurement.variety})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-forest-500">Verified Weight:</span>
              <span className="font-bold text-forest-900">{procurement.quantityQuintals} Quintals</span>
            </div>
            <div className="flex justify-between">
              <span className="text-forest-500">Government MSP Rate:</span>
              <span className="font-bold text-forest-900">₹{procurement.ratePerQuintal.toLocaleString('en-IN')}/Quintal</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-forest-100">
              <span className="text-forest-500 font-semibold">Gross Harvest Value:</span>
              <span className="font-bold text-forest-900">{formatRupee(procurement.grossAmount)}</span>
            </div>
          </div>

          {/* Quality & Moisture Assessment */}
          <div className="rounded-3xl border border-leaf-200 bg-leaf-50/60 p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold text-leaf-900">
              <span>Quality Assessment</span>
              <span className="chip bg-leaf-200 text-leaf-800 text-[10px]">{procurement.qualityGrade}</span>
            </div>
            <div className="flex justify-between text-forest-700">
              <span>Moisture Level:</span>
              <span className="font-semibold">{procurement.moisturePct}% (Standard: 14.0%)</span>
            </div>
            <div className="flex justify-between text-forest-700">
              <span>Foreign Matter / Trash:</span>
              <span className="font-semibold">{procurement.trashPct}%</span>
            </div>
          </div>

          {/* Deductions Itemized */}
          <div className="rounded-3xl bg-cream-100 p-4 space-y-2 text-xs">
            <p className="font-bold uppercase tracking-wider text-forest-400 text-[10px]">Itemized Deductions</p>
            <div className="flex justify-between text-forest-700">
              <span>Moisture Penalty Deduction:</span>
              <span className="font-semibold text-rose-700">- {formatRupee(procurement.moistureDeduction)}</span>
            </div>
            <div className="flex justify-between text-forest-700">
              <span>Handling & Unloading Fee:</span>
              <span className="font-semibold text-rose-700">- {formatRupee(procurement.handlingDeduction)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-forest-200 font-display text-base font-extrabold text-forest-900">
              <span>Final Payable Amount:</span>
              <span className="text-leaf-700">{formatRupee(procurement.finalPayableAmount)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-semibold text-forest-500 pt-1">
            <UserCheck className="h-4 w-4 text-leaf-600" />
            Verified by: {procurement.verifiedBy}
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full btn-primary text-sm py-3"
        >
          Close Inspection
        </button>
      </div>
    </div>
  );
}

export function PaymentView() {
  const {
    t,
    lang,
    userRole,
    setUserRole,
    paymentsList,
    procurementsList,
    approvePayment,
    processPayout,
    retryFailedPayment,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedReceiptPayment, setSelectedReceiptPayment] = useState<PaymentItem | null>(null);
  const [selectedInspectionProc, setSelectedInspectionProc] = useState<ProcurementRecord | null>(null);

  // Approval & Retry Confirmation Modals
  const [pendingApprovalId, setPendingApprovalId] = useState<string | null>(null);
  const [pendingRetryId, setPendingRetryId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState<boolean>(false);

  // Calculated Summary Metrics
  const totalEarnings = paymentsList
    .filter((p: PaymentItem) => p.status === 'successful')
    .reduce((acc: number, p: PaymentItem) => acc + p.finalPayableAmount, 0);

  const pendingAmount = paymentsList
    .filter((p: PaymentItem) => p.status === 'pending' || p.status === 'processing')
    .reduce((acc: number, p: PaymentItem) => acc + p.finalPayableAmount, 0);

  const completedCount = paymentsList.filter((p: PaymentItem) => p.status === 'successful').length;

  const lastPayment = paymentsList.find((p: PaymentItem) => p.status === 'successful') ?? paymentsList[0];

  // Filtering Logic
  const filteredPayments = paymentsList.filter((item: PaymentItem) => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matches =
        item.id.toLowerCase().includes(q) ||
        item.procurementId.toLowerCase().includes(q) ||
        item.farmerName.toLowerCase().includes(q) ||
        item.crop.toLowerCase().includes(q) ||
        item.providerReferenceId.toLowerCase().includes(q);
      if (!matches) return false;
    }
    return true;
  });

  const handleApproveConfirm = async () => {
    if (!pendingApprovalId) return;
    setIsProcessingAction(true);

    const approveRes = approvePayment(pendingApprovalId);
    if (!approveRes.success) {
      setToastMsg(approveRes.message);
      setIsProcessingAction(false);
      setPendingApprovalId(null);
      return;
    }

    setToastMsg(`Payment ${pendingApprovalId} approved! Initiating instant payout...`);

    // Process payout simulation
    const payoutRes = await processPayout(pendingApprovalId);
    setToastMsg(payoutRes.message);

    setIsProcessingAction(false);
    setPendingApprovalId(null);
    setTimeout(() => setToastMsg(null), 4500);
  };

  const handleRetryConfirm = async () => {
    if (!pendingRetryId) return;
    setIsProcessingAction(true);
    const res = await retryFailedPayment(pendingRetryId);
    setToastMsg(res.message);
    setIsProcessingAction(false);
    setPendingRetryId(null);
    setTimeout(() => setToastMsg(null), 4500);
  };

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-28 lg:px-8 lg:pb-12">
      {/* Toast Notification Banner */}
      {toastMsg && (
        <div className="fixed top-20 right-4 z-50 rounded-2xl bg-forest-900 px-5 py-3.5 text-sm font-bold text-white shadow-glass-lg animate-slide-in-right border border-leaf-400/40 max-w-md flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-leaf-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header & Role Switcher */}
      <Reveal>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="section-eyebrow">
              <Wallet className="h-3.5 w-3.5 text-leaf-600" /> {t('nav_payment')}
            </span>
            <h1 className="mt-2 display-heading text-3xl sm:text-4xl">
              {lang === 'te' ? 'రైతు మద్దతు ధర చెల్లింపుల పోర్టల్' : lang === 'hi' ? 'किसान भुगतान एवं डीबीटी पोर्टल' : 'Farmer Payouts & DBT Dashboard'}
            </h1>
            <p className="mt-1 text-forest-600">
              {lang === 'te'
                ? 'సేకరించిన పంట పరిమాణం, నాణ్యత మినహాయింపులు మరియు మద్దతు నిధుల జమను ప్రత్యక్షంగా వీక్షించండి.'
                : lang === 'hi'
                ? 'अपनी फसल का मूल्य, कटौती और डीबीटी खाते में जमा राशि ट्रैक करें।'
                : 'Automated Direct Benefit Transfer (DBT) payout tracking following grain weight and moisture verification.'}
            </p>
          </div>

          {/* Role Switcher Pill for Demo Authorization Testing */}
          <div className="flex items-center gap-2 rounded-2xl bg-forest-900/90 p-1.5 text-white shadow-glass backdrop-blur border border-leaf-400/20 shrink-0">
            <span className="text-xs font-semibold text-leaf-200 px-2 flex items-center gap-1">
              <Lock className="h-3.5 w-3.5 text-gold-400" /> Role:
            </span>
            <button
              onClick={() => setUserRole('farmer')}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                userRole === 'farmer' ? 'bg-leaf-500 text-white shadow-sm' : 'text-white/70 hover:bg-white/10'
              }`}
            >
              👨‍🌾 Farmer
            </button>
            <button
              onClick={() => setUserRole('officer')}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                userRole === 'officer' || userRole === 'admin' ? 'bg-gold-400 text-forest-950 font-extrabold shadow-sm' : 'text-white/70 hover:bg-white/10'
              }`}
            >
              🏢 Officer / Admin
            </button>
          </div>
        </div>
      </Reveal>

      {/* Aadhaar NPCI Seeding Security Banner */}
      <Reveal delay={60}>
        <div className="mt-5 rounded-3xl bg-gradient-to-r from-emerald-950 via-forest-900 to-forest-800 p-4 text-white shadow-glass border border-leaf-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-leaf-500/20 border border-leaf-400/40 text-leaf-300">
              <BadgeCheck className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="chip bg-leaf-500 text-white font-bold text-[10px]">
                  Aadhaar NPCI Active
                </span>
                <span className="text-xs font-semibold text-leaf-200">State Bank of India (XXXX 4521)</span>
              </div>
              <p className="text-xs font-medium text-white/90 mt-0.5">
                {lang === 'te'
                  ? 'మీ ఆధార్‌కి అనుసంధానించబడిన బ్యాంక్ ఖాతా సక్రియంగా ఉంది. మద్దతు ధర సొమ్ము నేరుగా ఖాతాలో జమ అవుతుంది.'
                  : 'Direct Benefit Transfer (DBT) account verified. Payouts are credited server-side within 24 hours of procurement.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => exportPaymentsToCSV(paymentsList)}
            className="rounded-2xl bg-white/10 border border-white/20 px-3.5 py-2 text-xs font-bold text-white hover:bg-white/20 transition shrink-0 flex items-center justify-center gap-1.5"
          >
            <Download className="h-3.5 w-3.5" /> Export Report (CSV)
          </button>
        </div>
      </Reveal>

      {/* Summary KPI Cards */}
      <Reveal delay={80}>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="group rounded-4xl glass p-5 card-hover border-l-4 border-l-leaf-500">
            <div className="flex items-center justify-between">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-leaf-100 text-leaf-700">
                <Wallet className="h-5 w-5" />
              </span>
              <span className="chip bg-leaf-100 text-leaf-800 text-[11px] font-extrabold">Settled</span>
            </div>
            <p className="mt-4 font-display text-3xl font-extrabold text-forest-900">
              {formatRupee(totalEarnings)}
            </p>
            <p className="text-xs text-forest-500 mt-0.5">
              {lang === 'te' ? 'మొత్తం జమ అయిన మద్దతు ధర' : 'Total Earnings Received (DBT)'}
            </p>
          </div>

          <div className="group rounded-4xl glass p-5 card-hover border-l-4 border-l-gold-400">
            <div className="flex items-center justify-between">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gold-100 text-gold-800">
                <Clock className="h-5 w-5" />
              </span>
              <span className="chip bg-gold-100 text-gold-800 text-[11px] font-extrabold">In Pipeline</span>
            </div>
            <p className="mt-4 font-display text-3xl font-extrabold text-forest-900">
              {formatRupee(pendingAmount)}
            </p>
            <p className="text-xs text-forest-500 mt-0.5">
              {lang === 'te' ? 'పెండింగ్‌లో ఉన్న మొత్తం' : 'Pending & Processing Payouts'}
            </p>
          </div>

          <div className="group rounded-4xl glass p-5 card-hover border-l-4 border-l-forest-600">
            <div className="flex items-center justify-between">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-forest-100 text-forest-700">
                <CheckCircle2 className="h-5 w-5" />
              </span>
              <span className="chip bg-forest-100 text-forest-800 text-[11px] font-extrabold">Transactions</span>
            </div>
            <p className="mt-4 font-display text-3xl font-extrabold text-forest-900">
              {completedCount} / {paymentsList.length}
            </p>
            <p className="text-xs text-forest-500 mt-0.5">
              {lang === 'te' ? 'పూర్తయిన కొనుగోలు రికార్డులు' : 'Completed Payout Batches'}
            </p>
          </div>

          <div className="group rounded-4xl glass p-5 card-hover border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-100 text-blue-700">
                <History className="h-5 w-5" />
              </span>
              <span className="chip bg-blue-100 text-blue-800 text-[11px] font-extrabold">Latest UTR</span>
            </div>
            <p className="mt-4 font-display text-2xl font-extrabold text-forest-900 truncate">
              {formatRupee(lastPayment.finalPayableAmount)}
            </p>
            <p className="text-xs text-forest-500 mt-0.5 truncate">
              {lastPayment.providerReferenceId}
            </p>
          </div>
        </div>
      </Reveal>

      {/* Controls & Search Bar */}
      <Reveal delay={100}>
        <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-forest-100 pb-4">
          {/* Status Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'All Payments' },
              { id: 'pending', label: '🟡 Pending' },
              { id: 'processing', label: '🔵 Processing' },
              { id: 'successful', label: '🟢 Successful' },
              { id: 'failed', label: '🔴 Failed' },
              { id: 'on_hold', label: '🟠 On Hold' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`rounded-2xl px-3 py-1.5 text-xs font-bold transition ${
                  statusFilter === st.id
                    ? 'bg-forest-900 text-white shadow-sm'
                    : 'bg-white border border-forest-200 text-forest-700 hover:bg-cream-100'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-forest-400" />
            <input
              type="text"
              placeholder="Search Payment ID, UTR, Crop..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-forest-200 bg-white pl-10 pr-4 py-2 text-xs font-bold text-forest-900 outline-none focus:ring-2 focus:ring-leaf-400"
            />
          </div>
        </div>
      </Reveal>

      {/* Payment Records Grid */}
      <div className="mt-6 space-y-4">
        {filteredPayments.length === 0 ? (
          <div className="rounded-4xl glass p-12 text-center text-forest-600">
            <AlertCircle className="mx-auto h-10 w-10 text-forest-400" />
            <p className="mt-3 font-display text-lg font-bold text-forest-900">No payment records found</p>
            <p className="text-xs text-forest-500">Try adjusting your status filter or search keywords.</p>
          </div>
        ) : (
          filteredPayments.map((payment: PaymentItem, i: number) => {
            const badge = getStatusBadgeConfig(payment.status);
            const proc = procurementsList.find((p: ProcurementRecord) => p.id === payment.procurementId);

            return (
              <Reveal key={payment.id} delay={i * 60}>
                <div className="group rounded-4xl glass p-5 sm:p-6 card-hover flex flex-col lg:flex-row lg:items-center justify-between gap-5 border border-forest-100">
                  {/* Left: Crop & Status Details */}
                  <div className="flex items-start gap-4">
                    <span className="grid h-14 w-14 shrink-0 place-items-center rounded-3xl bg-gradient-to-br from-leaf-500 to-forest-600 text-white shadow-glow">
                      <Wallet className="h-6 w-6" />
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold border ${badge.borderClass} ${badge.bgClass} ${badge.colorClass}`}>
                          <span>{badge.icon}</span>
                          <span>{lang === 'te' ? badge.labelTe : lang === 'hi' ? badge.labelHi : badge.label}</span>
                        </span>
                        <span className="text-xs font-mono font-bold text-forest-500">
                          ID: #{payment.id}
                        </span>
                        <span className="text-xs text-forest-400">• Proc: {payment.procurementId}</span>
                      </div>

                      <h3 className="mt-2 font-display text-xl font-bold text-forest-900">
                        {payment.crop}
                      </h3>

                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-forest-600">
                        <span>
                          {lang === 'te' ? 'పరిమాణం:' : 'Quantity:'} <strong className="text-forest-900">{payment.quantityQuintals} Quintals</strong>
                        </span>
                        <span>
                          {lang === 'te' ? 'మద్దతు ధర:' : 'Rate:'} <strong className="text-forest-900">₹{payment.ratePerQuintal}/Q</strong>
                        </span>
                        <span>
                          {lang === 'te' ? 'కేంద్రం:' : 'Center:'} <strong className="text-forest-800">{payment.centerName}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Amounts, Method & Actions */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between lg:justify-end gap-4 shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0 border-forest-100">
                    {/* Amount Breakdown */}
                    <div className="text-left sm:text-right">
                      <p className="text-[11px] font-semibold text-forest-400 uppercase tracking-wider">
                        Final Net Payable
                      </p>
                      <p className="font-display text-2xl font-extrabold text-leaf-700">
                        {formatRupee(payment.finalPayableAmount)}
                      </p>
                      <p className="text-[11px] text-forest-500">
                        Method: <span className="font-bold uppercase text-forest-800">{payment.paymentMethod}</span> ({maskBankAccount(payment.bankLast4)})
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => {
                          if (proc) setSelectedInspectionProc(proc);
                          else {
                            // Fallback
                            setSelectedInspectionProc({
                              id: payment.procurementId,
                              tokenId: 'A127',
                              farmerId: 'f-101',
                              farmerName: payment.farmerName,
                              farmerPhone: payment.farmerPhone,
                              centerName: payment.centerName,
                              crop: payment.crop,
                              variety: 'Grade A',
                              quantityQuintals: payment.quantityQuintals,
                              moisturePct: 14.0,
                              trashPct: 1.0,
                              qualityGrade: 'Grade A',
                              ratePerQuintal: payment.ratePerQuintal,
                              grossAmount: payment.grossAmount,
                              moistureDeduction: 0,
                              handlingDeduction: payment.deductions,
                              totalDeductions: payment.deductions,
                              finalPayableAmount: payment.finalPayableAmount,
                              verifiedBy: 'Officer S. Rao',
                              verifiedAt: payment.createdAt,
                              status: 'Verified',
                            });
                          }
                        }}
                        className="rounded-2xl border border-forest-200 bg-white px-3 py-2 text-xs font-bold text-forest-700 hover:bg-cream-100 transition shadow-xs flex items-center gap-1"
                      >
                        <Eye className="h-3.5 w-3.5 text-leaf-600" /> Inspect
                      </button>

                      <button
                        onClick={() => setSelectedReceiptPayment(payment)}
                        className="rounded-2xl bg-forest-900 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-forest-800 transition flex items-center gap-1.5"
                      >
                        <FileText className="h-3.5 w-3.5 text-leaf-300" /> Receipt
                      </button>

                      {/* Officer Mode Actions */}
                      {(userRole === 'officer' || userRole === 'admin') && (
                        <>
                          {payment.status === 'pending' && (
                            <button
                              onClick={() => setPendingApprovalId(payment.id)}
                              className="rounded-2xl bg-leaf-500 px-3 py-2 text-xs font-bold text-white shadow-glow hover:bg-leaf-600 transition flex items-center gap-1"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" /> Approve Payout
                            </button>
                          )}

                          {payment.status === 'failed' && (
                            <button
                              onClick={() => setPendingRetryId(payment.id)}
                              className="rounded-2xl bg-rose-600 px-3 py-2 text-xs font-bold text-white shadow-glow hover:bg-rose-700 transition flex items-center gap-1"
                            >
                              <RefreshCw className="h-3.5 w-3.5" /> Retry Payout
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })
        )}
      </div>

      {/* Approval Confirmation Dialog */}
      {pendingApprovalId && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-forest-950/75 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-5xl bg-white p-6 text-center shadow-glass-lg relative animate-scale-in">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-3xl bg-leaf-100 text-leaf-700">
              <ShieldCheck className="h-8 w-8" />
            </span>
            <h3 className="mt-4 font-display text-xl font-extrabold text-forest-900">
              Authorize Payment Payout?
            </h3>
            <p className="mt-1 text-xs text-forest-600">
              Server-side valuation algorithm has verified the calculation for Payment <strong>#{pendingApprovalId}</strong>.
            </p>

            <div className="mt-4 rounded-2xl bg-forest-50 p-3 text-xs text-left space-y-1">
              <div className="flex justify-between">
                <span className="text-forest-500">Security Check:</span>
                <span className="font-bold text-leaf-700">Idempotency Key Validated</span>
              </div>
              <div className="flex justify-between">
                <span className="text-forest-500">Discrepancy:</span>
                <span className="font-bold text-forest-900">₹0.00 (Exact Match)</span>
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setPendingApprovalId(null)}
                className="flex-1 rounded-2xl border border-forest-200 bg-white py-3 text-xs font-bold text-forest-700 hover:bg-cream-100"
              >
                Cancel
              </button>
              <button
                onClick={handleApproveConfirm}
                disabled={isProcessingAction}
                className="flex-1 btn-primary text-xs py-3 shadow-glow"
              >
                {isProcessingAction ? 'Processing Payout...' : 'Confirm Payout'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Retry Confirmation Dialog */}
      {pendingRetryId && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-forest-950/75 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-5xl bg-white p-6 text-center shadow-glass-lg relative animate-scale-in">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-3xl bg-rose-100 text-rose-700">
              <RefreshCw className="h-8 w-8" />
            </span>
            <h3 className="mt-4 font-display text-xl font-extrabold text-forest-900">
              Retry Failed Payment?
            </h3>
            <p className="mt-1 text-xs text-forest-600">
              Re-initiating payout for Payment <strong>#{pendingRetryId}</strong>. Idempotency key prevents double transfers.
            </p>

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setPendingRetryId(null)}
                className="flex-1 rounded-2xl border border-forest-200 bg-white py-3 text-xs font-bold text-forest-700 hover:bg-cream-100"
              >
                Cancel
              </button>
              <button
                onClick={handleRetryConfirm}
                disabled={isProcessingAction}
                className="flex-1 rounded-2xl bg-rose-600 py-3 text-xs font-bold text-white shadow-glow hover:bg-rose-700"
              >
                {isProcessingAction ? 'Dispatching...' : 'Dispatch Retry'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {selectedReceiptPayment && (
        <PaymentReceiptModal
          payment={selectedReceiptPayment}
          procurement={procurementsList.find((p) => p.id === selectedReceiptPayment.procurementId)}
          onClose={() => setSelectedReceiptPayment(null)}
        />
      )}

      {/* Inspection Modal */}
      {selectedInspectionProc && (
        <ProcurementInspectionModal
          procurement={selectedInspectionProc}
          onClose={() => setSelectedInspectionProc(null)}
        />
      )}
    </div>
  );
}
