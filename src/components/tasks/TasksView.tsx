import React, { useState } from 'react';
import { CheckSquare, Plus, ChevronLeft, ChevronRight, Circle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const TasksView: React.FC = () => {
  const { activeClientId, role } = useAuth();
  const [view, setView] = useState<'weekly' | 'daily'>('weekly');

  // Mock tasks
  const allTasks = [
    { id: 1, title: 'Approve content strategy', phase: 'Strategy', priority: 'High', date: 'Today', status: 'To Do', client_visible: true, assignee: 'Admin' },
    { id: 2, title: 'Review Q3 visual assets', phase: 'Review', priority: 'Medium', date: 'Tomorrow', status: 'In Progress', client_visible: true, assignee: 'Admin' },
    { id: 3, title: 'Confirm budget for ads', phase: 'Planning', priority: 'High', date: 'This Week', status: 'To Do', client_visible: true, assignee: 'Admin' },
    { id: 4, title: 'Internal Review of Designs', phase: 'Production', priority: 'Medium', date: 'Today', status: 'In Progress', client_visible: false, assignee: 'Admin' },
  ];

  const tasks = role === 'client' ? allTasks.filter(t => t.client_visible) : allTasks;

  const handleCreateTask = () => {
    // Open task drawer (admin only)
  };

  if (!activeClientId && role === 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-gray-200 rounded-2xl m-6 bg-gray-50/50">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Select a Client</h3>
        <p className="text-gray-500 text-center max-w-md">Please select a client from the workspace selector to view tasks.</p>
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'High': return 'text-red-600 bg-red-50 border-red-100';
      case 'Medium': return 'text-amber-600 bg-amber-50 border-amber-100';
      default: return 'text-blue-600 bg-blue-50 border-blue-100';
    }
  };

  return (
    <div className="bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-card)] flex flex-col h-[calc(100vh-80px)] overflow-hidden m-4 sm:m-6">
      
      {/* Header & Filter Bar */}
      <div className="flex flex-col shrink-0 border-b border-gray-100">
        <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">{role === 'client' ? 'Task Tracker' : 'Tasks'}</h2>
            {role === 'client' && <p className="text-sm text-gray-500 mt-1">Track what your team is working on right now.</p>}
          </div>
          
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button 
              onClick={() => setView('weekly')}
              className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${view === 'weekly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {role === 'client' ? 'This Week' : 'Weekly Board'}
            </button>
            <button 
              onClick={() => setView('daily')}
              className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${view === 'daily' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {role === 'client' ? 'Today' : 'Daily Checklist'}
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
          <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 shrink-0 ml-auto">
            <button className="p-1 hover:bg-gray-200 rounded"><ChevronLeft size={14} /></button>
            <span className="text-sm font-medium px-2">{view === 'weekly' ? 'This week' : 'Today'}</span>
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
            {role === 'client' ? (
              <>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Your team is planning the next tasks.</h3>
                <p className="text-gray-500 text-center max-w-md mb-6">
                  Check back later to see what we're working on.
                </p>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-3 pb-10">
            {tasks.map(task => (
              <div key={task.id} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4 flex-1">
                  <div className="mt-1">
                    <Circle size={20} className="text-gray-300" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{task.title}</h4>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 border border-gray-200">
                        {task.phase}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className="text-xs text-gray-500 font-medium ml-2 border-l border-gray-300 pl-2">
                        {task.date}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-48 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100 mt-2 sm:mt-0">
                  <span className="text-sm font-semibold text-gray-700">{task.status}</span>
                  {role === 'admin' && (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 shrink-0" title={task.assignee}>
                      {task.assignee.charAt(0)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
