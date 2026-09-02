import { useEffect, useState } from 'react';
import {
  Users,
  Ticket,
  Clock,
  CheckCircle2,
  Wheat,
  Wallet,
  AlertTriangle,
  Sparkles,
  BarChart3,
  PieChart,
  Star,
  Smile,
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { Reveal } from '@/components/Reveal';
import { CENTER_DASH, WEEK_VOLUME, SATISFACTION, getCropData } from '@/lib/data';
import { useCenterStats, useSmartAlerts, useCropDist, useWeekVolume, useSatisfaction } from '@/lib/hooks';
import { ProcurementVolumeChart } from '@/components/ProcurementVolumeChart';
import { WaitingTimeTrendChart } from '@/components/WaitingTimeTrendChart';

type Filter = 'today' | 'week' | 'month' | 'year';

function DonutChart({ data }: { data: { crop: string; pct: number; color: string }[] }) {
  const radius = 60;
  const c = 2 * Math.PI * radius;
  let offset = 0;
  return (
    <div className="flex items-center gap-6">
      <div className="relative h-36 w-36 shrink-0">
        <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
          {data.map((d, i) => {
            const len = (d.pct / 100) * c;
            const seg = (
              <circle
                key={i}
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke={d.color}
                strokeWidth="18"
                strokeDasharray={`${len} ${c - len}`}
                strokeDashoffset={-offset}
                style={{ transition: 'stroke-dasharray 1s ease' }}
              />
            );
            offset += len;
            return seg;
          })}
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center">
            <p className="font-display text-xl font-bold text-forest-900">{data.length}</p>
            <p className="text-[10px] text-forest-400">Crops</p>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {data.map((d) => (
          <div key={d.crop} className="flex items-center gap-2 text-sm">
            <span className="h-3 w-3 rounded-full" style={{ background: d.color }} />
            <span className="font-medium text-forest-700">{d.crop}</span>
            <span className="ml-auto font-semibold text-forest-500">{d.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: typeof Users;
  value: string;
  label: string;
  color: string;
}) {
  return (
    <div className="rounded-3xl glass p-4 card-hover">
      <span className={`grid h-10 w-10 place-items-center rounded-xl ${color}`}>
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-3 font-display text-2xl font-extrabold text-forest-900">{value}</p>
      <p className="text-xs text-forest-500">{label}</p>
    </div>
  );
}

export function AnalyticsView() {
  const { t, lang } = useApp();
  const [filter, setFilter] = useState<Filter>('week');
  const [capacity, setCapacity] = useState(0);

  const { data: cs } = useCenterStats();
  const { data: alerts } = useSmartAlerts();
  const { data: cropDist } = useCropDist();
  const { data: weekVol } = useWeekVolume();
  const { data: satisfaction } = useSatisfaction();

  const stats = cs ?? {
    farmers_today: CENTER_DASH.farmersToday,
    tokens: CENTER_DASH.tokens,
    waiting: CENTER_DASH.waiting,
    completed: CENTER_DASH.completed,
    quintals: CENTER_DASH.quintals,
    payments_lakh: CENTER_DASH.paymentsLakh,
    capacity_pct: CENTER_DASH.capacityPct,
  };

  useEffect(() => {
    const timer = setTimeout(() => setCapacity(stats.capacity_pct), 400);
    return () => clearTimeout(timer);
  }, [stats.capacity_pct]);

  const filters: Filter[] = ['today', 'week', 'month', 'year'];

  const alert = alerts && alerts.length > 0 ? alerts[0] : null;

  const volumeData = (weekVol && weekVol.length > 0
    ? weekVol.map((w) => ({ day: w.day, value: w.volume }))
    : WEEK_VOLUME);

  const waitData = (weekVol && weekVol.length > 0
    ? weekVol.map((w) => ({ day: w.day, wait_min: w.wait_min }))
    : WEEK_VOLUME.map((d) => ({ day: d.day, wait_min: Math.round(d.value * 0.4) })));

  const fallbackCrops = getCropData(lang);
  const cropData = (cropDist && cropDist.length > 0
    ? cropDist.map((c) => ({ crop: c.crop, pct: c.pct, color: c.color }))
    : fallbackCrops.map((c) => ({ crop: c.crop, pct: c.pct, color: c.color })));

  const satData = (satisfaction && satisfaction.length > 0
    ? satisfaction.map((s) => ({ label: s.label, pct: s.pct }))
    : SATISFACTION);

  const avgRating = satisfaction && satisfaction.length > 0
    ? Number(satisfaction[0].average_rating)
    : 4.7;

  const totalRatings = satisfaction && satisfaction.length > 0
    ? satisfaction[0].total_ratings
    : 2847;

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-28 lg:px-8 lg:pb-12">
      <Reveal>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="section-eyebrow">
              <BarChart3 className="h-3.5 w-3.5" /> {t('analytics_title')}
            </span>
            <h1 className="mt-3 display-heading text-3xl sm:text-4xl">
              {lang === 'te' ? 'కేంద్ర సమాచార డాష్‌బోర్డ్' : lang === 'hi' ? 'खरीद केंद्र डैशबोर्ड' : 'Center Dashboard'}
            </h1>
          </div>
          <div className="flex gap-1 rounded-2xl glass p-1">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-xl px-3 py-2 text-xs font-semibold capitalize transition ${
                  filter === f
                    ? 'bg-leaf-500 text-white shadow'
                    : 'text-forest-600 hover:bg-cream-100'
                }`}
              >
                {f === 'today'
                  ? (lang === 'te' ? 'ఈ రోజు' : lang === 'hi' ? 'आज' : 'Today')
                  : f === 'week'
                  ? (lang === 'te' ? 'ఈ వారం' : lang === 'hi' ? 'इस सप्ताह' : 'Week')
                  : f === 'month'
                  ? (lang === 'te' ? 'ఈ నెల' : lang === 'hi' ? 'इस महीने' : 'Month')
                  : (lang === 'te' ? 'ఈ సంవత్సరం' : lang === 'hi' ? 'इस वर्ष' : 'Year')}
              </button>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Top stat cards */}
      <Reveal delay={100}>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard icon={Users} value={String(stats.farmers_today)} label={lang === 'te' ? 'ఈ రోజు రైతులు' : lang === 'hi' ? 'आज के किसान' : 'Farmers Today'} color="bg-leaf-100 text-leaf-600" />
          <StatCard icon={Ticket} value={String(stats.tokens)} label={lang === 'te' ? 'టోకెన్లు' : lang === 'hi' ? 'कुल टोकन' : 'Tokens'} color="bg-gold-100 text-gold-700" />
          <StatCard icon={Clock} value={String(stats.waiting)} label={lang === 'te' ? 'వేచి ఉన్నారు' : lang === 'hi' ? 'प्रतीक्षारत' : 'Waiting'} color="bg-red-100 text-red-600" />
          <StatCard icon={CheckCircle2} value={String(stats.completed)} label={lang === 'te' ? 'పూర్తయ్యాయి' : lang === 'hi' ? 'संपन्न' : 'Completed'} color="bg-leaf-100 text-leaf-600" />
          <StatCard icon={Wheat} value={String(stats.quintals)} label={lang === 'te' ? 'క్వింటాళ్లు' : lang === 'hi' ? 'क्विंटल' : 'Quintals'} color="bg-cream-200 text-forest-700" />
          <StatCard icon={Wallet} value={`₹${stats.payments_lakh}L`} label={lang === 'te' ? 'జమయిన సొమ్ము' : lang === 'hi' ? 'कुल भुगतान' : 'Payments'} color="bg-forest-100 text-forest-700" />
        </div>
      </Reveal>

      {/* Capacity + Alerts */}
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Reveal className="lg:col-span-2">
          <div className="rounded-5xl glass p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-forest-900">
                {lang === 'te' ? 'కేంద్ర సామర్థ్యం' : lang === 'hi' ? 'केंद्र क्षमता' : 'Center Capacity'}
              </h3>
              <span className="chip bg-leaf-100 text-leaf-700">
                <span className="h-2 w-2 rounded-full bg-leaf-500" /> {lang === 'te' ? 'ఆరోగ్యకరం' : lang === 'hi' ? 'सामान्य' : 'Healthy'}
              </span>
            </div>
            <div className="mt-5">
              <div className="flex items-end justify-between">
                <span className="font-display text-5xl font-extrabold gradient-text">
                  {capacity}%
                </span>
                <span className="text-sm text-forest-500">{lang === 'te' ? 'గరిష్ట సామర్థ్యంలో' : lang === 'hi' ? 'अधिकतम क्षमता पर' : 'of maximum capacity'}</span>
              </div>
              <div className="mt-4 h-4 overflow-hidden rounded-full bg-forest-50">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-leaf-500 via-leaf-400 to-gold-400 transition-all duration-1000"
                  style={{ width: `${capacity}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between text-xs text-forest-400">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Smart Alert */}
        <Reveal delay={120}>
          <div className="h-full rounded-5xl bg-gradient-to-br from-red-500 to-red-600 p-6 text-white shadow-[0_20px_60px_rgba(239,68,68,0.25)]">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="font-display text-lg font-bold">
                {alert?.title ?? (lang === 'te' ? 'అధిక రద్దీ హెచ్చరిక' : lang === 'hi' ? 'अधिक भीड़ चेतावनी' : 'High Crowd Alert')}
              </h3>
            </div>
            <p className="mt-2 text-sm text-white/90">
              {alert?.body ?? (lang === 'te' ? 'విజయవాడ కేంద్రం గరిష్ట సామర్థ్యానికి చేరుకుంటోంది.' : lang === 'hi' ? 'विजयवाड़ा केंद्र पर भीड़ बढ़ रही है।' : 'Vijayawada Center is approaching maximum capacity.')}
            </p>
            <div className="mt-4 rounded-2xl bg-white/15 p-3 backdrop-blur">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-gold-200">
                <Sparkles className="h-3.5 w-3.5" /> AI {lang === 'te' ? 'సిఫార్సు' : lang === 'hi' ? 'सुझाव' : 'Recommendation'}
              </p>
              <p className="mt-1 text-sm text-white/90">
                {alert?.recommendation ?? (lang === 'te' ? '18 మంది రైతులను గుంటూరు కొనుగోలు కేంద్రానికి మళ్లించండి.' : lang === 'hi' ? '18 किसानों को गुंटूर केंद्र पर पुनर्निर्देशित करें।' : 'Redirect 18 upcoming farmers to Guntur Center.')}
              </p>
            </div>
            <button className="mt-4 w-full rounded-2xl bg-white px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-cream-50">
              {t('apply_ai')}
            </button>
          </div>
        </Reveal>
      </div>

      {/* Charts */}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Reveal>
          <div className="rounded-5xl glass p-6">
            <ProcurementVolumeChart data={volumeData} />
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="rounded-5xl glass p-6">
            <div className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-leaf-600" />
              <h3 className="font-display text-lg font-bold text-forest-900">
                {lang === 'te' ? 'పంటల వారీగా కొనుగోలు' : lang === 'hi' ? 'फसल अनुसार खरीद' : 'Crop-wise Procurement'}
              </h3>
            </div>
            <p className="mt-1 text-xs text-forest-500">
              {lang === 'te' ? 'పంట రకం వారీగా శాతం విభజన' : lang === 'hi' ? 'फसल के अनुसार प्रतिशत वितरण' : 'Distribution by crop type'}
            </p>
            <div className="mt-5">
              <DonutChart data={cropData} />
            </div>
          </div>
        </Reveal>
      </div>

      {/* Waiting time + Satisfaction */}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Reveal>
          <div className="rounded-5xl glass p-6">
            <WaitingTimeTrendChart data={waitData} />
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="rounded-5xl glass p-6">
            <div className="flex items-center gap-2">
              <Smile className="h-5 w-5 text-leaf-600" />
              <h3 className="font-display text-lg font-bold text-forest-900">
                {lang === 'te' ? 'రైతుల సంతృప్తి రేటింగ్' : lang === 'hi' ? 'किसान संतुष्टि रेटिंग' : 'Farmer Satisfaction'}
              </h3>
            </div>
            <p className="mt-1 text-xs text-forest-500">
              {lang === 'te' ? `${totalRatings.toLocaleString('en-IN')} రేటింగ్‌ల ఆధారంగా` : lang === 'hi' ? `${totalRatings.toLocaleString('en-IN')} रेटिंग के आधार पर` : `Based on ${totalRatings.toLocaleString('en-IN')} ratings`}
            </p>
            <div className="mt-5 space-y-3">
              {satData.map((s, i) => (
                <div key={s.label} className="flex items-center gap-3">
                  <span className="flex w-16 items-center gap-0.5 text-xs font-medium text-forest-600">
                    {s.label.replace(' Star', '').replace(' స్టార్', '')}
                    <Star className="h-3 w-3 fill-gold-400 text-gold-400" />
                  </span>
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-forest-50">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-leaf-500 to-gold-400 transition-all duration-700"
                      style={{ width: `${s.pct}%`, animationDelay: `${i * 100}ms` }}
                    />
                  </div>
                  <span className="w-8 text-right text-xs font-semibold text-forest-500">
                    {s.pct}%
                  </span>
                </div>
              ))}
              <div className="mt-3 flex items-center gap-2 rounded-2xl bg-leaf-50 px-4 py-3">
                <Star className="h-5 w-5 fill-gold-400 text-gold-400" />
                <span className="font-display text-2xl font-extrabold text-forest-900">
                  {avgRating.toFixed(1)}
                </span>
                <span className="text-sm text-forest-500">
                  {lang === 'te' ? 'సగటు సంతృప్తి రేటింగ్' : lang === 'hi' ? 'औसत संतुष्टि रेटिंग' : 'average rating'}
                </span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

