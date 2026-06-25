import React, { useState } from 'react';
import { 
  DndContext, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable';
import { DayColumn } from './DayColumn';
import { TaskCard } from './TaskCard';
import type { TaskType } from './TaskCard';
import { Plus, Filter } from 'lucide-react';

const initialTasks: TaskType[] = [
  { id: 't1', title: 'Design Carousel "SEO Myths"', category: 'Design', platform: 'Instagram', assignee: 'Anna', status: 'Pending', dayId: 'day-1' },
  { id: 't2', title: 'Approve copy Reel Productivity', category: 'Copywriting', platform: 'Instagram', assignee: 'David', status: 'Pending', dayId: 'day-1' },
  { id: 't3', title: 'Record TikTok Behind the Scenes', category: 'Production', platform: 'TikTok', assignee: 'Anna', status: 'Pending', dayId: 'day-2' },
  { id: 't4', title: 'Review Q1 metrics campaign', category: 'Analytics', platform: 'Todas', assignee: 'Laura', status: 'Pending', dayId: 'day-3' },
  { id: 't5', title: 'Schedule posts week 3', category: 'Publishing', platform: 'Instagram', assignee: 'Anna', status: 'Pending', dayId: 'day-4' },
];

const days = [
  { id: 'day-1', title: 'Monday', date: '15 Jun', workload: 'high' as const },
  { id: 'day-2', title: 'Tuesday', date: '16 Jun', workload: 'low' as const },
  { id: 'day-3', title: 'Wednesday', date: '17 Jun', workload: 'medium' as const },
  { id: 'day-4', title: 'Thursday', date: '18 Jun', workload: 'low' as const },
  { id: 'day-5', title: 'Friday', date: '19 Jun', workload: 'medium' as const },
  { id: 'day-6', title: 'Saturday', date: '20 Jun', workload: 'low' as const },
  { id: 'day-7', title: 'Sunday', date: '21 Jun', workload: 'low' as const },
];

export const TasksView: React.FC = () => {
  const [tasks, setTasks] = useState<TaskType[]>(initialTasks);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event: any) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === 'Task';
    const isOverTask = over.data.current?.type === 'Task';
    
    // Si movemos tarea sobre otra tarea
    if (isActiveTask && isOverTask) {
      setTasks((prev) => {
        const activeIndex = prev.findIndex((t) => t.id === activeId);
        const overIndex = prev.findIndex((t) => t.id === overId);
        
        if (prev[activeIndex].dayId !== prev[overIndex].dayId) {
          const newTasks = [...prev];
          newTasks[activeIndex].dayId = prev[overIndex].dayId;
          return arrayMove(newTasks, activeIndex, overIndex);
        }
        return arrayMove(prev, activeIndex, overIndex);
      });
    }

    // Si movemos tarea sobre la columna vacía
    const isOverColumn = over.data.current?.type === undefined; // droppable id = day-X
    if (isActiveTask && isOverColumn) {
      setTasks((prev) => {
        const activeIndex = prev.findIndex((t) => t.id === activeId);
        const newTasks = [...prev];
        newTasks[activeIndex].dayId = String(overId);
        return arrayMove(newTasks, activeIndex, activeIndex); 
      });
    }
  };

  const handleDragEnd = (event: any) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const activeIndex = tasks.findIndex((t) => t.id === active.id);
    const overIndex = tasks.findIndex((t) => t.id === over.id);

    if (activeIndex !== overIndex) {
      setTasks((tasks) => arrayMove(tasks, activeIndex, overIndex));
    }
  };

  const activeTask = activeId ? tasks.find(t => t.id === activeId) : null;

  return (
    <div className="bg-white rounded-[var(--radius-card)] p-6 shadow-[var(--shadow-card)] flex flex-col h-[calc(100vh-120px)] overflow-hidden">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 shrink-0">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Weekly Tasks</h2>
        
        <div className="flex space-x-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
            <Filter size={16} />
            <span>Filters</span>
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-3 py-2 bg-[var(--brand-primary)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--brand-primary)]/90 transition-colors">
            <Plus size={16} />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto custom-scrollbar pb-4 -mx-2 px-2">
        <div className="flex gap-4 h-full min-w-max">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            {days.map(day => (
              <DayColumn 
                key={day.id}
                id={day.id}
                title={day.title}
                date={day.date}
                workload={day.workload}
                tasks={tasks.filter(t => t.dayId === day.id)}
              />
            ))}

            <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.4' } } }) }}>
              {activeTask ? <TaskCard task={activeTask} /> : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
    </div>
  );
};
