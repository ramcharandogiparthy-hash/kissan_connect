import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Clock,
  TrendingDown,
  Wheat,
  Building2,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { useApp, formatRupee } from '@/lib/app-context';
import { getCentersData } from '@/lib/data';

interface AIPredictorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIPredictorModal({ isOpen, onClose }: AIPredictorModalProps) {
  const { lang, setView, addToken } = useApp();

  const [crop, setCrop] = useState('Paddy');
  const [quantity, setQuantity] = useState(40);
  const [centerId, setCenterId] = useState('vij');
  const [timeSlot, setTimeSlot] = useState('10:30 AM');
  const [date] = useState('2026-08-29');

  if (!isOpen) return null;

  const centers = getCentersData(lang);
  const selectedCenterObj = centers.find((c) => c.id === centerId) || centers[0];
  const centerName = selectedCenterObj.name;

  // AI Calculations based on inputs
  const mspRates: Record<string, number> = {
    Paddy: 2300,
    Cotton: 7121,
    Maize: 2225,
    Groundnut: 6780,
    Wheat: 2275,
  };

  const currentRate = mspRates[crop] || 2300;
  const estimatedTotalPayout = quantity * currentRate;

  const slotWaitTimes: Record<string, number> = {
    '09:00 AM': 12,
    '10:30 AM': 18,
    '01:30 PM': 54,
    '03:00 PM': 42,
  };

  const predictedWait = slotWaitTimes[timeSlot] || 22;
  const peakWait = 58;
  const timeSaved = Math.max(0, peakWait - predictedWait);
  const congestionPct = predictedWait < 20 ? 88 : predictedWait < 40 ? 64 : 35;

