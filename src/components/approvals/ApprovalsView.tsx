import React, { useState, useEffect } from 'react';
import { Camera, Search, Filter, CheckCircle, XCircle, Clock, LayoutGrid, MessageSquare, Share2 } from 'lucide-react';
import { ContentDrawer } from '../calendar/ContentDrawer';
import { FeedbackInbox } from './FeedbackInbox';
import { supabase } from '../../lib/supabase';

export const ApprovalsView: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'content' | 'feedback'>('content');

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    try {
      const { data, error } = await supabase.from('content_posts').select('*');
      if (error) throw error;
      if (data) {
        setApprovals(data);
      }
    } catch (error) {
      console.error('Error fetching approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyShareLink = (clientId: string) => {
    const url = `${window.location.origin}/shared-portal/${clientId}`;
    navigator.clipboard.writeText(url);
    alert('Approval link copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Approvals Center</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Review, comment and approve content before publishing.</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-white rounded-lg p-1 border border-gray-200 shadow-sm mr-2">
            <button 
              onClick={() => setActiveTab('content')}
              className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'content' ? 'bg-gray-100 text-gray-800' : 'text-gray-500 hover:text-gray-800'}`}
            >
              <LayoutGrid size={14} className="mr-1.5" /> Content
            </button>
            <button 
              onClick={() => setActiveTab('feedback')}
              className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'feedback' ? 'bg-gray-100 text-gray-800' : 'text-gray-500 hover:text-gray-800'}`}
            >
              <MessageSquare size={14} className="mr-1.5" /> Inbox
            </button>
          </div>
          
          {activeTab === 'content' && (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search content..." 
                  className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20"
                />
              </div>
              <button className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                <Filter size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      {activeTab === 'content' ? (
        <div className="bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-card)] overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50/50 text-gray-500 uppercase text-xs font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Content</th>
                  <th className="px-6 py-4">Platform</th>
                  <th className="px-6 py-4">Planned Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading content...</td>
                  </tr>
                ) : approvals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                           <CheckCircle size={32} className="text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Inbox zero!</h3>
                        <p className="text-sm text-gray-500 max-w-sm mb-4">
                          No pending approvals. Enjoy your coffee.
                        </p>
                        <button 
                          onClick={() => window.location.href = '/admin/calendar'}
                          className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
                        >
                          View Calendar
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : approvals.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded bg-gray-100 flex-shrink-0 mr-3 border border-gray-200 overflow-hidden">
                          <img src={`https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=100&q=80`} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div>
                          <div className="font-semibold text-[var(--text-primary)]">{item.title}</div>
                          <div className="text-xs text-[var(--text-muted)]">{item.type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {item.platform === 'Instagram' ? (
                        <span className="flex items-center text-pink-600 font-medium">
                          <Camera size={14} className="mr-1.5" /> Instagram
                        </span>
                      ) : (
                        <span className="flex items-center font-medium">
                          <span className="font-bold bg-black text-white px-1.5 py-0.5 rounded text-[10px] mr-1.5">TT</span> TikTok
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-[var(--text-muted)] font-medium">
                      {item.date}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center w-max ${
                        item.status === 'Approved' ? 'bg-green-100 text-green-700' :
                        item.status === 'In Review' ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {item.status === 'Approved' && <CheckCircle size={12} className="mr-1" />}
                        {item.status === 'In Review' && <Clock size={12} className="mr-1" />}
                        {item.status === 'Draft' && <XCircle size={12} className="mr-1" />}
                        {item.status === 'Pending' && <Clock size={12} className="mr-1" />}
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => handleCopyShareLink(item.client_id)}
                          className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                          title="Copy Approval Quick Link"
                        >
                          <Share2 size={16} />
                        </button>
                        <button 
                          onClick={() => setSelectedItem(item)}
                          className="text-[var(--brand-primary)] bg-[var(--brand-primary)]/10 hover:bg-[var(--brand-primary)]/20 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        >
                          Review
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <FeedbackInbox />
      )}

      <ContentDrawer 
        isOpen={!!selectedItem} 
        onClose={() => setSelectedItem(null)} 
        item={selectedItem} 
      />
    </div>
  );
};
