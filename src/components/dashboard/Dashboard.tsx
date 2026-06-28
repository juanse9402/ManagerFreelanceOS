import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Users, Clock, CheckSquare, Calendar, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC<{ setActiveView: (v: string) => void }> = ({ setActiveView }) => {
  const { profileName, availableClients, role } = useAuth();
  const navigate = useNavigate();

  if (role === 'admin' && availableClients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full m-8 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50 animate-in fade-in">
        <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-4">
          <Users size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Your workspace is empty.</h3>
        <p className="text-gray-500 text-center max-w-md mb-6">
          Start by adding a client. Everything else flows from there.
        </p>
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('open-client-drawer'))}
          className="flex items-center space-x-2 px-5 py-2.5 bg-[var(--brand-primary)] text-white rounded-xl font-medium shadow-sm hover:opacity-90 transition-opacity"
        >
          <Plus size={18} />
          <span>Add Client</span>
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Welcome back, {profileName?.split(' ')[0] || 'Admin'}. Here's what's happening across your workspace.
        </p>
      </div>

      {/* Top - Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">Active Clients</span>
            <Users size={16} className="text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{availableClients.length}</div>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-[var(--brand-accent)] shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[var(--brand-accent)]/10 rounded-bl-full -mr-8 -mt-8"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">Pending Approvals</span>
            <Clock size={16} className="text-[var(--brand-accent)]" />
          </div>
          <div className="text-2xl font-bold text-[var(--brand-accent)]">2</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">Tasks Due This Week</span>
            <CheckSquare size={16} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">5</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">Pieces Scheduled Today</span>
            <Calendar size={16} className="text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">0</div>
        </div>
      </div>

      {/* Middle - Active Projects Panel */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Active Projects</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {availableClients.slice(0, 4).map(client => (
            <div key={client.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600">
                    {client.full_name?.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{client.full_name}</h3>
                    <p className="text-xs text-gray-500">Various Industries</p>
                  </div>
                </div>
                <button 
                  onClick={() => navigate(`/admin/clients/${client.id}`)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <ArrowRight size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium text-gray-500">Overall Progress (Planning)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full bg-blue-500 w-1/4"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium text-gray-500">Tasks this week</span>
                    <span className="font-bold text-gray-900">0%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full bg-gray-200 w-0"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom - Activity Feed */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-8 text-center">
          <p className="text-gray-500 text-sm">No recent activity.</p>
          <p className="text-gray-400 text-xs mt-1">Activity across all your clients will appear here.</p>
        </div>
      </div>

    </div>
  );
};
