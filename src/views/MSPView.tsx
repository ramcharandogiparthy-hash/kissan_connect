import { useState } from 'react';
import {
  IndianRupee,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Wheat,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Search,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { Reveal } from '@/components/Reveal';
import { MSP_FALLBACK } from '@/lib/data';
import { useMSPPrices, type MSPPrice } from '@/lib/hooks';

function formatPrice(n: number): string {
  return '₹' + n.toLocaleString('en-IN');
}

function MSPCard({ msp, index }: { msp: MSPPrice; index: number }) {
  const marketPrice = msp.market_price_per_quintal ?? msp.msp_per_quintal;
  const diff = marketPrice - msp.msp_per_quintal;
  const isAbove = diff >= 0;
  const diffPct = msp.msp_per_quintal > 0 ? (diff / msp.msp_per_quintal) * 100 : 0;

  return (
    <div
      className="group relative overflow-hidden rounded-4xl glass p-5 card-hover animate-fade-up"
      style={{ animationDelay: `${index * 80}ms`, opacity: 0 }}
    >
      {/* Crop header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-leaf-100 to-cream-200 text-leaf-600 transition-transform group-hover:scale-110">
            <Wheat className="h-5 w-5" strokeWidth={2} />
          </span>
          <div>
            <h3 className="font-display text-lg font-bold text-forest-900">{msp.crop}</h3>
            <p className="text-xs text-forest-500">{msp.variety} • {msp.season}</p>
          </div>
        </div>
        <span
          className={`chip ${
            msp.change_pct >= 0
              ? 'bg-leaf-100 text-leaf-700'
              : 'bg-red-100 text-red-600'
          }`}
        >
          {msp.change_pct >= 0 ? (
            <ArrowUpRight className="h-3 w-3" />
          ) : (
            <ArrowDownRight className="h-3 w-3" />
          )}
          {msp.change_pct >= 0 ? '+' : ''}{msp.change_pct}%
        </span>
      </div>

      {/* MSP price */}
      <div className="mt-4 rounded-2xl bg-gradient-to-br from-forest-50 to-cream-100 p-4">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-forest-500">
          <ShieldCheck className="h-3.5 w-3.5 text-leaf-600" />
          Minimum Support Price
        </p>
        <p className="mt-1 font-display text-3xl font-extrabold text-forest-900">
          {formatPrice(msp.msp_per_quintal)}
          <span className="text-sm font-medium text-forest-400">/{msp.unit.toLowerCase()}</span>
        </p>
      </div>

      {/* Market comparison */}
      <div className="mt-3 flex items-center justify-between rounded-2xl border border-forest-50 bg-white/50 px-4 py-3">
        <div>
          <p className="text-xs text-forest-500">Market Price</p>
          <p className="font-display text-lg font-bold text-forest-800">
            {formatPrice(marketPrice)}
          </p>
        </div>
        <div className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold ${
          isAbove ? 'bg-leaf-100 text-leaf-700' : 'bg-red-100 text-red-600'
        }`}>
          {isAbove ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          {isAbove ? '+' : ''}{diffPct.toFixed(1)}%
        </div>
      </div>

      {/* Guaranteed badge */}
      <div className="mt-3 flex items-center gap-2 text-xs text-forest-500">
        <Info className="h-3.5 w-3.5 text-gold-500" />
        Government guaranteed price. You will never receive less than this.
      </div>
    </div>
  );
}

export function MSPView() {
  const { t } = useApp();
  const { data: mspPrices } = useMSPPrices();
  const [search, setSearch] = useState('');

  const prices: MSPPrice[] = mspPrices && mspPrices.length > 0 ? mspPrices : MSP_FALLBACK;
  const filtered = search.trim()
    ? prices.filter((p) => p.crop.toLowerCase().includes(search.toLowerCase()))
    : prices;

  const avgMSP = prices.length > 0
    ? Math.round(prices.reduce((sum, p) => sum + p.msp_per_quintal, 0) / prices.length)
    : 0;
  const highestMSP = prices.length > 0 ? Math.max(...prices.map((p) => p.msp_per_quintal)) : 0;
  const aboveMSPCount = prices.filter((p) => (p.market_price_per_quintal ?? 0) >= p.msp_per_quintal).length;

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-28 lg:px-8 lg:pb-12">
      {/* Header */}
      <Reveal>
        <span className="section-eyebrow">
          <IndianRupee className="h-3.5 w-3.5" /> Minimum Support Prices
        </span>
        <h1 className="mt-3 display-heading text-3xl sm:text-4xl">
          Guaranteed fair prices for every crop
        </h1>
        <p className="mt-2 max-w-2xl text-forest-600">
          Government-mandated Minimum Support Prices ensure you always get a fair deal.
          Compare MSP with current market rates and know your guaranteed earnings before you sell.
        </p>
      </Reveal>

      {/* Summary cards */}
      <Reveal delay={80}>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-3xl glass p-5 card-hover">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-leaf-100 text-leaf-600">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <p className="mt-3 font-display text-2xl font-extrabold text-forest-900">
              {formatPrice(avgMSP)}
            </p>
            <p className="text-xs text-forest-500">Average MSP per quintal</p>
          </div>
          <div className="rounded-3xl glass p-5 card-hover">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gold-100 text-gold-700">
              <TrendingUp className="h-5 w-5" />
            </span>
            <p className="mt-3 font-display text-2xl font-extrabold text-forest-900">
              {formatPrice(highestMSP)}
            </p>
            <p className="text-xs text-forest-500">Highest MSP (Tur/Arhar)</p>
          </div>
          <div className="rounded-3xl glass p-5 card-hover">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-forest-100 text-forest-700">
              <Wheat className="h-5 w-5" />
            </span>
            <p className="mt-3 font-display text-2xl font-extrabold text-forest-900">
              {aboveMSPCount}/{prices.length}
            </p>
            <p className="text-xs text-forest-500">Crops selling at or above MSP</p>
          </div>
        </div>
      </Reveal>

      {/* Search bar */}
      <Reveal delay={120}>
        <div className="relative mt-6 max-w-md">
          <Search className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-forest-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for a crop…"
            className="w-full rounded-2xl border border-forest-100 bg-white/70 py-3 pl-11 pr-4 text-sm font-medium text-forest-800 outline-none backdrop-blur transition placeholder:text-forest-400 focus:border-leaf-400 focus:bg-white focus:ring-2 focus:ring-leaf-200"
          />
        </div>
      </Reveal>

      {/* Season badge */}
      <Reveal delay={140}>
        <div className="mt-4 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-forest-500" />
          <span className="text-sm font-semibold text-forest-700">
            {prices[0]?.season ?? 'Kharif 2026'}
          </span>
          <span className="chip bg-leaf-100 text-leaf-700">
            <span className="h-1.5 w-1.5 rounded-full bg-leaf-500" /> Active
          </span>
        </div>
      </Reveal>

      {/* MSP cards grid */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length > 0 ? (
          filtered.map((msp, i) => (
            <MSPCard key={msp.id} msp={msp} index={i} />
          ))
        ) : (
          <div className="col-span-full rounded-3xl glass p-8 text-center">
            <p className="text-sm text-forest-500">No crops found matching "{search}".</p>
          </div>
        )}
      </div>

      {/* Info banner */}
      <Reveal>
        <div className="mt-6 flex items-start gap-3 rounded-3xl bg-gradient-to-r from-leaf-50 to-cream-100 p-5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-leaf-100 text-leaf-600">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold text-forest-800">How MSP protects you</p>
            <p className="mt-1 text-sm text-forest-600">
              The Minimum Support Price is a government guarantee. When you bring your produce
              to a KisanConnect procurement center, you will always receive at least the MSP rate —
              never less. If the market price is higher, you get the market price. It's a safety net
              that ensures fair, transparent compensation for your hard work.
            </p>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
