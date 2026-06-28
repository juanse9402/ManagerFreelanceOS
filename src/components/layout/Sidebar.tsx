import React from 'react';
import { LayoutDashboard, Calendar, CheckSquare, Image, CheckCircle, Settings, ChevronDown, Building2, Users, Palette, Megaphone, FolderKanban, Grid } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  role: 'admin' | 'client';
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, role }) => {
  const { profileName, activeClientId, setActiveClientId, availableClients, clientProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  
  const brandSettings = clientProfile?.brand_settings || {};
  const brandName = clientProfile?.company_name || profileName.split(' ')[0] || 'Brand';
  
  const workflowItems = [
    { id: 'clients', icon: Users, label: 'Clients' },
    { id: 'brand', icon: Palette, label: 'Brand Setup' },
    { id: 'campaigns', icon: Megaphone, label: 'Campaigns' },
    { id: 'tasks', icon: CheckSquare, label: 'Tasks' },
    { id: 'calendar', icon: Calendar, label: 'Calendar' },
    { id: 'preview', icon: Image, label: 'Preview' },
    { id: 'approvals', icon: CheckCircle, label: 'Approvals' },
  ];

  const accountItems = [
    { id: 'settings', icon: Settings, label: 'Settings' },
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  ];

  const clientMenu = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
    { id: 'campaigns', icon: FolderKanban, label: 'Campaigns' },
    { id: 'tasks', icon: CheckSquare, label: 'Tasks' },
    { id: 'calendar', icon: Calendar, label: 'Calendar' },
    { id: 'preview', icon: Grid, label: 'Preview' },
  ];

  const renderNavButton = (item: { id: string; icon: React.ElementType; label: string }) => {
    const Icon = item.icon;
    const isActive = activeView === item.id;
    return (
      <button
        key={item.id}
        onClick={() => setActiveView(item.id)}
        className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all duration-200 group ${
          isActive 
            ? 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] font-semibold' 
            : 'text-gray-500 hover:bg-gray-50 hover:text-[var(--brand-primary)]'
        }`}
      >
        <Icon size={18} className={isActive ? 'text-[var(--brand-primary)]' : 'text-gray-400 group-hover:text-[var(--brand-primary)]/70 transition-colors'} />
        <span>{item.label}</span>
      </button>
    );
  };

  const renderMobileNavButton = (item: { id: string; icon: React.ElementType; label: string }) => {
    const Icon = item.icon;
    const isActive = activeView === item.id;
    return (
      <button
        key={item.id}
        onClick={() => setActiveView(item.id)}
        className={`flex-1 flex flex-col items-center justify-center space-y-1 transition-colors ${
          isActive ? 'text-[var(--brand-primary)]' : 'text-gray-400'
        }`}
      >
        <Icon size={20} className={isActive ? 'text-[var(--brand-primary)]' : 'text-gray-400'} />
        <span className="text-[10px] font-medium">{item.label}</span>
      </button>
    );
  };

  if (role === 'client') {
    return (
      <>
        {/* Desktop Sidebar */}
        <div className="w-64 bg-white border-r border-gray-100 flex-col font-sans h-full shadow-sm z-10 hidden md:flex">
          {/* Brand Header */}
          <div className="flex flex-col items-center pt-8 pb-6 px-6 border-b border-gray-100 shrink-0">
            {brandSettings.logo_url ? (
              <img src={brandSettings.logo_url} alt="Logo" className="w-16 h-16 rounded-xl object-cover mb-3 shadow-sm border border-gray-100" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center mb-3 text-gray-400 border border-gray-200">
                <span className="text-xl font-bold">{brandName.charAt(0)}</span>
              </div>
            )}
            <h2 className="text-lg font-bold text-gray-900 tracking-tight" style={brandSettings.font ? { fontFamily: `"${brandSettings.font}", sans-serif` } : {}}>{brandName}</h2>
          </div>

          <div className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar">
            <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">MY PORTAL</p>
            <nav className="space-y-1.5">
              {clientMenu.map(renderNavButton)}
            </nav>
          </div>

          <div className="shrink-0 p-4 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-gray-100 shadow-sm">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center font-bold text-sm uppercase shrink-0">
                  {profileName?.substring(0, 2) || 'CL'}
                </div>
                <div className="flex-1 min-w-0 pr-2">
                  <p className="text-sm font-semibold text-gray-900 truncate" title={profileName || 'Client User'}>
                    {profileName || 'Client User'}
                  </p>
                  <p className="text-xs text-gray-500 capitalize truncate">Client Portal</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveView('settings')}
                className="p-2 rounded-lg text-gray-400 hover:text-[var(--brand-primary)] hover:bg-gray-50 transition-colors shrink-0"
                title="Settings"
              >
                <Settings size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Bottom Nav */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50 px-2 pb-safe">
          <nav className="flex items-center justify-around h-16">
            {clientMenu.map(renderMobileNavButton)}
            <button
              onClick={() => setActiveView('settings')}
              className={`flex-1 flex flex-col items-center justify-center space-y-1 transition-colors ${
                activeView === 'settings' ? 'text-[var(--brand-primary)]' : 'text-gray-400'
              }`}
            >
              <Settings size={20} className={activeView === 'settings' ? 'text-[var(--brand-primary)]' : 'text-gray-400'} />
              <span className="text-[10px] font-medium">Settings</span>
            </button>
          </nav>
        </div>
      </>
    );
  }

  // Admin Sidebar
  return (
    <>
      <div className="w-64 bg-white border-r border-gray-100 flex-col font-sans h-full shadow-sm z-10 hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-gray-100 shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-[var(--brand-primary)] to-[var(--brand-accent)] rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">
              F
            </div>
            <span className="font-bold text-xl tracking-tight text-[var(--text-primary)]">FreelanceOS</span>
          </div>
        </div>
        
        {/* Workspace Selector for Admins */}
        <div className="px-4 py-4 border-b border-gray-100 bg-gray-50/30">
          <div className="flex items-center justify-between mb-1.5 px-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">WORKSPACE</label>
          </div>
          <div className="relative mb-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Building2 size={14} className="text-gray-400" />
            </div>
            <select
              value={activeClientId || ''}
              onChange={(e) => {
                const newId = e.target.value;
                setActiveClientId(newId);
                
                const pathParts = location.pathname.split('/');
                if (pathParts[2] === 'clients' && pathParts[3]) {
                  pathParts[3] = newId;
                  
                  if (pathParts[4] === 'campaigns' && pathParts.length > 5) {
                    navigate(`/${pathParts[1]}/clients/${newId}/campaigns`);
                  } else {
                    navigate(pathParts.join('/'));
                  }
                }
              }}
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
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('open-client-drawer'))}
            className="w-full text-center py-2 text-sm font-semibold text-[var(--brand-primary)] border border-dashed border-[var(--brand-primary)]/30 rounded-lg hover:bg-[var(--brand-primary)]/5 transition-colors flex items-center justify-center"
          >
            + New Client
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar">
          <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">WORKFLOW</p>
          <nav className="space-y-1.5 mb-6">
            {workflowItems.map(renderNavButton)}
          </nav>
          <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">ACCOUNT</p>
          <nav className="space-y-1.5">
            {accountItems.map(renderNavButton)}
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
              <p className="text-xs text-gray-500 capitalize truncate">Pro Plan (Admin)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50 px-2 pb-safe flex justify-around">
        <nav className="flex items-center justify-around h-16 w-full max-w-md mx-auto">
          {workflowItems.slice(0, 4).map(renderMobileNavButton)}
          <button
            onClick={() => setActiveView('settings')}
            className={`flex-1 flex flex-col items-center justify-center space-y-1 transition-colors ${
              activeView === 'settings' ? 'text-[var(--brand-primary)]' : 'text-gray-400'
            }`}
          >
            <Settings size={20} className={activeView === 'settings' ? 'text-[var(--brand-primary)]' : 'text-gray-400'} />
            <span className="text-[10px] font-medium">Settings</span>
          </button>
        </nav>
      </div>
    </>
  );
};
