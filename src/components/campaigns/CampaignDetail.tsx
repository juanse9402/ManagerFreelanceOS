import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const CampaignDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { availableClients } = useAuth();
  
  const client = availableClients.find(c => c.id === id);
  const [activeTab, setActiveTab] = useState('Tasks');

  if (!client) {
    return <div className="p-8 text-center text-gray-500">Client not found</div>;
  }

  const tabs = ['Tasks', 'Content', 'Calendar', 'Progress'];

  return (
    <div className="flex flex-col h-full bg-gray-50/30">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-8 py-6 flex-shrink-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Campaign Details</h1>
            <div className="flex items-center space-x-3 text-sm">
              <span className="text-gray-500">Date Range: TBD</span>
              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded border border-blue-100">Planning</span>
            </div>
          </div>
          <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
            Edit Campaign
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-6 border-b border-gray-200">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-semibold transition-colors relative ${
                activeTab === tab 
                  ? 'text-[var(--brand-primary)]' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--brand-primary)] rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-8">
        {activeTab === 'Tasks' && (
          <div className="text-center py-12 animate-in fade-in duration-300">
            <h3 className="text-lg font-bold text-gray-900 mb-2">No tasks yet</h3>
            <p className="text-gray-500 mb-6">Add your first task to get started.</p>
            <button className="bg-[var(--brand-primary)] text-white px-4 py-2 rounded-lg font-semibold shadow-sm hover:bg-[var(--brand-primary)]/90">
              Add Task
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
