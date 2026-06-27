import React, { useState, useEffect } from 'react';
import { LayoutDashboard, CheckSquare, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface TaskSummaryProps {
  onNavigateToTasks?: () => void;
}

export const TaskSummary: React.FC<TaskSummaryProps> = ({ onNavigateToTasks }) => {
  const { activeClientId } = useAuth();
  const [counts, setCounts] = useState({
    todo: 0,
    inProgress: 0,
    review: 0,
    done: 0,
    total: 0
  });

  useEffect(() => {
    fetchTaskCounts();
  }, [activeClientId]);

  const fetchTaskCounts = async () => {
    if (!activeClientId) return;
    
    const { data, error } = await supabase
      .from('tasks')
      .select('status')
      .eq('client_id', activeClientId);

    if (data && !error) {
      const newCounts = {
        todo: data.filter(t => t.status === 'todo').length,
        inProgress: data.filter(t => t.status === 'in_progress').length,
        review: data.filter(t => t.status === 'review').length,
        done: data.filter(t => t.status === 'done').length,
        total: data.length
      };
      setCounts(newCounts);
    }
  };

  const stats = [
    { label: 'Completed', value: counts.done, icon: <CheckSquare size={20} className="text-green-500" />, color: 'bg-green-50 text-green-700 border-green-100' },
    { label: 'In Progress', value: counts.inProgress, icon: <Clock size={20} className="text-[var(--brand-accent)]" />, color: 'bg-amber-50 text-amber-700 border-amber-100' },
    { label: 'To Do', value: counts.todo, icon: <LayoutDashboard size={20} className="text-[var(--brand-primary)]" />, color: 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] border-[var(--brand-primary)]/20' },
    { label: 'In Review', value: counts.review, icon: <AlertCircle size={20} className="text-purple-500" />, color: 'bg-purple-50 text-purple-700 border-purple-100' },
  ];

  const progressPercentage = counts.total > 0 ? Math.round((counts.done / counts.total) * 100) : 0;

  return (
    <div className="bg-white rounded-[var(--radius-card)] p-6 shadow-[var(--shadow-card)] flex flex-col justify-between">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Tasks Summary</h2>
        <span className="text-xs font-semibold px-2.5 py-1 bg-green-50 text-green-600 rounded-full flex items-center border border-green-100">
          <TrendingUp size={14} className="mr-1" /> Active
        </span>
      </div>
      
      {counts.total === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-6 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
          <LayoutDashboard size={32} className="text-gray-300 mb-3" />
          <h3 className="text-sm font-semibold text-gray-900 mb-1">No tasks yet</h3>
          <p className="text-xs text-gray-500 text-center max-w-[200px] mb-4">
            Start organizing your work by creating your first task.
          </p>
          <button 
            onClick={onNavigateToTasks}
            className="text-xs font-medium text-[var(--brand-primary)] hover:underline"
          >
            Go to Task Manager
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                onClick={onNavigateToTasks}
                className={`p-4 rounded-xl border ${stat.color} flex flex-col items-start cursor-pointer hover:shadow-md hover:scale-105 transition-all active:scale-95`}
                title="Go to Tasks module"
              >
                <div className="bg-white p-2 rounded-lg shadow-sm mb-3">
                  {stat.icon}
                </div>
                <span className="text-2xl font-bold mb-1">{stat.value}</span>
                <span className="text-xs font-medium opacity-80 uppercase tracking-wide">{stat.label}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Overall Progress</h3>
            <div className="flex items-center space-x-4">
              <div className="flex-1 overflow-hidden h-2.5 text-xs flex rounded-full bg-gray-100">
                <div style={{ width: `${progressPercentage}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[var(--brand-accent)] transition-all duration-500"></div>
              </div>
              <span className="text-sm font-medium text-[var(--text-muted)]">{counts.done}/{counts.total}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
