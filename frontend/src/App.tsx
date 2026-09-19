'use client';

import { useCallback, useEffect, useState } from 'react';
import { AppProvider, useApp } from '@/src/context/AppContext';
import { Sidebar, type PageId } from '@/src/components/Sidebar';
import { Header } from '@/src/components/Header';
import { NotificationPanel } from '@/src/components/NotificationPanel';
import { CreateIncidentModal } from '@/src/components/CreateIncidentModal';
import { AIAssistantWidget } from '@/src/components/AIAssistantWidget';
import { Dashboard } from '@/src/pages/Dashboard';
import { Incidents } from '@/src/pages/Incidents';
import { IncidentDetail } from '@/src/pages/IncidentDetail';
import { LiveMapPage } from '@/src/pages/LiveMapPage';
import { Resources } from '@/src/pages/Resources';
import { Teams } from '@/src/pages/Teams';
import { Hospitals } from '@/src/pages/Hospitals';
import { AIAssistantPage } from '@/src/pages/AIAssistantPage';
import { Analytics } from '@/src/pages/Analytics';
import { RiskHeatmap } from '@/src/pages/RiskHeatmap';
import { Alerts } from '@/src/pages/Alerts';
import { Settings } from '@/src/pages/Settings';
import { NotificationsPage } from '@/src/pages/NotificationsPage';

function CommandCenter() {
  const { incidents } = useApp();
  const [page, setPage] = useState<PageId>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [openIncidentId, setOpenIncidentId] = useState<string | null>(null);

  const handleNavigate = useCallback((p: PageId) => {
    setPage(p);
    setOpenIncidentId(null);
  }, []);

  const handleOpenIncident = useCallback((id: string) => {
    setOpenIncidentId(id);
    setPage('incidents');
  }, []);

  useEffect(() => {
    (window as Window & { __resq_open_incident?: (id: string) => void }).__resq_open_incident = handleOpenIncident;
    return () => {
      delete (window as Window & { __resq_open_incident?: (id: string) => void }).__resq_open_incident;
    };
  }, [handleOpenIncident]);

  const openIncident = openIncidentId ? incidents.find((i) => i.id === openIncidentId) : undefined;

  const renderPage = () => {
    if (openIncident) {
      return <IncidentDetail incident={openIncident} onBack={() => setOpenIncidentId(null)} onOpenIncident={handleOpenIncident} />;
    }
    switch (page) {
      case 'dashboard': return <Dashboard onNavigate={handleNavigate} onOpenIncident={handleOpenIncident} />;
      case 'incidents': return <Incidents onOpenIncident={handleOpenIncident} />;
      case 'map': return <LiveMapPage onOpenIncident={handleOpenIncident} />;
      case 'resources': return <Resources />;
      case 'teams': return <Teams onOpenIncident={handleOpenIncident} />;
      case 'hospitals': return <Hospitals />;
      case 'ai': return <AIAssistantPage />;
      case 'analytics': return <Analytics />;
      case 'heatmap': return <RiskHeatmap />;
      case 'alerts': return <Alerts />;
      case 'notifications': return <NotificationsPage onNavigate={handleNavigate} onOpenIncident={handleOpenIncident} />;
      case 'settings': return <Settings />;
      default: return <Dashboard onNavigate={handleNavigate} onOpenIncident={handleOpenIncident} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-navy-deep">
      <Sidebar current={page} onNavigate={handleNavigate} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onNavigate={handleNavigate} onCreateIncident={() => setCreateOpen(true)} onOpenNotifications={() => setNotifOpen(true)} onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{renderPage()}</main>
      </div>
      <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} onNavigate={handleNavigate} onOpenIncident={handleOpenIncident} />
      <CreateIncidentModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={handleOpenIncident} />
      <AIAssistantWidget />
    </div>
  );
}

export default function App() {
  return <AppProvider><CommandCenter /></AppProvider>;
}
