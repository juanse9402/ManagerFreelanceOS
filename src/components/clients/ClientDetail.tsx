import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Settings, BarChart2, CheckSquare, Image } from 'lucide-react';

export const ClientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { availableClients } = useAuth();
  const navigate = useNavigate();
  
  const client = availableClients.find(c => c.id === id);
  const [activeTab, setActiveTab] = useState('Overview');
  
  if (!client) {
    return <div className="p-8 text-center text-gray-500">Client not found</div>;
  }

  const tabs = ['Overview', 'Campaigns', 'Brand Setup', 'Access & Permissions'];

  return (
    <div className="flex flex-col h-full bg-gray-50/30">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-8 py-6 flex-shrink-0">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl shadow-sm border border-gray-50"
                 style={{ 
                   backgroundColor: client.brand_settings?.primaryColor ? `${client.brand_settings.primaryColor}20` : '#F3F4F6',
                   color: client.brand_settings?.primaryColor || '#6B7280'
                 }}>
              {client.full_name?.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center space-x-3 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">{client.full_name}</h1>
                <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-100">Active</span>
              </div>
              <p className="text-sm text-gray-500">Various Industries</p>
            </div>
          </div>
          
          <button 
            onClick={() => setActiveTab('Brand Setup')}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <Settings size={16} />
            <span>Edit Client</span>
          </button>
        </div>

        {/* Quick Stats Chips */}
        <div className="flex items-center space-x-3 mb-6 overflow-x-auto pb-2 custom-scrollbar">
          <div className="flex items-center space-x-2 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 shrink-0">
            <BarChart2 size={16} className="text-blue-500" />
            <span className="text-sm font-medium text-gray-700">0 Active Campaigns</span>
          </div>
          <div className="flex items-center space-x-2 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 shrink-0">
            <CheckSquare size={16} className="text-emerald-500" />
            <span className="text-sm font-medium text-gray-700">0 Total Tasks</span>
          </div>
          <div className="flex items-center space-x-2 bg-orange-50 border border-orange-100 rounded-lg px-3 py-2 shrink-0">
            <Image size={16} className="text-orange-500" />
            <span className="text-sm font-medium text-orange-700">0 Pending Approvals</span>
          </div>
          <div className="flex items-center space-x-2 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 shrink-0">
            <CheckSquare size={16} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-700">0 Pieces Published</span>
          </div>
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
        {activeTab === 'Overview' && (
          <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Project Progress</h2>
              <div className="w-full bg-gray-100 rounded-full h-2 mb-2 overflow-hidden">
                <div className="bg-[var(--brand-primary)] h-2 rounded-full transition-all duration-1000" style={{ width: '0%' }}></div>
              </div>
              <p className="text-sm text-gray-500">No active campaigns to track.</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
              <div className="text-sm text-gray-500 text-center py-8">
                No recent activity for this client.
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'Campaigns' && (
          <div className="text-center py-12 animate-in fade-in duration-300">
            <h3 className="text-lg font-bold text-gray-900 mb-2">No campaigns yet</h3>
            <p className="text-gray-500 mb-6">Create a campaign to start organizing content and tasks.</p>
            <button 
              onClick={() => navigate(`/admin/clients/${id}/campaigns`)}
              className="bg-[var(--brand-primary)] text-white px-4 py-2 rounded-lg font-semibold shadow-sm hover:bg-[var(--brand-primary)]/90"
            >
              Go to Campaigns
            </button>
          </div>
        )}
        
        {activeTab === 'Brand Setup' && (
          <div className="text-center py-12 animate-in fade-in duration-300">
             <button 
              onClick={() => navigate(`/admin/clients/${id}/brand`)}
              className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold shadow-sm hover:bg-gray-50"
            >
              Configure Brand Settings
            </button>
          </div>
        )}
        
        {activeTab === 'Access & Permissions' && (
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm max-w-2xl animate-in fade-in duration-300">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Client Access</h2>
            <p className="text-sm text-gray-500 mb-6">Send an invitation to {client.full_name} so they can access their branded portal.</p>
            <button className="bg-[var(--brand-primary)] text-white px-4 py-2 rounded-lg font-semibold shadow-sm hover:bg-[var(--brand-primary)]/90">
              Send Invitation
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
