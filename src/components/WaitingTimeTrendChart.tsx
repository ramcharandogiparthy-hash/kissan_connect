import React, { useState } from 'react';
import { Clock3, ShieldCheck, Sparkles, Zap, TrendingDown } from 'lucide-react';
import { useApp } from '@/lib/app-context';

export interface WaitTimeDataItem {
  day: string;
  wait_min: number; // Regular queue wait time in minutes
  express_wait_min?: number; // AI Express token queue wait time
  tokenCount?: number;
  status?: 'optimal' | 'moderate' | 'busy';
}

interface WaitingTimeTrendChartProps {
  data?: WaitTimeDataItem[];
  thresholdMinutes?: number;
}

const DEFAULT_WEEKLY_WAIT_DATA: WaitTimeDataItem[] = [
  { day: 'Mon', wait_min: 34, express_wait_min: 10, tokenCount: 48, status: 'busy' },
  { day: 'Tue', wait_min: 22, express_wait_min: 8, tokenCount: 55, status: 'moderate' },
  { day: 'Wed', wait_min: 18, express_wait_min: 6, tokenCount: 62, status: 'optimal' },
  { day: 'Thu', wait_min: 28, express_wait_min: 9, tokenCount: 74, status: 'moderate' },
  { day: 'Fri', wait_min: 19, express_wait_min: 7, tokenCount: 68, status: 'optimal' },
  { day: 'Sat', wait_min: 36, express_wait_min: 12, tokenCount: 88, status: 'busy' },
  { day: 'Sun', wait_min: 14, express_wait_min: 5, tokenCount: 35, status: 'optimal' },
];

const DEFAULT_HOURLY_WAIT_DATA: WaitTimeDataItem[] = [
  { day: '8 AM', wait_min: 12, express_wait_min: 4, tokenCount: 15, status: 'optimal' },
  { day: '10 AM', wait_min: 26, express_wait_min: 8, tokenCount: 42, status: 'moderate' },
  { day: '12 PM', wait_min: 38, express_wait_min: 11, tokenCount: 65, status: 'busy' },
  { day: '2 PM', wait_min: 24, express_wait_min: 7, tokenCount: 38, status: 'moderate' },
  { day: '4 PM', wait_min: 16, express_wait_min: 5, tokenCount: 22, status: 'optimal' },
];

