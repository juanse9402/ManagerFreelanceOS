import React from 'react';
import { LayoutDashboard, Calendar, CheckSquare, Image, CheckCircle, Settings, ChevronDown, Building2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  role: 'admin' | 'client';
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, role }) => {
  const { profileName, activeClientId, setActiveClientId, availableClients } = useAuth();
  
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'calendar', icon: Calendar, label: 'Calendar' },
    { id: 'tasks', icon: CheckSquare, label: 'Tasks' },
    { id: 'preview', icon: Image, label: 'Preview & Feed' },
    { id: 'approvals', icon: CheckCircle, label: 'Approvals' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  const filteredMenu = role === 'client' 
    ? menuItems.filter(item => ['dashboard', 'preview', 'approvals', 'settings'].includes(item.id))
    : menuItems;

  return (
    <div className="w-64 bg-white border-r border-gray-100 flex flex-col font-sans h-full shadow-sm z-10 hidden md:flex">
      <div className="h-16 flex items-center px-6 border-b border-gray-100 shrink-0">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-[var(--brand-primary)] to-[var(--brand-accent)] rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">
            F
          </div>
          <span className="font-bold text-xl tracking-tight text-[var(--text-primary)]">FreelanceOS</span>
        </div>
      </div>
      
      {/* Workspace Selector for Admins */}
      {role === 'admin' && (
        <div className="px-4 py-4 border-b border-gray-100 bg-gray-50/30">
          <div className="flex items-center justify-between mb-1.5 px-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Viewing Workspace</label>
            <button 
              onClick={() => {
                // Open drawer logic needs to be lifted up or handled via global state/context.
                // For now, we dispatch a custom event that App or Layout can listen to.
                window.dispatchEvent(new CustomEvent('open-client-drawer'));
              }}
              className="text-[10px] font-bold text-[var(--brand-primary)] hover:underline uppercase tracking-wider flex items-center"
            >
              + New
            </button>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Building2 size={14} className="text-gray-400" />
            </div>
            <select
              value={activeClientId || ''}
              onChange={(e) => setActiveClientId(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-8 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent transition-all appearance-none cursor-pointer shadow-sm hover:border-gray-300"
            >
              <option value="" disabled>Select a client...</option>
              {availableClients.map(c => (
                <option key={c.id} value={c.id}>{c.full_name || 'Unnamed Client'}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <ChevronDown size={14} className="text-gray-400" />
            </div>
          </div>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">Main Menu</p>
        <nav className="space-y-1.5">
          {filteredMenu.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] font-semibold' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-[var(--brand-primary)]' : 'text-gray-400 group-hover:text-gray-600 transition-colors'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="shrink-0 p-4 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center space-x-3 p-3 rounded-xl bg-white border border-gray-100 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center font-bold text-sm uppercase shrink-0">
            {profileName?.substring(0, 2) || 'US'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate" title={profileName || 'User'}>
              {profileName || 'Loading...'}
            </p>
            <p className="text-xs text-gray-500 capitalize truncate">{role === 'admin' ? 'Pro Plan (Admin)' : 'Client Account'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
