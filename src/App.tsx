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
  const { session, loading, role: contextRole } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 font-medium text-sm">Cargando...</div>;
  }

  if (!session) {
    return <LoginView />;
  }

  return (
    <ThemeProvider>
      <Layout activeView={activeView} setActiveView={setActiveView} role={contextRole} setRole={() => {}}>
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
