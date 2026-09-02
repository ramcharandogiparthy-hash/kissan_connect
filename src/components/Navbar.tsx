import { useEffect, useState } from 'react';
import { Sprout, Menu, X, Globe, Mic, LayoutDashboard, Ticket, MapPin, Wallet, LogIn, LogOut, IndianRupee } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { LANG_LABELS } from '@/lib/i18n';
import type { Lang, ViewId } from '@/lib/data';

const NAV_ITEMS: { id: ViewId; key: string }[] = [
  { id: 'home', key: 'nav_home' },
  { id: 'dashboard', key: 'nav_dashboard' },
  { id: 'produce', key: 'nav_produce' },
  { id: 'msp', key: 'nav_msp' },
  { id: 'map', key: 'nav_map' },
  { id: 'token', key: 'nav_token' },
  { id: 'quality', key: 'nav_quality' },
  { id: 'payment', key: 'nav_payment' },
  { id: 'analytics', key: 'nav_analytics' },
  { id: 'staff', key: 'nav_staff' },
  { id: 'admin', key: 'nav_admin' },
];

export function Navbar() {
  const { view, setView, lang, setLang, t, userProfile, signOut } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const userName = userProfile?.fullName || (userProfile?.role === 'staff' ? 'Staff Officer' : 'User');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const go = (v: ViewId) => {
    setView(v);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled ? 'glass shadow-glass' : 'bg-transparent'
        }`}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 lg:px-8">
          <button onClick={() => go('home')} className="flex items-center gap-2.5 group">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-leaf-500 to-forest-600 text-white shadow-glow transition-transform group-hover:scale-110">
              <Sprout className="h-5 w-5" strokeWidth={2.5} />
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-display text-lg font-extrabold text-forest-900">
                Kisan<span className="text-leaf-600">Connect</span>
              </span>
              <span className="text-[10px] font-semibold tracking-wider text-forest-500">
                AI PROCUREMENT
              </span>
            </span>
          </button>

          <div className="hidden items-center gap-1 lg:flex">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => go(item.id)}
                className={`relative rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                  view === item.id
                    ? 'text-forest-900'
                    : 'text-forest-600 hover:text-forest-900'
                }`}
              >
                {t(item.key)}
                {view === item.id && (
                  <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-leaf-500" />
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <button
                onClick={() => setLangOpen((o) => !o)}
                className="flex items-center gap-1.5 rounded-xl border border-forest-200 bg-white/60 px-3 py-2 text-sm font-semibold text-forest-700 backdrop-blur transition hover:bg-white"
              >
                <Globe className="h-4 w-4" />
                {LANG_LABELS[lang].native}
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-2 w-52 max-h-80 overflow-y-auto rounded-2xl glass p-1.5 animate-scale-in shadow-glass-lg z-50">
                  {(Object.keys(LANG_LABELS) as Lang[]).map((l) => (
                    <button
                      key={l}
                      onClick={() => {
                        setLang(l);
                        setLangOpen(false);
                      }}
                      className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition ${
                        lang === l
                          ? 'bg-leaf-100 text-leaf-700'
                          : 'text-forest-700 hover:bg-cream-100'
                      }`}
                    >
                      <span className="text-base">{LANG_LABELS[l].flag}</span>
                      {LANG_LABELS[l].native}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {userProfile ? (
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setUserMenuOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-xl border border-forest-200 bg-white/60 px-3 py-2 text-sm font-semibold text-forest-700 backdrop-blur transition hover:bg-white"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-leaf-500 to-forest-600 text-xs font-bold text-white">
                    {userProfile.role === 'admin' ? '🛡️' : userProfile.role === 'staff' ? '👨‍💼' : '👨‍🌾'}
                  </span>
                  <span className="max-w-28 truncate">{userName}</span>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl glass p-1.5 animate-scale-in border border-forest-100 shadow-glass-lg z-50">
                    <div className="border-b border-forest-100 px-3 py-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-forest-400">Signed in as</p>
                      <p className="truncate text-xs font-extrabold text-forest-900">{userProfile.fullName}</p>
                      <span className="chip bg-leaf-100 text-leaf-800 text-[10px] font-bold mt-1">
                        Role: {userProfile.role.toUpperCase()}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        signOut();
                        setUserMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-50 mt-1"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => go('auth')}
                className="hidden rounded-xl bg-leaf-500 px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:bg-leaf-600 sm:inline-flex items-center gap-1.5"
              >
                <LogIn className="h-4 w-4" /> Sign In
              </button>
            )}

            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="grid h-10 w-10 place-items-center rounded-xl border border-forest-200 bg-white/60 text-forest-700 backdrop-blur lg:hidden"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        {mobileOpen && (
          <div className="mx-4 mb-3 rounded-3xl glass p-3 lg:hidden animate-scale-in">
            <div className="grid grid-cols-2 gap-1.5">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => go(item.id)}
                  className={`rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                    view === item.id
                      ? 'bg-leaf-100 text-leaf-700'
                      : 'text-forest-700 hover:bg-cream-100'
                  }`}
                >
                  {t(item.key)}
                </button>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-1.5 border-t border-forest-100 pt-2.5">
              {(Object.keys(LANG_LABELS) as Lang[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-sm font-medium transition ${
                    lang === l ? 'bg-leaf-100 text-leaf-700' : 'text-forest-600'
                  }`}
                >
                  <span>{LANG_LABELS[l].flag}</span>
                  {LANG_LABELS[l].native}
                </button>
              ))}
            </div>
            <div className="mt-2 border-t border-forest-100 pt-2.5">
              {userProfile ? (
                <button
                  onClick={() => { signOut(); setMobileOpen(false); }}
                  className="flex w-full items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out ({userName})
                </button>
              ) : (
                <button
                  onClick={() => { go('auth'); }}
                  className="flex w-full items-center gap-2 rounded-xl bg-leaf-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-leaf-600"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In / Sign Up
                </button>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}

export function MobileNav() {
  const { view, setView, t } = useApp();
  const items: { id: ViewId; icon: typeof Sprout; key: string }[] = [
    { id: 'home', icon: Sprout, key: 'nav_home' },
    { id: 'dashboard', icon: LayoutDashboard, key: 'nav_dashboard' },
    { id: 'msp', icon: IndianRupee, key: 'nav_msp' },
    { id: 'token', icon: Ticket, key: 'nav_token' },
    { id: 'map', icon: MapPin, key: 'nav_map' },
    { id: 'payment', icon: Wallet, key: 'nav_payment' },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
      <div className="mx-3 mb-3 rounded-3xl glass px-2 py-2 shadow-glass-lg">
        <div className="flex items-center justify-around">
          {items.map((item) => {
            const Icon = item.icon;
            const active = view === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setView(item.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex flex-col items-center gap-0.5 rounded-2xl px-3 py-2 transition"
              >
                <span
                  className={`grid h-9 w-9 place-items-center rounded-xl transition-all ${
                    active
                      ? 'bg-leaf-500 text-white shadow-glow scale-110'
                      : 'text-forest-500'
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" strokeWidth={2.2} />
                </span>
                <span
                  className={`text-[10px] font-semibold ${
                    active ? 'text-leaf-700' : 'text-forest-400'
                  }`}
                >
                  {t(item.key)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export function VoiceButton({ className = '' }: { className?: string }) {
  const { startVoiceInput, lang } = useApp();
  const label =
    lang === 'te' ? 'కిసాన్ మిత్ర ని అడగండి' : lang === 'hi' ? 'किसान मित्र से बोलें' : 'Ask Kisan Mitra';

  return (
    <button
      onClick={startVoiceInput}
      className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white bg-forest-900/90 backdrop-blur hover:bg-forest-900 transition shadow-glow ${className}`}
    >
      <Mic className="h-4 w-4 text-leaf-300 animate-pulse" />
      <span>{label}</span>
    </button>
  );
}
