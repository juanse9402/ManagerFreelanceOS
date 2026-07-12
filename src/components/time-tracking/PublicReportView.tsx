import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CATEGORY_COLORS } from '../../contexts/TimeTrackingContext';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export const PublicReportView: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const [report, setReport] = useState<any | null>(null);

  // Load report and related client branding from localStorage
  useEffect(() => {
    try {
      // Search all localStorage keys for reports list (since user id prefixes are dynamic)
      let foundReport: any = null;
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.endsWith('reports')) {
          const reportsList = JSON.parse(localStorage.getItem(key) || '[]');
          const match = reportsList.find((r: any) => r.id === reportId);
          if (match) {
            foundReport = match;
            break;
          }
        }
      }

      if (foundReport) {
        setReport(foundReport);
        
        // Fetch client brand details if stored in client_time_settings or profiles list
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          // Try to look up profiles storage to extract brand guidelines
          if (key && key.endsWith('profiles')) {
            // Wait, profiles is in Supabase usually. Let's see if we can search available clients in cache or pre-sets.
          }
        }
      }
    } catch (e) {
      console.error('Error loading public report', e);
    }
  }, [reportId]);

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
          <AlertCircleIcon size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Report Not Found</h2>
        <p className="text-gray-500 max-w-sm">This link might have expired or the report ID is incorrect. Shareable links are valid for 30 days.</p>
      </div>
    );
  }

  const formatMs = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  };

  // Calculate decimal hours and format times
  const categoryData = Object.keys(report.workCompleted || {}).map(cat => {
    let value = 0;
    if (report.categoryHours && report.categoryHours[cat] !== undefined) {
      value = report.categoryHours[cat] / (1000 * 60 * 60); // convert ms to decimal hours
    } else {
      value = report.workCompleted[cat]?.length || 0;
    }
    return {
      name: cat,
      value: value,
      color: CATEGORY_COLORS[cat]?.hex || '#9CA3AF'
    };
  }).filter(item => item.value > 0);

  const primaryColor = '#8B5CF6'; // Default brand fallback

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* Color bar */}
        <div className="h-2 w-full" style={{ backgroundColor: primaryColor }} />

        <div className="p-6 sm:p-10 space-y-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 pb-6 gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center font-black text-gray-400 text-lg shadow-sm">
                R
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">Weekly Work Report</h1>
                <p className="text-xs text-gray-500 mt-0.5">Prepared for clients</p>
              </div>
            </div>
            
            <div className="text-left sm:text-right text-xs shrink-0">
              <p className="font-extrabold text-gray-900">Week of {report.dateRange}</p>
              <p className="text-gray-400 mt-1">Generated: {report.dateGenerated}</p>
            </div>
          </div>

          {/* Personal message */}
          {report.personalNote && (
            <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 text-xs text-amber-800 italic leading-relaxed">
              <strong>Note from agency:</strong> "{report.personalNote}"
            </div>
          )}

          {/* SECTION 1: STATS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Hours</span>
              <span className="text-xl font-black text-gray-900 mt-2">{report.totalHours}</span>
              <span className="text-[9px] text-gray-400 mt-1">Logged overall</span>
            </div>

            {report.includeBillable ? (
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Billable Hours</span>
                <span className="text-xl font-black mt-2" style={{ color: primaryColor }}>{report.billableHours}</span>
                <span className="text-[9px] text-gray-400 mt-1">Direct operations</span>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col justify-between opacity-60">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Billable split</span>
                <span className="text-xl font-black text-gray-500 mt-2">-</span>
                <span className="text-[9px] text-gray-400 mt-1">Excluded</span>
              </div>
            )}

            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Campaigns Active</span>
              <span className="text-xl font-black text-gray-900 mt-2">{report.campaignsCount}</span>
              <span className="text-[9px] text-gray-400 mt-1">Active scopes</span>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tasks Done</span>
              <span className="text-xl font-black text-green-600 mt-2">{report.tasksCount}</span>
              <span className="text-[9px] text-gray-400 mt-1">Completed items</span>
            </div>
          </div>

          {/* SECTION 2: CHARTS */}
          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Category Allocation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {categoryData.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-8">No category details.</p>
              ) : (
                <div className="h-44 relative flex items-center justify-center bg-white rounded-2xl border border-gray-100">
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
                    <span className="block text-sm font-black text-gray-800 leading-none">WEEKLY</span>
                    <span className="text-[8px] font-bold text-gray-400 uppercase mt-1 block">SUMMARY</span>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <p className="text-xs text-gray-600 leading-relaxed font-bold">Executive Narrative:</p>
                <p className="text-xs text-gray-500 leading-relaxed italic bg-white p-3.5 rounded-xl border border-gray-100">"{report.narrative}"</p>
              </div>
            </div>
          </div>

          {/* SECTION 3: WORK COMPLETED */}
          {report.includeWorkDone && (
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Work Completed</h3>
              
              <div className="space-y-4">
                {Object.keys(report.workCompleted || {}).map(cat => {
                  const list = report.workCompleted[cat] || [];
                  if (list.length === 0) return null;

                  const catDurationMs = report.categoryHours ? (report.categoryHours[cat] || 0) : 0;

                  return (
                    <div key={cat} className="space-y-1.5 bg-white p-4 rounded-xl border border-gray-100">
                      <div className="flex items-center justify-between border-b border-gray-50 pb-1.5">
                        <div className="flex items-center space-x-2">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_COLORS[cat]?.hex || '#9CA3AF' }} />
                          <span className="text-xs font-bold text-gray-800">{cat}</span>
                        </div>
                        {catDurationMs > 0 && (
                          <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-bold">
                            {formatMs(catDurationMs)}
                          </span>
                        )}
                      </div>
                      <ul className="list-disc pl-5 space-y-1">
                        {list.map((desc: string, idx: number) => {
                          const details = report.detailedWorkCompleted && report.detailedWorkCompleted[cat]
                            ? report.detailedWorkCompleted[cat].find((item: any) => item.description === desc)
                            : null;
                          const durationStr = details && details.durationMs > 0 ? ` (${formatMs(details.durationMs)})` : '';
                          return (
                            <li key={idx} className="text-xs text-gray-600 font-medium">
                              {desc}{durationStr}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
              </div>

              {/* Team Notes */}
              {report.teamNotes && (
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-xs font-bold text-gray-700 mb-1.5">Notes from the team</h4>
                  <div className="bg-white p-3 rounded-lg border border-gray-100 text-xs text-gray-600 leading-relaxed font-medium">
                    {report.teamNotes}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SECTION 4: UPCOMING PREVIEW */}
          {report.includeNextWeek && (
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 shadow-sm space-y-2">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Upcoming Objectives</h3>
              <p className="text-xs text-gray-500">Next week, focus shifts towards executing upcoming scheduled deliverables and objectives.</p>
            </div>
          )}

          {/* Footer */}
          <div className="pt-8 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center text-[10px] text-gray-400 gap-2">
            <span>Questions regarding this report? Email admin@example.com</span>
            <span>FreelanceOS Report Portal · Valid for 30 Days</span>
          </div>

        </div>

      </div>
    </div>
  );
};

const AlertCircleIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12" y1="16" y2="16.01"/></svg>
);
