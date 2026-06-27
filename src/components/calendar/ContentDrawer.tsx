import React, { useState } from 'react';
import { X, Camera, MessageSquare, Clock, CheckCircle, Trash2, History } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { VersionHistoryPanel } from '../preview/VersionHistoryPanel';

interface ContentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  item: any | null;
  onUpdate?: () => void;
}

export const ContentDrawer: React.FC<ContentDrawerProps> = ({ isOpen, onClose, item, onUpdate }) => {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isAddingPin, setIsAddingPin] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activePinCoordinates, setActivePinCoordinates] = useState<{x: number, y: number} | null>(null);
  const [localComments, setLocalComments] = useState([{
    id: 1,
    author: 'Carlos (Client)',
    text: 'Looks great! Can we change the second hashtag to #MarketingAgency?',
    time: 'Today, 09:30 AM',
    initials: 'C',
    isResolved: false,
    pinCoordinates: null as {x: number, y: number} | null
  }]);

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

  const handleUpdateStatus = async (newStatus: string) => {
    const { error } = await supabase.from('content_posts').update({ status: newStatus }).eq('id', item.id);
    if (!error) {
      if (newStatus === 'Approved') {
        setShowSuccess(true);
        setTimeout(() => {
          if (onUpdate) onUpdate();
          onClose();
          setShowSuccess(false);
        }, 2500);
      } else {
        if (onUpdate) onUpdate();
        onClose();
      }
    } else {
      alert('Error updating status');
    }
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    setLocalComments([...localComments, {
      id: Date.now(),
      author: 'You',
      text: commentText,
      time: 'Just now',
      initials: 'Y',
      isResolved: false,
      pinCoordinates: activePinCoordinates
    }]);
    setCommentText('');
    setActivePinCoordinates(null);
    setIsAddingPin(false);
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAddingPin) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setActivePinCoordinates({ x, y });
    document.getElementById('comment-input')?.focus();
  };

  const toggleResolve = (id: number) => {
    setLocalComments(localComments.map(c => 
      c.id === id ? { ...c, isResolved: !c.isResolved } : c
    ));
  };

  const unmountedPins = localComments.filter(c => c.pinCoordinates && !c.isResolved);
  const resolvedComments = localComments.filter(c => c.isResolved);
  const openComments = localComments.filter(c => !c.isResolved);

  if (showSuccess) {
    return (
      <>
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
        <div className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-white shadow-2xl z-50 flex flex-col items-center justify-center p-8 transform transition-transform duration-300 ease-in-out">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle size={48} className="text-green-500 animate-bounce" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Content Approved!</h2>
          <p className="text-gray-500 text-center">Your team has been notified and the content is ready for publishing.</p>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`fixed inset-y-0 right-0 w-full md:w-[450px] bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        <div className="flex items-center justify-between p-4 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center">
            {item.platform === 'Instagram' ? (
              <Camera size={18} className="mr-2 text-pink-600" />
            ) : (
              <span className="mr-2 font-bold bg-black text-white px-1.5 py-0.5 rounded text-[10px]">TikTok</span>
            )}
            Content Review
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
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <div className="p-4 flex items-center justify-between border border-gray-100 rounded-lg bg-gray-50/50 mb-6">
            <div className="flex items-center space-x-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center ${
                item.status === 'Approved' ? 'bg-green-100 text-green-700' :
                item.status === 'Changes Requested' ? 'bg-amber-100 text-amber-700' :
                'bg-gray-200 text-gray-700'
              }`}>
                {item.status === 'Approved' && <CheckCircle size={12} className="mr-1" />}
                {item.status === 'Changes Requested' && <Clock size={12} className="mr-1" />}
                {item.status}
              </span>
            </div>
            <div className="text-sm font-medium text-gray-500">
              Scheduled: {item.date}
            </div>
          </div>

          {/* Media Preview (Mock / Real) with Annotation logic */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-gray-800">Media</h3>
              <button 
                onClick={() => {
                  setIsAddingPin(!isAddingPin);
                  if (isAddingPin) setActivePinCoordinates(null);
                }}
                className={`text-xs px-2 py-1 rounded font-medium transition-colors ${isAddingPin ? 'bg-[var(--brand-primary)] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {isAddingPin ? 'Cancel Pin' : 'Add Annotation Pin'}
              </button>
            </div>
            
            <div 
              onClick={handleImageClick}
              className={`w-full aspect-[4/5] bg-gray-100 rounded-xl relative overflow-hidden flex items-center justify-center border border-gray-200 ${isAddingPin ? 'cursor-crosshair ring-2 ring-[var(--brand-primary)]' : ''}`}
            >
              {item.image_url ? (
                <img 
                  src={item.image_url} 
                  alt="Contenido"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-gray-400 flex flex-col items-center">
                  <Camera size={32} className="mb-2" />
                  <span className="text-sm font-medium">No Media</span>
                </div>
              )}

              {/* Render existing pins */}
              {unmountedPins.map((comment, index) => (
                <div 
                  key={comment.id}
                  className="absolute w-6 h-6 bg-[var(--brand-primary)] text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md transform -translate-x-1/2 -translate-y-1/2 cursor-pointer border-2 border-white"
                  style={{ left: `${comment.pinCoordinates!.x}%`, top: `${comment.pinCoordinates!.y}%` }}
                  title={comment.text}
                >
                  {index + 1}
                </div>
              ))}

              {/* Render active pin being placed */}
              {activePinCoordinates && (
                <div 
                  className="absolute w-6 h-6 bg-amber-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md transform -translate-x-1/2 -translate-y-1/2 border-2 border-white animate-pulse"
                  style={{ left: `${activePinCoordinates.x}%`, top: `${activePinCoordinates.y}%` }}
                >
                  *
                </div>
              )}
            </div>
          </div>

          {/* Copy / Caption */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-800 mb-2">Copy / Caption</h3>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
              {item.description || 'Sin texto'}
            </div>
          </div>

          {/* Comentarios */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
              <h3 className="text-sm font-bold text-gray-800 flex items-center">
                <MessageSquare size={16} className="mr-2 text-gray-400" />
                Comments
              </h3>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">{openComments.length} Open</span>
            </div>
            
            <div className="space-y-4">
              {openComments.map((comment, idx) => (
                <div key={comment.id} className="flex space-x-3 group relative">
                  <div className={`w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-xs shrink-0 ${comment.author === 'You' ? 'bg-gray-800' : 'bg-[var(--brand-primary)]'}`}>
                    {comment.initials}
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg rounded-tl-none border border-gray-100 text-sm flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-semibold text-gray-800 flex items-center gap-2">
                        {comment.author}
                        {comment.pinCoordinates && (
                          <span className="bg-amber-100 text-amber-700 text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Pin #{idx + 1}</span>
                        )}
                      </p>
                      <button 
                        onClick={() => toggleResolve(comment.id)}
                        className="text-[10px] text-gray-400 hover:text-green-600 font-medium flex items-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <CheckCircle size={12} className="mr-1" /> Resolve
                      </button>
                    </div>
                    <p className="text-gray-600">{comment.text}</p>
                    <p className="text-xs text-gray-400 mt-2">{comment.time}</p>
                  </div>
                </div>
              ))}

              {resolvedComments.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Resolved ({resolvedComments.length})</p>
                  <div className="space-y-3 opacity-60">
                    {resolvedComments.map(comment => (
                      <div key={comment.id} className="flex space-x-3">
                        <div className="w-6 h-6 rounded-full bg-gray-300 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                          {comment.initials}
                        </div>
                        <div className="bg-gray-50 p-2.5 rounded-lg rounded-tl-none border border-gray-100 text-xs flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <p className="font-semibold text-gray-600">{comment.author}</p>
                            <button onClick={() => toggleResolve(comment.id)} className="text-[10px] text-gray-400 hover:text-gray-600 font-medium">
                              Reopen
                            </button>
                          </div>
                          <p className="text-gray-500 line-through">{comment.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-4 flex flex-col gap-2 relative">
              {activePinCoordinates && (
                <div className="text-xs text-amber-600 font-medium flex items-center bg-amber-50 p-2 rounded-lg border border-amber-100">
                  <span className="bg-amber-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px] mr-2">*</span>
                  Pin placed. Write your comment below.
                  <button onClick={() => { setActivePinCoordinates(null); setIsAddingPin(false); }} className="ml-auto text-amber-800 hover:underline">Cancel</button>
                </div>
              )}
              <div className="flex space-x-2">
                <input 
                  id="comment-input"
                  type="text" 
                  placeholder={activePinCoordinates ? "Write note for pin..." : "Write a comment..."}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--brand-primary)]" 
                />
                <button onClick={handleAddComment} className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors">
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="p-4 border-t border-gray-100 bg-white flex space-x-3 shrink-0">
          <button onClick={() => setIsHistoryOpen(true)} className="py-2.5 px-3 border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors" title="View Version History">
            <History size={18} />
          </button>
          <button onClick={() => handleUpdateStatus('Changes Requested')} className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-lg text-sm hover:bg-gray-50 transition-colors">
            Request Changes
          </button>
          <button onClick={() => handleUpdateStatus('Approved')} className="flex-1 py-2.5 bg-[var(--brand-primary)] text-white font-semibold rounded-lg text-sm hover:bg-[var(--brand-primary)]/90 transition-colors">
            Approve
          </button>
        </div>
      </div>

      <VersionHistoryPanel 
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        currentItem={item}
      />
    </>
  );
};
