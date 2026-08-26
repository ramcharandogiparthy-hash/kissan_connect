import { useState } from 'react';
import {
  Sprout,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  User,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useApp } from '@/lib/app-context';

const FIELD_IMG =
  'https://images.pexels.com/photos/20313652/pexels-photo-20313652.jpeg?auto=compress&cs=tinysrgb&w=1920';

export function AuthView() {
  const { setView } = useApp();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });
        if (error) throw error;
        // Sign up succeeds — auto session is created (email confirmation off)
        setView('dashboard');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setView('dashboard');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err: any) {
      const msg = err.message ?? 'Something went wrong. Please try again.';
      if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('already been registered')) {
        setError('This email is already registered. Please sign in instead.');
      } else if (msg.toLowerCase().includes('invalid login') || msg.toLowerCase().includes('invalid credentials')) {
        setError('Invalid email or password. Please try again.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={FIELD_IMG} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-forest-900/90 via-forest-800/80 to-forest-700/70" />
        <div className="absolute inset-0 bg-mesh-forest opacity-30" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <button
            onClick={() => setView('home')}
            className="mx-auto mb-8 flex items-center gap-2.5"
          >
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-leaf-500 to-forest-600 text-white shadow-glow">
              <Sprout className="h-6 w-6" strokeWidth={2.5} />
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-display text-2xl font-extrabold text-white">
                Kisan<span className="text-leaf-400">Connect</span>
              </span>
              <span className="text-[10px] font-semibold tracking-wider text-leaf-300">
                AI PROCUREMENT
              </span>
            </span>
          </button>

          {/* Auth card */}
          <div className="rounded-5xl glass p-7 shadow-glass-lg sm:p-8">
            {/* Mode toggle */}
            <div className="mb-6 flex gap-1 rounded-2xl bg-forest-50 p-1">
              <button
                onClick={() => { setMode('login'); setError(null); }}
                className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition ${
                  mode === 'login'
                    ? 'bg-leaf-500 text-white shadow'
                    : 'text-forest-600 hover:text-forest-800'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setMode('signup'); setError(null); }}
                className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition ${
                  mode === 'signup'
                    ? 'bg-leaf-500 text-white shadow'
                    : 'text-forest-600 hover:text-forest-800'
                }`}
              >
                Create Account
              </button>
            </div>

            <div className="mb-5">
              <h1 className="font-display text-2xl font-extrabold text-forest-900">
                {mode === 'login' ? 'Welcome back, Farmer!' : 'Join KisanConnect'}
              </h1>
              <p className="mt-1 text-sm text-forest-600">
                {mode === 'login'
                  ? 'Sign in to manage your procurement tokens and payments.'
                  : 'Create an account to book smart slots and get fair prices.'}
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 animate-fade-up">
                <AlertCircle className="mt-0.5 h-4.5 w-4.5 shrink-0 text-red-500" />
                <p className="text-sm font-medium text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-forest-600">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-forest-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ravi Kumar"
                      className="w-full rounded-2xl border border-forest-100 bg-cream-50 py-3 pl-11 pr-4 text-sm font-medium text-forest-800 outline-none transition placeholder:text-forest-400 focus:border-leaf-400 focus:bg-white focus:ring-2 focus:ring-leaf-200"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-forest-600">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-forest-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="farmer@example.com"
                    className="w-full rounded-2xl border border-forest-100 bg-cream-50 py-3 pl-11 pr-4 text-sm font-medium text-forest-800 outline-none transition placeholder:text-forest-400 focus:border-leaf-400 focus:bg-white focus:ring-2 focus:ring-leaf-200"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-forest-600">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-forest-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full rounded-2xl border border-forest-100 bg-cream-50 py-3 pl-11 pr-4 text-sm font-medium text-forest-800 outline-none transition placeholder:text-forest-400 focus:border-leaf-400 focus:bg-white focus:ring-2 focus:ring-leaf-200"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full text-base disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin" /> Please wait…
                  </>
                ) : (
                  <>
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="h-4.5 w-4.5" />
                  </>
                )}
              </button>
            </form>

            {/* Trust indicator */}
            <div className="mt-5 flex items-center justify-center gap-2 text-xs font-medium text-forest-500">
              <ShieldCheck className="h-3.5 w-3.5 text-leaf-500" />
              Secure • Transparent • Farmer First
            </div>
          </div>

          {/* Back to home */}
          <button
            onClick={() => setView('home')}
            className="mx-auto mt-5 flex items-center gap-1.5 text-sm font-medium text-white/70 transition hover:text-white"
          >
            <ArrowRight className="h-3.5 w-3.5 rotate-180" />
            Back to home
          </button>

          {/* Feature highlights */}
          <div className="mt-6 flex items-center justify-center gap-4 text-white/60">
            {['AI Slots', 'Live Queue', 'Instant Pay'].map((f) => (
              <span key={f} className="flex items-center gap-1 text-xs font-medium">
                <Sparkles className="h-3 w-3 text-leaf-400" />
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
