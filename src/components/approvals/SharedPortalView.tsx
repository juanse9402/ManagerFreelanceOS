import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Camera, 
  Smartphone, 
  Monitor, 
  CheckCircle, 
  Loader2, 
  Send,
  AlertCircle,
  HelpCircle,
  Clock,
  Calendar,
  Grid,
  TrendingUp,
  X,
  FileText,
  Play,
  ImagePlus,
  Image as ImageIcon
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { CATEGORY_COLORS } from '../../contexts/TimeTrackingContext';

export const SharedPortalView: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const { session, user } = useAuth();

  // Active Tab: 'board' | 'calendar' | 'time'
  const [activeTab, setActiveTab] = useState<'board' | 'calendar' | 'time'>('board');

  // Client Details State
  const [clientProfile, setClientProfile] = useState<any | null>(null);
  const [loadingClient, setLoadingClient] = useState(true);

  // Content Posts State
  const [posts, setPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // Time Entries State
  const [timeEntries, setTimeEntries] = useState<any[]>([]);

  // Selected Post for Modal Review
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [authors, setAuthors] = useState<Record<string, string>>({});
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [guestName, setGuestName] = useState(() => {
    return localStorage.getItem('guest_viewer_name') || '';
  });

  // Review UI States
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('mobile');
  const [isAddingPin, setIsAddingPin] = useState(false);
  const [activePinCoordinates, setActivePinCoordinates] = useState<{x: number, y: number} | null>(null);
  const [postError, setPostError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<'approved' | 'changes_requested' | null>(null);

  // Save guest name
  const handleGuestNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setGuestName(val);
    localStorage.setItem('guest_viewer_name', val);
  };

  // Silent Auto-Login for clients/guests using the portal link
  useEffect(() => {
    const runSilentAuth = async () => {
      if (!session && clientId) {
        setLoadingClient(true);
        try {
          const email = 'client_viewer@kameleoia.com';
          const password = 'ViewerPassword123!';
          
          // Try to sign in
          let { error } = await supabase.auth.signInWithPassword({ email, password });
          
          if (error && (error.message.includes('Invalid login credentials') || error.message.includes('User not found'))) {
            // Register guest account
            const { error: signUpError } = await supabase.auth.signUp({ email, password });
            if (!signUpError) {
              const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
              if (signInErr) throw signInErr;
            } else {
              throw signUpError;
            }
          } else if (error) {
            throw error;
          }
          
          // Reload page to apply session to useAuth context
          window.location.reload();
        } catch (e: any) {
          console.error('Silent auth failed:', e);
          setPostError('Error initializing guest session: ' + e.message);
          setLoadingClient(false);
        }
      }
    };
    runSilentAuth();
  }, [session, clientId]);

  // Fetch Portal Data once logged in
  useEffect(() => {
    if (session && clientId) {
      loadPortalData();
    }
  }, [session, clientId]);

  const loadPortalData = async () => {
    setLoadingClient(true);
    setLoadingPosts(true);
    try {
      // 1. Fetch Client Profile
      const { data: profile, error: pErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', clientId)
        .single();
        
      if (pErr) throw pErr;
      setClientProfile(profile);

      // 2. Fetch Content Posts
      const { data: postsData, error: postsErr } = await supabase
        .from('content_posts')
        .select('*')
        .eq('client_id', clientId)
        .order('date', { ascending: true });
        
      if (postsErr) throw postsErr;
      setPosts(postsData || []);

      // 3. Load Time Entries from LocalStorage (Simulating cross-boundary client viewing)
      const clientTimeEntries: any[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.endsWith('time_entries')) {
          try {
            const entries = JSON.parse(localStorage.getItem(key) || '[]');
            if (Array.isArray(entries)) {
              const filtered = entries.filter((e: any) => e.clientId === clientId);
              clientTimeEntries.push(...filtered);
            }
          } catch (e) {
            console.error(e);
          }
        }
      }
      // Sort entries by date descending
      clientTimeEntries.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
      setTimeEntries(clientTimeEntries);

    } catch (e: any) {
      console.error('Error loading portal data:', e);
      setPostError(e.message || 'Error loading client portal.');
    } finally {
      setLoadingClient(false);
      setLoadingPosts(false);
    }
  };

  // Fetch comments for a selected post
  useEffect(() => {
    if (selectedPost) {
      fetchComments(selectedPost.id);
    }
  }, [selectedPost]);

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
    if (!selectedPost) return;
    try {
      const { error } = await supabase
        .from('content_posts')
        .update({ status: newStatus })
        .eq('id', selectedPost.id);

      if (error) throw error;
      
      // Update local posts list state
      setPosts(prev => prev.map(p => p.id === selectedPost.id ? { ...p, status: newStatus } : p));
      setSelectedPost((prev: any) => ({ ...prev, status: newStatus }));
      
      setActionSuccess(newStatus === 'Approved' ? 'approved' : 'changes_requested');
      setTimeout(() => {
        setActionSuccess(null);
      }, 3000);
    } catch (e) {
      console.error('Error updating status:', e);
      alert('Error updating status');
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !selectedPost) return;
    
    const isGenericGuest = user?.email === 'client_viewer@kameleoia.com';
    let finalCommentText = commentText;
    
    if (isGenericGuest) {
      const nameTag = guestName.trim() ? guestName.trim() : 'Guest Client';
      finalCommentText = `[Guest: ${nameTag}] ${commentText}`;
    }

    const newComment = {
      content_id: selectedPost.id,
      text: finalCommentText,
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

  const parseCommentDisplay = (comment: any) => {
    const rawText = comment.text || '';
    const match = rawText.match(/^\[Guest:\s*(.*?)\]\s*(.*)/s);
    
    if (match) {
      return {
        authorName: `${match[1]} (Client)`,
        commentText: match[2]
      };
    }
    
    const authorName = comment.user_id 
      ? (authors[comment.user_id] || (comment.user_id === user?.id ? 'You' : 'Agency Member')) 
      : 'Client (Guest)';
      
    return {
      authorName,
      commentText: rawText
    };
  };

  // Time Tracking calculations
  const totalHours = timeEntries.reduce((acc, entry) => {
    const start = new Date(entry.startTime).getTime();
    const end = new Date(entry.endTime).getTime();
    return acc + (end - start) / (1000 * 60 * 60);
  }, 0);

  const billableHours = timeEntries
    .filter(entry => entry.billable)
    .reduce((acc, entry) => {
      const start = new Date(entry.startTime).getTime();
      const end = new Date(entry.endTime).getTime();
      return acc + (end - start) / (1000 * 60 * 60);
    }, 0);

  // Group hours by category for Pie Chart
  const categoryHours = timeEntries.reduce((acc: Record<string, number>, entry) => {
    const start = new Date(entry.startTime).getTime();
    const end = new Date(entry.endTime).getTime();
    const hours = (end - start) / (1000 * 60 * 60);
    acc[entry.category] = (acc[entry.category] || 0) + hours;
    return acc;
  }, {});

  const categoryData = Object.keys(categoryHours).map(cat => ({
    name: cat,
    value: parseFloat(categoryHours[cat].toFixed(1)),
    color: CATEGORY_COLORS[cat]?.hex || '#9CA3AF'
  }));

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'Reel': return <Play size={14} className="text-white" />;
      case 'Story': return <ImagePlus size={14} className="text-white" />;
      case 'Carousel': return <FileText size={14} className="text-white" />;
      default: return <ImageIcon size={14} className="text-white" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-50 border-green-200 text-green-700';
      case 'Changes Requested': return 'bg-amber-55 border-amber-200 text-amber-700';
      default: return 'bg-gray-100 border-gray-200 text-gray-650';
    }
  };

  // Generate simple Notion-style content schedule days
  const uniqueDates = Array.from(new Set(posts.map(p => p.date).filter(Boolean)));
  uniqueDates.sort();

  if (loadingClient || loadingPosts) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center font-sans text-gray-550">
        <Loader2 className="w-10 h-10 text-indigo-650 animate-spin mb-4" />
        <p className="text-sm font-semibold">Loading client portal...</p>
      </div>
    );
  }

  if (postError || !clientProfile) {
    return (
      <div className="min-h-screen bg-gray-55 flex flex-col justify-center items-center p-6 text-center font-sans">
        <div className="w-16 h-16 bg-red-50 border border-red-200 text-red-500 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied / Error</h2>
        <p className="text-gray-550 max-w-sm mb-6">{postError || 'Could not find the requested portal.'}</p>
        <div className="flex gap-4">
          <button 
            onClick={handleSignOut} 
            className="px-5 py-2.5 bg-red-655 hover:bg-red-550 text-white text-xs font-semibold rounded-xl transition-all"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  const isGenericGuest = user?.email === 'client_viewer@kameleoia.com';
  const brandColor = clientProfile.primary_color || '#6366f1';
  const brandName = clientProfile.full_name || 'Brand Client';

  // Modal Comments helper
  const unmountedPins = comments.filter(c => c.pin_coordinates && !c.is_resolved);
  const openComments = comments.filter(c => !c.is_resolved);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center space-x-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white shrink-0 text-lg shadow-md"
            style={{ backgroundColor: brandColor }}
          >
            {brandName[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-lg font-black text-gray-900 tracking-tight">{brandName}</h1>
            <p className="text-xs text-gray-500 mt-0.5">Unified Client Work Hub</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-100 border border-gray-200 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('board')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'board' ? 'bg-white text-indigo-650 shadow-sm' : 'text-gray-550 hover:text-gray-800'
              }`}
            >
              <Grid size={14} /> <span>Grid Board</span>
            </button>
            <button 
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'calendar' ? 'bg-white text-indigo-650 shadow-sm' : 'text-gray-550 hover:text-gray-800'
              }`}
            >
              <Calendar size={14} /> <span>Schedule Calendar</span>
            </button>
            <button 
              onClick={() => setActiveTab('time')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'time' ? 'bg-white text-indigo-650 shadow-sm' : 'text-gray-555 hover:text-gray-800'
              }`}
            >
              <Clock size={14} /> <span>Time Logs</span>
            </button>
          </div>

          <span className="text-xs text-gray-500 hidden lg:inline">
            Access: <strong className="text-gray-700">{isGenericGuest ? 'Quick Access' : user?.email}</strong>
          </span>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6">
        
        {/* TAB 1: GRID BOARD */}
        {activeTab === 'board' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black text-gray-900">Planned Publications</h2>
                <p className="text-xs text-gray-550 mt-1">Select any post card below to review details, suggest changes with annotation pins, and approve.</p>
              </div>
              <span className="text-xs bg-white border border-gray-200 text-gray-600 px-3 py-1 rounded-xl font-medium shadow-sm">
                {posts.length} Publications Total
              </span>
            </div>

            {posts.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center text-gray-400 flex flex-col items-center">
                <Grid size={48} className="opacity-20 mb-3" />
                <p className="text-sm font-semibold">No publications planned yet.</p>
                <p className="text-xs text-gray-450 mt-1">Once posts are added to the calendar, they will show up here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {posts.map(post => (
                  <div 
                    key={post.id} 
                    onClick={() => setSelectedPost(post)}
                    className="bg-white hover:bg-gray-50/50 border border-gray-200 hover:border-gray-300 rounded-3xl overflow-hidden cursor-pointer transition-all hover:scale-[1.02] shadow-sm flex flex-col group"
                  >
                    <div className="aspect-[4/5] bg-gray-100 relative overflow-hidden flex items-center justify-center">
                      {post.image_url ? (
                        <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-12 h-12 text-gray-300" />
                      )}
                      
                      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md p-1.5 rounded-lg border border-slate-800">
                        {getContentTypeIcon(post.type)}
                      </div>
                      
                      <div className="absolute top-3 right-3">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border shadow-md ${getStatusColor(post.status)}`}>
                          {post.status}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col">
                      <h4 className="font-bold text-sm text-gray-900 group-hover:text-indigo-600 line-clamp-1">{post.title}</h4>
                      <p className="text-xs text-gray-500 mt-1 flex-1 line-clamp-2">{post.description || 'No caption text.'}</p>
                      <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between items-center text-[10px] text-gray-400 font-semibold">
                        <span>{post.platform}</span>
                        <span>{post.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SCHEDULE CALENDAR */}
        {activeTab === 'calendar' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-gray-900">Content Schedule (Notion Style)</h2>
              <p className="text-xs text-gray-550 mt-1">Calendar timeline of planned publications by schedule date.</p>
            </div>

            {posts.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center text-gray-400 flex flex-col items-center">
                <Calendar size={48} className="opacity-20 mb-3" />
                <p className="text-sm font-semibold">Schedule is empty.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {uniqueDates.map(date => {
                  const dayPosts = posts.filter(p => p.date === date);
                  return (
                    <div key={date} className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm">
                      <div className="text-xs font-black text-indigo-650 uppercase tracking-widest border-b border-gray-100 pb-2 mb-4">
                        {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {dayPosts.map(post => (
                          <div 
                            key={post.id} 
                            onClick={() => setSelectedPost(post)}
                            className="bg-gray-50/50 border border-gray-200 hover:border-gray-350 rounded-2xl p-4 flex gap-4 cursor-pointer hover:bg-gray-50 transition-all items-center group"
                          >
                            <div className="w-16 h-16 rounded-xl bg-gray-150 overflow-hidden shrink-0 border border-gray-200 flex items-center justify-center relative">
                              {post.image_url ? (
                                <img src={post.image_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <Camera className="w-5 h-5 text-gray-450" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-sm text-gray-900 group-hover:text-indigo-650 line-clamp-1">{post.title}</h4>
                              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{post.description || 'No caption.'}</p>
                              <div className="flex gap-2.5 mt-1.5 items-center">
                                <span className="text-[10px] text-indigo-655 font-bold">{post.platform} • {post.type}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${getStatusColor(post.status)}`}>
                                  {post.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: TIME TRACKING */}
        {activeTab === 'time' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black text-gray-900">Time Tracking & Spent Logs</h2>
                <p className="text-xs text-gray-555 mt-1">Audit trail of agency hours and workload logged on your brand.</p>
              </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-gray-200 p-6 rounded-3xl flex items-center space-x-4 shadow-sm">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
                  <Clock size={24} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Total Time Logged</p>
                  <p className="text-2xl font-black text-gray-900 mt-0.5">{totalHours.toFixed(1)} hrs</p>
                </div>
              </div>

              <div className="bg-white border border-gray-200 p-6 rounded-3xl flex items-center space-x-4 shadow-sm">
                <div className="p-3 bg-green-50 text-green-600 rounded-2xl border border-green-100">
                  <CheckCircle size={24} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Billable Hours</p>
                  <p className="text-2xl font-black text-gray-900 mt-0.5">{billableHours.toFixed(1)} hrs</p>
                </div>
              </div>

              <div className="bg-white border border-gray-200 p-6 rounded-3xl flex items-center space-x-4 shadow-sm">
                <div className="p-3 bg-cyan-50 text-cyan-600 rounded-2xl border border-cyan-100">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Total Work Entries</p>
                  <p className="text-2xl font-black text-gray-900 mt-0.5">{timeEntries.length}</p>
                </div>
              </div>
            </div>

            {/* Charts & Breakdown */}
            {timeEntries.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center text-gray-450 flex flex-col items-center">
                <Clock size={48} className="opacity-20 mb-3" />
                <p className="text-sm font-semibold">No time logs recorded.</p>
                <p className="text-xs text-slate-650 mt-1">Once work entries are tracked, they will display here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Category breakdown (Pie Chart) */}
                <div className="lg:col-span-4 bg-white border border-gray-200 p-6 rounded-3xl shadow-sm">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Hours by Category</h3>
                  
                  <div className="h-48 relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute text-center">
                      <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Workload</span>
                      <p className="text-lg font-black text-gray-900">{totalHours.toFixed(1)}h</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    {categoryData.map(cat => (
                      <div key={cat.name} className="flex justify-between items-center text-xs">
                        <div className="flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                          <span className="text-gray-700 font-semibold">{cat.name}</span>
                        </div>
                        <span className="text-gray-900 font-bold">{cat.value}h</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Detailed Logs List */}
                <div className="lg:col-span-8 bg-white border border-gray-200 p-6 rounded-3xl shadow-sm overflow-hidden">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Detailed Work Logs</h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-700">
                      <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-wider border-b border-gray-200">
                        <tr>
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4">Description</th>
                          <th className="py-3 px-4">Category</th>
                          <th className="py-3 px-4 text-right">Time Spent</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-150">
                        {timeEntries.map(entry => {
                          const hrs = (new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime()) / (1000 * 60 * 60);
                          return (
                            <tr key={entry.id} className="hover:bg-gray-50/50">
                              <td className="py-3 px-4 font-semibold text-gray-500 whitespace-nowrap">{entry.date}</td>
                              <td className="py-3 px-4">
                                <div className="font-semibold text-gray-900">{entry.description}</div>
                                {entry.billable && <span className="text-[9px] bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded-md mt-1 inline-block font-extrabold uppercase">Billable</span>}
                              </td>
                              <td className="py-3 px-4">
                                <span 
                                  className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white whitespace-nowrap"
                                  style={{ backgroundColor: CATEGORY_COLORS[entry.category]?.hex || '#9CA3AF' }}
                                >
                                  {entry.category}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right font-black text-gray-900">{hrs.toFixed(2)}h</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

      </main>

      {/* POST DETAILED REVIEW MODAL (LIGHT THEME GLASSMORPHIC) */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-end font-sans">
          
          {/* Dynamic Success overlay inside modal */}
          {actionSuccess && (
            <div className="fixed inset-0 bg-white/95 backdrop-blur-md z-[60] flex flex-col items-center justify-center p-8">
              <div className="w-24 h-24 bg-green-50 border border-green-200 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <CheckCircle size={48} className="text-green-600 animate-bounce" />
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2 text-center">
                {actionSuccess === 'approved' ? 'Post Approved!' : 'Comments Submitted!'}
              </h2>
              <p className="text-gray-550 text-center max-w-sm">
                {actionSuccess === 'approved' 
                  ? 'The content is marked as ready to publish. The team has been notified.' 
                  : 'Changes requested. The agency team will review your notes and coordinate changes.'}
              </p>
            </div>
          )}

          {/* Overlay */}
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedPost(null)} />
          
          {/* Modal Sidebar Panel */}
          <div className="w-full lg:w-[1100px] h-full bg-white border-l border-gray-200 shadow-2xl relative z-10 flex flex-col lg:flex-row overflow-hidden animate-in slide-in-from-right duration-300">
            
            {/* Modal Header for Small screens */}
            <div className="lg:hidden p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 shrink-0">
              <h3 className="font-extrabold text-sm text-gray-950">{selectedPost.title}</h3>
              <button onClick={() => setSelectedPost(null)} className="p-1.5 rounded-lg bg-gray-200 text-gray-600">
                <X size={18} />
              </button>
            </div>

            {/* Left Box: Preview area */}
            <div className="flex-1 bg-gray-50 p-6 flex flex-col overflow-y-auto border-r border-gray-200 justify-center items-center">
              
              <div className="w-full max-w-md flex items-center justify-between mb-4 shrink-0">
                <h3 className="text-xs font-bold text-gray-500">Preview Mode</h3>
                
                <div className="flex items-center space-x-2">
                  <div className="flex bg-gray-200 border border-gray-250 p-0.5 rounded-lg">
                    <button 
                      onClick={() => setPreviewMode('mobile')}
                      className={`p-1.5 rounded-md transition-all ${previewMode === 'mobile' ? 'bg-white text-indigo-650 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                      <Smartphone size={14} />
                    </button>
                    <button 
                      onClick={() => setPreviewMode('desktop')}
                      className={`p-1.5 rounded-md transition-all ${previewMode === 'desktop' ? 'bg-white text-indigo-650 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                      <Monitor size={14} />
                    </button>
                  </div>
                  <button 
                    onClick={() => {
                      setIsAddingPin(!isAddingPin);
                      if (isAddingPin) setActivePinCoordinates(null);
                    }}
                    className={`text-[10px] px-2.5 py-1.5 rounded-lg font-bold transition-all border ${
                      isAddingPin 
                        ? 'bg-amber-50 border-amber-200 text-amber-700' 
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {isAddingPin ? 'Cancel Pin' : 'Add Change Pin'}
                  </button>
                </div>
              </div>

              {/* Simulator view */}
              <div className={`w-full bg-gray-150 rounded-3xl relative flex items-center justify-center border border-gray-200 overflow-hidden transition-all duration-300 ${
                isAddingPin ? 'cursor-crosshair ring-2 ring-amber-500/50' : ''
              } ${previewMode === 'mobile' ? 'aspect-[4/5] max-w-xs shadow-2xl' : 'aspect-video max-w-md'}`}>
                <div className="w-full h-full relative" onClick={handleImageClick}>
                  {selectedPost.image_url ? (
                    <img src={selectedPost.image_url} alt="" className="w-full h-full object-cover select-none" />
                  ) : (
                    <div className="text-gray-400 flex flex-col items-center justify-center h-full">
                      <Camera size={36} className="opacity-25" />
                      <span className="text-xs font-bold mt-1">No media</span>
                    </div>
                  )}

                  {/* Comments Pin coordinates */}
                  {unmountedPins.map((comment, index) => (
                    <div 
                      key={comment.id}
                      className="absolute w-6.5 h-6.5 bg-indigo-650 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg transform -translate-x-1/2 -translate-y-1/2 border-2 border-white pointer-events-none"
                      style={{ left: `${comment.pin_coordinates!.x}%`, top: `${comment.pin_coordinates!.y}%` }}
                    >
                      {index + 1}
                    </div>
                  ))}

                  {/* Active Pin placement */}
                  {activePinCoordinates && (
                    <div 
                      className="absolute w-6.5 h-6.5 bg-amber-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg transform -translate-x-1/2 -translate-y-1/2 border-2 border-white animate-pulse pointer-events-none"
                      style={{ left: `${activePinCoordinates.x}%`, top: `${activePinCoordinates.y}%` }}
                    >
                      *
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Box: Comments & Details panel */}
            <div className="w-full lg:w-[450px] bg-gray-50 flex flex-col overflow-hidden h-full">
              
              {/* Header for Desktop */}
              <div className="hidden lg:flex p-5 border-b border-gray-200 justify-between items-center shrink-0">
                <div>
                  <h3 className="font-extrabold text-sm text-gray-900 line-clamp-1">{selectedPost.title}</h3>
                  <div className="flex gap-2 mt-1 items-center">
                    <span className="text-[10px] text-gray-500 font-bold">{selectedPost.platform} • {selectedPost.type}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${getStatusColor(selectedPost.status)}`}>
                      {selectedPost.status}
                    </span>
                  </div>
                </div>
                <button onClick={() => setSelectedPost(null)} className="p-2 rounded-full hover:bg-gray-200 text-gray-400 transition-colors">
                  <X size={18} />
                </button>
              </div>

              {/* Caption description */}
              <div className="p-5 border-b border-gray-200 shrink-0">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Caption Text</h4>
                <div className="p-3.5 bg-white rounded-xl border border-gray-200 text-xs text-gray-700 whitespace-pre-wrap max-h-32 overflow-y-auto custom-scrollbar">
                  {selectedPost.description || 'No description assigned.'}
                </div>
              </div>

              {/* Comments Board list */}
              <div className="flex-1 p-5 overflow-y-auto custom-scrollbar space-y-4">
                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                  <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Suggestions & Changes</h4>
                  <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-bold">{openComments.length} Open</span>
                </div>

                {loadingComments ? (
                  <div className="text-center py-6 text-xs text-gray-400">Loading comments...</div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 flex flex-col items-center">
                    <HelpCircle size={24} className="opacity-15 mb-2" />
                    <p className="text-[10px]">No suggestions added yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {openComments.map((comment) => {
                      const { authorName, commentText: parsedText } = parseCommentDisplay(comment);
                      const initials = authorName[0].toUpperCase();
                      const dateStr = comment.created_at ? new Date(comment.created_at).toLocaleDateString() : 'Just now';

                      return (
                        <div key={comment.id} className="flex space-x-2.5 group relative text-xs">
                          <div className="w-7 h-7 rounded-full text-slate-700 flex items-center justify-center font-bold text-[10px] shrink-0 bg-gray-200 border border-gray-300">
                            {initials}
                          </div>
                          <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-200 flex-1">
                            <div className="flex justify-between items-start mb-0.5">
                              <p className="font-bold text-gray-800 flex items-center gap-1.5">
                                {authorName}
                                {comment.pin_coordinates && (
                                  <span className="bg-amber-100 border border-amber-200 text-amber-700 text-[8px] px-1.5 py-0.5 rounded font-black">Pin</span>
                                )}
                              </p>
                              <button 
                                onClick={() => toggleResolve(comment.id, comment.is_resolved)}
                                className="text-[9px] text-gray-500 hover:text-green-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                Resolve
                              </button>
                            </div>
                            <p className="text-gray-650 text-[11px] mt-1">{parsedText}</p>
                            <p className="text-[10px] text-gray-400 mt-1.5">{dateStr}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Add comment area */}
              <div className="p-4 bg-white border-t border-gray-200 flex flex-col gap-2 shrink-0">
                {activePinCoordinates && (
                  <div className="text-[10px] text-amber-700 font-bold flex items-center bg-amber-50 border border-amber-200 p-2 rounded-xl">
                    <span className="bg-amber-500 text-white w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-black mr-2">*</span>
                    Pin placed. Write change suggestion below.
                    <button onClick={() => { setActivePinCoordinates(null); setIsAddingPin(false); }} className="ml-auto text-amber-800 hover:underline">Cancel</button>
                  </div>
                )}

                {isGenericGuest && (
                  <div>
                    <input 
                      type="text" 
                      placeholder="Your Name (Required)"
                      value={guestName}
                      onChange={handleGuestNameChange}
                      className="w-full bg-gray-55 border border-gray-200 text-gray-900 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500 placeholder-gray-400"
                    />
                  </div>
                )}

                <div className="flex space-x-2">
                  <input 
                    id="shared-comment-input"
                    type="text" 
                    placeholder={activePinCoordinates ? "Describe change for this pin..." : "Type comment..."}
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                    className="flex-1 bg-gray-55 border border-gray-200 text-gray-900 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 placeholder-gray-450" 
                  />
                  <button onClick={handleAddComment} className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold">
                    <Send size={12} />
                  </button>
                </div>
              </div>

              {/* Modal action bar */}
              <div className="p-5 border-t border-gray-200 bg-gray-50 flex space-x-2 shrink-0">
                <button 
                  onClick={() => handleUpdateStatus('Changes Requested')}
                  className="flex-1 py-2.5 border border-amber-500 hover:bg-amber-50 text-amber-700 font-extrabold rounded-xl text-xs transition-all"
                >
                  Request Changes
                </button>
                <button 
                  onClick={() => handleUpdateStatus('Approved')}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl text-xs transition-all"
                >
                  Approve Content
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