export const WaitingTimeTrendChart: React.FC<WaitingTimeTrendChartProps> = ({
  data,
  thresholdMinutes = 30,
}) => {
  const { lang } = useApp();
  const [viewScope, setViewScope] = useState<'weekly' | 'today'>('weekly');
  const [showExpressComparison, setShowExpressComparison] = useState(true);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  interface FormattedWaitItem {
    day: string;
    wait_min: number;
    express_wait_min: number;
    tokenCount: number;
    status: 'optimal' | 'moderate' | 'busy';
  }

  const activeDataSet: FormattedWaitItem[] = data && data.length > 0
    ? data.map((d) => {
        const itemRec = d as unknown as Record<string, number>;
        const wait_min = d.wait_min ?? itemRec.value ?? 20;
        const express_wait_min = d.express_wait_min ?? Math.max(4, Math.round(wait_min * 0.35));
        const tokenCount = d.tokenCount ?? 45;
        const status = d.status ?? (wait_min > thresholdMinutes ? 'busy' : wait_min > 20 ? 'moderate' : 'optimal');
        return { day: d.day, wait_min, express_wait_min, tokenCount, status };
      })
    : (viewScope === 'weekly' ? DEFAULT_WEEKLY_WAIT_DATA : DEFAULT_HOURLY_WAIT_DATA) as FormattedWaitItem[];

  const avgWait = Math.round(
    activeDataSet.reduce((acc, curr) => acc + curr.wait_min, 0) / activeDataSet.length
  );
  const avgExpressWait = Math.round(
    activeDataSet.reduce((acc, curr) => acc + curr.express_wait_min, 0) / activeDataSet.length
  );
  const peakWait = Math.max(...activeDataSet.map((d) => d.wait_min));
  const timeSaved = Math.max(0, avgWait - avgExpressWait);

  // SVG dimensions
  const svgWidth = 600;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingTop = 30;
  const paddingBottom = 40;
  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingTop - paddingBottom;
  const yMax = Math.ceil((Math.max(peakWait, thresholdMinutes) * 1.2) / 5) * 5;

  // Calculate points
  const points = activeDataSet.map((d, i) => {
    const x = paddingX + (i / (activeDataSet.length - 1)) * chartWidth;
    const yReg = svgHeight - paddingBottom - (d.wait_min / yMax) * chartHeight;
    const yExp = svgHeight - paddingBottom - (d.express_wait_min / yMax) * chartHeight;
    return { x, yReg, yExp, data: d, index: i };
  });

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

  const regPoints = points.map((p) => ({ x: p.x, y: p.yReg }));
  const expPoints = points.map((p) => ({ x: p.x, y: p.yExp }));

  const regLinePath = createBezierPath(regPoints);
  const regAreaPath = points.length > 0
    ? `${regLinePath} L ${points[points.length - 1].x} ${svgHeight - paddingBottom} L ${points[0].x} ${svgHeight - paddingBottom} Z`
    : '';

  const expLinePath = createBezierPath(expPoints);

  const thresholdY = svgHeight - paddingBottom - (thresholdMinutes / yMax) * chartHeight;
  const activePoint = hoveredIdx !== null ? points[hoveredIdx] : points[2] ?? points[0];

  return (
    <div className="w-full">
      {/* Header controls & toggles */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-forest-100/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-gold-100 text-gold-700">
              <Clock3 className="h-4 w-4" />
            </span>
            <h3 className="font-display text-lg font-bold text-forest-900">
              {lang === 'te' ? 'వేచియుండే సమయం ధోరణి' : lang === 'hi' ? 'प्रतीक्षा समय रुझान' : 'Waiting Time Trend'}
            </h3>
            <span className="chip bg-gold-50 text-amber-800 border border-amber-200/60 text-[11px]">
              <Sparkles className="h-3 w-3 text-gold-600" />
              {lang === 'te' ? 'AI స్మార్ట్ క్యూ' : lang === 'hi' ? 'AI स्मार्ट कतार' : 'AI Queue Optimizer'}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-forest-500">
            {lang === 'te' ? 'రైతుకు సగటున పట్టిన నిమిషాల విశ్లేషణ' : lang === 'hi' ? 'प्रति किसान औसत प्रतीक्षा समय विश्लेषण' : 'Average wait time in minutes with AI Express Slot efficiency'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Scope selector */}
          <div className="flex rounded-xl bg-forest-50 p-1 text-xs font-semibold">
            <button
              onClick={() => setViewScope('weekly')}
              className={`rounded-lg px-2.5 py-1 transition ${viewScope === 'weekly' ? 'bg-white text-forest-900 shadow-sm' : 'text-forest-500 hover:text-forest-700'}`}
            >
              {lang === 'te' ? 'ఈ వారం' : lang === 'hi' ? 'इस सप्ताह' : 'Weekly'}
            </button>
            <button
              onClick={() => setViewScope('today')}
              className={`rounded-lg px-2.5 py-1 transition ${viewScope === 'today' ? 'bg-white text-forest-900 shadow-sm' : 'text-forest-500 hover:text-forest-700'}`}
            >
              {lang === 'te' ? 'ఈ రోజు సమయాలు' : lang === 'hi' ? 'आज घंटे' : 'Today Hours'}
            </button>
          </div>

          {/* Express overlay toggle */}
          <button
            onClick={() => setShowExpressComparison(!showExpressComparison)}
            className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold transition border ${
              showExpressComparison
                ? 'bg-amber-50 text-amber-900 border-amber-300'
                : 'bg-forest-50 text-forest-600 border-forest-100 hover:bg-forest-100'
            }`}
          >
            <Zap className={`h-3.5 w-3.5 ${showExpressComparison ? 'text-amber-600 fill-amber-500' : 'text-forest-400'}`} />
            {lang === 'te' ? 'AI ఎక్స్‌ప్రెస్ పోలిక' : lang === 'hi' ? 'AI एक्सप्रेस तुलना' : 'AI Express Pass'}
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-2xl bg-cream-50/80 p-3 border border-forest-100/50">
          <p className="text-[11px] font-medium text-forest-500">
            {lang === 'te' ? 'సగటు వేచియుండే సమయం' : lang === 'hi' ? 'औसत प्रतीक्षा समय' : 'Avg Wait Time'}
          </p>
          <p className="mt-1 font-display text-xl font-extrabold text-forest-900">
            {avgWait} <span className="text-xs font-medium text-forest-500">min</span>
          </p>
        </div>

        <div className="rounded-2xl bg-cream-50/80 p-3 border border-forest-100/50">
          <p className="text-[11px] font-medium text-forest-500">
            {lang === 'te' ? 'AI పాస్ వేచియుండే సమయం' : lang === 'hi' ? 'AI पास प्रतीक्षा' : 'AI Express Wait'}
          </p>
          <p className="mt-1 font-display text-xl font-extrabold text-leaf-700 flex items-center gap-1">
            {avgExpressWait} <span className="text-xs font-medium text-forest-500">min</span>
            <span className="chip bg-leaf-100 text-leaf-700 text-[10px] px-1.5 py-0.5">Fast</span>
          </p>
        </div>

        <div className="rounded-2xl bg-cream-50/80 p-3 border border-forest-100/50">
          <p className="text-[11px] font-medium text-forest-500">
            {lang === 'te' ? 'ఆదా అయిన సమయం' : lang === 'hi' ? 'बचाया गया समय' : 'Time Saved'}
          </p>
          <p className="mt-1 font-display text-xl font-extrabold text-gold-700 flex items-center gap-1">
            <TrendingDown className="h-4 w-4 text-leaf-600" />
            {timeSaved} <span className="text-xs font-medium text-forest-500">min/farmer</span>
          </p>
        </div>

        <div className="rounded-2xl bg-cream-50/80 p-3 border border-forest-100/50">
          <p className="text-[11px] font-medium text-forest-500">
            {lang === 'te' ? 'క్యూ సామర్థ్య స్కోర్' : lang === 'hi' ? 'कतार दक्षता स्कोर' : 'Queue Efficiency'}
          </p>
          <p className="mt-1 font-display text-xl font-extrabold text-leaf-700 flex items-center gap-1">
            <ShieldCheck className="h-4 w-4 text-leaf-600" />
            94.8%
          </p>
        </div>
      </div>

      {/* SVG Interactive Chart Box */}
      <div className="relative mt-4 rounded-3xl bg-gradient-to-b from-amber-950/5 to-forest-950/10 p-4 border border-forest-100/80">
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto min-w-[500px] overflow-visible select-none"
          >
            <defs>
              <linearGradient id="waitAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#d97706" stopOpacity="0.0" />
              </linearGradient>
              <filter id="amberGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#f59e0b" floodOpacity="0.35" />
              </filter>
            </defs>

            {/* Grid & Y Labels */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
              const y = svgHeight - paddingBottom - pct * chartHeight;
              const val = Math.round(pct * yMax);
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
                    {val}m
                  </text>
                </g>
              );
            })}

            {/* Congestion Alert Threshold Line */}
            <g>
              <line
                x1={paddingX}
                y1={thresholdY}
                x2={svgWidth - paddingX}
                y2={thresholdY}
                stroke="#ef4444"
                strokeWidth={1.5}
                strokeDasharray="4 4"
              />
              <rect
                x={svgWidth - paddingX - 110}
                y={thresholdY - 10}
                width="105"
                height="18"
                rx="9"
                fill="#fee2e2"
                stroke="#fca5a5"
              />
              <text
                x={svgWidth - paddingX - 58}
                y={thresholdY + 2}
                textAnchor="middle"
                className="text-[9px] font-bold fill-red-800"
              >
                Limit: {thresholdMinutes} min max
              </text>
            </g>

            {/* Area & Regular Curve */}
            <path d={regAreaPath} fill="url(#waitAreaGradient)" />
            <path
              d={regLinePath}
              fill="none"
              stroke="#f59e0b"
              strokeWidth={3}
              strokeLinecap="round"
              filter="url(#amberGlow)"
            />

            {/* Express Curve Overlay */}
            {showExpressComparison && (
              <path
                d={expLinePath}
                fill="none"
                stroke="#10b981"
                strokeWidth={2.5}
                strokeDasharray="5 4"
                strokeLinecap="round"
              />
            )}

            {/* Interactive Points */}
            {points.map((pt, i) => {
              const isHovered = hoveredIdx === i;
              const isHigh = pt.data.wait_min > thresholdMinutes;

              return (
                <g
                  key={`wait-pt-${i}`}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(i)}
                  onClick={() => setHoveredIdx(i)}
                >
                  <rect
                    x={pt.x - 20}
                    y={paddingTop}
                    width={40}
                    height={chartHeight}
                    fill="transparent"
                  />

                  {isHovered && (
                    <line
                      x1={pt.x}
                      y1={paddingTop}
                      x2={pt.x}
                      y2={svgHeight - paddingBottom}
                      stroke="#f59e0b"
                      strokeWidth={1.5}
                      strokeDasharray="3 3"
                    />
                  )}

                  {/* Regular Queue Node */}
                  <circle
                    cx={pt.x}
                    cy={pt.yReg}
                    r={isHovered ? 7 : 5}
                    fill={isHigh ? '#ef4444' : isHovered ? '#ffffff' : '#f59e0b'}
                    stroke={isHigh ? '#dc2626' : '#d97706'}
                    strokeWidth={isHovered ? 3 : 2}
                  />

                  {/* Express Queue Node */}
                  {showExpressComparison && (
                    <circle
                      cx={pt.x}
                      cy={pt.yExp}
                      r={isHovered ? 5.5 : 3.5}
                      fill="#10b981"
                      stroke="#ffffff"
                      strokeWidth={1.5}
                    />
                  )}

                  {/* Label badge on hover */}
                  {(isHovered || isHigh) && (
                    <g>
                      <rect
                        x={pt.x - 20}
                        y={pt.yReg - 24}
                        width={40}
                        height={18}
                        rx={9}
                        fill={isHigh ? '#dc2626' : '#b45309'}
                      />
                      <text
                        x={pt.x}
                        y={pt.yReg - 12}
                        textAnchor="middle"
                        className="text-[10px] font-extrabold fill-white"
                      >
                        {pt.data.wait_min}m
                      </text>
                    </g>
                  )}

                  {/* X-Axis Day Label */}
                  <text
                    x={pt.x}
                    y={svgHeight - 12}
                    textAnchor="middle"
                    className={`text-[11px] font-bold ${
                      isHovered ? 'fill-gold-700 font-extrabold' : 'fill-forest-600'
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
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/95 p-3.5 shadow-glass backdrop-blur border border-gold-200">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gold-50 text-gold-700 font-display font-extrabold text-sm border border-gold-200">
                {activePoint.data.day}
              </div>
              <div>
                <p className="text-xs font-semibold text-forest-600">
                  {lang === 'te' ? 'వేచియుండే క్యూ సమాచారం' : lang === 'hi' ? 'प्रतीक्षा समय विवरण' : 'Queue Analysis Details'}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-lg font-extrabold text-forest-900">
                    {activePoint.data.wait_min} mins
                  </span>
                  <span className={`chip text-xs px-2 py-0.5 font-bold ${
                    activePoint.data.wait_min > 30
                      ? 'bg-red-100 text-red-700 border-red-200'
                      : activePoint.data.wait_min > 20
                      ? 'bg-amber-100 text-amber-800 border-amber-200'
                      : 'bg-leaf-100 text-leaf-800 border-leaf-200'
                  }`}>
                    {activePoint.data.wait_min > 30
                      ? (lang === 'te' ? 'అధిక రద్దీ' : lang === 'hi' ? 'अधिक देरी' : 'High Wait')
                      : activePoint.data.wait_min > 20
                      ? (lang === 'te' ? 'మధ్యస్థం' : lang === 'hi' ? 'सामान्य' : 'Moderate')
                      : (lang === 'te' ? 'అనుకూల సమయం' : lang === 'hi' ? 'अनुकूल' : 'Optimal')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs font-medium">
              <div className="flex items-center gap-1.5 rounded-xl bg-leaf-50 px-3 py-1.5 text-leaf-800 border border-leaf-200/60 font-semibold">
                <Zap className="h-3.5 w-3.5 text-leaf-600 fill-leaf-500" />
                <span>AI Express Token: <strong>{activePoint.data.express_wait_min}m</strong> ({activePoint.data.wait_min - activePoint.data.express_wait_min}m faster)</span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 rounded-xl bg-forest-50 px-3 py-1.5 text-forest-700 border border-forest-100">
                <span>{activePoint.data.tokenCount} Farmers Processed</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Legend */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-forest-500">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-gold-500" />
            {lang === 'te' ? 'సాధారణ క్యూ సమయం' : lang === 'hi' ? 'सामान्य कतार समय' : 'Regular Walk-in Wait Time'}
          </span>
          {showExpressComparison && (
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              {lang === 'te' ? 'AI ఎక్స్‌ప్రెస్ టోకెన్ క్యూ' : lang === 'hi' ? 'AI एक्सप्रेस टोकन' : 'AI Smart Token Queue'}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 border-t-2 border-dashed border-red-400" />
            {lang === 'te' ? 'గరిష్ట పరిమితి (30 నిమి)' : lang === 'hi' ? 'अधिकतम सीमा (30 मिनट)' : '30-Min Congestion Alert'}
          </span>
        </div>
      </div>
    </div>
  );
};
