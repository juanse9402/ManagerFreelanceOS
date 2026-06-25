import React from 'react';
import { X, Camera, MessageSquare, Clock, CheckCircle, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ContentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  item: any | null;
  onUpdate?: () => void;
}

export const ContentDrawer: React.FC<ContentDrawerProps> = ({ isOpen, onClose, item, onUpdate }) => {
  if (!isOpen || !item) return null;

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this content?')) {
      const { error } = await supabase.from('content_posts').delete().eq('id', item.id);
      if (!error) {
        if (onUpdate) onUpdate();
        onClose();
      } else {
        alert('Error deleting content');
      }
    }
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`fixed inset-y-0 right-0 w-full md:w-[450px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center">
            {item.platform === 'Instagram' ? (
              <Camera size={18} className="mr-2 text-pink-600" />
            ) : (
              <span className="mr-2 font-bold bg-black text-white px-1.5 py-0.5 rounded text-[10px]">TikTok</span>
            )}
            Revisión de Contenido
          </h2>
          <div className="flex items-center space-x-2">
            <button onClick={handleDelete} className="p-2 rounded-full hover:bg-red-50 text-red-500 transition-colors" title="Delete">
              <Trash2 size={18} />
            </button>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto h-[calc(100vh-140px)]">
          <div className="p-4 flex items-center justify-between border-b border-gray-100 bg-gray-50/50 mb-6">
            <div className="flex items-center space-x-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center ${
                item.status === 'Approved' ? 'bg-green-100 text-green-700' :
                item.status === 'In Review' ? 'bg-amber-100 text-amber-700' :
                'bg-gray-200 text-gray-700'
              }`}>
                {item.status === 'Approved' && <CheckCircle size={12} className="mr-1" />}
                {item.status === 'In Review' && <Clock size={12} className="mr-1" />}
                {item.status}
              </span>
            </div>
            <div className="text-sm font-medium text-gray-500">
              Scheduled: {item.date}
            </div>
          </div>

          {/* Media Preview (Mock) */}
          <div className="w-full aspect-[4/5] bg-gray-100 rounded-xl mb-6 relative overflow-hidden flex items-center justify-center border border-gray-200">
            <img 
              src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=600&q=80" 
              alt="Contenido"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Copy / Caption */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-800 mb-2">Copy / Caption</h3>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 text-sm text-gray-600 leading-relaxed">
              <p className="mb-2">Are you disorganized? Try these 3 methods to save up to 10 hours a week! 🚀👇</p>
              <p className="mb-2">1. Time-blocking<br/>2. Pomodoro Technique<br/>3. Automating repetitive tasks</p>
              <p className="text-[var(--brand-primary)]">#Productivity #Freelance #Tips</p>
            </div>
          </div>

          {/* Comentarios */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-800 flex items-center">
                <MessageSquare size={16} className="mr-2 text-gray-400" />
                Comments
              </h3>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">1</span>
            </div>
            
            <div className="space-y-4">
              <div className="flex space-x-3">
                <div className="w-8 h-8 rounded-full bg-[var(--brand-primary)] text-white flex items-center justify-center font-bold text-xs shrink-0">
                  C
                </div>
                <div className="bg-gray-50 p-3 rounded-lg rounded-tl-none border border-gray-100 text-sm">
                  <p className="font-semibold text-gray-800 mb-1">Carlos (Client)</p>
                  <p className="text-gray-600">Looks great! Can we change the second hashtag to #MarketingAgency?</p>
                  <p className="text-xs text-gray-400 mt-2">Today, 09:30 AM</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex space-x-2">
              <input type="text" placeholder="Write a comment..." className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--brand-primary)]" />
              <button className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors">
                Send
              </button>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="p-4 border-t border-gray-100 bg-white flex space-x-3 sticky bottom-0">
          <button className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-lg text-sm hover:bg-gray-50 transition-colors">
            Request Changes
          </button>
          <button className="flex-1 py-2.5 bg-[var(--brand-primary)] text-white font-semibold rounded-lg text-sm hover:bg-[var(--brand-primary)]/90 transition-colors">
            Approve
          </button>
        </div>
      </div>
    </>
  );
};
