import React, { useState } from 'react';
import { X, Save, Image as ImageIcon, Camera, Hash, Calendar, FileText, Tag, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface AddContentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const AddContentDrawer: React.FC<AddContentDrawerProps> = ({ isOpen, onClose, onSave }) => {
  const { activeClientId } = useAuth();
  
  const [platform, setPlatform] = useState('Instagram');
  const [type, setType] = useState('Reel');
  const [category, setCategory] = useState('Educational');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [publishTime, setPublishTime] = useState('10:00');
  const [copy, setCopy] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [contentFile, setContentFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setPlatform('Instagram');
      setType('Reel');
      setCategory('Educational');
      setDate(new Date().toISOString().split('T')[0]);
      setPublishTime('10:00');
      setCopy('');
      setHashtags('');
      setMediaUrl('');
      setCoverFile(null);
      setContentFile(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClientId) {
      alert('Please select a workspace client first.');
      return;
    }
    
    setLoading(true);
    
    let finalImageUrl = mediaUrl;
    let finalContentUrl = '';

    // Upload Cover
    if (coverFile) {
      const fileExt = coverFile.name.split('.').pop();
      const fileName = `cover_${Math.random()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage.from('content_media').upload(fileName, coverFile);
      if (uploadError) {
        alert(`Error uploading cover: ${uploadError.message}`);
        setLoading(false);
        return;
      }
      const { data } = supabase.storage.from('content_media').getPublicUrl(fileName);
      finalImageUrl = data.publicUrl;
    }

    // Upload Video/Content
    if (contentFile) {
      const fileExt = contentFile.name.split('.').pop();
      const fileName = `content_${Math.random()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage.from('content_media').upload(fileName, contentFile);
      if (uploadError) {
        alert(`Error uploading content: ${uploadError.message}`);
        setLoading(false);
        return;
      }
      const { data } = supabase.storage.from('content_media').getPublicUrl(fileName);
      finalContentUrl = data.publicUrl;
    }
    
    const finalDescription = finalContentUrl ? `${copy}\n\n[Content URL: ${finalContentUrl}]` : copy;

    const newContent = {
      title: `${type} on ${platform}`,
      type,
      platform,
      category,
      status: 'Draft',
      date,
      publish_time: publishTime,
      hashtags,
      description: finalDescription,
      image_url: finalImageUrl,
      client_id: activeClientId
    };

    const { error } = await supabase.from('content_posts').insert([newContent]);
    
    setLoading(false);
    
    if (!error) {
      onSave();
      onClose();
    } else {
      console.error('Insert Error:', error);
      if (error.message.includes('column') && error.message.includes('does not exist')) {
        alert(`Database schema error: It seems the columns 'category', 'publish_time', or 'hashtags' do not exist in 'content_posts'. Please run the required SQL migrations.`);
      } else {
        alert(`Error creating content: ${error.message || JSON.stringify(error)}`);
      }
    }
  };

  const contentTypes = {
    'Instagram': ['Reel', 'Carrusel', 'Post estático', 'Secuencia de historias'],
    'Tiktok': ['TikTok']
  };

  const categories = ['Educational', 'Entertaining', 'Promotional', 'Behind the Scenes', 'Testimonial', 'Other'];

  const handlePlatformChange = (newPlatform: string) => {
    setPlatform(newPlatform);
    setType(contentTypes[newPlatform as keyof typeof contentTypes][0]);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 w-full md:w-[500px] bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Calendar size={20} className="mr-2 text-[var(--brand-primary)]" />
            Plan New Content
          </h2>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <form id="add-content-form" onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* Red Social */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Platform</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handlePlatformChange('Instagram')}
                  className={`flex-1 py-3 px-4 rounded-xl border flex flex-col items-center justify-center gap-1 font-medium transition-all ${platform === 'Instagram' ? 'bg-pink-50 border-pink-200 text-pink-700 ring-1 ring-pink-500 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  <Camera size={20} /> Instagram
                </button>
                <button
                  type="button"
                  onClick={() => handlePlatformChange('Tiktok')}
                  className={`flex-1 py-3 px-4 rounded-xl border flex flex-col items-center justify-center gap-1 font-medium transition-all ${platform === 'Tiktok' ? 'bg-gray-900 border-gray-900 text-white ring-1 ring-gray-900 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  <Hash size={20} /> TikTok
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Tipo de contenido */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Content Type</label>
                <select 
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent transition-all"
                >
                  {contentTypes[platform as keyof typeof contentTypes].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent transition-all"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Fecha y Hora */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center">
                  <Calendar size={14} className="mr-1.5" /> Publish Date
                </label>
                <input 
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center">
                  <Clock size={14} className="mr-1.5" /> Publish Time
                </label>
                <input 
                  type="time"
                  value={publishTime}
                  onChange={(e) => setPublishTime(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100">
              {/* Archivo de Contenido (Video/Imagen principal) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center">
                  <Camera size={14} className="mr-1.5" /> Media (Video/Image)
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-[var(--brand-primary)] transition-colors bg-gray-50/50">
                  <div className="space-y-1 text-center">
                    <Camera className="mx-auto h-10 w-10 text-gray-400" />
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label htmlFor="file-upload-content" className="relative cursor-pointer rounded-md font-medium text-[var(--brand-primary)] hover:text-[var(--brand-primary)]/80 focus-within:outline-none">
                        <span>Upload a file</span>
                        <input 
                          id="file-upload-content" 
                          name="file-upload-content" 
                          type="file" 
                          className="sr-only"
                          accept="video/*,image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setContentFile(e.target.files[0]);
                            }
                          }}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">{contentFile ? contentFile.name : 'MP4, MOV, JPG up to 50MB'}</p>
                  </div>
                </div>
              </div>

              {/* Portada / Cover */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center">
                  <ImageIcon size={14} className="mr-1.5" /> Cover Image
                </label>
                <div className="flex items-center gap-3">
                  <label htmlFor="file-upload-cover" className="relative cursor-pointer px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    <span>Choose Cover</span>
                    <input 
                      id="file-upload-cover" 
                      name="file-upload-cover" 
                      type="file" 
                      className="sr-only"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setCoverFile(e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                  <span className="text-sm text-gray-500 truncate max-w-[200px]">
                    {coverFile ? coverFile.name : 'No file chosen'}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1.5">Optional. Will be shown in the feed preview.</p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 space-y-4">
              {/* Copy */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center">
                  <FileText size={14} className="mr-1.5" /> Caption / Copy
                </label>
                <textarea 
                  value={copy}
                  onChange={(e) => setCopy(e.target.value)}
                  placeholder="Write an engaging caption..."
                  rows={5}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] transition-all resize-none custom-scrollbar"
                />
              </div>

              {/* Hashtags */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center">
                  <Tag size={14} className="mr-1.5" /> Hashtags
                </label>
                <input 
                  type="text"
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                  placeholder="#marketing #socialmedia"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] transition-all"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0 flex justify-end space-x-3">
          <button 
            type="button" 
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="add-content-form"
            disabled={loading}
            className="px-5 py-2.5 text-sm font-bold text-white bg-[var(--brand-primary)] rounded-xl hover:bg-[var(--brand-primary)]/90 transition-colors flex items-center disabled:opacity-70 shadow-sm"
          >
            {loading ? 'Saving...' : (
              <>
                <Save size={18} className="mr-2" />
                Schedule Content
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
};
