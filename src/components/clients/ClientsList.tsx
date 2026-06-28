import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ClientsList: React.FC = () => {
  const { availableClients } = useAuth();
  const navigate = useNavigate();

  if (availableClients.length === 0) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
          <Plus size={32} className="text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to FreelanceOS.</h2>
        <p className="text-gray-500 max-w-md mb-8">
          Start by adding your first client. Once you've set them up, you'll be able to create campaigns, plan content, and share a branded portal with them.
        </p>
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('open-client-drawer'))}
          className="flex items-center space-x-2 bg-[var(--brand-primary)] text-white px-6 py-3 rounded-xl font-semibold shadow-sm hover:bg-[var(--brand-primary)]/90 transition-all"
        >
          <Plus size={18} />
          <span>Add Your First Client</span>
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Clients</h1>
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('open-client-drawer'))}
          className="flex items-center space-x-2 bg-[var(--brand-primary)] text-white px-4 py-2 rounded-xl font-semibold shadow-sm hover:bg-[var(--brand-primary)]/90 transition-all text-sm"
        >
          <Plus size={16} />
          <span>New Client</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableClients.map(client => (
          <div 
            key={client.id}
            onClick={() => navigate(`/admin/clients/${client.id}`)}
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
                   style={{ 
                     backgroundColor: client.brand_settings?.primaryColor ? `${client.brand_settings.primaryColor}20` : '#F3F4F6',
                     color: client.brand_settings?.primaryColor || '#6B7280'
                   }}>
                {client.full_name?.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex space-x-2">
                <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-100">Active</span>
                <button className="text-gray-400 hover:text-gray-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); /* 3-dot menu logic */ }}>
                  ⋮
                </button>
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-1">{client.full_name}</h3>
            <p className="text-xs text-gray-500 mb-4 inline-block px-2 py-1 bg-gray-50 rounded-md">Various Industries</p>
            
            <div className="space-y-2 mt-4 pt-4 border-t border-gray-50">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Active campaigns</span>
                <span className="font-semibold text-gray-900">0</span>
              </div>
              <div className="text-xs text-gray-400 mt-2">
                Last updated recently
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
