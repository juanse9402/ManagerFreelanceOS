import React, { useState, useEffect } from 'react';
import { Bell, Search, LogOut, X, Play, Square } from 'lucide-react';

import type { UserRole } from '../../App';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useTimeTracking, CATEGORIES } from '../../contexts/TimeTrackingContext';

interface HeaderProps {
  role: UserRole;
}

export const Header: React.FC<HeaderProps> = ({ role }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  const { activeClientId, availableClients } = useAuth();
  const activeClient = availableClients.find((c: any) => c.id === activeClientId);

  // Time tracking hooks and states
  const { activeTimer, startTimer, stopTimer, updateActiveTimer, campaigns } = useTimeTracking();
  const [showTimerPopover, setShowTimerPopover] = useState(false);
  const [elapsed, setElapsed] = useState('0:00:00');
  
  // Ticker fields
  const [desc, setDesc] = useState('');
  const [clientVal, setClientVal] = useState('');
  const [campaignVal, setCampaignVal] = useState('');
  const [categoryVal, setCategoryVal] = useState(CATEGORIES[0]);

  useEffect(() => {
    if (campaigns.length > 0 && !campaignVal) {
      setCampaignVal(campaigns[0].id);
    }
  }, [campaigns, campaignVal]);

  // Sync state when timer changes
  useEffect(() => {
    if (activeTimer) {
      setDesc(activeTimer.description);
      setClientVal(activeTimer.clientId);
      setCampaignVal(activeTimer.campaignId);
      setCategoryVal(activeTimer.category);
    } else {
      setDesc('');
      if (activeClientId) setClientVal(activeClientId);
    }
  }, [activeTimer, activeClientId]);

  // Elapsed tick
  useEffect(() => {
    if (!activeTimer) {
      setElapsed('0:00:00');
      return;
    }
    const updateTick = () => {
      const start = new Date(activeTimer.startTime).getTime();
      const diff = Date.now() - start;
      const secs = Math.floor(diff / 1000) % 60;
      const mins = Math.floor(diff / (1000 * 60)) % 60;
      const hrs = Math.floor(diff / (1000 * 60 * 60));
      const pad = (n: number) => n.toString().padStart(2, '0');
      setElapsed(`${hrs}:${pad(mins)}:${pad(secs)}`);
    };
    updateTick();
    const interval = setInterval(updateTick, 1000);
    return () => clearInterval(interval);
  }, [activeTimer]);

  const handleStartTimer = () => {
    if (!clientVal) {
      alert('Please select a client.');
      return;
    }
    startTimer({
      description: desc || 'No description',
      clientId: clientVal,
      campaignId: campaignVal,
      category: categoryVal,
      billable: true
    });
    setShowTimerPopover(false);
  };

  const handleStopTimer = () => {
    stopTimer();
    setShowTimerPopover(false);
  };

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

        {/* Persistent Mini Timer Widget (Admin Only) */}
        {role === 'admin' && (
          <div className="relative">
            {activeTimer ? (
              <div className="flex items-center space-x-2 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-full shadow-sm text-xs font-bold transition-all">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <button 
                  onClick={() => setShowTimerPopover(!showTimerPopover)}
                  className="text-red-700 font-mono"
                >
                  ⏱️ {elapsed}
                </button>
                <button 
                  onClick={handleStopTimer}
                  className="p-1 bg-red-600 text-white rounded-full hover:bg-red-700 shrink-0"
                  title="Stop Timer"
                >
                  <Square size={10} fill="white" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowTimerPopover(!showTimerPopover)}
                className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 text-indigo-700 rounded-full text-xs font-bold transition-all shadow-sm"
              >
                <Play size={12} fill="currentColor" className="text-indigo-600" />
                <span>Track time</span>
              </button>
            )}

            {/* Timer Popover */}
            {showTimerPopover && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowTimerPopover(false)}></div>
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                    <h4 className="font-bold text-gray-900 text-xs">
                      {activeTimer ? 'Edit Running Timer' : 'Start a New Timer'}
                    </h4>
                    <button 
                      onClick={() => setShowTimerPopover(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase">Working on</label>
                      <input 
                        type="text" 
                        value={desc}
                        onChange={(e) => {
                          setDesc(e.target.value);
                          if (activeTimer) updateActiveTimer({ description: e.target.value });
                        }}
                        placeholder="What are you doing?"
                        className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase">Client</label>
                      <select 
                        value={clientVal}
                        onChange={(e) => {
                          setClientVal(e.target.value);
                          if (activeTimer) updateActiveTimer({ clientId: e.target.value });
                        }}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none"
                      >
                        <option value="" disabled>Select client...</option>
                        {availableClients.map(c => (
                          <option key={c.id} value={c.id}>{c.full_name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase">Campaign</label>
                      <select 
                        value={campaignVal}
                        onChange={(e) => {
                          setCampaignVal(e.target.value);
                          if (activeTimer) updateActiveTimer({ campaignId: e.target.value });
                        }}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none"
                      >
                        {campaigns.map((c: any) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase">Category</label>
                      <select 
                        value={categoryVal}
                        onChange={(e) => {
                          setCategoryVal(e.target.value);
                          if (activeTimer) updateActiveTimer({ category: e.target.value });
                        }}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-50 flex justify-end space-x-2">
                    {activeTimer ? (
                      <button 
                        onClick={handleStopTimer}
                        className="w-full py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-bold transition-colors"
                      >
                        Stop Timer
                      </button>
                    ) : (
                      <button 
                        onClick={handleStartTimer}
                        disabled={!clientVal}
                        className="w-full py-1.5 bg-[var(--brand-primary)] text-white hover:opacity-90 disabled:opacity-50 rounded-lg text-xs font-bold transition-opacity"
                      >
                        Start
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

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
