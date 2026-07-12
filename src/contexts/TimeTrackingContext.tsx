import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface ActiveTimer {
  description: string;
  clientId: string;
  campaignId: string;
  taskId?: string;
  category: string;
  billable: boolean;
  startTime: string; // ISO String
}

export interface TimeEntry {
  id: string;
  description: string;
  clientId: string;
  campaignId: string;
  taskId?: string;
  category: string;
  billable: boolean;
  startTime: string; // ISO String
  endTime: string; // ISO String
  date: string; // YYYY-MM-DD
}

export interface ClientTimeSettings {
  weeklyHourTarget?: number;
  defaultRate?: number;
  currency: string;
  showBillableToClient: boolean;
  showHourlyRateInReport: boolean;
  autoDelivery: boolean;
  deliveryDay: string;
  deliveryTime: string;
}

export interface TaskEstimate {
  value: number;
  unit: 'hours' | 'minutes';
}

export const CATEGORIES = [
  'Strategy',
  'Design',
  'Copywriting',
  'Shooting / Recording',
  'Editing',
  'Scheduling',
  'Client Communication',
  'Reporting',
  'Research',
  'Other'
];

export const CATEGORY_COLORS: Record<string, { name: string; hex: string }> = {
  'Strategy': { name: 'Indigo', hex: '#6366F1' },
  'Design': { name: 'Pink', hex: '#EC4899' },
  'Copywriting': { name: 'Violet', hex: '#8B5CF6' },
  'Shooting / Recording': { name: 'Amber', hex: '#F59E0B' },
  'Editing': { name: 'Orange', hex: '#F97316' },
  'Scheduling': { name: 'Teal', hex: '#14B8A6' },
  'Client Communication': { name: 'Blue', hex: '#3B82F6' },
  'Reporting': { name: 'Cyan', hex: '#06B6D4' },
  'Research': { name: 'Green', hex: '#22C55E' },
  'Other': { name: 'Gray', hex: '#9CA3AF' }
};

export const MOCK_CAMPAIGNS = [
  { id: 'c1', name: 'Summer Product Launch 2026', status: 'active', phase: 'Production' },
  { id: 'c2', name: 'Q2 Brand Awareness', status: 'active', phase: 'Review' },
  { id: 'c3', name: 'Valentine\'s Special', status: 'past', phase: 'Publishing' }
];

interface TimeTrackingContextType {
  activeTimer: ActiveTimer | null;
  timeEntries: TimeEntry[];
  clientSettings: Record<string, ClientTimeSettings>;
  taskEstimates: Record<string, TaskEstimate>;
  startTimer: (params: Omit<ActiveTimer, 'startTime'>) => void;
  stopTimer: () => TimeEntry | null;
  discardActiveTimer: () => void;
  updateActiveTimer: (updates: Partial<ActiveTimer>) => void;
  addManualEntry: (entry: Omit<TimeEntry, 'id'>) => void;
  updateEntry: (id: string, updates: Partial<TimeEntry>) => void;
  deleteEntry: (id: string) => void;
  duplicateEntry: (id: string) => void;
  saveClientSettings: (clientId: string, settings: ClientTimeSettings) => void;
  getClientSettings: (clientId: string) => ClientTimeSettings;
  saveTaskEstimate: (taskId: string, estimate: TaskEstimate) => void;
  getTaskEstimate: (taskId: string) => TaskEstimate | undefined;
  getTasksWithTimeLogged: () => Record<string, number>; // taskId -> milliseconds
  getTaskTimeLogged: (taskId: string) => number; // milliseconds
  reports: any[];
  saveReport: (report: any) => void;
  campaigns: any[];
  deleteCampaign: (id: string) => void;
  taskRecurrences: Record<string, string[]>;
  saveTaskRecurrence: (taskId: string, days: string[]) => void;
  getTaskRecurrence: (taskId: string) => string[];
}

const TimeTrackingContext = createContext<TimeTrackingContextType | undefined>(undefined);

