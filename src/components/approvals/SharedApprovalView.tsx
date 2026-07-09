import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Camera, 
  Smartphone, 
  Monitor, 
  MessageSquare, 
  CheckCircle, 
  Mail, 
  Lock, 
  Loader2, 
  Send,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export const SharedApprovalView: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { session, user } = useAuth();

  // Authentication State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Progress Brand Reveal (just like LoginView)
  const [brandColor, setBrandColor] = useState('#6366f1'); // Indigio default
  const [brandLogo, setBrandLogo] = useState<string | null>(null);
  const [isClientMode, setIsClientMode] = useState(false);

  // Content Data State
  const [post, setPost] = useState<any | null>(null);
  const [loadingPost, setLoadingPost] = useState(true);
  const [postError, setPostError] = useState<string | null>(null);

  // Comments State
  const [comments, setComments] = useState<any[]>([]);
  const [authors, setAuthors] = useState<Record<string, string>>({});
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  // UI States
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('mobile');
  const [isAddingPin, setIsAddingPin] = useState(false);
  const [activePinCoordinates, setActivePinCoordinates] = useState<{x: number, y: number} | null>(null);
  const [actionSuccess, setActionSuccess] = useState<'approved' | 'changes_requested' | null>(null);

  // Check email for client branding on blur
  const handleEmailBlur = async () => {
    if (!email || !email.includes('@')) return;
    try {
      const { data, error } = await supabase.rpc('get_client_brand_by_email', { client_email: email });
      if (data && !error && data.primary_color) {
        setIsClientMode(true);
        setBrandColor(data.primary_color);
        if (data.logo_url) setBrandLogo(data.logo_url);
      } else {
        setIsClientMode(false);
        setBrandColor('#6366f1');
        setBrandLogo(null);
      }
    } catch (e) {
      console.error('Error fetching brand details:', e);
    }
  };

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      
      // The auth listener in App.tsx or useAuth will trigger a re-render.
      // We will reload the page or trigger local load.
      window.location.reload();
    } catch (err: any) {
      setAuthError(err.message || 'Invalid credentials');
    } finally {
      setAuthLoading(false);
    }
  };

  // Fetch Post and Comments once logged in
  useEffect(() => {
    if (session && postId) {
      loadPostAndComments();
    } else {
      setLoadingPost(false);
    }
  }, [session, postId]);

  const loadPostAndComments = async () => {
    setLoadingPost(true);
    setPostError(null);
    try {
      // 1. Fetch Post
      const { data: postData, error: postErr } = await supabase
        .from('content_posts')
        .select('*')
        .eq('id', postId)
        .single();

      if (postErr) throw postErr;
      setPost(postData);

      // 2. Fetch Comments
      await fetchComments(postData.id);

    } catch (e: any) {
      console.error('Error loading shared post details:', e);
      setPostError(e.message || 'Error loading post. Make sure you have permission to view it.');
    } finally {
      setLoadingPost(false);
    }
  };

  const fetchComments = async (contentPostId: string) => {
    setLoadingComments(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('content_id', contentPostId)
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

  const handleUpdateStatus = async (newStatus: 'Approved' | 'Changes Requested') => {
    if (!post) return;
    try {
      const { error } = await supabase
        .from('content_posts')
        .update({ status: newStatus })
        .eq('id', post.id);

      if (error) throw error;
      
      setPost((prev: any) => ({ ...prev, status: newStatus }));
      setActionSuccess(newStatus === 'Approved' ? 'approved' : 'changes_requested');
      
      setTimeout(() => {
        setActionSuccess(null);
      }, 4000);
    } catch (e) {
      console.error('Error updating status:', e);
      alert('Error updating post status');
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !post) return;
    
    const newComment = {
      content_id: post.id,
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
    document.getElementById('shared-comment-input')?.focus();
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
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const unmountedPins = comments.filter(c => c.pin_coordinates && !c.is_resolved);
  const resolvedComments = comments.filter(c => c.is_resolved);
  const openComments = comments.filter(c => !c.is_resolved);

  // Loader state
  if (loadingPost) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center font-sans">
        <Loader2 className="w-10 h-10 text-[var(--brand-primary)] animate-spin mb-4" />
        <p className="text-sm font-semibold text-gray-500">Cargando detalles de aprobación...</p>
      </div>
    );
  }

  // 1. NOT LOGGED IN VIEW - Sleek integrated login form
  if (!session) {
    return (
      <div 
        className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans transition-all duration-500 ease-in-out bg-slate-900 text-white"
        style={{
          background: isClientMode 
            ? `radial-gradient(circle at top left, ${brandColor}20, #0f172a 60%)` 
            : 'radial-gradient(circle at top left, #1e1b4b, #0f172a 60%)'
        }}
      >
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="flex justify-center mb-6">
            {isClientMode && brandLogo ? (
              <img src={brandLogo} alt="Client Logo" className="w-20 h-20 object-contain rounded-2xl shadow-xl border border-gray-800" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-lg">
                <CheckCircle className="w-8 h-8 text-indigo-400" />
              </div>
            )}
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">Content Review Hub</h2>
          <p className="mt-2 text-sm text-gray-400">
            Sign in below with your client credentials to approve & comment.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-slate-800/80 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-3xl border border-slate-700/50">
            {authError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-2xl text-xs mb-6 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                {authError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                  <input 
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onBlur={handleEmailBlur}
                    placeholder="you@company.com"
                    className="w-full bg-slate-950/50 border border-slate-700 text-white rounded-2xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all placeholder-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                  <input 
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950/50 border border-slate-700 text-white rounded-2xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all placeholder-slate-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-4 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700 text-white text-sm font-semibold rounded-2xl transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98] flex justify-center items-center"
                style={{ backgroundColor: isClientMode ? brandColor : undefined }}
              >
                {authLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : 'Enter Review Session'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // 2. ERROR VIEW
  if (postError || !post) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 text-center font-sans">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Acceso Denegado / Error</h2>
        <p className="text-slate-400 max-w-sm mb-6">{postError || 'No pudimos encontrar la publicación solicitada.'}</p>
        <div className="flex gap-4">
          <button 
            onClick={() => navigate('/')} 
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-all"
          >
            Ir al Dashboard
          </button>
          <button 
            onClick={handleSignOut} 
            className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-xl transition-all"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    );
  }

  // 3. MAIN APPROVAL PORTAL VIEW (Logged In)
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* Dynamic Success overlay */}
      {actionSuccess && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex flex-col items-center justify-center p-8 transition-opacity duration-300">
          <div className="w-24 h-24 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <CheckCircle size={48} className="text-green-400 animate-bounce" />
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-2 text-center">
            {actionSuccess === 'approved' ? '¡Publicación Aprobada!' : '¡Comentarios Enviados!'}
          </h2>
          <p className="text-slate-400 text-center max-w-sm">
            {actionSuccess === 'approved' 
              ? 'El contenido está marcado como listo para publicar. La agencia ha sido notificada.' 
              : 'Se han solicitado cambios. El equipo revisará tus anotaciones e indicaciones.'}
          </p>
        </div>
      )}

      {/* Header */}
      <header className="bg-slate-900/80 border-b border-slate-800 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sticky top-0 z-30 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
            {post.platform === 'Instagram' ? (
              <Camera className="w-5 h-5 text-pink-500" />
            ) : (
              <span className="font-extrabold text-[11px] bg-white text-black px-1.5 py-0.5 rounded">TT</span>
            )}
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight flex items-center gap-2">
              {post.title}
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                post.status === 'Approved' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                post.status === 'Changes Requested' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                'bg-slate-800 border-slate-700 text-slate-400'
              }`}>
                {post.status}
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Portal de Aprobación para Clientes</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <span className="text-xs text-slate-400 hidden md:inline">Conectado como <strong className="text-slate-200">{user?.email}</strong></span>
          <button 
            onClick={handleSignOut} 
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700/50 rounded-xl text-xs font-semibold transition-all"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Column: Media Preview */}
        <section className="lg:col-span-7 bg-slate-950 p-6 flex flex-col items-center justify-center border-r border-slate-900/50 min-h-[500px]">
          <div className="w-full max-w-xl flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-300">Previsualización de Publicación</h3>
            <div className="flex items-center space-x-2">
              <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                <button 
                  onClick={() => setPreviewMode('mobile')}
                  className={`p-1.5 rounded-md transition-all ${previewMode === 'mobile' ? 'bg-slate-800 text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
                  title="Mobile View"
                >
                  <Smartphone size={16} />
                </button>
                <button 
                  onClick={() => setPreviewMode('desktop')}
                  className={`p-1.5 rounded-md transition-all ${previewMode === 'desktop' ? 'bg-slate-800 text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
                  title="Desktop View"
                >
                  <Monitor size={16} />
                </button>
              </div>
              <button 
                onClick={() => {
                  setIsAddingPin(!isAddingPin);
                  if (isAddingPin) setActivePinCoordinates(null);
                }}
                className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all border ${
                  isAddingPin 
                    ? 'bg-amber-600/20 border-amber-600/40 text-amber-300' 
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {isAddingPin ? 'Cancelar Pin' : 'Añadir Pin de Cambios'}
              </button>
            </div>
          </div>

          {/* Simulator Wrapper */}
          <div className={`w-full bg-slate-900/40 rounded-3xl relative flex items-center justify-center border border-slate-800/80 overflow-hidden transition-all duration-300 ${
            isAddingPin ? 'cursor-crosshair ring-2 ring-amber-500/50' : ''
          } ${previewMode === 'mobile' ? 'aspect-[4/5] max-w-sm shadow-2xl' : 'aspect-video max-w-2xl'}`}>
            <div className="w-full h-full relative" onClick={handleImageClick}>
              {post.image_url ? (
                <img 
                  src={post.image_url} 
                  alt="Post preview" 
                  className="w-full h-full object-cover select-none"
                />
              ) : (
                <div className="text-slate-500 flex flex-col items-center justify-center h-full">
                  <Camera size={48} className="mb-2 opacity-30" />
                  <span className="text-sm font-semibold">Sin imagen</span>
                </div>
              )}

              {/* Render existing comments pins */}
              {unmountedPins.map((comment, index) => (
                <div 
                  key={comment.id}
                  className="absolute w-7 h-7 bg-indigo-600 text-white text-xs font-black rounded-full flex items-center justify-center shadow-lg transform -translate-x-1/2 -translate-y-1/2 cursor-pointer border-2 border-slate-900 pointer-events-none"
                  style={{ left: `${comment.pin_coordinates!.x}%`, top: `${comment.pin_coordinates!.y}%` }}
                >
                  {index + 1}
                </div>
              ))}

              {/* Render active pin currently placing */}
              {activePinCoordinates && (
                <div 
                  className="absolute w-7 h-7 bg-amber-500 text-white text-xs font-black rounded-full flex items-center justify-center shadow-lg transform -translate-x-1/2 -translate-y-1/2 border-2 border-slate-900 animate-pulse pointer-events-none"
                  style={{ left: `${activePinCoordinates.x}%`, top: `${activePinCoordinates.y}%` }}
                >
                  *
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Right Column: Details, Action & Comments */}
        <section className="lg:col-span-5 bg-slate-900/30 flex flex-col border-l border-slate-900/30 overflow-hidden">
          {/* Post Details & Caption */}
          <div className="p-6 border-b border-slate-900/50">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Copy / Caption</h3>
            <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80 text-sm text-slate-300 leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto custom-scrollbar">
              {post.description || 'Sin descripción o texto asignado.'}
            </div>
            {post.hashtags && (
              <div className="mt-2 text-xs text-indigo-400 font-medium">
                {post.hashtags}
              </div>
            )}
          </div>

          {/* Comments list */}
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-slate-300 flex items-center">
                <MessageSquare size={16} className="mr-2 text-slate-500" />
                Sugerencias y Cambios
              </h3>
              <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-bold">
                {openComments.length} Abiertos
              </span>
            </div>

            {loadingComments ? (
              <div className="text-center py-8 text-xs text-slate-500">Cargando comentarios...</div>
            ) : comments.length === 0 ? (
              <div className="text-center py-12 text-slate-500 flex flex-col items-center">
                <HelpCircle size={32} className="opacity-20 mb-2" />
                <p className="text-xs">No hay sugerencias registradas.</p>
                <p className="text-[10px] text-slate-600 mt-1">Usa la caja de abajo o añade un pin para sugerir cambios.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {openComments.map((comment) => {
                  const authorName = comment.user_id ? (authors[comment.user_id] || 'Miembro de la Agencia') : 'Tú (Cliente)';
                  const initials = authorName[0].toUpperCase();
                  const dateStr = comment.created_at ? new Date(comment.created_at).toLocaleString() : 'Hace un momento';

                  return (
                    <div key={comment.id} className="flex space-x-3 group relative">
                      <div className={`w-8 h-8 rounded-full text-slate-100 flex items-center justify-center font-bold text-xs shrink-0 bg-slate-800 border border-slate-700`}>
                        {initials}
                      </div>
                      <div className="bg-slate-900/60 p-3.5 rounded-2xl rounded-tl-none border border-slate-850 text-sm flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-semibold text-slate-300 flex items-center gap-2">
                            {authorName}
                            {comment.pin_coordinates && (
                              <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] px-1.5 py-0.5 rounded-md font-bold">Pin</span>
                            )}
                          </p>
                          <button 
                            onClick={() => toggleResolve(comment.id, comment.is_resolved)}
                            className="text-[10px] text-slate-500 hover:text-green-400 font-semibold flex items-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Resolver
                          </button>
                        </div>
                        <p className="text-slate-400 text-xs mt-1">{comment.text}</p>
                        <p className="text-[10px] text-slate-600 mt-2">{dateStr}</p>
                      </div>
                    </div>
                  );
                })}

                {resolvedComments.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-slate-850">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Resueltos ({resolvedComments.length})</p>
                    <div className="space-y-3 opacity-55">
                      {resolvedComments.map(comment => {
                        const authorName = comment.user_id ? (authors[comment.user_id] || 'Miembro de la Agencia') : 'Tú (Cliente)';
                        const initials = authorName[0].toUpperCase();

                        return (
                          <div key={comment.id} className="flex space-x-3">
                            <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                              {initials}
                            </div>
                            <div className="bg-slate-950 p-2.5 rounded-2xl rounded-tl-none border border-slate-900 text-xs flex-1">
                              <div className="flex justify-between items-start mb-1">
                                <p className="font-semibold text-slate-400">{authorName}</p>
                                <button 
                                  onClick={() => toggleResolve(comment.id, comment.is_resolved)} 
                                  className="text-[10px] text-indigo-400 hover:underline font-semibold"
                                >
                                  Reabrir
                                </button>
                              </div>
                              <p className="text-slate-500 line-through text-[11px] mt-1">{comment.text}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* New comment input area */}
          <div className="p-4 bg-slate-900/50 border-t border-slate-900/50 flex flex-col gap-2 relative">
            {activePinCoordinates && (
              <div className="text-xs text-amber-300 font-semibold flex items-center bg-amber-950/20 border border-amber-900/30 p-2.5 rounded-xl">
                <span className="bg-amber-500 text-slate-950 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black mr-2">*</span>
                Pin posicionado en la imagen. Escribe tu sugerencia de cambio abajo.
                <button 
                  onClick={() => { setActivePinCoordinates(null); setIsAddingPin(false); }} 
                  className="ml-auto text-amber-500 hover:underline font-bold"
                >
                  Cancelar
                </button>
              </div>
            )}
            <div className="flex space-x-2">
              <input 
                id="shared-comment-input"
                type="text" 
                placeholder={activePinCoordinates ? "Describir cambio para este pin..." : "Agregar sugerencia o comentario..."}
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                className="flex-1 bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500 placeholder-slate-600" 
              />
              <button 
                onClick={handleAddComment} 
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all flex items-center"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Approval Actions bar */}
          <div className="p-6 border-t border-slate-900 bg-slate-900/40 flex space-x-3 shrink-0">
            <button 
              onClick={() => handleUpdateStatus('Changes Requested')} 
              className="flex-1 py-3 border border-amber-500 hover:bg-amber-500/10 text-amber-400 font-extrabold rounded-2xl text-xs transition-all active:scale-[0.98]"
            >
              Solicitar Cambios
            </button>
            <button 
              onClick={() => handleUpdateStatus('Approved')} 
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-2xl text-xs transition-all active:scale-[0.98] shadow-lg shadow-indigo-600/10"
            >
              Aprobar Contenido
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};
