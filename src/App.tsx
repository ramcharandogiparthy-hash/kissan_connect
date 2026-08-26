import { AppProvider, useApp } from '@/lib/app-context';
import { Navbar, MobileNav } from '@/components/Navbar';
import { KisanMitra } from '@/components/KisanMitra';
import { HelpButton, Notifications } from '@/components/HelpButton';
import { LandingView } from '@/views/LandingView';
import { DashboardView } from '@/views/DashboardView';
import { MapView } from '@/views/MapView';
import { TokenView } from '@/views/TokenView';
import { PaymentView } from '@/views/PaymentView';
import { AnalyticsView } from '@/views/AnalyticsView';
import { AuthView } from '@/views/AuthView';
import { MSPView } from '@/views/MSPView';
import type { ViewId } from '@/lib/data';

const PROTECTED: ViewId[] = ['dashboard', 'msp', 'map', 'token', 'payment', 'analytics'];

function CurrentView() {
  const { view, session } = useApp();

  if (view === 'home') return <LandingView />;

  if (PROTECTED.includes(view) && !session) {
    return <AuthView />;
  }

  switch (view) {
    case 'dashboard':
      return <DashboardView />;
    case 'map':
      return <MapView />;
    case 'token':
      return <TokenView />;
    case 'payment':
      return <PaymentView />;
    case 'analytics':
      return <AnalyticsView />;
    case 'msp':
      return <MSPView />;
    default:
      return <LandingView />;
  }
}

function Shell() {
  const { view } = useApp();
  const showChrome = view !== 'home' || true;

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
