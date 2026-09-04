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
import { useApp } from '@/lib/app-context';
import { ComplaintModal } from '@/components/ComplaintModal';

export function HelpButton() {
  const { lang, t, setMitraOpen } = useApp();
  const [open, setOpen] = useState(false);
  const [showComplaintModal, setShowComplaintModal] = useState(false);

  const options =
    lang === 'te'
      ? [
          { id: 'report', icon: MessageSquareWarning, label: 'సమస్యను తెలియజేయండి', desc: 'ఏవైనా ఇబ్బందులు ఉంటే తెలపండి' },
          { id: 'complaint', icon: FileText, label: 'ఫిర్యాదు నమోదు', desc: 'అధికారిక ఫిర్యాదు సబ్మిట్ చేయండి' },
          { id: 'bot', icon: Bot, label: 'AI అసిస్టెంట్‌ని అడగండి', desc: 'కిసాన్ మిత్రతో చాట్ చేయండి' },
          { id: 'call', icon: Phone, label: 'కేంద్రాన్ని సంప్రదించండి', desc: 'కొనుగోలు కేంద్రానికి కాల్ చేయండి' },
          { id: 'faq', icon: HelpCircle, label: 'తరచుగా అడిగే ప్రశ్నలు', desc: 'ముఖ్యమైన సందేహాలు & సమాధానాలు' },
        ]
      : lang === 'hi'
      ? [
          { id: 'report', icon: MessageSquareWarning, label: 'समस्या की रिपोर्ट करें', desc: 'यदि कोई समस्या हो तो बताएं' },
          { id: 'complaint', icon: FileText, label: 'शिकायत दर्ज करें', desc: 'आधिकारिक शिकायत जमा करें' },
          { id: 'bot', icon: Bot, label: 'AI सहायक से पूछें', desc: 'किसान मित्र से बात करें' },
          { id: 'call', icon: Phone, label: 'खरीद केंद्र से संपर्क करें', desc: 'अपने केंद्र पर कॉल करें' },
          { id: 'faq', icon: HelpCircle, label: 'अक्सर पूछे जाने वाले प्रश्न', desc: 'महत्वपूर्ण प्रश्न व उत्तर' },
        ]
      : [
          { id: 'report', icon: MessageSquareWarning, label: 'Report a Problem', desc: 'Tell us what went wrong' },
          { id: 'complaint', icon: FileText, label: 'Submit Complaint', desc: 'Formal grievance submission' },
          { id: 'bot', icon: Bot, label: 'Ask AI Assistant', desc: 'Chat with Kisan Mitra' },
          { id: 'call', icon: Phone, label: 'Contact Center', desc: 'Call your procurement center' },
          { id: 'faq', icon: HelpCircle, label: 'FAQs', desc: 'Frequently asked questions' },
        ];

  const handleOptionClick = (id: string) => {
    setOpen(false);
    if (id === 'complaint' || id === 'report') {
      setShowComplaintModal(true);
    } else if (id === 'bot') {
      setMitraOpen(true);
    } else if (id === 'call') {
      window.location.href = 'tel:180042554772';
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-20 left-4 z-50 flex items-center gap-2 rounded-full bg-red-500 px-4 py-3 text-sm font-bold text-white shadow-[0_8px_30px_rgba(239,68,68,0.4)] transition-all hover:scale-105 sm:bottom-24 lg:bottom-6 lg:left-6"
      >
        {open ? <X className="h-5 w-5" /> : <LifeBuoy className="h-5 w-5" />}
        <span className="hidden sm:inline">
          {open
            ? (lang === 'te' ? 'మూసివేయి' : lang === 'hi' ? 'बंद करें' : 'Close')
            : (lang === 'te' ? 'సహాయం' : lang === 'hi' ? 'सहायता' : 'Help')}
        </span>
      </button>

      {open && (
        <div className="fixed bottom-36 left-4 z-50 w-[calc(100vw-2rem)] max-w-xs origin-bottom-left animate-scale-in sm:bottom-40 lg:bottom-24 lg:left-6">
          <div className="overflow-hidden rounded-3xl glass shadow-glass-lg">
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-5 py-4 text-white">
              <p className="font-display text-base font-bold">{t('help_title')}</p>
              <p className="text-xs text-red-100">
                {lang === 'te' ? 'రైతులకు 24/7 సహాయం అందుబాటులో ఉంది' : lang === 'hi' ? 'किसानों के लिए 24/7 सहायता उपलब्ध है' : "We're here for you, anytime"}
              </p>
            </div>
            <div className="space-y-1 p-2">
              {options.map((o) => {
                const Icon = o.icon;
                return (
                  <button
                    key={o.id}
                    onClick={() => handleOptionClick(o.id)}
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

      <ComplaintModal
        isOpen={showComplaintModal}
        onClose={() => setShowComplaintModal(false)}
      />
    </>
  );
}

export function Notifications() {
  const { lang } = useApp();
  const [activeNotifs, setActiveNotifs] = useState<{ id: number; emoji: string; title: string; body: string; color: string }[]>([]);

  useEffect(() => {
    const rawNotifs =
      lang === 'te'
        ? [
            { id: 1, emoji: '🎟️', title: 'అపాయింట్‌మెంట్ జ్ఞాపిక', body: 'మీ కొనుగోలు స్లాట్ 1 గంటలో ప్రారంభమవుతుంది.', color: 'from-leaf-500 to-forest-600' },
            { id: 2, emoji: '🚦', title: 'లైవ్ క్యూ హెచ్చరిక', body: 'మీ కంటే ముందు కేవలం 2 రైతులు ఉన్నారు!', color: 'from-gold-400 to-gold-500' },
            { id: 3, emoji: '⛈️', title: 'వాతావరణ హెచ్చరిక', body: 'గుంటూరు ప్రాంతంలో రేపు వర్ష సూచన. ధాన్యం కప్పి ఉంచండి.', color: 'from-blue-500 to-indigo-600' },
          ]
        : lang === 'hi'
        ? [
            { id: 1, emoji: '🎟️', title: 'अपॉइंटमेंट रिमाइंडर', body: 'आपका खरीद स्लॉट 1 घंटे में शुरू हो रहा है।', color: 'from-leaf-500 to-forest-600' },
            { id: 2, emoji: '🚦', title: 'कतार लाइव अपडेट', body: 'आपके आगे केवल 2 किसान हैं!', color: 'from-gold-400 to-gold-500' },
            { id: 3, emoji: '⛈️', title: 'मौसम अलर्ट', body: 'गुंटूर क्षेत्र में कल बारिश की संभावना। अनाज ढक कर रखें।', color: 'from-blue-500 to-indigo-600' },
          ]
        : [
            { id: 1, emoji: '🎟️', title: 'Appointment Reminder', body: 'Your procurement slot starts in 1 hour.', color: 'from-leaf-500 to-forest-600' },
            { id: 2, emoji: '🚦', title: 'Queue Update', body: 'Only 2 farmers are ahead of you!', color: 'from-gold-400 to-gold-500' },
            { id: 3, emoji: '⛈️', title: 'Weather Advisory', body: 'Unseasonal rain forecast tomorrow in Guntur. Cover stored grain.', color: 'from-blue-500 to-indigo-600' },
          ];

    // Show notifications progressively
    const t1 = setTimeout(() => {
      setActiveNotifs([rawNotifs[0]]);
    }, 2000);

    const t2 = setTimeout(() => {
      setActiveNotifs([rawNotifs[0], rawNotifs[1]]);
    }, 3500);

    const t3 = setTimeout(() => {
      setActiveNotifs([rawNotifs[0], rawNotifs[1], rawNotifs[2]]);
    }, 5000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [lang]);

  // Auto-dismiss each notification after 7 seconds of appearance
  useEffect(() => {
    if (activeNotifs.length === 0) return;
    const autoDismissTimer = setTimeout(() => {
      setActiveNotifs((prev) => prev.slice(1));
    }, 6500);

    return () => clearTimeout(autoDismissTimer);
  }, [activeNotifs]);

  const dismissOne = (id: number) => {
    setActiveNotifs((prev) => prev.filter((item) => item.id !== id));
  };

  if (activeNotifs.length === 0) return null;

  return (
    <div className="pointer-events-none fixed right-4 top-20 z-40 hidden w-80 space-y-2.5 lg:block">
      {activeNotifs.map((n) => (
        <div
          key={n.id}
          className="pointer-events-auto relative overflow-hidden flex items-start gap-3 rounded-2xl glass p-3.5 shadow-glass-lg animate-slide-in-right border border-forest-100/60"
        >
          <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${n.color} text-lg text-white shadow-sm`}>
            {n.emoji}
          </span>
          <div className="min-w-0 flex-1 pr-4">
            <p className="text-sm font-bold text-forest-900 leading-tight">{n.title}</p>
            <p className="text-xs text-forest-600 mt-0.5 leading-snug">{n.body}</p>
            <span className="inline-block mt-1 text-[10px] font-semibold text-leaf-700 bg-leaf-100 px-1.5 py-0.5 rounded">Auto-dismissing</span>
          </div>
          <button
            onClick={() => dismissOne(n.id)}
            className="absolute top-2.5 right-2.5 grid h-6 w-6 place-items-center rounded-full text-forest-400 hover:bg-forest-100 hover:text-forest-700 transition"
            title="Dismiss Notification"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

