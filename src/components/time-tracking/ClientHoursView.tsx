import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  useTimeTracking, 
  CATEGORIES, 
  CATEGORY_COLORS
} from '../../contexts/TimeTrackingContext';
import { 
  Clock, 
  FileText, 
  Download, 
  ChevronDown, 
  ChevronUp
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis
} from 'recharts';

export const ClientHoursView: React.FC = () => {
  const { user, clientProfile } = useAuth();
  const {
    activeTimer,
    timeEntries,
    getClientSettings,
    reports,
    campaigns
  } = useTimeTracking();

  const clientId = user?.id || '';
  const clientSettings = getClientSettings(clientId);
  const brandPrimary = clientProfile?.brand_settings?.primaryColor || '#8B5CF6';

  const [expandedAllTime, setExpandedAllTime] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);

  // Auto update relative time string (e.g. "Updated just now")
  const [lastUpdatedStr, setLastUpdatedStr] = useState('Updated just now');
  useEffect(() => {
    const updateRelative = () => {
      const minutes = Math.floor(Math.random() * 5); // Simulating relative updates
      if (minutes === 0) {
        setLastUpdatedStr('Updated just now');
      } else {
        setLastUpdatedStr(`Updated ${minutes} minutes ago`);
      }
    };
    const interval = setInterval(updateRelative, 60000);
    return () => clearInterval(interval);
  }, []);

  // Filter entries for this client in the current week
  const getWeekRange = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const mon = new Date(today.setDate(diff));
    mon.setHours(0, 0, 0, 0);

    const sun = new Date(mon);
    sun.setDate(sun.getDate() + 6);
    sun.setHours(23, 59, 59, 999);
    
    return { mon, sun };
  };

  const { mon: weekStart, sun: weekEnd } = getWeekRange();

  const clientEntries = timeEntries.filter(entry => {
    if (entry.clientId !== clientId) return false;
    const d = new Date(entry.date + 'T00:00:00');
    return d >= weekStart && d <= weekEnd;
  });

  // Calculate live ticker if active timer is running for this client
  const isTimerRunningForThisClient = activeTimer && activeTimer.clientId === clientId;

  const [runningSeconds, setRunningSeconds] = useState(0);
  useEffect(() => {
    if (!isTimerRunningForThisClient) return;
    
    const tick = () => {
      const start = new Date(activeTimer!.startTime).getTime();
      setRunningSeconds(Math.floor((Date.now() - start) / 1000));
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunningForThisClient, activeTimer]);

  const runningMs = isTimerRunningForThisClient ? runningSeconds * 1000 : 0;

  // Total times
  const totalMs = clientEntries.reduce((acc, entry) => {
    return acc + (new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime());
  }, 0) + runningMs;

  const billableMs = clientEntries
    .filter(e => e.billable)
    .reduce((acc, entry) => {
      return acc + (new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime());
    }, 0) + (isTimerRunningForThisClient && activeTimer?.billable ? runningMs : 0);

  const nonBillableMs = totalMs - billableMs;

  const msToHoursMins = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  };

  // Group by plain categories
  const categoriesList = CATEGORIES.map(cat => {
    let ms = clientEntries
      .filter(e => e.category === cat)
      .reduce((acc, e) => acc + (new Date(e.endTime).getTime() - new Date(e.startTime).getTime()), 0);
    
    if (isTimerRunningForThisClient && activeTimer?.category === cat) {
      ms += runningMs;
    }

    return {
      name: cat,
      ms,
      color: CATEGORY_COLORS[cat].hex
    };
  }).filter(c => c.ms > 0);

  // Category donut chart data
  const donutData = categoriesList.map(c => ({
    name: c.name,
    value: c.ms / (1000 * 60 * 60), // decimal hours
    color: c.color
  }));

  // Mini Day Chart (Mon-Sun)
  const getDaysArray = () => {
    const arr = [];
    const temp = new Date(weekStart);
    for (let i = 0; i < 7; i++) {
      arr.push(temp.toISOString().split('T')[0]);
      temp.setDate(temp.getDate() + 1);
    }
    return arr;
  };

  const dailyChartData = getDaysArray().map(dateStr => {
    const dateObj = new Date(dateStr + 'T00:00:00');
    const dayLabel = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    const dayEntries = clientEntries.filter(e => e.date === dateStr);
    
    let ms = dayEntries.reduce((acc, e) => acc + (new Date(e.endTime).getTime() - new Date(e.startTime).getTime()), 0);
    if (isTimerRunningForThisClient && new Date().toISOString().split('T')[0] === dateStr) {
      ms += runningMs;
    }

    return {
      label: dayLabel,
      hours: ms / (1000 * 60 * 60), // decimal hours
      isToday: new Date().toISOString().split('T')[0] === dateStr
    };
  });

  // All-time totals
  const allTimeEntries = timeEntries.filter(entry => entry.clientId === clientId);
  const allTimeMs = allTimeEntries.reduce((acc, entry) => {
    return acc + (new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime());
  }, 0) + runningMs;

  // Top campaign
  const campaignTotals: Record<string, number> = {};
  allTimeEntries.forEach(entry => {
    campaignTotals[entry.campaignId] = (campaignTotals[entry.campaignId] || 0) + (new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime());
  });
  if (isTimerRunningForThisClient && activeTimer) {
    campaignTotals[activeTimer.campaignId] = (campaignTotals[activeTimer.campaignId] || 0) + runningMs;
  }

  const topCampaignId = Object.keys(campaignTotals).sort((a,b) => campaignTotals[b] - campaignTotals[a])[0];
  const topCampaignName = campaigns.find(c => c.id === topCampaignId)?.name || 'N/A';

  // Top category
  const categoryTotals: Record<string, number> = {};
  allTimeEntries.forEach(entry => {
    categoryTotals[entry.category] = (categoryTotals[entry.category] || 0) + (new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime());
  });
  if (isTimerRunningForThisClient && activeTimer) {
    categoryTotals[activeTimer.category] = (categoryTotals[activeTimer.category] || 0) + runningMs;
  }

  const topCategoryName = Object.keys(categoryTotals).sort((a,b) => categoryTotals[b] - categoryTotals[a])[0] || 'N/A';

  // Simulated Report List (last 12 weeks)
  const clientReports = reports.filter(r => r.clientId === clientId).slice(0, 12);

  // Seed some empty template reports if none exist
  const getPreseededReports = () => {
    if (clientReports.length > 0) return clientReports;
    
    // Generating mock historical reports for past weeks
    const list = [];
    const tempDate = new Date(weekStart);
    for (let i = 1; i <= 3; i++) {
      tempDate.setDate(tempDate.getDate() - 7);
      const monStr = tempDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const sun = new Date(tempDate);
      sun.setDate(sun.getDate() + 6);
      const sunStr = sun.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      
      list.push({
        id: `mock_hist_${i}`,
        clientId,
        dateRange: `${monStr} – ${sunStr}`,
        totalHours: `${10 + i * 2}h 45m`,
        status: i === 1 ? 'Sent via email' : i === 2 ? 'Shared link' : 'Available',
        workCompleted: {
          'Design': ['Designed cover photos', 'Layout tweaks'],
          'Copywriting': ['Drafted newsletter copy']
        },
        narrative: 'Progress was made on the core design structures and alignment campaigns.',
        tasksCount: 4,
        campaignsCount: 2,
        dateGenerated: tempDate.toLocaleDateString('en-US')
      });
    }
    return list;
  };

  const displayReports = getPreseededReports();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300 pb-20">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Hours & Reports</h1>
        <p className="text-sm text-gray-500 mt-1">See how your team's time is being spent on your account.</p>
      </div>

      {/* A. Live Hours This Week Card */}
      <div 
        className="rounded-2xl p-6 sm:p-8 text-white relative shadow-lg overflow-hidden"
        style={{ backgroundColor: brandPrimary }}
      >
        {/* Glow overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50 pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative">
          
          <div className="md:col-span-7 space-y-4">
            <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest block">Hours logged this week</span>
            
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight">{msToHoursMins(totalMs)}</h2>
            
            {clientSettings.showBillableToClient && (
              <p className="text-xs text-white/80 font-medium">
                Split: <span className="font-bold text-white">{msToHoursMins(billableMs)}</span> billable work · <span className="font-bold text-white">{msToHoursMins(nonBillableMs)}</span> internal operations
              </p>
            )}

            {isTimerRunningForThisClient && (
              <div className="inline-flex items-center space-x-2 bg-white/20 border border-white/30 rounded-full px-3 py-1 text-xs">
                <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-ping shrink-0" />
                <span className="font-bold text-[10px]">Work in progress — timer is running...</span>
              </div>
            )}

            <span className="text-[10px] text-white/50 block font-semibold">{lastUpdatedStr}</span>
          </div>

          {/* Mini Donut category chart */}
          <div className="md:col-span-5 flex justify-center items-center">
            {donutData.length === 0 ? (
              <div className="text-center py-6 text-white/60 text-xs">No hours recorded this week.</div>
            ) : (
              <div className="h-32 w-32 relative flex items-center justify-center bg-white/5 rounded-full p-2 border border-white/10">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={32}
                      outerRadius={45}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {donutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute text-center">
                  <Clock size={16} className="mx-auto text-white/80 animate-pulse" />
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* B. Category Breakdown Table & C. Hours by Day */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Table list */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-gray-800 border-b border-gray-50 pb-2">What we worked on</h3>
          
          <div className="divide-y divide-gray-50 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
            {categoriesList.map(c => (
              <div key={c.name} className="py-2.5 flex justify-between items-center text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                  <span className="font-semibold text-gray-700">{c.name}</span>
                </div>
                <span className="font-bold text-gray-900">{msToHoursMins(c.ms)}</span>
              </div>
            ))}

            {categoriesList.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-10">No categories to display this week.</p>
            )}
          </div>
          
          <div className="pt-2 text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
            This week includes work on active campaigns
          </div>
        </div>

        {/* Mini 7 day Bar chart */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-gray-800 border-b border-gray-50 pb-2">Hours by Day — This Week</h3>
          
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyChartData}>
                <XAxis dataKey="label" stroke="#9CA3AF" fontSize={10} tickLine={false} />
                <Bar 
                  dataKey="hours" 
                  fill={brandPrimary} 
                  radius={[4, 4, 0, 0]}
                >
                  {dailyChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.isToday ? brandPrimary : `${brandPrimary}99`} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* D. Past Reports Archive */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-gray-800">Your weekly reports</h3>
          <p className="text-xs text-gray-500 mt-0.5">Reports are sent every week and are available here for the last 12 weeks.</p>
        </div>

        <div className="divide-y divide-gray-100">
          {displayReports.map(report => (
            <div key={report.id} className="py-3 flex flex-wrap justify-between items-center text-xs gap-3">
              <div className="flex items-center space-x-3">
                <FileText size={16} className="text-gray-400" />
                <div>
                  <p className="font-bold text-gray-800">Week of {report.dateRange}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Total logged: {report.totalHours}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className="px-2 py-0.5 rounded bg-gray-100 border border-gray-200 text-[10px] font-bold text-gray-500">
                  {report.status}
                </span>

                <button 
                  onClick={() => setSelectedReport(report)}
                  className="px-2.5 py-1.5 bg-gray-800 text-white hover:bg-gray-900 rounded-lg font-semibold text-[10px] transition-colors shadow-sm"
                >
                  View Report
                </button>
                <button 
                  onClick={() => alert(`Simulating download of PDF report ${report.id}`)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                  title="Download PDF"
                >
                  <Download size={14} />
                </button>
              </div>
            </div>
          ))}

          {displayReports.length === 0 && (
            <div className="text-center py-8 text-xs text-gray-400">
              No reports yet. Your first weekly report will appear here once your team starts logging time.
            </div>
          )}
        </div>
      </div>

      {/* E. Total Hours All-Time Summary */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        <div 
          onClick={() => setExpandedAllTime(!expandedAllTime)}
          className="p-4 bg-gray-50/50 flex items-center justify-between cursor-pointer select-none"
        >
          <span className="font-bold text-sm text-gray-800">All-time summary</span>
          {expandedAllTime ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
        </div>

        {expandedAllTime && (
          <div className="p-5 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-6 animate-in slide-in-from-top-2 duration-200">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100/50">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Total Logged All-Time</p>
              <p className="text-2xl font-black text-gray-900 mt-2">{msToHoursMins(allTimeMs)}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100/50">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Top Campaign</p>
              <p className="text-base font-black text-gray-800 mt-2 truncate" title={topCampaignName}>{topCampaignName}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100/50">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Top Category Share</p>
              <p className="text-base font-black text-gray-800 mt-2 truncate" title={topCategoryName}>{topCategoryName}</p>
            </div>
          </div>
        )}
      </div>

      {/* HISTORICAL REPORT DETAIL MODAL */}
      {selectedReport && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={() => setSelectedReport(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl my-8 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200 border border-gray-100">
              
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h3 className="text-sm font-bold text-gray-900 flex items-center">
                  <FileText size={16} className="mr-2 text-[var(--brand-primary)]" />
                  Weekly Work Report: Week of {selectedReport.dateRange}
                </h3>
                <button onClick={() => setSelectedReport(null)} className="p-1 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
                  <XIcon size={16} />
                </button>
              </div>

              <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto custom-scrollbar">
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Total Hours</span>
                    <span className="text-base font-black text-gray-800 mt-1 block">{selectedReport.totalHours}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Campaigns</span>
                    <span className="text-base font-black text-gray-800 mt-1 block">{selectedReport.campaignsCount}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Tasks Done</span>
                    <span className="text-base font-black text-green-600 mt-1 block">{selectedReport.tasksCount}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Executive Summary</h4>
                  <p className="text-xs text-gray-600 italic bg-gray-50/50 p-3 rounded-lg leading-relaxed font-medium">"{selectedReport.narrative}"</p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Work completed</h4>
                  <div className="space-y-3">
                    {Object.keys(selectedReport.workCompleted || {}).map(cat => (
                      <div key={cat} className="space-y-1">
                        <div className="text-xs font-bold text-gray-700 border-b border-gray-50 pb-0.5">{cat}</div>
                        <ul className="list-disc pl-5 space-y-1">
                          {(selectedReport.workCompleted[cat] || []).map((desc: string, idx: number) => (
                            <li key={idx} className="text-xs text-gray-600 font-medium">{desc}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex justify-end space-x-2">
                <button
                  onClick={() => alert(`Simulating download of PDF report ${selectedReport.id}`)}
                  className="px-4 py-2 bg-gray-800 text-white font-semibold rounded-xl text-xs hover:bg-gray-900 transition-colors flex items-center space-x-1.5"
                >
                  <Download size={12} />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors bg-white"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        </>
      )}

    </div>
  );
};

const XIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
);
