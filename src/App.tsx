import { AppProvider, useApp } from '@/lib/app-context';
import { Navbar, MobileNav } from '@/components/Navbar';
import { KisanMitra } from '@/components/KisanMitra';
import { HelpButton, Notifications } from '@/components/HelpButton';
import { LandingView } from '@/views/LandingView';
import { DashboardView } from '@/views/DashboardView';
import { ProduceView } from '@/views/ProduceView';
import { MapView } from '@/views/MapView';
import { TokenView } from '@/views/TokenView';
import { PaymentView } from '@/views/PaymentView';
import { QualityView } from '@/views/QualityView';
import { AnalyticsView } from '@/views/AnalyticsView';
import { AuthView } from '@/views/AuthView';
import { MSPView } from '@/views/MSPView';
import { StaffView } from '@/views/StaffView';
import { AdminView } from '@/views/AdminView';

function CurrentView() {
  const { view, userProfile } = useApp();

  // MANDATORY LOGIN GATE: Without authentication, users cannot enter any part of the website
  if (!userProfile) {
    return <AuthView />;
  }

  if (view === 'home') return <LandingView />;

  // Admin route protection
  if (view === 'admin') {
    if (!userProfile || userProfile.role !== 'admin' || (userProfile.status !== 'active' && userProfile.status !== 'approved')) {
      return <AuthView />;
    }
    return <AdminView />;
  }

  // Staff route protection
  if (view === 'staff') {
    if (!userProfile || userProfile.role !== 'staff') {
      return <AuthView />;
    }

    if (userProfile.status === 'pending') {
      return (
        <div className="mx-auto max-w-lg px-4 pt-32 pb-24 text-center">
          <div className="rounded-5xl glass p-8 shadow-glass-lg border border-amber-300">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-amber-100 text-amber-700">
              🟡
            </div>
            <h2 className="mt-4 font-display text-2xl font-bold text-forest-950">Registration Pending Approval</h2>
            <p className="mt-2 text-xs text-forest-600">
              Your staff registration application has been received and is awaiting verification by KisanConnect Master Admin.
            </p>
          </div>
        </div>
      );
    }

    if (userProfile.status === 'rejected') {
      return (
        <div className="mx-auto max-w-lg px-4 pt-32 pb-24 text-center">
          <div className="rounded-5xl glass p-8 shadow-glass-lg border border-rose-300">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-rose-100 text-rose-700">
              🔴
            </div>
            <h2 className="mt-4 font-display text-2xl font-bold text-forest-950">Staff Registration Rejected</h2>
            <p className="mt-2 text-xs text-rose-700 font-semibold">
              Your registration application was reviewed and rejected. Please contact your department HR for details.
            </p>
          </div>
        </div>
      );
    }

    if (userProfile.status === 'suspended') {
      return (
        <div className="mx-auto max-w-lg px-4 pt-32 pb-24 text-center">
          <div className="rounded-5xl glass p-8 shadow-glass-lg border border-orange-300">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-orange-100 text-orange-700">
              🟠
            </div>
            <h2 className="mt-4 font-display text-2xl font-bold text-forest-950">Account Suspended</h2>
            <p className="mt-2 text-xs text-orange-800 font-semibold">
              Your staff portal account has been suspended by the administrator. Contact your system admin for access restoration.
            </p>
          </div>
        </div>
      );
    }

    return <StaffView />;
  }

  switch (view) {
    case 'dashboard':
      return <DashboardView />;
    case 'produce':
      return <ProduceView />;
    case 'map':
      return <MapView />;
    case 'token':
      return <TokenView />;
    case 'payment':
      return <PaymentView />;
    case 'quality':
      return <QualityView />;
    case 'analytics':
      return <AnalyticsView />;
    case 'msp':
      return <MSPView />;
    case 'auth':
      return <AuthView />;
    default:
      return <LandingView />;
  }
}

function Shell() {
  const showChrome = true;

  return (
    <div className="min-h-screen bg-cream-50">
      {showChrome && <Navbar />}
      <Notifications />
      <main>
        <CurrentView />
      </main>
      <KisanMitra />
      <HelpButton />
      <MobileNav />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
