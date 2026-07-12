import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  useTimeTracking, 
  CATEGORIES, 
  CATEGORY_COLORS
} from '../../contexts/TimeTrackingContext';
import type { TimeEntry } from '../../contexts/TimeTrackingContext';
import { 
  Play, 
  Square, 
  Clock, 
  Trash2, 
  Copy, 
  Check, 
  X, 
  DollarSign, 
  ChevronRight, 
  ChevronDown, 
  ArrowLeft, 
  ArrowRight, 
  FileText, 
  Mail, 
  Link as LinkIcon, 
  Download
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip
} from 'recharts';
import { supabase } from '../../lib/supabase';

export const TimeTrackingView: React.FC = () => {
  const { activeClientId, availableClients, profileName } = useAuth();
  const {
    activeTimer,
    timeEntries,
    startTimer,
    stopTimer,
    updateActiveTimer,
    addManualEntry,
    updateEntry,
    deleteEntry,
    duplicateEntry,
    getClientSettings,
    saveClientSettings,
    saveReport,
    campaigns
  } = useTimeTracking();

  // Selected client for view filter & timer pre-fill
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  
  // Tasks list for selected client (from Supabase)
  const [clientTasks, setClientTasks] = useState<any[]>([]);

  // Page level states
  const [activeTab, setActiveTab] = useState<'summary' | 'reports'>('summary');
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  
  // Date filter (default: current week Mon -> Sun)
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const mon = new Date(today.setDate(diff));
    mon.setHours(0, 0, 0, 0);
    return mon;
  });

  const dateRangeMode = 'week';
  const customStartDate = '';
  const customEndDate = '';
  const [localWeeklyTarget, setLocalWeeklyTarget] = useState<number>(0);

  // Active Timer Input states
  const [timerDesc, setTimerDesc] = useState('');
  const [timerCampaign, setTimerCampaign] = useState('');
  
  useEffect(() => {
    if (campaigns.length > 0 && !timerCampaign) {
      setTimerCampaign(campaigns[0].id);
    }
  }, [campaigns, timerCampaign]);

  const [timerTask, setTimerTask] = useState('');
  const [timerCategory, setTimerCategory] = useState(CATEGORIES[0]);
  const [timerBillable, setTimerBillable] = useState(true);

  // Manual timer inputs
  const [manualMode, setManualMode] = useState(false);
  const [manualDate, setManualDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [manualStart, setManualStart] = useState('09:00');
  const [manualEnd, setManualEnd] = useState('10:00');

  // Tooltip & Keyboard Shortcuts
  const [showHotkeyTooltip, setShowHotkeyTooltip] = useState(false);
  const descInputRef = useRef<HTMLInputElement>(null);

  // Report config states
  const [reportNote, setReportNote] = useState('');
  const [includeBillable, setIncludeBillable] = useState(true);
  const [includeHoursDay, setIncludeHoursDay] = useState(true);
  const [includeWorkDone, setIncludeWorkDone] = useState(true);
  const [includeNextWeek, setIncludeNextWeek] = useState(true);
  const [scheduleDelivery, setScheduleDelivery] = useState(false);
  const [deliveryDay, setDeliveryDay] = useState('Monday');
  const [deliveryTime, setDeliveryTime] = useState('09:00 AM');

  // Toast / Email modal alerts
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  // Narrative summary before sending report (editable)
  const [narrativeSummary, setNarrativeSummary] = useState('');
  
  // Editable work completed lists
  const [editableWorkCompleted, setEditableWorkCompleted] = useState<Record<string, string[]>>({});
  const [teamNotes, setTeamNotes] = useState('');

  // Overrun timer warning check
  const [timerOverrunWarning, setTimerOverrunWarning] = useState(false);

  // Initialize selected client
  useEffect(() => {
    if (activeClientId) {
      setSelectedClientId(activeClientId);
    } else if (availableClients.length > 0) {
      setSelectedClientId(availableClients[0].id);
    }
  }, [activeClientId, availableClients]);

  // Fetch tasks when selected client changes
  useEffect(() => {
    const fetchTasks = async () => {
      if (!selectedClientId) return;
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('client_id', selectedClientId);
      
      if (data && !error) {
        setClientTasks(data);
      } else {
        setClientTasks([]);
      }
    };
    fetchTasks();
  }, [selectedClientId]);

  // Load timer state if already running
  useEffect(() => {
    if (activeTimer) {
      setTimerDesc(activeTimer.description);
      setSelectedClientId(activeTimer.clientId);
      setTimerCampaign(activeTimer.campaignId);
      setTimerTask(activeTimer.taskId || '');
      setTimerCategory(activeTimer.category);
      setTimerBillable(activeTimer.billable);
    }
  }, [activeTimer]);

  // Monitor active timer (> 8 hours)
  useEffect(() => {
    if (!activeTimer) {
      setTimerOverrunWarning(false);
      return;
    }
    const checkTimer = () => {
      const start = new Date(activeTimer.startTime).getTime();
      const elapsed = Date.now() - start;
      if (elapsed > 8 * 60 * 60 * 1000) {
        setTimerOverrunWarning(true);
      } else {
        setTimerOverrunWarning(false);
      }
    };
    checkTimer();
    const interval = setInterval(checkTimer, 60000);
    return () => clearInterval(interval);
  }, [activeTimer]);

  const activeClientName = availableClients.find(c => c.id === selectedClientId)?.full_name || 'Client';
  const activeClientLogo = availableClients.find(c => c.id === selectedClientId)?.brand_settings?.logo_url || '';
  const clientSettings = getClientSettings(selectedClientId);

  // Setup weekly targets
  useEffect(() => {
    setLocalWeeklyTarget(clientSettings.weeklyHourTarget || 0);
  }, [clientSettings]);
  
  // Format Date range
  const weekEndDate = new Date(currentWeekStart);
  weekEndDate.setDate(weekEndDate.getDate() + 6);
  weekEndDate.setHours(23, 59, 59, 999);

  const getWeekRangeString = () => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return `${currentWeekStart.toLocaleDateString('en-US', options)} – ${weekEndDate.toLocaleDateString('en-US', options)}`;
  };

  // Keyboard shortcut listener on focus
  const handleDescKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleStartStopTimer();
    }
  };

  // Timer Tick Hook
  const [elapsedString, setElapsedString] = useState('0:00:00');
  useEffect(() => {
    if (!activeTimer) {
      setElapsedString('0:00:00');
      return;
    }

    const updateTicker = () => {
      const start = new Date(activeTimer.startTime).getTime();
      const diffMs = Date.now() - start;
      
      const secs = Math.floor(diffMs / 1000) % 60;
      const mins = Math.floor(diffMs / (1000 * 60)) % 60;
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      
      const format = (num: number) => num.toString().padStart(2, '0');
      setElapsedString(`${hours}:${format(mins)}:${format(secs)}`);
    };

    updateTicker();
    const interval = setInterval(updateTicker, 1000);
    return () => clearInterval(interval);
  }, [activeTimer]);

  const handleStartStopTimer = () => {
    if (activeTimer) {
      const added = stopTimer();
      if (added) {
        showToast('Time entry saved! ✓');
      }
    } else {
      if (!selectedClientId) {
        alert('Please select a client to start the timer.');
        return;
      }
      startTimer({
        description: timerDesc,
        clientId: selectedClientId,
        campaignId: timerCampaign,
        taskId: timerTask || undefined,
        category: timerCategory,
        billable: timerBillable
      });
      showToast('Timer started! ⏱️');
    }
  };

  const handleAddManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId) {
      alert('Please select a client.');
      return;
    }
    
    const startStr = `${manualDate}T${manualStart}:00`;
    const endStr = `${manualDate}T${manualEnd}:00`;
    const startObj = new Date(startStr);
    const endObj = new Date(endStr);

    if (endObj <= startObj) {
      alert('End time must be after start time.');
      return;
    }

    addManualEntry({
      description: timerDesc || 'No description',
      clientId: selectedClientId,
      campaignId: timerCampaign,
      taskId: timerTask || undefined,
      category: timerCategory,
      billable: timerBillable,
      startTime: startObj.toISOString(),
      endTime: endObj.toISOString(),
      date: manualDate
    });

    showToast('Manual time entry added! ✓');
    setTimerDesc('');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter entries in selected date range for selected client
  const filteredEntries = timeEntries.filter(entry => {
    if (entry.clientId !== selectedClientId) return false;
    
    const entryDate = new Date(entry.date + 'T00:00:00');
    if (dateRangeMode === 'week') {
      return entryDate >= currentWeekStart && entryDate <= weekEndDate;
    } else {
      const sDate = customStartDate ? new Date(customStartDate + 'T00:00:00') : null;
      const eDate = customEndDate ? new Date(customEndDate + 'T23:59:59') : null;
      return (!sDate || entryDate >= sDate) && (!eDate || entryDate <= eDate);
    }
  });

  // Calculate stats
  const totalMs = filteredEntries.reduce((acc, entry) => {
    return acc + (new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime());
  }, 0);

  const billableMs = filteredEntries
    .filter(e => e.billable)
    .reduce((acc, entry) => {
      return acc + (new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime());
    }, 0);

  const nonBillableMs = totalMs - billableMs;

  const msToHoursMins = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  };

  const msToDecimalHours = (ms: number) => {
    return (ms / (1000 * 60 * 60)).toFixed(2);
  };

  // Group entries by day for log
  const groupedByDay: Record<string, TimeEntry[]> = {};
  filteredEntries.forEach(entry => {
    if (!groupedByDay[entry.date]) {
      groupedByDay[entry.date] = [];
    }
    groupedByDay[entry.date].push(entry);
  });

  // Date Nav
  const handlePrevWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() - 7);
    setCurrentWeekStart(newStart);
  };

  const handleNextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + 7);
    setCurrentWeekStart(newStart);
  };

  // Chart 1: Category share data
  const categoryData = CATEGORIES.map(category => {
    const ms = filteredEntries
      .filter(e => e.category === category)
      .reduce((acc, e) => acc + (new Date(e.endTime).getTime() - new Date(e.startTime).getTime()), 0);
    return {
      name: category,
      value: ms / (1000 * 60 * 60), // decimal hours
      rawMs: ms,
      color: CATEGORY_COLORS[category].hex
    };
  }).filter(d => d.value > 0);

  // Chart 2: Stacked Daily Bar chart
  const getDaysArray = () => {
    const arr = [];
    const temp = new Date(currentWeekStart);
    for (let i = 0; i < 7; i++) {
      arr.push(temp.toISOString().split('T')[0]);
      temp.setDate(temp.getDate() + 1);
    }
    return arr;
  };

  const dailyChartData = getDaysArray().map(dateStr => {
    const dateObj = new Date(dateStr + 'T00:00:00');
    const dayLabel = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    const dayEntries = filteredEntries.filter(e => e.date === dateStr);
    
    const row: Record<string, any> = {
      date: dateStr,
      label: dayLabel,
      isToday: new Date().toISOString().split('T')[0] === dateStr
    };

    CATEGORIES.forEach(cat => {
      const ms = dayEntries
        .filter(e => e.category === cat)
        .reduce((acc, e) => acc + (new Date(e.endTime).getTime() - new Date(e.startTime).getTime()), 0);
      row[cat] = ms / (1000 * 60 * 60); // decimal hours
    });

    return row;
  });

  // Calculate tasks completed from Supabase tasks state (status: done / Completed)
  const completedTasksCount = clientTasks.filter(t => t.status === 'done' || t.status === 'Completed').length;
  const activeCampaignsCount = campaigns.filter(c => c.status === 'active').length;

  // Auto-generate narrative summary of work
  useEffect(() => {
    if (filteredEntries.length === 0) {
      setNarrativeSummary("No work logged this week.");
      setEditableWorkCompleted({});
      return;
    }

    // Group descriptions by category
    const groupedWork: Record<string, string[]> = {};
    filteredEntries.forEach(entry => {
      if (!groupedWork[entry.category]) {
        groupedWork[entry.category] = [];
      }
      if (entry.description && !groupedWork[entry.category].includes(entry.description)) {
        groupedWork[entry.category].push(entry.description);
      }
    });

    setEditableWorkCompleted(groupedWork);

    // Form summary paragraph
    const dominantCategories = Object.keys(groupedWork)
      .map(cat => {
        const ms = filteredEntries
          .filter(e => e.category === cat)
          .reduce((acc, e) => acc + (new Date(e.endTime).getTime() - new Date(e.startTime).getTime()), 0);
        return { cat, ms };
      })
      .sort((a, b) => b.ms - a.ms);

    if (dominantCategories.length > 0) {
      const topCat = dominantCategories[0];
      const secondCat = dominantCategories[1];
      const topPercent = ((topCat.ms / totalMs) * 100).toFixed(0);
      
      let summary = `This week, the majority of time was dedicated to ${topCat.cat.toLowerCase()} (${topPercent}%)`;
      if (secondCat) {
        const secPercent = ((secondCat.ms / totalMs) * 100).toFixed(0);
        summary += ` and ${secondCat.cat.toLowerCase()} (${secPercent}%)`;
      }
      summary += `, focusing on deliverables and key objectives.`;
      setNarrativeSummary(summary);
    }
  }, [timeEntries, selectedClientId, currentWeekStart]);

  // Handle saving of client setting adjustments
  const handleSaveSettings = () => {
    saveClientSettings(selectedClientId, {
      ...clientSettings,
      weeklyHourTarget: localWeeklyTarget,
      autoDelivery: scheduleDelivery,
      deliveryDay,
      deliveryTime
    });
    showToast('Client delivery settings updated! ✓');
  };

  // Simulated reports outputs
  const handleCopyLink = () => {
    const mockReportId = `rep_${selectedClientId}_${currentWeekStart.toISOString().split('T')[0]}`;
    
    // Calculate actual hours per category
    const categoryHours: Record<string, number> = {};
    filteredEntries.forEach(entry => {
      const duration = new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime();
      categoryHours[entry.category] = (categoryHours[entry.category] || 0) + duration;
    });

    // Calculate detailed work with specific duration breakdown
    const detailedWorkCompleted: Record<string, { description: string; durationMs: number }[]> = {};
    filteredEntries.forEach(entry => {
      if (!detailedWorkCompleted[entry.category]) {
        detailedWorkCompleted[entry.category] = [];
      }
      const duration = new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime();
      const existing = detailedWorkCompleted[entry.category].find(item => item.description === entry.description);
      if (existing) {
        existing.durationMs += duration;
      } else {
        detailedWorkCompleted[entry.category].push({
          description: entry.description || 'No description',
          durationMs: duration
        });
      }
    });

    const reportObj = {
      id: mockReportId,
      clientId: selectedClientId,
      dateRange: getWeekRangeString(),
      totalHours: msToHoursMins(totalMs),
      billableHours: msToHoursMins(billableMs),
      campaignsCount: activeCampaignsCount,
      tasksCount: completedTasksCount,
      narrative: narrativeSummary,
      workCompleted: editableWorkCompleted,
      categoryHours,
      detailedWorkCompleted,
      teamNotes,
      includeBillable,
      includeHoursDay,
      includeWorkDone,
      includeNextWeek,
      dateGenerated: new Date().toLocaleDateString('en-US')
    };

    saveReport(reportObj);

    const generatedLink = `${window.location.origin}/report/${mockReportId}`;
    navigator.clipboard.writeText(generatedLink);
    showToast('Shareable link copied to clipboard! ✓');
  };

  const handleDownloadPDF = () => {
    const filename = `${activeClientName.replace(/\s+/g, '')}-WeeklyReport-${currentWeekStart.toISOString().split('T')[0]}.pdf`;
    showToast(`Downloading static PDF: ${filename}...`);
  };

  const triggerEmailMock = () => {
    setEmailSubject(`${activeClientName} — Weekly Work Report: ${getWeekRangeString()}`);
    setEmailBody(`Hi ${activeClientName.split(' ')[0]},\n\nHere's your weekly work report for the week of ${getWeekRangeString()}.\n\nThis week we logged ${msToHoursMins(totalMs)} across ${activeCampaignsCount} campaigns. ${narrativeSummary}\n\nLet me know if you have any questions!\n\nBest,\n${profileName}`);
    setEmailModalOpen(true);
  };

  const handleSendEmail = () => {
    setEmailModalOpen(false);
    showToast(`Report sent to client email! ✓`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300 pb-20">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center animate-in fade-in slide-in-from-bottom-4 z-50">
          <Check className="text-green-400 mr-3 animate-pulse" size={20} />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Overrun Warning Banner */}
      {timerOverrunWarning && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 animate-in slide-in-from-top duration-300">
          <div className="flex items-center space-x-3">
            <Clock className="text-red-500 shrink-0" size={24} />
            <div>
              <p className="font-bold text-sm">Your timer has been running for 8+ hours!</p>
              <p className="text-xs text-red-600 mt-0.5">Did you forget to stop your tracker for {activeClientName}?</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <button 
              onClick={() => {
                stopTimer();
                showToast('Timer stopped successfully.');
              }}
              className="px-3 py-1.5 bg-red-600 text-white font-semibold rounded-lg text-xs hover:bg-red-700 transition-colors shadow-sm"
            >
              Stop timer now
            </button>
            <button 
              onClick={() => setTimerOverrunWarning(false)}
              className="px-3 py-1.5 bg-white border border-red-200 text-red-800 font-semibold rounded-lg text-xs hover:bg-red-100 transition-colors"
            >
              Keep running
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Time Tracking</h1>
          <p className="text-sm text-gray-500 mt-1">Log your work, track hours by campaign, and generate weekly reports for your clients.</p>
        </div>
        
        {/* Workspace selector prefilled / synchronized */}
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider hidden md:inline">Client:</span>
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] cursor-pointer shadow-sm w-full sm:w-56"
          >
            {availableClients.map(c => (
              <option key={c.id} value={c.id}>{c.full_name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* SECTION 3 — TIMER BAR */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 relative overflow-visible">
        
        {/* Manual toggle */}
        <div className="absolute -top-3 right-4 bg-gray-50 border border-gray-200 rounded-full px-3 py-0.5 flex items-center space-x-2 shadow-sm">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Mode:</span>
          <button 
            type="button" 
            onClick={() => setManualMode(!manualMode)}
            className="text-xs font-bold text-[var(--brand-primary)] hover:underline flex items-center"
          >
            {manualMode ? '⏱️ Switch to Timer' : '✏️ Switch to Manual'}
          </button>
        </div>

        <form onSubmit={manualMode ? handleAddManual : (e) => e.preventDefault()} className="space-y-4">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-end">
            
            {/* Description field */}
            <div className="xl:col-span-4 relative">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">What are you working on?</label>
              <input
                ref={descInputRef}
                type="text"
                value={timerDesc}
                onChange={(e) => {
                  setTimerDesc(e.target.value);
                  if (activeTimer) updateActiveTimer({ description: e.target.value });
                }}
                onKeyDown={handleDescKeyDown}
                onFocus={() => setShowHotkeyTooltip(true)}
                onBlur={() => setTimeout(() => setShowHotkeyTooltip(false), 200)}
                placeholder="Description of task..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition-all font-medium"
              />
              
              {/* Tooltip on focus */}
              {showHotkeyTooltip && (
                <div className="absolute top-full left-0 mt-2 bg-gray-900 text-white text-[10px] font-semibold px-2 py-1 rounded shadow-md z-10 animate-fade-in">
                  Tip: Press Enter to start or stop the timer.
                </div>
              )}
            </div>

            {/* Campaign Selector */}
            <div className="xl:col-span-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Campaign</label>
              <select
                value={timerCampaign}
                onChange={(e) => {
                  setTimerCampaign(e.target.value);
                  if (activeTimer) updateActiveTimer({ campaignId: e.target.value });
                }}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 text-gray-700 cursor-pointer font-medium"
              >
                {campaigns.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Task Selector */}
            <div className="xl:col-span-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Task (Optional)</label>
              <select
                value={timerTask}
                onChange={(e) => {
                  setTimerTask(e.target.value);
                  if (activeTimer) updateActiveTimer({ taskId: e.target.value || undefined });
                }}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 text-gray-700 cursor-pointer font-medium"
              >
                <option value="">No task linked</option>
                {clientTasks.map(t => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>

            {/* Category tag */}
            <div className="xl:col-span-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Category</label>
              <select
                value={timerCategory}
                onChange={(e) => {
                  setTimerCategory(e.target.value);
                  if (activeTimer) updateActiveTimer({ category: e.target.value });
                }}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 text-gray-700 cursor-pointer font-medium"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Controls Zone */}
            <div className="xl:col-span-2 flex items-center justify-between xl:justify-end space-x-3 pt-2 xl:pt-0">
              
              {/* Billable toggle */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="billable-toggle"
                  checked={timerBillable}
                  onChange={(e) => {
                    setTimerBillable(e.target.checked);
                    if (activeTimer) updateActiveTimer({ billable: e.target.checked });
                  }}
                  className="w-4 h-4 text-[var(--brand-primary)] border-gray-300 rounded focus:ring-[var(--brand-primary)] cursor-pointer"
                />
                <label htmlFor="billable-toggle" className="text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer select-none">
                  Billable
                </label>
              </div>

              {/* Start/Stop Button / Manual trigger */}
              {!manualMode ? (
                <div className="flex items-center space-x-3">
                  {activeTimer && (
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-mono font-bold text-gray-900 leading-none">{elapsedString}</span>
                      <span className="text-[9px] font-bold text-green-500 flex items-center mt-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                        RUNNING
                      </span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleStartStopTimer}
                    className={`w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-md shrink-0 border ${
                      activeTimer 
                        ? 'bg-red-500 text-white border-red-600 hover:bg-red-600' 
                        : 'bg-[var(--brand-primary)] text-white border-[var(--brand-primary)]/30 hover:opacity-95'
                    }`}
                  >
                    {activeTimer ? <Square size={16} fill="white" /> : <Play size={18} fill="white" className="ml-1" />}
                  </button>
                </div>
              ) : (
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-[var(--brand-primary)] text-white font-semibold rounded-xl text-xs hover:opacity-90 transition-opacity shadow-sm shrink-0"
                >
                  Add entry
                </button>
              )}

            </div>
          </div>

          {/* Manual Entry mode parameters */}
          {manualMode && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Date</label>
                <input
                  type="date"
                  value={manualDate}
                  onChange={(e) => setManualDate(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Start Time</label>
                <input
                  type="time"
                  value={manualStart}
                  onChange={(e) => setManualStart(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">End Time</label>
                <input
                  type="time"
                  value={manualEnd}
                  onChange={(e) => setManualEnd(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 font-medium"
                />
              </div>
            </div>
          )}

        </form>
      </div>

      {/* Week Running Totals Bar */}
      <div className="bg-gradient-to-r from-[var(--brand-primary)]/10 to-indigo-50 border border-[var(--brand-primary)]/10 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
        <div className="space-y-1">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Running Weekly Totals</p>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-gray-900">{msToHoursMins(totalMs)}</span>
            <span className="text-xs text-gray-500 font-semibold">({msToDecimalHours(totalMs)} hrs logged)</span>
          </div>
          <p className="text-xs text-gray-500">
            Breakdown: <span className="font-semibold text-gray-800">{msToHoursMins(billableMs)}</span> billable · <span className="font-semibold text-gray-800">{msToHoursMins(nonBillableMs)}</span> internal work
          </p>
        </div>

        {localWeeklyTarget > 0 && (
          <div className="w-full md:w-64 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-gray-600">
              <span>PROGRESS</span>
              <span>{msToHoursMins(totalMs)} of {localWeeklyTarget}h target</span>
            </div>
            <div className="w-full bg-gray-200/60 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-[var(--brand-primary)] h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (totalMs / (localWeeklyTarget * 60 * 60 * 1000)) * 100)}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Middle Zone: Collapsible Entries Log grouped by Day */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
          <h2 className="text-lg font-bold text-gray-800 flex items-center">
            <Clock size={18} className="mr-2 text-gray-400" /> Time Logs
          </h2>
          <span className="text-xs font-bold bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{filteredEntries.length} entries</span>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="text-center py-16 bg-white border border-gray-100 rounded-2xl space-y-3">
            <div className="w-14 h-14 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto border border-gray-200/50">
              <Clock size={28} />
            </div>
            <h3 className="font-bold text-gray-900 text-base">Start tracking your time.</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Log your hours as you work on each task and campaign. Your time entries will appear here, and you can generate weekly reports to share with your clients.
            </p>
            <button
              onClick={() => descInputRef.current?.focus()}
              className="text-xs bg-[var(--brand-primary)] text-white px-4 py-2 rounded-xl font-semibold shadow-sm hover:opacity-90 transition-opacity"
            >
              Start your first timer
            </button>
          </div>
        ) : (
          Object.keys(groupedByDay).sort((a,b) => b.localeCompare(a)).map(dateStr => {
            const dayEntries = groupedByDay[dateStr];
            const isCollapsed = expandedDays[dateStr] === true;
            
            const dayTotalMs = dayEntries.reduce((acc, e) => {
              return acc + (new Date(e.endTime).getTime() - new Date(e.startTime).getTime());
            }, 0);

            const dayBillableMs = dayEntries
              .filter(e => e.billable)
              .reduce((acc, e) => acc + (new Date(e.endTime).getTime() - new Date(e.startTime).getTime()), 0);

            const formattedDate = new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'short', 
              day: 'numeric' 
            });

            return (
              <div key={dateStr} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                
                {/* Day Header */}
                <div 
                  onClick={() => setExpandedDays(prev => ({ ...prev, [dateStr]: !prev[dateStr] }))}
                  className="p-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-sm text-gray-800">{formattedDate}</span>
                    <span className="text-xs text-gray-500 font-semibold">• {msToHoursMins(dayTotalMs)} total</span>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className="text-xs text-gray-400 font-bold hidden sm:inline">
                      {msToHoursMins(dayBillableMs)} billable
                    </span>
                    {isCollapsed ? <ChevronRight size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                  </div>
                </div>

                {/* Day Table */}
                {!isCollapsed && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                      <tbody>
                        {dayEntries.map(entry => {
                          const duration = new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime();
                          const isEditing = editingEntryId === entry.id;
                          const catHex = CATEGORY_COLORS[entry.category]?.hex || '#9CA3AF';
                          const taskTitle = clientTasks.find(t => t.id === entry.taskId)?.title || 'No task';

                          return (
                            <React.Fragment key={entry.id}>
                              <tr 
                                className={`border-b border-gray-50 hover:bg-gray-50/30 transition-colors last:border-0 ${isEditing ? 'bg-indigo-50/10' : ''}`}
                              >
                                {/* Left Border dot indicator */}
                                <td className="py-4 pl-4 w-4">
                                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: catHex }} />
                                </td>

                                {/* Description */}
                                <td className="py-4 px-3 max-w-[200px]" onClick={() => setEditingEntryId(entry.id)}>
                                  <div className="text-sm font-semibold text-gray-900 truncate" title={entry.description}>
                                    {entry.description}
                                  </div>
                                </td>

                                {/* Badges */}
                                <td className="py-4 px-3">
                                  <div className="flex flex-wrap gap-1.5 items-center">
                                    <span 
                                      className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white uppercase tracking-wider" 
                                      style={{ backgroundColor: 'var(--brand-primary)' }}
                                    >
                                      {activeClientName.split(' ')[0]}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 text-gray-600 truncate max-w-[120px]">
                                      {campaigns.find(c => c.id === entry.campaignId)?.name || 'Campaign'}
                                    </span>
                                    {entry.taskId && (
                                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-gray-50 border border-gray-200/80 text-gray-500 flex items-center">
                                        <FileText size={10} className="mr-1" />
                                        {taskTitle}
                                      </span>
                                    )}
                                  </div>
                                </td>

                                {/* Category */}
                                <td className="py-4 px-3">
                                  <span className="text-xs font-semibold text-gray-600">
                                    {entry.category}
                                  </span>
                                </td>

                                {/* Billable indicator */}
                                <td className="py-4 px-3 w-10">
                                  {entry.billable ? (
                                    <span title="Billable">
                                      <DollarSign size={14} className="text-green-600" />
                                    </span>
                                  ) : (
                                    <span className="text-gray-400 font-bold text-xs">-</span>
                                  )}
                                </td>

                                {/* Hours / Duration */}
                                <td className="py-4 px-3 text-right font-mono font-bold text-sm text-gray-700 w-24">
                                  {new Date(entry.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(entry.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </td>

                                <td className="py-4 px-3 text-right font-mono font-bold text-sm text-gray-800 w-20">
                                  {msToHoursMins(duration)}
                                </td>

                                {/* Actions (duplicate / delete) */}
                                <td className="py-4 pr-4 w-12 text-right">
                                  <div className="flex items-center justify-end space-x-1">
                                    <button
                                      onClick={() => duplicateEntry(entry.id)}
                                      className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-[var(--brand-primary)] rounded-lg transition-colors"
                                      title="Duplicate Entry"
                                    >
                                      <Copy size={14} />
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (confirm('Delete this entry?')) deleteEntry(entry.id);
                                      }}
                                      className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                                      title="Delete Entry"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </td>
                              </tr>

                              {/* INLINE ROW EDITING MODE */}
                              {isEditing && (
                                <tr className="bg-indigo-50/15 border-b border-gray-100">
                                  <td colSpan={9} className="p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-white border border-indigo-100 p-4 rounded-xl shadow-inner">
                                      <div className="md:col-span-2">
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Description</label>
                                        <input
                                          type="text"
                                          defaultValue={entry.description}
                                          onChange={(e) => updateEntry(entry.id, { description: e.target.value })}
                                          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[var(--brand-primary)]"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Category</label>
                                        <select
                                          defaultValue={entry.category}
                                          onChange={(e) => updateEntry(entry.id, { category: e.target.value })}
                                          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-[var(--brand-primary)] cursor-pointer"
                                        >
                                          {CATEGORIES.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                          ))}
                                        </select>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                          <input
                                            type="checkbox"
                                            id={`edit-billable-${entry.id}`}
                                            defaultChecked={entry.billable}
                                            onChange={(e) => updateEntry(entry.id, { billable: e.target.checked })}
                                            className="w-4 h-4 rounded text-[var(--brand-primary)]"
                                          />
                                          <label htmlFor={`edit-billable-${entry.id}`} className="text-xs font-bold text-gray-500 uppercase cursor-pointer select-none">
                                            Billable
                                          </label>
                                        </div>
                                        <button 
                                          onClick={() => setEditingEntryId(null)}
                                          className="px-3 py-1.5 bg-gray-800 text-white font-bold rounded-lg text-[10px] hover:bg-gray-900 shadow-sm"
                                        >
                                          Save
                                        </button>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
                
                {/* Day summary footer */}
                <div className="px-4 py-3 bg-gray-50/30 border-t border-gray-100 flex flex-wrap justify-between items-center text-xs text-gray-500 gap-2">
                  <div className="flex space-x-4">
                    <span>Logged: <strong className="text-gray-700">{msToHoursMins(dayTotalMs)}</strong></span>
                    <span>Billable: <strong className="text-gray-700">{msToHoursMins(dayBillableMs)}</strong></span>
                    <span>Internal: <strong className="text-gray-700">{msToHoursMins(dayTotalMs - dayBillableMs)}</strong></span>
                  </div>
                  <span className="font-semibold text-gray-600">{dayEntries.length} entries</span>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Tabs Zone */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-100 bg-gray-50/20">
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex-1 py-4 text-center font-bold text-sm transition-colors border-b-2 relative ${
              activeTab === 'summary' 
                ? 'text-[var(--brand-primary)] border-[var(--brand-primary)] bg-white' 
                : 'text-gray-500 hover:text-gray-700 border-transparent hover:bg-gray-50/30'
            }`}
          >
            📊 Weekly Summary
          </button>
          
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex-1 py-4 text-center font-bold text-sm transition-colors border-b-2 relative ${
              activeTab === 'reports' 
                ? 'text-[var(--brand-primary)] border-[var(--brand-primary)] bg-white' 
                : 'text-gray-500 hover:text-gray-700 border-transparent hover:bg-gray-50/30'
            }`}
          >
            📄 Client Reports
          </button>
        </div>

        {/* Tab contents */}
        <div className="p-6">
          
          {/* TAB A: WEEKLY SUMMARY */}
          {activeTab === 'summary' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              
              {/* Date Nav Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/60 p-4 rounded-xl border border-gray-100">
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={handlePrevWeek} 
                    className="p-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <span className="text-sm font-bold text-gray-800 px-3">{getWeekRangeString()}</span>
                  <button 
                    onClick={handleNextWeek}
                    className="p-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    <ArrowRight size={16} />
                  </button>
                </div>

                <div className="flex items-center space-x-3 text-xs">
                  <span className="font-bold text-gray-400 uppercase tracking-wider">Target:</span>
                  <input
                    type="number"
                    value={localWeeklyTarget}
                    onChange={(e) => setLocalWeeklyTarget(Number(e.target.value))}
                    placeholder="None"
                    className="bg-white border border-gray-200 rounded-lg px-2.5 py-1 w-20 text-center focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)] font-bold text-gray-700"
                  />
                  <button 
                    onClick={handleSaveSettings}
                    className="px-3 py-1 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors"
                  >
                    Apply Target
                  </button>
                </div>
              </div>

              {/* Two Column Dashboard */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Column 1: Charts */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* Category donut */}
                  <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-800 mb-4">Hours by Category</h3>
                    {categoryData.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-10">No category allocation logged yet.</p>
                    ) : (
                      <div className="h-64 relative flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={categoryData}
                              cx="50%"
                              cy="50%"
                              innerRadius={65}
                              outerRadius={85}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              {categoryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <RechartsTooltip 
                              formatter={(value: any) => [`${Number(value).toFixed(2)} hrs`, 'Allocation']} 
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        
                        {/* Center metrics */}
                        <div className="absolute text-center">
                          <span className="block text-2xl font-black text-gray-900 leading-none">{msToHoursMins(totalMs)}</span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1.5 block">TOTAL HOURS</span>
                        </div>
                      </div>
                    )}

                    {/* Legend */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-50">
                      {categoryData.map((d, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                          <span className="text-xs text-gray-600 truncate">{d.name} ({msToHoursMins(d.rawMs)})</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Staged stacked bar */}
                  <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-800 mb-4">Hours by Day (Stacked)</h3>
                    {totalMs === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-10">No daily allocation logged yet.</p>
                    ) : (
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={dailyChartData}>
                            <XAxis dataKey="label" stroke="#6B7280" fontSize={11} tickLine={false} />
                            <YAxis stroke="#6B7280" fontSize={11} tickLine={false} />
                            <RechartsTooltip 
                              formatter={(value: any, name: any) => [`${Number(value).toFixed(2)}h`, name]}
                            />
                            {CATEGORIES.map(cat => {
                              const matches = categoryData.some(d => d.name === cat);
                              if (!matches) return null;
                              return (
                                <Bar 
                                  key={cat} 
                                  dataKey={cat} 
                                  stackId="a" 
                                  fill={CATEGORY_COLORS[cat].hex} 
                                />
                              );
                            })}
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>

                  {/* Split billable split bar */}
                  <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-gray-800">Billable vs Non-Billable Split</h3>
                    <div className="flex justify-between items-baseline text-xs font-bold text-gray-600">
                      <span>{msToHoursMins(billableMs)} Billable ({totalMs > 0 ? ((billableMs/totalMs)*100).toFixed(0) : 0}%)</span>
                      <span>{msToHoursMins(nonBillableMs)} Non-Billable ({totalMs > 0 ? ((nonBillableMs/totalMs)*100).toFixed(0) : 0}%)</span>
                    </div>
                    <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden flex">
                      <div 
                        className="bg-[var(--brand-accent)] h-full"
                        style={{ width: `${totalMs > 0 ? (billableMs/totalMs)*100 : 0}%` }}
                        title="Billable"
                      />
                      <div 
                        className="bg-gray-300 h-full flex-1"
                        title="Non-Billable"
                      />
                    </div>
                  </div>

                </div>

                {/* Column 2: Breakdown Narrative */}
                <div className="lg:col-span-5 space-y-6">
                  
                  {/* Category Breakdown list */}
                  <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-800 mb-4">Category Breakdown</h3>
                    
                    <div className="divide-y divide-gray-50">
                      {CATEGORIES.map(cat => {
                        const entries = filteredEntries.filter(e => e.category === cat);
                        if (entries.length === 0) return null;

                        const catMs = entries.reduce((acc, e) => acc + (new Date(e.endTime).getTime() - new Date(e.startTime).getTime()), 0);
                        const percent = totalMs > 0 ? ((catMs / totalMs) * 100).toFixed(0) : 0;
                        const col = CATEGORY_COLORS[cat].hex;

                        return (
                          <div key={cat} className="py-3 flex justify-between items-center text-xs font-medium">
                            <div className="flex items-center space-x-2 truncate">
                              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: col }} />
                              <span className="text-gray-800 font-bold truncate">{cat}</span>
                              <span className="text-gray-400 font-semibold shrink-0">({entries.length} entries)</span>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-gray-900 font-bold">{msToHoursMins(catMs)}</span>
                              <span className="text-gray-400 ml-2 font-bold">{percent}%</span>
                            </div>
                          </div>
                        );
                      })}
                      {totalMs === 0 && (
                        <p className="text-xs text-gray-400 py-10 text-center">No category summaries.</p>
                      )}
                    </div>
                  </div>

                  {/* Narratives editable section */}
                  <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
                    <div>
                      <h3 className="text-sm font-bold text-gray-800">Weekly Narrative</h3>
                      <p className="text-[11px] text-gray-500 mt-1">This narrative summarizes where the hours went and is sent to the client in their weekly report.</p>
                    </div>

                    <textarea
                      value={narrativeSummary}
                      onChange={(e) => setNarrativeSummary(e.target.value)}
                      rows={4}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 resize-none font-medium custom-scrollbar"
                      placeholder="Summarize the work done..."
                    />
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* TAB B: REPORTS */}
          {activeTab === 'reports' && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-in fade-in duration-300">
              
              {/* Left Column: Document Styled Preview */}
              <div className="xl:col-span-8 bg-gray-50 border border-gray-200 rounded-xl p-6 sm:p-8 space-y-6 max-h-[850px] overflow-y-auto custom-scrollbar shadow-inner relative">
                
                <div className="absolute top-2 right-4 text-[10px] text-gray-400 uppercase font-black tracking-widest pointer-events-none">
                  Draft Preview
                </div>

                {/* REPORT HEADER */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 pb-5 gap-4">
                  <div className="flex items-center space-x-4">
                    {activeClientLogo ? (
                      <img src={activeClientLogo} alt="Client Logo" className="w-14 h-14 rounded-xl object-cover shadow-sm border border-gray-200 bg-white" />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-white border border-gray-200 flex items-center justify-center font-black text-gray-400 text-lg shadow-sm">
                        {activeClientName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h2 className="text-xl font-bold text-gray-900" style={{ color: 'var(--brand-primary)' }}>Weekly Work Report</h2>
                      <p className="text-xs text-gray-500 mt-0.5">Prepared for <strong className="text-gray-700">{activeClientName}</strong></p>
                    </div>
                  </div>
                  
                  <div className="text-left sm:text-right text-xs">
                    <p className="font-bold text-gray-800">Week of {getWeekRangeString()}</p>
                    <p className="text-gray-400 mt-0.5">Prepared by Freelancer OS</p>
                  </div>
                </div>

                {/* Personal Note (optional display) */}
                {reportNote && (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-xs text-amber-800 leading-relaxed italic shadow-sm">
                    <strong>Message:</strong> "{reportNote}"
                  </div>
                )}

                {/* SECTION 1: STAT BLOCKS */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Total Hours</span>
                    <span className="text-xl font-extrabold text-gray-900 mt-2">{msToHoursMins(totalMs)}</span>
                    <span className="text-[10px] text-gray-500 mt-1">Logged this week</span>
                  </div>

                  {includeBillable ? (
                    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Billable Hours</span>
                      <span className="text-xl font-extrabold text-[var(--brand-primary)] mt-2">{msToHoursMins(billableMs)}</span>
                      <span className="text-[10px] text-gray-500 mt-1">Attributable hours</span>
                    </div>
                  ) : (
                    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col justify-between opacity-50">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Billable Split</span>
                      <span className="text-xl font-extrabold text-gray-500 mt-2">-</span>
                      <span className="text-[10px] text-gray-400 mt-1">Hidden by settings</span>
                    </div>
                  )}

                  <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Active Campaigns</span>
                    <span className="text-xl font-extrabold text-gray-900 mt-2">{activeCampaignsCount}</span>
                    <span className="text-[10px] text-gray-500 mt-1">Campaigns worked</span>
                  </div>

                  <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Tasks Completed</span>
                    <span className="text-xl font-extrabold text-green-600 mt-2">{completedTasksCount}</span>
                    <span className="text-[10px] text-gray-500 mt-1">Milestones reached</span>
                  </div>
                </div>

                {/* SECTION 2: CATEGORY DONUT */}
                <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Hours by category</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    {categoryData.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-10">No categories to display.</p>
                    ) : (
                      <div className="h-44 relative flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={categoryData}
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={65}
                              paddingAngle={2}
                              dataKey="value"
                            >
                              {categoryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute text-center">
                          <span className="block text-lg font-black text-gray-900 leading-none">{msToHoursMins(totalMs)}</span>
                          <span className="text-[8px] font-bold text-gray-400 uppercase mt-1 block">HOURS</span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <p className="text-xs text-gray-600 leading-relaxed font-semibold">Summary:</p>
                      <p className="text-xs text-gray-500 leading-relaxed italic">"{narrativeSummary}"</p>
                    </div>
                  </div>
                </div>

                {/* SECTION 3: DAILY BAR CHART */}
                {includeHoursDay && (
                  <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
                    <div>
                      <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Work distribution across the week</h3>
                      <p className="text-[10px] text-gray-400 mt-0.5">Hours logged per day grouped by category</p>
                    </div>
                    {totalMs === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-8">No daily details to display.</p>
                    ) : (
                      <div className="h-44">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={dailyChartData}>
                            <XAxis dataKey="label" stroke="#6B7280" fontSize={10} tickLine={false} />
                            <YAxis stroke="#6B7280" fontSize={10} tickLine={false} />
                            {CATEGORIES.map(cat => {
                              const matches = categoryData.some(d => d.name === cat);
                              if (!matches) return null;
                              return <Bar key={cat} dataKey={cat} stackId="a" fill={CATEGORY_COLORS[cat].hex} />;
                            })}
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                )}

                {/* SECTION 4: WORK COMPLETED */}
                {includeWorkDone && (
                  <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
                    <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Work Completed This Week</h3>
                    
                    <div className="space-y-4">
                      {Object.keys(editableWorkCompleted).map(cat => {
                        const items = editableWorkCompleted[cat];
                        const ms = filteredEntries
                          .filter(e => e.category === cat)
                          .reduce((acc, e) => acc + (new Date(e.endTime).getTime() - new Date(e.startTime).getTime()), 0);

                        return (
                          <div key={cat} className="space-y-2">
                            <div className="flex items-center space-x-2 border-b border-gray-50 pb-1">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat].hex }} />
                              <span className="text-xs font-bold text-gray-800">{cat} ({msToHoursMins(ms)})</span>
                            </div>
                            <ul className="list-disc pl-5 space-y-1.5">
                              {items.map((desc, idx) => (
                                <li key={idx} className="text-xs text-gray-600">
                                  {desc}
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                      
                      {Object.keys(editableWorkCompleted).length === 0 && (
                        <p className="text-xs text-gray-400 py-4 text-center">No logs recorded.</p>
                      )}
                    </div>

                    {/* Team notes */}
                    {teamNotes && (
                      <div className="pt-4 border-t border-gray-100">
                        <h4 className="text-xs font-bold text-gray-700 mb-1.5">Notes from your team</h4>
                        <div className="bg-gray-50 border border-gray-100 p-3 rounded-lg text-xs text-gray-600 leading-relaxed font-medium">
                          {teamNotes}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* SECTION 5: UPCOMING PREVIEW */}
                {includeNextWeek && (
                  <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-3">
                    <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Upcoming next week preview</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {clientTasks.filter(t => t.status !== 'done' && t.status !== 'Completed').slice(0, 3).map((task, idx) => (
                        <li key={idx} className="text-xs text-gray-500">
                          {task.title} {task.date ? `(due: ${task.date})` : ''}
                        </li>
                      ))}
                      {clientTasks.filter(t => t.status !== 'done' && t.status !== 'Completed').length === 0 && (
                        <li className="text-xs text-gray-400 list-none italic">No upcoming tasks scheduled for next week.</li>
                      )}
                    </ul>
                  </div>
                )}

                {/* FOOTER */}
                <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center text-[10px] text-gray-400 gap-3">
                  <span>Questions? Reply to this email or reach us at admin@example.com</span>
                  <span>FreelanceOS Studio · {new Date().toLocaleDateString('en-US')}</span>
                </div>

              </div>

              {/* Right Column: Settings controls & Delivery actions */}
              <div className="xl:col-span-4 space-y-6">
                
                {/* Weekly selector */}
                <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Report range</h3>
                  <div className="flex items-center justify-between border border-gray-200 rounded-xl p-2 bg-gray-50">
                    <button onClick={handlePrevWeek} className="p-1 bg-white hover:bg-gray-100 border border-gray-200 rounded shadow-sm">
                      <ArrowLeft size={14} />
                    </button>
                    <span className="text-[11px] font-bold text-gray-800 truncate px-2">{getWeekRangeString()}</span>
                    <button onClick={handleNextWeek} className="p-1 bg-white hover:bg-gray-100 border border-gray-200 rounded shadow-sm">
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>

                {/* Report parameters configuration */}
                <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Report settings</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label htmlFor="inc-billable" className="text-xs text-gray-600 font-semibold cursor-pointer">Include billable breakdown</label>
                      <input 
                        type="checkbox" 
                        id="inc-billable"
                        checked={includeBillable} 
                        onChange={(e) => setIncludeBillable(e.target.checked)}
                        className="w-4 h-4 rounded text-[var(--brand-primary)]"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <label htmlFor="inc-hours-day" className="text-xs text-gray-600 font-semibold cursor-pointer">Include hours-by-day chart</label>
                      <input 
                        type="checkbox" 
                        id="inc-hours-day"
                        checked={includeHoursDay} 
                        onChange={(e) => setIncludeHoursDay(e.target.checked)}
                        className="w-4 h-4 rounded text-[var(--brand-primary)]"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <label htmlFor="inc-work-done" className="text-xs text-gray-600 font-semibold cursor-pointer">Include work completed section</label>
                      <input 
                        type="checkbox" 
                        id="inc-work-done"
                        checked={includeWorkDone} 
                        onChange={(e) => setIncludeWorkDone(e.target.checked)}
                        className="w-4 h-4 rounded text-[var(--brand-primary)]"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <label htmlFor="inc-next" className="text-xs text-gray-600 font-semibold cursor-pointer">Include next week preview</label>
                      <input 
                        type="checkbox" 
                        id="inc-next"
                        checked={includeNextWeek} 
                        onChange={(e) => setIncludeNextWeek(e.target.checked)}
                        className="w-4 h-4 rounded text-[var(--brand-primary)]"
                      />
                    </div>

                    <div className="space-y-1.5 pt-2">
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide">Personal client message</label>
                      <input 
                        type="text" 
                        value={reportNote}
                        onChange={(e) => setReportNote(e.target.value)}
                        placeholder="e.g. Great progress this week!" 
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[var(--brand-primary)]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide">Add narrative notes</label>
                      <textarea 
                        value={teamNotes}
                        onChange={(e) => setTeamNotes(e.target.value)}
                        placeholder="Internal comments or custom checklist items..." 
                        rows={3}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[var(--brand-primary)] resize-none font-medium custom-scrollbar"
                      />
                    </div>
                  </div>
                </div>

                {/* Delivery actions */}
                <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Delivery options</h3>
                  
                  <div className="space-y-2">
                    <button 
                      onClick={triggerEmailMock}
                      className="w-full flex items-center justify-center space-x-2 bg-[var(--brand-primary)] text-white py-2.5 rounded-xl font-bold text-xs hover:opacity-90 transition-opacity shadow-sm"
                    >
                      <Mail size={14} />
                      <span>Send to Client</span>
                    </button>

                    <button 
                      onClick={handleCopyLink}
                      className="w-full flex items-center justify-center space-x-2 bg-gray-50 border border-gray-200 text-gray-700 py-2.5 rounded-xl font-bold text-xs hover:bg-gray-100 transition-colors"
                    >
                      <LinkIcon size={14} />
                      <span>Copy Shareable Link</span>
                    </button>

                    <button 
                      onClick={handleDownloadPDF}
                      className="w-full flex items-center justify-center space-x-2 bg-gray-50 border border-gray-200 text-gray-700 py-2.5 rounded-xl font-bold text-xs hover:bg-gray-100 transition-colors"
                    >
                      <Download size={14} />
                      <span>Download PDF</span>
                    </button>
                  </div>

                  {/* Scheduled delivery configurations */}
                  <div className="border-t border-gray-50 pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <label htmlFor="sched-delivery" className="text-xs text-gray-600 font-semibold cursor-pointer">Schedule weekly send</label>
                      <input 
                        type="checkbox" 
                        id="sched-delivery"
                        checked={scheduleDelivery} 
                        onChange={(e) => {
                          setScheduleDelivery(e.target.checked);
                          saveClientSettings(selectedClientId, {
                            ...clientSettings,
                            autoDelivery: e.target.checked
                          });
                        }}
                        className="w-4 h-4 rounded text-[var(--brand-primary)]"
                      />
                    </div>

                    {scheduleDelivery && (
                      <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 animate-in slide-in-from-top-2 duration-200">
                        <div>
                          <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wide mb-1">Send every</label>
                          <select 
                            value={deliveryDay}
                            onChange={(e) => {
                              setDeliveryDay(e.target.value);
                              saveClientSettings(selectedClientId, { ...clientSettings, deliveryDay: e.target.value });
                            }}
                            className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none w-full"
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
                          <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wide mb-1">at</label>
                          <input 
                            type="text" 
                            value={deliveryTime}
                            onChange={(e) => {
                              setDeliveryTime(e.target.value);
                              saveClientSettings(selectedClientId, { ...clientSettings, deliveryTime: e.target.value });
                            }}
                            className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs text-center focus:outline-none w-full font-semibold"
                          />
                        </div>
                        <p className="col-span-2 text-[9px] text-gray-400 text-center font-bold">
                          Reports will be sent automatically every {deliveryDay} at {deliveryTime} for {activeClientName}.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>
      </div>

      {/* EMAIL PREVIEW MODAL */}
      {emailModalOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity" onClick={() => setEmailModalOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl my-8 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200 border border-gray-100">
              
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h3 className="text-sm font-bold text-gray-900 flex items-center">
                  <Mail size={16} className="mr-2 text-[var(--brand-primary)]" />
                  Email Report Preview
                </h3>
                <button onClick={() => setEmailModalOpen(false)} className="p-1 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Recipient (Client Email)</label>
                  <input
                    type="text"
                    value="client@brand.com"
                    readOnly
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none text-gray-500 cursor-not-allowed font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Subject</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[var(--brand-primary)] font-semibold text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Body Context</label>
                  <textarea
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    rows={8}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-[var(--brand-primary)] resize-none font-medium custom-scrollbar"
                  />
                </div>
                <div className="bg-indigo-50/30 border border-indigo-50 rounded-xl p-3 flex items-center space-x-3 text-xs text-indigo-800">
                  <FileText size={16} className="text-indigo-500" />
                  <span className="font-semibold">Attached: {activeClientName.replace(/\s+/g, '')}-WeeklyReport-{currentWeekStart.toISOString().split('T')[0]}.pdf</span>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex justify-end space-x-2">
                <button
                  onClick={() => setEmailModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors bg-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendEmail}
                  className="px-4 py-2 bg-[var(--brand-primary)] text-white font-semibold rounded-xl text-xs hover:opacity-90 transition-opacity"
                >
                  Send Report
                </button>
              </div>

            </div>
          </div>
        </>
      )}

    </div>
  );
};
