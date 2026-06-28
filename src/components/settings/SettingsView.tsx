import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, Building, Bell, Save, Lock, Mail } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const SettingsView: React.FC = () => {
  const { profileName, role } = useAuth();
  const [activeTab, setActiveTab] = useState<'account' | 'workspace' | 'notifications'>('account');

  // If Client, maybe we show something else, but prompt is Admin specific.
  if (role === 'client') {
    return <div className="p-8 text-center">Client settings not yet available.</div>;
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account, workspace preferences, and notifications.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Navigation Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('account')}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all text-sm font-semibold ${
                activeTab === 'account' ? 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <User size={18} className={activeTab === 'account' ? 'text-[var(--brand-primary)]' : 'text-gray-400'} />
              <span>My Account</span>
            </button>
            <button
              onClick={() => setActiveTab('workspace')}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all text-sm font-semibold ${
                activeTab === 'workspace' ? 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Building size={18} className={activeTab === 'workspace' ? 'text-[var(--brand-primary)]' : 'text-gray-400'} />
              <span>Workspace</span>
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all text-sm font-semibold ${
                activeTab === 'notifications' ? 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Bell size={18} className={activeTab === 'notifications' ? 'text-[var(--brand-primary)]' : 'text-gray-400'} />
              <span>Notifications</span>
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-6">
          
          {activeTab === 'account' && (
            <div className="animate-in fade-in slide-in-from-right-2 duration-300 space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Profile Information</h3>
                
                <div className="space-y-5">
                  <div className="flex items-center space-x-5">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 text-xl border-2 border-dashed border-gray-300">
                      {profileName?.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                        Change Photo
                      </button>
                      <p className="text-xs text-gray-500 mt-2">JPG or PNG. Max 1MB.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                      <input type="text" defaultValue={profileName || ''} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Studio / Business Name</label>
                      <input type="text" placeholder="e.g. Acme Design Co." className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input type="email" defaultValue="admin@example.com" className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button className="flex items-center space-x-2 bg-[var(--brand-primary)] text-white px-5 py-2.5 rounded-xl font-medium shadow-sm hover:opacity-90 transition-opacity text-sm">
                      <Save size={16} />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Current Password</label>
                    <input type="password" placeholder="••••••••" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">New Password</label>
                    <input type="password" placeholder="••••••••" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm New Password</label>
                    <input type="password" placeholder="••••••••" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]" />
                  </div>
                  <div className="pt-2 flex justify-end">
                    <button className="flex items-center space-x-2 bg-gray-100 text-gray-700 hover:bg-gray-200 px-5 py-2.5 rounded-xl font-medium transition-colors text-sm">
                      <Lock size={16} />
                      <span>Update Password</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'workspace' && (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm animate-in fade-in slide-in-from-right-2 duration-300">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Workspace Preferences</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Default Landing Page</label>
                  <p className="text-xs text-gray-500 mb-3">Where should we take you right after you log in?</p>
                  <select className="w-full sm:w-64 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]">
                    <option value="dashboard">Dashboard</option>
                    <option value="clients">Clients List</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Timezone</label>
                  <p className="text-xs text-gray-500 mb-3">Used for all scheduled publish dates and times.</p>
                  <select className="w-full sm:w-64 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]">
                    <option>UTC (Coordinated Universal Time)</option>
                    <option>America/New_York (EST)</option>
                    <option>America/Los_Angeles (PST)</option>
                    <option>Europe/London (GMT)</option>
                    <option>Europe/Paris (CET)</option>
                  </select>
                </div>

                <div className="pt-4 flex justify-end">
                  <button className="flex items-center space-x-2 bg-[var(--brand-primary)] text-white px-5 py-2.5 rounded-xl font-medium shadow-sm hover:opacity-90 transition-opacity text-sm">
                    <Save size={16} />
                    <span>Save Workspace Settings</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm animate-in fade-in slide-in-from-right-2 duration-300">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Email Notifications</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900">Client Requests Changes</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Email me when a client leaves feedback that requires action.</p>
                  </div>
                  <div className="w-10 h-6 bg-[var(--brand-primary)] rounded-full transition-colors flex items-center px-1 cursor-pointer">
                    <div className="w-4 h-4 bg-white rounded-full translate-x-4"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900">New Comments</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Email me when a client leaves a comment on any content piece.</p>
                  </div>
                  <div className="w-10 h-6 bg-[var(--brand-primary)] rounded-full transition-colors flex items-center px-1 cursor-pointer">
                    <div className="w-4 h-4 bg-white rounded-full translate-x-4"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900">Overdue Tasks</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Email me when a task passes its due date without being completed.</p>
                  </div>
                  <div className="w-10 h-6 bg-[var(--brand-primary)] rounded-full transition-colors flex items-center px-1 cursor-pointer">
                    <div className="w-4 h-4 bg-white rounded-full translate-x-4"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900">Daily Summary</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Email me a daily summary of pending items across all clients.</p>
                  </div>
                  <div className="w-10 h-6 bg-gray-200 rounded-full transition-colors flex items-center px-1 cursor-pointer">
                    <div className="w-4 h-4 bg-white rounded-full translate-x-0"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};)}
    </div>
  );
};
