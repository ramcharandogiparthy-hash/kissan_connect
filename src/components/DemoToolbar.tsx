import React, { useState } from 'react';
import { useApp } from '@/lib/app-context';
import { Sparkles, UserCheck, ShieldCheck, Wrench, X, Play, RefreshCw } from 'lucide-react';

export function DemoToolbar() {
  const { userProfile, loginAsDemo, loginStaffWithEmail, loginAdminWithEmail, setView, updateTokenStatus, activeTokenId } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  const switchToRole = async (role: 'farmer' | 'staff' | 'admin') => {
    if (role === 'farmer') {
      loginAsDemo('ravi@kisanconnect.com', 'Ravi Kumar');
      setView('dashboard');
    } else if (role === 'staff') {
      await loginStaffWithEmail('staff@kisanconnect.com', 'charan@1234');
    } else if (role === 'admin') {
      await loginAdminWithEmail('admin1234@gmail.com', 'charan@1234');
    }
  };

  const runEndToEndDemoFlow = async () => {
    setIsSimulating(true);

    // 1. Switch to Farmer
    await switchToRole('farmer');
    setView('token');
    await new Promise((r) => setTimeout(r, 1200));

    // 2. Gate check-in
    updateTokenStatus(activeTokenId, 'Checked-In', 2);
    await new Promise((r) => setTimeout(r, 1200));

    // 3. Switch to Staff for Quality Inspection
    await switchToRole('staff');
    await new Promise((r) => setTimeout(r, 1200));

    // 4. Quality & Procurement Complete
    updateTokenStatus(activeTokenId, 'Completed', 6);
    setView('payment');
    await new Promise((r) => setTimeout(r, 1200));

    // 5. Back to Farmer Dashboard
    await switchToRole('farmer');
    setView('dashboard');

    setIsSimulating(false);
  };

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="fixed top-20 left-4 z-50 flex items-center gap-2 rounded-full bg-forest-950/90 px-3.5 py-2 text-xs font-bold text-leaf-300 backdrop-blur-md shadow-glass-lg border border-leaf-500/30 hover:scale-105 transition-all"
        title="Open Hackathon Demo Bar"
      >
        <Sparkles className="h-4 w-4 text-leaf-400 animate-spin-slow" />
        <span>Hackathon Mode</span>
      </button>
    );
  }

  return (
    <div className="fixed top-16 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 rounded-3xl bg-forest-950/95 p-3.5 text-white shadow-2xl backdrop-blur-xl border border-leaf-400/30 animate-slide-in-top">
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-xl bg-leaf-500/20 text-leaf-400">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <h4 className="font-display text-xs font-bold text-leaf-300">Hackathon Judge Toolbar</h4>
            <p className="text-[10px] text-forest-300">Switch roles & test 1-click end-to-end procurement</p>
          </div>
        </div>
        <button
          onClick={() => setCollapsed(true)}
          className="rounded-lg p-1 text-forest-400 hover:bg-white/10 hover:text-white transition"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
          <button
            onClick={() => switchToRole('farmer')}
            className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 font-semibold transition ${
              userProfile?.role === 'farmer'
                ? 'bg-leaf-500 text-white shadow-glow'
                : 'bg-white/5 text-forest-200 hover:bg-white/10'
            }`}
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span>Farmer</span>
          </button>

          <button
            onClick={() => switchToRole('staff')}
            className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 font-semibold transition ${
              userProfile?.role === 'staff'
                ? 'bg-emerald-600 text-white shadow-glow'
                : 'bg-white/5 text-forest-200 hover:bg-white/10'
            }`}
          >
            <Wrench className="h-3.5 w-3.5" />
            <span>Staff</span>
          </button>

          <button
            onClick={() => switchToRole('admin')}
            className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 font-semibold transition ${
              userProfile?.role === 'admin'
                ? 'bg-amber-500 text-white shadow-glow'
                : 'bg-white/5 text-forest-200 hover:bg-white/10'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Admin</span>
          </button>
        </div>

        <button
          onClick={runEndToEndDemoFlow}
          disabled={isSimulating}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-leaf-500 to-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-glow hover:scale-105 active:scale-95 transition disabled:opacity-50"
        >
          {isSimulating ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Play className="h-3.5 w-3.5 fill-current" />
          )}
          <span>Demo Flow</span>
        </button>
      </div>
    </div>
  );
}
