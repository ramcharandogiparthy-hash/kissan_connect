import { useEffect, useState } from 'react';
import {
  Wallet,
  CheckCircle2,
  FileText,
  Download,
  Wheat,
  ShieldCheck,
  ArrowRight,
  PartyPopper,
  Sprout,
} from 'lucide-react';
import { useApp, formatRupee } from '@/lib/app-context';
import { Reveal } from '@/components/Reveal';
import { FARMER, PAYMENT_TIMELINE } from '@/lib/data';
import { usePayment } from '@/lib/hooks';

const TIMELINE_ICONS: Record<string, typeof Wallet> = {
  wheat: Wheat,
  check: CheckCircle2,
  file: FileText,
  wallet: Wallet,
};

export function PaymentView() {
  const { t } = useApp();
  const { data: payment } = usePayment();
  const [revealedSteps, setRevealedSteps] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    PAYMENT_TIMELINE.forEach((_, i) => {
      timers.push(setTimeout(() => setRevealedSteps(i + 1), (i + 1) * 500));
    });
    timers.push(setTimeout(() => setShowSuccess(true), PAYMENT_TIMELINE.length * 500 + 400));
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-5 pb-24 pt-28 lg:px-8 lg:pb-12">
      <Reveal>
        <span className="section-eyebrow">
          <Wallet className="h-3.5 w-3.5" /> {t('payment_title')}
        </span>
        <h1 className="mt-3 display-heading text-3xl sm:text-4xl">Transparent. Fast. Fair.</h1>
      </Reveal>

      {/* Payment amount card */}
      <Reveal delay={100}>
        <div className="mt-8 overflow-hidden rounded-5xl bg-gradient-to-br from-forest-800 to-forest-900 p-8 text-center text-white shadow-glass-lg">
          <div className="absolute inset-0 bg-mesh-forest opacity-30" />
          <div className="relative">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-white/10 backdrop-blur">
              <Wallet className="h-8 w-8 text-leaf-300" />
            </span>
            <p className="mt-4 text-sm font-medium text-white/60">Payment Amount</p>
            <p className="mt-1 font-display text-5xl font-extrabold sm:text-6xl">
              {formatRupee(payment?.amount ?? FARMER.amount)}
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-leaf-500/20 px-4 py-2">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-leaf-400" />
              <span className="text-sm font-semibold text-leaf-200">{t('payment_status')}</span>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Timeline */}
      <Reveal delay={200}>
        <div className="mt-6 rounded-5xl glass p-6 sm:p-8">
          <h3 className="font-display text-lg font-bold text-forest-900">Payment Timeline</h3>
          <div className="mt-5 space-y-1">
            {PAYMENT_TIMELINE.map((step, i) => {
              const Icon = TIMELINE_ICONS[step.icon] ?? CheckCircle2;
              const revealed = i < revealedSteps;
              return (
                <div key={i} className="flex items-center gap-4">
                  <div className="flex flex-col items-center">
                    <span
                      className={`grid h-11 w-11 place-items-center rounded-2xl transition-all duration-500 ${
                        revealed
                          ? 'bg-gradient-to-br from-leaf-500 to-forest-600 text-white shadow-glow scale-100'
                          : 'bg-forest-50 text-forest-300 scale-90'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    {i < PAYMENT_TIMELINE.length - 1 && (
                      <span
                        className={`h-8 w-0.5 rounded-full transition-all duration-500 ${
                          revealed ? 'bg-leaf-400' : 'bg-forest-100'
                        }`}
                      />
                    )}
                  </div>
                  <div className={`pb-2 transition-all duration-500 ${revealed ? 'opacity-100' : 'opacity-30'}`}>
                    <p className="font-semibold text-forest-800">{step.label}</p>
                    {revealed && (
                      <p className="flex items-center gap-1 text-xs text-leaf-600">
                        <CheckCircle2 className="h-3 w-3" /> Completed
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Reveal>

      {/* Transaction details */}
      <Reveal delay={300}>
        <div className="mt-5 rounded-5xl glass p-6">
          <h3 className="font-display text-lg font-bold text-forest-900">Transaction Details</h3>
          <div className="mt-4 space-y-3">
            {[
              { label: 'Transaction ID', value: payment?.transaction_id ?? 'KC2026TX08274592' },
              { label: 'Farmer', value: payment?.farmer_name ?? FARMER.name },
              { label: 'Crop', value: `${payment?.crop ?? FARMER.crop} • ${payment?.quantity_quintals ?? FARMER.quantity} Quintals` },
              { label: 'Center', value: payment?.center_name ?? FARMER.center },
              { label: 'Rate', value: `₹${(payment?.rate_per_quintal ?? 2310).toLocaleString('en-IN')} per Quintal` },
              { label: 'Bank', value: `XXXX XXXX ${payment?.bank_last4 ?? '4521'}` },
            ].map((d) => (
              <div key={d.label} className="flex items-center justify-between border-b border-forest-50 pb-2.5">
                <span className="text-sm text-forest-500">{d.label}</span>
                <span className="font-semibold text-forest-800">{d.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 flex gap-2">
            <button className="btn-primary flex-1 text-sm">
              <Download className="h-4 w-4" /> {t('receipt')}
            </button>
            <button className="btn-ghost text-sm">
              <FileText className="h-4 w-4" /> Share
            </button>
          </div>
        </div>
      </Reveal>

      {/* Success animation */}
      {showSuccess && (
        <Reveal>
          <div className="mt-6 overflow-hidden rounded-5xl bg-gradient-to-br from-leaf-500 to-forest-600 p-8 text-center text-white shadow-glow animate-scale-in">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-white/20 backdrop-blur animate-bounce-soft">
              <PartyPopper className="h-8 w-8" />
            </span>
            <h2 className="mt-4 font-display text-2xl font-extrabold">
              Harvest Successfully Delivered!
            </h2>
            <p className="mt-2 text-white/80">Thank you for choosing KisanConnect.</p>
            <p className="mt-4 flex items-center justify-center gap-2 text-sm text-leaf-200">
              <Sprout className="h-4 w-4" /> Technology that respects the farmer's time.
            </p>
          </div>
        </Reveal>
      )}

      {/* Security note */}
      <div className="mt-5 flex items-center gap-2 text-xs text-forest-500">
        <ShieldCheck className="h-4 w-4 text-leaf-600" />
        Secured by bank-grade encryption. Your payment is protected.
      </div>
    </div>
  );
}
