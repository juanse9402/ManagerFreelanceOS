import React, { useState, useEffect } from 'react';
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
import { StatusColumn } from './StatusColumn';
import { TaskCard } from './TaskCard';
import type { TaskType } from './TaskCard';
import { Plus, Filter } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const columns = [
  { id: 'todo', title: 'To Do', color: 'border-t-gray-400' },
  { id: 'in_progress', title: 'In Progress', color: 'border-t-blue-500' },
  { id: 'review', title: 'In Review', color: 'border-t-amber-500' },
  { id: 'done', title: 'Done', color: 'border-t-green-500' },
];

export const TasksView: React.FC = () => {
  const { activeClientId } = useAuth();
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, [activeClientId]);

  const fetchTasks = async () => {
    if (!activeClientId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('client_id', activeClientId);
        
      if (error) throw error;
      
      if (data) {
        setTasks(data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    if (!activeClientId) {
      alert("Please select a workspace client first.");
      return;
    }
    
    const newTask = {
      title: 'New Important Task',
      description: 'Describe the task requirements here...',
      status: 'todo',
      priority: 'medium',
      client_id: activeClientId
    };
    
    const { data, error } = await supabase.from('tasks').insert([newTask]).select();
    if (!error && data) {
      fetchTasks();
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId);
  };

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
    
    if (isActiveTask && isOverTask) {
      setTasks((prev) => {
        const activeIndex = prev.findIndex((t) => t.id === activeId);
        const overIndex = prev.findIndex((t) => t.id === overId);
        
        if (prev[activeIndex].status !== prev[overIndex].status) {
          const newTasks = [...prev];
          newTasks[activeIndex].status = prev[overIndex].status;
          updateTaskStatus(activeId, prev[overIndex].status);
          return arrayMove(newTasks, activeIndex, overIndex);
        }
        return arrayMove(prev, activeIndex, overIndex);
      });
    }

    const isOverColumn = over.data.current?.type === undefined;
    if (isActiveTask && isOverColumn) {
      setTasks((prev) => {
        const activeIndex = prev.findIndex((t) => t.id === activeId);
        const newTasks = [...prev];
        newTasks[activeIndex].status = String(overId);
        updateTaskStatus(activeId, String(overId));
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
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Tasks Board</h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">Manage project tasks and track progress.</p>
        </div>
        
        <div className="flex space-x-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
            <Filter size={16} />
            <span>Filters</span>
          </button>
          <button 
            onClick={handleCreateTask}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-3 py-2 bg-[var(--brand-primary)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--brand-primary)]/90 transition-colors shadow-sm"
          >
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
            {loading ? (
              <div className="flex w-full items-center justify-center text-gray-500 font-medium h-full">Loading tasks...</div>
            ) : columns.map(col => (
              <StatusColumn 
                key={col.id}
                id={col.id}
                title={col.title}
                color={col.color}
                tasks={tasks.filter(t => t.status === col.id)}
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
