import React, { useState, useEffect } from 'react';
import { X, Camera, MessageSquare, Clock, CheckCircle, Trash2, History, Smartphone, Monitor, Share2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { VersionHistoryPanel } from '../preview/VersionHistoryPanel';
import { useAuth } from '../../contexts/AuthContext';

interface ContentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  item: any | null;
  onUpdate?: () => void;
}

export const ContentDrawer: React.FC<ContentDrawerProps> = ({ isOpen, onClose, item, onUpdate }) => {
  const { role, user } = useAuth();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isAddingPin, setIsAddingPin] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('mobile');
  const [activePinCoordinates, setActivePinCoordinates] = useState<{x: number, y: number} | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [authors, setAuthors] = useState<Record<string, string>>({});
  const [loadingComments, setLoadingComments] = useState(false);

  useEffect(() => {
    if (isOpen && item?.id) {
      fetchComments();
    }
  }, [isOpen, item?.id]);

  const fetchComments = async () => {
    if (!item?.id) return;
    setLoadingComments(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('content_id', item.id)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      const loadedComments = data || [];
      setComments(loadedComments);
      
      const userIds = Array.from(new Set(loadedComments.map((c: any) => c.user_id).filter(Boolean)));
      if (userIds.length > 0) {
        const { data: profiles, error: pErr } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', userIds);
          
        if (profiles && !pErr) {
          const mapping = profiles.reduce((acc: Record<string, string>, p: any) => {
            acc[p.id] = p.full_name;
            return acc;
          }, {});
          setAuthors(mapping);
        }
      }
    } catch (e) {
      console.error('Error fetching comments:', e);
    } finally {
      setLoadingComments(false);
    }
  };

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

  const handleAddComment = async () => {
    if (!commentText.trim() || !item?.id) return;
    
    const newComment = {
      content_id: item.id,
      text: commentText,
      user_id: user?.id || null,
      pin_coordinates: activePinCoordinates ? activePinCoordinates : null,
      is_resolved: false
    };

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([newComment])
        .select('*')
        .single();
        
      if (error) throw error;
      
      setComments(prev => [...prev, data]);
      setCommentText('');
      setActivePinCoordinates(null);
      setIsAddingPin(false);
      
      // Update authors map with user's profileName if logged in
      if (user?.id && !authors[user.id]) {
        const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
        if (profile) {
          setAuthors(prev => ({ ...prev, [user.id]: profile.full_name }));
        }
      }
    } catch (e) {
      console.error('Error adding comment:', e);
      alert('Error adding comment');
    }
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAddingPin) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setActivePinCoordinates({ x, y });
    document.getElementById('comment-input')?.focus();
  };

  const toggleResolve = async (commentId: string, currentResolved: boolean) => {
    try {
      const { error } = await supabase
        .from('comments')
        .update({ is_resolved: !currentResolved })
        .eq('id', commentId);
        
      if (error) throw error;
      
      setComments(prev => prev.map(c => 
        c.id === commentId ? { ...c, is_resolved: !currentResolved } : c
      ));
    } catch (e) {
      console.error('Error toggling resolve state:', e);
      alert('Error updating comment state');
    }
  };

  const handleCopyShareLink = () => {
    if (!item?.client_id) return;
    const url = `${window.location.origin}/shared-portal/${item.client_id}`;
    navigator.clipboard.writeText(url);
    alert('Approval link copied to clipboard!');
  };

  const unmountedPins = comments.filter(c => c.pin_coordinates && !c.is_resolved);
  const resolvedComments = comments.filter(c => c.is_resolved);
  const openComments = comments.filter(c => !c.is_resolved);

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
              <span className="mr-2 font-bold bg-black text-white px-1.5 py-0.5 rounded text-[10px] uppercase">{item.platform}</span>
            )}
            Content Review
          </h2>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleCopyShareLink}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
              title="Copy Approval Quick Link"
            >
              <Share2 size={18} />
            </button>
            {role === 'admin' && (
              <button onClick={handleDelete} className="p-2 rounded-full hover:bg-red-50 text-red-500 transition-colors" title="Delete">
                <Trash2 size={18} />
              </button>
            )}
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
              <div className="flex items-center space-x-2">
                <div className="flex bg-gray-100 rounded p-0.5">
                  <button 
                    onClick={() => setPreviewMode('mobile')}
                    className={`p-1 rounded ${previewMode === 'mobile' ? 'bg-white shadow-sm text-[var(--brand-primary)]' : 'text-gray-400 hover:text-gray-600'}`}
                    title="Mobile Preview"
                  >
                    <Smartphone size={14} />
                  </button>
                  <button 
                    onClick={() => setPreviewMode('desktop')}
                    className={`p-1 rounded ${previewMode === 'desktop' ? 'bg-white shadow-sm text-[var(--brand-primary)]' : 'text-gray-400 hover:text-gray-600'}`}
                    title="Desktop Preview"
                  >
                    <Monitor size={14} />
                  </button>
                </div>
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
            </div>
            
            <div className={`w-full bg-gray-100 rounded-xl relative flex items-center justify-center border border-gray-200 overflow-hidden mx-auto transition-all duration-300 ${isAddingPin ? 'cursor-crosshair ring-2 ring-[var(--brand-primary)]' : ''} ${previewMode === 'mobile' ? 'aspect-[4/5] max-w-sm' : 'aspect-video'}`}>
              <div className="w-full h-full relative" onClick={handleImageClick}>
                {item.image_url ? (
                  <img 
                    src={item.image_url} 
                    alt="Contenido"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400 flex flex-col items-center justify-center h-full">
                    <Camera size={32} className="mb-2" />
                    <span className="text-sm font-medium">No Media</span>
                  </div>
                )}

                {/* Render existing pins */}
                {unmountedPins.map((comment, index) => (
                  <div 
                    key={comment.id}
                    className="absolute w-6 h-6 bg-[var(--brand-primary)] text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md transform -translate-x-1/2 -translate-y-1/2 cursor-pointer border-2 border-white pointer-events-none"
                    style={{ left: `${comment.pinCoordinates!.x}%`, top: `${comment.pinCoordinates!.y}%` }}
                  >
                    {index + 1}
                  </div>
                ))}

                {/* Render active pin being placed */}
                {activePinCoordinates && (
                  <div 
                    className="absolute w-6 h-6 bg-amber-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md transform -translate-x-1/2 -translate-y-1/2 border-2 border-white animate-pulse pointer-events-none"
                    style={{ left: `${activePinCoordinates.x}%`, top: `${activePinCoordinates.y}%` }}
                  >
                    *
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Copy / Caption */}
          <div className="mb-6 mt-4">
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
            
            {loadingComments ? (
              <div className="text-center py-4 text-xs text-gray-400">Loading comments...</div>
            ) : (
              <div className="space-y-4">
                {openComments.map((comment) => {
                  const authorName = comment.user_id ? (authors[comment.user_id] || 'Agency Member') : 'Client (Quick Link)';
                  const initials = authorName[0].toUpperCase();
                  const dateStr = comment.created_at ? new Date(comment.created_at).toLocaleString() : 'Just now';
                  
                  return (
                    <div key={comment.id} className="flex space-x-3 group relative">
                      <div className={`w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-xs shrink-0 ${comment.user_id ? 'bg-gray-800' : 'bg-[var(--brand-primary)]'}`}>
                        {initials}
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg rounded-tl-none border border-gray-100 text-sm flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-semibold text-gray-800 flex items-center gap-2">
                            {authorName}
                            {comment.pin_coordinates && (
                              <span className="bg-amber-100 text-amber-700 text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Pin</span>
                            )}
                          </p>
                          <button 
                            onClick={() => toggleResolve(comment.id, comment.is_resolved)}
                            className="text-[10px] text-gray-400 hover:text-green-600 font-medium flex items-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <CheckCircle size={12} className="mr-1" /> Resolve
                          </button>
                        </div>
                        <p className="text-gray-600">{comment.text}</p>
                        <p className="text-xs text-gray-400 mt-2">{dateStr}</p>
                      </div>
                    </div>
                  );
                })}

                {resolvedComments.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Resolved ({resolvedComments.length})</p>
                    <div className="space-y-3 opacity-60">
                      {resolvedComments.map(comment => {
                        const authorName = comment.user_id ? (authors[comment.user_id] || 'Agency Member') : 'Client (Quick Link)';
                        const initials = authorName[0].toUpperCase();
                        
                        return (
                          <div key={comment.id} className="flex space-x-3">
                            <div className="w-6 h-6 rounded-full bg-gray-300 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                              {initials}
                            </div>
                            <div className="bg-gray-50 p-2.5 rounded-lg rounded-tl-none border border-gray-100 text-xs flex-1">
                              <div className="flex justify-between items-start mb-1">
                                <p className="font-semibold text-gray-600">{authorName}</p>
                                <button 
                                  onClick={() => toggleResolve(comment.id, comment.is_resolved)} 
                                  className="text-[10px] text-gray-400 hover:text-gray-600 font-medium"
                                >
                                  Reopen
                                </button>
                              </div>
                              <p className="text-gray-500 line-through">{comment.text}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
            
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
          {role === 'admin' && (
            <button onClick={() => setIsHistoryOpen(true)} className="py-2.5 px-3 border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors" title="View Version History">
              <History size={18} />
            </button>
          )}
          <button onClick={() => handleUpdateStatus('Changes Requested')} className="flex-1 py-2.5 border border-[var(--brand-primary)] text-[var(--brand-primary)] font-semibold rounded-lg text-sm hover:bg-[var(--brand-primary)]/10 transition-colors">
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
