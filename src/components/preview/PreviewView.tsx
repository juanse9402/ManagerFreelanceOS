import React, { useState, useEffect } from 'react';
import { Camera, Smartphone, PlaySquare, Layers } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { ContentDrawer } from '../calendar/ContentDrawer';
import { ProfileSimulatorView } from './ProfileSimulatorView';

export const PreviewView: React.FC = () => {
  const { activeClientId, role, availableClients } = useAuth();
  const [activeTab, setActiveTab] = useState<'instagram' | 'tiktok' | 'simulator'>('instagram');
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [content, setContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedItemIdx, setDraggedItemIdx] = useState<number | null>(null);

  const client = availableClients.find(c => c.id === activeClientId);

  useEffect(() => {
    fetchContent();
  }, [activeClientId]);

  const fetchContent = async () => {
    if (!activeClientId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('content_posts')
        .select('*')
        .eq('client_id', activeClientId)
        .order('date', { ascending: true }); // chronological order by default
        
      if (error) throw error;
      if (data) {
        // Filter out drafts for clients
        const filteredData = role === 'client' 
          ? data.filter(item => item.status !== 'Draft')
          : data;
        setContent(filteredData);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!activeClientId && role === 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-gray-200 rounded-2xl m-6 bg-gray-50/50">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Select a Client</h3>
        <p className="text-gray-500 text-center max-w-md">Please select a client from the workspace selector to preview content.</p>
      </div>
    );
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItemIdx(index);
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number, platformData: any[], setPlatformData: (data: any[]) => void) => {
    e.preventDefault();
    if (draggedItemIdx === null || draggedItemIdx === index) return;
    
    const newContent = [...platformData];
    const draggedItem = newContent[draggedItemIdx];
    newContent.splice(draggedItemIdx, 1);
    newContent.splice(index, 0, draggedItem);
    
    setPlatformData(newContent);
    setDraggedItemIdx(index);
  };

  const handleDragEnd = () => {
    setDraggedItemIdx(null);
  };

  const instagramContent = content.filter(c => c.platform?.toLowerCase() === 'instagram');
  const tiktokContent = content.filter(c => c.platform?.toLowerCase() === 'tiktok');

  const renderFeedGrid = (platform: 'instagram' | 'tiktok') => {
    const platformData = platform === 'instagram' ? instagramContent : tiktokContent;
    const setPlatformData = (newData: any[]) => {
      // In a real app, this would save the custom sort order to the database.
      // For now, it updates local state.
      const otherContent = content.filter(c => c.platform?.toLowerCase() !== platform);
      setContent([...otherContent, ...newData]);
    };

    return (
      <div className="flex h-full bg-gray-50/50">
        {/* Left Panel: Feed Grid */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto border-r border-gray-100 custom-scrollbar">
          <div className={`grid grid-cols-3 ${platform === 'instagram' ? 'gap-1 max-w-[600px] mx-auto' : 'gap-2 max-w-[500px] mx-auto'}`}>
            {platformData.length === 0 ? (
              <div className="col-span-3 text-center py-12 text-gray-500">
                No {platform === 'instagram' ? 'Instagram' : 'TikTok'} content scheduled yet.
              </div>
            ) : (
              platformData.map((item, idx) => (
                <div 
                  key={item.id} 
                  className={`${platform === 'instagram' ? 'aspect-square' : 'aspect-[9/16]'} relative cursor-grab bg-gray-200 group ${draggedItemIdx === idx ? 'opacity-50 scale-95' : ''} transition-transform duration-200 overflow-hidden rounded-sm`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={(e) => handleDragOver(e, idx, platformData, setPlatformData)}
                  onDragEnd={handleDragEnd}
                  onClick={() => setSelectedEvent(item)}
                >
                  {item.image_url ? (
                    <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-300">
                      <Camera size={24} className="text-gray-400" />
                    </div>
                  )}
                  
                  {/* Status Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold text-white mb-2 shadow-sm ${item.status === 'Approved' ? 'bg-green-500' : item.status === 'In Review' ? 'bg-amber-500' : 'bg-gray-500'}`}>
                      {item.status.toUpperCase()}
                    </span>
                    <span className="text-white text-xs font-semibold bg-black/50 px-2 py-1 rounded backdrop-blur-sm">Preview</span>
                  </div>

                  {/* Client Overlay Badges */}
                  {role === 'client' && item.status === 'In Review' && (
                    <div className="absolute inset-0 ring-2 ring-inset ring-amber-400 pointer-events-none" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel: Piece Detail Preview */}
        <div className="w-[400px] bg-white p-6 overflow-y-auto hidden lg:block custom-scrollbar">
          {selectedEvent ? (
            <div className="flex flex-col h-full">
              <h3 className="font-bold text-lg mb-4 text-gray-900">Preview</h3>
              <div className={`mx-auto ${platform === 'instagram' ? 'aspect-square w-full' : 'aspect-[9/16] w-64'} bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-sm relative`}>
                {selectedEvent.image_url ? (
                  <img src={selectedEvent.image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                )}
                {/* Simulated UI Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="flex items-center space-x-2 text-white">
                    <div className="w-6 h-6 rounded-full bg-white/20 overflow-hidden"><img src={client?.brand_settings?.logoUrl} alt="" className="w-full h-full object-cover"/></div>
                    <span className="font-semibold text-sm">@{client?.brand_settings?.handles?.[platform] || 'brand'}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{selectedEvent.description || 'No caption provided.'}</p>
              </div>
              
              <div className="mt-6 flex gap-2">
                {role === 'client' ? (
                  <button className="flex-1 bg-green-500 text-white font-bold py-2 rounded-lg hover:bg-green-600 transition-colors">Approve</button>
                ) : (
                  <button className="w-full bg-black text-white font-bold py-2 rounded-lg hover:bg-gray-800 transition-colors">Edit in Calendar</button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Layers size={48} className="mb-4 opacity-50" />
              <p>Select a post to preview it here.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      
      {/* Header & Tabs */}
      <div className="px-6 md:px-8 pt-8 border-b border-gray-100 shrink-0 shadow-sm z-10 relative">
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Preview & Feed</h1>
            {role === 'client' && <p className="text-sm text-gray-500 mt-1">Visualize how your grid will look across networks.</p>}
          </div>
          
          <div className="flex space-x-6 overflow-x-auto custom-scrollbar pb-2 md:pb-0">
            <button
              onClick={() => setActiveTab('instagram')}
              className={`pb-3 text-sm font-semibold transition-colors relative flex items-center space-x-2 shrink-0 ${
                activeTab === 'instagram' ? 'text-pink-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Camera size={16} />
              <span>Instagram Feed</span>
              {activeTab === 'instagram' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-500 to-orange-400 rounded-t-full" />}
            </button>
            <button
              onClick={() => setActiveTab('tiktok')}
              className={`pb-3 text-sm font-semibold transition-colors relative flex items-center space-x-2 shrink-0 ${
                activeTab === 'tiktok' ? 'text-black' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <PlaySquare size={16} />
              <span>TikTok Feed</span>
              {activeTab === 'tiktok' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-t-full" />}
            </button>
            <button
              onClick={() => setActiveTab('simulator')}
              className={`pb-3 text-sm font-semibold transition-colors relative flex items-center space-x-2 shrink-0 ${
                activeTab === 'simulator' ? 'text-[var(--brand-primary)]' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Smartphone size={16} />
              <span>Profile Simulator</span>
              {activeTab === 'simulator' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--brand-primary)] rounded-t-full" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-20 backdrop-blur-sm">
            <span className="text-[var(--brand-primary)] font-medium">Loading feed...</span>
          </div>
        ) : (
          <>
            {activeTab === 'instagram' && renderFeedGrid('instagram')}
            {activeTab === 'tiktok' && renderFeedGrid('tiktok')}
            {activeTab === 'simulator' && <ProfileSimulatorView content={content} />}
          </>
        )}
      </div>
      
      {/* Mobile Drawer (Visible on small screens if selectedEvent) */}
      <div className="lg:hidden">
        <ContentDrawer 
          isOpen={!!selectedEvent && activeTab !== 'simulator'} 
          onClose={() => setSelectedEvent(null)} 
          item={selectedEvent}
        />
      </div>
    </div>
  );
};
