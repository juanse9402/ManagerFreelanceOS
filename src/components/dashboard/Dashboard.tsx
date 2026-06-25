import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { ProjectProgress } from './ProjectProgress';
import { TaskSummary } from './TaskSummary';
import { NextContentPreview } from './NextContentPreview';
import { ProjectModal } from './ProjectModal';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface DashboardProps {
  setActiveView: (view: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setActiveView }) => {
  const { role, profileName, session } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    setLoading(true);
    // Because of RLS, clients will automatically only get their projects,
    // and admins will get all projects.
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (data && !error) {
      setProjects(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, [session]);

  const activeProject = projects.length > 0 ? projects[0] : null;

  return (
    <div className="space-y-6 relative min-h-full pb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>
          <div className="text-sm text-[var(--text-muted)] mt-1">Welcome back, <span className="font-semibold text-gray-700">{profileName || 'Team'}</span> 👋</div>
        </div>
        
        {role === 'admin' && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-[var(--brand-primary)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--brand-primary)]/90 shadow-sm transition-colors shrink-0"
          >
            <Plus size={16} />
            <span>New Project</span>
          </button>
        )}
      </div>
      
      {/* Top row: Progress & Tasks Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProjectProgress project={activeProject} loading={loading} />
        <TaskSummary onNavigateToTasks={() => setActiveView('tasks')} />
      </div>
      
      {/* Bottom row: Next content preview & Recent Activity (Placeholder) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <NextContentPreview />
        </div>
        <div className="bg-white rounded-[var(--radius-card)] p-6 shadow-[var(--shadow-card)] flex flex-col h-full max-h-[400px]">
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4 shrink-0">Recent Activity</h2>
          <div className="space-y-4 relative flex-1 overflow-y-auto custom-scrollbar before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
            {/* Timeline item mock */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-green-100 text-green-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                <svg className="fill-current" xmlns="http://www.w3.org/2000/svg" width="12" height="10">
                  <path fillRule="nonzero" d="M10.422 1.257 4.655 7.025 2.553 4.923A.896.896 0 0 0 1.284 6.19l2.736 2.736a.897.897 0 0 0 1.268 0l6.402-6.402a.896.896 0 1 0-1.268-1.267Z" />
                </svg>
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-3 rounded shadow-sm border border-gray-50 z-10">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-bold text-[var(--text-primary)] text-sm">System Ready</div>
                  <time className="text-xs font-medium text-[var(--brand-primary)]">Now</time>
                </div>
                <div className="text-xs text-[var(--text-muted)]">FreelanceOS database connected.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ProjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={fetchProjects}
      />
    </div>
  );
};
