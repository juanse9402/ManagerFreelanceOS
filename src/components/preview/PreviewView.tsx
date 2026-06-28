import React, { useState } from 'react';
import { Camera, Smartphone, Image as ImageIcon, Grid, PlaySquare, PlayCircle, MoreHorizontal } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

import { ContentDrawer } from '../calendar/ContentDrawer';

export const PreviewView: React.FC = () => {
  const { activeClientId, role, availableClients } = useAuth();
  const [activeTab, setActiveTab] = useState<'instagram' | 'tiktok'>('instagram');
  const [feedView, setFeedView] = useState<'grid' | 'reels' | 'stories'>('grid');
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

  
  const client = availableClients.find(c => c.id === activeClientId);

  // Placeholder for content pieces
  const initialContent = [
    { id: '1', type: 'Post', platform: 'Instagram', image_url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80', status: 'Approved', date: '2026-06-15', description: 'Exciting news coming soon!' },
    { id: '2', type: 'Reel', platform: 'Instagram', image_url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80', status: 'In Review', date: '2026-06-16', description: 'Behind the scenes magic ✨' },
    { id: '3', type: 'Carousel', platform: 'Instagram', image_url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80', status: 'Approved', date: '2026-06-18', description: 'Swipe to see our top tips.' },
    { id: '4', type: 'Post', platform: 'Instagram', image_url: 'https://images.unsplash.com/photo-1493612276216-ee3925520721?auto=format&fit=crop&w=800&q=80', status: 'Pending', date: '2026-06-20', description: 'A fresh perspective.' },
    { id: '5', type: 'Reel', platform: 'Instagram', image_url: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=800&q=80', status: 'Approved', date: '2026-06-22', description: 'Watch how we do it.' },
    { id: '6', type: 'Post', platform: 'Instagram', image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', status: 'In Review', date: '2026-06-25', description: 'Summer vibes.' }
  ];

  const [content, setContent] = useState(initialContent);
  const [draggedItemIdx, setDraggedItemIdx] = useState<number | null>(null);

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
    // Needed for Firefox
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItemIdx === null || draggedItemIdx === index) return;
    
    // Reorder array locally
    const newContent = [...content];
    const draggedItem = newContent[draggedItemIdx];
    newContent.splice(draggedItemIdx, 1);
    newContent.splice(index, 0, draggedItem);
    
    setContent(newContent);
    setDraggedItemIdx(index);
  };

  const handleDragEnd = () => {
    setDraggedItemIdx(null);
  };

  // Filter based on feedView
  const displayedContent = feedView === 'reels' ? content.filter(c => c.type === 'Reel') :
                           feedView === 'stories' ? [] :
                           content;

  return (
    <div className="flex flex-col h-full bg-gray-50/30 overflow-y-auto pb-20 custom-scrollbar">
      
      {/* Header & Tabs */}
      <div className="bg-white px-6 md:px-8 pt-8 border-b border-gray-100 shrink-0">
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Preview & Feed</h1>
            {role === 'client' && <p className="text-sm text-gray-500 mt-1">Drag and drop posts to visualize how your grid will look. Changes here are only a preview.</p>}
          </div>
          
          <div className="flex space-x-6 md:ml-auto overflow-x-auto custom-scrollbar pb-2 md:pb-0">
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
                activeTab === 'tiktok' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Smartphone size={16} />
              <span>TikTok Profile</span>
              {activeTab === 'tiktok' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-t-full" />}
            </button>
          </div>
        </div>
      </div>

      {/* Content Area - Simulator */}
      <div className="flex-1 flex justify-center p-6 md:p-8">
        
        {/* Instagram Profile Simulator */}
        {activeTab === 'instagram' && (
          <div className="w-full max-w-[400px] bg-white border border-gray-200 rounded-[2rem] shadow-xl overflow-hidden flex flex-col h-[750px] relative">
            
            {/* Phone Header Mock */}
            <div className="h-14 flex items-center justify-between px-6 bg-white shrink-0 border-b border-gray-100 pt-2">
              <span className="font-bold text-gray-900 truncate flex-1">{client?.company_name || 'Your Brand'}</span>
              <MoreHorizontal size={20} className="text-gray-800" />
            </div>

            {/* Profile Info Mock */}
            <div className="px-4 py-4 shrink-0 bg-white">
              <div className="flex items-center justify-between mb-4">
                <div className="w-20 h-20 rounded-full bg-gray-100 border border-gray-200 p-0.5 relative">
                  <div className="w-full h-full rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                    {client?.brand_settings?.logoUrl ? (
                      <img src={client.brand_settings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="text-gray-400" />
                    )}
                  </div>
                </div>
                <div className="flex-1 flex justify-around ml-4 text-center">
                  <div><p className="font-bold text-gray-900">{content.length}</p><p className="text-[11px] text-gray-500">Posts</p></div>
                  <div><p className="font-bold text-gray-900">12.4k</p><p className="text-[11px] text-gray-500">Followers</p></div>
                  <div><p className="font-bold text-gray-900">145</p><p className="text-[11px] text-gray-500">Following</p></div>
                </div>
              </div>
              <div className="text-sm">
                <p className="font-bold text-gray-900">{client?.company_name || 'Your Brand'}</p>
                <p className="text-gray-500">Brand / Marketing</p>
                <p className="text-gray-800 whitespace-pre-wrap">{client?.brand_settings?.brandGuidelines || 'Welcome to our official profile!'}</p>
              </div>
            </div>

            {/* Instagram Tabs */}
            <div className="flex justify-around border-t border-gray-100 shrink-0 bg-white">
              <button 
                onClick={() => setFeedView('grid')}
                className={`flex-1 py-3 flex justify-center border-b-2 transition-colors ${feedView === 'grid' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400'}`}
              >
                <Grid size={22} />
              </button>
              <button 
                onClick={() => setFeedView('reels')}
                className={`flex-1 py-3 flex justify-center border-b-2 transition-colors ${feedView === 'reels' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400'}`}
              >
                <PlaySquare size={22} />
              </button>
              <button 
                onClick={() => setFeedView('stories')}
                className={`flex-1 py-3 flex justify-center border-b-2 transition-colors ${feedView === 'stories' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400'}`}
              >
                <PlayCircle size={22} />
              </button>
            </div>

            {/* Grid Container */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-white p-0.5">
              {feedView === 'stories' ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 text-gray-400">
                  <PlayCircle size={40} className="mb-2 opacity-50" />
                  <p className="text-sm">No stories scheduled.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-0.5">
                  {displayedContent.map((item, idx) => (
                    <div 
                      key={item.id} 
                      className={`aspect-square relative cursor-grab bg-gray-100 group ${draggedItemIdx === idx ? 'opacity-50 scale-95' : ''} transition-transform duration-200`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDragEnd={handleDragEnd}
                      onClick={() => setSelectedEvent(item)}
                    >
                      <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                      
                      {/* Icons overlays */}
                      {item.type === 'Reel' && <PlaySquare size={16} className="absolute top-2 right-2 text-white drop-shadow-md" />}
                      {item.type === 'Carousel' && <div className="absolute top-2 right-2 flex space-x-0.5"><div className="w-1 h-3 bg-white/80 rounded-full drop-shadow-md"/><div className="w-1.5 h-3 bg-white drop-shadow-md rounded-full"/><div className="w-1 h-3 bg-white/80 rounded-full drop-shadow-md"/></div>}
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold text-white mb-2 shadow-sm ${item.status === 'Approved' ? 'bg-green-500' : item.status === 'In Review' ? 'bg-amber-500' : 'bg-gray-500'}`}>
                          {item.status.toUpperCase()}
                        </span>
                        <span className="text-white text-xs font-semibold bg-black/50 px-2 py-1 rounded backdrop-blur-sm">View</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TikTok Profile Simulator (Placeholder) */}
        {activeTab === 'tiktok' && (
          <div className="w-full max-w-[400px] bg-black border border-gray-800 rounded-[2rem] shadow-xl overflow-hidden flex flex-col h-[750px] relative text-white">
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <Smartphone size={48} className="text-gray-700 mb-4" />
              <h3 className="text-lg font-bold mb-2">TikTok Simulator</h3>
              <p className="text-gray-400 text-sm">Drag and drop functionality for TikTok is coming soon.</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Drawer */}
      <ContentDrawer 
        isOpen={!!selectedEvent} 
        onClose={() => setSelectedEvent(null)} 
        item={selectedEvent}
      />
    </div>
  );
};
