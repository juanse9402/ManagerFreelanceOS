import React from 'react';
import { X, Clock, FileText, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTimeTracking } from '../../contexts/TimeTrackingContext';

interface TaskDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  task: any | null;
}

export const TaskDetailDrawer: React.FC<TaskDetailDrawerProps> = ({ isOpen, onClose, task }) => {
  const { role } = useAuth();
  const { getTaskEstimate, getTaskTimeLogged, timeEntries } = useTimeTracking();

  if (!isOpen || !task) return null;

  // Estimate calculations
  const estimate = getTaskEstimate(task.id);
  const timeLoggedMs = getTaskTimeLogged(task.id);

  // Convert estimate to milliseconds for progress comparison
  let estimateMs = 0;
  if (estimate) {
    if (estimate.unit === 'hours') {
      estimateMs = estimate.value * 60 * 60 * 1000;
    } else {
      estimateMs = estimate.value * 60 * 1000;
    }
  }

  const isOverrun = estimateMs > 0 && timeLoggedMs > estimateMs;
  const overrunMs = timeLoggedMs - estimateMs;

  const formatMs = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  };

  // Filter entries linked to this task
  const linkedEntries = timeEntries.filter(entry => entry.taskId === task.id);

  // Progress Bar percentage
  const progressPercent = estimateMs > 0 ? Math.min(100, (timeLoggedMs / estimateMs) * 100) : 0;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`fixed inset-y-0 right-0 w-full md:w-[450px] bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} font-sans`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 shrink-0 bg-gray-50/50">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center">
            <FileText size={16} className="mr-2 text-[var(--brand-primary)]" />
            Task Details
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          
          {/* Title & Category */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
              {task.category || 'General'}
            </span>
            <h3 className="text-lg font-bold text-gray-900 leading-snug">{task.title}</h3>
            <p className="text-xs text-gray-400">Due Date: {task.date || 'No due date'}</p>
          </div>

          {/* Status Badge */}
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500 font-semibold">Status</span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
              task.status === 'done' || task.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {task.status}
            </span>
          </div>

          {/* Estimate Progress Bar */}
          {estimate && (
            <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm space-y-3">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-gray-500 uppercase tracking-wide">Time Progress</span>
                <span className={isOverrun ? 'text-orange-600' : 'text-gray-700'}>
                  {formatMs(timeLoggedMs)} logged / {estimate.value}{estimate.unit === 'hours' ? 'h' : 'm'} est
                </span>
              </div>

              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${isOverrun ? 'bg-orange-500' : 'bg-[var(--brand-primary)]'}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {isOverrun && (
                <div className="flex items-start space-x-1.5 text-xs text-orange-700 bg-orange-50 border border-orange-100 p-2.5 rounded-lg font-medium">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>Overrun: {formatMs(overrunMs)} over estimate</span>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          {task.description && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Description</h4>
              <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100/50">{task.description}</p>
            </div>
          )}

          {/* Internal Notes (Admin only) */}
          {role === 'admin' && task.internal_notes && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wide">Internal Notes (Admin only)</h4>
              <p className="text-xs text-amber-900 leading-relaxed bg-amber-50 p-3 rounded-lg border border-amber-100">{task.internal_notes}</p>
            </div>
          )}

          {/* Time Logged Entries list */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide flex items-center">
              <Clock size={14} className="mr-1.5 text-gray-400" />
              Time Logged
            </h4>

            <div className="space-y-2">
              {linkedEntries.map(entry => {
                const duration = new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime();
                return (
                  <div key={entry.id} className="p-3 bg-gray-50/50 border border-gray-100 rounded-lg flex justify-between items-center text-xs">
                    <div className="space-y-0.5 truncate pr-2">
                      <p className="font-semibold text-gray-800 truncate">{entry.description}</p>
                      <p className="text-[10px] text-gray-400 font-semibold">{new Date(entry.date + 'T00:00:00').toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}</p>
                    </div>
                    <span className="font-mono font-bold text-gray-700 shrink-0">{formatMs(duration)}</span>
                  </div>
                );
              })}

              {linkedEntries.length === 0 && (
                <p className="text-xs text-gray-400 italic text-center py-4">No hours logged to this task yet.</p>
              )}
            </div>
          </div>

        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex space-x-2 shrink-0">
          <button 
            onClick={onClose}
            className="w-full py-2 bg-gray-800 text-white rounded-lg text-xs font-semibold hover:bg-gray-900 transition-colors"
          >
            Close Details
          </button>
        </div>

      </div>
    </>
  );
};
