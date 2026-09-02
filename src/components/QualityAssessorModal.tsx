import { useState } from 'react';
import {
  Sparkles,
  Sun,
  CheckCircle2,
  AlertTriangle,
  X,
} from 'lucide-react';
import { useApp } from '@/lib/app-context';

interface QualityAssessorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CROP_MOISTURE_BASE: Record<string, { standard: number; msp: number }> = {
  Paddy: { standard: 14.0, msp: 2300 },
  Cotton: { standard: 8.0, msp: 7125 },
  Maize: { standard: 14.0, msp: 2250 },
  Groundnut: { standard: 8.0, msp: 6780 },
  Wheat: { standard: 12.0, msp: 2275 },
};

export function QualityAssessorModal({ isOpen, onClose }: QualityAssessorModalProps) {
  const { lang } = useApp();
  const [crop, setCrop] = useState('Paddy');
  const [quantity, setQuantity] = useState(40);
  const [moisture, setMoisture] = useState(16.5);
  const [foreignMatter, setForeignMatter] = useState(1.2);
  const [damagedGrain, setDamagedGrain] = useState(2.0);

  if (!isOpen) return null;

  const base = CROP_MOISTURE_BASE[crop] ?? CROP_MOISTURE_BASE['Paddy'];
  const stdMoisture = base.standard;
  const mspRate = base.msp;

  // Deduction math
  const moistureDiff = Math.max(0, moisture - stdMoisture);
  const deductionPerQuintal = Math.round(
    moistureDiff * 35 + Math.max(0, foreignMatter - 1) * 20 + Math.max(0, damagedGrain - 1) * 15
  );
  const finalPricePerQuintal = Math.max(1000, mspRate - deductionPerQuintal);
  const grossTotal = quantity * mspRate;
  const netTotal = quantity * finalPricePerQuintal;
  const totalLoss = grossTotal - netTotal;

  // AI Recommendation
  const dryingDays = (moistureDiff / 2.0).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-5xl glass p-6 sm:p-8 shadow-glass-lg animate-scale-in">
        <div className="flex items-start justify-between border-b border-forest-100 pb-4">
          <div>
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-leaf-600">
              <Sparkles className="h-4 w-4" />{' '}
              {lang === 'te' ? 'AI పంట నాణ్యత & తేమ పరీక్షా సాధనం' : lang === 'hi' ? 'AI फसल गुणवत्ता व नमी जांच' : 'AI Pre-Procurement Quality Assessor'}
            </span>
            <h2 className="mt-1 font-display text-2xl font-extrabold text-forest-900">
              {lang === 'te' ? 'ధాన్యం తేమ శాతము మరియు ధర లెక్కింపు' : lang === 'hi' ? 'अनाज नमी एवं मूल्य आंकलन' : 'Crop Moisture & Price Assessor'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-2xl bg-forest-100 text-forest-700 hover:bg-forest-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {/* Controls */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-forest-700">
                {lang === 'te' ? 'పంటను ఎంచుకోండి' : lang === 'hi' ? 'फसल का चयन करें' : 'Select Crop'}
              </label>
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-forest-200 bg-white px-4 py-3 text-sm font-bold text-forest-900 outline-none focus:ring-2 focus:ring-leaf-400"
              >
                {Object.keys(CROP_MOISTURE_BASE).map((c) => (
                  <option key={c} value={c}>
                    {c} ({lang === 'te' ? 'ప్రమాణ తేమ' : lang === 'hi' ? 'मानक नमी' : 'Standard Moisture'}: {CROP_MOISTURE_BASE[c].standard}%)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-forest-700">
                <span>{lang === 'te' ? 'పరిమాణం (క్వింటాళ్లు)' : lang === 'hi' ? 'मात्रा (क्विंटल)' : 'Quantity (Quintals)'}</span>
                <span className="font-bold text-leaf-700">{quantity} {lang === 'te' ? 'క్వింటాళ్లు' : lang === 'hi' ? 'क्विंटल' : 'Qtl'}</span>
              </div>
              <input
                type="range"
                min={5}
                max={200}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="mt-2 w-full accent-leaf-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-forest-700">
                <span>{lang === 'te' ? 'కొలిచిన తేమ శాతం (%)' : lang === 'hi' ? 'मापी गई नमी (%)' : 'Measured Moisture Content (%)'}</span>
                <span className={`font-bold ${moisture > stdMoisture ? 'text-amber-600' : 'text-leaf-600'}`}>
                  {moisture}% ({lang === 'te' ? 'గరిష్ట పరిమితి' : lang === 'hi' ? 'अधिकतम सीमा' : 'Max Standard'}: {stdMoisture}%)
                </span>
              </div>
              <input
                type="range"
                min={6}
                max={25}
                step={0.5}
                value={moisture}
                onChange={(e) => setMoisture(Number(e.target.value))}
                className="mt-2 w-full accent-leaf-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-forest-700">
                <span>{lang === 'te' ? 'వ్యర్థాలు / దుమ్ము శాతం (%)' : lang === 'hi' ? 'कचरा / धूल (%)' : 'Foreign Matter / Dust (%)'}</span>
                <span className="font-bold text-forest-800">{foreignMatter}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={5}
                step={0.1}
                value={foreignMatter}
                onChange={(e) => setForeignMatter(Number(e.target.value))}
                className="mt-2 w-full accent-leaf-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-forest-700">
                  {lang === 'te' ? 'పాడైన ధాన్యం శాతం' : lang === 'hi' ? 'क्षतिग्रस्त अनाज %' : 'Damaged Grain %'}
                </span>
                <span className="font-bold text-forest-800">{damagedGrain}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                step={0.1}
                value={damagedGrain}
                onChange={(e) => setDamagedGrain(Number(e.target.value))}
                className="mt-2 w-full accent-leaf-500"
              />
            </div>
          </div>

          {/* AI Verdict & Financial Calculation */}
          <div className="space-y-4">
            <div className="rounded-3xl border border-forest-100 bg-cream-50 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-forest-400">
                {lang === 'te' ? 'నాణ్యత తనిఖీ ఫలితం' : lang === 'hi' ? 'गुणवत्ता जांच परिणाम' : 'Quality Assessment Result'}
              </p>
              
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-forest-500">{lang === 'te' ? 'ప్రభుత్వ MSP ధర' : lang === 'hi' ? 'सरकारी MSP दर' : 'Government MSP Rate'}</p>
                  <p className="font-display text-xl font-bold text-forest-900">₹{mspRate.toLocaleString('en-IN')}/{lang === 'te' ? 'క్వింటాల్' : lang === 'hi' ? 'क्विंटल' : 'qtl'}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-forest-500">{lang === 'te' ? 'అంచనా నికర ధర' : lang === 'hi' ? 'अनुमानित शुद्ध दर' : 'Expected Net Rate'}</p>
                  <p className={`font-display text-xl font-bold ${deductionPerQuintal > 0 ? 'text-amber-600' : 'text-leaf-600'}`}>
                    ₹{finalPricePerQuintal.toLocaleString('en-IN')}/{lang === 'te' ? 'క్వింటాల్' : lang === 'hi' ? 'क्विंटल' : 'qtl'}
                  </p>
                </div>
              </div>

              {deductionPerQuintal > 0 ? (
                <div className="mt-4 rounded-2xl bg-amber-50 p-3.5 border border-amber-200">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
                    <div>
                      <p className="text-xs font-bold text-amber-800">
                        {lang === 'te' ? 'అధిక తేమ హెచ్చరిక!' : lang === 'hi' ? 'अधिक नमी की चेतावनी!' : 'High Moisture Warning'}
                      </p>
                      <p className="text-xs text-amber-700 mt-0.5">
                        {lang === 'te'
                          ? `తేమ శాతం ${moisture}% వద్ద ఉంది (${stdMoisture}% పరిమితి కంటే ఎక్కువ). కోత: -₹${deductionPerQuintal}/క్వింటాల్ (-₹${totalLoss.toLocaleString('en-IN')} మొత్తం లాస్).`
                          : lang === 'hi'
                          ? `नमी का स्तर ${moisture}% है (${stdMoisture}% सीमा से अधिक)। कटौती: -₹${deductionPerQuintal}/क्विंटल (-₹${totalLoss.toLocaleString('en-IN')} नुकसान)।`
                          : `Moisture is ${moisture}% (${moistureDiff.toFixed(1)}% above 14% limit). Deductions: -₹${deductionPerQuintal}/qtl (-₹${totalLoss.toLocaleString('en-IN')} total).`}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-2xl bg-leaf-50 p-3.5 border border-leaf-200">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-leaf-600" />
                    <div>
                      <p className="text-xs font-bold text-leaf-800">
                        {lang === 'te' ? 'గ్రేడ్-A — పూర్తి మద్దతు ధర' : lang === 'hi' ? 'ग्रेड-ए — 100% समर्थन मूल्य' : 'Grade A - Full MSP Payout'}
                      </p>
                      <p className="text-xs text-leaf-700 mt-0.5">
                        {lang === 'te'
                          ? 'మీ పంట ఉత్తమ స్థితిలో ఉంది. ఎటువంటి కోతలు లేకుండా 100% ప్రభుత్వం మద్దతు ధర లభిస్తుంది!'
                          : lang === 'hi'
                          ? 'आपकी फसल की गुणवत्ता सर्वोत्तम है। बिना किसी कटौती के पूरा 100% मूल्य मिलेगा!'
                          : 'Your produce is in optimal condition. Eligible for 100% MSP with zero deductions!'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* AI Drying Advisor Card */}
            {deductionPerQuintal > 0 && (
              <div className="rounded-3xl border border-leaf-300 bg-gradient-to-br from-leaf-900 to-forest-900 p-5 text-white shadow-glow">
                <div className="flex items-center gap-2 text-leaf-300 font-bold text-xs">
                  <Sun className="h-4 w-4 fill-leaf-300" />
                  <span>{lang === 'te' ? 'AI సూచన: గరిష్ట ఆదాయం కోసం' : lang === 'hi' ? 'AI सलाह: अधिकतम लाभ के लिए' : 'AI Advisory: Maximize Your Payout'}</span>
                </div>
                <p className="mt-2 text-sm text-forest-100">
                  {lang === 'te'
                    ? `మీ ${crop} ను కేంద్రానికి తీసుకెళ్లే ముందు కల్లంలో <strong class="text-leaf-300">${dryingDays} రోజులు</strong> ఎండలో ఆరబెట్టండి.`
                    : lang === 'hi'
                    ? `अपनी ${crop} को केंद्र ले जाने से पहले खलिहान में <strong class="text-leaf-300">${dryingDays} दिन</strong> धूप में सुखाएं।`
                    : `Sun-dry your ${crop} for <strong className="text-leaf-300">${dryingDays} days</strong> in open field before taking it to the center.`}
                </p>
                <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
                  <span className="text-xs text-forest-200">{lang === 'te' ? 'ఆదా అయ్యే సొమ్ము:' : lang === 'hi' ? 'संभावित अतिरिक्त लाभ:' : 'Potential Profit Gain:'}</span>
                  <span className="font-display text-base font-extrabold text-leaf-300">
                    +₹{totalLoss.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-forest-100 pt-4">
          <button
            onClick={onClose}
            className="rounded-2xl bg-forest-900 px-6 py-3 text-sm font-bold text-white shadow transition hover:bg-forest-800"
          >
            {lang === 'te' ? 'పూర్తయింది & సేవ్ చేయండి' : lang === 'hi' ? 'सहेजें और बंद करें' : 'Done & Save Assessment'}
          </button>
        </div>
      </div>
    </div>
  );
}

