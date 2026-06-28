import React, { useState, useEffect } from 'react';
import { X, Save, Image as ImageIcon, Plus, GripVertical } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ProfileConfigDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  platform: 'instagram' | 'tiktok';
  client: any;
}

export const ProfileConfigDrawer: React.FC<ProfileConfigDrawerProps> = ({ isOpen, onClose, platform, client }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({
    bio: '',
    website: '',
    followers: '',
    following: '',
    posts: '',
    likes: '',
    verified: false,
    category: ''
  });

  useEffect(() => {
    if (client?.brand_settings) {
      const pSettings = client.brand_settings[`${platform}_profile`] || {};
      setFormData({
        bio: pSettings.bio || '',
        website: pSettings.website || '',
        followers: pSettings.followers || '',
        following: pSettings.following || '',
        posts: pSettings.posts || '',
        likes: pSettings.likes || '',
        verified: pSettings.verified || false,
        category: pSettings.category || ''
      });
    }
  }, [client, platform]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const currentSettings = client?.brand_settings || {};
      const updatedSettings = {
        ...currentSettings,
        [`${platform}_profile`]: formData
      };

      const { error } = await supabase
        .from('profiles')
        .update({ brand_settings: updatedSettings })
        .eq('id', client.id);

      if (error) throw error;
      
      alert(`${platform === 'instagram' ? 'Instagram' : 'TikTok'} profile settings saved!`);
      onClose();
      // A page reload or context refresh would normally happen here
    } catch (err: any) {
      alert(err.message || 'Error saving settings.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100] transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-[110] flex flex-col animate-in slide-in-from-right duration-300">
        
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 capitalize">Configure {platform} Profile</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          {/* Identity Section */}
          <section className="space-y-4">
            <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2">Profile Identity</h3>
            
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
                {client?.brand_settings?.logoUrl ? (
                  <img src={client.brand_settings.logoUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">Profile photo syncs with Brand Settings.</p>
                <button className="text-[var(--brand-primary)] text-sm font-semibold hover:underline">Change Photo</button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-sm font-medium text-gray-700">Verified Badge (Blue Checkmark)</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={formData.verified} onChange={(e) => setFormData({...formData, verified: e.target.checked})} />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>

            {platform === 'instagram' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Label</label>
                <input 
                  type="text" 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-black focus:border-black"
                  placeholder="e.g. Clothing Store, Creator"
                />
              </div>
            )}
          </section>

          {/* Bio Section */}
          <section className="space-y-4">
            <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2">Biography</h3>
            
            <div>
              <div className="flex justify-between items-end mb-1">
                <label className="block text-sm font-medium text-gray-700">Bio Text</label>
                <span className="text-[10px] text-gray-400">{formData.bio.length} / {platform === 'instagram' ? 150 : 80}</span>
              </div>
              <textarea 
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                rows={3}
                maxLength={platform === 'instagram' ? 150 : 80}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-black focus:border-black resize-none"
                placeholder="Write exactly as it appears on your profile..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website URL (Link in bio)</label>
              <input 
                type="text" 
                value={formData.website}
                onChange={(e) => setFormData({...formData, website: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-black focus:border-black"
                placeholder="linktr.ee/brand"
              />
            </div>
          </section>

          {/* Stats Section */}
          <section className="space-y-4">
            <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2">Statistics</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Followers</label>
                <input 
                  type="text" 
                  value={formData.followers}
                  onChange={(e) => setFormData({...formData, followers: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-black focus:border-black"
                  placeholder="e.g. 12.4K"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Following</label>
                <input 
                  type="text" 
                  value={formData.following}
                  onChange={(e) => setFormData({...formData, following: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-black focus:border-black"
                  placeholder="e.g. 340"
                />
              </div>
              {platform === 'tiktok' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Likes</label>
                  <input 
                    type="text" 
                    value={formData.likes}
                    onChange={(e) => setFormData({...formData, likes: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-black focus:border-black"
                    placeholder="e.g. 1.2M"
                  />
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 mt-2">
              <div>
                <span className="text-sm font-medium text-gray-700 block">Auto-count {platform === 'instagram' ? 'posts' : 'videos'}</span>
                <span className="text-[10px] text-gray-500">Counts pieces from calendar</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--brand-primary)]"></div>
              </label>
            </div>
          </section>

          {/* Highlights Section */}
          {platform === 'instagram' && (
            <section className="space-y-4">
              <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2">Story Highlights</h3>
              <p className="text-xs text-gray-500">Add up to 8 highlights to appear below the bio.</p>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-3 p-2 bg-gray-50 border border-gray-200 rounded-lg cursor-move">
                  <GripVertical size={16} className="text-gray-400" />
                  <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                    <ImageIcon size={16} className="text-gray-400" />
                  </div>
                  <input type="text" className="flex-1 bg-transparent border-none text-sm focus:ring-0 px-0" defaultValue="Products" />
                  <button className="text-red-500 p-1"><X size={16} /></button>
                </div>
              </div>

              <button className="w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 flex items-center justify-center space-x-2 transition-colors">
                <Plus size={16} />
                <span>Add Highlight</span>
              </button>
            </section>
          )}

        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 shrink-0">
          <button 
            onClick={handleSave}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 py-3 bg-black text-white rounded-xl font-bold shadow-sm hover:bg-gray-800 focus:ring-4 focus:ring-gray-200 transition-all disabled:opacity-50"
          >
            <Save size={18} />
            <span>{loading ? 'Saving...' : `Save ${platform === 'instagram' ? 'Instagram' : 'TikTok'} Profile`}</span>
          </button>
        </div>
        
      </div>
    </>
  );
};
