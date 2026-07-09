import { ThemeProvider } from './theme/ThemeContext';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './components/dashboard/Dashboard';
import { ClientDashboard } from './components/dashboard/ClientDashboard';
import { CalendarView } from './components/calendar/Calendar';
import { TasksView } from './components/tasks/TasksView';
import { PreviewView } from './components/preview/PreviewView';
import { SettingsView } from './components/settings/SettingsView';
import { ApprovalsView } from './components/approvals/ApprovalsView';
import { SharedApprovalView } from './components/approvals/SharedApprovalView';
import { useAuth } from './contexts/AuthContext';
import { LoginView } from './components/auth/LoginView';
import { RegisterView } from './components/auth/RegisterView';
import { ClientOrientation } from './components/auth/ClientOrientation';
import { AdminWizard } from './components/onboarding/AdminWizard';
import { ClientCreationDrawer } from './components/dashboard/ClientCreationDrawer';
import { ClientsList } from './components/clients/ClientsList';
import { ClientDetail } from './components/clients/ClientDetail';
import { BrandSetup } from './components/clients/BrandSetup';
import { CampaignsList } from './components/campaigns/CampaignsList';
import { CampaignDetail } from './components/campaigns/CampaignDetail';
import { TimeTrackingView } from './components/time-tracking/TimeTrackingView';
import { ClientHoursView } from './components/time-tracking/ClientHoursView';
import { PublicReportView } from './components/time-tracking/PublicReportView';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

export type UserRole = 'admin' | 'client';

function AuthenticatedApp() {
  const { role, hasCompletedOrientation, fetchAvailableClients, availableClients, activeClientId } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isClientDrawerOpen, setIsClientDrawerOpen] = useState(false);

  useEffect(() => {
    const handleOpenDrawer = () => setIsClientDrawerOpen(true);
    window.addEventListener('open-client-drawer', handleOpenDrawer);
    return () => window.removeEventListener('open-client-drawer', handleOpenDrawer);
  }, []);

  // First-time Login Logic: If no clients exist, default to /admin/clients
  useEffect(() => {
    if (role === 'admin' && location.pathname === '/admin/dashboard' && availableClients.length === 0) {
      navigate('/admin/clients', { replace: true });
    }
  }, [role, location.pathname, availableClients, navigate]);

  // Redirect logic
  if (role === 'client' && location.pathname.startsWith('/admin')) {
    return <Navigate to="/client/dashboard" replace />;
  }
  if (role === 'admin' && location.pathname.startsWith('/client')) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Determine active view from URL
  const pathParts = location.pathname.split('/');
  let activeView = pathParts[2] || (role === 'admin' && availableClients.length === 0 ? 'clients' : 'dashboard');
  if (role === 'admin' && pathParts[2] === 'clients' && pathParts[4]) {
    activeView = pathParts[4];
  }

  const setActiveView = (view: string) => {
    navigate(`/${role}/${view}`);
  };

  return (
    <>
      <Layout activeView={activeView} setActiveView={setActiveView} role={role!}>
        <Routes>
          <Route path="clients" element={<ClientsList />} />
          <Route path="clients/:id" element={<ClientDetail />} />
          <Route path="clients/:id/brand" element={<BrandSetup />} />
          <Route path="clients/:id/campaigns" element={<CampaignsList />} />
          <Route path="clients/:id/campaigns/:campaignId" element={<CampaignDetail />} />
          
          <Route path="brand" element={
            activeClientId ? <Navigate to={`/admin/clients/${activeClientId}/brand`} replace /> : <Navigate to={`/admin/clients`} replace />
          } />
          
          {/* Client direct routes */}
          <Route path="campaigns" element={
            role === 'client' 
              ? <CampaignsList /> 
              : (activeClientId ? <Navigate to={`/admin/clients/${activeClientId}/campaigns`} replace /> : <Navigate to={`/admin/clients`} replace />)
          } />
          <Route path="campaigns/:campaignId" element={role === 'client' ? <CampaignDetail /> : <Navigate to={`/admin/clients`} replace />} />
          
          <Route path="dashboard" element={role === 'client' ? <ClientDashboard setActiveView={setActiveView} /> : <Dashboard />} />
          <Route path="calendar" element={<CalendarView />} />
          <Route path="tasks" element={<TasksView />} />
          <Route path="time-tracking" element={<TimeTrackingView />} />
          <Route path="hours" element={<ClientHoursView />} />
          <Route path="preview" element={<PreviewView />} />
          <Route path="approvals" element={<ApprovalsView />} />
          <Route path="settings" element={<SettingsView />} />
          
          <Route path="*" element={<Navigate to={role === 'admin' && availableClients.length === 0 ? 'clients' : 'dashboard'} replace />} />
        </Routes>
      </Layout>
      {role === 'client' && !hasCompletedOrientation && <ClientOrientation />}
      {role === 'admin' && !hasCompletedOrientation && <AdminWizard />}
      <ClientCreationDrawer 
        isOpen={isClientDrawerOpen} 
        onClose={() => setIsClientDrawerOpen(false)} 
        onSuccess={() => {
          fetchAvailableClients();
        }}
      />
    </>
  );
}

function App() {
  const { session, loading, role: contextRole, status } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 font-medium text-sm">Cargando...</div>;
  }

  if (!session) {
    return (
      <Routes>
        <Route path="/register" element={<RegisterView />} />
        <Route path="/login" element={<LoginView />} />
        <Route path="/report/:reportId" element={<PublicReportView />} />
        <Route path="/shared-approval/:postId" element={<SharedApprovalView />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  if (status === 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8 font-sans">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-100">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 90 0 11-18 0 9 90 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Waiting for Approval</h2>
          <p className="text-gray-500 mb-6">
            Your account has been created successfully, but an Administrator needs to approve it before you can access the platform.
          </p>
          <button 
            onClick={async () => {
              const { supabase } = await import('./lib/supabase');
              await supabase.auth.signOut();
            }}
            className="w-full flex justify-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <Routes>
        <Route path="/admin/*" element={<AuthenticatedApp />} />
        <Route path="/client/*" element={<AuthenticatedApp />} />
        <Route path="/report/:reportId" element={<PublicReportView />} />
        <Route path="/shared-approval/:postId" element={<SharedApprovalView />} />
        <Route path="*" element={<Navigate to={`/${contextRole}/dashboard`} replace />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
