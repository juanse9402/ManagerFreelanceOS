import React, { useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Clock, CheckCircle, Eye, EyeOff, AlertCircle, FileText, Play, Square } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTimeTracking } from '../../contexts/TimeTrackingContext';
import { TaskDetailDrawer } from './TaskDetailDrawer';

export interface TaskType {
  id: string;
  title: string;
  category: string;
  date: string;
  status: string;
  client_id: string;
  project_id?: string;
  description?: string;
  internal_notes?: string;
  visibility?: string;
  attachment_url?: string;
}

interface TaskCardProps {
  task: TaskType;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const { role } = useAuth();
  const { activeTimer, startTimer, stopTimer, getTaskTimeLogged, getTaskEstimate, getTaskRecurrence } = useTimeTracking();
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  const recurrenceDays = getTaskRecurrence(task.id);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { type: 'Task', task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityColor = (category: string) => {
    if (!category) return 'bg-gray-100 text-gray-700';
    const c = category.toLowerCase();
    if (c.includes('urgent') || c.includes('important')) return 'bg-red-100 text-red-700';
    if (c.includes('design') || c.includes('ui')) return 'bg-purple-100 text-purple-700';
    if (c.includes('dev') || c.includes('code')) return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-700';
  };

  const isOverdue = () => {
    if (task.status === 'done' || task.status === 'Completed' || !task.date) return false;
    const taskDate = new Date(task.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return taskDate < today;
  };

  const overdue = isOverdue();
  const isClientVisible = task.visibility === 'client_visible';

  // Time tracking specific parameters
  const isTimerRunning = activeTimer?.taskId === task.id;
  const timeLoggedMs = getTaskTimeLogged(task.id);
  const estimate = getTaskEstimate(task.id);

  let estimateMs = 0;
  if (estimate) {
    estimateMs = estimate.unit === 'hours' ? estimate.value * 60 * 60 * 1000 : estimate.value * 60 * 1000;
  }

  const isOverrun = estimateMs > 0 && timeLoggedMs > estimateMs;

  const formatMs = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  };

  // Keyboard and tick live display on active timer card
  const [elapsed, setElapsed] = useState('0:00:00');
  useEffect(() => {
    if (!isTimerRunning) return;
    const tick = () => {
      const start = new Date(activeTimer!.startTime).getTime();
      const diff = Date.now() - start;
      const secs = Math.floor(diff / 1000) % 60;
      const mins = Math.floor(diff / (1000 * 60)) % 60;
      const hrs = Math.floor(diff / (1000 * 60 * 60));
      const pad = (n: number) => n.toString().padStart(2, '0');
      setElapsed(`${hrs}:${pad(mins)}:${pad(secs)}`);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, activeTimer]);

  const handleTimerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isTimerRunning) {
      stopTimer();
    } else {
      startTimer({
        description: task.title,
        clientId: task.client_id,
        campaignId: task.project_id || 'c1',
        taskId: task.id,
        category: 'Strategy',
        billable: true
      });
    }
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        onClick={() => setIsDetailOpen(true)}
        className={`bg-white p-4 rounded-xl border shadow-sm mb-3 group flex flex-col gap-3 relative transition-all cursor-pointer ${
          isDragging ? 'opacity-50 border-[var(--brand-primary)]' : 
          overdue ? 'border-red-300 bg-red-50/30 hover:border-red-400' : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
        }`}
      >
        <div 
          className="absolute top-2 right-2 text-gray-400 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing p-1 bg-gray-50 rounded transition-opacity"
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={16} />
        </div>

        <div className="flex items-center gap-2 pr-6 flex-wrap">
          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${getPriorityColor(task.category)}`}>
            {task.category || 'General'}
          </span>
          
          {recurrenceDays.length > 0 && (
            <span className="flex items-center text-[10px] text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100" title={`Se repite los días: ${recurrenceDays.join(', ')}`}>
              🔁 {recurrenceDays.join(', ')}
            </span>
          )}
          
          {role === 'admin' && (
            <span className="flex items-center text-[10px] text-gray-400 font-medium ml-auto" title={isClientVisible ? "Client can see this task" : "Hidden from client"}>
              {isClientVisible ? <Eye size={12} className="mr-1 text-blue-500" /> : <EyeOff size={12} className="mr-1" />}
              {isClientVisible ? 'Visible' : 'Internal'}
            </span>
          )}
        </div>
        
        <div>
          <p className={`font-bold text-sm leading-snug ${overdue ? 'text-red-900' : 'text-[var(--text-primary)]'}`}>
            {task.title}
          </p>
          
          {task.description && (
            <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{task.description}</p>
          )}

          {/* Task Estimate Progress bar */}
          {estimate && timeLoggedMs > 0 && (
            <div className="mt-2.5 space-y-1" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center text-[9px] font-bold text-gray-500">
                <span>{isOverrun ? 'OVERRUN!' : 'PROGRESS'}</span>
                <span>{formatMs(timeLoggedMs)} / {estimate.value}{estimate.unit === 'hours' ? 'h' : 'm'}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${isOverrun ? 'bg-orange-500' : 'bg-[var(--brand-primary)]'}`}
                  style={{ width: `${Math.min(100, (timeLoggedMs / estimateMs) * 100)}%` }}
                />
              </div>
              {isOverrun && (
                <p className="text-[9px] font-bold text-orange-600">
                  Overrun: {formatMs(timeLoggedMs - estimateMs)} over estimate
                </p>
              )}
            </div>
          )}
          
          {role === 'admin' && task.internal_notes && (
            <div className="mt-2 bg-amber-50 border border-amber-100 rounded p-2 flex items-start gap-1.5">
              <FileText size={12} className="text-amber-600 mt-0.5 shrink-0" />
              <p className="text-[10px] text-amber-800 line-clamp-2 leading-tight">{task.internal_notes}</p>
            </div>
          )}

          {task.date && (
            <div className={`flex items-center text-[10px] font-bold mt-2 uppercase tracking-wide ${overdue ? 'text-red-500' : 'text-gray-400'}`}>
              {overdue && <AlertCircle size={10} className="mr-1" />}
              Due: {task.date}
              {overdue && ' (Overdue)'}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between mt-1 pt-3 border-t border-gray-50">
          <div className="flex items-center space-x-2 text-xs font-semibold text-gray-500">
            {task.status === 'done' || task.status === 'Completed' ? (
              <span className="flex items-center text-green-600"><CheckCircle size={14} className="mr-1 text-green-500" /> Completed</span>
            ) : (
              <span className="flex items-center"><Clock size={14} className="mr-1 text-blue-500" /> Active</span>
            )}
            
            {/* Show total logged hours */}
            {timeLoggedMs > 0 && (
              <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-bold">
                ⏱️ {formatMs(timeLoggedMs)}
              </span>
            )}
          </div>

          {/* Quick-start timer play button (Admin only) */}
          {role === 'admin' && (
            <div className="flex items-center space-x-2">
              {isTimerRunning && (
                <span className="text-[9px] font-bold text-red-500 font-mono shrink-0">
                  {elapsed}
                </span>
              )}
              <button
                onClick={handleTimerClick}
                className={`p-1.5 rounded-full border transition-all shrink-0 ${
                  isTimerRunning
                    ? 'bg-red-500 border-red-600 text-white'
                    : 'bg-white border-gray-200 hover:border-[var(--brand-primary)] text-gray-400 hover:text-[var(--brand-primary)]'
                }`}
                title={isTimerRunning ? 'Stop active task timer' : 'Start tracking this task'}
              >
                {isTimerRunning ? <Square size={10} fill="white" /> : <Play size={10} fill="currentColor" />}
              </button>
            </div>
          )}
        </div>
      </div>

      <TaskDetailDrawer 
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        task={task}
      />
    </>
  );
};
