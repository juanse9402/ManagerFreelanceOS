import React, { useState } from 'react';
import { MessageSquare, CheckCircle, Clock } from 'lucide-react';

export const FeedbackInbox: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'open' | 'resolved'>('open');
  const [selectedThread, setSelectedThread] = useState<any>(null);

  // Mock data for feedback threads
  const openThreads = [
    {
      id: 1,
      postTitle: 'Summer Campaign Reel',
      lastMessage: 'Can we make the logo slightly bigger at the end?',
      time: '2h ago',
      author: 'Client Name',
      messages: [
        { text: 'Here is the first draft of the reel.', author: 'Admin', time: '10:00 AM' },
        { text: 'Looks good! Can we make the logo slightly bigger at the end?', author: 'Client Name', time: '11:30 AM' }
      ]
    }
  ];

  const resolvedThreads = [
    {
      id: 2,
      postTitle: 'Product Launch Carousel',
      lastMessage: 'Perfect, approved!',
      time: 'Yesterday',
      author: 'Client Name',
      messages: [
        { text: 'Please review the updated carousel.', author: 'Admin', time: 'Mon 2:00 PM' },
        { text: 'Perfect, approved!', author: 'Client Name', time: 'Mon 3:15 PM' }
      ]
    }
  ];

  const activeThreads = activeTab === 'open' ? openThreads : resolvedThreads;

  return (
    <div className="bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-card)] border border-gray-100 flex h-[600px] overflow-hidden">
      {/* Sidebar List */}
      <div className="w-1/3 border-r border-gray-100 flex flex-col bg-gray-50/30">
        <div className="p-4 border-b border-gray-100">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button 
              onClick={() => setActiveTab('open')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${activeTab === 'open' ? 'bg-white shadow-sm text-[var(--brand-primary)]' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Open ({openThreads.length})
            </button>
            <button 
              onClick={() => setActiveTab('resolved')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${activeTab === 'resolved' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Resolved ({resolvedThreads.length})
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {activeThreads.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">
              No {activeTab} threads.
            </div>
          ) : (
            activeThreads.map(thread => (
              <button 
                key={thread.id}
                onClick={() => setSelectedThread(thread)}
                className={`w-full text-left p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${selectedThread?.id === thread.id ? 'bg-gray-50 border-l-2 border-l-[var(--brand-primary)]' : ''}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-sm text-gray-900 truncate pr-2">{thread.postTitle}</span>
                  <span className="text-[10px] font-medium text-gray-400 whitespace-nowrap">{thread.time}</span>
                </div>
                <p className="text-xs text-gray-500 truncate">{thread.author}: {thread.lastMessage}</p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Thread View */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedThread ? (
          <>
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
              <div>
                <h3 className="font-bold text-gray-900 text-sm flex items-center">
                  <MessageSquare size={16} className="mr-2 text-[var(--brand-primary)]" />
                  {selectedThread.postTitle}
                </h3>
              </div>
              {activeTab === 'open' ? (
                <button 
                  className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors flex items-center"
                  onClick={() => alert('Marked as resolved')}
                >
                  <CheckCircle size={14} className="mr-1.5" /> Resolve
                </button>
              ) : (
                <button 
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors flex items-center"
                  onClick={() => alert('Reopened')}
                >
                  <Clock size={14} className="mr-1.5" /> Reopen
                </button>
              )}
            </div>

            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-gray-50/50 space-y-4">
              {selectedThread.messages.map((msg: any, idx: number) => (
                <div key={idx} className={`flex flex-col ${msg.author === 'Admin' ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] text-gray-400 font-medium mb-1 mx-1">{msg.author} • {msg.time}</span>
                  <div className={`p-3 rounded-2xl max-w-[80%] text-sm shadow-sm ${msg.author === 'Admin' ? 'bg-[var(--brand-primary)] text-white rounded-br-none' : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {activeTab === 'open' && (
              <div className="p-4 bg-white border-t border-gray-100">
                <div className="flex relative">
                  <input 
                    type="text" 
                    placeholder="Type a reply..." 
                    className="w-full bg-gray-50 border border-gray-200 rounded-full pl-4 pr-12 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20"
                  />
                  <button className="absolute right-1 top-1 bottom-1 aspect-square bg-[var(--brand-primary)] text-white rounded-full flex items-center justify-center hover:bg-[var(--brand-primary)]/90 transition-colors">
                    <svg className="w-4 h-4 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <MessageSquare size={48} className="mb-4 opacity-20" />
            <p className="text-sm font-medium">Select a thread to view feedback</p>
          </div>
        )}
      </div>
    </div>
  );
};
