import {
  Ticket,
  Clock,
  Wheat,
  Wallet,
  ShieldCheck,
  ArrowRight,
  Sprout,
  Brain,
  Sparkles,
  MapPin,
  Mic,
  Languages,
  Signal,
  Bell,
  ScanSearch,
  Store,
  Users,
  Star,
  PartyPopper,
  Check,
  Smartphone,
} from 'lucide-react';
import { useApp, useCountUp, formatCompact } from '@/lib/app-context';
import { Reveal } from '@/components/Reveal';
import {
  getJourneySteps,
  getWowFeatures,
  getStats,
  getDemoFlow,
} from '@/lib/data';
import { usePlatformStats } from '@/lib/hooks';

const HERO_IMG =
  'https://images.pexels.com/photos/20313641/pexels-photo-20313641.jpeg?auto=compress&cs=tinysrgb&w=1920';

const FIELD_IMG =
  'https://images.pexels.com/photos/13888402/pexels-photo-13888402.jpeg?auto=compress&cs=tinysrgb&w=1920';

const ICONS: Record<string, typeof Sprout> = {
  sprout: Sprout,
  wheat: Wheat,
  ticket: Ticket,
  mapPin: MapPin,
  scanSearch: ScanSearch,
  wallet: Wallet,
  brain: Brain,
  sparkles: Sparkles,
  mic: Mic,
  languages: Languages,
  signal: Signal,
  bell: Bell,
  shieldCheck: ShieldCheck,
  users: Users,
  store: Store,
  smartphone: Smartphone,
  check: Check,
  partyPopper: PartyPopper,
  star: Star,
};

function HeroCard({
  icon: Icon,
  label,
  value,
  accent,
  delay,
  className = '',
}: {
  icon: typeof Sprout;
  label: string;
  value: string;
  accent: string;
  delay: number;
  className?: string;
}) {
  return (
    <div
      className={`glass-dark rounded-2xl px-4 py-3 text-white animate-fade-up ${className}`}
      style={{ animationDelay: `${delay}ms`, opacity: 0 }}
    >
      <div className="flex items-center gap-2">
        <span className={`grid h-8 w-8 place-items-center rounded-lg ${accent}`}>
          <Icon className="h-4 w-4" />
        </span>
        <span className="text-[11px] font-medium text-white/70">{label}</span>
      </div>
      <p className="mt-1.5 font-display text-xl font-bold">{value}</p>
    </div>
  );
}

function StatCard({
  value,
  suffix,
  label,
  icon,
  format,
}: {
  value: number;
  suffix: string;
  label: string;
  icon: string;
  format?: 'compact' | 'rupee';
}) {
  const { value: counted, setEl } = useCountUp(value);
  const Icon = ICONS[icon] ?? Users;
  let display: string;
  if (format === 'compact') display = formatCompact(counted) + suffix;
  else if (format === 'rupee') display = '₹' + Math.round(counted) + suffix;
  else display = Math.round(counted).toLocaleString('en-IN') + suffix;

  return (
    <div
      ref={setEl}
      className="group relative overflow-hidden rounded-4xl glass p-6 text-center card-hover"
    >
      <span className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-leaf-500 to-forest-600 text-white shadow-glow transition-transform group-hover:scale-110">
        <Icon className="h-6 w-6" strokeWidth={2} />
      </span>
      <p className="font-display text-4xl font-extrabold gradient-text">{display}</p>
      <p className="mt-1 text-sm font-medium text-forest-600">{label}</p>
    </div>
  );
}