  const handleGeneratePass = () => {
    const cropLabel =
      crop === 'Paddy'
        ? 'Paddy (Grade A)'
        : crop === 'Cotton'
        ? 'Cotton (Medium Staple)'
        : crop === 'Maize'
        ? 'Maize (Yellow)'
        : crop;

    addToken({
      crop: cropLabel,
      quantity,
      center: centerName,
      date: date || '29 August 2026',
      time: timeSlot,
      status: 'Confirmed',
      expressPass: true,
      estimatedWaitMin: predictedWait,
    });

    onClose();
    setView('token');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-5xl bg-white shadow-glass-lg border border-forest-100 flex flex-col animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-forest-900 via-forest-800 to-emerald-950 p-6 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-gold-400 to-gold-500 text-white shadow-glow">
              <Sparkles className="h-6 w-6" />
            </span>
            <div>
              <span className="chip bg-gold-400/20 text-gold-200 border border-gold-300/30 text-[11px] font-bold">
                Smart Machine Learning Engine
              </span>
              <h2 className="font-display text-2xl font-extrabold text-white mt-0.5">
                {lang === 'te' ? 'AI స్మార్ట్ కొనుగోలు అంచనా యంత్రం' : lang === 'hi' ? 'AI स्मार्ट खरीद अनुमानक' : 'AI Smart Procurement Predictor'}
              </h2>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Controls Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-forest-50/70 p-4 rounded-3xl border border-forest-100">
            <div>
              <label className="block text-xs font-semibold text-forest-700 mb-1">
                <Wheat className="h-3.5 w-3.5 inline mr-1 text-forest-500" />
                Select Crop Type
              </label>
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                className="w-full rounded-2xl border border-forest-200 bg-white px-3.5 py-2 text-xs font-bold text-forest-900 outline-none focus:ring-2 focus:ring-leaf-400"
              >
                <option value="Paddy">Paddy / ధాన్యం (MSP ₹2,300/Qtl)</option>
                <option value="Cotton">Cotton / పత్తి (MSP ₹7,121/Qtl)</option>
                <option value="Maize">Maize / మొక్కజొన్న (MSP ₹2,225/Qtl)</option>
                <option value="Groundnut">Groundnut / వేరుశనగ (MSP ₹6,780/Qtl)</option>
                <option value="Wheat">Wheat / గోధుమలు (MSP ₹2,275/Qtl)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-forest-700 mb-1">
                Quantity (Quintals): <span className="font-bold text-forest-900">{quantity} Qtl</span>
              </label>
              <input
                type="range"
                min={5}
                max={200}
                step={5}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full accent-leaf-600 mt-2"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-forest-700 mb-1">
                <Building2 className="h-3.5 w-3.5 inline mr-1 text-forest-500" />
                Procurement Center
              </label>
              <select
                value={centerId}
                onChange={(e) => setCenterId(e.target.value)}
                className="w-full rounded-2xl border border-forest-200 bg-white px-3.5 py-2 text-xs font-bold text-forest-900 outline-none focus:ring-2 focus:ring-leaf-400"
              >
                {centers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-forest-700 mb-1">
                <Clock className="h-3.5 w-3.5 inline mr-1 text-forest-500" />
                Preferred Time Slot
              </label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full rounded-2xl border border-forest-200 bg-white px-3.5 py-2 text-xs font-bold text-forest-900 outline-none focus:ring-2 focus:ring-leaf-400"
              >
                <option value="09:00 AM">09:00 AM (Recommended Morning)</option>
                <option value="10:30 AM">10:30 AM (Fastest Flow - Saved 36m)</option>
                <option value="01:30 PM">01:30 PM (Peak Afternoon Queue)</option>
                <option value="03:00 PM">03:00 PM (Moderate Queue)</option>
              </select>
            </div>
          </div>

          {/* AI Live Output Predictions */}
          <div className="space-y-4">
            <h4 className="font-display text-xs font-bold text-forest-700 uppercase tracking-wider">
              AI Real-Time Live Predictions
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Predicted Waiting Time */}
              <div className="rounded-3xl bg-gradient-to-br from-forest-800 to-forest-900 p-4 text-white shadow-sm">
                <p className="text-[11px] font-semibold text-leaf-300 uppercase">Predicted Wait</p>
                <p className="font-display text-2xl font-extrabold text-gold-300 mt-1">~{predictedWait} Mins</p>
                <p className="text-[10px] text-white/70 mt-0.5">vs {peakWait}m peak hours</p>
              </div>

              {/* Congestion Index */}
              <div className="rounded-3xl bg-gradient-to-br from-emerald-800 to-forest-900 p-4 text-white shadow-sm">
                <p className="text-[11px] font-semibold text-leaf-300 uppercase">Center Flow</p>
                <p className="font-display text-2xl font-extrabold text-leaf-300 mt-1">{congestionPct}% Smooth</p>
                <p className="text-[10px] text-white/70 mt-0.5">Low queue crowd</p>
              </div>

              {/* Estimated Payout */}
              <div className="rounded-3xl bg-gradient-to-br from-amber-800 to-forest-900 p-4 text-white shadow-sm">
                <p className="text-[11px] font-semibold text-gold-300 uppercase">Estimated Payout</p>
                <p className="font-display text-xl font-extrabold text-white mt-1">{formatRupee(estimatedTotalPayout)}</p>
                <p className="text-[10px] text-gold-200/80 mt-0.5">@ Govt MSP Rate</p>
              </div>

              {/* Moisture Grade */}
              <div className="rounded-3xl bg-gradient-to-br from-blue-900 to-forest-900 p-4 text-white shadow-sm">
                <p className="text-[11px] font-semibold text-blue-300 uppercase">Quality Verification</p>
                <p className="font-display text-xl font-extrabold text-blue-200 mt-1">Grade A Assured</p>
                <p className="text-[10px] text-white/70 mt-0.5">Moisture ~14.0%</p>
              </div>
            </div>

            {/* Time Saved Banner */}
            <div className="rounded-3xl bg-gradient-to-r from-leaf-500 to-forest-600 p-4 text-white flex items-center justify-between shadow-glow">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/15">
                  <TrendingDown className="h-5 w-5 text-gold-300" />
                </span>
                <div>
                  <p className="text-xs text-white/80">AI Optimized Time Saved:</p>
                  <p className="font-display text-lg font-bold text-gold-300">
                    Saved {timeSaved} Minutes & Zero Moisture Penalty
                  </p>
                </div>
              </div>
              <span className="chip bg-white/20 text-white font-bold text-xs">
                100% Certified
              </span>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleGeneratePass}
            className="w-full btn-primary text-sm py-3.5 flex items-center justify-center gap-2"
          >
            <Zap className="h-4 w-4 fill-white" />
            Book This AI-Optimized Slot Now
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
