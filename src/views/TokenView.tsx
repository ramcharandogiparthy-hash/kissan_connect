import { useEffect, useState } from 'react';
import {
  Ticket,
  Plus,
  Download,
  QrCode,
  Wheat,
  MapPin,
  Calendar,
  Clock,
  Users,
  Sprout,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { Reveal } from '@/components/Reveal';
import { FARMER } from '@/lib/data';
import { useToken } from '@/lib/hooks';

function QRCodeSVG() {
  // Deterministic pseudo-QR pattern
  const cells = [];
  const size = 21;
  const grid: boolean[][] = [];
  let seed = 73;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  for (let i = 0; i < size; i++) {
    grid[i] = [];
    for (let j = 0; j < size; j++) {
      grid[i][j] = rand() > 0.5;
    }
  }
  // Corner finder patterns
  const finder = (r: number, c: number) => {
    for (let i = -1; i <= 7; i++) {
      for (let j = -1; j <= 7; j++) {
        const ri = r + i;
        const cj = c + j;
        if (ri < 0 || ri >= size || cj < 0 || cj >= size) continue;
        if (i === -1 || i === 7 || j === -1 || j === 7) grid[ri][cj] = false;
        else if (i === 0 || i === 6 || j === 0 || j === 6) grid[ri][cj] = true;
        else if (i >= 2 && i <= 4 && j >= 2 && j <= 4) grid[ri][cj] = true;
        else if (i >= 1 && i <= 5 && j >= 1 && j <= 5) grid[ri][cj] = false;
      }
    }
  };
  finder(0, 0);
  finder(0, size - 7);
  finder(size - 7, 0);

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (grid[i][j]) cells.push(<rect key={`${i}-${j}`} x={j} y={i} width="1" height="1" fill="#0f3d2e" />);
    }
  }
  return (
    <svg viewBox="0 0 21 21" className="h-full w-full" shapeRendering="crispEdges">
      <rect width="21" height="21" fill="white" />
      {cells}
    </svg>
  );
}

export function TokenView() {
  const { t } = useApp();
  const { data: token } = useToken();
  const [saved, setSaved] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const farmer = token
    ? {
        token: token.token_number,
        crop: token.crop,
        quantity: token.quantity_quintals,
        center: token.center_name,
        date: '28 Aug',
        time: token.appointment_time,
        queuePosition: token.queue_position,
        name: token.farmer_name,
      }
    : FARMER;

  useEffect(() => {
    if (saved) {
      const timer = setTimeout(() => setShowSuccess(true), 300);
      return () => clearTimeout(timer);
    }
  }, [saved]);

  return (
    <div className="mx-auto max-w-3xl px-5 pb-24 pt-28 lg:px-8 lg:pb-12">
      <Reveal>
        <span className="section-eyebrow">
          <Ticket className="h-3.5 w-3.5" /> {t('token_title')}
        </span>
        <h1 className="mt-3 display-heading text-3xl sm:text-4xl">Your procurement pass</h1>
      </Reveal>

      {/* Boarding pass token */}
      <Reveal delay={100}>
        <div className="mt-8 overflow-hidden rounded-5xl bg-white shadow-glass-lg">
          {/* Header */}
          <div className="bg-gradient-to-r from-forest-800 to-forest-900 px-6 py-5 text-white sm:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15">
                  <Sprout className="h-5 w-5 text-leaf-300" />
                </span>
                <span className="font-display text-lg font-extrabold">KisanConnect</span>
              </div>
              <span className="text-xs font-semibold tracking-widest text-leaf-200">
                PROCUREMENT TOKEN
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="relative px-6 py-7 sm:px-8">
            {/* Perforation */}
            <div className="absolute left-0 right-0 top-1/2 hidden -translate-y-1/2 sm:block">
              <div className="flex items-center">
                <div className="h-5 w-5 rounded-full bg-cream-50" />
                <div className="flex-1 border-t-2 border-dashed border-forest-100" />
                <div className="h-5 w-5 rounded-full bg-cream-50" />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {/* Left: details */}
              <div>
                <p className="text-xs font-semibold tracking-wider text-forest-400">TOKEN NUMBER</p>
                <p className="font-display text-6xl font-extrabold text-forest-900">
                  {farmer.token}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4">
                  <div>
                    <p className="flex items-center gap-1 text-xs text-forest-400">
                      <Wheat className="h-3 w-3" /> Crop
                    </p>
                    <p className="font-semibold text-forest-800">{farmer.crop}</p>
                  </div>
                  <div>
                    <p className="flex items-center gap-1 text-xs text-forest-400">
                      <Users className="h-3 w-3" /> Quantity
                    </p>
                    <p className="font-semibold text-forest-800">{farmer.quantity} Quintals</p>
                  </div>
                  <div>
                    <p className="flex items-center gap-1 text-xs text-forest-400">
                      <MapPin className="h-3 w-3" /> Center
                    </p>
                    <p className="font-semibold text-forest-800">{farmer.center}</p>
                  </div>
                  <div>
                    <p className="flex items-center gap-1 text-xs text-forest-400">
                      <Calendar className="h-3 w-3" /> Date
                    </p>
                    <p className="font-semibold text-forest-800">28 Aug</p>
                  </div>
                  <div>
                    <p className="flex items-center gap-1 text-xs text-forest-400">
                      <Clock className="h-3 w-3" /> Time
                    </p>
                    <p className="font-semibold text-forest-800">{farmer.time}</p>
                  </div>
                  <div>
                    <p className="flex items-center gap-1 text-xs text-forest-400">
                      <Ticket className="h-3 w-3" /> Queue
                    </p>
                    <p className="font-semibold text-forest-800">#{farmer.queuePosition}</p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl bg-cream-100 px-4 py-3">
                  <p className="text-xs text-forest-400">Farmer</p>
                  <p className="font-display text-lg font-bold text-forest-900">{farmer.name}</p>
                </div>
              </div>

              {/* Right: QR */}
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="rounded-3xl bg-white p-3 shadow-glass">
                  <div className="h-36 w-36">
                    <QRCodeSVG />
                  </div>
                </div>
                <p className="flex items-center gap-1.5 text-xs font-medium text-forest-500">
                  <QrCode className="h-3.5 w-3.5" /> Scan at center
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-forest-50 bg-cream-50 px-6 py-4 sm:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs text-forest-400">Status</p>
                <p className="flex items-center gap-1.5 font-semibold text-leaf-600">
                  <CheckCircle2 className="h-4 w-4" /> Confirmed
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSaved(true)}
                  className={`inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold transition ${
                    saved
                      ? 'bg-leaf-100 text-leaf-700'
                      : 'bg-leaf-500 text-white hover:bg-leaf-600'
                  }`}
                >
                  {saved ? <CheckCircle2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {saved ? 'Added' : t('add_phone')}
                </button>
                <button className="inline-flex items-center gap-2 rounded-2xl border border-forest-200 bg-white px-5 py-2.5 text-sm font-semibold text-forest-700 transition hover:bg-cream-50">
                  <Download className="h-4 w-4" /> Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {showSuccess && (
        <div className="mt-4 flex items-center gap-3 rounded-2xl glass p-4 animate-fade-up">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-leaf-100 text-leaf-600">
            <CheckCircle2 className="h-5 w-5" />
          </span>
          <p className="text-sm font-medium text-forest-700">
            Token saved to your phone. You'll get a reminder 1 hour before your slot.
          </p>
        </div>
      )}
    </div>
  );
}