export function LandingView() {
  const { t, lang, setView } = useApp();
  const { data: stats } = usePlatformStats();

  const journeySteps = getJourneySteps(lang);
  const wowFeatures = getWowFeatures(lang);
  const demoFlow = getDemoFlow(lang);
  const fallbackStats = getStats(lang);

  const liveStats = stats
    ? [
        { value: stats.farmers_connected, suffix: '+', label: fallbackStats[0]?.label ?? 'Farmers Connected', icon: 'users' },
        { value: stats.procurement_centers, suffix: '+', label: fallbackStats[1]?.label ?? 'Procurement Centers', icon: 'store' },
        { value: stats.quintals_procured, suffix: '+', label: fallbackStats[2]?.label ?? 'Quintals Procured', icon: 'wheat', format: 'compact' as const },
        { value: stats.payments_processed_cr, suffix: lang === 'te' ? 'కోట్లు+' : 'Cr+', label: fallbackStats[3]?.label ?? 'Payments Processed', icon: 'wallet', format: 'rupee' as const },
      ]
    : fallbackStats;

  return (
    <div className="overflow-hidden">
      {/* ===== HERO ===== */}
      <section className="relative min-h-screen">
        <div className="absolute inset-0">
          <img src={HERO_IMG} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-hero-overlay" />
          <div className="absolute inset-0 bg-gradient-to-t from-cream-50 via-transparent to-transparent" />
        </div>

        <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-5 pb-20 pt-28 lg:px-8">
          <div className="max-w-3xl">
            <span className="chip bg-white/15 text-leaf-200 backdrop-blur animate-fade-up" style={{ opacity: 0 }}>
              <Sparkles className="h-3.5 w-3.5" /> {lang === 'te' ? 'AI-ఆధారిత వ్యవసాయ కొనుగోలు ప్లాట్‌ఫారమ్' : 'AI-Powered Agricultural Procurement'}
            </span>
            <h1
              className="mt-5 font-display text-4xl font-extrabold leading-[1.1] text-white text-balance sm:text-5xl lg:text-6xl animate-fade-up"
              style={{ animationDelay: '100ms', opacity: 0 }}
            >
              {t('hero_title')}
            </h1>
            <p
              className="mt-5 max-w-2xl text-lg leading-relaxed text-white/80 animate-fade-up"
              style={{ animationDelay: '200ms', opacity: 0 }}
            >
              {t('hero_sub')}
            </p>
            <div
              className="mt-7 flex flex-wrap items-center gap-3 animate-fade-up"
              style={{ animationDelay: '300ms', opacity: 0 }}
            >
              <button
                onClick={() => setView('dashboard')}
                className="btn-primary text-base"
              >
                {t('book_slot')} <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => setView('map')}
                className="btn-ghost text-base text-white border-white/30 bg-white/10"
              >
                {t('track_produce')}
              </button>
            </div>
            <p
              className="mt-5 flex items-center gap-2 text-sm font-medium text-white/70 animate-fade-up"
              style={{ animationDelay: '400ms', opacity: 0 }}
            >
              <ShieldCheck className="h-4 w-4 text-leaf-300" /> {t('secure_tag')}
            </p>
          </div>

          {/* Floating glass cards */}
          <div className="mt-12 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="animate-float">
              <HeroCard icon={Ticket} label={lang === 'te' ? 'టోకెన్' : 'Token'} value="#A127" accent="bg-leaf-500/30" delay={500} />
            </div>
            <div className="animate-float-slow">
              <HeroCard icon={Clock} label={lang === 'te' ? 'వేచియుండే సమయం' : 'Waiting'} value={`24 ${t('minutes')}`} accent="bg-gold-400/30" delay={600} />
            </div>
            <div className="animate-float">
              <HeroCard icon={Wheat} label={lang === 'te' ? 'పంట' : 'Produce'} value={`40 ${lang === 'te' ? 'క్విం' : 'Q'}`} accent="bg-leaf-500/30" delay={700} />
            </div>
            <div className="animate-float-slow">
              <HeroCard icon={Wallet} label={lang === 'te' ? 'చెల్లింపు' : 'Payment'} value="₹92,400" accent="bg-gold-400/30" delay={800} />
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="relative py-24">
        <div className="absolute inset-0 bg-mesh-forest" />
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
          <Reveal className="text-center">
            <span className="section-eyebrow">
              <Sprout className="h-3.5 w-3.5" /> {t('how_title')}
            </span>
            <h2 className="mt-4 display-heading text-3xl sm:text-4xl lg:text-5xl">
              {t('how_sub')}
            </h2>
          </Reveal>

          <div className="mt-14 flex gap-4 overflow-x-auto pb-4 scrollbar-hide lg:grid lg:grid-cols-6 lg:gap-4 lg:overflow-visible">
            {journeySteps.map((step, i) => {
              const Icon = ICONS[step.icon] ?? Sprout;
              return (
                <Reveal
                  key={step.n}
                  delay={i * 120}
                  className="group relative flex min-w-[220px] flex-col items-center text-center lg:min-w-0"
                >
                  <div className="relative grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-leaf-500 to-forest-600 text-white shadow-glow transition-transform group-hover:scale-110 group-hover:rotate-3">
                    <Icon className="h-8 w-8" strokeWidth={1.8} />
                    <span className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full bg-gold-400 text-xs font-extrabold text-forest-900 shadow">
                      {step.n}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold text-forest-900">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm text-forest-600">{step.desc}</p>
                  {i < journeySteps.length - 1 && (
                    <span className="absolute -right-2 top-10 hidden text-leaf-400 lg:block">
                      <ArrowRight className="h-5 w-5" />
                    </span>
                  )}
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="relative py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <Reveal className="text-center">
            <span className="section-eyebrow">
              <Users className="h-3.5 w-3.5" /> {t('stats_title')}
            </span>
            <h2 className="mt-4 display-heading text-3xl sm:text-4xl lg:text-5xl">
              {t('stats_heading')}
            </h2>
          </Reveal>
          <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {liveStats.map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="relative py-24">
        <div className="absolute inset-0">
          <img src={FIELD_IMG} alt="" className="h-full w-full object-cover opacity-10" />
        </div>
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
          <Reveal className="text-center">
            <span className="section-eyebrow">
              <Brain className="h-3.5 w-3.5" /> {t('features_title')}
            </span>
            <h2 className="mt-4 display-heading text-3xl sm:text-4xl lg:text-5xl">
              {t('features_sub')}
            </h2>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {wowFeatures.map((f, i) => {
              const Icon = ICONS[f.icon] ?? Sparkles;
              return (
                <Reveal key={f.title} delay={i * 80}>
                  <div className="group h-full rounded-4xl glass p-5 card-hover">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-leaf-100 to-cream-200 text-leaf-600 transition-transform group-hover:scale-110">
                      <Icon className="h-5 w-5" strokeWidth={2} />
                    </span>
                    <h3 className="mt-4 font-display text-base font-bold text-forest-900">
                      {f.title}
                    </h3>
                    <p className="mt-1 text-sm text-forest-600">{f.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== CINEMATIC DEMO FLOW ===== */}
      <section className="relative py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <Reveal className="text-center">
            <span className="section-eyebrow">
              <Smartphone className="h-3.5 w-3.5" /> {t('cinematic_title')}
            </span>
            <h2 className="mt-4 display-heading text-3xl sm:text-4xl lg:text-5xl">
              {t('cinematic_sub')}
            </h2>
          </Reveal>

          <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {demoFlow.map((step, i) => {
              const Icon = ICONS[step.icon] ?? Sprout;
              const isLast = i === demoFlow.length - 1;
              return (
                <Reveal
                  key={i}
                  delay={i * 60}
                  className={`flex flex-col items-center gap-2 rounded-3xl p-4 text-center ${
                    isLast
                      ? 'bg-gradient-to-br from-leaf-500 to-forest-600 text-white shadow-glow'
                      : 'glass'
                  }`}
                >
                  <span
                    className={`grid h-12 w-12 place-items-center rounded-2xl ${
                      isLast
                        ? 'bg-white/20'
                        : 'bg-gradient-to-br from-leaf-100 to-cream-200 text-leaf-600'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span
                    className={`text-xs font-semibold leading-tight ${
                      isLast ? 'text-white' : 'text-forest-700'
                    }`}
                  >
                    {step.text}
                  </span>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="relative py-24">
        <div className="mx-auto max-w-5xl px-5 lg:px-8">
          <Reveal>
            <div className="relative overflow-hidden rounded-5xl bg-gradient-to-br from-forest-800 to-forest-900 p-10 text-center text-white shadow-glass-lg sm:p-16">
              <div className="absolute inset-0 bg-mesh-forest opacity-50" />
              <div className="relative">
                <span className="grid mx-auto h-16 w-16 place-items-center rounded-3xl bg-white/10 backdrop-blur">
                  <Sprout className="h-8 w-8 text-leaf-300" strokeWidth={1.8} />
                </span>
                <h2 className="mt-6 font-display text-3xl font-extrabold sm:text-4xl">
                  {t('footer_tag')}
                </h2>
                <p className="mt-3 text-lg text-white/70">
                  {t('cta_sub')}
                </p>
                <button
                  onClick={() => setView('dashboard')}
                  className="btn-gold mt-7 text-base"
                >
                  {t('book_slot')} <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

