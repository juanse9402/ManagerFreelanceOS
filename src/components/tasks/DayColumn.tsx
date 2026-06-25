import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TaskCard } from './TaskCard';
import type { TaskType } from './TaskCard';

interface DayColumnProps {
  id: string;
  title: string;
  date: string;
  tasks: TaskType[];
  workload: 'low' | 'medium' | 'high';
}

export const DayColumn: React.FC<DayColumnProps> = ({ id, title, date, tasks, workload }) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="flex flex-col h-full bg-gray-50/50 rounded-xl border border-gray-100 shrink-0 w-[280px]">
      {/* Column Header */}
      <div className="p-3 border-b border-gray-100 bg-white rounded-t-xl">
        <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-[var(--text-primary)]">{title}</h3>
        <span className="text-xs text-[var(--text-muted)] font-medium">{date}</span>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
          {tasks.length} tasks
        </span>
        <div className={`w-2 h-2 rounded-full ${
          workload === 'high' ? 'bg-red-500' :
          workload === 'medium' ? 'bg-amber-500' :
          'bg-green-500'
        }`} title={`Workload: ${workload}`}></div>
      </div>
      </div>
      
      {/* Droppable Area */}
      <div 
        ref={setNodeRef}
        className={`flex-1 p-3 overflow-y-auto custom-scrollbar transition-colors ${
          isOver ? 'bg-gray-100/80 ring-2 ring-inset ring-[var(--brand-primary)]/20' : ''
        }`}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>
        
        {tasks.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg opacity-50 p-4 text-center text-xs">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
};
