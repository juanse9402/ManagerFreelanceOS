import React, { useState } from 'react';
import { Plus, CheckSquare } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { StatusColumn } from './StatusColumn';
import type { TaskType } from './TaskCard';
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { TaskCard } from './TaskCard';

export const TasksView: React.FC = () => {
  const { activeClientId, role } = useAuth();
  
  // Mock tasks
  const initialTasks: TaskType[] = [
    { id: '1', title: 'Approve content strategy', category: 'Strategy', date: '2026-07-01', status: 'To Do', client_id: 'client_1', visibility: 'client_visible' },
    { id: '2', title: 'Review Q3 visual assets', category: 'Review', date: '2026-07-02', status: 'In Progress', client_id: 'client_1', visibility: 'client_visible' },
    { id: '3', title: 'Confirm budget for ads', category: 'Planning', date: '2026-07-05', status: 'To Do', client_id: 'client_1', visibility: 'client_visible' },
    { id: '4', title: 'Internal Review of Designs', category: 'Production', date: '2026-07-01', status: 'In Progress', client_id: 'client_1', visibility: 'internal' },
    { id: '5', title: 'Update bio links', category: 'General', date: '2026-06-25', status: 'In Review', client_id: 'client_1', visibility: 'client_visible' },
    { id: '6', title: 'Draft new campaign copy', category: 'Copywriting', date: '2026-07-10', status: 'Needs Changes', client_id: 'client_1', visibility: 'client_visible' },
    { id: '7', title: 'Finalize brand guidelines', category: 'Design', date: '2026-06-20', status: 'Completed', client_id: 'client_1', visibility: 'client_visible' }
  ];

  const [tasks, setTasks] = useState<TaskType[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<TaskType | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const columns = [
    { id: 'To Do', title: 'To Do', color: 'border-t-gray-400' },
    { id: 'In Progress', title: 'In Progress', color: 'border-t-blue-500' },
    { id: 'In Review', title: 'In Review', color: 'border-t-amber-500' },
    { id: 'Needs Changes', title: 'Needs Changes', color: 'border-t-red-500' },
    { id: 'Completed', title: 'Completed', color: 'border-t-green-500' }
  ];

  // Filter tasks for client
  const visibleTasks = role === 'client' ? tasks.filter(t => t.visibility === 'client_visible') : tasks;

  if (!activeClientId && role === 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-gray-200 rounded-2xl m-6 bg-gray-50/50">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Select a Client</h3>
        <p className="text-gray-500 text-center max-w-md">Please select a client from the workspace selector to view tasks.</p>
      </div>
    );
  }

  const handleDragStart = (event: any) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveTask(null);
    
    if (!over || role === 'client') return; // Clients cannot move tasks
    
    const activeId = active.id;
    const overId = over.id;
    
    // Find if we dropped over a task or over a column
    const overColumnId = columns.find(c => c.id === overId)?.id || tasks.find(t => t.id === overId)?.status;
    
    if (!overColumnId) return;

    setTasks(prev => {
      const activeTaskIndex = prev.findIndex(t => t.id === activeId);
      if (activeTaskIndex === -1) return prev;
      
      const newTasks = [...prev];
      if (newTasks[activeTaskIndex].status !== overColumnId) {
        newTasks[activeTaskIndex] = { ...newTasks[activeTaskIndex], status: overColumnId };
      }
      return newTasks;
    });
  };

  const handleCreateTask = () => {
    // Placeholder for creating task
    alert("Create task functionality goes here.");
  };

  return (
    <div className="bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-card)] flex flex-col h-[calc(100vh-80px)] overflow-hidden m-4 sm:m-6">
      {/* Header */}
      <div className="flex flex-col shrink-0 border-b border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Task Tracker</h2>
            <p className="text-sm text-gray-500 mt-1">
              {role === 'client' ? 'Track what your team is working on right now.' : 'Manage project tasks.'}
            </p>
          </div>
          
          {role === 'admin' && (
            <button 
              onClick={handleCreateTask}
              className="flex items-center space-x-2 px-5 py-2.5 bg-[var(--brand-primary)] text-white rounded-xl font-medium hover:opacity-90 transition-opacity shadow-sm"
            >
              <Plus size={18} />
              <span>Add Task</span>
            </button>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden bg-gray-50/30 p-6 relative flex gap-6 custom-scrollbar">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 animate-in fade-in absolute inset-6">
            <div className="w-16 h-16 bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] rounded-full flex items-center justify-center mb-4">
              <CheckSquare size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No tasks available.</h3>
            <p className="text-gray-500 text-center max-w-md mb-6">
              {role === 'client' ? 'Your team is planning the next tasks.' : 'Add tasks to start tracking your progress.'}
            </p>
          </div>
        ) : (
          <DndContext
            sensors={role === 'admin' ? sensors : undefined} // Only admin gets sensors
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {columns.map(column => (
              <StatusColumn
                key={column.id}
                id={column.id}
                title={column.title}
                color={column.color}
                tasks={visibleTasks.filter(t => t.status === column.id)}
              />
            ))}
            {role === 'admin' && (
              <DragOverlay>
                {activeTask ? <TaskCard task={activeTask} /> : null}
              </DragOverlay>
            )}
          </DndContext>
        )}
      </div>
    </div>
  );
};
