import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Plus } from 'lucide-react';

export const CampaignsList: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { availableClients } = useAuth();
  const navigate = useNavigate();
  
  const client = availableClients.find(c => c.id === id);

  if (!client) {
    return <div className="p-8 text-center text-gray-500">Client not found</div>;
  }

  // Placeholder campaigns data
  const campaigns = [];

  if (campaigns.length === 0) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
          <Plus size={32} className="text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No campaigns for this client yet.</h2>
        <p className="text-gray-500 max-w-md mb-8">
          Create a campaign to start organizing content and tasks.
        </p>
        <button 
          className="flex items-center space-x-2 bg-[var(--brand-primary)] text-white px-6 py-3 rounded-xl font-semibold shadow-sm hover:bg-[var(--brand-primary)]/90 transition-all"
        >
          <Plus size={18} />
          <span>New Campaign</span>
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Campaigns — {client.full_name}</h1>
        </div>
        <button 
          className="flex items-center space-x-2 bg-[var(--brand-primary)] text-white px-4 py-2 rounded-xl font-semibold shadow-sm hover:bg-[var(--brand-primary)]/90 transition-all text-sm"
        >
          <Plus size={16} />
          <span>New Campaign</span>
        </button>
      </div>

      {/* Campaign Cards Placeholder */}
    </div>
  );
};
