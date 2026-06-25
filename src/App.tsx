import { useState } from 'react';
import { ThemeProvider } from './theme/ThemeContext';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './components/dashboard/Dashboard';
import { CalendarView } from './components/calendar/Calendar';
import { TasksView } from './components/tasks/TasksView';
import { PreviewView } from './components/preview/PreviewView';
import { SettingsView } from './components/settings/SettingsView';
import { ApprovalsView } from './components/approvals/ApprovalsView';
import { useAuth } from './contexts/AuthContext';
import { LoginView } from './components/auth/LoginView';

export type UserRole = 'admin' | 'client';

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const { session, loading, role: contextRole, status } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 font-medium text-sm">Cargando...</div>;
  }

  if (!session) {
    return <LoginView />;
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
      <Layout activeView={activeView} setActiveView={setActiveView} role={contextRole}>
        {activeView === 'dashboard' && <Dashboard setActiveView={setActiveView} />}
        {activeView === 'calendar' && <CalendarView />}
        {activeView === 'tasks' && <TasksView />}
        {activeView === 'preview' && <PreviewView />}
        {activeView === 'approvals' && <ApprovalsView />}
        {activeView === 'settings' && <SettingsView />}
      </Layout>
    </ThemeProvider>
  );
}

export default App;
