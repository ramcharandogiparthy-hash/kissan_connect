import { useState } from 'react';
import {
  Ticket,
  CheckCircle2,
  X,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { getCentersData } from '@/lib/data';

interface BookSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BookSlotModal({ isOpen, onClose }: BookSlotModalProps) {
  const { lang, setView, addToken } = useApp();
  const [crop, setCrop] = useState('Paddy');
  const [quantity, setQuantity] = useState(40);
  const [centerId, setCenterId] = useState('vij');
  const [date, setDate] = useState('2026-08-28');
  const [time, setTime] = useState('10:30 AM');
  const [bookedToken, setBookedToken] = useState<string | null>(null);

  if (!isOpen) return null;

  const centers = getCentersData(lang);
  const selectedCenterObj = centers.find((c) => c.id === centerId) || centers[0];
  const centerName = selectedCenterObj ? selectedCenterObj.name : 'Vijayawada Procurement Center';

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    const cropLabel =
      crop === 'Paddy'
        ? 'Paddy (Grade A)'
        : crop === 'Cotton'
        ? 'Cotton (Medium Staple)'
        : crop === 'Maize'
        ? 'Maize (Yellow)'
        : crop;

    let formattedDate = date;
    try {
      formattedDate = new Date(date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      formattedDate = date;
    }

    const newTokenItem = addToken({
      crop: cropLabel,
      quantity,
      center: centerName,
      date: formattedDate || date,
      time,
      status: 'Confirmed',
      expressPass: true,
    });

    setBookedToken(newTokenItem.token);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-5xl glass p-6 sm:p-8 shadow-glass-lg animate-scale-in">
        <div className="flex items-start justify-between border-b border-forest-100 pb-4">
          <div>
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-leaf-600">
              <Ticket className="h-4 w-4" />{' '}
              {lang === 'te' ? 'AI స్మార్ట్ కొనుగోలు స్లాట్ బుకింగ్' : lang === 'hi' ? 'AI स्मार्ट खरीद स्लॉट बुकिंग' : 'AI Procurement Slot Booking'}
            </span>
            <h2 className="mt-1 font-display text-2xl font-extrabold text-forest-900">
              {lang === 'te' ? 'కొత్త కొనుగోలు టోకెన్ పొందండి' : lang === 'hi' ? 'नया खरीद टोकन प्राप्त करें' : 'Book New Procurement Token'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-2xl bg-forest-100 text-forest-700 hover:bg-forest-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!bookedToken ? (
          <form onSubmit={handleBook} className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-forest-700">
                  {lang === 'te' ? 'పంట రకం' : lang === 'hi' ? 'फसल का प्रकार' : 'Crop Type'}
                </label>
                <select
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-forest-200 bg-white px-4 py-2.5 text-sm font-bold text-forest-900 outline-none focus:ring-2 focus:ring-leaf-400"
                >
                  <option value="Paddy">{lang === 'te' ? 'వరి ధాన్యం (Paddy)' : 'Paddy (ధాన / వరి)'}</option>
                  <option value="Cotton">{lang === 'te' ? 'పత్తి (Cotton)' : 'Cotton (కపాస్ / ప్రత్తి)'}</option>
                  <option value="Maize">{lang === 'te' ? 'మొక్కజొన్న (Maize)' : 'Maize (మక్క / మొక్కజొన్న)'}</option>
                  <option value="Groundnut">{lang === 'te' ? 'వేరుశనగ (Groundnut)' : 'Groundnut (వేరుశెనగ)'}</option>
                  <option value="Wheat">{lang === 'te' ? 'గోధుమలు (Wheat)' : 'Wheat (గోధుమ)'}</option>
                  <option value="Green Gram (Moong)">{lang === 'te' ? 'పెసలు (Moong)' : 'Moong / Green Gram (मूंग)'}</option>
                  <option value="Black Gram (Urad)">{lang === 'te' ? 'మినుములు (Urad)' : 'Urad / Black Gram (उड़द)'}</option>
                  <option value="Red Chilli">{lang === 'te' ? 'ఎండు మిర్చి (Red Chilli)' : 'Red Chilli (लाल मिर्च)'}</option>
                  <option value="Sugarcane">{lang === 'te' ? 'చెరకు (Sugarcane)' : 'Sugarcane (गन्ना)'}</option>
                  <option value="Mustard">{lang === 'te' ? 'ఆవాలు (Mustard)' : 'Mustard (सरसों)'}</option>
                  <option value="Bengal Gram (Chana)">{lang === 'te' ? 'శనగలు (Chana)' : 'Bengal Gram (चना)'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-forest-700">
                  {lang === 'te' ? 'పరిమాణం (క్వింటాళ్లు)' : lang === 'hi' ? 'मात्रा (क्विंटल)' : 'Quantity (Quintals)'}
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={500}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="mt-1 w-full rounded-2xl border border-forest-200 bg-white px-4 py-2.5 text-sm font-bold text-forest-900 outline-none focus:ring-2 focus:ring-leaf-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-forest-700">
                {lang === 'te' ? 'కొనుగోలు కేంద్రాన్ని ఎంచుకోండి' : lang === 'hi' ? 'खरीद केंद्र चुनें' : 'Select Procurement Center'}
              </label>
              <select
                value={centerId}
                onChange={(e) => setCenterId(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-forest-200 bg-white px-4 py-2.5 text-sm font-bold text-forest-900 outline-none focus:ring-2 focus:ring-leaf-400"
              >
                {centers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.district})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-forest-700">
                  {lang === 'te' ? 'అపాయింట్‌మెంట్ తేదీ' : lang === 'hi' ? 'अपॉइंटमेंट तिथि' : 'Appointment Date'}
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-forest-200 bg-white px-4 py-2.5 text-sm font-bold text-forest-900 outline-none focus:ring-2 focus:ring-leaf-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-forest-700">
                  {lang === 'te' ? 'సమయం ఎంచుకోండి' : lang === 'hi' ? 'समय चुनें' : 'Preferred Time Slot'}
                </label>
                <select
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-forest-200 bg-white px-4 py-2.5 text-sm font-bold text-forest-900 outline-none focus:ring-2 focus:ring-leaf-400"
                >
                  <option value="09:00 AM">09:00 AM {lang === 'te' ? '(సిఫార్సు చేయబడింది)' : '(Recommended)'}</option>
                  <option value="10:30 AM">10:30 AM {lang === 'te' ? '(వేగవంతమైన క్యూ)' : '(Fastest Queue)'}</option>
                  <option value="01:30 PM">01:30 PM</option>
                  <option value="03:00 PM">03:00 PM</option>
                </select>
              </div>
            </div>

            {/* AI Recommendation Banner */}
            <div className="rounded-2xl border border-leaf-300 bg-leaf-50 p-3.5 flex items-start gap-2.5">
              <Sparkles className="h-4 w-4 shrink-0 text-leaf-600 mt-0.5" />
              <p className="text-xs text-leaf-800 font-medium">
                {lang === 'te'
                  ? 'AI సూచన: విజయవాడ వద్ద 10:30 AM స్లాట్ ఎంచుకుంటే 37 నిమిషాల వేచియుండే సమయం ఆదా అవుతుంది.'
                  : lang === 'hi'
                  ? 'AI सुझाव: 10:30 AM समय चुनने पर 37 मिनट का समय बचेगा।'
                  : 'AI Optimization: 10:30 AM at Vijayawada has lowest waiting time (saved 37 mins compared to 11:30 AM).'}
              </p>
            </div>

            <button
              type="submit"
              className="btn-primary w-full text-base"
            >
              {lang === 'te' ? 'స్మార్ట్ టోకెన్ జనరేట్ చేయండి' : lang === 'hi' ? 'स्मार्ट टोकन प्राप्त करें' : 'Generate Smart Token'} <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        ) : (
          <div className="mt-5 text-center space-y-4 animate-scale-in">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-leaf-500 to-forest-600 text-white shadow-glow">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-forest-400">
                {lang === 'te' ? 'టోకెన్ విజయవంతంగా పూర్తయింది' : lang === 'hi' ? 'टोकन सफल' : 'Token Confirmed'}
              </p>
              <h3 className="font-display text-4xl font-extrabold text-forest-900 mt-1">
                Token #{bookedToken}
              </h3>
              <p className="text-sm font-semibold text-leaf-700 mt-1">
                {crop} • {quantity} {lang === 'te' ? 'క్వింటాళ్లు' : 'Quintals'} • {time}
              </p>
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 text-[11px] font-bold text-purple-800 border border-purple-200">
                <span>⚡ Consecutive Queue Token Sync Active</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-3">
              <button
                onClick={() => {
                  onClose();
                  setView('token');
                }}
                className="btn-primary w-full"
              >
                {lang === 'te' ? 'టోకెన్ పాస్ & QR కోడ్ చూడండి' : lang === 'hi' ? 'डिजिटल पास और QR कोड देखें' : 'View Procurement Pass & QR Code'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

