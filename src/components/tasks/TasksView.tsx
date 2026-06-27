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
import { CreateTaskModal } from './CreateTaskModal';
import type { TaskType } from './TaskCard';
import { Plus, Filter, CheckSquare } from 'lucide-react';
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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, [activeClientId]);

  const fetchTasks = async () => {
    if (!activeClientId) {
      setLoading(false);
      return;
    }
    
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

  const handleCreateTask = () => {
    if (!activeClientId) {
      alert("Please select a workspace client first.");
      return;
    }
    setIsCreateModalOpen(true);
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

      {/* Kanban Board or Empty State */}
      <div className="flex-1 overflow-x-auto custom-scrollbar pb-4 -mx-2 px-2 relative">
        {loading ? (
          <div className="flex w-full items-center justify-center text-gray-500 font-medium h-full">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-gray-200 rounded-2xl mx-2 bg-gray-50/50">
            <div className="w-16 h-16 bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] rounded-full flex items-center justify-center mb-4">
              <CheckSquare size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-500 text-center max-w-md mb-6">
              There are no tasks for this workspace yet. Create your first task to start organizing your project.
            </p>
            <button 
              onClick={handleCreateTask}
              className="flex items-center space-x-2 px-5 py-2.5 bg-[var(--brand-primary)] text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
            >
              <Plus size={18} />
              <span>Create First Task</span>
            </button>
          </div>
        ) : (
          <div className="flex gap-4 h-full min-w-max">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              {columns.map(col => (
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
        )}
      </div>

      <CreateTaskModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={fetchTasks}
      />
    </div>
  );
};
