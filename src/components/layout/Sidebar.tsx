import React from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  CheckSquare, 
  MonitorPlay, 
  MessageSquare, 
  Settings 
} from 'lucide-react';
import type { UserRole } from '../../App';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  role: UserRole;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, role }) => {
  const allNavItems = [
    { id: 'dashboard', name: 'Dashboard', icon: <LayoutDashboard size={20} />, roles: ['admin', 'client'] },
    { id: 'calendar', name: 'Calendar', icon: <Calendar size={20} />, roles: ['admin', 'client'] },
    { id: 'tasks', name: 'Tasks', icon: <CheckSquare size={20} />, roles: ['admin'] },
    { id: 'preview', name: 'Preview & Feed', icon: <MonitorPlay size={20} />, roles: ['admin', 'client'] },
    { id: 'approvals', name: 'Approvals', icon: <MessageSquare size={20} />, roles: ['admin', 'client'] },
    { id: 'settings', name: 'Settings', icon: <Settings size={20} />, roles: ['admin'] },
  ];

  const navItems = allNavItems.filter(item => item.roles.includes(role));

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-full shrink-0 shadow-sm hidden md:flex">
      <div className="h-16 flex items-center px-6 border-b border-gray-100">
        <div className="w-8 h-8 rounded bg-[var(--brand-primary)] flex items-center justify-center text-white font-bold text-xl mr-3 shadow-[var(--shadow-card)]">
          F
        </div>
        <span className="font-bold text-[var(--text-primary)] text-lg tracking-tight">FreelanceOS</span>
      </div>
      
      <nav className="flex-1 py-6 px-4 space-y-1">
        <p className="px-2 text-xs font-semibold text-gray-400 mb-4 tracking-wider uppercase">Main Menu</p>
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] font-medium' 
                  : 'text-[var(--text-muted)] hover:bg-gray-50 hover:text-[var(--text-primary)]'
              }`}
            >
              <span className={isActive ? 'text-[var(--brand-primary)]' : 'text-gray-400'}>
                {item.icon}
              </span>
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center space-x-3 px-3 py-2">
          <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
            <img src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="User Avatar" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col text-left overflow-hidden">
            <span className="text-sm font-semibold text-[var(--text-primary)] truncate">Anna Marketer</span>
            <span className="text-xs text-[var(--text-muted)] truncate">Pro Plan</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

