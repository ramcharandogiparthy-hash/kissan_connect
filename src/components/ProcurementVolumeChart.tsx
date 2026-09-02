import React, { useState } from 'react';
import { TrendingUp, Zap, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useApp } from '@/lib/app-context';

export interface VolumeDataItem {
  day: string;
  value: number; // Volume in Quintals
  target?: number;
  trucks?: number;
  capacityPct?: number;
}

interface ProcurementVolumeChartProps {
  data?: VolumeDataItem[];
  targetValue?: number;
}

const DEFAULT_VOLUME_DATA: VolumeDataItem[] = [
  { day: 'Mon', value: 58, target: 70, trucks: 12, capacityPct: 65 },
  { day: 'Tue', value: 72, target: 70, trucks: 16, capacityPct: 78 },
  { day: 'Wed', value: 65, target: 70, trucks: 14, capacityPct: 72 },
  { day: 'Thu', value: 91, target: 70, trucks: 22, capacityPct: 92 },
  { day: 'Fri', value: 84, target: 70, trucks: 19, capacityPct: 86 },
  { day: 'Sat', value: 103, target: 70, trucks: 26, capacityPct: 98 },
  { day: 'Sun', value: 47, target: 70, trucks: 9, capacityPct: 48 },
];

export const ProcurementVolumeChart: React.FC<ProcurementVolumeChartProps> = ({
  data = DEFAULT_VOLUME_DATA,
  targetValue = 70,
}) => {
  const { lang } = useApp();
  const [chartMode, setChartMode] = useState<'area' | 'bar' | 'hybrid'>('hybrid');
  const [unit, setUnit] = useState<'qtl' | 'mt'>('qtl');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const formattedData = data.map((item, idx) => {
    const itemRec = item as unknown as Record<string, number>;
    const val = item.value ?? itemRec.volume ?? 0;
    const prevRec = idx > 0 ? (data[idx - 1] as unknown as Record<string, number>) : null;
    const prevVal = idx > 0 ? (data[idx - 1].value ?? prevRec?.volume ?? val) : val;
    const diffPct = prevVal > 0 ? Math.round(((val - prevVal) / prevVal) * 100) : 0;
    return {
      day: item.day,
      rawVolume: val,
      displayVolume: unit === 'mt' ? (val / 10).toFixed(1) : val,
      target: item.target ?? targetValue,
      trucks: item.trucks ?? Math.max(5, Math.round(val / 4.2)),
      capacityPct: item.capacityPct ?? Math.min(100, Math.round((val / 105) * 100)),
      diffPct,
    };
  });

  const totalVolume = formattedData.reduce((acc, curr) => acc + curr.rawVolume, 0);
  const avgVolume = Math.round(totalVolume / formattedData.length);
  const maxVolume = Math.max(...formattedData.map((d) => d.rawVolume), 1);
  const peakItem = [...formattedData].sort((a, b) => b.rawVolume - a.rawVolume)[0];
  const targetDiffPct = Math.round(((avgVolume - targetValue) / targetValue) * 100);

  // SVG dimensions
  const svgWidth = 600;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingTop = 30;
  const paddingBottom = 40;
  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingTop - paddingBottom;
  const yMax = Math.ceil((maxVolume * 1.15) / 10) * 10;

  // Calculate points
  const points = formattedData.map((d, i) => {
    const x = paddingX + (i / (formattedData.length - 1)) * chartWidth;
    const y = svgHeight - paddingBottom - (d.rawVolume / yMax) * chartHeight;
    return { x, y, data: d, index: i };
  });

  // Generate SVG smooth Bezier path
  const createBezierPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const current = pts[i];
      const next = pts[i + 1];
      const cpX1 = current.x + (next.x - current.x) * 0.4;
      const cpY1 = current.y;
      const cpX2 = current.x + (next.x - current.x) * 0.6;
      const cpY2 = next.y;
      d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${next.x} ${next.y}`;
    }
    return d;
  };

  const linePath = createBezierPath(points);
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${svgHeight - paddingBottom} L ${points[0].x} ${svgHeight - paddingBottom} Z`
    : '';

  const targetY = svgHeight - paddingBottom - (targetValue / yMax) * chartHeight;
  const activePoint = hoveredIdx !== null ? points[hoveredIdx] : points[points.length - 2] ?? points[0];

  return (
    <div className="w-full">
      {/* Header controls & toggles */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-forest-100/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-leaf-100 text-leaf-700">
              <TrendingUp className="h-4 w-4" />
            </span>
            <h3 className="font-display text-lg font-bold text-forest-900">
              {lang === 'te' ? 'కొనుగోలు పరిమాణం గ్రాఫ్' : lang === 'hi' ? 'खरीद मात्रा ग्राफ' : 'Procurement Volume'}
            </h3>
            <span className="chip bg-leaf-50 text-leaf-700 border border-leaf-200/60 text-[11px]">
              <Zap className="h-3 w-3 text-leaf-600" />
              {lang === 'te' ? 'లైవ్ అప్‌డేట్' : lang === 'hi' ? 'लाइव अपडेट' : 'Real-time'}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-forest-500">
            {lang === 'te' ? 'దినసరి వరి మరియు దాన్ని పరిమాణం క్వింటాళ్లలో' : lang === 'hi' ? 'दैनिक फसल खरीद की मात्रा (क्विंटल / टन)' : 'Daily grain intake with target benchmark analytics'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Unit selector */}
          <div className="flex rounded-xl bg-forest-50 p-1 text-xs font-semibold">
            <button
              onClick={() => setUnit('qtl')}
              className={`rounded-lg px-2.5 py-1 transition ${unit === 'qtl' ? 'bg-white text-forest-900 shadow-sm' : 'text-forest-500 hover:text-forest-700'}`}
            >
              Qtl
            </button>
            <button
              onClick={() => setUnit('mt')}
              className={`rounded-lg px-2.5 py-1 transition ${unit === 'mt' ? 'bg-white text-forest-900 shadow-sm' : 'text-forest-500 hover:text-forest-700'}`}
            >
              MT (Tons)
            </button>
          </div>

          {/* Chart mode */}
          <div className="flex rounded-xl bg-forest-50 p-1 text-xs font-semibold">
            <button
              onClick={() => setChartMode('hybrid')}
              className={`rounded-lg px-2 py-1 transition ${chartMode === 'hybrid' ? 'bg-leaf-600 text-white shadow-sm' : 'text-forest-600 hover:text-forest-900'}`}
              title="Combined Bar + Smooth Area Curve"
            >
              {lang === 'te' ? 'హైబ్రిడ్' : lang === 'hi' ? 'हाइब्रिड' : 'Hybrid'}
            </button>
            <button
              onClick={() => setChartMode('area')}
              className={`rounded-lg px-2 py-1 transition ${chartMode === 'area' ? 'bg-leaf-600 text-white shadow-sm' : 'text-forest-600 hover:text-forest-900'}`}
            >
              {lang === 'te' ? 'లైన్' : lang === 'hi' ? 'लाइन' : 'Line'}
            </button>
            <button
              onClick={() => setChartMode('bar')}
              className={`rounded-lg px-2 py-1 transition ${chartMode === 'bar' ? 'bg-leaf-600 text-white shadow-sm' : 'text-forest-600 hover:text-forest-900'}`}
            >
              {lang === 'te' ? 'బార్స్' : lang === 'hi' ? 'बार्स' : 'Bars'}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-2xl bg-cream-50/80 p-3 border border-forest-100/50">
          <p className="text-[11px] font-medium text-forest-500">
            {lang === 'te' ? 'మొత్తం పరిమాణం' : lang === 'hi' ? 'कुल आवक' : 'Total Volume'}
          </p>
          <p className="mt-1 font-display text-xl font-extrabold text-forest-900">
            {unit === 'mt' ? (totalVolume / 10).toFixed(1) : totalVolume.toLocaleString()}
            <span className="ml-1 text-xs font-medium text-forest-500">{unit === 'mt' ? 'MT' : 'Qtl'}</span>
          </p>
        </div>

        <div className="rounded-2xl bg-cream-50/80 p-3 border border-forest-100/50">
          <p className="text-[11px] font-medium text-forest-500">
            {lang === 'te' ? 'గరిష్ట కొనుగోలు రోజు' : lang === 'hi' ? 'उच्चतम आवक दिन' : 'Peak Volume'}
          </p>
          <p className="mt-1 font-display text-xl font-extrabold text-leaf-700">
            {unit === 'mt' ? (peakItem.rawVolume / 10).toFixed(1) : peakItem.rawVolume}
            <span className="ml-1 text-xs font-medium text-forest-500">({peakItem.day})</span>
          </p>
        </div>

        <div className="rounded-2xl bg-cream-50/80 p-3 border border-forest-100/50">
          <p className="text-[11px] font-medium text-forest-500">
            {lang === 'te' ? 'సగటు రోజువారీ' : lang === 'hi' ? 'औसत दैनिक आवक' : 'Daily Average'}
          </p>
          <p className="mt-1 font-display text-xl font-extrabold text-forest-900">
            {unit === 'mt' ? (avgVolume / 10).toFixed(1) : avgVolume}
            <span className="ml-1 text-xs font-medium text-forest-500">{unit === 'mt' ? 'MT/day' : 'Qtl/day'}</span>
          </p>
        </div>

        <div className="rounded-2xl bg-cream-50/80 p-3 border border-forest-100/50">
          <p className="text-[11px] font-medium text-forest-500">
            {lang === 'te' ? 'లక్ష్యం కంటే' : lang === 'hi' ? 'लक्ष्य से अंतर' : 'Vs Target'}
          </p>
          <p className={`mt-1 font-display text-xl font-extrabold flex items-center gap-1 ${targetDiffPct >= 0 ? 'text-leaf-600' : 'text-red-600'}`}>
            {targetDiffPct >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            {Math.abs(targetDiffPct)}%
            <span className="text-xs font-normal text-forest-500">vs {targetValue} Qtl</span>
          </p>
        </div>
      </div>

      {/* SVG Interactive Chart Box */}
      <div className="relative mt-4 rounded-3xl bg-gradient-to-b from-forest-950/5 to-leaf-950/10 p-4 border border-forest-100/80">
        {/* SVG Container */}
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto min-w-[500px] overflow-visible select-none"
          >
            <defs>
              <linearGradient id="volAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#15803d" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="volBarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4ade80" />
                <stop offset="100%" stopColor="#16a34a" />
              </linearGradient>
              <linearGradient id="activeBarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
              <filter id="shadowGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#16a34a" floodOpacity="0.3" />
              </filter>
            </defs>

            {/* Horizontal Grid lines & Y-Axis Labels */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
              const y = svgHeight - paddingBottom - pct * chartHeight;
              const val = Math.round(pct * yMax);
              const displayVal = unit === 'mt' ? (val / 10).toFixed(0) : val;
              return (
                <g key={i}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={svgWidth - paddingX}
                    y2={y}
                    stroke="#e2e8f0"
                    strokeDasharray={i === 0 ? undefined : '3 3'}
                    strokeWidth={1}
                  />
                  <text
                    x={paddingX - 8}
                    y={y + 4}
                    textAnchor="end"
                    className="text-[10px] fill-forest-400 font-medium"
                  >
                    {displayVal}
                  </text>
                </g>
              );
            })}

            {/* Target Threshold Line */}
            <g>
              <line
                x1={paddingX}
                y1={targetY}
                x2={svgWidth - paddingX}
                y2={targetY}
                stroke="#f59e0b"
                strokeWidth={1.5}
                strokeDasharray="4 4"
              />
              <rect
                x={svgWidth - paddingX - 95}
                y={targetY - 10}
                width="90"
                height="18"
                rx="9"
                fill="#fef3c7"
                stroke="#fde68a"
              />
              <text
                x={svgWidth - paddingX - 50}
                y={targetY + 2}
                textAnchor="middle"
                className="text-[9px] font-bold fill-amber-800"
              >
                Target: {unit === 'mt' ? (targetValue / 10).toFixed(1) : targetValue} {unit === 'mt' ? 'MT' : 'Qtl'}
              </text>
            </g>

            {/* BAR CHART LAYER */}
            {(chartMode === 'bar' || chartMode === 'hybrid') &&
              points.map((pt, i) => {
                const barWidth = 28;
                const barHeight = (pt.data.rawVolume / yMax) * chartHeight;
                const barX = pt.x - barWidth / 2;
                const barY = svgHeight - paddingBottom - barHeight;
                const isHovered = hoveredIdx === i;

                return (
                  <g key={`bar-${i}`} className="transition-all duration-300">
                    <rect
                      x={barX}
                      y={barY}
                      width={barWidth}
                      height={barHeight}
                      rx={6}
                      fill={isHovered ? 'url(#activeBarGradient)' : 'url(#volBarGradient)'}
                      opacity={chartMode === 'hybrid' ? 0.7 : 0.95}
                      className="cursor-pointer transition-all duration-200 hover:opacity-100"
                      onMouseEnter={() => setHoveredIdx(i)}
                    />
                  </g>
                );
              })}

            {/* AREA & LINE LAYER */}
            {(chartMode === 'area' || chartMode === 'hybrid') && (
              <g>
                <path d={areaPath} fill="url(#volAreaGradient)" />
                <path
                  d={linePath}
                  fill="none"
                  stroke="#16a34a"
                  strokeWidth={3}
                  strokeLinecap="round"
                  filter="url(#shadowGlow)"
                />
              </g>
            )}

            {/* DATA POINTS & INTERACTIVE HOVER TOUCHPOINTS */}
            {points.map((pt, i) => {
              const isHovered = hoveredIdx === i;
              return (
                <g
                  key={`pt-${i}`}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(i)}
                  onClick={() => setHoveredIdx(i)}
                >
                  {/* Invisible touch target area */}
                  <rect
                    x={pt.x - 20}
                    y={paddingTop}
                    width={40}
                    height={chartHeight}
                    fill="transparent"
                  />

                  {/* Vertical guide line on hover */}
                  {isHovered && (
                    <line
                      x1={pt.x}
                      y1={paddingTop}
                      x2={pt.x}
                      y2={svgHeight - paddingBottom}
                      stroke="#16a34a"
                      strokeWidth={1.5}
                      strokeDasharray="3 3"
                    />
                  )}

                  {/* Circle Node */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 7 : 4.5}
                    fill={isHovered ? '#f59e0b' : '#ffffff'}
                    stroke="#16a34a"
                    strokeWidth={isHovered ? 3 : 2.5}
                    className="transition-all duration-200"
                  />

                  {/* Value badge over top of peak nodes */}
                  {(isHovered || pt.data.rawVolume === maxVolume) && (
                    <g>
                      <rect
                        x={pt.x - 22}
                        y={pt.y - 24}
                        width={44}
                        height={18}
                        rx={9}
                        fill="#15803d"
                        className="shadow-sm"
                      />
                      <text
                        x={pt.x}
                        y={pt.y - 12}
                        textAnchor="middle"
                        className="text-[10px] font-extrabold fill-white"
                      >
                        {pt.data.displayVolume}
                      </text>
                    </g>
                  )}

                  {/* X-Axis Day Labels */}
                  <text
                    x={pt.x}
                    y={svgHeight - 12}
                    textAnchor="middle"
                    className={`text-[11px] font-bold ${
                      isHovered ? 'fill-leaf-700 font-extrabold' : 'fill-forest-600'
                    }`}
                  >
                    {pt.data.day}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Hover Tooltip Overlay Card */}
        {activePoint && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/95 p-3.5 shadow-glass backdrop-blur border border-leaf-100">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-leaf-50 text-leaf-700 font-display font-extrabold text-sm border border-leaf-200">
                {activePoint.data.day}
              </div>
              <div>
                <p className="text-xs font-semibold text-forest-600">
                  {lang === 'te' ? 'కొనుగోలు సమాచారం' : lang === 'hi' ? 'खरीद विवरण' : 'Procurement Details'}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-lg font-extrabold text-forest-900">
                    {activePoint.data.displayVolume} {unit === 'mt' ? 'MT' : 'Quintals'}
                  </span>
                  <span className={`text-xs font-bold ${activePoint.data.diffPct >= 0 ? 'text-leaf-600' : 'text-red-500'}`}>
                    {activePoint.data.diffPct >= 0 ? `+${activePoint.data.diffPct}%` : `${activePoint.data.diffPct}%`} vs yesterday
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium text-forest-600">
              <div className="flex items-center gap-1.5 bg-forest-50 px-3 py-1.5 rounded-xl border border-forest-100">
                <span className="h-2 w-2 rounded-full bg-gold-500" />
                <span>{activePoint.data.trucks} Trucks / Wagons</span>
              </div>
              <div className="flex items-center gap-1.5 bg-forest-50 px-3 py-1.5 rounded-xl border border-forest-100">
                <span className="h-2 w-2 rounded-full bg-leaf-500" />
                <span>Cap: {activePoint.data.capacityPct}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Legend */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-forest-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-leaf-500" />
            {lang === 'te' ? 'దినసరి వాల్యూమ్' : lang === 'hi' ? 'दैनिक आवक' : 'Daily Volume'}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 border-t-2 border-dashed border-amber-500" />
            {lang === 'te' ? 'కేంద్ర లక్ష్యం (70 Qtl)' : lang === 'hi' ? 'केंद्र लक्ष्य (70 क्विंटल)' : 'Intake Benchmark Target'}
          </span>
        </div>
        <span className="italic text-forest-400">
          {lang === 'te' ? 'డేటాను పరిశీలించడానికి ఏ రోజునైనా తాకండి' : lang === 'hi' ? 'विवरण देखने के लिए किसी भी दिन पर क्लिक करें' : 'Hover/tap any day point for analytics'}
        </span>
      </div>
    </div>
  );
};
