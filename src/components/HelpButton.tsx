import { useEffect, useState } from 'react';
import {
  LifeBuoy,
  X,
  MessageSquareWarning,
  Phone,
  FileText,
  Bot,
  HelpCircle,
} from 'lucide-react';

export function HelpButton() {
  const [open, setOpen] = useState(false);

  const options = [
    { icon: MessageSquareWarning, label: 'Report a Problem', desc: 'Tell us what went wrong' },
    { icon: Phone, label: 'Contact Center', desc: 'Call your procurement center' },
    { icon: FileText, label: 'Submit Complaint', desc: 'Formal grievance submission' },
    { icon: Bot, label: 'Ask AI Assistant', desc: 'Chat with Kisan Mitra' },
    { icon: HelpCircle, label: 'FAQs', desc: 'Frequently asked questions' },
  ];

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-24 left-4 z-40 flex items-center gap-2 rounded-full bg-red-500 px-4 py-3 text-sm font-bold text-white shadow-[0_8px_30px_rgba(239,68,68,0.4)] transition-all hover:scale-105 lg:bottom-6 lg:left-6"
      >
        {open ? <X className="h-5 w-5" /> : <LifeBuoy className="h-5 w-5" />}
        <span className="hidden sm:inline">{open ? 'Close' : 'Help'}</span>
      </button>

      {open && (
        <div className="fixed bottom-40 left-4 z-40 w-[calc(100vw-2rem)] max-w-xs origin-bottom-left animate-scale-in lg:bottom-24 lg:left-6">
          <div className="overflow-hidden rounded-3xl glass shadow-glass-lg">
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-5 py-4 text-white">
              <p className="font-display text-base font-bold">Help & Support</p>
              <p className="text-xs text-red-100">We're here for you, anytime</p>
            </div>
            <div className="space-y-1 p-2">
              {options.map((o) => {
                const Icon = o.icon;
                return (
                  <button
                    key={o.label}
                    className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-cream-100"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-red-100 text-red-600">
                      <Icon className="h-4.5 w-4.5" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-forest-800">{o.label}</span>
                      <span className="block text-xs text-forest-500">{o.desc}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function Notifications() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  const notifs = [
    { emoji: '🎟️', title: 'Appointment Reminder', body: 'Your procurement slot starts in 1 hour.', color: 'from-leaf-500 to-forest-600' },
    { emoji: '🚦', title: 'Queue Update', body: 'Only 2 farmers are ahead of you!', color: 'from-gold-400 to-gold-500' },
  ];

  return (
    <div className="pointer-events-none fixed right-4 top-20 z-40 hidden w-80 space-y-2.5 lg:block">
      {notifs.map((n, i) => (
        <div
          key={i}
          className="pointer-events-auto flex items-start gap-3 rounded-2xl glass p-3.5 shadow-glass animate-slide-in-right"
          style={{ animationDelay: `${i * 400}ms` }}
        >
          <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${n.color} text-lg`}>
            {n.emoji}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-forest-800">{n.title}</p>
            <p className="text-xs text-forest-600">{n.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
