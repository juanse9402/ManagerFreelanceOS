import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, CheckCircle2, Circle, Play, Image as ImageIcon, ImagePlus, FileText, Clock, DollarSign, ListFilter } from 'lucide-react';
import { ProjectProgress } from '../dashboard/ProjectProgress';
import { useTimeTracking, CATEGORIES, CATEGORY_COLORS } from '../../contexts/TimeTrackingContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip } from 'recharts';

export const CampaignDetail: React.FC = () => {
  const { id, campaignId } = useParams<{ id: string, campaignId: string }>();
  const { availableClients, role, activeClientId } = useAuth();
  const navigate = useNavigate();
  const { timeEntries } = useTimeTracking();
  
  const resolvedClientId = id || (role === 'client' ? activeClientId : null);
  const client = availableClients.find(c => c.id === resolvedClientId);

  const [activeTab, setActiveTab] = useState('Tasks');

  // Filters for campaign time tracking tab
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterBillable, setFilterBillable] = useState<string>('all');

  if (!client && role === 'admin') {
    return <div className="p-8 text-center text-gray-500">Client not found</div>;
  }

  // Mock data for the specific campaign
  const campaign = {
    id: campaignId,
    name: 'Summer Product Launch 2026',
    status: 'active',
    phase: 'Production',
    progress: 45,
    coverUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1200&q=80',
    deliverables: [
      { id: 1, title: 'Teaser Video', type: 'Reel', status: 'Approved', date: '2026-06-15' },
      { id: 2, title: 'Product Showcase Carousel', type: 'Carousel', status: 'In Review', date: '2026-06-20' },
      { id: 3, title: 'Behind the Scenes', type: 'Story', status: 'Production', date: '2026-06-25' },
      { id: 4, title: 'Launch Announcement', type: 'Post', status: 'Planning', date: '2026-07-01' },
    ]
  };

  // Filter time entries for this campaign
  const campaignEntries = timeEntries.filter(e => e.campaignId === campaignId);

  // Apply filters
  const filteredCampaignEntries = campaignEntries.filter(e => {
    const matchCat = filterCategory === 'all' || e.category === filterCategory;
    const matchBill = filterBillable === 'all' || 
                      (filterBillable === 'billable' && e.billable) || 
                      (filterBillable === 'non-billable' && !e.billable);
    return matchCat && matchBill;
  });

  // Calculate totals
  const totalCampaignMs = filteredCampaignEntries.reduce((acc, e) => {
    return acc + (new Date(e.endTime).getTime() - new Date(e.startTime).getTime());
  }, 0);

  const billableCampaignMs = filteredCampaignEntries
    .filter(e => e.billable)
    .reduce((acc, e) => {
      return acc + (new Date(e.endTime).getTime() - new Date(e.startTime).getTime());
    }, 0);

  const formatMs = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  };

  // Group by week for trend chart
  const weekTotals: Record<string, number> = {};
  campaignEntries.forEach(entry => {
    const dateObj = new Date(entry.date + 'T00:00:00');
    // Simple week representation e.g. "Week of Jun 15"
    const startOfWeek = new Date(dateObj);
    const day = dateObj.getDay();
    const diff = dateObj.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    const label = `Wk ${startOfWeek.getMonth() + 1}/${startOfWeek.getDate()}`;
    
    const duration = new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime();
    weekTotals[label] = (weekTotals[label] || 0) + duration / (1000 * 60 * 60); // hours
  });

  const weekChartData = Object.keys(weekTotals).map(label => ({
    week: label,
    hours: Number(weekTotals[label].toFixed(2))
  })).sort((a,b) => a.week.localeCompare(b.week));

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'Reel': return <Play size={16} className="text-[var(--brand-primary)]" />;
      case 'Story': return <ImagePlus size={16} className="text-purple-500" />;
      case 'Carousel': return <FileText size={16} className="text-blue-500" />;
      default: return <ImageIcon size={16} className="text-gray-500" />;
    }
  };

  const goBack = () => {
    if (role === 'client') {
      navigate('/client/campaigns');
    } else {
      navigate(`/admin/clients/${resolvedClientId}/campaigns`);
    }
  };

  if (role === 'client') {
    return (
      <div className="flex flex-col h-full overflow-y-auto bg-gray-50 pb-20 custom-scrollbar">
        {/* Large Header with Cover */}
        <div className="relative h-64 w-full bg-gray-900 shrink-0">
          <img src={campaign.coverUrl} alt={campaign.name} className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 to-transparent"></div>
          
          <div className="absolute top-6 left-6">
            <button 
              onClick={goBack}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
          </div>
          
          <div className="absolute bottom-6 left-8 right-8">
            <div className="flex gap-2 mb-3">
              <span className="px-3 py-1 rounded-md text-xs font-bold text-green-400 bg-green-400/20 backdrop-blur-md border border-green-400/30">
                ACTIVE
              </span>
              <span className="px-3 py-1 rounded-md text-xs font-bold text-white bg-white/20 backdrop-blur-md border border-white/30">
                {campaign.phase.toUpperCase()}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{campaign.name}</h1>
          </div>
        </div>

        <div className="max-w-5xl w-full mx-auto p-8 space-y-8">
          {/* Progress Bar Specific to Campaign */}
          <div className="bg-white rounded-[var(--radius-card)] p-6 shadow-[var(--shadow-card)] border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Campaign Progress</h2>
            <ProjectProgress project={campaign} isClientView={true} />
          </div>

          {/* Deliverables List */}
          <div className="bg-white rounded-[var(--radius-card)] p-6 shadow-[var(--shadow-card)] border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Deliverables</h2>
            
            <div className="space-y-4">
              {campaign.deliverables.map(item => (
                <div 
                  key={item.id}
                  className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 border border-gray-100 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                      {getContentTypeIcon(item.type)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 group-hover:text-[var(--brand-primary)] transition-colors">{item.title}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{item.type} • {new Date(item.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    {item.status === 'Approved' ? (
                      <div className="flex items-center text-green-600 text-sm font-semibold">
                        <CheckCircle2 size={16} className="mr-1.5" /> Approved
                      </div>
                    ) : item.status === 'In Review' ? (
                      <div className="flex items-center text-amber-600 text-sm font-semibold">
                        <Circle size={16} className="mr-1.5 fill-amber-100" /> Action Needed
                      </div>
                    ) : (
                      <div className="flex items-center text-gray-500 text-sm font-semibold">
                        <Circle size={16} className="mr-1.5" /> {item.status}
                      </div>
                    )}
                    
                    <button className="text-sm font-semibold text-[var(--brand-primary)] opacity-0 group-hover:opacity-100 transition-opacity">
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Admin View
  const tabs = ['Tasks', 'Content', 'Calendar', 'Progress', 'Time'];

  return (
    <div className="flex flex-col h-full bg-gray-50/30">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-8 py-6 flex-shrink-0">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button 
              onClick={goBack}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Campaign Details</h1>
              <div className="flex items-center space-x-3 text-sm">
                <span className="text-gray-500">Campaign ID: {campaignId}</span>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded border border-blue-100">Planning</span>
              </div>
            </div>
          </div>
          <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
            Edit Campaign
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-6 border-b border-gray-200">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-semibold transition-colors relative ${
                activeTab === tab 
                  ? 'text-[var(--brand-primary)]' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--brand-primary)] rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-8 font-sans">
        
        {activeTab === 'Tasks' && (
          <div className="text-center py-12 animate-in fade-in duration-300">
            <h3 className="text-lg font-bold text-gray-900 mb-2">No tasks yet</h3>
            <p className="text-gray-500 mb-6">Add your first task to get started.</p>
            <button className="bg-[var(--brand-primary)] text-white px-4 py-2 rounded-lg font-semibold shadow-sm hover:bg-[var(--brand-primary)]/90">
              Add Task
            </button>
          </div>
        )}

        {/* TIME TRACKING TAB */}
        {activeTab === 'Time' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* Summary statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
                  <Clock size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Total Campaign Time</span>
                  <span className="text-xl font-black text-gray-900 block mt-0.5">{formatMs(totalCampaignMs)}</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-green-50 text-green-600">
                  <DollarSign size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Billable Time</span>
                  <span className="text-xl font-black text-gray-900 block mt-0.5">{formatMs(billableCampaignMs)}</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                  <ListFilter size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Log Count</span>
                  <span className="text-xl font-black text-gray-900 block mt-0.5">{filteredCampaignEntries.length} entries</span>
                </div>
              </div>
            </div>

            {/* Weekly trend chart */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="text-sm font-bold text-gray-800 mb-4">Hours Logged per Week</h3>
              {weekChartData.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-10">No hours logged to chart.</p>
              ) : (
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weekChartData}>
                      <XAxis dataKey="week" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                      <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} />
                      <RechartsTooltip formatter={(value) => [`${value} hrs`, 'Duration']} />
                      <Bar dataKey="hours" fill="var(--brand-primary)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Filters & Log table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              
              <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex flex-wrap justify-between items-center gap-3">
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide">Time log records</h3>
                
                <div className="flex flex-wrap items-center gap-3">
                  <select 
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 font-semibold focus:outline-none"
                  >
                    <option value="all">All Categories</option>
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>

                  <select 
                    value={filterBillable}
                    onChange={(e) => setFilterBillable(e.target.value)}
                    className="bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 font-semibold focus:outline-none"
                  >
                    <option value="all">All Billing</option>
                    <option value="billable">Billable</option>
                    <option value="non-billable">Non-Billable</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs min-w-[600px]">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/20 text-gray-400 font-bold uppercase tracking-wider">
                      <th className="p-3 pl-4">Category</th>
                      <th className="p-3">Description</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Billing</th>
                      <th className="p-3 text-right pr-4">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCampaignEntries.map(entry => {
                      const duration = new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime();
                      return (
                        <tr key={entry.id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors last:border-none">
                          <td className="p-3 pl-4 font-semibold text-gray-800 flex items-center space-x-2">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_COLORS[entry.category]?.hex }} />
                            <span>{entry.category}</span>
                          </td>
                          <td className="p-3 text-gray-600 font-medium truncate max-w-[200px]" title={entry.description}>{entry.description}</td>
                          <td className="p-3 text-gray-500 font-medium">{new Date(entry.date + 'T00:00:00').toLocaleDateString()}</td>
                          <td className="p-3">
                            {entry.billable ? (
                              <span className="text-green-600 font-semibold">Billable</span>
                            ) : (
                              <span className="text-gray-400 font-semibold">Internal</span>
                            )}
                          </td>
                          <td className="p-3 text-right pr-4 font-mono font-bold text-gray-800">{formatMs(duration)}</td>
                        </tr>
                      );
                    })}
                    {filteredCampaignEntries.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-400 italic">No time logs match filters.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
