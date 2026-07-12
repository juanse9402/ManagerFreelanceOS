import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Target, ChevronRight, Image as ImageIcon, Trash2 } from 'lucide-react';
import { useTimeTracking } from '../../contexts/TimeTrackingContext';

export const CampaignsList: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { availableClients, role, activeClientId } = useAuth();
  const { campaigns, deleteCampaign } = useTimeTracking();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'active' | 'past'>('active');
  
  // If no id in params, we assume it's the client view, so use activeClientId
  const resolvedClientId = id || (role === 'client' ? activeClientId : null);
  const client = availableClients.find(c => c.id === resolvedClientId);

  if (!client && role === 'admin') {
    return <div className="p-8 text-center text-gray-500">Client not found</div>;
  }

  const filteredCampaigns = campaigns.filter(c => c.status === filter);

  if (campaigns.length === 0) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
          <Target size={32} className="text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No campaigns yet.</h2>
        <p className="text-gray-500 max-w-md mb-8">
          {role === 'admin' ? 'Create a campaign to start organizing content and tasks.' : 'We are setting up your first campaign!'}
        </p>
        {role === 'admin' && (
          <button 
            className="flex items-center space-x-2 bg-[var(--brand-primary)] text-white px-6 py-3 rounded-xl font-semibold shadow-sm hover:bg-[var(--brand-primary)]/90 transition-all"
          >
            <Plus size={18} />
            <span>New Campaign</span>
          </button>
        )}
      </div>
    );
  }

  const handleCampaignClick = (campaignId: string) => {
    if (role === 'client') {
      navigate(`/client/campaigns/${campaignId}`);
    } else {
      navigate(`/admin/clients/${resolvedClientId}/campaigns/${campaignId}`);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto animate-in fade-in duration-300 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {role === 'client' ? 'My Campaigns' : `Campaigns — ${client?.full_name}`}
          </h1>
          {role === 'client' && <p className="text-sm text-gray-500 mt-1">Track the progress of your active marketing initiatives.</p>}
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${filter === 'active' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${filter === 'past' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Past
            </button>
          </div>
          {role === 'admin' && (
            <button 
              className="flex items-center space-x-2 bg-[var(--brand-primary)] text-white px-4 py-2 rounded-xl font-semibold shadow-sm hover:opacity-90 transition-opacity text-sm shrink-0"
            >
              <Plus size={16} />
              <span>New Campaign</span>
            </button>
          )}
        </div>
      </div>

      {/* Campaign Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCampaigns.map(campaign => (
          <div 
            key={campaign.id} 
            onClick={() => handleCampaignClick(campaign.id)}
            className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-gray-200 transition-all cursor-pointer flex flex-col relative"
          >
            <div className="h-40 w-full relative overflow-hidden bg-gray-100">
              {campaign.coverUrl ? (
                <img src={campaign.coverUrl} alt={campaign.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <ImageIcon size={32} />
                </div>
              )}
              <div className="absolute top-3 left-3 flex gap-2">
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold shadow-sm backdrop-blur-md bg-white/90 ${campaign.status === 'active' ? 'text-green-600' : 'text-gray-500'}`}>
                  {campaign.status.toUpperCase()}
                </span>
                <span className="px-2.5 py-1 rounded-md text-xs font-bold text-[var(--brand-primary)] shadow-sm backdrop-blur-md bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/20">
                  {campaign.phase}
                </span>
              </div>
              {role === 'admin' && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`¿Estás seguro de que deseas eliminar la campaña "${campaign.name}"?`)) {
                      deleteCampaign(campaign.id);
                    }
                  }}
                  className="absolute top-3 right-3 p-1.5 rounded-md text-red-600 bg-white/90 hover:bg-red-50 hover:text-red-700 shadow-sm backdrop-blur-md transition-colors"
                  title="Eliminar campaña"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
            
            <div className="p-5 flex flex-col flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-4">{campaign.name}</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6 flex-1">
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Deliverables</p>
                  <p className="text-lg font-bold text-gray-900">{campaign.totalDeliverables}</p>
                </div>
                <div className={`rounded-xl p-3 border ${campaign.pendingReview > 0 ? 'bg-amber-50 border-amber-100' : 'bg-gray-50 border-gray-100'}`}>
                  <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${campaign.pendingReview > 0 ? 'text-amber-700' : 'text-gray-500'}`}>Pending Review</p>
                  <p className={`text-lg font-bold ${campaign.pendingReview > 0 ? 'text-amber-700' : 'text-gray-900'}`}>{campaign.pendingReview}</p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-sm font-semibold">
                <span className="text-[var(--brand-primary)] group-hover:underline">View Campaign</span>
                <ChevronRight size={16} className="text-gray-400 group-hover:text-[var(--brand-primary)] transition-colors" />
              </div>
            </div>
          </div>
        ))}

        {filteredCampaigns.length === 0 && (
          <div className="col-span-1 md:col-span-2 py-12 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
            <h3 className="text-lg font-bold text-gray-900 mb-1">No {filter} campaigns</h3>
            <p className="text-gray-500 text-sm">You don't have any {filter} campaigns right now.</p>
          </div>
        )}
      </div>
    </div>
  );
};
