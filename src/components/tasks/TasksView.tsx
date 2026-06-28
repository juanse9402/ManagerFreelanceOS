import React, { useState } from 'react';
import { CheckSquare, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const TasksView: React.FC = () => {
  const { activeClientId } = useAuth();
  const [view, setView] = useState<'weekly' | 'daily'>('weekly');
  const [tasks] = useState<any[]>([]); // Placeholder for tasks

  const handleCreateTask = () => {
    // Open task drawer
  };

  if (!activeClientId) {
    return (
      <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-gray-200 rounded-2xl m-6 bg-gray-50/50">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Select a Client</h3>
        <p className="text-gray-500 text-center max-w-md">Please select a client from the workspace selector to view tasks.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-card)] flex flex-col h-[calc(100vh-80px)] overflow-hidden m-4 sm:m-6">
      
      {/* Header & Filter Bar */}
      <div className="flex flex-col shrink-0 border-b border-gray-100">
        <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Tasks</h2>
          </div>
          
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button 
              onClick={() => setView('weekly')}
              className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${view === 'weekly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Weekly Board
            </button>
            <button 
              onClick={() => setView('daily')}
              className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${view === 'daily' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Daily Checklist
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="px-6 pb-4 flex items-center space-x-3 overflow-x-auto custom-scrollbar">
          <select className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] shrink-0">
            <option>All Campaigns</option>
          </select>
          <select className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] shrink-0">
            <option>Status: All</option>
            <option>To Do</option>
            <option>In Progress</option>
            <option>In Review</option>
            <option>Completed</option>
          </select>
          <select className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] shrink-0">
            <option>Phase: All</option>
          </select>
          <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 shrink-0">
            <button className="p-1 hover:bg-gray-200 rounded"><ChevronLeft size={14} /></button>
            <span className="text-sm font-medium px-2">This week</span>
            <button className="p-1 hover:bg-gray-200 rounded"><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto bg-gray-50/30 p-6 relative">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 animate-in fade-in">
            <div className="w-16 h-16 bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] rounded-full flex items-center justify-center mb-4">
              <CheckSquare size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No tasks this week.</h3>
            <p className="text-gray-500 text-center max-w-md mb-6">
              Add tasks to start tracking your progress.
            </p>
            <button 
              onClick={handleCreateTask}
              className="flex items-center space-x-2 px-5 py-2.5 bg-[var(--brand-primary)] text-white rounded-xl font-medium hover:opacity-90 transition-opacity shadow-sm"
            >
              <Plus size={18} />
              <span>Add Task</span>
            </button>
          </div>
        ) : (
          view === 'weekly' ? (
            <div className="h-full">
               {/* Weekly Board Layout Placeholder */}
            </div>
          ) : (
            <div className="max-w-2xl mx-auto h-full">
               {/* Daily Checklist Layout Placeholder */}
            </div>
          )
        )}
      </div>
    </div>
  );
};
