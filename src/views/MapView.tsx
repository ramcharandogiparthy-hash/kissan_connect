import { useState, useMemo } from 'react';
import {
  MapPin,
  Users,
  Clock,
  Star,
  ArrowRight,
  Store,
  TrendingUp,
  Navigation,
  Compass,
  Loader2,
  ExternalLink,
  X,
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { Reveal } from '@/components/Reveal';
import { getCentersData, type CrowdLevel } from '@/lib/data';
import { useCenters, type ProcurementCenter as DBProcurementCenter } from '@/lib/hooks';
import {
  useUserLocation,
  calculateDistanceKm,
  openGoogleMapsNavigation,
  CENTER_COORDS,
} from '@/lib/use-navigation';

type Center = {
  id: string;
  name: string;
  district: string;
  crowd: CrowdLevel;
  farmersWaiting: number;
  avgWaitMin: number;
  capacityPct: number;
  bestChoice: boolean;
  x: number;
  y: number;
};

function mapCenter(c: DBProcurementCenter): Center {
  return {
    id: c.id,
    name: c.name,
    district: c.district,
    crowd: c.crowd as CrowdLevel,
    farmersWaiting: c.farmers_waiting,
    avgWaitMin: c.avg_wait_min,
    capacityPct: c.capacity_pct,
    bestChoice: c.best_choice,
    x: Number(c.map_x),
    y: Number(c.map_y),
  };
}

const CROWD_STYLES: Record<CrowdLevel, { dot: string; bg: string; text: string; label: string }> = {
  low: { dot: 'bg-leaf-500', bg: 'bg-leaf-100', text: 'text-leaf-700', label: 'Low Crowd' },
  moderate: { dot: 'bg-gold-400', bg: 'bg-gold-100', text: 'text-gold-700', label: 'Moderate Crowd' },
  high: { dot: 'bg-red-500', bg: 'bg-red-100', text: 'text-red-600', label: 'High Crowd' },
};

function MapMarker({
  center,
  onClick,
  active,
  distanceKm,
}: {
  center: Center;
  onClick: () => void;
  active: boolean;
  distanceKm?: number | null;
}) {
  const s = CROWD_STYLES[center.crowd];
  return (
    <button
      onClick={onClick}
      className="absolute -translate-x-1/2 -translate-y-1/2 group"
      style={{ left: `${center.x}%`, top: `${center.y}%` }}
    >
      <span className="relative grid place-items-center">
        {active && (
          <span className={`absolute h-10 w-10 rounded-full ${s.dot} opacity-30 animate-pulse-ring`} />
        )}
        <span
          className={`relative grid h-7.5 w-7.5 place-items-center rounded-full ${s.dot} text-white shadow-lg transition-transform group-hover:scale-125 ${
            active ? 'ring-4 ring-white' : ''
          }`}
        >
          <Store className="h-4 w-4" />
        </span>
        {distanceKm != null && (
          <span className="absolute top-8 whitespace-nowrap rounded-full bg-forest-900/90 px-2 py-0.5 text-[10px] font-bold text-white shadow backdrop-blur">
            {distanceKm} km
          </span>
        )}
      </span>
    </button>
  );
}

export function MapView() {
  const { t, lang, setView } = useApp();
  const { data: dbCenters } = useCenters();
  const { coords, loading: locLoading, error: locError, requestLocation } = useUserLocation();

  const [showNavModal, setShowNavModal] = useState(false);

  const fallbackCenters = getCentersData(lang);

  const centers: Center[] = dbCenters && dbCenters.length > 0
    ? dbCenters.map(mapCenter)
    : fallbackCenters.map((center) => ({
        id: center.id,
        name: center.name,
        district: center.district,
        crowd: center.crowd,
        farmersWaiting: center.farmersWaiting,
        avgWaitMin: center.avgWaitMin,
        capacityPct: center.capacityPct,
        bestChoice: center.bestChoice ?? false,
        x: center.x,
        y: center.y,
      }));

  const [selected, setSelected] = useState<Center | null>(centers[0] ?? null);

  // Compute distances if location exists
  const centerDistances = useMemo(() => {
    if (!coords) return {};
    const map: Record<string, number> = {};
    centers.forEach((c) => {
      const target = CENTER_COORDS[c.id];
      if (target) {
        map[c.id] = calculateDistanceKm(coords.lat, coords.lng, target.lat, target.lng);
      } else {
        map[c.id] = 15.2; // default estimate
      }
    });
    return map;
  }, [coords, centers]);

  const selectedDistance = selected ? centerDistances[selected.id] : null;

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-28 lg:px-8 lg:pb-12">
      <Reveal>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="section-eyebrow">
              <MapPin className="h-3.5 w-3.5" /> {t('map_title')}
            </span>
            <h1 className="mt-2 display-heading text-3xl sm:text-4xl">{t('map_sub')}</h1>
          </div>

          {/* Location & Navigation button */}
          <button
            onClick={requestLocation}
            disabled={locLoading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-leaf-500 to-forest-600 px-5 py-3 text-sm font-bold text-white shadow-glow transition hover:from-leaf-600 hover:to-forest-700 disabled:opacity-70"
          >
            {locLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            ) : (
              <Navigation className="h-4 w-4 fill-white" />
            )}
            {coords
              ? (lang === 'te' ? '📍 ప్రత్యక్ష స్థానం నవీకరించబడింది' : lang === 'hi' ? '📍 लाइव स्थान अपडेट हुआ' : '📍 Location Updated')
              : (lang === 'te' ? '📍 నా ప్రస్తుత స్థానం పొందండి' : lang === 'hi' ? '📍 मेरा वर्तमान स्थान प्राप्त करें' : '📍 Get My Current Location')}
          </button>
        </div>

        {/* Location alert status */}
        {coords && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-leaf-300 bg-leaf-50/80 px-4 py-3 text-xs font-semibold text-leaf-800 backdrop-blur animate-fade-up">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-leaf-500 animate-ping" />
              <span>
                {lang === 'te'
                  ? `మీ స్థానం గుర్తించబడింది: ${coords.lat.toFixed(4)}° N, ${coords.lng.toFixed(4)}° E`
                  : lang === 'hi'
                  ? `स्थान पता चला: ${coords.lat.toFixed(4)}° N, ${coords.lng.toFixed(4)}° E`
                  : `Current Position Detected: ${coords.lat.toFixed(4)}° N, ${coords.lng.toFixed(4)}° E`}
              </span>
            </div>
            <span className="text-leaf-600">
              {lang === 'te'
                ? 'ఖచ్చితమైన దూరం & సమీప కేంద్రాల సిఫార్సులు చూపిస్తోంది'
                : lang === 'hi'
                ? 'सटीक दूरी और निकटतम केंद्रों के सुझाव दिखाए जा रहे हैं'
                : 'Showing exact distance & nearest center recommendations'}
            </span>
          </div>
        )}

        {locError && (
          <p className="mt-2 text-xs font-medium text-amber-700">{locError}</p>
        )}
      </Reveal>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {/* Map Canvas */}
        <Reveal className="lg:col-span-2">
          <div className="relative overflow-hidden rounded-5xl bg-gradient-to-br from-forest-50 to-cream-100 shadow-glass">
            <div className="relative h-[420px] sm:h-[520px]">
              <div className="absolute inset-0 bg-grid opacity-60" />
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path
                  d="M10,20 Q30,10 50,18 Q75,12 90,30 Q85,55 70,70 Q50,90 30,80 Q12,70 10,45 Z"
                  fill="rgba(34,197,94,0.08)"
                  stroke="rgba(34,197,94,0.2)"
                  strokeWidth="0.3"
                />
                <path
                  d="M20,35 Q40,30 55,40 Q70,50 60,65 Q45,75 30,65 Q18,55 20,35 Z"
                  fill="rgba(251,191,36,0.06)"
                  stroke="rgba(251,191,36,0.15)"
                  strokeWidth="0.3"
                />
              </svg>

              {/* User location pin on map if active */}
              {coords && (
                <div
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                  style={{ left: '48%', top: '56%' }}
                >
                  <div className="relative grid place-items-center">
                    <span className="absolute h-12 w-12 rounded-full bg-blue-500 opacity-40 animate-ping" />
                    <span className="relative grid h-8 w-8 place-items-center rounded-full bg-blue-600 text-white shadow-glow ring-4 ring-white">
                      <Navigation className="h-4 w-4 fill-white" />
                    </span>
                    <span className="mt-1 whitespace-nowrap rounded-full bg-blue-900 px-2 py-0.5 text-[10px] font-bold text-white shadow">
                      📍 {lang === 'te' ? 'మీరు ఇక్కడ ఉన్నారు' : 'You Are Here'}
                    </span>
                  </div>
                </div>
              )}

              {centers.map((c) => (
                <MapMarker
                  key={c.id}
                  center={c}
                  active={selected?.id === c.id}
                  distanceKm={centerDistances[c.id]}
                  onClick={() => setSelected(c)}
                />
              ))}

              <div className="absolute bottom-4 left-4 rounded-2xl glass p-3">
                <p className="mb-1.5 text-[11px] font-bold text-forest-700">{lang === 'te' ? 'రద్దీ స్థాయి' : 'Crowd Level'}</p>
                <div className="space-y-1">
                  {(['low', 'moderate', 'high'] as CrowdLevel[]).map((c) => (
                    <div key={c} className="flex items-center gap-1.5 text-xs">
                      <span className={`h-2.5 w-2.5 rounded-full ${CROWD_STYLES[c].dot}`} />
                      <span className="text-forest-600">
                        {c === 'low' ? t('low_crowd') : c === 'moderate' ? t('mod_crowd') : t('high_crowd')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Center Detail & Navigation Action Card */}
        <Reveal delay={120}>
          {selected && (
            <div className="rounded-5xl glass p-6">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-2xl">🌾</span>
                  <h3 className="mt-1 font-display text-xl font-bold text-forest-900">
                    {selected.name}
                  </h3>
                  <p className="text-sm text-forest-500">{selected.district} {lang === 'te' ? 'జిల్లా' : 'District'}</p>
                </div>
                {selected.bestChoice && (
                  <span className="chip bg-gold-100 text-gold-700">
                    <Star className="h-3.5 w-3.5 fill-gold-400 text-gold-400" /> {t('best_choice')}
                  </span>
                )}
              </div>

              {/* Distance badge if location exists */}
              {selectedDistance != null && (
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold text-blue-800">
                  <Compass className="h-4 w-4 text-blue-600" />
                  <span>{lang === 'te' ? `మీ నుండి దూరం: ${selectedDistance} కి.మీ` : `Distance from you: ${selectedDistance} km`}</span>
                </div>
              )}

              <div className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 ${CROWD_STYLES[selected.crowd].bg} ${CROWD_STYLES[selected.crowd].text}`}>
                <span className={`h-2.5 w-2.5 rounded-full ${CROWD_STYLES[selected.crowd].dot}`} />
                <span className="text-sm font-semibold">
                  {selected.crowd === 'low' ? t('low_crowd') : selected.crowd === 'moderate' ? t('mod_crowd') : t('high_crowd')}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between rounded-2xl bg-forest-50 px-4 py-3">
                  <span className="flex items-center gap-2 text-sm text-forest-600">
                    <Users className="h-4 w-4" /> {t('farmers_waiting')}
                  </span>
                  <span className="font-display text-lg font-bold text-forest-900">
                    {selected.farmersWaiting}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-forest-50 px-4 py-3">
                  <span className="flex items-center gap-2 text-sm text-forest-600">
                    <Clock className="h-4 w-4" /> {t('avg_wait')}
                  </span>
                  <span className="font-display text-lg font-bold text-forest-900">
                    {selected.avgWaitMin} {t('minutes')}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-forest-50 px-4 py-3">
                  <span className="flex items-center gap-2 text-sm text-forest-600">
                    <TrendingUp className="h-4 w-4" /> {t('capacity')}
                  </span>
                  <span className="font-display text-lg font-bold text-forest-900">
                    {selected.capacityPct}%
                  </span>
                </div>
              </div>

              {/* Navigation Action Buttons */}
              <div className="mt-5 space-y-2">
                <button
                  onClick={() => setShowNavModal(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-forest-900 px-5 py-3 text-sm font-bold text-white shadow transition hover:bg-forest-800"
                >
                  <Navigation className="h-4 w-4 text-leaf-400 fill-leaf-400" />
                  🧭 {lang === 'te' ? 'లైవ్ నావిగేషన్ పొందండి' : 'Get Turn-by-Turn Navigation'}
                </button>

                <button
                  onClick={() => setView('token')}
                  className="btn-primary w-full"
                >
                  {t('book_slot_btn')} <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </Reveal>
      </div>

      {/* Center List */}
      <Reveal>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {centers.map((c) => {
            const s = CROWD_STYLES[c.crowd];
            const dist = centerDistances[c.id];
            return (
              <button
                key={c.id}
                onClick={() => setSelected(c)}
                className={`rounded-3xl p-4 text-left transition-all ${
                  selected?.id === c.id
                    ? 'glass shadow-glass ring-2 ring-leaf-300'
                    : 'glass hover:shadow-glass'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${s.dot}`} />
                    <span className="text-sm font-bold text-forest-900">{c.name.replace(' Center', '').replace(' కొనుగోలు కేంద్రం', '')}</span>
                  </div>
                  {dist != null && (
                    <span className="text-[11px] font-bold text-blue-700">{dist} km</span>
                  )}
                </div>
                <p className="mt-1 text-xs text-forest-500">
                  {c.farmersWaiting} {lang === 'te' ? 'రైతులు వేచి ఉన్నారు' : 'waiting'} • {c.avgWaitMin} {t('minutes')}
                </p>
              </button>
            );
          })}
        </div>
      </Reveal>

      {/* Navigation Modal */}
      {showNavModal && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-5xl glass p-6 shadow-glass-lg animate-scale-in">
            <div className="flex items-start justify-between border-b border-forest-100 pb-4">
              <div>
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-leaf-600">
                  <Compass className="h-4 w-4" /> {lang === 'te' ? 'లైవ్ దారి మార్గదర్శి' : 'Live Route Guidance'}
                </span>
                <h3 className="mt-1 font-display text-xl font-extrabold text-forest-900">
                  {lang === 'te' ? `${selected.name} కు దారి` : `Navigation to ${selected.name}`}
                </h3>
              </div>
              <button
                onClick={() => setShowNavModal(false)}
                className="grid h-8 w-8 place-items-center rounded-xl bg-forest-100 text-forest-700 hover:bg-forest-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="my-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-cream-100 p-3">
                  <p className="text-xs text-forest-500">{lang === 'te' ? 'అంచనా దూరం' : 'Estimated Distance'}</p>
                  <p className="font-display text-lg font-bold text-forest-900">
                    {selectedDistance ?? '14.8'} km
                  </p>
                </div>
                <div className="rounded-2xl bg-cream-100 p-3">
                  <p className="text-xs text-forest-500">{lang === 'te' ? 'వాహనం ప్రయాణ సమయం' : 'Tractor/Truck Time'}</p>
                  <p className="font-display text-lg font-bold text-forest-900">
                    ~{Math.round((selectedDistance ?? 15) * 2.2)} {t('minutes')}
                  </p>
                </div>
              </div>

              {/* Route directions */}
              <div className="rounded-3xl border border-forest-100 bg-white p-4 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-forest-400">
                  {lang === 'te' ? 'దశల వారీ మార్గదర్శకాలు' : 'Step-by-Step Directions'}
                </p>
                
                <div className="flex items-start gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-leaf-100 text-xs font-bold text-leaf-700">1</span>
                  <div>
                    <p className="text-sm font-semibold text-forest-800">
                      {lang === 'te' ? 'మీ స్థానం నుండి బయలుదేరండి' : 'Start from your current farm / location'}
                    </p>
                    <p className="text-xs text-forest-500">
                      {lang === 'te' ? 'సమీపంలోని జిల్లా రహదారి వైపు వెళ్లండి' : 'Head towards nearest District Highway'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-leaf-100 text-xs font-bold text-leaf-700">2</span>
                  <div>
                    <p className="text-sm font-semibold text-forest-800">
                      {lang === 'te' ? `${selected.district} వైపు జాతీయ/రాష్ట్ర రహదారి తీసుకోండి` : `Take NH-16 / State Highway to ${selected.district}`}
                    </p>
                    <p className="text-xs text-forest-500">
                      {lang === 'te' ? 'రైతుల సరుకు వాహనాల ప్రత్యేక వరుసలో ప్రయాణించండి' : 'Follow designated heavy vehicle procurement lane'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-leaf-100 text-xs font-bold text-leaf-700">3</span>
                  <div>
                    <p className="text-sm font-semibold text-forest-800">
                      {lang === 'te' ? `${selected.name} గేట్ 2 వద్దకు చేరుకోండి` : `Arrive at ${selected.name} Gate 2`}
                    </p>
                    <p className="text-xs text-forest-500">
                      {lang === 'te' ? 'తక్షణ ప్రవేశం కోసం మీ టోకెన్ చూపించండి' : 'Show Token #A127 for quick entry'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 sm:flex-row">
              <button
                onClick={() => {
                  openGoogleMapsNavigation(
                    selected.name,
                    coords,
                    CENTER_COORDS[selected.id]
                  );
                }}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-leaf-500 to-forest-600 px-5 py-3 text-sm font-bold text-white shadow-glow transition hover:from-leaf-600 hover:to-forest-700"
              >
                <ExternalLink className="h-4 w-4" /> {lang === 'te' ? 'గూగుల్ మ్యాప్స్‌లో తెరవండి' : 'Open Live in Google Maps'}
              </button>
              <button
                onClick={() => setShowNavModal(false)}
                className="rounded-2xl border border-forest-200 bg-white px-5 py-3 text-sm font-semibold text-forest-700 hover:bg-cream-50"
              >
                {lang === 'te' ? 'మూసివేయి' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

