import React, { useState } from 'react';
import { Bell, Search, LogOut, X } from 'lucide-react';
import { useTheme } from '../../theme/ThemeContext';
import type { UserRole } from '../../App';
import { supabase } from '../../lib/supabase';

interface HeaderProps {
  role: UserRole;
}

export const Header: React.FC<HeaderProps> = ({ role }) => {
  const { theme, setTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  const { activeClientId, availableClients } = useAuth();
  const activeClient = availableClients.find(c => c.id === activeClientId);

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
      <div className="flex items-center">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search projects, tasks..." 
            className="pl-9 pr-4 py-2 w-64 bg-gray-50 border-none rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition-all placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Active Client Indicator (Read-only) */}
        {role === 'admin' && activeClient && (
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100">
            <div 
              className="w-4 h-4 rounded-full shadow-sm"
              style={{ backgroundColor: activeClient.brand_settings?.primaryColor || '#8B5CF6' }}
            ></div>
            <span className="text-xs font-semibold text-gray-700 truncate max-w-[120px]">
              {activeClient.full_name}
            </span>
          </div>
        )}

        {/* Log Out Button */}
        <button 
          onClick={async () => await supabase.auth.signOut()}
          className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs font-semibold text-gray-700 transition-colors"
          title="Sign out"
        >
          <LogOut size={14} />
          <span>Log out ({role})</span>
        </button>

        <div className="relative">
          <button 
            onClick={() => {
              setShowNotifications(!showNotifications);
              setHasUnread(false);
            }}
            className={`relative p-2 rounded-full transition-colors ${showNotifications ? 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]' : 'text-gray-500 hover:text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10'}`}
          >
            <Bell size={20} />
            {hasUnread && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--brand-accent)] rounded-full border-2 border-white"></span>
            )}
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                  <h3 className="font-bold text-gray-900">Notifications</h3>
                  <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-gray-600">
                    <X size={16} />
                  </button>
                </div>
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                  <div className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 text-sm">
                      📝
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">New content to review</p>
                      <p className="text-xs text-gray-500 mt-0.5">The design team has uploaded a new reel for Instagram.</p>
                      <p className="text-[10px] text-gray-400 mt-1">2 hours ago</p>
                    </div>
                  </div>
                  <div className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 text-sm">
                      ✅
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Post published</p>
                      <p className="text-xs text-gray-500 mt-0.5">The "Marketing Tips" carousel was successfully published.</p>
                      <p className="text-[10px] text-gray-400 mt-1">5 hours ago</p>
                    </div>
                  </div>
                  <div className="p-4 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0 text-sm">
                      👋
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Welcome to Manager OS!</p>
                      <p className="text-xs text-gray-500 mt-0.5">Set up your profile and connect your social networks to start.</p>
                      <p className="text-[10px] text-gray-400 mt-1">Yesterday</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 border-t border-gray-50 bg-gray-50 text-center">
                  <button 
                    onClick={() => setShowNotifications(false)}
                    className="text-xs font-semibold text-[var(--brand-primary)] hover:text-[var(--brand-primary)]/80"
                  >
                    Mark all as read
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
