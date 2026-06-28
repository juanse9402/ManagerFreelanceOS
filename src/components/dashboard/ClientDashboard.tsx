import React, { useState, useEffect } from 'react';
import { ProjectProgress } from './ProjectProgress';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Clock, CheckCircle, AlertCircle, Play, Image as ImageIcon, ImagePlus, FileText, Check } from 'lucide-react';


interface ClientDashboardProps {
  setActiveView: (view: string) => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ setActiveView }) => {
  const { profileName, session, activeClientId, clientProfile } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);


  const brandSettings = clientProfile?.brand_settings || {};
  const brandName = clientProfile?.company_name || profileName.split(' ')[0] || 'Brand';

  useEffect(() => {
    fetchData();
  }, [session, activeClientId]);

  const fetchData = async () => {
    if (!activeClientId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    const { data: projectData } = await supabase
      .from('projects')
      .select('*')
      .eq('client_id', activeClientId)
      .order('created_at', { ascending: false });
      
    if (projectData) {
      setProjects(projectData);
    }

    const { data: approvalData } = await supabase
      .from('content_posts')
      .select('*')
      .eq('client_id', activeClientId)
      .eq('status', 'In Review');
    
    if (approvalData) {
      setPendingApprovals(approvalData);
    }

    setLoading(false);
  };

  const activeProject = projects.length > 0 ? projects[0] : null;
  const currentPhaseName = activeProject?.status || 'Planning';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'Reel': return <Play size={14} className="text-white" />;
      case 'Story': return <ImagePlus size={14} className="text-white" />;
      case 'Carousel': return <FileText size={14} className="text-white" />;
      default: return <ImageIcon size={14} className="text-white" />;
    }
  };

  return (
    <div className="space-y-6 relative min-h-full pb-10 max-w-5xl mx-auto">
      {/* Branded Header */}
      <div className="flex flex-col mb-8">
        <div className="flex items-center space-x-3 mb-2">
          {brandSettings.logo_url && (
            <img src={brandSettings.logo_url} alt="Logo" className="w-10 h-10 rounded-lg object-cover shadow-sm border border-gray-100" />
          )}
          <h1 className="text-xl font-bold text-gray-900" style={brandSettings.font ? { fontFamily: `"${brandSettings.font}", sans-serif` } : {}}>{brandName}</h1>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {getGreeting()}, {profileName.split(' ')[0]}.
          </h2>
          <div className="bg-[var(--brand-primary)] text-white px-4 py-1.5 rounded-full text-sm font-semibold shrink-0 shadow-sm inline-flex items-center">
            Phase: {currentPhaseName}
          </div>
        </div>
      </div>
      
      {/* Progress Section */}
      <div className="bg-white rounded-[var(--radius-card)] p-6 shadow-[var(--shadow-card)] border border-gray-100">
        <ProjectProgress project={activeProject} loading={loading} isClientView={true} />
      </div>

      {/* Content Awaiting Your Review */}
      {pendingApprovals.length > 0 ? (
        <div className="bg-white rounded-[var(--radius-card)] p-6 shadow-[var(--shadow-card)] border border-[var(--brand-primary)]/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[var(--brand-primary)]"></div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Content awaiting your review ({pendingApprovals.length} pieces)</h2>
          
          <div className="space-y-3">
            {pendingApprovals.slice(0, 5).map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-gray-100 transition-colors">
                <div className="flex items-center space-x-4 overflow-hidden">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 shrink-0 relative border border-gray-200 overflow-hidden">
                    {item.media_urls?.[0] ? (
                      <img src={item.media_urls[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ImageIcon size={20} />
                      </div>
                    )}
                    <div className={`absolute bottom-0 right-0 w-5 h-5 flex items-center justify-center rounded-tl-lg ${item.platform === 'Instagram' ? 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500' : 'bg-black'}`}>
                      {getContentTypeIcon(item.content_type)}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate text-sm">{item.content_type} • {new Date(item.publish_date).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-500 truncate">{item.campaign_id ? 'Campaign Content' : 'General Content'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveView('calendar')}
                  className="px-4 py-2 bg-[var(--brand-primary)] text-white font-medium text-sm rounded-lg hover:opacity-90 transition-opacity shrink-0 ml-4 shadow-sm"
                >
                  Review
                </button>
              </div>
            ))}
          </div>
          {pendingApprovals.length > 5 && (
            <button onClick={() => setActiveView('calendar')} className="mt-4 text-sm font-semibold text-[var(--brand-primary)] hover:underline">
              View all {pendingApprovals.length} pending pieces →
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-[var(--radius-card)] p-6 shadow-[var(--shadow-card)] border border-gray-100 flex flex-col items-center justify-center text-center py-10">
          <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-4">
            <Check size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">You're all caught up.</h3>
          <p className="text-gray-500 text-sm">No content needs your review right now.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Upcoming Strip */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[var(--radius-card)] p-6 shadow-[var(--shadow-card)] border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Upcoming Content</h2>
            
            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x">
              {Array.from({ length: 7 }).map((_, i) => {
                const date = new Date();
                date.setDate(date.getDate() + i);
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                const dayNum = date.getDate();
                const hasPost = i === 2 || i === 4; // Mock logic
                
                return (
                  <div key={i} className="flex-shrink-0 w-[100px] snap-start flex flex-col">
                    <div className="text-center mb-2">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{dayName}</span>
                      <div className="text-lg font-bold text-gray-900">{dayNum}</div>
                    </div>
                    {hasPost ? (
                      <div className="space-y-2">
                        <div onClick={() => setActiveView('calendar')} className="bg-white border-l-4 border-l-purple-500 border border-gray-100 p-2 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow relative">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-gray-500 uppercase">IG • P</span>
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-center border border-dashed border-gray-200 rounded-lg min-h-[60px] bg-gray-50/50">
                        {/* Empty day */}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Right Column: Activity Feed */}
        <div className="bg-white rounded-[var(--radius-card)] p-6 shadow-[var(--shadow-card)] flex flex-col border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4 shrink-0">What's been happening</h2>
          <div className="space-y-4 relative flex-1 overflow-y-auto custom-scrollbar">
            {/* Timeline items mock client-facing events */}
            <div className="relative flex items-start group">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 mr-3 mt-1">
                <AlertCircle size={14} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">New content is ready for your review.</p>
                <time className="text-xs text-gray-500">2 hours ago</time>
              </div>
            </div>

            <div className="relative flex items-start group">
              <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center shrink-0 mr-3 mt-1">
                <CheckCircle size={14} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">"Summer Launch Carousel" was published.</p>
                <time className="text-xs text-gray-500">Yesterday at 10:00 AM</time>
              </div>
            </div>

            <div className="relative flex items-start group">
              <div className="w-8 h-8 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center shrink-0 mr-3 mt-1">
                <Clock size={14} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">Your project moved into the Production phase.</p>
                <time className="text-xs text-gray-500">2 days ago</time>
              </div>
            </div>
            
            <button className="text-sm font-medium text-[var(--brand-primary)] hover:underline text-left mt-2">
              View all activity →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
