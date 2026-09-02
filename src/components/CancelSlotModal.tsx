import React, { useEffect, useState } from 'react';
import {
  X,
  AlertTriangle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  CloudRain,
  HeartPulse,
  MapPin,
  HelpCircle,
  XCircle,
} from 'lucide-react';
import { useApp, type TokenItem } from '@/lib/app-context';

interface CancelSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: TokenItem;
}

export function CancelSlotModal({ isOpen, onClose, token }: CancelSlotModalProps) {
  const { lang, t, cancelToken } = useApp();
  const [reason, setReason] = useState<string>('transport');
  const [otherReasonText, setOtherReasonText] = useState('');
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [statusMsg, setStatusMsg] = useState<{ success: boolean; text: string } | null>(null);

  useEffect(() => {
    if (!isOpen || !token) return;

    const calculateRemaining = () => {
      const elapsedSec = Math.floor((Date.now() - token.bookedAt) / 1000);
      const totalSec = 30 * 60; // 30 minutes limit
      const rem = Math.max(0, totalSec - elapsedSec);
      setRemainingSeconds(rem);
    };

    calculateRemaining();
    const interval = setInterval(calculateRemaining, 1000);
    return () => clearInterval(interval);
  }, [isOpen, token]);

  if (!isOpen || !token) return null;

  const isWithinLimit = remainingSeconds > 0;
  const minsLeft = Math.floor(remainingSeconds / 60);
  const secsLeft = remainingSeconds % 60;
  const formattedTime = `${String(minsLeft).padStart(2, '0')}:${String(secsLeft).padStart(2, '0')}`;

  const reasonOptions = [
    {
      id: 'transport',
      icon: Truck,
      label: t('cancel_reason_transport'),
    },
    {
      id: 'moisture',
      icon: CloudRain,
      label: t('cancel_reason_moisture'),
    },
    {
      id: 'personal',
      icon: HeartPulse,
      label: t('cancel_reason_personal'),
    },
    {
      id: 'wrong_center',
      icon: MapPin,
      label: t('cancel_reason_wrong_center'),
    },
    {
      id: 'other',
      icon: HelpCircle,
      label: t('cancel_reason_other'),
    },
  ];

  const handleConfirmCancel = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = reason === 'other' ? (otherReasonText || 'Other Reason') : reasonOptions.find(r => r.id === reason)?.label || reason;
    const res = cancelToken(token.id, finalReason);
    if (res.success) {
      setStatusMsg({ success: true, text: t('cancel_success_msg') });
      setTimeout(() => {
        setStatusMsg(null);
        onClose();
      }, 2000);
    } else {
      setStatusMsg({ success: false, text: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg overflow-hidden rounded-5xl bg-white shadow-glass-lg border border-forest-100 animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-900 via-rose-900 to-forest-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 grid h-8 w-8 place-items-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/15 backdrop-blur">
              <XCircle className="h-6 w-6 text-rose-300" />
            </span>
            <div>
              <span className="chip bg-rose-500/30 text-rose-200 border border-rose-400/30 text-[11px] font-bold">
                Token #{token.token}
              </span>
              <h3 className="font-display text-2xl font-extrabold mt-0.5">
                {t('cancel_modal_title')}
              </h3>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Status feedback message */}
          {statusMsg ? (
            <div className={`rounded-3xl p-6 text-center animate-fade-up ${statusMsg.success ? 'bg-leaf-50 border border-leaf-200 text-leaf-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
              <div className={`mx-auto grid h-14 w-14 place-items-center rounded-2xl mb-3 ${statusMsg.success ? 'bg-leaf-500 text-white' : 'bg-red-500 text-white'}`}>
                {statusMsg.success ? <CheckCircle2 className="h-7 w-7" /> : <AlertCircle className="h-7 w-7" />}
              </div>
              <h4 className="font-display text-xl font-bold">{statusMsg.success ? 'Slot Cancelled' : 'Cancellation Failed'}</h4>
              <p className="mt-1 text-sm">{statusMsg.text}</p>
            </div>
          ) : isWithinLimit ? (
            <form onSubmit={handleConfirmCancel} className="space-y-4">
              {/* Countdown Live Banner */}
              <div className="rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-300/50 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-amber-500 text-white shadow-sm">
                    <Clock className="h-5 w-5 animate-spin-slow" />
                  </span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
                      {t('cancel_window_tag')}
                    </p>
                    <p className="text-xs font-semibold text-amber-800">
                      {lang === 'te' ? 'రద్దు సమయం మిగిలి ఉంది:' : lang === 'hi' ? 'रद्द करने का शेष समय:' : 'Time remaining to cancel slot:'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-2xl font-extrabold text-amber-900 bg-amber-100 px-3 py-1 rounded-2xl border border-amber-300">
                    {formattedTime}
                  </span>
                </div>
              </div>

              {/* Slot Overview */}
              <div className="rounded-2xl bg-forest-50 p-3.5 flex items-center justify-between text-xs text-forest-800">
                <div>
                  <p className="font-bold text-sm text-forest-900">{token.crop}</p>
                  <p className="text-forest-600">{token.center}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{token.quantity} Quintals</p>
                  <p className="text-forest-600">{token.time}</p>
                </div>
              </div>

              {/* Reason Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-forest-700 mb-2">
                  {t('cancel_reason_prompt')}
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {reasonOptions.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = reason === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => setReason(opt.id)}
                        className={`flex items-center gap-3 rounded-2xl p-3 cursor-pointer border transition ${
                          isSelected
                            ? 'border-rose-500 bg-rose-50/50 text-rose-900 shadow-sm font-semibold'
                            : 'border-forest-100 bg-white text-forest-700 hover:bg-cream-50'
                        }`}
                      >
                        <div className={`grid h-8 w-8 place-items-center rounded-xl ${isSelected ? 'bg-rose-500 text-white' : 'bg-forest-100 text-forest-600'}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="text-xs flex-1">{opt.label}</span>
                        <input
                          type="radio"
                          name="cancelReason"
                          checked={isSelected}
                          onChange={() => setReason(opt.id)}
                          className="h-4 w-4 accent-rose-600"
                        />
                      </div>
                    );
                  })}
                </div>

                {reason === 'other' && (
                  <input
                    type="text"
                    placeholder="Specify reason..."
                    value={otherReasonText}
                    onChange={(e) => setOtherReasonText(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-forest-200 bg-white px-4 py-2.5 text-xs font-semibold text-forest-900 outline-none focus:ring-2 focus:ring-rose-400"
                  />
                )}
              </div>

              {/* Warning box */}
              <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-3 flex items-start gap-2 text-xs text-rose-800">
                <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <p>
                  {lang === 'te'
                    ? 'రద్దు చేసిన తర్వాత, ఈ టోకెన్ స్లాట్ రద్దవుతుంది మరియు ఇతర రైతులకు కేటాయించబడుతుంది.'
                    : lang === 'hi'
                    ? 'रद्द करने के बाद यह टोकन स्लॉट जारी कर दिया जाएगा।'
                    : 'Once confirmed, your token slot will be cancelled and released for other waiting farmers.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/2 rounded-2xl border border-forest-200 bg-white py-3 text-xs font-bold text-forest-700 hover:bg-cream-50 transition"
                >
                  {t('cancel_keep_btn')}
                </button>
                <button
                  type="submit"
                  className="w-1/2 rounded-2xl bg-rose-600 py-3 text-xs font-bold text-white shadow-glow hover:bg-rose-700 transition"
                >
                  {t('cancel_confirm_btn')}
                </button>
              </div>
            </form>
          ) : (
            /* Expired Window View */
            <div className="space-y-4 text-center py-4">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-amber-100 text-amber-600 border border-amber-200">
                <AlertCircle className="h-8 w-8" />
              </div>
              <div>
                <h4 className="font-display text-xl font-extrabold text-forest-900">
                  {t('cancel_expired')}
                </h4>
                <p className="mt-2 text-xs text-forest-600 leading-relaxed px-4">
                  {lang === 'te'
                    ? 'స్లాట్ బుక్ చేసి 30 నిమిషాలు దాటినందున ఆటోమేటిక్ రద్దు గడువు ముగిసింది. దయచేసి సహాయం కోసం కొనుగోలు కేంద్రాన్ని లేదా సపోర్ట్‌ను సంప్రదించండి.'
                    : lang === 'hi'
                    ? 'स्लॉट बुक किए 30 मिनट से अधिक हो चुके हैं, इसलिए ऑनलाइन रद्दीकरण की सीमा समाप्त हो गई है।'
                    : 'The 30-minute self-cancellation period for this slot has expired. If you are unable to attend, please notify center staff or contact support.'}
                </p>
              </div>

              <div className="rounded-2xl bg-forest-50 p-4 text-left text-xs text-forest-700 space-y-1">
                <p><span className="font-bold text-forest-900">Token Number:</span> #{token.token}</p>
                <p><span className="font-bold text-forest-900">Center:</span> {token.center}</p>
                <p><span className="font-bold text-forest-900">Booked At:</span> {new Date(token.bookedAt).toLocaleTimeString()}</p>
              </div>

              <button
                onClick={onClose}
                className="w-full btn-primary text-xs py-3"
              >
                Close Notice
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
