import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Camera, GripVertical } from 'lucide-react';

export interface TaskType {
  id: string;
  title: string;
  category: string;
  platform: string;
  assignee: string;
  status: string;
  dayId: string;
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

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Design': return 'bg-blue-100 text-blue-700';
      case 'Copywriting': return 'bg-amber-100 text-amber-700';
      case 'Publishing': return 'bg-green-100 text-green-700';
      case 'Analytics': return 'bg-purple-100 text-purple-700';
      case 'Production': return 'bg-rose-100 text-rose-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white p-3 rounded-lg border shadow-sm mb-3 group flex flex-col gap-2 relative ${
        isDragging ? 'opacity-50 border-[var(--brand-primary)]' : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div 
        className="absolute top-2 right-2 text-gray-400 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing p-1"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={16} />
      </div>

      <div className="flex items-center gap-2 pr-6">
        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${getCategoryColor(task.category)}`}>
          {task.category}
        </span>
        {task.platform === 'Instagram' && <Camera size={12} className="text-pink-600" />}
        {task.platform === 'TikTok' && <span className="font-bold bg-black text-white px-1 py-0.5 rounded text-[8px]">TT</span>}
      </div>
      
      <p className="font-semibold text-sm text-[var(--text-primary)] leading-snug">{task.title}</p>
      
      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center space-x-1.5">
          <div className="w-5 h-5 rounded-full bg-gray-200 overflow-hidden">
            <img src={`https://i.pravatar.cc/150?u=${task.assignee}`} alt={task.assignee} className="w-full h-full object-cover" />
          </div>
          <span className="text-[10px] text-[var(--text-muted)] font-medium truncate max-w-[60px]">{task.assignee}</span>
        </div>
        
        <div className="flex items-center">
          <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]" />
        </div>
      </div>
    </div>
  );
};
