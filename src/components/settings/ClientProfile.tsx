import React, { useState } from 'react';
import { User, Lock, Bell, Save } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export const ClientProfile: React.FC = () => {
  const { profileName, session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: profileName || '',
    email: session?.user?.email || '',
    phone: '',
    company: ''
  });
  
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [notifications, setNotifications] = useState({
    email_daily: true,
    email_urgent: true,
    app_mentions: true
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // In a real app, update profile via Supabase
    setTimeout(() => {
      setLoading(false);
      alert('Profile updated successfully!');
    }, 1000);
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      alert("New passwords don't match.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: passwords.new });
    setLoading(false);
    if (error) {
      alert(`Error updating password: ${error.message}`);
    } else {
      alert('Password updated successfully!');
      setPasswords({ current: '', new: '', confirm: '' });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Profile Info */}
      <div className="bg-white rounded-[var(--radius-card)] p-6 shadow-[var(--shadow-card)] border border-gray-100">
        <div className="flex items-center mb-6 border-b border-gray-100 pb-4">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg mr-3">
            <User size={20} />
          </div>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Personal Information</h2>
        </div>
        
        <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
            <input 
              type="text" 
              value={profileData.name}
              onChange={e => setProfileData({...profileData, name: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
            <input 
              type="email" 
              value={profileData.email}
              disabled
              className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
            <input 
              type="tel" 
              value={profileData.phone}
              onChange={e => setProfileData({...profileData, phone: e.target.value})}
              placeholder="+1 (555) 000-0000"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Company / Brand Name</label>
            <input 
              type="text" 
              value={profileData.company}
              onChange={e => setProfileData({...profileData, company: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
            />
          </div>
          <div className="md:col-span-2 flex justify-end mt-2">
            <button 
              type="submit" 
              disabled={loading}
              className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-70"
            >
              <Save size={16} className="mr-2" />
              Save Changes
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Password Update */}
        <div className="bg-white rounded-[var(--radius-card)] p-6 shadow-[var(--shadow-card)] border border-gray-100 flex flex-col">
          <div className="flex items-center mb-6 border-b border-gray-100 pb-4">
            <div className="p-2 bg-red-50 text-red-600 rounded-lg mr-3">
              <Lock size={20} />
            </div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Update Password</h2>
          </div>
          
          <form onSubmit={handlePasswordUpdate} className="space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">New Password</label>
                <input 
                  type="password" 
                  required
                  value={passwords.new}
                  onChange={e => setPasswords({...passwords, new: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm New Password</label>
                <input 
                  type="password" 
                  required
                  value={passwords.confirm}
                  onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                />
              </div>
            </div>
            <div className="flex justify-end pt-4 mt-auto">
              <button 
                type="submit" 
                disabled={loading || !passwords.new}
                className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-70"
              >
                Update Password
              </button>
            </div>
          </form>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white rounded-[var(--radius-card)] p-6 shadow-[var(--shadow-card)] border border-gray-100 flex flex-col">
          <div className="flex items-center mb-6 border-b border-gray-100 pb-4">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg mr-3">
              <Bell size={20} />
            </div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Notification Preferences</h2>
          </div>
          
          <div className="space-y-5 flex-1">
            <label className="flex items-start cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input 
                  type="checkbox" 
                  className="sr-only"
                  checked={notifications.email_daily}
                  onChange={() => setNotifications({...notifications, email_daily: !notifications.email_daily})}
                />
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${notifications.email_daily ? 'bg-[var(--brand-primary)] border-[var(--brand-primary)]' : 'border-gray-300 group-hover:border-gray-400'}`}>
                  {notifications.email_daily && <Check size={14} className="text-white" strokeWidth={3} />}
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-semibold text-gray-800">Daily Digest Email</p>
                <p className="text-xs text-gray-500 mt-0.5">Receive a daily summary of pending approvals and project progress.</p>
              </div>
            </label>

            <label className="flex items-start cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input 
                  type="checkbox" 
                  className="sr-only"
                  checked={notifications.email_urgent}
                  onChange={() => setNotifications({...notifications, email_urgent: !notifications.email_urgent})}
                />
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${notifications.email_urgent ? 'bg-[var(--brand-primary)] border-[var(--brand-primary)]' : 'border-gray-300 group-hover:border-gray-400'}`}>
                  {notifications.email_urgent && <Check size={14} className="text-white" strokeWidth={3} />}
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-semibold text-gray-800">Urgent Approvals</p>
                <p className="text-xs text-gray-500 mt-0.5">Email me immediately when content needs urgent review.</p>
              </div>
            </label>

            <label className="flex items-start cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input 
                  type="checkbox" 
                  className="sr-only"
                  checked={notifications.app_mentions}
                  onChange={() => setNotifications({...notifications, app_mentions: !notifications.app_mentions})}
                />
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${notifications.app_mentions ? 'bg-[var(--brand-primary)] border-[var(--brand-primary)]' : 'border-gray-300 group-hover:border-gray-400'}`}>
                  {notifications.app_mentions && <Check size={14} className="text-white" strokeWidth={3} />}
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-semibold text-gray-800">In-App Mentions</p>
                <p className="text-xs text-gray-500 mt-0.5">Notify me when I'm mentioned in a comment.</p>
              </div>
            </label>
          </div>
          
          <div className="flex justify-end mt-6 pt-4 border-t border-gray-100">
            <button 
              onClick={() => alert('Preferences saved!')}
              className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
