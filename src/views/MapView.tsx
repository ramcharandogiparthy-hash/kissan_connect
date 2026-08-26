import { useState } from 'react';
import {
  MapPin,
  Users,
  Clock,
  Star,
  ArrowRight,
  Store,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { Reveal } from '@/components/Reveal';
import { CENTERS, type CrowdLevel } from '@/lib/data';
import { useCenters, type ProcurementCenter as DBProcurementCenter } from '@/lib/hooks';

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
}: {
  center: Center;
  onClick: () => void;
  active: boolean;
}) {
  const s = CROWD_STYLES[center.crowd];
  return (
    <button
      onClick={onClick}
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${center.x}%`, top: `${center.y}%` }}
    >
      <span className="relative grid place-items-center">
        {active && (
          <span className={`absolute h-10 w-10 rounded-full ${s.dot} opacity-30 animate-pulse-ring`} />
        )}
        <span
          className={`relative grid h-7 w-7 place-items-center rounded-full ${s.dot} text-white shadow-lg transition-transform hover:scale-125 ${
            active ? 'ring-4 ring-white' : ''
          }`}
        >
          <Store className="h-3.5 w-3.5" />
        </span>
      </span>
    </button>
  );
}

export function MapView() {
  const { t, setView } = useApp();
  const { data: dbCenters } = useCenters();

  const centers: Center[] = dbCenters && dbCenters.length > 0
    ? dbCenters.map(mapCenter)
    : CENTERS.map((center) => ({
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

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-28 lg:px-8 lg:pb-12">
      <Reveal>
        <span className="section-eyebrow">
          <MapPin className="h-3.5 w-3.5" /> {t('map_title')}
        </span>
        <h1 className="mt-3 display-heading text-3xl sm:text-4xl">{t('map_sub')}</h1>
      </Reveal>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {/* Map */}
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

              {centers.map((c) => (
                <MapMarker
                  key={c.id}
                  center={c}
                  active={selected?.id === c.id}
                  onClick={() => setSelected(c)}
                />
              ))}

              <div className="absolute bottom-4 left-4 rounded-2xl glass p-3">
                <p className="mb-1.5 text-[11px] font-bold text-forest-700">Crowd Level</p>
                <div className="space-y-1">
                  {(['low', 'moderate', 'high'] as CrowdLevel[]).map((c) => (
                    <div key={c} className="flex items-center gap-1.5 text-xs">
                      <span className={`h-2.5 w-2.5 rounded-full ${CROWD_STYLES[c].dot}`} />
                      <span className="text-forest-600">{CROWD_STYLES[c].label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Center detail card */}
        <Reveal delay={120}>
          {selected && (
            <div className="rounded-5xl glass p-6">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-2xl">🌾</span>
                  <h3 className="mt-1 font-display text-xl font-bold text-forest-900">
                    {selected.name}
                  </h3>
                  <p className="text-sm text-forest-500">{selected.district} District</p>
                </div>
                {selected.bestChoice && (
                  <span className="chip bg-gold-100 text-gold-700">
                    <Star className="h-3.5 w-3.5 fill-gold-400 text-gold-400" /> Best
                  </span>
                )}
              </div>

              <div className={`mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 ${CROWD_STYLES[selected.crowd].bg} ${CROWD_STYLES[selected.crowd].text}`}>
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
                    {selected.avgWaitMin} min
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

              <div className="mt-4">
                <div className="h-2.5 overflow-hidden rounded-full bg-forest-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-leaf-500 to-gold-400 transition-all duration-1000"
                    style={{ width: `${selected.capacityPct}%` }}
                  />
                </div>
              </div>

              {selected.bestChoice && (
                <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-leaf-600">
                  <Sparkles className="h-4 w-4" /> {t('best_choice')}
                </p>
              )}

              <button
                onClick={() => setView('token')}
                className="btn-primary mt-5 w-full"
              >
                {t('book_slot_btn')} <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </Reveal>
      </div>

      {/* Center list */}
      <Reveal>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {centers.map((c) => {
            const s = CROWD_STYLES[c.crowd];
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
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${s.dot}`} />
                  <span className="text-sm font-bold text-forest-900">{c.name.replace(' Center', '')}</span>
                </div>
                <p className="mt-1 text-xs text-forest-500">{c.farmersWaiting} waiting • {c.avgWaitMin} min</p>
              </button>
            );
          })}
        </div>
      </Reveal>
    </div>
  );
}
