import { useEffect, useState } from 'react';
import {
  Ticket,
  MapPin,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Wheat,
  Wallet,
  Bell,
  Star,
  TrendingDown,
} from 'lucide-react';
import { useApp, formatRupee } from '@/lib/app-context';
import { Reveal } from '@/components/Reveal';
import { FARMER, QUEUE, NOTIFICATIONS } from '@/lib/data';
import {
  useToken,
  useQueue,
  useNotifications,
  useAIRecommendation,
  type NotificationItem,
} from '@/lib/hooks';

function CircularProgress({ pct }: { pct: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const [offset, setOffset] = useState(c);
  useEffect(() => {
    const t = setTimeout(() => setOffset(c - (pct / 100) * c), 200);
    return () => clearTimeout(t);
  }, [c, pct]);
  return (
    <div className="relative h-32 w-32">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="url(#grad)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.22,1,0.36,1)' }}
        />
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="font-display text-2xl font-extrabold text-white">{pct}%</p>
          <p className="text-[10px] font-medium text-white/60">ON TRACK</p>
        </div>
      </div>
    </div>
  );
}

function QueueRow({
  token,
  status,
  isYou,
  index,
}: {
  token: string;
  status: string;
  isYou?: boolean;
  index: number;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition-all animate-slide-in-right ${
        isYou
          ? 'bg-gradient-to-r from-leaf-500 to-forest-600 text-white shadow-glow'
          : 'glass'
      }`}
      style={{ animationDelay: `${index * 120}ms` }}
    >
      <span className="text-xl">👨‍🌾</span>
      <span className={`font-display text-base font-bold ${isYou ? 'text-white' : 'text-forest-800'}`}>
        {token}
        {isYou && <span className="ml-2 text-xs">⭐ YOU</span>}
      </span>
      <span className="ml-auto flex items-center gap-1.5 text-sm font-medium">
        {status === 'processing' ? (
          <>
            <span className="h-2 w-2 animate-pulse rounded-full bg-leaf-400" />
            <span className={isYou ? 'text-white/90' : 'text-leaf-600'}>Processing</span>
          </>
        ) : (
          <>
            <Clock className={`h-3.5 w-3.5 ${isYou ? 'text-white/70' : 'text-forest-400'}`} />
            <span className={isYou ? 'text-white/90' : 'text-forest-500'}>Waiting</span>
          </>
        )}
      </span>
    </div>
  );
}

function NotificationCard({ n, index }: { n: NotificationItem; index: number }) {
  const emojis: Record<string, string> = {
    reminder: '🎟️',
    queue: '🚦',
    produce: '🌾',
    payment: '💰',
  };
  const colors: Record<string, string> = {
    reminder: 'from-leaf-500 to-forest-600',
    queue: 'from-gold-400 to-gold-500',
    produce: 'from-leaf-400 to-leaf-600',
    payment: 'from-forest-600 to-forest-800',
  };
  return (
    <div
      className="flex items-start gap-3 rounded-2xl glass p-3.5 animate-slide-in-right"
      style={{ animationDelay: `${index * 150}ms` }}
    >
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${colors[n.type] ?? 'from-leaf-500 to-forest-600'} text-lg`}>
        {emojis[n.type] ?? '🔔'}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-forest-800">{n.title}</p>
        <p className="text-xs text-forest-600">{n.body}</p>
      </div>
      <span className="shrink-0 text-[11px] font-medium text-forest-400">{n.display_time}</span>
    </div>
  );
}

