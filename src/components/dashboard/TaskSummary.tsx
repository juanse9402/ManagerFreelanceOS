import React from 'react';
import { LayoutDashboard, CheckSquare, Clock, AlertCircle, TrendingUp } from 'lucide-react';

interface TaskSummaryProps {
  onNavigateToTasks?: () => void;
}

export const TaskSummary: React.FC<TaskSummaryProps> = ({ onNavigateToTasks }) => {
  const stats = [
    { label: 'Completed', value: 12, icon: <CheckSquare size={20} className="text-green-500" />, color: 'bg-green-50 text-green-700 border-green-100' },
    { label: 'In Progress', value: 5, icon: <Clock size={20} className="text-[var(--brand-accent)]" />, color: 'bg-amber-50 text-amber-700 border-amber-100' },
    { label: 'Pending', value: 8, icon: <LayoutDashboard size={20} className="text-[var(--brand-primary)]" />, color: 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] border-[var(--brand-primary)]/20' },
    { label: 'Blocked', value: 1, icon: <AlertCircle size={20} className="text-red-500" />, color: 'bg-red-50 text-red-700 border-red-100' },
  ];

  return (
    <div className="bg-white rounded-[var(--radius-card)] p-6 shadow-[var(--shadow-card)] flex flex-col justify-between">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Weekly Tasks</h2>
        <span className="text-xs font-semibold px-2.5 py-1 bg-green-50 text-green-600 rounded-full flex items-center border border-green-100">
          <TrendingUp size={14} className="mr-1" /> +12%
        </span>
      </div>
      
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
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Weekly Progress</h3>
        <div className="flex items-center space-x-4">
          <div className="flex-1 overflow-hidden h-2.5 text-xs flex rounded-full bg-gray-100">
            <div style={{ width: '60%' }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[var(--brand-accent)]"></div>
          </div>
          <span className="text-sm font-medium text-[var(--text-muted)]">12/20</span>
        </div>
      </div>
    </div>
  );
};
