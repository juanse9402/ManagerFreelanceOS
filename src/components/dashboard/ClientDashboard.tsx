import React, { useState, useEffect } from 'react';
import { ProjectProgress } from './ProjectProgress';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Clock, Calendar as CalendarIcon, CheckCircle, AlertCircle } from 'lucide-react';

interface ClientDashboardProps {
  setActiveView: (view: string) => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ setActiveView }) => {
  const { profileName, session, activeClientId } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, [session, activeClientId]);

  const fetchData = async () => {
    if (!activeClientId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    // Fetch active project
    const { data: projectData } = await supabase
      .from('projects')
      .select('*')
      .eq('client_id', activeClientId)
      .order('created_at', { ascending: false });
      
    if (projectData) {
      setProjects(projectData);
    }

    // Fetch pending approvals
    const { data: approvalData } = await supabase
      .from('content_posts')
      .select('*')
      .eq('client_id', activeClientId)
      .eq('status', 'In Review');
    
    if (approvalData) {
      setPendingApprovals(approvalData);
    }

    setLoading(false);
  };

  const activeProject = projects.length > 0 ? projects[0] : null;

  return (
    <div className="space-y-6 relative min-h-full pb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Overview</h1>
          <div className="text-sm text-[var(--text-muted)] mt-1">Welcome back, <span className="font-semibold text-gray-700">{profileName || 'Client'}</span> 👋</div>
        </div>
      </div>
      
      {/* Pending review list */}
      {pendingApprovals.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center text-amber-800">
            <AlertCircle size={20} className="mr-3" />
            <div>
              <p className="font-bold">You have {pendingApprovals.length} items waiting for your review</p>
              <p className="text-sm text-amber-700">Please review them to keep the content schedule on track.</p>
            </div>
          </div>
          <button 
            onClick={() => setActiveView('approvals')}
            className="px-4 py-2 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700 transition-colors shadow-sm"
          >
            Review Now
          </button>
        </div>
      )}

      {/* Main layout: Project Progress (Full width or main column) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Progress & Upcoming */}
        <div className="lg:col-span-2 space-y-6">
          <ProjectProgress project={activeProject} loading={loading} isClientView={true} />
          
          {/* 7-day upcoming strip */}
          <div className="bg-white rounded-[var(--radius-card)] p-6 shadow-[var(--shadow-card)] border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Upcoming 7 Days</h2>
              <button 
                onClick={() => setActiveView('calendar')}
                className="text-sm font-medium text-[var(--brand-primary)] hover:underline flex items-center"
              >
                View full calendar <CalendarIcon size={14} className="ml-1" />
              </button>
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
              {Array.from({ length: 7 }).map((_, i) => {
                const date = new Date();
                date.setDate(date.getDate() + i);
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                const dayNum = date.getDate();
                const hasPost = i === 2 || i === 4; // Mock logic
                
                return (
                  <div key={i} className={`flex-shrink-0 w-20 flex flex-col items-center p-3 rounded-xl border ${hasPost ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/5' : 'border-gray-100 bg-gray-50/50'}`}>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{dayName}</span>
                    <span className={`text-xl font-bold my-1 ${hasPost ? 'text-[var(--brand-primary)]' : 'text-gray-800'}`}>{dayNum}</span>
                    {hasPost ? (
                      <span className="w-2 h-2 rounded-full bg-[var(--brand-primary)] mt-1"></span>
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-transparent mt-1"></span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Right Column: Activity Feed */}
        <div className="bg-white rounded-[var(--radius-card)] p-6 shadow-[var(--shadow-card)] flex flex-col border border-gray-100">
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4 shrink-0">Activity Feed</h2>
          <div className="space-y-4 relative flex-1 overflow-y-auto custom-scrollbar before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
            {/* Timeline items mock */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-green-100 text-green-500 shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                <CheckCircle size={16} className="text-green-600" />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-3 rounded-xl shadow-sm border border-gray-100 z-10">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-bold text-[var(--text-primary)] text-sm">Post Approved</div>
                  <time className="text-[10px] font-bold text-gray-400">2h ago</time>
                </div>
                <div className="text-xs text-[var(--text-muted)]">"Educational Reel" is scheduled.</div>
              </div>
            </div>

            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-100 text-blue-500 shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                <Clock size={16} className="text-blue-600" />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-3 rounded-xl shadow-sm border border-gray-100 z-10">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-bold text-[var(--text-primary)] text-sm">Review Needed</div>
                  <time className="text-[10px] font-bold text-gray-400">5h ago</time>
                </div>
                <div className="text-xs text-[var(--text-muted)]">3 new posts added to calendar.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
