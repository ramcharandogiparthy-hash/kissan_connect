import React, { useState, useEffect } from 'react';
import {
  Sprout,
  Lock,
  ArrowRight,
  ShieldCheck,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Crown,
  Phone,
  Building2,
  Clock,
  X,
  Eye,
  EyeOff,
  Smartphone,
  Mail,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { Reveal } from '@/components/Reveal';
import type { Lang } from '@/lib/data';
import type { UserRole } from '@/lib/auth-service';

const FIELD_IMG =
  'https://images.pexels.com/photos/20313652/pexels-photo-20313652.jpeg?auto=compress&cs=tinysrgb&w=1920';

type RolePortal = 'farmer' | 'staff' | 'admin';

/**
 * Reusable Real-Time OTP Input Box Component
 * Features:
 * - 6-digit input with auto-advance & backspace navigation
 * - Auto-submit when all 6 digits are typed
 * - WebOTP API integration for mobile SMS reading
 * - Sandbox Quick-Fill Test Badge
 * - Visual countdown timer & progress bar
 */
function RealtimeOtpBox({
  otp,
  setOtp,
  timer,
  loading,
  testOtp,
  onVerify,
  onResend,
  onChangePhone,
  phone,
  roleLabel,
}: {
  otp: string[];
  setOtp: (otp: string[]) => void;
  timer: number;
  loading: boolean;
  testOtp?: string;
  onVerify: (code: string) => void;
  onResend: () => void;
  onChangePhone: () => void;
  phone: string;
  roleLabel: string;
}) {
  // WebOTP API: Auto-read SMS OTP on supported mobile browsers
  useEffect(() => {
    if ('OTPCredential' in window) {
      const ac = new AbortController();
      (navigator.credentials as any)
        .get({
          otp: { transport: ['sms'] },
          signal: ac.signal,
        })
        .then((otpObj: any) => {
          if (otpObj && otpObj.code) {
            const digits = otpObj.code.replace(/\D/g, '').slice(0, 6).split('');
            if (digits.length === 6) {
              setOtp(digits);
              onVerify(digits.join(''));
            }
          }
        })
        .catch(() => {});
      return () => ac.abort();
    }
  }, [setOtp, onVerify]);

  const handleDigitChange = (idx: number, val: string) => {
    const cleanVal = val.replace(/\D/g, '');
    const newOtp = [...otp];
    newOtp[idx] = cleanVal;
    setOtp(newOtp);

    // Auto-advance focus to next input
    if (cleanVal && idx < 5) {
      const nextInput = document.getElementById(`otp-input-${roleLabel}-${idx + 1}`);
      nextInput?.focus();
    }

    // Auto-submit when all 6 digits are filled
    const fullCode = newOtp.join('');
    if (fullCode.length === 6 && !newOtp.includes('')) {
      onVerify(fullCode);
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      const prevInput = document.getElementById(`otp-input-${roleLabel}-${idx - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length > 0) {
      const newOtp = [...otp];
      for (let i = 0; i < 6; i++) {
        newOtp[i] = pastedData[i] || '';
      }
      setOtp(newOtp);
      if (pastedData.length === 6) {
        onVerify(pastedData);
      } else {
        const focusIdx = Math.min(pastedData.length, 5);
        document.getElementById(`otp-input-${roleLabel}-${focusIdx}`)?.focus();
      }
    }
  };

  const fillTestOtp = () => {
    if (testOtp && testOtp.length === 6) {
      const digits = testOtp.split('');
      setOtp(digits);
      onVerify(testOtp);
    }
  };

  const timerPct = Math.max(0, Math.min(100, (timer / 60) * 100));

  return (
    <div className="space-y-4">
      {/* Top phone header & Change Number */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-leaf-200 flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Enter 6-Digit Real-Time OTP</span>
        </label>
        <button
          type="button"
          onClick={onChangePhone}
          className="text-xs font-bold text-gold-300 hover:underline flex items-center gap-1"
        >
          <span>Change Number (+91 {phone})</span>
        </button>
      </div>

      {/* Sandbox Test OTP Auto-fill Badge */}
      {testOtp && (
        <div className="rounded-2xl bg-emerald-500/20 border border-emerald-400/40 p-3 flex items-center justify-between text-xs backdrop-blur-md animate-pulse">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-300 shrink-0" />
            <span className="text-emerald-100 font-medium">
              Sandbox Test Code: <strong className="font-mono text-white text-sm tracking-wider">{testOtp}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={fillTestOtp}
            className="rounded-xl bg-emerald-500 px-3 py-1.5 font-bold text-white shadow-sm hover:bg-emerald-400 transition shrink-0"
          >
            ⚡ Auto-Fill & Verify
          </button>
        </div>
      )}

      {/* 6 Digit OTP Inputs */}
      <div className="flex justify-between gap-2 my-4">
        {otp.map((digit, idx) => (
          <input
            key={idx}
            id={`otp-input-${roleLabel}-${idx}`}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            onPaste={handlePaste}
            onChange={(e) => handleDigitChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            className="w-11 h-14 sm:w-12 sm:h-14 text-center rounded-2xl border border-white/20 bg-white/10 font-mono text-2xl font-black text-white outline-none focus:border-gold-400 focus:bg-white/20 focus:scale-105 transition-all shadow-inner"
          />
        ))}
      </div>

      {/* Animated Timer Progress Bar */}
      <div className="space-y-1.5">
        <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-leaf-400 via-gold-400 to-emerald-400 transition-all duration-1000 ease-linear"
            style={{ width: `${timerPct}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs font-semibold text-forest-200">
          <span className="text-[11px] text-white/70">Didn't receive SMS?</span>
          {timer > 0 ? (
            <span className="text-forest-300 font-mono flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-gold-300" />
              <span>Resend in {timer}s</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={onResend}
              disabled={loading}
              className="text-gold-300 font-bold hover:underline flex items-center gap-1 disabled:opacity-50"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Resend OTP SMS</span>
            </button>
          )}
        </div>
      </div>

      {/* Verify Submit Button */}
      <button
        type="button"
        onClick={() => onVerify(otp.join(''))}
        disabled={loading || otp.join('').length < 6}
        className="w-full rounded-2xl bg-gradient-to-r from-leaf-500 via-emerald-600 to-teal-600 py-4 text-sm font-bold text-white shadow-glow hover:brightness-110 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5 text-gold-300" />}
        <span>Verify & Authenticate</span>
      </button>
    </div>
  );
}

export function AuthView() {
  const {
    lang,
    setLang,
    sendRoleOTP,
    verifyRoleOTP,
    completeFarmerProfileSetup,
    submitStaffRegistration,
    loginStaffWithEmail,
    loginAdminWithEmail,
  } = useApp();

  // Active Role Portal Tab: 'farmer' | 'staff' | 'admin'
  const [activePortal, setActivePortal] = useState<RolePortal>('farmer');

  // ==========================================
  // FARMER AUTH & REGISTRATION STATE
  // ==========================================
  const [farmerAuthMode, setFarmerAuthMode] = useState<'otp' | 'register'>('otp');
  const [farmerPhone, setFarmerPhone] = useState('9876543210');
  const [farmerOtpStep, setFarmerOtpStep] = useState<'phone' | 'otp' | 'profile_setup'>('phone');
  const [farmerOtp, setFarmerOtp] = useState(['', '', '', '', '', '']);
  const [farmerOtpTimer, setFarmerOtpTimer] = useState(60);
  const [farmerSessionId, setFarmerSessionId] = useState<string | undefined>();
  const [farmerTestOtp, setFarmerTestOtp] = useState<string | undefined>();
  const [newFarmerUserId, setNewFarmerUserId] = useState<string | undefined>();

  // Farmer profile setup / registration details
  const [farmerName, setFarmerName] = useState('Ravi Kumar');
  const [farmerRegPhone, setFarmerRegPhone] = useState('9876543210');
  const [farmerCrop, setFarmerCrop] = useState('Paddy (Grade A)');
  const [farmerLandAcres, setFarmerLandAcres] = useState('4.5');
  const [farmerVillage, setFarmerVillage] = useState('Kankipadu');
  const [farmerDistrict, setFarmerDistrict] = useState('Krishna');
  const [farmerState, setFarmerState] = useState('Andhra Pradesh');

  // ==========================================
  // STAFF AUTH STATE (Email & Password Default)
  // ==========================================
  const [staffAuthMode, setStaffAuthMode] = useState<'otp' | 'password'>('password');
  const [staffPhone, setStaffPhone] = useState('9440199887');
  const [staffOtpStep, setStaffOtpStep] = useState<'phone' | 'otp'>('phone');
  const [staffOtp, setStaffOtp] = useState(['', '', '', '', '', '']);
  const [staffOtpTimer, setStaffOtpTimer] = useState(60);
  const [staffSessionId, setStaffSessionId] = useState<string | undefined>();
  const [staffTestOtp, setStaffTestOtp] = useState<string | undefined>();

  const [staffEmail, setStaffEmail] = useState('staff@kisanconnect.com');
  const [staffPassword, setStaffPassword] = useState('staff123');
  const [showStaffPassword, setShowStaffPassword] = useState(false);
  const [showStaffRegModal, setShowStaffRegModal] = useState(false);

  // Staff Registration Form
  const [staffRegName, setStaffRegName] = useState('');
  const [staffRegEmail, setStaffRegEmail] = useState('');
  const [staffRegPhone, setStaffRegPhone] = useState('');
  const [staffRegId, setStaffRegId] = useState('');
  const [staffRegDept, setStaffRegDept] = useState('Quality & Procurement');
  const [staffRegCenter, setStaffRegCenter] = useState('Vijayawada Procurement Center A');
  const [staffRegDesignation, setStaffRegDesignation] = useState('Procurement Officer');
  const [staffRegPassword, setStaffRegPassword] = useState('');
  const [staffRegConfirmPass, setStaffRegConfirmPass] = useState('');
  const [showStaffRegPassword, setShowStaffRegPassword] = useState(false);
  const [showStaffRegConfirmPass, setShowStaffRegConfirmPass] = useState(false);

  // Submitted Staff Request confirmation modal
  const [submittedStaffReq, setSubmittedStaffReq] = useState<{ id: string; staffId: string } | null>(null);

  // ==========================================
  // ADMIN AUTH STATE (Email & Password Default)
  // ==========================================
  const [adminAuthMode, setAdminAuthMode] = useState<'otp' | 'password'>('password');
  const [adminPhone, setAdminPhone] = useState('9999988888');
  const [adminOtpStep, setAdminOtpStep] = useState<'phone' | 'otp'>('phone');
  const [adminOtp, setAdminOtp] = useState(['', '', '', '', '', '']);
  const [adminOtpTimer, setAdminOtpTimer] = useState(60);
  const [adminSessionId, setAdminSessionId] = useState<string | undefined>();
  const [adminTestOtp, setAdminTestOtp] = useState<string | undefined>();

  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Common UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // OTP Timers Countdown Effects
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (farmerOtpStep === 'otp' && farmerOtpTimer > 0) {
      interval = setInterval(() => setFarmerOtpTimer((t) => t - 1), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [farmerOtpStep, farmerOtpTimer]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (staffOtpStep === 'otp' && staffOtpTimer > 0) {
      interval = setInterval(() => setStaffOtpTimer((t) => t - 1), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [staffOtpStep, staffOtpTimer]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (adminOtpStep === 'otp' && adminOtpTimer > 0) {
      interval = setInterval(() => setAdminOtpTimer((t) => t - 1), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [adminOtpStep, adminOtpTimer]);

  // ==========================================
  // HANDLERS FOR FARMER OTP
  // ==========================================
  const handleSendFarmerOtpSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    const cleanPhone = farmerPhone.trim().replace(/\D/g, '');

    if (!cleanPhone || cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setLoading(true);
    const res = await sendRoleOTP(`+91${cleanPhone}`, 'farmer');
    setLoading(false);

    if (res.success) {
      setFarmerSessionId(res.sessionId);
      setFarmerTestOtp(res.testOtp);
      setFarmerOtpStep('otp');
      setFarmerOtp(['', '', '', '', '', '']);
      setFarmerOtpTimer(60);
      setSuccessMsg(res.message);
    } else {
      setError(res.message);
    }
  };

  const handleVerifyFarmerOtpSubmit = async (enteredCode: string) => {
    setError(null);
    setSuccessMsg(null);

    if (enteredCode.length < 6) {
      setError('Please enter the complete 6-digit OTP code.');
      return;
    }

    setLoading(true);
    const res = await verifyRoleOTP(`+91${farmerPhone.replace(/\D/g, '')}`, enteredCode, 'farmer', farmerSessionId);
    setLoading(false);

    if (res.success) {
      if (res.isExisting) {
        setSuccessMsg('✓ Verified successfully! Redirecting to your Farmer Dashboard...');
      } else {
        setNewFarmerUserId(res.userId);
        setFarmerOtpStep('profile_setup');
        setSuccessMsg('✓ Mobile OTP Verified! Please complete your farmer profile setup below.');
      }
    } else {
      setError(res.message);
    }
  };

  // ==========================================
  // HANDLERS FOR STAFF OTP
  // ==========================================
  const handleSendStaffOtpSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    const cleanPhone = staffPhone.trim().replace(/\D/g, '');

    if (!cleanPhone || cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit staff mobile number.');
      return;
    }

    setLoading(true);
    const res = await sendRoleOTP(`+91${cleanPhone}`, 'staff');
    setLoading(false);

    if (res.success) {
      setStaffSessionId(res.sessionId);
      setStaffTestOtp(res.testOtp);
      setStaffOtpStep('otp');
      setStaffOtp(['', '', '', '', '', '']);
      setStaffOtpTimer(60);
      setSuccessMsg(res.message);
    } else {
      setError(res.message);
    }
  };

  const handleVerifyStaffOtpSubmit = async (enteredCode: string) => {
    setError(null);
    setSuccessMsg(null);

    if (enteredCode.length < 6) {
      setError('Please enter the complete 6-digit staff OTP.');
      return;
    }

    setLoading(true);
    const res = await verifyRoleOTP(`+91${staffPhone.replace(/\D/g, '')}`, enteredCode, 'staff', staffSessionId);
    setLoading(false);

    if (res.success) {
      setSuccessMsg(res.message);
    } else {
      setError(res.message);
    }
  };

  // ==========================================
  // HANDLERS FOR ADMIN OTP
  // ==========================================
  const handleSendAdminOtpSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    const cleanPhone = adminPhone.trim().replace(/\D/g, '');

    if (!cleanPhone || cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit Admin mobile number.');
      return;
    }

    setLoading(true);
    const res = await sendRoleOTP(`+91${cleanPhone}`, 'admin');
    setLoading(false);

    if (res.success) {
      setAdminSessionId(res.sessionId);
      setAdminTestOtp(res.testOtp);
      setAdminOtpStep('otp');
      setAdminOtp(['', '', '', '', '', '']);
      setAdminOtpTimer(60);
      setSuccessMsg(res.message);
    } else {
      setError(res.message);
    }
  };

  const handleVerifyAdminOtpSubmit = async (enteredCode: string) => {
    setError(null);
    setSuccessMsg(null);

    if (enteredCode.length < 6) {
      setError('Please enter the complete 6-digit admin OTP code.');
      return;
    }

    setLoading(true);
    const res = await verifyRoleOTP(`+91${adminPhone.replace(/\D/g, '')}`, enteredCode, 'admin', adminSessionId);
    setLoading(false);

    if (res.success) {
      setSuccessMsg(res.message);
    } else {
      setError(res.message);
    }
  };

  // Handle Complete Farmer Profile Setup
  const handleCompleteFarmerProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!farmerName.trim() || !farmerVillage.trim() || !farmerDistrict.trim() || !farmerState.trim()) {
      setError('Please fill in all mandatory profile fields.');
      return;
    }

    setLoading(true);
    const res = await completeFarmerProfileSetup({
      phone: `+91${farmerPhone.replace(/\D/g, '')}`,
      fullName: farmerName.trim(),
      village: farmerVillage.trim(),
      district: farmerDistrict.trim(),
      state: farmerState.trim(),
      preferredLanguage: lang,
      userId: newFarmerUserId,
    });
    setLoading(false);

    if (res.success) {
      setSuccessMsg(res.message);
    } else {
      setError(res.message);
    }
  };

  // Handle Direct New Farmer Registration Submit
  const handleDirectFarmerRegSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanPhone = farmerRegPhone.trim().replace(/\D/g, '');

    if (!farmerName.trim() || !cleanPhone || cleanPhone.length < 10 || !farmerVillage.trim() || !farmerDistrict.trim() || !farmerState.trim()) {
      setError('Please fill in all mandatory farmer registration details including a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    const res = await completeFarmerProfileSetup({
      phone: `+91 ${cleanPhone}`,
      fullName: farmerName.trim(),
      village: farmerVillage.trim(),
      district: farmerDistrict.trim(),
      state: farmerState.trim(),
      preferredLanguage: lang,
      primaryCrop: farmerCrop,
      landAcres: parseFloat(farmerLandAcres) || 3.5,
      autoLogin: false,
    });
    setLoading(false);

    if (res.success) {
      setFarmerPhone(cleanPhone);
      setFarmerAuthMode('otp');
      setFarmerOtpStep('phone');
      setSuccessMsg(
        `✓ Farmer Registered Successfully! Assigned Kisan Card ID: ${res.kisanCardId || res.profile?.kisanCardId}. Your mobile number (+91 ${cleanPhone}) is pre-filled below. Click "Send Real-Time OTP" to log in.`
      );
    } else {
      setError(res.message);
    }
  };

  // Handle Staff Email Login Submit
  const handleStaffLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!staffEmail || !staffPassword) {
      setError('Please enter your official email and password.');
      return;
    }

    setLoading(true);
    const res = await loginStaffWithEmail(staffEmail, staffPassword);
    setLoading(false);

    if (!res.success) {
      setError(res.message);
    }
  };

  // Handle Staff Registration Submit
  const handleStaffRegSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!staffRegName || !staffRegEmail || !staffRegPhone || !staffRegId || !staffRegPassword) {
      setError('Please fill in all mandatory registration fields.');
      return;
    }

    if (staffRegPassword !== staffRegConfirmPass) {
      setError('Password and Confirm Password do not match.');
      return;
    }

    setLoading(true);
    const res = await submitStaffRegistration({
      fullName: staffRegName,
      officialEmail: staffRegEmail,
      phone: staffRegPhone,
      staffId: staffRegId,
      department: staffRegDept,
      designation: staffRegDesignation,
      procurementCenter: staffRegCenter,
      password: staffRegPassword,
    });
    setLoading(false);

    if (res.success && res.request) {
      setShowStaffRegModal(false);
      setSubmittedStaffReq({ id: res.request.id, staffId: res.request.staffId });
      setSuccessMsg('Staff registration request submitted successfully! Awaiting Admin approval.');
    } else {
      setError(res.message);
    }
  };

  // Handle Admin Password Login Submit
  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!adminEmail || !adminPassword) {
      setError('Please enter Admin email and password.');
      return;
    }

    setLoading(true);
    const res = await loginAdminWithEmail(adminEmail, adminPassword);
    setLoading(false);

    if (!res.success) {
      setError(res.message);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-forest-950 pt-20 pb-16">
      {/* Background Image Layer with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img src={FIELD_IMG} alt="Kisan Field" className="h-full w-full object-cover opacity-20 filter blur-sm" />
        <div className="absolute inset-0 bg-gradient-to-b from-forest-950/90 via-forest-950/80 to-forest-950" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-leaf-500/20 px-4 py-1.5 border border-leaf-400/40 text-leaf-300 backdrop-blur-md">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Real-Time OTP Multi-Role Authentication
              </span>
            </div>

            <h1 className="mt-4 font-display text-3xl sm:text-5xl font-black text-white tracking-tight">
              Welcome to <span className="bg-gradient-to-r from-leaf-300 via-gold-300 to-emerald-400 bg-clip-text text-transparent">KisanConnect</span>
            </h1>
            <p className="mt-2 text-sm sm:text-base text-forest-200 max-w-2xl mx-auto">
              Secure real-time SMS OTP authentication for Farmers, Staff Officers, and Administrators.
            </p>
          </div>
        </Reveal>

        {/* =================================================== */}
        {/* ROLE SELECTION TABS                                 */}
        {/* =================================================== */}
        <Reveal delay={60}>
          <div className="mt-8 mx-auto max-w-2xl grid grid-cols-3 gap-2 p-1.5 rounded-3xl bg-forest-900/90 border border-white/10 backdrop-blur-xl shadow-2xl">
            <button
              onClick={() => {
                setActivePortal('farmer');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex items-center justify-center gap-2 rounded-2xl py-3 text-xs sm:text-sm font-bold transition-all ${
                activePortal === 'farmer'
                  ? 'bg-gradient-to-r from-leaf-500 to-emerald-600 text-white shadow-glow'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sprout className="h-4 w-4 text-leaf-300" />
              <span>👨‍🌾 Farmer OTP</span>
            </button>

            <button
              onClick={() => {
                setActivePortal('staff');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex items-center justify-center gap-2 rounded-2xl py-3 text-xs sm:text-sm font-bold transition-all ${
                activePortal === 'staff'
                  ? 'bg-gradient-to-r from-amber-500 to-gold-500 text-white shadow-glow'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Building2 className="h-4 w-4 text-gold-300" />
              <span>👨‍💼 Staff Portal</span>
            </button>

            <button
              onClick={() => {
                setActivePortal('admin');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex items-center justify-center gap-2 rounded-2xl py-3 text-xs sm:text-sm font-bold transition-all ${
                activePortal === 'admin'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-glow'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Crown className="h-4 w-4 text-purple-300" />
              <span>🛡️ Admin Portal</span>
            </button>
          </div>
        </Reveal>

        {/* Global Error Banner */}
        {error && (
          <Reveal delay={100}>
            <div className="mt-6 mx-auto max-w-xl rounded-2xl bg-rose-500/20 border border-rose-500/40 p-4 text-xs font-bold text-rose-200 flex items-start gap-3 backdrop-blur-md animate-fade-in">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-400 mt-0.5" />
              <span>{error}</span>
            </div>
          </Reveal>
        )}

        {/* Global Success Banner */}
        {successMsg && (
          <Reveal delay={100}>
            <div className="mt-6 mx-auto max-w-xl rounded-2xl bg-leaf-500/20 border border-leaf-400/40 p-4 text-xs font-bold text-leaf-200 flex items-start gap-3 backdrop-blur-md animate-fade-in">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-leaf-300 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          </Reveal>
        )}

        {/* =================================================== */}
        {/* TAB 1: FARMER LOGIN (PHONE + OTP)                  */}
        {/* =================================================== */}
        {activePortal === 'farmer' && (
          <Reveal delay={120}>
            <div className="mt-8 mx-auto max-w-xl rounded-5xl bg-forest-900/90 border border-leaf-500/30 p-6 sm:p-10 shadow-2xl backdrop-blur-2xl">
              <div className="text-center border-b border-white/10 pb-6 mb-6">
                <span className="chip bg-leaf-500/20 text-leaf-300 border border-leaf-400/30 text-xs font-bold">
                  🌾 Farmer Access Portal
                </span>
                <h2 className="mt-2 font-display text-2xl font-bold text-white">
                  {farmerAuthMode === 'register'
                    ? '📝 New Farmer Registration'
                    : farmerOtpStep === 'profile_setup'
                    ? 'Complete Your Farmer Profile'
                    : 'Farmer Mobile Login'}
                </h2>
                <p className="text-xs text-forest-200 mt-1">
                  {farmerAuthMode === 'register'
                    ? 'Register your agricultural profile to generate your official Kisan Card ID & access MSP sales.'
                    : farmerOtpStep === 'phone'
                    ? 'Enter your mobile number to receive a 6-digit real-time verification code via SMS.'
                    : farmerOtpStep === 'otp'
                    ? `Enter the 6-digit verification code sent to +91 ${farmerPhone.slice(0, 5)} *****`
                    : 'Please fill in your details to complete your official farmer profile.'}
                </p>

                {/* Farmer Mode Toggle Selector */}
                <div className="mt-4 inline-flex p-1 rounded-2xl bg-white/10 border border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      setFarmerAuthMode('otp');
                      setError(null);
                      setSuccessMsg(null);
                    }}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      farmerAuthMode === 'otp'
                        ? 'bg-leaf-500 text-white shadow-sm'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    <Smartphone className="h-4 w-4" />
                    <span>Mobile OTP Login</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFarmerAuthMode('register');
                      setError(null);
                      setSuccessMsg(null);
                    }}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      farmerAuthMode === 'register'
                        ? 'bg-leaf-500 text-white shadow-sm'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    <Sprout className="h-4 w-4" />
                    <span>New Farmer Registration</span>
                  </button>
                </div>
              </div>

              {/* FARMER MODE 1: MOBILE OTP FLOW */}
              {farmerAuthMode === 'otp' && (
                <>
                  {farmerOtpStep === 'phone' && (
                    <form onSubmit={handleSendFarmerOtpSubmit} className="space-y-5">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-leaf-200 block mb-1.5">
                          Farmer Mobile Number
                        </label>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 rounded-2xl border border-white/15 bg-white/10 px-4 py-3.5 text-base font-bold text-white shrink-0">
                            <span>🇮🇳</span>
                            <span>+91</span>
                          </div>
                          <div className="relative flex-1">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-forest-400" />
                            <input
                              type="tel"
                              maxLength={10}
                              value={farmerPhone}
                              onChange={(e) => setFarmerPhone(e.target.value.replace(/\D/g, ''))}
                              placeholder="9876543210"
                              className="w-full rounded-2xl border border-white/15 bg-white/10 py-3.5 pl-12 pr-4 text-base font-bold text-white outline-none placeholder:text-white/40 focus:border-leaf-400 focus:bg-white/20"
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-2xl bg-gradient-to-r from-leaf-500 to-emerald-600 py-4 text-sm font-bold text-white shadow-glow hover:brightness-110 transition flex items-center justify-center gap-2"
                      >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
                        <span>Send Real-Time OTP</span>
                      </button>
                    </form>
                  )}

                  {farmerOtpStep === 'otp' && (
                    <RealtimeOtpBox
                      otp={farmerOtp}
                      setOtp={setFarmerOtp}
                      timer={farmerOtpTimer}
                      loading={loading}
                      testOtp={farmerTestOtp}
                      onVerify={handleVerifyFarmerOtpSubmit}
                      onResend={handleSendFarmerOtpSubmit}
                      onChangePhone={() => {
                        setFarmerOtpStep('phone');
                        setError(null);
                        setSuccessMsg(null);
                      }}
                      phone={farmerPhone}
                      roleLabel="farmer"
                    />
                  )}

                  {farmerOtpStep === 'profile_setup' && (
                    <form onSubmit={handleCompleteFarmerProfileSubmit} className="space-y-4">
                      <p className="text-xs font-bold text-leaf-300 mb-2">New Farmer Registration Details:</p>

                      <div>
                        <label className="text-[11px] font-bold text-forest-200 block mb-1">Full Name</label>
                        <input
                          type="text"
                          required
                          value={farmerName}
                          onChange={(e) => setFarmerName(e.target.value)}
                          placeholder="e.g. Ravi Kumar"
                          className="w-full rounded-xl border border-white/15 bg-white/10 p-3 text-xs text-white placeholder:text-white/40 outline-none focus:border-leaf-400"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-forest-200 block mb-1">Village</label>
                          <input
                            type="text"
                            required
                            value={farmerVillage}
                            onChange={(e) => setFarmerVillage(e.target.value)}
                            placeholder="e.g. Kankipadu"
                            className="w-full rounded-xl border border-white/15 bg-white/10 p-3 text-xs text-white placeholder:text-white/40 outline-none focus:border-leaf-400"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-forest-200 block mb-1">District</label>
                          <input
                            type="text"
                            required
                            value={farmerDistrict}
                            onChange={(e) => setFarmerDistrict(e.target.value)}
                            placeholder="e.g. Krishna"
                            className="w-full rounded-xl border border-white/15 bg-white/10 p-3 text-xs text-white placeholder:text-white/40 outline-none focus:border-leaf-400"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-forest-200 block mb-1">State</label>
                          <input
                            type="text"
                            required
                            value={farmerState}
                            onChange={(e) => setFarmerState(e.target.value)}
                            placeholder="e.g. Andhra Pradesh"
                            className="w-full rounded-xl border border-white/15 bg-white/10 p-3 text-xs text-white placeholder:text-white/40 outline-none focus:border-leaf-400"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-forest-200 block mb-1">Preferred Language</label>
                          <select
                            value={lang}
                            onChange={(e) => setLang(e.target.value as Lang)}
                            className="w-full rounded-xl border border-white/15 bg-forest-900 p-3 text-xs text-white outline-none focus:border-leaf-400"
                          >
                            <option value="en">English</option>
                            <option value="te">తెలుగు (Telugu)</option>
                            <option value="hi">हिन्दी (Hindi)</option>
                            <option value="ta">தமிழ் (Tamil)</option>
                            <option value="kn">கன்னட (Kannada)</option>
                            <option value="ml">മലയാളം (Malayalam)</option>
                            <option value="mr">मराठी (Marathi)</option>
                            <option value="bn">বাংলা (Bengali)</option>
                            <option value="gu">ગુજરાતી (Gujarati)</option>
                            <option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
                            <option value="or">ଓଡ଼ିଆ (Odia)</option>
                          </select>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-2xl bg-gradient-to-r from-leaf-500 to-emerald-600 py-4 text-sm font-bold text-white shadow-glow hover:brightness-110 transition flex items-center justify-center gap-2 mt-2"
                      >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5 text-gold-300" />}
                        <span>Complete Setup & Go to Dashboard</span>
                      </button>
                    </form>
                  )}
                </>
              )}

              {/* FARMER MODE 2: DIRECT NEW FARMER REGISTRATION */}
              {farmerAuthMode === 'register' && (
                <form onSubmit={handleDirectFarmerRegSubmit} className="space-y-3.5">
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-3 text-xs text-leaf-200 flex items-center gap-2">
                    <Sprout className="h-4 w-4 text-leaf-300 shrink-0" />
                    <span>Create a new farmer profile to get your official Kisan Card ID & instant slot booking.</span>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-leaf-200 uppercase block mb-1">Full Farmer Name *</label>
                    <input
                      type="text"
                      required
                      value={farmerName}
                      onChange={(e) => setFarmerName(e.target.value)}
                      placeholder="e.g. Ravi Kumar"
                      className="w-full rounded-xl border border-white/15 bg-white/10 p-3 text-xs font-bold text-white placeholder:text-white/40 outline-none focus:border-leaf-400 focus:bg-white/20"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-leaf-200 uppercase block mb-1">Mobile Phone Number *</label>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-xs font-bold text-white shrink-0">
                        <span>🇮🇳</span>
                        <span>+91</span>
                      </div>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={farmerRegPhone}
                        onChange={(e) => setFarmerRegPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="9876543210"
                        className="w-full rounded-xl border border-white/15 bg-white/10 p-2.5 text-xs font-bold text-white placeholder:text-white/40 outline-none focus:border-leaf-400 focus:bg-white/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-leaf-200 uppercase block mb-1">Primary Crop *</label>
                      <select
                        value={farmerCrop}
                        onChange={(e) => setFarmerCrop(e.target.value)}
                        className="w-full rounded-xl border border-white/15 bg-forest-900 p-2.5 text-xs font-bold text-white outline-none focus:border-leaf-400"
                      >
                        <option value="Paddy (Grade A)">Paddy (Grade A)</option>
                        <option value="Cotton (Long Staple)">Cotton (Long Staple)</option>
                        <option value="Maize (Yellow)">Maize (Yellow)</option>
                        <option value="Red Gram / Toor">Red Gram / Toor</option>
                        <option value="Chilli (Guntur Teja)">Chilli (Guntur Teja)</option>
                        <option value="Sugarcane">Sugarcane</option>
                        <option value="Groundnut / Peanut">Groundnut / Peanut</option>
                        <option value="Wheat">Wheat</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-leaf-200 uppercase block mb-1">Land Size (Acres) *</label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={farmerLandAcres}
                        onChange={(e) => setFarmerLandAcres(e.target.value)}
                        placeholder="4.5"
                        className="w-full rounded-xl border border-white/15 bg-white/10 p-2.5 text-xs font-bold text-white placeholder:text-white/40 outline-none focus:border-leaf-400 focus:bg-white/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-leaf-200 uppercase block mb-1">Village *</label>
                      <input
                        type="text"
                        required
                        value={farmerVillage}
                        onChange={(e) => setFarmerVillage(e.target.value)}
                        placeholder="e.g. Kankipadu"
                        className="w-full rounded-xl border border-white/15 bg-white/10 p-2.5 text-xs font-bold text-white placeholder:text-white/40 outline-none focus:border-leaf-400 focus:bg-white/20"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-leaf-200 uppercase block mb-1">District *</label>
                      <input
                        type="text"
                        required
                        value={farmerDistrict}
                        onChange={(e) => setFarmerDistrict(e.target.value)}
                        placeholder="e.g. Krishna"
                        className="w-full rounded-xl border border-white/15 bg-white/10 p-2.5 text-xs font-bold text-white placeholder:text-white/40 outline-none focus:border-leaf-400 focus:bg-white/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-leaf-200 uppercase block mb-1">State *</label>
                      <input
                        type="text"
                        required
                        value={farmerState}
                        onChange={(e) => setFarmerState(e.target.value)}
                        placeholder="e.g. Andhra Pradesh"
                        className="w-full rounded-xl border border-white/15 bg-white/10 p-2.5 text-xs font-bold text-white placeholder:text-white/40 outline-none focus:border-leaf-400 focus:bg-white/20"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-leaf-200 uppercase block mb-1">Preferred Language</label>
                      <select
                        value={lang}
                        onChange={(e) => setLang(e.target.value as Lang)}
                        className="w-full rounded-xl border border-white/15 bg-forest-900 p-2.5 text-xs font-bold text-white outline-none focus:border-leaf-400"
                      >
                        <option value="en">English</option>
                        <option value="te">తెలుగు (Telugu)</option>
                        <option value="hi">हिन्दी (Hindi)</option>
                        <option value="ta">தமிழ் (Tamil)</option>
                        <option value="kn">கன்னட (Kannada)</option>
                        <option value="ml">മലയാളം (Malayalam)</option>
                        <option value="mr">मराठी (Marathi)</option>
                        <option value="bn">বাংলা (Bengali)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-2xl bg-gradient-to-r from-leaf-500 to-emerald-600 py-3.5 text-sm font-bold text-white shadow-glow hover:brightness-110 transition flex items-center justify-center gap-2 mt-2"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sprout className="h-5 w-5 text-gold-300" />}
                    <span>🌾 Register Farmer & Access Dashboard</span>
                  </button>
                </form>
              )}
            </div>
          </Reveal>
        )}

        {/* =================================================== */}
        {/* TAB 2: STAFF PORTAL LOGIN (OTP + EMAIL TOGGLE)     */}
        {/* =================================================== */}
        {activePortal === 'staff' && (
          <Reveal delay={120}>
            <div className="mt-8 mx-auto max-w-xl rounded-5xl bg-forest-900/90 border border-amber-500/30 p-6 sm:p-10 shadow-2xl backdrop-blur-2xl">
              <div className="text-center border-b border-white/10 pb-6 mb-6">
                <span className="chip bg-amber-500/20 text-gold-300 border border-gold-400/30 text-xs font-bold">
                  Official Procurement Staff Portal
                </span>
                <h2 className="mt-2 font-display text-2xl font-bold text-white">
                  👨‍💼 Staff Portal Login
                </h2>
                <p className="text-xs text-forest-200 mt-1">
                  Access center queue management, moisture verification, and weighbridge controls.
                </p>

                {/* Authentication Method Selector Toggle */}
                <div className="mt-4 inline-flex p-1 rounded-2xl bg-white/10 border border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      setStaffAuthMode('otp');
                      setError(null);
                      setSuccessMsg(null);
                    }}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      staffAuthMode === 'otp'
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    <Smartphone className="h-4 w-4" />
                    <span>Mobile Phone OTP</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStaffAuthMode('password');
                      setError(null);
                      setSuccessMsg(null);
                    }}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      staffAuthMode === 'password'
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    <Mail className="h-4 w-4" />
                    <span>Email & Password</span>
                  </button>
                </div>
              </div>

              {/* STAFF AUTH MODE 1: MOBILE OTP */}
              {staffAuthMode === 'otp' && (
                <>
                  {staffOtpStep === 'phone' && (
                    <form onSubmit={handleSendStaffOtpSubmit} className="space-y-4">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-gold-200 block mb-1.5">
                          Registered Staff Mobile Number
                        </label>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 rounded-2xl border border-white/15 bg-white/10 px-4 py-3.5 text-base font-bold text-white shrink-0">
                            <span>🇮🇳</span>
                            <span>+91</span>
                          </div>
                          <div className="relative flex-1">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-forest-400" />
                            <input
                              type="tel"
                              maxLength={10}
                              value={staffPhone}
                              onChange={(e) => setStaffPhone(e.target.value.replace(/\D/g, ''))}
                              placeholder="9440199887"
                              className="w-full rounded-2xl border border-white/15 bg-white/10 py-3.5 pl-12 pr-4 text-base font-bold text-white outline-none placeholder:text-white/40 focus:border-gold-400 focus:bg-white/20"
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-gold-500 py-4 text-sm font-bold text-white shadow-glow hover:brightness-110 transition flex items-center justify-center gap-2"
                      >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
                        <span>Send Staff Real-Time OTP</span>
                      </button>
                    </form>
                  )}

                  {staffOtpStep === 'otp' && (
                    <RealtimeOtpBox
                      otp={staffOtp}
                      setOtp={setStaffOtp}
                      timer={staffOtpTimer}
                      loading={loading}
                      testOtp={staffTestOtp}
                      onVerify={handleVerifyStaffOtpSubmit}
                      onResend={handleSendStaffOtpSubmit}
                      onChangePhone={() => {
                        setStaffOtpStep('phone');
                        setError(null);
                        setSuccessMsg(null);
                      }}
                      phone={staffPhone}
                      roleLabel="staff"
                    />
                  )}
                </>
              )}

              {/* STAFF AUTH MODE 2: EMAIL & PASSWORD */}
              {staffAuthMode === 'password' && (
                <form onSubmit={handleStaffLoginSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-gold-200 block mb-1.5">
                      Official Email Address
                    </label>
                    <input
                      type="email"
                      value={staffEmail}
                      onChange={(e) => setStaffEmail(e.target.value)}
                      placeholder="official.staff@kisanconnect.com"
                      className="w-full rounded-2xl border border-white/15 bg-white/10 py-3.5 px-4 text-sm font-bold text-white outline-none placeholder:text-white/40 focus:border-gold-400 focus:bg-white/20"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-gold-200 block mb-1.5">
                      Account Password
                    </label>
                    <div className="relative">
                      <input
                        type={showStaffPassword ? 'text' : 'password'}
                        value={staffPassword}
                        onChange={(e) => setStaffPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-2xl border border-white/15 bg-white/10 py-3.5 pl-4 pr-12 text-sm font-bold text-white outline-none focus:border-gold-400 focus:bg-white/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowStaffPassword(!showStaffPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors focus:outline-none"
                      >
                        {showStaffPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Demo Accounts Quick Fill Buttons */}
                  <div className="rounded-2xl bg-white/5 p-3 text-xs space-y-1.5 border border-white/10">
                    <p className="font-bold text-forest-300 text-[11px]">Quick Demo Test Accounts:</p>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setStaffEmail('staff@kisanconnect.com');
                          setStaffPassword('staff123');
                        }}
                        className="rounded-lg bg-leaf-500/30 px-2 py-1 text-[10px] font-bold text-leaf-200 hover:bg-leaf-500/50"
                      >
                        🟢 Approved Staff (ST-1024)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setStaffEmail('pending.staff@kisanconnect.com');
                          setStaffPassword('staff123');
                        }}
                        className="rounded-lg bg-amber-500/30 px-2 py-1 text-[10px] font-bold text-amber-200 hover:bg-amber-500/50"
                      >
                        🟡 Pending Staff (ST-1029)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setStaffEmail('rejected.staff@kisanconnect.com');
                          setStaffPassword('staff123');
                        }}
                        className="rounded-lg bg-rose-500/30 px-2 py-1 text-[10px] font-bold text-rose-200 hover:bg-rose-500/50"
                      >
                        🔴 Rejected Staff (ST-1018)
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-gold-500 py-4 text-sm font-bold text-white shadow-glow hover:brightness-110 transition flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lock className="h-5 w-5" />}
                    <span>Login to Staff Portal</span>
                  </button>
                </form>
              )}

              <div className="pt-4 mt-6 border-t border-white/10 text-center flex flex-col items-center gap-2">
                <p className="text-xs text-forest-300">Are you a new procurement staff member?</p>
                <button
                  type="button"
                  onClick={() => setShowStaffRegModal(true)}
                  className="rounded-2xl bg-white/10 px-5 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition border border-white/20"
                >
                  📝 Submit Staff Registration Request
                </button>
              </div>
            </div>
          </Reveal>
        )}

        {/* =================================================== */}
        {/* TAB 3: ADMIN PORTAL LOGIN (OTP + PASSWORD TOGGLE)   */}
        {/* =================================================== */}
        {activePortal === 'admin' && (
          <Reveal delay={120}>
            <div className="mt-8 mx-auto max-w-xl rounded-5xl bg-forest-900/90 border border-purple-500/30 p-6 sm:p-10 shadow-2xl backdrop-blur-2xl">
              <div className="text-center border-b border-white/10 pb-6 mb-6">
                <span className="chip bg-purple-500/20 text-purple-300 border border-purple-400/30 text-xs font-bold">
                  System Administration Console
                </span>
                <h2 className="mt-2 font-display text-2xl font-bold text-white">
                  🛡️ Master Admin Login
                </h2>
                <p className="text-xs text-forest-200 mt-1">
                  Manage staff approvals, permissions, centers, and system audit logs.
                </p>

                {/* Admin Auth Toggle */}
                <div className="mt-4 inline-flex p-1 rounded-2xl bg-white/10 border border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      setAdminAuthMode('otp');
                      setError(null);
                      setSuccessMsg(null);
                    }}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      adminAuthMode === 'otp'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    <Smartphone className="h-4 w-4" />
                    <span>Mobile Phone OTP</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAdminAuthMode('password');
                      setError(null);
                      setSuccessMsg(null);
                    }}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      adminAuthMode === 'password'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    <Lock className="h-4 w-4" />
                    <span>Master Password</span>
                  </button>
                </div>
              </div>

              {/* ADMIN AUTH MODE 1: MOBILE OTP */}
              {adminAuthMode === 'otp' && (
                <>
                  {adminOtpStep === 'phone' && (
                    <form onSubmit={handleSendAdminOtpSubmit} className="space-y-4">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-purple-200 block mb-1.5">
                          Admin Registered Mobile Number
                        </label>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 rounded-2xl border border-white/15 bg-white/10 px-4 py-3.5 text-base font-bold text-white shrink-0">
                            <span>🇮🇳</span>
                            <span>+91</span>
                          </div>
                          <div className="relative flex-1">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-300" />
                            <input
                              type="tel"
                              maxLength={10}
                              value={adminPhone}
                              onChange={(e) => setAdminPhone(e.target.value.replace(/\D/g, ''))}
                              placeholder="9999988888"
                              className="w-full rounded-2xl border border-white/15 bg-white/10 py-3.5 pl-12 pr-4 text-base font-bold text-white outline-none placeholder:text-white/40 focus:border-purple-400 focus:bg-white/20"
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 py-4 text-sm font-bold text-white shadow-glow hover:brightness-110 transition flex items-center justify-center gap-2"
                      >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
                        <span>Send Admin Real-Time OTP</span>
                      </button>
                    </form>
                  )}

                  {adminOtpStep === 'otp' && (
                    <RealtimeOtpBox
                      otp={adminOtp}
                      setOtp={setAdminOtp}
                      timer={adminOtpTimer}
                      loading={loading}
                      testOtp={adminTestOtp}
                      onVerify={handleVerifyAdminOtpSubmit}
                      onResend={handleSendAdminOtpSubmit}
                      onChangePhone={() => {
                        setAdminOtpStep('phone');
                        setError(null);
                        setSuccessMsg(null);
                      }}
                      phone={adminPhone}
                      roleLabel="admin"
                    />
                  )}
                </>
              )}

              {/* ADMIN AUTH MODE 2: MASTER PASSWORD */}
              {adminAuthMode === 'password' && (
                <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-purple-200 block mb-1.5">
                      Admin Official Email
                    </label>
                    <input
                      type="text"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin1234@gmail.com"
                      className="w-full rounded-2xl border border-white/15 bg-white/10 py-3.5 px-4 text-sm font-bold text-white outline-none placeholder:text-white/40 focus:border-purple-400 focus:bg-white/20"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-purple-200 block mb-1.5">
                      Admin Security Password
                    </label>
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-2xl border border-white/15 bg-white/10 py-3.5 px-4 text-sm font-bold text-white outline-none focus:border-purple-400 focus:bg-white/20"
                    />
                  </div>

                  {/* Master Admin Demo Credentials Badge */}
                  <div className="rounded-2xl bg-white/5 p-3 text-xs space-y-1 border border-white/10 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-purple-200 text-[11px]">Master Admin Credentials:</p>
                      <p className="text-[10px] font-mono text-white/80">admin1234@gmail.com / charan@1234</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAdminEmail('admin1234@gmail.com');
                        setAdminPassword('charan@1234');
                      }}
                      className="rounded-lg bg-purple-600/40 px-2.5 py-1 text-[10px] font-bold text-purple-200 hover:bg-purple-600/60"
                    >
                      ⚡ Auto-Fill
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 py-4 text-sm font-bold text-white shadow-glow hover:brightness-110 transition flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Crown className="h-5 w-5 text-gold-300" />}
                    <span>Authenticate Admin Console</span>
                  </button>
                </form>
              )}

              <div className="pt-4 mt-4 border-t border-white/10 text-center">
                <p className="text-[11px] font-semibold text-purple-300 flex items-center justify-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Security Notice: Protected by Multi-Factor Real-Time OTP & RBAC Security Policies.</span>
                </p>
              </div>
            </div>
          </Reveal>
        )}
      </div>

      {/* =================================================== */}
      {/* STAFF REGISTRATION REQUEST FORM MODAL               */}
      {/* =================================================== */}
      {/* =================================================== */}
      {/* STAFF REGISTRATION REQUEST FORM MODAL               */}
      {/* =================================================== */}
      {showStaffRegModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg rounded-5xl bg-forest-900/95 p-6 sm:p-8 shadow-2xl border border-white/20 max-h-[90vh] overflow-y-auto backdrop-blur-2xl text-white animate-scale-in">
            <div className="flex items-start justify-between border-b border-white/15 pb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 chip bg-amber-500/20 border border-amber-400/30">
                  Request-Only Registration
                </span>
                <h3 className="font-display text-xl font-bold text-white mt-1">
                  📝 Staff Registration Request
                </h3>
                <p className="text-xs text-forest-200 mt-0.5">
                  Submitted details will be reviewed by KisanConnect Admin before portal access is granted.
                </p>
              </div>
              <button
                onClick={() => setShowStaffRegModal(false)}
                className="rounded-full p-2 text-white/60 hover:text-white hover:bg-white/10 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleStaffRegSubmit} className="mt-5 space-y-3.5 text-xs font-medium">
              <div>
                <label className="font-bold text-amber-200 block mb-1 uppercase text-[11px] tracking-wider">Full Official Name *</label>
                <input
                  type="text"
                  required
                  value={staffRegName}
                  onChange={(e) => setStaffRegName(e.target.value)}
                  placeholder="e.g. K. Venkatesh"
                  className="w-full rounded-xl border border-white/20 bg-white/10 p-3 text-xs font-bold text-white placeholder:text-white/40 outline-none focus:border-amber-400 focus:bg-white/15"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-amber-200 block mb-1 uppercase text-[11px] tracking-wider">Official Email *</label>
                  <input
                    type="email"
                    required
                    value={staffRegEmail}
                    onChange={(e) => setStaffRegEmail(e.target.value)}
                    placeholder="officer@agri.gov.in"
                    className="w-full rounded-xl border border-white/20 bg-white/10 p-3 text-xs font-bold text-white placeholder:text-white/40 outline-none focus:border-amber-400 focus:bg-white/15"
                  />
                </div>
                <div>
                  <label className="font-bold text-amber-200 block mb-1 uppercase text-[11px] tracking-wider">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={staffRegPhone}
                    onChange={(e) => setStaffRegPhone(e.target.value)}
                    placeholder="+91 98480 11223"
                    className="w-full rounded-xl border border-white/20 bg-white/10 p-3 text-xs font-bold text-white placeholder:text-white/40 outline-none focus:border-amber-400 focus:bg-white/15"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-amber-200 block mb-1 uppercase text-[11px] tracking-wider">Staff / Employee ID *</label>
                  <input
                    type="text"
                    required
                    value={staffRegId}
                    onChange={(e) => setStaffRegId(e.target.value)}
                    placeholder="ST-1035"
                    className="w-full rounded-xl border border-white/20 bg-white/10 p-3 text-xs font-bold text-white placeholder:text-white/40 outline-none focus:border-amber-400 focus:bg-white/15 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-amber-200 block mb-1 uppercase text-[11px] tracking-wider">Department</label>
                  <input
                    type="text"
                    value={staffRegDept}
                    onChange={(e) => setStaffRegDept(e.target.value)}
                    placeholder="Quality Control"
                    className="w-full rounded-xl border border-white/20 bg-white/10 p-3 text-xs font-bold text-white placeholder:text-white/40 outline-none focus:border-amber-400 focus:bg-white/15"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-amber-200 block mb-1 uppercase text-[11px] tracking-wider">Assigned Procurement Center *</label>
                <select
                  value={staffRegCenter}
                  onChange={(e) => setStaffRegCenter(e.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-forest-950 p-3 text-xs font-bold text-white outline-none focus:border-amber-400"
                >
                  <option value="Vijayawada Procurement Center A">Vijayawada Procurement Center A</option>
                  <option value="Guntur Procurement Center B">Guntur Procurement Center B</option>
                  <option value="Tenali Procurement Center">Tenali Procurement Center</option>
                  <option value="Eluru Procurement Center C">Eluru Procurement Center C</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-amber-200 block mb-1 uppercase text-[11px] tracking-wider">Designation</label>
                <input
                  type="text"
                  value={staffRegDesignation}
                  onChange={(e) => setStaffRegDesignation(e.target.value)}
                  placeholder="Assistant Inspector"
                  className="w-full rounded-xl border border-white/20 bg-white/10 p-3 text-xs font-bold text-white placeholder:text-white/40 outline-none focus:border-amber-400 focus:bg-white/15"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-amber-200 block mb-1 uppercase text-[11px] tracking-wider">Password *</label>
                  <div className="relative">
                    <input
                      type={showStaffRegPassword ? 'text' : 'password'}
                      required
                      value={staffRegPassword}
                      onChange={(e) => setStaffRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-white/20 bg-white/10 p-3 pr-10 text-xs font-bold text-white outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowStaffRegPassword(!showStaffRegPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors focus:outline-none"
                    >
                      {showStaffRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="font-bold text-amber-200 block mb-1 uppercase text-[11px] tracking-wider">Confirm Password *</label>
                  <div className="relative">
                    <input
                      type={showStaffRegConfirmPass ? 'text' : 'password'}
                      required
                      value={staffRegConfirmPass}
                      onChange={(e) => setStaffRegConfirmPass(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-white/20 bg-white/10 p-3 pr-10 text-xs font-bold text-white outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowStaffRegConfirmPass(!showStaffRegConfirmPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors focus:outline-none"
                    >
                      {showStaffRegConfirmPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/15">
                <button
                  type="button"
                  onClick={() => setShowStaffRegModal(false)}
                  className="rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-gradient-to-r from-amber-500 to-gold-500 text-xs font-bold py-2.5 px-6 shadow-glow text-white hover:brightness-110 flex items-center gap-1.5 transition"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  <span>Submit Registration Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================== */}
      {/* SUBMITTED STAFF REQUEST CONFIRMATION MODAL          */}
      {/* =================================================== */}
      {submittedStaffReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md rounded-4xl bg-forest-900/95 p-6 sm:p-8 shadow-2xl border border-white/20 text-center backdrop-blur-2xl text-white animate-scale-in">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-amber-500/20 text-gold-300 border border-gold-400/30">
              <Clock className="h-8 w-8" />
            </div>

            <span className="chip bg-amber-500/20 text-gold-300 border border-gold-400/30 font-extrabold text-[10px] mt-4">
              🟡 Registration Pending
            </span>

            <h3 className="font-display text-xl font-bold text-white mt-2">
              Registration Submitted Successfully
            </h3>

            <div className="mt-4 rounded-2xl bg-white/10 p-4 text-xs space-y-2 text-left border border-white/15">
              <div className="flex justify-between">
                <span className="text-forest-200">Application ID:</span>
                <span className="font-bold font-mono text-gold-300">{submittedStaffReq.staffId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-forest-200">Current Status:</span>
                <span className="font-extrabold text-gold-300">🟡 Awaiting Admin Approval</span>
              </div>
            </div>

            <p className="mt-4 text-xs text-forest-200 leading-relaxed">
              Your details have been submitted to KisanConnect Admin for verification. Once approved, you can log in using your official email and password or mobile OTP.
            </p>

            <button
              onClick={() => setSubmittedStaffReq(null)}
              className="mt-6 w-full rounded-2xl bg-gradient-to-r from-amber-500 to-gold-500 py-3 text-xs font-bold text-white shadow-glow hover:brightness-110 transition"
            >
              Back to Login Portal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
