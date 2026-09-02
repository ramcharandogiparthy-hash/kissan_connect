import { useState } from 'react';
import {
  Wheat,
  Plus,
  IndianRupee,
  ShieldCheck,
  ChevronRight,
  X,
  ArrowRight,
  Award,
} from 'lucide-react';
import { useApp, formatRupee } from '@/lib/app-context';
import { Reveal } from '@/components/Reveal';
import { getCentersData } from '@/lib/data';

interface ProduceItem {
  id: string;
  crop: string;
  variety: string;
  quantity: number;
  harvestDate: string;
  center: string;
  expectedPrice: number;
  status: 'Scheduled' | 'Quality Check' | 'Accepted' | 'Payment Processed';
  token: string;
}

const INITIAL_PRODUCE: ProduceItem[] = [
  {
    id: 'pr-1',
    crop: 'Paddy (వరి / धान)',
    variety: 'Grade A Common',
    quantity: 40,
    harvestDate: '24 Aug 2026',
    center: 'Vijayawada Procurement Center',
    expectedPrice: 92400,
    status: 'Quality Check',
    token: 'A127',
  },
  {
    id: 'pr-2',
    crop: 'Cotton (పత్తి / कपास)',
    variety: 'Medium Staple',
    quantity: 15,
    harvestDate: '18 Aug 2026',
    center: 'Guntur Procurement Center',
    expectedPrice: 106875,
    status: 'Accepted',
    token: 'C204',
  },
  {
    id: 'pr-3',
    crop: 'Maize (మొక్కజొన్న / मक्का)',
    variety: 'Yellow Hybrid',
    quantity: 25,
    harvestDate: '28 Aug 2026',
    center: 'Vijayawada Procurement Center',
    expectedPrice: 56250,
    status: 'Scheduled',
    token: 'M089',
  },
];

