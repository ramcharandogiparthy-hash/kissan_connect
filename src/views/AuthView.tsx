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
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { Reveal } from '@/components/Reveal';
import type { Lang } from '@/lib/data';

const FIELD_IMG =
  'https://images.pexels.com/photos/20313652/pexels-photo-20313652.jpeg?auto=compress&cs=tinysrgb&w=1920';

type RolePortal = 'farmer' | 'staff' | 'admin';

export function AuthView() {
  const {
    lang,
    setLang,
    sendFarmerOTP,
    verifyFarmerOTP,
    completeFarmerProfileSetup,
    submitStaffRegistration,
    loginStaffWithEmail,
    loginAdminWithEmail,
  } = useApp();

  // Active Role Portal Tab: 'farmer' | 'staff' | 'admin'
  const [activePortal, setActivePortal] = useState<RolePortal>('farmer');

  // ==========================================
  // FARMER AUTH STATE (Phone + OTP)
  // ==========================================
  const [farmerPhone, setFarmerPhone] = useState('9876543210');
  const [farmerOtpStep, setFarmerOtpStep] = useState<'phone' | 'otp' | 'profile_setup'>('phone');
  const [farmerOtp, setFarmerOtp] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(60);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [newFarmerUserId, setNewFarmerUserId] = useState<string | undefined>();

  // Farmer profile setup details
  const [farmerName, setFarmerName] = useState('Ravi Kumar');
  const [farmerVillage, setFarmerVillage] = useState('Kankipadu');
  const [farmerDistrict, setFarmerDistrict] = useState('Krishna');
  const [farmerState, setFarmerState] = useState('Andhra Pradesh');

  // ==========================================
  // STAFF AUTH STATE (Email + Password)
  // ==========================================
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
  // ADMIN AUTH STATE (Email + Password)
  // ==========================================
  const [adminEmail, setAdminEmail] = useState('admin@kisanconnect.com');
  const [adminPassword] = useState('charan@1234');

  // Common UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // OTP Timer countdown
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (farmerOtpStep === 'otp' && otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((t) => t - 1), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [farmerOtpStep, otpTimer]);

  // Handle Send Farmer OTP
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
    const res = await sendFarmerOTP(`+91${cleanPhone}`);
    setLoading(false);

    if (res.success) {
      setSessionId(res.sessionId);
      setFarmerOtpStep('otp');
      setFarmerOtp(['', '', '', '', '', '']);
      setOtpTimer(60);
      setSuccessMsg(res.message || `✓ 2Factor SMS OTP sent successfully to +91 ${cleanPhone.slice(0, 2)}*****${cleanPhone.slice(7)}.`);
    } else {
      setError(res.message);
    }
  };

  // Handle Resend Farmer OTP
  const handleResendOtp = async () => {
    if (otpTimer > 0 || loading) return;
    setError(null);
    setSuccessMsg(null);
    const cleanPhone = farmerPhone.trim().replace(/\D/g, '');

    setLoading(true);
    const res = await sendFarmerOTP(`+91${cleanPhone}`);
    setLoading(false);

    if (res.success) {
      setSessionId(res.sessionId);
      setOtpTimer(60);
      setFarmerOtp(['', '', '', '', '', '']);
      setSuccessMsg(res.message || `✓ New 2Factor SMS OTP sent to +91 ${cleanPhone.slice(0, 2)}*****${cleanPhone.slice(7)}.`);
    } else {
      setError(res.message);
    }
  };

  // Handle Paste OTP
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length > 0) {
      const newOtp = [...farmerOtp];
      for (let i = 0; i < 6; i++) {
        newOtp[i] = pastedData[i] || '';
      }
      setFarmerOtp(newOtp);
      const focusIdx = Math.min(pastedData.length, 5);
      document.getElementById(`otp-input-${focusIdx}`)?.focus();
    }
  };

  // Handle Verify Farmer OTP
  const handleVerifyFarmerOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    const enteredCode = farmerOtp.join('');

    if (enteredCode.length < 6) {
      setError('Please enter the complete 6-digit OTP code sent to your mobile number via SMS.');
      return;
    }

    setLoading(true);
    const res = await verifyFarmerOTP(`+91${farmerPhone.replace(/\D/g, '')}`, enteredCode, sessionId);
    setLoading(false);

    if (res.success) {
      if (res.isExisting) {
        setSuccessMsg('✓ Verified successfully! Redirecting to your Farmer Dashboard...');
      } else {
        setNewFarmerUserId(res.userId);
        setFarmerOtpStep('profile_setup');
        setSuccessMsg('✓ Verified successfully! Please complete your farmer profile setup below.');
      }
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

  // Handle Staff Login Submit
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

  // Handle Admin Login Submit
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
              <ShieldCheck className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Authorized Secure Access Portal
              </span>
            </div>

            <h1 className="mt-4 font-display text-3xl sm:text-5xl font-black text-white tracking-tight">
              Welcome to <span className="bg-gradient-to-r from-leaf-300 via-gold-300 to-emerald-400 bg-clip-text text-transparent">KisanConnect</span> Authentication
            </h1>
            <p className="mt-2 text-sm sm:text-base text-forest-200 max-w-2xl mx-auto">
              Select your role portal to access your personalized procurement tools and dashboards.
            </p>
          </div>
        </Reveal>

        {/* =================================================== */}
        {/* ROLE SELECTION TABS                                 */}
        {/* =================================================== */}
        <Reveal delay={60}>
          <div className="mt-8 mx-auto max-w-2xl grid grid-cols-3 gap-2 p-1.5 rounded-3xl bg-forest-900/90 border border-white/10 backdrop-blur-xl">
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
              <span>👨‍🌾 Farmer Login</span>
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
            <div className="mt-8 mx-auto max-w-xl rounded-5xl glass p-6 sm:p-10 border border-white/10 shadow-glass-lg backdrop-blur-2xl">
              <div className="text-center border-b border-white/10 pb-6 mb-6">
                <span className="chip bg-leaf-500/20 text-leaf-300 border border-leaf-400/30 text-xs font-bold">
                  🌾 KisanConnect
                </span>
                <h2 className="mt-2 font-display text-2xl font-bold text-white">
                  {farmerOtpStep === 'profile_setup' ? 'Complete Your Farmer Profile' : 'Farmer Login'}
                </h2>
                <p className="text-xs text-forest-200 mt-1">
                  {farmerOtpStep === 'phone'
                    ? 'Enter your mobile number to receive a verification code via SMS.'
                    : farmerOtpStep === 'otp'
                    ? `Enter the 6-digit OTP sent to +91 ${farmerPhone.slice(0, 5)} *****`
                    : 'Please fill in your details to set up your official farmer profile.'}
                </p>
              </div>

              {farmerOtpStep === 'phone' && (
                <form onSubmit={handleSendFarmerOtpSubmit} className="space-y-5">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-leaf-200 block mb-1.5">
                      Enter your mobile number
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
                    <span>Send OTP</span>
                  </button>
                </form>
              )}

              {farmerOtpStep === 'otp' && (
                <form onSubmit={handleVerifyFarmerOtpSubmit} className="space-y-5">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-leaf-200">
                        Enter OTP
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setFarmerOtpStep('phone');
                          setError(null);
                          setSuccessMsg(null);
                        }}
                        className="text-xs font-bold text-gold-300 hover:underline"
                      >
                        Change Number (+91 {farmerPhone})
                      </button>
                    </div>

                    <div className="flex justify-between gap-2 my-4">
                      {farmerOtp.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`otp-input-${idx}`}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={1}
                          value={digit}
                          onPaste={handleOtpPaste}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            const newOtp = [...farmerOtp];
                            newOtp[idx] = val;
                            setFarmerOtp(newOtp);
                            if (val && idx < 5) {
                              document.getElementById(`otp-input-${idx + 1}`)?.focus();
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Backspace' && !farmerOtp[idx] && idx > 0) {
                              document.getElementById(`otp-input-${idx - 1}`)?.focus();
                            }
                          }}
                          className="w-12 h-14 text-center rounded-2xl border border-white/20 bg-white/10 font-mono text-2xl font-bold text-white outline-none focus:border-gold-400 focus:bg-white/20 transition-colors"
                        />
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs font-semibold text-forest-200 pt-1">
                      <span>Didn't receive code?</span>
                      {otpTimer > 0 ? (
                        <span className="text-forest-400 font-mono">Resend OTP in {otpTimer}s</span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={loading}
                          className="text-gold-300 font-bold hover:underline disabled:opacity-50"
                        >
                          [ Resend OTP ]
                        </button>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-2xl bg-gradient-to-r from-leaf-500 to-emerald-600 py-4 text-sm font-bold text-white shadow-glow hover:brightness-110 transition flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5 text-gold-300" />}
                    <span>Verify OTP</span>
                  </button>

                  <p className="text-[11px] text-forest-300 text-center pt-1 leading-relaxed flex items-center justify-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-leaf-300" />
                    <span>Real 2Factor SMS OTP Authentication. Your OTP expires in 5 minutes.</span>
                  </p>
                </form>

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
            </div>
          </Reveal>
        )}

        {/* =================================================== */}
        {/* TAB 2: STAFF PORTAL LOGIN & REQUEST                */}
        {/* =================================================== */}
        {activePortal === 'staff' && (
          <Reveal delay={120}>
            <div className="mt-8 mx-auto max-w-xl rounded-5xl glass p-6 sm:p-10 border border-white/10 shadow-glass-lg backdrop-blur-2xl">
              <div className="text-center border-b border-white/10 pb-6 mb-6">
                <span className="chip bg-amber-500/20 text-gold-300 border border-gold-400/30 text-xs font-bold">
                  Official Procurement Staff Portal
                </span>
                <h2 className="mt-2 font-display text-2xl font-bold text-white">
                  👨‍💼 Staff Email & Password Login
                </h2>
                <p className="text-xs text-forest-200 mt-1">
                  Access center queue management, moisture verification, and weighbridge controls.
                </p>
              </div>

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
                      title={showStaffPassword ? 'Hide password' : 'Show password'}
                      aria-label={showStaffPassword ? 'Hide password' : 'Show password'}
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

                <div className="pt-4 border-t border-white/10 text-center flex flex-col items-center gap-2">
                  <p className="text-xs text-forest-300">Are you a new procurement staff member?</p>
                  <button
                    type="button"
                    onClick={() => setShowStaffRegModal(true)}
                    className="rounded-2xl bg-white/10 px-5 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition border border-white/20"
                  >
                    📝 Submit Staff Registration Request
                  </button>
                </div>
              </form>
            </div>
          </Reveal>
        )}

        {/* =================================================== */}
        {/* TAB 3: ADMIN PORTAL LOGIN                           */}
        {/* =================================================== */}
        {activePortal === 'admin' && (
          <Reveal delay={120}>
            <div className="mt-8 mx-auto max-w-xl rounded-5xl glass p-6 sm:p-10 border border-white/10 shadow-glass-lg backdrop-blur-2xl">
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
              </div>

              <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-purple-200 block mb-1.5">
                    Admin Official Email
                  </label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@kisanconnect.com"
                    className="w-full rounded-2xl border border-white/15 bg-white/10 py-3.5 px-4 text-sm font-bold text-white outline-none focus:border-purple-400 focus:bg-white/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-purple-200 block mb-1.5">
                    Admin Security Password
                  </label>
                  <input
                    type="password"
                    value={adminPassword}
                    readOnly
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-white/15 bg-white/10 py-3.5 px-4 text-sm font-bold text-white outline-none focus:border-purple-400 cursor-not-allowed select-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 py-4 text-sm font-bold text-white shadow-glow hover:brightness-110 transition flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Crown className="h-5 w-5 text-gold-300" />}
                  <span>Authenticate Admin Console</span>
                </button>

                <div className="pt-3 border-t border-white/10 text-center">
                  <p className="text-[11px] font-semibold text-purple-300">
                    🔒 Security Notice: Public admin registration is disabled. Admin credentials are generated via secure database provisions.
                  </p>
                </div>
              </form>
            </div>
          </Reveal>
        )}
      </div>

      {/* =================================================== */}
      {/* STAFF REGISTRATION REQUEST FORM MODAL               */}
      {/* =================================================== */}
      {showStaffRegModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg rounded-5xl bg-white p-6 sm:p-8 shadow-2xl border border-forest-100 max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-start justify-between border-b border-forest-100 pb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600">
                  Request-Only Registration
                </span>
                <h3 className="font-display text-xl font-bold text-forest-950 mt-0.5">
                  📝 Staff Registration Request
                </h3>
                <p className="text-xs text-forest-600">
                  Submitted details will be reviewed by KisanConnect Admin before portal access is granted.
                </p>
              </div>
              <button
                onClick={() => setShowStaffRegModal(false)}
                className="rounded-full p-2 text-forest-400 hover:bg-forest-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleStaffRegSubmit} className="mt-4 space-y-3 text-xs font-medium">
              <div>
                <label className="font-bold text-forest-900 block mb-1">Full Official Name *</label>
                <input
                  type="text"
                  required
                  value={staffRegName}
                  onChange={(e) => setStaffRegName(e.target.value)}
                  placeholder="e.g. K. Venkatesh"
                  className="w-full rounded-xl border border-forest-200 p-2.5 font-bold outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-forest-900 block mb-1">Official Email *</label>
                  <input
                    type="email"
                    required
                    value={staffRegEmail}
                    onChange={(e) => setStaffRegEmail(e.target.value)}
                    placeholder="officer@agri.gov.in"
                    className="w-full rounded-xl border border-forest-200 p-2.5 font-bold outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-forest-900 block mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={staffRegPhone}
                    onChange={(e) => setStaffRegPhone(e.target.value)}
                    placeholder="+91 98480 11223"
                    className="w-full rounded-xl border border-forest-200 p-2.5 font-bold outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-forest-900 block mb-1">Staff / Employee ID *</label>
                  <input
                    type="text"
                    required
                    value={staffRegId}
                    onChange={(e) => setStaffRegId(e.target.value)}
                    placeholder="ST-1035"
                    className="w-full rounded-xl border border-forest-200 p-2.5 font-bold outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-forest-900 block mb-1">Department</label>
                  <input
                    type="text"
                    value={staffRegDept}
                    onChange={(e) => setStaffRegDept(e.target.value)}
                    placeholder="Quality Control"
                    className="w-full rounded-xl border border-forest-200 p-2.5 font-bold outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-forest-900 block mb-1">Assigned Procurement Center *</label>
                <select
                  value={staffRegCenter}
                  onChange={(e) => setStaffRegCenter(e.target.value)}
                  className="w-full rounded-xl border border-forest-200 p-2.5 font-bold outline-none focus:border-amber-500"
                >
                  <option value="Vijayawada Procurement Center A">Vijayawada Procurement Center A</option>
                  <option value="Guntur Procurement Center B">Guntur Procurement Center B</option>
                  <option value="Tenali Procurement Center">Tenali Procurement Center</option>
                  <option value="Eluru Procurement Center C">Eluru Procurement Center C</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-forest-900 block mb-1">Designation</label>
                <input
                  type="text"
                  value={staffRegDesignation}
                  onChange={(e) => setStaffRegDesignation(e.target.value)}
                  placeholder="Assistant Inspector"
                  className="w-full rounded-xl border border-forest-200 p-2.5 font-bold outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-forest-900 block mb-1">Password *</label>
                  <div className="relative">
                    <input
                      type={showStaffRegPassword ? 'text' : 'password'}
                      required
                      value={staffRegPassword}
                      onChange={(e) => setStaffRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-forest-200 p-2.5 pr-10 font-bold outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowStaffRegPassword(!showStaffRegPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-forest-400 hover:text-forest-700 transition-colors focus:outline-none"
                      title={showStaffRegPassword ? 'Hide password' : 'Show password'}
                      aria-label={showStaffRegPassword ? 'Hide password' : 'Show password'}
                    >
                      {showStaffRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="font-bold text-forest-900 block mb-1">Confirm Password *</label>
                  <div className="relative">
                    <input
                      type={showStaffRegConfirmPass ? 'text' : 'password'}
                      required
                      value={staffRegConfirmPass}
                      onChange={(e) => setStaffRegConfirmPass(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-forest-200 p-2.5 pr-10 font-bold outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowStaffRegConfirmPass(!showStaffRegConfirmPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-forest-400 hover:text-forest-700 transition-colors focus:outline-none"
                      title={showStaffRegConfirmPass ? 'Hide password' : 'Show password'}
                      aria-label={showStaffRegConfirmPass ? 'Hide password' : 'Show password'}
                    >
                      {showStaffRegConfirmPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-forest-100">
                <button
                  type="button"
                  onClick={() => setShowStaffRegModal(false)}
                  className="rounded-xl bg-forest-100 px-4 py-2.5 text-xs font-bold text-forest-700 hover:bg-forest-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-gold text-xs font-bold py-2.5 px-6 shadow-md flex items-center gap-1.5"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md rounded-4xl bg-white p-6 shadow-2xl border border-forest-100 text-center animate-scale-in">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-amber-100 text-amber-600">
              <Clock className="h-8 w-8" />
            </div>

            <span className="chip bg-amber-100 text-amber-800 font-extrabold text-[10px] mt-4">
              🟡 Registration Pending
            </span>

            <h3 className="font-display text-xl font-bold text-forest-950 mt-2">
              Registration Submitted Successfully
            </h3>

            <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-xs space-y-1.5 text-left border border-amber-200">
              <div className="flex justify-between">
                <span className="text-forest-600">Application ID:</span>
                <span className="font-bold font-mono text-amber-900">{submittedStaffReq.staffId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-forest-600">Current Status:</span>
                <span className="font-extrabold text-amber-800">🟡 Awaiting Admin Approval</span>
              </div>
            </div>

            <p className="mt-4 text-xs text-forest-600">
              Your details have been submitted to KisanConnect Admin for verification. Once approved, you can log in using your official email and password.
            </p>

            <button
              onClick={() => setSubmittedStaffReq(null)}
              className="mt-6 w-full rounded-2xl bg-forest-900 py-3 text-xs font-bold text-white shadow-sm hover:bg-forest-950"
            >
              Back to Login Portal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
