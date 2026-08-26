import { useEffect, useState } from 'react';
import {
  Bot,
  X,
  Calendar,
  Ticket,
  MapPin,
  Wallet,
  Mic,
  Sparkles,
  Send,
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import type { ViewId } from '@/lib/data';

interface Message {
  role: 'bot' | 'user';
  text: string;
}

export function KisanMitra() {
  const { t, setView } = useApp();
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        { role: 'bot', text: `${t('mitra_greeting')} ${t('mitra_desc')}` },
      ]);
    }
  }, [open, messages.length, t]);

  const quickActions: { icon: typeof Bot; label: string; view: ViewId; reply: string }[] = [
    { icon: Calendar, label: 'My Schedule', view: 'dashboard', reply: 'Your next appointment is tomorrow, 28 August at 10:30 AM at Vijayawada Center.' },
    { icon: Ticket, label: 'My Token', view: 'token', reply: 'Your token is A127. You are #4 in queue with an estimated wait of 24 minutes.' },
    { icon: MapPin, label: 'Nearby Centers', view: 'map', reply: 'Guntur Center has the lowest crowd right now — only 12 farmers waiting, 18 min average.' },
    { icon: Wallet, label: 'My Payment', view: 'payment', reply: 'Your payment of ₹92,400 has been successfully processed to your bank account.' },
  ];

  const send = (text: string) => {
    setMessages((m) => [...m, { role: 'user', text }]);
    setInput('');
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        { role: 'bot', text: 'I have noted that. Let me check the latest data for you right away.' },
      ]);
    }, 700);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-24 right-4 z-50 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-leaf-500 to-forest-600 text-white shadow-glow-lg transition-all hover:scale-110 animate-glow-pulse lg:bottom-6 lg:right-6"
        aria-label="Kisan Mitra AI Assistant"
      >
        {open ? <X className="h-6 w-6" /> : <Bot className="h-7 w-7" strokeWidth={2} />}
        {!open && (
          <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-400 opacity-75" />
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-gold-400" />
          </span>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-40 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm origin-bottom-right animate-scale-in lg:bottom-24 lg:right-6">
          <div className="overflow-hidden rounded-3xl glass shadow-glass-lg">
            {/* Header */}
            <div className="flex items-center gap-3 bg-gradient-to-r from-forest-800 to-forest-700 px-5 py-4 text-white">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/15 backdrop-blur">
                <Bot className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display text-base font-bold">Kisan Mitra</p>
                <p className="flex items-center gap-1 text-xs text-leaf-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-leaf-400" /> AI Assistant • Online
                </p>
              </div>
              <Sparkles className="ml-auto h-5 w-5 text-gold-300" />
            </div>

            {/* Messages */}
            <div className="max-h-64 space-y-3 overflow-y-auto bg-cream-50/50 px-4 py-4 scrollbar-hide">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm ${
                      m.role === 'user'
                        ? 'bg-leaf-500 text-white'
                        : 'glass text-forest-800'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-2 gap-1.5 px-4 pb-2">
              {quickActions.map((qa) => {
                const Icon = qa.icon;
                return (
                  <button
                    key={qa.label}
                    onClick={() => {
                      send(qa.label);
                      setTimeout(() => setView(qa.view), 1200);
                    }}
                    className="flex items-center gap-1.5 rounded-xl border border-forest-100 bg-white/60 px-2.5 py-2 text-xs font-semibold text-forest-700 transition hover:border-leaf-300 hover:bg-leaf-50"
                  >
                    <Icon className="h-3.5 w-3.5 text-leaf-600" />
                    {qa.label}
                  </button>
                );
              })}
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 border-t border-forest-100 px-3 py-3">
              <button
                onClick={() => setListening((l) => !l)}
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl transition ${
                  listening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-forest-100 text-forest-600 hover:bg-forest-200'
                }`}
              >
                <Mic className="h-4 w-4" />
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && input.trim() && send(input)}
                placeholder={listening ? 'Listening…' : 'Ask anything…'}
                className="min-w-0 flex-1 rounded-xl bg-forest-50 px-3 py-2 text-sm text-forest-800 outline-none placeholder:text-forest-400"
              />
              <button
                onClick={() => input.trim() && send(input)}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-leaf-500 text-white transition hover:bg-leaf-600"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
