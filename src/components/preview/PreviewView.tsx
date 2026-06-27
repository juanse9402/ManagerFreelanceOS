import React from 'react';
import { InstagramFeed } from './InstagramFeed';
import { TikTokFeed } from './TikTokFeed';
import { Camera, Smartphone } from 'lucide-react';

export const PreviewView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Preview & Feed Simulation</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Visualize how the content will look published on the client's networks.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Instagram Column */}
        <div className="bg-white rounded-[var(--radius-card)] p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center mb-6">
            <div className="p-2 bg-pink-50 text-pink-600 rounded-lg mr-3">
              <Camera size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Instagram Feed</h2>
              <p className="text-xs text-[var(--text-muted)]">Drag to reorder feed (Grid 3x3)</p>
            </div>
          </div>
          
          <div className="flex justify-center bg-gray-50 rounded-xl p-4 md:p-8 border border-gray-100">
            <InstagramFeed />
          </div>
        </div>

        {/* TikTok Column */}
        <div className="bg-white rounded-[var(--radius-card)] p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center mb-6">
            <div className="p-2 bg-slate-100 text-slate-800 rounded-lg mr-3">
              <Smartphone size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">TikTok Profile</h2>
              <p className="text-xs text-[var(--text-muted)]">Drag to reorder videos (Grid 3x3)</p>
            </div>
          </div>
          
          <div className="flex justify-center bg-gray-50 rounded-xl p-4 md:p-8 border border-gray-100">
            <TikTokFeed />
          </div>
        </div>

      </div>
    </div>
  );
};
