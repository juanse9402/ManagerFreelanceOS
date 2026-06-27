import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Clock, CheckCircle, Eye, EyeOff, AlertCircle, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

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
    if (task.status === 'done' || !task.date) return false;
    const taskDate = new Date(task.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return taskDate < today;
  };

  const overdue = isOverdue();
  const isClientVisible = task.visibility === 'client_visible';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white p-4 rounded-xl border shadow-sm mb-3 group flex flex-col gap-3 relative transition-all ${
        isDragging ? 'opacity-50 border-[var(--brand-primary)]' : 
        overdue ? 'border-red-300 bg-red-50/30 hover:border-red-400' : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
      }`}
    >
      <div 
        className="absolute top-2 right-2 text-gray-400 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing p-1 bg-gray-50 rounded transition-opacity"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={16} />
      </div>

      <div className="flex items-center gap-2 pr-6 flex-wrap">
        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${getPriorityColor(task.category)}`}>
          {task.category || 'General'}
        </span>
        
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
      
      <div className="flex items-center justify-between mt-1 pt-3 border-t border-gray-50">
        <div className="flex items-center space-x-1 text-xs font-medium">
          {task.status === 'done' ? (
            <><CheckCircle size={14} className="text-green-500" /> <span className="text-green-600">Completed</span></>
          ) : (
            <><Clock size={14} className={overdue ? "text-red-400" : "text-gray-400"} /> <span className={overdue ? "text-red-500" : "text-gray-400"}>Active</span></>
          )}
        </div>
        {task.attachment_url && (
          <a 
            href={task.attachment_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-[var(--brand-primary)] transition-colors p-1"
            title="Ver adjunto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
          </a>
        )}
      </div>
    </div>
  );
};
