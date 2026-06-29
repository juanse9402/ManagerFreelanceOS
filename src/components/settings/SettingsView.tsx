import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTimeTracking } from '../../contexts/TimeTrackingContext';
import { User, Building, Bell, Save, Lock, Mail, HelpCircle, CheckCircle, Clock } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { profileName, role, availableClients } = useAuth();
  const { getClientSettings, saveClientSettings } = useTimeTracking();
  const [activeTab, setActiveTab] = useState<'account' | 'workspace' | 'notifications' | 'support' | 'time-tracking'>('account');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Client Selection for Time Tracking
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  
  // Settings values
  const [weeklyTarget, setWeeklyTarget] = useState<string>('');
  const [hourlyRate, setHourlyRate] = useState<string>('');
  const [currency, setCurrency] = useState<string>('USD');
  const [showBillable, setShowBillable] = useState(true);
  const [showRateInReport, setShowRateInReport] = useState(false);
  const [autoDelivery, setAutoDelivery] = useState(false);
  const [deliveryDay, setDeliveryDay] = useState('Monday');
  const [deliveryTime, setDeliveryTime] = useState('09:00 AM');

  // Pre-fill fields when client or tab changes
  useEffect(() => {
    if (availableClients.length > 0 && !selectedClientId) {
      setSelectedClientId(availableClients[0].id);
    }
  }, [availableClients]);

  useEffect(() => {
    if (!selectedClientId) return;
    const settings = getClientSettings(selectedClientId);
    setWeeklyTarget(settings.weeklyHourTarget?.toString() || '');
    setHourlyRate(settings.defaultRate?.toString() || '');
    setCurrency(settings.currency || 'USD');
    setShowBillable(settings.showBillableToClient !== false); // default to true
    setShowRateInReport(settings.showHourlyRateInReport === true);
    setAutoDelivery(settings.autoDelivery === true);
    setDeliveryDay(settings.deliveryDay || 'Monday');
    setDeliveryTime(settings.deliveryTime || '09:00 AM');
  }, [selectedClientId, activeTab]);

  const handleSaveClientSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId) return;

    saveClientSettings(selectedClientId, {
      weeklyHourTarget: weeklyTarget ? Number(weeklyTarget) : undefined,
      defaultRate: hourlyRate ? Number(hourlyRate) : undefined,
      currency,
      showBillableToClient: showBillable,
      showHourlyRateInReport: showRateInReport,
      autoDelivery,
      deliveryDay,
      deliveryTime
    });

    showToast('Time tracking settings saved! ✓');
  };

  // Avatar State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setAvatarUrl(url);
    }
  };

  // Toggles State
  const [notifs, setNotifs] = useState({
    n1: true, n2: false, n3: true, n4: true, n5: true, n6: false
  });

  const toggleNotif = (key: keyof typeof notifs) => {
    setNotifs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300 relative">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-8 right-8 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center animate-in fade-in slide-in-from-bottom-4 z-50">
          <CheckCircle className="text-green-400 mr-3" size={20} />
          <span className="text-sm font-semibold">{toast}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account preferences and notifications.</p>
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
            
            {role === 'admin' && (
              <button
                onClick={() => setActiveTab('workspace')}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all text-sm font-semibold ${
                  activeTab === 'workspace' ? 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Building size={18} className={activeTab === 'workspace' ? 'text-[var(--brand-primary)]' : 'text-gray-400'} />
                <span>Workspace</span>
              </button>
            )}

            {role === 'admin' && (
              <button
                onClick={() => setActiveTab('time-tracking')}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all text-sm font-semibold ${
                  activeTab === 'time-tracking' ? 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Clock size={18} className={activeTab === 'time-tracking' ? 'text-[var(--brand-primary)]' : 'text-gray-400'} />
                <span>Time Tracking</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all text-sm font-semibold ${
                activeTab === 'notifications' ? 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Bell size={18} className={activeTab === 'notifications' ? 'text-[var(--brand-primary)]' : 'text-gray-400'} />
              <span>Notifications</span>
            </button>

            {role === 'client' && (
              <button
                onClick={() => setActiveTab('support')}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all text-sm font-semibold ${
                  activeTab === 'support' ? 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <HelpCircle size={18} className={activeTab === 'support' ? 'text-[var(--brand-primary)]' : 'text-gray-400'} />
                <span>Support / Help</span>
              </button>
            )}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-6">
          
          {activeTab === 'account' && (
            <div className="animate-in fade-in slide-in-from-right-2 duration-300 space-y-6">
              <div className="bg-white rounded-[var(--radius-card)] p-6 border border-gray-100 shadow-[var(--shadow-card)]">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Profile Information</h3>
                
                <div className="space-y-5">
                  <div className="flex items-center space-x-5">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-gray-200" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 text-xl border-2 border-dashed border-gray-300">
                        {profileName?.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    {role === 'admin' && (
                      <div>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          ref={fileInputRef} 
                          onChange={handleFileChange} 
                        />
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                        >
                          Change Photo
                        </button>
                        <p className="text-xs text-gray-500 mt-2">JPG or PNG. Max 1MB.</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                      <input type="text" defaultValue={profileName || ''} readOnly={role === 'client'} className={`w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none ${role === 'client' ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-gray-50 focus:ring-2 focus:ring-[var(--brand-primary)]'}`} />
                    </div>
                    {role === 'admin' && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Studio / Business Name</label>
                        <input type="text" placeholder="e.g. Acme Design Co." className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]" />
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input type="email" defaultValue={role === 'client' ? 'client@brand.com' : 'admin@example.com'} readOnly={role === 'client'} className={`w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none ${role === 'client' ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-gray-50 focus:ring-2 focus:ring-[var(--brand-primary)]'}`} />
                      </div>
                    </div>
                    {role === 'client' && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
                        <input type="text" defaultValue="Client" readOnly className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none text-gray-500 cursor-not-allowed" />
                      </div>
                    )}
                  </div>

                  {role === 'admin' && (
                    <div className="pt-4 flex justify-end">
                      <button 
                        onClick={() => showToast('Profile settings saved successfully.')}
                        className="flex items-center space-x-2 bg-[var(--brand-primary)] text-white px-5 py-2.5 rounded-xl font-medium shadow-sm hover:opacity-90 transition-opacity text-sm"
                      >
                        <Save size={16} />
                        <span>Save Changes</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-[var(--radius-card)] p-6 border border-gray-100 shadow-[var(--shadow-card)]">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Security</h3>
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
                    <button 
                      onClick={() => showToast('Password updated successfully.')}
                      className="flex items-center space-x-2 bg-gray-100 text-gray-700 hover:bg-gray-200 px-5 py-2.5 rounded-xl font-medium transition-colors text-sm border border-gray-200"
                    >
                      <Lock size={16} />
                      <span>Update Password</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'workspace' && role === 'admin' && (
            <div className="bg-white rounded-[var(--radius-card)] p-6 border border-gray-100 shadow-[var(--shadow-card)] animate-in fade-in slide-in-from-right-2 duration-300">
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
                  <button 
                    onClick={() => showToast('Workspace settings saved.')}
                    className="flex items-center space-x-2 bg-[var(--brand-primary)] text-white px-5 py-2.5 rounded-xl font-medium shadow-sm hover:opacity-90 transition-opacity text-sm"
                  >
                    <Save size={16} />
                    <span>Save Workspace Settings</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'time-tracking' && role === 'admin' && (
            <div className="bg-white rounded-[var(--radius-card)] p-6 border border-gray-100 shadow-[var(--shadow-card)] animate-in fade-in slide-in-from-right-2 duration-300">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Client Time Tracking Configurations</h3>
              
              <form onSubmit={handleSaveClientSettings} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Select Client to Configure</label>
                  <select 
                    value={selectedClientId} 
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full sm:w-64 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] cursor-pointer"
                  >
                    {availableClients.map(c => (
                      <option key={c.id} value={c.id}>{c.full_name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Weekly Target Hours</label>
                    <input 
                      type="number" 
                      value={weeklyTarget}
                      onChange={(e) => setWeeklyTarget(e.target.value)}
                      placeholder="e.g. 10 (Target hours)"
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Hourly Rate ($ / hr)</label>
                    <div className="flex gap-2">
                      <input 
                        type="number" 
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(e.target.value)}
                        placeholder="e.g. 50"
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                        min="0"
                      />
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] cursor-pointer"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="COP">COP (Col$)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900">Show Billable Hours to Client</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Let the client see the split between billable and internal work.</p>
                    </div>
                    <div 
                      onClick={() => setShowBillable(!showBillable)}
                      className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 cursor-pointer ${showBillable ? 'bg-[var(--brand-primary)]' : 'bg-gray-200'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${showBillable ? 'translate-x-4' : 'translate-x-0'}`}></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900">Show Hourly Rate and Value in Reports</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Include the hourly billing rates and total cost inside weekly reports.</p>
                    </div>
                    <div 
                      onClick={() => setShowRateInReport(!showRateInReport)}
                      className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 cursor-pointer ${showRateInReport ? 'bg-[var(--brand-primary)]' : 'bg-gray-200'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${showRateInReport ? 'translate-x-4' : 'translate-x-0'}`}></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900">Automated Weekly Report Delivery</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Automatically compile and email reports directly to client.</p>
                    </div>
                    <div 
                      onClick={() => setAutoDelivery(!autoDelivery)}
                      className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 cursor-pointer ${autoDelivery ? 'bg-[var(--brand-primary)]' : 'bg-gray-200'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${autoDelivery ? 'translate-x-4' : 'translate-x-0'}`}></div>
                    </div>
                  </div>

                  {autoDelivery && (
                    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100 animate-in slide-in-from-top duration-200">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Send every</label>
                        <select 
                          value={deliveryDay}
                          onChange={(e) => setDeliveryDay(e.target.value)}
                          className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none w-full cursor-pointer"
                        >
                          <option value="Monday">Monday</option>
                          <option value="Tuesday">Tuesday</option>
                          <option value="Wednesday">Wednesday</option>
                          <option value="Thursday">Thursday</option>
                          <option value="Friday">Friday</option>
                          <option value="Saturday">Saturday</option>
                          <option value="Sunday">Sunday</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">at time</label>
                        <input 
                          type="text" 
                          value={deliveryTime}
                          onChange={(e) => setDeliveryTime(e.target.value)}
                          className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none w-full"
                          placeholder="e.g. 09:00 AM"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 flex justify-end">
                  <button 
                    type="submit"
                    className="flex items-center space-x-2 bg-[var(--brand-primary)] text-white px-5 py-2.5 rounded-xl font-medium shadow-sm hover:opacity-90 transition-opacity text-sm"
                  >
                    <Save size={16} />
                    <span>Save Client settings</span>
                  </button>
                </div>

              </form>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white rounded-[var(--radius-card)] p-6 border border-gray-100 shadow-[var(--shadow-card)] animate-in fade-in slide-in-from-right-2 duration-300">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Email Notifications</h3>
              
              <div className="space-y-4">
                {role === 'client' ? (
                  <>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <div>
                        <h4 className="font-semibold text-sm text-gray-900">Content Ready for Review</h4>
                        <p className="text-xs text-gray-500 mt-0.5">Email me when new content is ready for my approval.</p>
                      </div>
                      <div 
                        onClick={() => toggleNotif('n1')}
                        className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 cursor-pointer ${notifs.n1 ? 'bg-[var(--brand-primary)]' : 'bg-gray-200'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${notifs.n1 ? 'translate-x-4' : 'translate-x-0'}`}></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <div>
                        <h4 className="font-semibold text-sm text-gray-900">Task Updates</h4>
                        <p className="text-xs text-gray-500 mt-0.5">Email me when a task's status changes.</p>
                      </div>
                      <div 
                        onClick={() => toggleNotif('n2')}
                        className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 cursor-pointer ${notifs.n2 ? 'bg-[var(--brand-primary)]' : 'bg-gray-200'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${notifs.n2 ? 'translate-x-4' : 'translate-x-0'}`}></div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <div>
                        <h4 className="font-semibold text-sm text-gray-900">Client Requests Changes</h4>
                        <p className="text-xs text-gray-500 mt-0.5">Email me when a client leaves feedback that requires action.</p>
                      </div>
                      <div 
                        onClick={() => toggleNotif('n3')}
                        className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 cursor-pointer ${notifs.n3 ? 'bg-[var(--brand-primary)]' : 'bg-gray-200'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${notifs.n3 ? 'translate-x-4' : 'translate-x-0'}`}></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <div>
                        <h4 className="font-semibold text-sm text-gray-900">New Comments</h4>
                        <p className="text-xs text-gray-500 mt-0.5">Email me when a client leaves a comment on any content piece.</p>
                      </div>
                      <div 
                        onClick={() => toggleNotif('n4')}
                        className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 cursor-pointer ${notifs.n4 ? 'bg-[var(--brand-primary)]' : 'bg-gray-200'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${notifs.n4 ? 'translate-x-4' : 'translate-x-0'}`}></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <div>
                        <h4 className="font-semibold text-sm text-gray-900">Overdue Tasks</h4>
                        <p className="text-xs text-gray-500 mt-0.5">Email me when a task passes its due date without being completed.</p>
                      </div>
                      <div 
                        onClick={() => toggleNotif('n5')}
                        className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 cursor-pointer ${notifs.n5 ? 'bg-[var(--brand-primary)]' : 'bg-gray-200'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${notifs.n5 ? 'translate-x-4' : 'translate-x-0'}`}></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <div>
                        <h4 className="font-semibold text-sm text-gray-900">Daily Summary</h4>
                        <p className="text-xs text-gray-500 mt-0.5">Email me a daily summary of pending items across all clients.</p>
                      </div>
                      <div 
                        onClick={() => toggleNotif('n6')}
                        className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 cursor-pointer ${notifs.n6 ? 'bg-[var(--brand-primary)]' : 'bg-gray-200'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${notifs.n6 ? 'translate-x-4' : 'translate-x-0'}`}></div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === 'support' && role === 'client' && (
            <div className="bg-white rounded-[var(--radius-card)] p-6 border border-gray-100 shadow-[var(--shadow-card)] animate-in fade-in slide-in-from-right-2 duration-300">
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-blue-100">
                  <HelpCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Need help?</h3>
                <p className="text-gray-500 max-w-sm mx-auto mb-6">
                  If you have any questions or need to update your brand guidelines or subscription, please contact your account manager.
                </p>
                <a href="mailto:support@agency.com" className="inline-flex items-center space-x-2 bg-[var(--brand-primary)] text-white px-5 py-2.5 rounded-xl font-medium shadow-sm hover:opacity-90 transition-opacity">
                  <Mail size={18} />
                  <span>Contact Account Manager</span>
                </a>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