export const TimeTrackingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [clientSettings, setClientSettings] = useState<Record<string, ClientTimeSettings>>({});
  const [taskEstimates, setTaskEstimates] = useState<Record<string, TaskEstimate>>({});
  const [reports, setReports] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [taskRecurrences, setTaskRecurrences] = useState<Record<string, string[]>>({});

  // Load from localStorage on mount/user change
  useEffect(() => {
    const keyPrefix = user ? `${user.id}_` : '';
    
    try {
      const storedTimer = localStorage.getItem(`${keyPrefix}active_timer`);
      if (storedTimer) setActiveTimer(JSON.parse(storedTimer));
      
      const storedEntries = localStorage.getItem(`${keyPrefix}time_entries`);
      if (storedEntries) setTimeEntries(JSON.parse(storedEntries));
      
      const storedSettings = localStorage.getItem(`${keyPrefix}client_time_settings`);
      if (storedSettings) setClientSettings(JSON.parse(storedSettings));

      const storedEstimates = localStorage.getItem(`${keyPrefix}task_estimates`);
      if (storedEstimates) setTaskEstimates(JSON.parse(storedEstimates));

      const storedReports = localStorage.getItem(`${keyPrefix}reports`);
      if (storedReports) setReports(JSON.parse(storedReports));

      const storedCampaigns = localStorage.getItem(`${keyPrefix}campaigns`);
      if (storedCampaigns) {
        setCampaigns(JSON.parse(storedCampaigns));
      } else {
        setCampaigns(MOCK_CAMPAIGNS);
      }

      const storedRecurrences = localStorage.getItem(`${keyPrefix}task_recurrences`);
      if (storedRecurrences) setTaskRecurrences(JSON.parse(storedRecurrences));
    } catch (e) {
      console.error('Error loading time tracking data from localStorage', e);
    }
  }, [user]);

  // Helper to persist data
  const persist = (key: string, data: any) => {
    const keyPrefix = user ? `${user.id}_` : '';
    localStorage.setItem(`${keyPrefix}${key}`, JSON.stringify(data));
  };

  const startTimer = (params: Omit<ActiveTimer, 'startTime'>) => {
    const newTimer: ActiveTimer = {
      ...params,
      startTime: new Date().toISOString()
    };
    setActiveTimer(newTimer);
    persist('active_timer', newTimer);
  };

  const stopTimer = (): TimeEntry | null => {
    if (!activeTimer) return null;
    
    const endTime = new Date().toISOString();
    const newEntry: TimeEntry = {
      id: `te_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      description: activeTimer.description || 'No description',
      clientId: activeTimer.clientId,
      campaignId: activeTimer.campaignId,
      taskId: activeTimer.taskId,
      category: activeTimer.category,
      billable: activeTimer.billable,
      startTime: activeTimer.startTime,
      endTime,
      date: new Date(activeTimer.startTime).toISOString().split('T')[0]
    };

    const updatedEntries = [newEntry, ...timeEntries];
    setTimeEntries(updatedEntries);
    persist('time_entries', updatedEntries);
    
    setActiveTimer(null);
    const keyPrefix = user ? `${user.id}_` : '';
    localStorage.removeItem(`${keyPrefix}active_timer`);

    return newEntry;
  };

  const discardActiveTimer = () => {
    setActiveTimer(null);
    const keyPrefix = user ? `${user.id}_` : '';
    localStorage.removeItem(`${keyPrefix}active_timer`);
  };

  const updateActiveTimer = (updates: Partial<ActiveTimer>) => {
    if (!activeTimer) return;
    const updated = { ...activeTimer, ...updates };
    setActiveTimer(updated);
    persist('active_timer', updated);
  };

  const addManualEntry = (entry: Omit<TimeEntry, 'id'>) => {
    const newEntry: TimeEntry = {
      ...entry,
      id: `te_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    const updatedEntries = [newEntry, ...timeEntries];
    setTimeEntries(updatedEntries);
    persist('time_entries', updatedEntries);
  };

  const updateEntry = (id: string, updates: Partial<TimeEntry>) => {
    const updatedEntries = timeEntries.map(entry => 
      entry.id === id ? { ...entry, ...updates } : entry
    );
    setTimeEntries(updatedEntries);
    persist('time_entries', updatedEntries);
  };

  const deleteEntry = (id: string) => {
    const updatedEntries = timeEntries.filter(entry => entry.id !== id);
    setTimeEntries(updatedEntries);
    persist('time_entries', updatedEntries);
  };

  const duplicateEntry = (id: string) => {
    const entryToDup = timeEntries.find(e => e.id === id);
    if (!entryToDup) return;

    startTimer({
      description: entryToDup.description,
      clientId: entryToDup.clientId,
      campaignId: entryToDup.campaignId,
      taskId: entryToDup.taskId,
      category: entryToDup.category,
      billable: entryToDup.billable
    });
  };

  const saveClientSettings = (clientId: string, settings: ClientTimeSettings) => {
    const updated = { ...clientSettings, [clientId]: settings };
    setClientSettings(updated);
    persist('client_time_settings', updated);
  };

  const getClientSettings = (clientId: string): ClientTimeSettings => {
    return clientSettings[clientId] || {
      currency: 'USD',
      showBillableToClient: true,
      showHourlyRateInReport: false,
      autoDelivery: false,
      deliveryDay: 'Monday',
      deliveryTime: '09:00 AM'
    };
  };

  const saveTaskEstimate = (taskId: string, estimate: TaskEstimate) => {
    const updated = { ...taskEstimates, [taskId]: estimate };
    setTaskEstimates(updated);
    persist('task_estimates', updated);
  };

  const getTaskEstimate = (taskId: string): TaskEstimate | undefined => {
    return taskEstimates[taskId];
  };

  const getTasksWithTimeLogged = (): Record<string, number> => {
    const result: Record<string, number> = {};
    timeEntries.forEach(entry => {
      if (entry.taskId) {
        const duration = new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime();
        result[entry.taskId] = (result[entry.taskId] || 0) + duration;
      }
    });
    return result;
  };

  const getTaskTimeLogged = (taskId: string): number => {
    let total = 0;
    timeEntries.forEach(entry => {
      if (entry.taskId === taskId) {
        total += new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime();
      }
    });
    return total;
  };

  const saveReport = (report: any) => {
    const updated = [report, ...reports.filter(r => r.id !== report.id)];
    setReports(updated);
    persist('reports', updated);
  };

  const deleteCampaign = (id: string) => {
    const updated = campaigns.filter(c => c.id !== id);
    setCampaigns(updated);
    persist('campaigns', updated);
  };

  const saveTaskRecurrence = (taskId: string, days: string[]) => {
    const updated = { ...taskRecurrences, [taskId]: days };
    setTaskRecurrences(updated);
    persist('task_recurrences', updated);
  };

  const getTaskRecurrence = (taskId: string): string[] => {
    return taskRecurrences[taskId] || [];
  };

  return (
    <TimeTrackingContext.Provider value={{
      activeTimer,
      timeEntries,
      clientSettings,
      taskEstimates,
      startTimer,
      stopTimer,
      discardActiveTimer,
      updateActiveTimer,
      addManualEntry,
      updateEntry,
      deleteEntry,
      duplicateEntry,
      saveClientSettings,
      getClientSettings,
      saveTaskEstimate,
      getTaskEstimate,
      getTasksWithTimeLogged,
      getTaskTimeLogged,
      reports,
      saveReport,
      campaigns,
      deleteCampaign,
      taskRecurrences,
      saveTaskRecurrence,
      getTaskRecurrence
    }}>
      {children}
    </TimeTrackingContext.Provider>
  );
};

export const useTimeTracking = () => {
  const context = useContext(TimeTrackingContext);
  if (!context) {
    throw new Error('useTimeTracking must be used within a TimeTrackingProvider');
  }
  return context;
};