export function ProduceView() {
  const { t, lang, setView, addToken } = useApp();
  const [produceList, setProduceList] = useState<ProduceItem[]>(INITIAL_PRODUCE);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states for new produce
  const [crop, setCrop] = useState('Paddy (వరి / धान)');
  const [variety, setVariety] = useState('Grade A');
  const [quantity, setQuantity] = useState(30);
  const [center, setCenter] = useState('Vijayawada Procurement Center');
  const [harvestDate, setHarvestDate] = useState('2026-08-28');

  const centers = getCentersData(lang);

  const filteredList = statusFilter === 'All'
    ? produceList
    : produceList.filter((p) => p.status === statusFilter);

  const handleAddProduce = (e: React.FormEvent) => {
    e.preventDefault();
    const rate = crop.includes('Cotton') ? 7125 : crop.includes('Maize') ? 2250 : 2300;
    const expected = quantity * rate;

    const tokenObj = addToken({
      crop,
      quantity,
      center,
      date: harvestDate,
      time: '10:30 AM',
      status: 'Confirmed',
    });
    const newToken = tokenObj.token;

    const newItem: ProduceItem = {
      id: `pr-${Date.now()}`,
      crop,
      variety,
      quantity,
      harvestDate,
      center,
      expectedPrice: expected,
      status: 'Scheduled',
      token: newToken,
    };

    setProduceList([newItem, ...produceList]);
    setShowAddModal(false);
  };

  const getStatusBadge = (status: ProduceItem['status']) => {
    switch (status) {
      case 'Accepted':
      case 'Payment Processed':
        return 'bg-leaf-100 text-leaf-700 border-leaf-300';
      case 'Quality Check':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-28 lg:px-8 lg:pb-12">
      {/* Header */}
      <Reveal>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="section-eyebrow">
              <Wheat className="h-3.5 w-3.5" /> {t('nav_produce')}
            </span>
            <h1 className="mt-2 display-heading text-3xl sm:text-4xl">
              {lang === 'te' ? 'నా పంటల నమోదు & నూర్పిడి వివరాలు' : lang === 'hi' ? 'मेरी फसल दर्ज एवं ट्रैकिंग' : 'Produce Management & Tracking'}
            </h1>
            <p className="mt-1 text-forest-600">
              {lang === 'te'
                ? 'మీ పంట పరిమాణం నమోదు చేసుకొని, నాణ్యత తనిఖీ మరియు అంచనా ఆదాయాన్ని నేరుగా ట్రాక్ చేయండి.'
                : lang === 'hi'
                ? 'अपनी फसल दर्ज करें, गुणवत्ता जांच और अनुमानित भुगतान को लाइव ट्रैक करें।'
                : 'Log your crop details, track quality assessment, and view government guaranteed MSP payouts.'}
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary shrink-0 text-sm shadow-glow"
          >
            <Plus className="h-4.5 w-4.5" />
            {lang === 'te' ? 'కొత్త పంట నమోదు చేయండి' : lang === 'hi' ? 'नई फसल दर्ज करें' : 'Log New Produce'}
          </button>
        </div>
      </Reveal>

      {/* Overview Cards */}
      <Reveal delay={80}>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-3xl glass p-5 card-hover">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-leaf-100 text-leaf-600">
              <Wheat className="h-5 w-5" />
            </span>
            <p className="mt-3 font-display text-2xl font-extrabold text-forest-900">
              {produceList.reduce((acc, p) => acc + p.quantity, 0)} {lang === 'te' ? 'క్వింటాళ్లు' : lang === 'hi' ? 'क्विंटल' : 'Quintals'}
            </p>
            <p className="text-xs text-forest-500">{lang === 'te' ? 'మొత్తం నమోదైన పంట పరిమాణం' : lang === 'hi' ? 'कुल दर्ज फसल मात्रा' : 'Total Harvest Registered'}</p>
          </div>

          <div className="rounded-3xl glass p-5 card-hover">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gold-100 text-gold-700">
              <IndianRupee className="h-5 w-5" />
            </span>
            <p className="mt-3 font-display text-2xl font-extrabold text-forest-900">
              {formatRupee(produceList.reduce((acc, p) => acc + p.expectedPrice, 0))}
            </p>
            <p className="text-xs text-forest-500">{lang === 'te' ? 'అంచనా మొత్తం మద్దతు లబ్ధి' : lang === 'hi' ? 'अनुमानित कुल समर्थन मूल्य' : 'Estimated Total MSP Payout'}</p>
          </div>

          <div className="rounded-3xl glass p-5 card-hover">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-forest-100 text-forest-700">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <p className="mt-3 font-display text-2xl font-extrabold text-forest-900">
              {produceList.filter((p) => p.status === 'Accepted' || p.status === 'Payment Processed').length} / {produceList.length}
            </p>
            <p className="text-xs text-forest-500">{lang === 'te' ? 'స్వీకరించిన కొనుగోలు బాచ్‌లు' : lang === 'hi' ? 'स्वीकृत फसल लॉट' : 'Procured Lots Completed'}</p>
          </div>
        </div>
      </Reveal>

      {/* Filter tabs */}
      <Reveal delay={100}>
        <div className="mt-6 flex items-center justify-between border-b border-forest-100 pb-4">
          <div className="flex flex-wrap gap-2">
            {['All', 'Scheduled', 'Quality Check', 'Accepted'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`rounded-2xl px-4 py-2 text-xs font-bold transition ${
                  statusFilter === st
                    ? 'bg-forest-900 text-white shadow-sm'
                    : 'bg-white border border-forest-200 text-forest-700 hover:bg-cream-100'
                }`}
              >
                {st === 'All'
                  ? (lang === 'te' ? 'అన్ని పంటలు' : lang === 'hi' ? 'सभी फसलें' : 'All Produce')
                  : st === 'Scheduled'
                  ? (lang === 'te' ? 'షెడ్యూల్ చేయబడినవి' : lang === 'hi' ? 'शेड्यूल की गई' : 'Scheduled')
                  : st === 'Quality Check'
                  ? (lang === 'te' ? 'నాణ్యత పరిశీలనలో' : lang === 'hi' ? 'गुणवत्ता जांच में' : 'Quality Check')
                  : (lang === 'te' ? 'స్వీకరించబడినవి' : lang === 'hi' ? 'स्वीकृत' : 'Accepted')}
              </button>
            ))}
          </div>
          <span className="text-xs font-semibold text-forest-500 hidden sm:inline">
            {filteredList.length} {lang === 'te' ? 'రికార్డులు కనుగొనబడ్డాయి' : lang === 'hi' ? 'रिकॉर्ड मिले' : 'produce entries'}
          </span>
        </div>
      </Reveal>

      {/* Produce Cards Grid */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredList.map((item, i) => (
          <Reveal key={item.id} delay={i * 80}>
            <div className="group rounded-4xl glass p-5 card-hover">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-leaf-100 to-cream-200 text-leaf-600 transition-transform group-hover:scale-110">
                    <Wheat className="h-6 w-6" />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-bold text-forest-900">{item.crop}</h3>
                    <p className="text-xs text-forest-500">{item.variety} • Token #{item.token}</p>
                  </div>
                </div>
                <span className={`rounded-full px-3 py-1 text-[11px] font-extrabold border ${getStatusBadge(item.status)}`}>
                  {item.status}
                </span>
              </div>

              <div className="mt-4 rounded-2xl bg-gradient-to-br from-forest-50 to-cream-100 p-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-forest-500">{lang === 'te' ? 'పరిమాణం:' : lang === 'hi' ? 'मात्रा:' : 'Volume:'}</span>
                  <span className="font-bold text-forest-900">{item.quantity} {lang === 'te' ? 'క్వింటాళ్లు' : lang === 'hi' ? 'क्विंटल' : 'Quintals'}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-forest-500">{lang === 'te' ? 'నూర్పిడి తేదీ:' : lang === 'hi' ? 'कटाई तिथि:' : 'Harvest Date:'}</span>
                  <span className="font-semibold text-forest-800">{item.harvestDate}</span>
                </div>
                <div className="flex justify-between text-xs pt-1 border-t border-forest-100">
                  <span className="text-forest-500">{lang === 'te' ? 'మద్దతు చెల్లింపు:' : lang === 'hi' ? 'अनुमानित भुगतान:' : 'Expected Payout:'}</span>
                  <span className="font-display text-base font-extrabold text-leaf-700">{formatRupee(item.expectedPrice)}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-forest-500 pt-3 border-t border-forest-100">
                <button
                  onClick={() => setView('quality')}
                  className="flex items-center gap-1 font-bold text-leaf-700 hover:text-leaf-900 transition"
                >
                  <Award className="h-4 w-4 text-leaf-600" /> {lang === 'te' ? 'నాణ్యత పరిశీలన' : 'Quality Check'}
                </button>
                <button
                  onClick={() => setView('token')}
                  className="flex items-center gap-1 font-bold text-forest-700 hover:underline"
                >
                  {lang === 'te' ? 'ట్రాక్ చేయండి' : lang === 'hi' ? 'टोकन देखें' : 'Track Token'} <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Add Produce Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-5xl glass p-6 sm:p-8 shadow-glass-lg animate-scale-in">
            <div className="flex items-start justify-between border-b border-forest-100 pb-4">
              <div>
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-leaf-600">
                  <Plus className="h-4 w-4" />{' '}
                  {lang === 'te' ? 'కొత్త పంట వివరాల లభ్యత నమోదు' : lang === 'hi' ? 'नई फसल का पंजीकरण' : 'Register New Harvest Batch'}
                </span>
                <h2 className="mt-1 font-display text-2xl font-extrabold text-forest-900">
                  {lang === 'te' ? 'పంట నాణ్యత & నూర్పిడి సమాచారం' : lang === 'hi' ? 'फसल विवरण भरें' : 'Log Produce Details'}
                </h2>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="grid h-9 w-9 place-items-center rounded-2xl bg-forest-100 text-forest-700 hover:bg-forest-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddProduce} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-forest-700">
                  {lang === 'te' ? 'పంట రకం' : lang === 'hi' ? 'फसल का प्रकार' : 'Crop Type'}
                </label>
                <select
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-forest-200 bg-white px-4 py-2.5 text-sm font-bold text-forest-900 outline-none focus:ring-2 focus:ring-leaf-400"
                >
                  <option value="Paddy (వరి / धान)">Paddy (వరి ధాన్యం / धान)</option>
                  <option value="Cotton (పత్తి / कपास)">Cotton (పత్తి / कपास)</option>
                  <option value="Maize (మొక్కజొన్న / मक्का)">Maize (మొక్కజొన్న / मक्का)</option>
                  <option value="Groundnut (వేరుశనగ / మూంగఫలీ)">Groundnut (వేరుశనగ / मूंगफली)</option>
                  <option value="Wheat (గోధుమలు / गेहूं)">Wheat (గోధుమలు / गेहूं)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-forest-700">
                    {lang === 'te' ? 'రకం / వెరైటీ' : lang === 'hi' ? 'किस्म / वैरायटी' : 'Variety'}
                  </label>
                  <input
                    type="text"
                    required
                    value={variety}
                    onChange={(e) => setVariety(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-forest-200 bg-white px-4 py-2.5 text-sm font-bold text-forest-900 outline-none focus:ring-2 focus:ring-leaf-400"
                  />
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
                  {lang === 'te' ? 'కొనుగోలు కేంద్రం' : lang === 'hi' ? 'खरीद केंद्र' : 'Procurement Center'}
                </label>
                <select
                  value={center}
                  onChange={(e) => setCenter(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-forest-200 bg-white px-4 py-2.5 text-sm font-bold text-forest-900 outline-none focus:ring-2 focus:ring-leaf-400"
                >
                  {centers.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.district})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-forest-700">
                  {lang === 'te' ? 'నూర్పిడి / సేకరణ తేదీ' : lang === 'hi' ? 'कटाई तिथि' : 'Harvest Date'}
                </label>
                <input
                  type="date"
                  required
                  value={harvestDate}
                  onChange={(e) => setHarvestDate(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-forest-200 bg-white px-4 py-2.5 text-sm font-bold text-forest-900 outline-none focus:ring-2 focus:ring-leaf-400"
                />
              </div>

              <button
                type="submit"
                className="btn-primary w-full text-base"
              >
                {lang === 'te' ? 'పంట వివరాలు నమోదు చేయండి' : lang === 'hi' ? 'फसल दर्ज करें' : 'Save & Register Harvest'} <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
