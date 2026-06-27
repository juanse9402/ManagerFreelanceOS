import React, { useState } from 'react';
import { X, Save, Image as ImageIcon, Camera, Hash, Calendar, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface CreateContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const CreateContentModal: React.FC<CreateContentModalProps> = ({ isOpen, onClose, onSave }) => {
  const { activeClientId } = useAuth();
  
  const [platform, setPlatform] = useState('Instagram');
  const [type, setType] = useState('Reel');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('10:00');
  const [copy, setCopy] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setPlatform('Instagram');
      setType('Reel');
      setDate(new Date().toISOString().split('T')[0]);
      setTime('10:00');
      setCopy('');
      setMediaUrl('');
      setFile(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClientId) {
      alert('Por favor, selecciona un cliente primero.');
      return;
    }
    
    setLoading(true);
    
    let finalImageUrl = mediaUrl;

    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('content_media')
        .upload(filePath, file);

      if (uploadError) {
        alert(`Error subiendo imagen. Por favor asegúrate de haber creado un bucket llamado 'content_media' en tu Supabase de manera pública. Detalles: ${uploadError.message}`);
        setLoading(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('content_media')
        .getPublicUrl(filePath);
        
      finalImageUrl = publicUrl;
    }
    
    const newContent = {
      title: `${type} on ${platform}`,
      type,
      platform,
      status: 'Draft',
      date,
      description: copy,
      image_url: finalImageUrl,
      client_id: activeClientId
    };

    const { error } = await supabase.from('content_posts').insert([newContent]);
    
    setLoading(false);
    
    if (!error) {
      onSave();
      onClose();
    } else {
      alert(`Error al crear el contenido: ${error.message || JSON.stringify(error)}`);
      console.error('Insert Error:', error);
    }
  };

  const contentTypes = {
    'Instagram': ['Reel', 'Carrusel', 'Post estático', 'Secuencia de historias'],
    'Tiktok': ['TikTok']
  };

  const handlePlatformChange = (newPlatform: string) => {
    setPlatform(newPlatform);
    setType(contentTypes[newPlatform as keyof typeof contentTypes][0]);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg my-8 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 sticky top-0 z-10">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <Calendar size={18} className="mr-2 text-[var(--brand-primary)]" />
              Programar Nuevo Contenido
            </h2>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 transition-colors">
              <X size={18} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            
            {/* Red Social */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Red Social</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handlePlatformChange('Instagram')}
                  className={`flex-1 py-2.5 px-4 rounded-xl border flex items-center justify-center gap-2 font-medium transition-all ${platform === 'Instagram' ? 'bg-pink-50 border-pink-200 text-pink-700 ring-1 ring-pink-500' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  <Camera size={18} /> Instagram
                </button>
                <button
                  type="button"
                  onClick={() => handlePlatformChange('Tiktok')}
                  className={`flex-1 py-2.5 px-4 rounded-xl border flex items-center justify-center gap-2 font-medium transition-all ${platform === 'Tiktok' ? 'bg-gray-900 border-gray-900 text-white ring-1 ring-gray-900' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  <Hash size={18} /> TikTok
                </button>
              </div>
            </div>

            {/* Tipo de contenido */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tipo de Contenido</label>
              <select 
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent transition-all"
              >
                {contentTypes[platform as keyof typeof contentTypes].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Fecha y Hora */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Fecha</label>
                <input 
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Hora (Pendiente en DB)</label>
                <input 
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] transition-all"
                  required
                />
              </div>
            </div>

            {/* Copy */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center">
                <FileText size={14} className="mr-1.5" /> Copy / Texto
              </label>
              <textarea 
                value={copy}
                onChange={(e) => setCopy(e.target.value)}
                placeholder="Escribe el texto de la publicación aquí..."
                rows={4}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] transition-all resize-none custom-scrollbar"
              />
            </div>

            {/* Portada / Media */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center">
                <ImageIcon size={14} className="mr-1.5" /> Portada (Subir Imagen)
              </label>
              <input 
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFile(e.target.files[0]);
                  }
                }}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] transition-all bg-white"
              />
              <p className="text-xs text-gray-500 mt-1.5">Sube la portada desde tu dispositivo. Se guardará en el storage temporal de Supabase.</p>
            </div>

            {/* Acciones */}
            <div className="pt-4 border-t border-gray-100 flex justify-end space-x-3">
              <button 
                type="button" 
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-[var(--brand-primary)] rounded-lg hover:bg-[var(--brand-primary)]/90 transition-colors flex items-center disabled:opacity-50"
              >
                {loading ? 'Guardando...' : (
                  <>
                    <Save size={16} className="mr-2" />
                    Crear Contenido
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
