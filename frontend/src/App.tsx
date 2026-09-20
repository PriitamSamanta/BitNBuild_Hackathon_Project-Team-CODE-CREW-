'use client';

import { useCallback, useEffect, useState } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import { Sidebar, type PageId } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { NotificationPanel } from '@/components/NotificationPanel';
import { CreateIncidentModal } from '@/components/CreateIncidentModal';
import { AIAssistantWidget } from '@/components/AIAssistantWidget';

import { Dashboard } from '@/views/Dashboard';
import { Incidents } from '@/views/Incidents';
import { IncidentDetail } from '@/views/IncidentDetail';
import { LiveMapPage } from '@/views/LiveMapPage';
import { Resources } from '@/views/Resources';
import { Teams } from '@/views/Teams';
import { Hospitals } from '@/views/Hospitals';
import { AIAssistantPage } from '@/views/AIAssistantPage';
import { Analytics } from '@/views/Analytics';
import { RiskHeatmap } from '@/views/RiskHeatmap';
import { Alerts } from '@/views/Alerts';
import { Settings } from '@/views/Settings';
import { NotificationsPage } from '@/views/NotificationsPage';

import { UserHeader, type UserPageId } from '@/components/user/UserHeader';
import { UserSidebar } from '@/components/user/UserSidebar';
import { SOSModal } from '@/components/user/SOSModal';

import { UserDashboard } from '@/views/user/UserDashboard';
import { CitizenPortal } from '@/components/citizen/citizen-portal';
import { ReportIncident } from '@/views/user/ReportIncident';
import { MyReports } from '@/views/user/MyReports';
import { UserMap } from '@/views/user/UserMap';
import { NearbyHospitals } from '@/views/user/NearbyHospitals';
import { EmergencyContacts } from '@/views/user/EmergencyContacts';
import { UserNotifications } from '@/views/user/UserNotifications';
import { UserSettings } from '@/views/user/UserSettings';

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

function CitizenApp() {
  const [page, setPage] = useState<UserPageId>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sosOpen, setSosOpen] = useState(false);
  const [trackedIncidentId, setTrackedIncidentId] = useState<string | undefined>();

  const handleNavigate = useCallback((p: UserPageId) => {
    setPage(p);
  }, []);

  const handleOpenReport = useCallback((id: string) => {
    setTrackedIncidentId(id);
    setPage('tracking');
  }, []);

  const renderCitizenPage = () => {
    switch (page) {
      case 'dashboard':
        return <UserDashboard onNavigate={handleNavigate} onOpenSOS={() => setSosOpen(true)} />;
      case 'report':
        return <ReportIncident onNavigate={handleNavigate} onIncidentReported={handleOpenReport} />;
      case 'tracking':
        return <MyReports onNavigate={handleNavigate} initialIncidentId={trackedIncidentId} />;
      case 'map':
        return <UserMap onNavigate={handleNavigate} onOpenReport={handleOpenReport} />;
      case 'hospitals':
        return <NearbyHospitals />;
      case 'contacts':
        return <EmergencyContacts />;
      case 'notifications':
        return <UserNotifications onNavigate={handleNavigate} onOpenReport={handleOpenReport} />;
      case 'settings':
        return <UserSettings />;
      default:
        return <UserDashboard onNavigate={handleNavigate} onOpenSOS={() => setSosOpen(true)} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-navy-deep">
      <UserSidebar
        current={page}
        onNavigate={handleNavigate}
        onOpenSOS={() => setSosOpen(true)}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <UserHeader
          current={page}
          onNavigate={handleNavigate}
          onOpenSOS={() => setSosOpen(true)}
          onOpenSidebar={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{renderCitizenPage()}</main>
      </div>
      <SOSModal
        open={sosOpen}
        onClose={() => setSosOpen(false)}
        onSuccess={(id) => handleOpenReport(id)}
      />
    </div>
  );
}

function MainContent() {
  const { userRole } = useApp();

  if (userRole === 'user') {
    return <CitizenPortal />;
  }

  return <CommandCenter />;
}

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

