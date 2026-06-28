import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { MoreHorizontal, Image as ImageIcon, Grid, PlaySquare, PlayCircle } from 'lucide-react';
import { ContentDrawer } from '../calendar/ContentDrawer';
import { ProfileConfigDrawer } from './ProfileConfigDrawer';

interface ProfileSimulatorProps {
  content: any[];
}

export const ProfileSimulatorView: React.FC<ProfileSimulatorProps> = ({ content }) => {
  const { activeClientId, availableClients, role } = useAuth();
  const client = availableClients.find(c => c.id === activeClientId);
  
  const [platformTab, setPlatformTab] = useState<'instagram' | 'tiktok'>('instagram');
  const [feedView, setFeedView] = useState<'grid' | 'reels' | 'stories'>('grid');
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [showPhoneFrame, setShowPhoneFrame] = useState(true);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Filter content for the specific platform
  const igContent = content.filter(c => c.platform?.toLowerCase() === 'instagram');
  const tkContent = content.filter(c => c.platform?.toLowerCase() === 'tiktok');
  
  const displayedContent = platformTab === 'instagram' 
    ? (feedView === 'reels' ? igContent.filter(c => c.type === 'Reel') : feedView === 'stories' ? [] : igContent)
    : tkContent;

  const pSettings = client?.brand_settings?.[`${platformTab}_profile`] || {};

  return (
    <div className="flex flex-col h-full items-center p-4 md:p-8">
      {/* Sub Navigation */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button 
            onClick={() => setPlatformTab('instagram')}
            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${platformTab === 'instagram' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Instagram Profile
          </button>
          <button 
            onClick={() => setPlatformTab('tiktok')}
            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${platformTab === 'tiktok' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            TikTok Profile
          </button>
        </div>
        
        <label className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer ml-4">
          <input 
            type="checkbox" 
            checked={showPhoneFrame}
            onChange={(e) => setShowPhoneFrame(e.target.checked)}
            className="rounded text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
          />
          <span>Show phone frame</span>
        </label>
        
        {role === 'admin' && (
          <button 
            onClick={() => setIsConfigOpen(true)}
            className="ml-auto px-4 py-1.5 bg-black text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
          >
            Configure Profile
          </button>
        )}
      </div>

      {/* Simulator Frame */}
      <div className={`transition-all duration-300 ${showPhoneFrame ? 'border-[12px] border-black rounded-[3rem] shadow-2xl p-0.5 bg-black' : 'border border-gray-200 rounded-[2rem] shadow-lg'} w-full max-w-[390px] h-[844px] overflow-hidden flex flex-col relative bg-white`}>
        
        {platformTab === 'instagram' ? (
          // --- INSTAGRAM SIMULATOR ---
          <>
            <div className="h-14 flex items-center justify-between px-6 bg-white shrink-0 pt-2 z-10">
              <span className="font-bold text-gray-900 truncate flex-1 flex items-center gap-1">
                {client?.brand_settings?.handles?.instagram || 'your_brand'}
                {pSettings.verified && <span className="w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center text-[10px] ml-1">✓</span>}
              </span>
              <MoreHorizontal size={20} className="text-gray-800" />
            </div>

            <div className="px-4 py-4 shrink-0 bg-white z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-20 h-20 rounded-full bg-gray-100 border border-gray-200 p-0.5 relative shrink-0">
                  <div className="w-full h-full rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                    {client?.brand_settings?.logoUrl ? (
                      <img src={client.brand_settings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="text-gray-400" />
                    )}
                  </div>
                </div>
                <div className="flex-1 flex justify-around ml-4 text-center">
                  <div><p className="font-bold text-gray-900">{pSettings.posts || igContent.length}</p><p className="text-[11px] text-gray-500">posts</p></div>
                  <div><p className="font-bold text-gray-900">{pSettings.followers || '12.4k'}</p><p className="text-[11px] text-gray-500">followers</p></div>
                  <div><p className="font-bold text-gray-900">{pSettings.following || '145'}</p><p className="text-[11px] text-gray-500">following</p></div>
                </div>
              </div>
              <div className="text-sm">
                <p className="font-bold text-gray-900">{client?.company_name || 'Your Brand'}</p>
                <p className="text-gray-500 text-xs mt-0.5">{pSettings.category || 'Brand / Marketing'}</p>
                <p className="text-gray-800 whitespace-pre-wrap mt-1 leading-snug">{pSettings.bio || 'Welcome to our official profile! We create amazing things.'}</p>
                <a href={`https://${pSettings.website || 'linktr.ee/brand'}`} className="text-[#00376b] font-medium mt-1 inline-block" target="_blank" rel="noreferrer">{pSettings.website || 'linktr.ee/brand'}</a>
              </div>
              
              <div className="flex gap-2 mt-4">
                <button className="flex-1 bg-gray-100 font-semibold text-gray-900 rounded-lg py-1.5 text-sm">Follow</button>
                <button className="flex-1 bg-gray-100 font-semibold text-gray-900 rounded-lg py-1.5 text-sm">Message</button>
                <button className="bg-gray-100 font-semibold text-gray-900 rounded-lg py-1.5 px-3 text-sm">...</button>
              </div>
            </div>

            <div className="flex justify-around border-t border-gray-100 shrink-0 bg-white z-10">
              <button onClick={() => setFeedView('grid')} className={`flex-1 py-3 flex justify-center border-b-2 transition-colors ${feedView === 'grid' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400'}`}><Grid size={22} /></button>
              <button onClick={() => setFeedView('reels')} className={`flex-1 py-3 flex justify-center border-b-2 transition-colors ${feedView === 'reels' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400'}`}><PlaySquare size={22} /></button>
              <button onClick={() => setFeedView('stories')} className={`flex-1 py-3 flex justify-center border-b-2 transition-colors ${feedView === 'stories' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400'}`}><PlayCircle size={22} /></button>
            </div>

            <div className="flex-1 overflow-y-auto bg-white p-0.5 custom-scrollbar">
              {feedView === 'stories' ? (
                <div className="flex flex-col items-center justify-center h-48 text-center p-6 text-gray-400">
                  <PlayCircle size={40} className="mb-2 opacity-50" />
                  <p className="text-sm">No stories scheduled.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-0.5">
                  {displayedContent.map((item) => (
                    <div key={item.id} className="aspect-square relative cursor-pointer bg-gray-100 group" onClick={() => setSelectedEvent(item)}>
                      {item.image_url ? (
                        <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400"><ImageIcon size={24}/></div>
                      )}
                      {item.type === 'Reel' && <PlaySquare size={16} className="absolute top-2 right-2 text-white drop-shadow-md" />}
                    </div>
                  ))}
                  {/* Fill empty cells to complete rows */}
                  {Array.from({ length: Math.max(0, 3 - (displayedContent.length % 3 === 0 && displayedContent.length > 0 ? 3 : displayedContent.length % 3)) }).map((_, i) => (
                     <div key={`empty-${i}`} className="aspect-square bg-gray-100"></div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          // --- TIKTOK SIMULATOR ---
          <>
            <div className="px-4 py-8 shrink-0 bg-white z-10 flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center mb-3 relative">
                {client?.brand_settings?.logoUrl ? (
                  <img src={client.brand_settings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="text-gray-400" />
                )}
              </div>
              <h2 className="font-bold text-gray-900 text-lg flex items-center gap-1">
                @{client?.brand_settings?.handles?.tiktok || 'brand'}
                {pSettings.verified && <span className="w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center text-[10px]">✓</span>}
              </h2>
              <p className="text-gray-900">{client?.company_name || 'Brand Name'}</p>
              
              <div className="flex gap-6 mt-4 mb-4">
                <div className="text-center"><p className="font-bold text-gray-900">{pSettings.following || '45'}</p><p className="text-xs text-gray-500">Following</p></div>
                <div className="text-center"><p className="font-bold text-gray-900">{pSettings.followers || '8.2K'}</p><p className="text-xs text-gray-500">Followers</p></div>
                <div className="text-center"><p className="font-bold text-gray-900">{pSettings.likes || '120K'}</p><p className="text-xs text-gray-500">Likes</p></div>
              </div>

              <div className="flex gap-2 w-full mt-2">
                <button className="flex-1 bg-[#fe2c55] font-semibold text-white rounded-lg py-2 text-sm">Follow</button>
                <button className="px-4 bg-gray-100 font-semibold text-gray-900 rounded-lg py-2 text-sm"><ImageIcon size={18}/></button>
              </div>
              
              <p className="text-gray-900 text-sm mt-4 text-center whitespace-pre-wrap">{pSettings.bio || 'Making the best content on TikTok.'}</p>
              <a href={`https://${pSettings.website || 'brand.com'}`} className="text-sm font-medium mt-1">{pSettings.website || 'brand.com'}</a>
            </div>

            <div className="flex justify-around border-t border-gray-100 shrink-0 bg-white z-10">
              <button className="flex-1 py-3 flex justify-center border-b-2 border-gray-900 text-gray-900"><Grid size={22} /></button>
              <button className="flex-1 py-3 flex justify-center border-b-2 border-transparent text-gray-400"><PlaySquare size={22} /></button>
            </div>

            <div className="flex-1 overflow-y-auto bg-white p-0.5 custom-scrollbar">
              <div className="grid grid-cols-3 gap-0.5">
                {displayedContent.map((item) => (
                  <div key={item.id} className="aspect-[9/16] relative cursor-pointer bg-gray-200 group" onClick={() => setSelectedEvent(item)}>
                    {item.image_url ? (
                      <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-500"><ImageIcon size={24}/></div>
                    )}
                    <div className="absolute bottom-1 left-1 flex items-center text-white text-[10px] font-semibold">
                      <PlaySquare size={12} className="mr-0.5" /> 1.2K
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <ContentDrawer 
        isOpen={!!selectedEvent} 
        onClose={() => setSelectedEvent(null)} 
        item={selectedEvent}
      />

      <ProfileConfigDrawer 
        isOpen={isConfigOpen} 
        onClose={() => setIsConfigOpen(false)} 
        platform={platformTab} 
        client={client} 
      />
    </div>
  );
};