export function DashboardView() {
  const { t, setView } = useApp();
  const [progress, setProgress] = useState(0);

  const { data: token } = useToken();
  const { data: queue } = useQueue();
  const { data: notifications } = useNotifications();
  const { data: aiRec } = useAIRecommendation();

  useEffect(() => {
    const timer = setTimeout(() => setProgress(75), 300);
    return () => clearTimeout(timer);
  }, []);

  const farmer = token
    ? {
        token: token.token_number,
        center: token.center_name,
        date: token.appointment_date,
        time: token.appointment_time,
        farmersAhead: token.queue_position - 1,
        estimatedWaitMin: 24,
        crop: token.crop,
        quantity: token.quantity_quintals,
        amount: token.quantity_quintals * 2310,
      }
    : FARMER;

  const liveQueue = queue && queue.length > 0
    ? queue.map((item) => ({ token: item.token_number, status: item.status, isYou: item.is_you, id: item.id }))
    : QUEUE.map((item, index) => ({ token: item.token, status: item.status, isYou: item.isYou ?? false, id: `fallback-${index}` }));
  const liveNotifs = notifications && notifications.length > 0
    ? notifications
    : NOTIFICATIONS.map((item) => ({ ...item, display_time: item.time }));

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-28 lg:px-8 lg:pb-12">
      {/* Greeting */}
      <Reveal>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-extrabold text-forest-900 sm:text-4xl">
              {t('namaste')} 👋
            </h1>
            <p className="mt-1 text-forest-600">{t('next_appt')}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="chip bg-leaf-100 text-leaf-700">
              <span className="h-2 w-2 animate-pulse rounded-full bg-leaf-500" /> Live
            </span>
          </div>
        </div>
      </Reveal>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {/* Smart Token Card */}
        <Reveal className="lg:col-span-2">
          <div className="relative overflow-hidden rounded-5xl bg-gradient-to-br from-forest-800 to-forest-900 p-6 text-white shadow-glass-lg sm:p-8">
            <div className="absolute inset-0 bg-mesh-forest opacity-40" />
            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-leaf-300" />
                  <span className="text-xs font-semibold tracking-wider text-leaf-200">
                    YOUR TOKEN
                  </span>
                </div>
                <p className="mt-2 font-display text-6xl font-extrabold tracking-tight">
                  {farmer.token}
                </p>
                <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-leaf-300" />
                    <span className="text-white/70">Center:</span>
                    <span className="font-semibold">{farmer.center}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-leaf-300" />
                    <span className="font-semibold">{farmer.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-leaf-300" />
                    <span className="font-semibold">{farmer.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-leaf-300" />
                    <span className="text-white/70">Ahead:</span>
                    <span className="font-semibold">{farmer.farmersAhead} farmers</span>
                  </div>
                </div>
                <div className="mt-5 flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
                  <Clock className="h-5 w-5 text-gold-300" />
                  <span className="text-sm text-white/70">Estimated Waiting:</span>
                  <span className="font-display text-lg font-bold text-gold-300">
                    {farmer.estimatedWaitMin} min
                  </span>
                  <span className="ml-auto flex items-center gap-1.5 chip bg-leaf-500/30 text-leaf-200">
                    <CheckCircle2 className="h-3.5 w-3.5" /> ON TRACK
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-center gap-3">
                <CircularProgress pct={progress} />
                <button
                  onClick={() => setView('token')}
                  className="btn-gold text-sm"
                >
                  View Token <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </Reveal>

        {/* AI Slot Recommendation */}
        <Reveal delay={120}>
          <div className="h-full rounded-5xl glass p-6 card-hover">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-gold-400 to-gold-500 text-white">
                <Sparkles className="h-4.5 w-4.5" />
              </span>
              <h3 className="font-display text-lg font-bold text-forest-900">
                {t('ai_rec_title')}
              </h3>
            </div>
            <p className="mt-3 text-sm text-forest-600">{t('ai_rec_msg')}</p>

            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-forest-100 bg-cream-50 p-3.5">
                <p className="text-xs font-medium text-forest-500">Your selected slot</p>
                <p className="mt-0.5 font-display text-xl font-bold text-forest-700">
                  {aiRec?.selected_slot ?? '11:30 AM'}
                </p>
                <p className="text-xs text-forest-400">
                  {aiRec?.selected_wait_min ?? 61} min waiting
                </p>
              </div>
              <div className="rounded-2xl border-2 border-leaf-300 bg-leaf-50 p-3.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-leaf-700">Recommended slot</p>
                  <Star className="h-4 w-4 fill-gold-400 text-gold-400" />
                </div>
                <p className="mt-0.5 font-display text-xl font-bold text-leaf-700">
                  {aiRec?.recommended_slot ?? '10:30 AM'}
                </p>
                <p className="text-xs text-leaf-600">
                  {aiRec?.recommended_wait_min ?? 24} min waiting
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-gradient-to-r from-leaf-500 to-forest-600 px-4 py-3 text-white">
              <TrendingDown className="h-5 w-5 text-gold-300" />
              <span className="text-sm text-white/80">Time saved:</span>
              <span className="font-display text-lg font-bold text-gold-300">
                {aiRec?.time_saved_min ?? 37} min
              </span>
            </div>

            <button
              onClick={() => setView('token')}
              className="btn-primary mt-4 w-full text-sm"
            >
              {t('book_rec')} <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </Reveal>
      </div>

      {/* Live Queue + Notifications */}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Reveal>
          <div className="rounded-5xl glass p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-bold text-forest-900">
                {t('live_queue')}
              </h3>
              <span className="flex items-center gap-1.5 chip bg-red-100 text-red-600">
                <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" /> {t('live_now')}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-2xl bg-forest-50 px-4 py-3">
              <div>
                <p className="text-xs text-forest-500">Current Token</p>
                <p className="font-display text-lg font-bold text-forest-800">
                  {liveQueue[0]?.token ?? 'A124'}
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-forest-300" />
              <div className="text-right">
                <p className="text-xs text-forest-500">Your Token</p>
                <p className="font-display text-lg font-bold text-leaf-600">{farmer.token}</p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {liveQueue.map((q, i) => (
                <QueueRow
                  key={q.id}
                  token={q.token}
                  status={q.status}
                  isYou={q.isYou}
                  index={i}
                />
              ))}
            </div>

            <div className="mt-4 rounded-2xl bg-gradient-to-r from-leaf-500 to-forest-600 px-4 py-3 text-center text-white">
              <p className="font-display text-base font-bold">{t('almost_there')}</p>
              <p className="text-sm text-white/80">
                {t('est_turn')}: {farmer.estimatedWaitMin} {t('minutes')}
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="rounded-5xl glass p-6">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-leaf-600" />
              <h3 className="font-display text-xl font-bold text-forest-900">Notifications</h3>
            </div>
            <div className="mt-4 space-y-2.5">
              {liveNotifs.map((n, i) => (
                <NotificationCard key={n.id} n={n} index={i} />
              ))}
            </div>
          </div>
        </Reveal>
      </div>

      {/* Quick actions */}
      <Reveal>
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { icon: Wheat, label: 'My Produce', value: `${farmer.quantity} Quintals`, view: 'dashboard' as const },
            { icon: Wallet, label: 'Payment', value: formatRupee(farmer.amount), view: 'payment' as const },
            { icon: MapPin, label: 'Centers', value: '8 Nearby', view: 'map' as const },
            { icon: Ticket, label: 'Token', value: farmer.token, view: 'token' as const },
          ].map((a) => {
            const Icon = a.icon;
            return (
              <button
                key={a.label}
                onClick={() => setView(a.view)}
                className="group rounded-4xl glass p-5 text-left card-hover"
              >
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-leaf-100 to-cream-200 text-leaf-600 transition-transform group-hover:scale-110">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-3 text-xs font-medium text-forest-500">{a.label}</p>
                <p className="font-display text-lg font-bold text-forest-900">{a.value}</p>
              </button>
            );
          })}
        </div>
      </Reveal>

      {/* Experience Score */}
      <Reveal>
        <div className="mt-5 rounded-5xl glass p-6 text-center">
          <h3 className="font-display text-xl font-bold text-forest-900">
            {t('experience_q')}
          </h3>
          <p className="mt-1 text-sm text-forest-600">{t('experience_sub')}</p>
          <div className="mt-4 flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                className="group rounded-2xl p-1.5 transition hover:scale-125"
              >
                <Star className="h-9 w-9 text-gold-300 transition group-hover:fill-gold-400 group-hover:text-gold-400" />
              </button>
            ))}
          </div>
        </div>
      </Reveal>
    </div>
  );
}
