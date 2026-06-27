import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Clock, CheckCircle } from 'lucide-react';

export interface TaskType {
  id: string;
  title: string;
  category: string;
  date: string;
  status: string;
  client_id: string;
  project_id?: string;
  description?: string;
  attachment_url?: string;
}

interface TaskCardProps {
  task: TaskType;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
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
    // We can map some categories to colors, or just a default
    if (!category) return 'bg-gray-100 text-gray-700';
    const c = category.toLowerCase();
    if (c.includes('urgent') || c.includes('important')) return 'bg-red-100 text-red-700';
    if (c.includes('design') || c.includes('ui')) return 'bg-purple-100 text-purple-700';
    if (c.includes('dev') || c.includes('code')) return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white p-4 rounded-lg border shadow-sm mb-3 group flex flex-col gap-3 relative ${
        isDragging ? 'opacity-50 border-[var(--brand-primary)]' : 'border-gray-200 hover:border-gray-300 hover:shadow'
      }`}
    >
      <div 
        className="absolute top-2 right-2 text-gray-400 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing p-1 bg-gray-50 rounded"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={16} />
      </div>

      <div className="flex items-center gap-2 pr-6">
        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${getPriorityColor(task.category)}`}>
          {task.category || 'General'}
        </span>
      </div>
      
      <div>
        <p className="font-bold text-sm text-[var(--text-primary)] leading-snug">{task.title}</p>
        {task.description && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>
        )}
        {task.date && (
          <p className="text-[10px] font-semibold text-gray-400 mt-2 uppercase tracking-wide">Due: {task.date}</p>
        )}
      </div>
      
      <div className="flex items-center justify-between mt-1 pt-3 border-t border-gray-50">
        <div className="flex items-center space-x-1 text-xs text-gray-400 font-medium">
          {task.status === 'done' ? (
            <><CheckCircle size={14} className="text-green-500" /> <span className="text-green-600">Completed</span></>
          ) : (
            <><Clock size={14} /> <span>Active</span></>
          )}
        </div>
        {task.attachment_url && (
          <a 
            href={task.attachment_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-[var(--brand-primary)] transition-colors"
            title="Ver adjunto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
          </a>
        )}
      </div>
    </div>
  );
};
