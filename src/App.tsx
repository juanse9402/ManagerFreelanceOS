import { useState } from 'react';
import { ThemeProvider } from './theme/ThemeContext';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './components/dashboard/Dashboard';
import { CalendarView } from './components/calendar/Calendar';
import { TasksView } from './components/tasks/TasksView';
import { PreviewView } from './components/preview/PreviewView';
import { SettingsView } from './components/settings/SettingsView';
import { ApprovalsView } from './components/approvals/ApprovalsView';

export type UserRole = 'admin' | 'client';

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [role, setRole] = useState<UserRole>('admin');

  return (
    <ThemeProvider>
      <Layout activeView={activeView} setActiveView={setActiveView} role={role} setRole={setRole}>
        {activeView === 'dashboard' && <Dashboard />}
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
