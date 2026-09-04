import { useEffect, useRef, useState } from 'react';
import {
  Bot,
  X,
  Ticket,
  MapPin,
  Wallet,
  Mic,
  MicOff,
  Sparkles,
  Send,
  Volume2,
  VolumeX,
  IndianRupee,
  Radio,
  Globe,
  AlertCircle,
  Wheat,
  Calendar,
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import type { ViewId } from '@/lib/data';

interface Message {
  id: string;
  role: 'bot' | 'user';
  text: string;
  isVoice?: boolean;
}

function playChime(type: 'start' | 'reply' | 'error') {
  try {
    const win = window as unknown as Record<string, unknown>;
    const AudioCtx = (window.AudioContext || win.webkitAudioContext) as typeof AudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'start') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'reply') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.12);
      osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.3);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.linearRampToValueAtTime(150, now + 0.2);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  } catch {
    /* ignore audio error */
  }
}

export function KisanMitra() {
  const {
    t,
    lang,
    setLang,
    setView,
    activeToken,
    mitraOpen,
    setMitraOpen,
    voiceTriggerCount,
    autoSpeech,
    setAutoSpeech,
  } = useApp();

  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const [activeSpeakingId, setActiveSpeakingId] = useState<string | null>(null);

  const recognitionRef = useRef<unknown>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const audioUnlockedRef = useRef<boolean>(false);
  const lastCapturedSpeechRef = useRef<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      try {
        window.speechSynthesis.getVoices();
        window.speechSynthesis.onvoiceschanged = () => {
          window.speechSynthesis.getVoices();
        };
      } catch {
        /* ignore */
      }
    }
  }, []);

  const unlockAudio = () => {
    if (!synthRef.current) return;
    try {
      synthRef.current.resume();
      if (!audioUnlockedRef.current) {
        const dummyUtterance = new SpeechSynthesisUtterance('');
        dummyUtterance.volume = 0.01;
        synthRef.current.speak(dummyUtterance);
        audioUnlockedRef.current = true;
      }
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    if (mitraOpen && messages.length === 0) {
      setMessages([
        {
          id: 'msg-0',
          role: 'bot',
          text:
            lang === 'te'
              ? `నమస్తే రైతు సోదరా! నేను కిసాన్ మిత్ర AI వాయిస్ అసిస్టెంట్. మీ టోకెన్, క్యూ స్థానం, వరి మద్దతు ధరలు, బ్యాంక్ చెల్లింపులు మరియు సమీప కొనుగోలు కేంద్రాల గురించి తెలుగులో మాట్లాడి తెలుసుకోండి.`
              : `${t('mitra_greeting')} ${t('mitra_desc')}`,
        },
      ]);
    }
  }, [mitraOpen, messages.length, lang, t]);

  useEffect(() => {
    if (voiceTriggerCount > 0) {
      setMitraOpen(true);
      unlockAudio();
      setTimeout(() => {
        startListening();
      }, 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceTriggerCount]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, listening, speaking]);

  const speakText = (text: string, msgId?: string) => {
    unlockAudio();
    if (!synthRef.current) return;

    try {
      synthRef.current.cancel();
      playChime('reply');

      // Preprocess text for phonetic speech output in Telugu
      let cleanText = text.replace(/[*#_]/g, '');
      if (lang === 'te') {
        cleanText = cleanText
          .replace(/₹/g, ' రూపాయల ')
          .replace(/KM/gi, ' కిలోమీటర్ల ')
          .replace(/Mins/gi, ' నిమిషాలు ');
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      const targetLang = lang === 'te' ? 'te-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.lang = targetLang;
      utterance.rate = 0.92;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      const voices = synthRef.current.getVoices();
      if (voices && voices.length > 0) {
        const langVoice = voices.find((v) => v.lang.startsWith(targetLang.split('-')[0]));
        const inVoice = voices.find((v) => v.lang.includes('IN') || v.lang.includes('en'));
        utterance.voice = langVoice || inVoice || voices[0];
      }

      utterance.onstart = () => {
        setSpeaking(true);
        if (msgId) setActiveSpeakingId(msgId);
      };

      utterance.onend = () => {
        setSpeaking(false);
        setActiveSpeakingId(null);
      };

      utterance.onerror = () => {
        setSpeaking(false);
        setActiveSpeakingId(null);
      };

      synthRef.current.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error', e);
      setSpeaking(false);
      setActiveSpeakingId(null);
    }
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setSpeaking(false);
      setActiveSpeakingId(null);
    }
  };

  const startListening = () => {
    unlockAudio();
    stopSpeaking();
    setVoiceNotice(null);
    lastCapturedSpeechRef.current = '';

    playChime('start');

    const win = window as unknown as Record<string, unknown>;
    const SpeechRecognition = (win.SpeechRecognition || win.webkitSpeechRecognition) as unknown as new () => {
      continuous: boolean;
      interimResults: boolean;
      lang: string;
      onstart: () => void;
      onresult: (e: { resultIndex: number; results: Array<Array<{ transcript: string }> & { isFinal?: boolean }> }) => void;
      onerror: (e: { error: string }) => void;
      onend: () => void;
      start: () => void;
      stop: () => void;
    };

    if (!SpeechRecognition) {
      setVoiceNotice(
        lang === 'te'
          ? 'మీ బ్రౌజర్‌లో తెలుగు మైక్రోఫోన్ కనుగొనబడలేదు. క్రింది తెలుగు వాయిస్ బటన్లపై నొక్కండి!'
          : 'Speech API not detected in browser. Simulating Telugu voice command!'
      );
      setListening(true);
      setTimeout(() => {
        setListening(false);
        const samplePrompt = 'నా టోకెన్ సంఖ్య మరియు క్యూ స్థానం వివరాలు చెప్పండి';
        handleUserSend(samplePrompt, true);
      }, 1500);
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          (recognitionRef.current as { stop: () => void }).stop();
        } catch {
          /* ignore */
        }
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = lang === 'te' ? 'te-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';

      recognition.onstart = () => {
        setListening(true);
      };

      recognition.onresult = (event: { resultIndex: number; results: Array<Array<{ transcript: string }> & { isFinal?: boolean }> }) => {
        let text = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          text += event.results[i][0].transcript;
        }
        if (text) {
          setInput(text);
          lastCapturedSpeechRef.current = text;
        }
        if (event.results[0] && event.results[0].isFinal) {
          handleUserSend(text, true);
          lastCapturedSpeechRef.current = '';
        }
      };

      recognition.onerror = (event: { error: string }) => {
        setListening(false);
        playChime('error');
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setVoiceNotice(
            lang === 'te'
              ? 'మైక్రోఫోన్ అనుమతి అవసరం. క్రింద ఉన్న ప్రసంగ బటన్లపై నొక్కండి!'
              : 'Microphone permission denied. Click any quick voice prompt below!'
          );
        } else if (event.error === 'no-speech') {
          setVoiceNotice(
            lang === 'te'
              ? 'ఏమీ మాట్లాడలేదు. మరలా మైక్ నొక్కి స్పష్టంగా మాట్లాడండి!'
              : 'No speech detected. Please tap mic and speak clearly!'
          );
        }
      };

      recognition.onend = () => {
        setListening(false);
        if (lastCapturedSpeechRef.current && lastCapturedSpeechRef.current.trim()) {
          const spoken = lastCapturedSpeechRef.current;
          lastCapturedSpeechRef.current = '';
          handleUserSend(spoken, true);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      setListening(false);
      playChime('error');
      console.warn('Failed to start speech recognition', e);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        (recognitionRef.current as { stop: () => void }).stop();
      } catch {
        /* ignore */
      }
      setListening(false);
    }
  };

  // Telugu Intent Classifier & Language Matcher
  const processQueryResponse = (query: string): { reply: string; targetView?: ViewId } => {
    const q = query.toLowerCase().trim();

    // 1. Token & Queue (తెలుగు: టోకెన్, క్యూ, స్థానం, నెంబరు / Telish: naa token, queue, wait time)
    if (
      q.includes('token') ||
      q.includes('టోకెన్') ||
      q.includes('టొకెన్') ||
      q.includes('queue') ||
      q.includes('క్యూ') ||
      q.includes('స్థానం') ||
      q.includes('sthanam') ||
      q.includes('నెంబర్') ||
      q.includes('నెంబరు') ||
      q.includes('number') ||
      q.includes('క్యూలో')
    ) {
      const reply =
        lang === 'te'
          ? `మీ యాక్టివ్ కొనుగోలు టోకెన్ సంఖ్య #${activeToken.token} (${activeToken.crop}). విజయవాడ కేంద్రంలో మీ క్యూ స్థానం #${activeToken.queuePosition}. అంచనా వేచియుండే సమయం కేవలం ${activeToken.estimatedWaitMin} నిమిషాలు.`
          : lang === 'hi'
          ? `आपका सक्रिय टोकन #${activeToken.token} (${activeToken.crop}) है। कतार में आपका स्थान #${activeToken.queuePosition} है और अनुमानित समय ${activeToken.estimatedWaitMin} मिनट है।`
          : `Your active token is #${activeToken.token} (${activeToken.crop}). You are #${activeToken.queuePosition} in queue with ~${activeToken.estimatedWaitMin} mins wait time.`;
      return { reply, targetView: 'token' };
    }

    // 2. MSP & Crop Prices (తెలుగు: వరి మద్దతు ధరలు, ధాన్యాల రేటు / Telish: vari dharalu, msp, patti dhara)
    if (
      q.includes('msp') ||
      q.includes('price') ||
      q.includes('rate') ||
      q.includes('ధర') ||
      q.includes('ధరలు') ||
      q.includes('మద్దతు') ||
      q.includes('రేటు') ||
      q.includes('వరి') ||
      q.includes('పత్తి') ||
      q.includes('మొక్కజొన్న') ||
      q.includes('vari') ||
      q.includes('patti') ||
      q.includes('mokkajonna') ||
      q.includes('paddy') ||
      q.includes('cotton')
    ) {
      const reply =
        lang === 'te'
          ? 'ప్రభుత్వ కనీస మద్దతు ధరలు (MSP): వరి (Grade A) ₹2,300/క్వింటాల్, పత్తి ₹7,125/క్వింటాల్, మరియు మొక్కజొన్న ₹2,250/క్వింటాల్.'
          : lang === 'hi'
          ? 'न्यूनतम समर्थन मूल्य (MSP): धान ₹2,300/क्विंटल, कपास ₹7,125/क्विंटल, मक्का ₹2,250/क्विंटल।'
          : 'Government MSP Rates: Paddy (Grade A) ₹2,300/quintal, Cotton ₹7,125/quintal, and Maize ₹2,250/quintal.';
      return { reply, targetView: 'msp' };
    }

    // 3. Payment & Bank Credit (తెలుగు: డబ్బులు, బ్యాంక్ ఖాతా, జమ, చెల్లింపు / Telish: naa dabbulu, payment, money, bank)
    if (
      q.includes('payment') ||
      q.includes('money') ||
      q.includes('bank') ||
      q.includes('డబ్బు') ||
      q.includes('డబ్బులు') ||
      q.includes('ఖాతా') ||
      q.includes('జమ') ||
      q.includes('సొమ్ము') ||
      q.includes('చెల్లింపు') ||
      q.includes('dabbulu') ||
      q.includes('khata') ||
      q.includes('jama') ||
      q.includes('dbt')
    ) {
      const reply =
        lang === 'te'
          ? 'మీ పంట కొనుగోలు సొమ్ము ₹92,400 నేరుగా మీ బ్యాంక్ ఖాతా (SBI ****4321) నందు DBT ద్వారా విజయవంతంగా జమ చేయబడింది.'
          : lang === 'hi'
          ? 'आपकी फसल का ₹92,400 का भुगतान आपके बैंक खाते (SBI ****4321) में जमा कर दिया गया है।'
          : 'Your procurement payment of ₹92,400 has been successfully credited to your bank account via direct DBT.';
      return { reply, targetView: 'payment' };
    }

    // 4. Center & Distance / Crowd (తెలుగు: కొనుగోలు కేంద్రం, దగ్గర్లో, రద్దీ, విజయవాడ / Telish: daggarlo, kendram, map)
    if (
      q.includes('center') ||
      q.includes('map') ||
      q.includes('near') ||
      q.includes('కేంద్రం') ||
      q.includes('కేంద్రాలు') ||
      q.includes('సమీప') ||
      q.includes('దగ్గర') ||
      q.includes('దగ్గర్లో') ||
      q.includes('దూరం') ||
      q.includes('రద్దీ') ||
      q.includes('విజయవాడ') ||
      q.includes('గుంటూరు') ||
      q.includes('daggarlo') ||
      q.includes('kendram')
    ) {
      const reply =
        lang === 'te'
          ? 'మీకు సమీపంలోని విజయవాడ కొనుగోలు కేంద్రం 3.8 కి.మీ దూరంలో ఉంది. గుంటూరు కేంద్రంలో ప్రస్తుతం రద్దీ చాలా తక్కువగా ఉంది (వేచియుండే సమయం 18 నిమిషాలు).'
          : lang === 'hi'
          ? 'विजयवाड़ा खरीद केंद्र 3.8 किमी दूरी पर है। गुंटूर केंद्र पर अभी सबसे कम भीड़ है।'
          : 'Vijayawada Procurement Center is 3.8 KM away. Guntur Center currently has the shortest wait time (18 mins).';
      return { reply, targetView: 'map' };
    }

    // 5. Slot & Appointment (తెలుగు: స్లాట్, అపాయింట్‌మెంట్, సమయం, తేదీ / Telish: slot booking, time, eppudu)
    if (
      q.includes('appointment') ||
      q.includes('slot') ||
      q.includes('time') ||
      q.includes('సమయం') ||
      q.includes('అపాయింట్‌మెంట్') ||
      q.includes('తేదీ') ||
      q.includes('ఎప్పుడు') ||
      q.includes('eppudu') ||
      q.includes('booking')
    ) {
      const reply =
        lang === 'te'
          ? `మీ కొనుగోలు అపాయింట్‌మెంట్ ${activeToken.date} న ఉదయం ${activeToken.time} గంటలకు విజయవాడ కేంద్రంలో స్థిరీకరించబడింది.`
          : lang === 'hi'
          ? `आपकी अपॉइंटमेंट ${activeToken.date} को ${activeToken.time} बजे के लिए तय है।`
          : `Your procurement appointment is confirmed for ${activeToken.date} at ${activeToken.time}.`;
      return { reply, targetView: 'dashboard' };
    }

    // 6. Quality & Moisture (తెలుగు: తేమ శాతం, నాణ్యత తనిఖీ / Telish: thema, moisture, quality)
    if (
      q.includes('thema') ||
      q.includes('తేమ') ||
      q.includes('నాణ్యత') ||
      q.includes('తనిఖీ') ||
      q.includes('moisture') ||
      q.includes('quality')
    ) {
      const reply =
        lang === 'te'
          ? 'గరిష్ట ప్రభుత్వ మద్దతు ధర పొందేందుకు వరి ధాన్యంలో తేమ శాతం 14.0% కంటే తక్కువగా ఉండాలి.'
          : lang === 'hi'
          ? 'अधिकतम समर्थन मूल्य के लिए धान में नमी 14.0% से कम होनी चाहिए।'
          : 'For maximum MSP rate, paddy moisture content must be below 14.0%.';
      return { reply, targetView: 'produce' };
    }

    // 7. Telugu Greetings (తెలుగు: నమస్తే, నమస్కారం, హలో)
    if (
      q.includes('నమస్తే') ||
      q.includes('నమస్కారం') ||
      q.includes('హలో') ||
      q.includes('namaste') ||
      q.includes('namaskaram') ||
      q.includes('hello')
    ) {
      const reply =
        lang === 'te'
          ? 'నమస్తే రైతు సోదరా! నేను కిసాన్ మిత్ర. మీ టోకెన్, కొనుగోలు కేంద్రాలు, ధాన్యాల ధరలు లేదా బ్యాంక్ జమల గురించి అడగండి.'
          : 'Namaste! I am Kisan Mitra. Ask me about your token, procurement center crowd, MSP rates, or payment status.';
      return { reply };
    }

    // Default Telugu Fallback
    const reply =
      lang === 'te'
        ? `నేను మీ మాట విన్నాను! "${query}" కు సంబంధించి కిసాన్ కనెక్ట్ వివరాలు పరిశీలిస్తున్నాను.`
        : lang === 'hi'
        ? `मैंने आपकी बात सुनी! "${query}" के लिए जानकारी अपडेट कर दी गई है।`
        : `I heard: "${query}". Retrieving live KisanConnect AI procurement insights for you.`;
    return { reply };
  };

  const handleUserSend = (textToSend?: string, isVoice = false) => {
    unlockAudio();
    const query = textToSend ?? input;
    if (!query.trim()) return;

    stopListening();

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text: query,
      isVoice,
    };

    const botMsgId = `msg-${Date.now() + 1}`;

    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    setTimeout(() => {
      const { reply, targetView } = processQueryResponse(query);

      const botMsg: Message = {
        id: botMsgId,
        role: 'bot',
        text: reply,
      };

      setMessages((prev) => [...prev, botMsg]);

      if (autoSpeech) {
        speakText(reply, botMsgId);
      }

      if (targetView) {
        setTimeout(() => setView(targetView), 1600);
      }
    }, 400);
  };

  // Prominent Telugu Spoken Command Prompts
  const teluguVoicePrompts = [
    { text: 'నా టోకెన్ సంఖ్య ఎంత?', icon: Ticket, label: 'టోకెన్ వివరాలు' },
    { text: 'వరి మద్దతు ధర ఎంత?', icon: IndianRupee, label: 'వరి ధరలు' },
    { text: 'నా డబ్బులు ఎప్పుడు పడతాయి?', icon: Wallet, label: 'బ్యాంక్ జమ' },
    { text: 'దగ్గర్లో ఉన్న కొనుగోలు కేంద్రం', icon: MapPin, label: 'సమీప కేంద్రం' },
    { text: 'నా అపాయింట్‌మెంట్ సమయం', icon: Calendar, label: 'స్లాట్ సమయం' },
    { text: 'వరిలో తేమ శాతం ఎంత ఉండాలి?', icon: Wheat, label: 'తేమ పరిమితి' },
  ];

  const englishVoicePrompts = [
    { text: 'What is my token number?', icon: Ticket, label: 'My Token' },
    { text: 'Check Paddy MSP Price', icon: IndianRupee, label: 'MSP Prices' },
    { text: 'Find nearest center', icon: MapPin, label: 'Nearby Centers' },
    { text: 'Check payment status', icon: Wallet, label: 'Payment Status' },
  ];

  const activePrompts = lang === 'te' ? teluguVoicePrompts : englishVoicePrompts;

  return (
    <>
      {/* Floating activation button */}
      <button
        onClick={() => {
          unlockAudio();
          setMitraOpen(!mitraOpen);
        }}
        className="fixed bottom-20 right-4 z-50 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-leaf-500 to-forest-600 text-white shadow-glow-lg transition-all hover:scale-110 animate-glow-pulse sm:bottom-24 lg:bottom-6 lg:right-6"
        aria-label="Kisan Mitra Voice AI Assistant"
      >
        {mitraOpen ? <X className="h-6 w-6" /> : <Bot className="h-7 w-7" strokeWidth={2} />}
        {!mitraOpen && (
          <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-400 opacity-75" />
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-gold-400" />
          </span>
        )}
      </button>

      {/* Voice Assistant Panel */}
      {mitraOpen && (
        <div className="fixed bottom-36 right-4 z-50 w-[calc(100vw-2rem)] max-w-md origin-bottom-right animate-scale-in sm:bottom-40 lg:bottom-24 lg:right-6">
          <div className="overflow-hidden rounded-4xl glass shadow-glass-lg border border-forest-100/60">
            {/* Header with Language Switcher & Voice Controls */}
            <div className="bg-gradient-to-r from-forest-900 via-forest-800 to-emerald-950 px-5 py-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="relative grid h-10 w-10 place-items-center rounded-2xl bg-white/15 backdrop-blur">
                    <Bot className="h-5 w-5 text-leaf-300" />
                    {speaking && (
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-leaf-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-leaf-400" />
                      </span>
                    )}
                  </span>
                  <div>
                    <p className="font-display text-base font-bold flex items-center gap-2">
                      {lang === 'te' ? 'కిసాన్ మిత్ర (తెలుగు వాయిస్)' : lang === 'hi' ? 'किसान मित्र AI' : 'Kisan Mitra Voice AI'}
                      <Sparkles className="h-4 w-4 text-gold-300" />
                    </p>
                    <p className="flex items-center gap-1.5 text-xs text-leaf-300 font-medium">
                      <span className={`h-2 w-2 rounded-full ${listening ? 'bg-red-400 animate-ping' : speaking ? 'bg-gold-400 animate-pulse' : 'bg-leaf-400'}`} />
                      {listening
                        ? (lang === 'te' ? 'వింటున్నాను… తెలుగులో మాట్లాడండి' : 'Listening... Speak now')
                        : speaking
                        ? (lang === 'te' ? 'వాయిస్ జవాబు ఇస్తున్నాను…' : 'Speaking answer...')
                        : (lang === 'te' ? 'తెలుగు వాయిస్ అసిస్టెంట్ సిద్ధం' : 'Voice Assistant Active')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Language Quick Switch */}
                  <button
                    onClick={() => setLang(lang === 'te' ? 'en' : 'te')}
                    className="flex items-center gap-1 rounded-xl bg-white/15 px-2.5 py-1 text-xs font-bold text-leaf-200 border border-leaf-400/30 hover:bg-white/25 transition"
                    title="Switch Language"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    <span>{lang === 'te' ? 'ENG' : 'తెలుగు'}</span>
                  </button>

                  <button
                    onClick={() => {
                      unlockAudio();
                      if (speaking) stopSpeaking();
                      setAutoSpeech(!autoSpeech);
                    }}
                    title={autoSpeech ? 'Mute AI voice output' : 'Enable AI voice output'}
                    className={`grid h-8 w-8 place-items-center rounded-xl transition ${
                      autoSpeech ? 'bg-leaf-500/30 text-leaf-300 border border-leaf-400/40' : 'bg-white/10 text-forest-300'
                    }`}
                  >
                    {autoSpeech ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => {
                      stopSpeaking();
                      setMitraOpen(false);
                    }}
                    className="grid h-8 w-8 place-items-center rounded-xl bg-white/10 text-white hover:bg-white/20"
                  >
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>

              {/* Listening sound wave visualizer bar */}
              {(listening || speaking) && (
                <div className="mt-3 flex items-center justify-center gap-1 py-1.5 rounded-xl bg-black/30 backdrop-blur border border-white/10">
                  <span className="h-3 w-1 rounded-full bg-leaf-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-5 w-1 rounded-full bg-leaf-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-7 w-1 rounded-full bg-gold-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="h-4 w-1 rounded-full bg-leaf-300 animate-bounce" style={{ animationDelay: '450ms' }} />
                  <span className="h-2 w-1 rounded-full bg-leaf-400 animate-bounce" style={{ animationDelay: '600ms' }} />
                  <span className="ml-2 text-xs font-bold text-gold-200">
                    {listening ? (lang === 'te' ? 'తెలుగు మాటలను రికార్డ్ చేస్తోంది...' : 'Listening to voice...') : (lang === 'te' ? 'తెలుగు వాయిస్ సమాధానం ఇస్తోంది...' : 'Playing voice response aloud...')}
                  </span>
                </div>
              )}
            </div>

            {/* Notice Bar */}
            {voiceNotice && (
              <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs font-semibold text-amber-900 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                <span>{voiceNotice}</span>
              </div>
            )}

            {/* Messages Chat Area */}
            <div className="max-h-72 space-y-3 overflow-y-auto bg-cream-50/60 p-4 scrollbar-hide">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="relative max-w-[85%]">
                    <div
                      className={`rounded-3xl px-4 py-3 text-sm shadow-sm ${
                        m.role === 'user'
                          ? 'bg-leaf-500 text-white font-medium rounded-br-none'
                          : 'glass text-forest-900 font-medium rounded-bl-none border border-forest-100'
                      }`}
                    >
                      <p className="leading-relaxed">{m.text}</p>

                      {/* Bot Audio Replay Button */}
                      {m.role === 'bot' && (
                        <button
                          onClick={() => speakText(m.text, m.id)}
                          className={`mt-2 flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-bold transition shadow-sm ${
                            activeSpeakingId === m.id
                              ? 'bg-gold-400 text-forest-950 animate-pulse'
                              : 'bg-leaf-100 text-leaf-800 hover:bg-leaf-200 border border-leaf-300/60'
                          }`}
                        >
                          <Volume2 className="h-3.5 w-3.5 text-leaf-700" />
                          <span>
                            {activeSpeakingId === m.id
                              ? (lang === 'te' ? 'తెలుగులో మాట్లాడుతోంది...' : 'Speaking...')
                              : (lang === 'te' ? '🔊 తెలుగు వాయిస్ వినండి' : '🔊 Tap to Listen AI Voice')}
                          </span>
                        </button>
                      )}
                    </div>

                    {m.isVoice && (
                      <span className="mt-0.5 block text-[10px] text-forest-500 font-semibold px-2">
                        🎙️ Spoken Command
                      </span>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Spoken Telugu Query Suggestion Chips */}
            <div className="border-t border-forest-100 bg-white/80 px-3 py-2">
              <p className="text-[11px] font-bold text-forest-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Radio className="h-3 w-3 text-leaf-600 animate-pulse" />
                {lang === 'te' ? 'తెలుగులో అడగడానికి నొక్కండి:' : 'Tap to speak voice prompt:'}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {activePrompts.map((sp, idx) => {
                  const Icon = sp.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleUserSend(sp.text, true)}
                      className="flex items-center gap-1.5 rounded-xl border border-forest-200 bg-forest-50/70 px-2.5 py-1.5 text-xs font-bold text-forest-800 hover:bg-leaf-100 hover:border-leaf-300 transition"
                    >
                      <Icon className="h-3.5 w-3.5 text-leaf-600" />
                      <span>{sp.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Input & Microphone Bar */}
            <div className="flex items-center gap-2 border-t border-forest-100 bg-white p-3">
              <button
                onClick={() => {
                  if (listening) {
                    stopListening();
                  } else {
                    startListening();
                  }
                }}
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl transition-all shadow-md ${
                  listening
                    ? 'bg-red-500 text-white animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.6)] scale-110'
                    : 'bg-gradient-to-br from-leaf-500 to-forest-600 text-white hover:scale-105'
                }`}
                title={listening ? 'Stop Microphone' : 'Start Telugu Voice Input'}
              >
                {listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </button>

              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && input.trim() && handleUserSend()}
                placeholder={
                  listening
                    ? (lang === 'te' ? 'మాట్లాడండి... మీ తెలుగు మాటలు రికార్డ్ అవుతున్నాయి' : 'Speak now... recording voice')
                    : (lang === 'te' ? 'తెలుగులో టైప్ చేయండి లేదా మైక్ నొక్కండి...' : 'Type or tap mic to speak...')
                }
                className="min-w-0 flex-1 rounded-2xl border border-forest-200 bg-forest-50/50 px-4 py-2.5 text-sm font-semibold text-forest-900 outline-none focus:ring-2 focus:ring-leaf-400 placeholder:text-forest-400"
              />

              <button
                onClick={() => input.trim() && handleUserSend()}
                disabled={!input.trim()}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-forest-900 text-white disabled:opacity-40 transition hover:bg-forest-800"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
