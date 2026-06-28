import React, { useState } from 'react';
import { Camera, Smartphone, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const PreviewView: React.FC = () => {
  const { activeClientId } = useAuth();
  const [activeTab, setActiveTab] = useState<'instagram' | 'tiktok'>('instagram');
  const navigate = useNavigate();
  
  // Placeholder for content pieces
  const content = [];

  if (!activeClientId) {
    return (
      <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-gray-200 rounded-2xl m-6 bg-gray-50/50">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Select a Client</h3>
        <p className="text-gray-500 text-center max-w-md">Please select a client from the workspace selector to preview content.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50/30 m-4 sm:m-6 rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      
      {/* Header & Tabs */}
      <div className="bg-white px-6 pt-6 border-b border-gray-100 shrink-0">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Preview & Feed</h1>
        </div>
        
        <div className="flex space-x-6">
          <button
            onClick={() => setActiveTab('instagram')}
            className={`pb-3 text-sm font-semibold transition-colors relative flex items-center space-x-2 ${
              activeTab === 'instagram' ? 'text-[var(--brand-primary)]' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Camera size={16} />
            <span>Instagram Feed</span>
            {activeTab === 'instagram' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--brand-primary)] rounded-t-full" />}
          </button>
          <button
            onClick={() => setActiveTab('tiktok')}
            className={`pb-3 text-sm font-semibold transition-colors relative flex items-center space-x-2 ${
              activeTab === 'tiktok' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Smartphone size={16} />
            <span>TikTok Profile</span>
            {activeTab === 'tiktok' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-t-full" />}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative bg-white">
        {content.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/80 p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-4">
              <ImageIcon size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No content to preview.</h3>
            <p className="text-gray-500 max-w-md mb-6">
              Schedule content in the calendar to see how the feed will look.
            </p>
            <button 
              onClick={() => navigate('/admin/calendar')}
              className="bg-[var(--brand-primary)] text-white px-5 py-2.5 rounded-xl font-medium shadow-sm hover:opacity-90 transition-all"
            >
              Go to Calendar
            </button>
          </div>
        ) : (
          <div className="flex h-full">
            {/* Left Panel: Feed Grid */}
            <div className="flex-1 border-r border-gray-100 p-6 overflow-y-auto">
              {/* Grid Placeholder */}
            </div>
            {/* Right Panel: Device Preview */}
            <div className="w-96 bg-gray-50 p-6 flex flex-col items-center overflow-y-auto">
              <p className="text-sm text-gray-500 text-center mb-4">Select a piece to preview it here.</p>
              {/* Device Frame Placeholder */}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
