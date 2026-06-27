import React, { useState } from 'react';
import { History, ArrowLeft, Check } from 'lucide-react';

interface Version {
  id: string;
  version_number: number;
  created_at: string;
  image_url?: string;
  description?: string;
  author: string;
}

interface VersionHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentItem: any;
}

export const VersionHistoryPanel: React.FC<VersionHistoryPanelProps> = ({ isOpen, onClose, currentItem }) => {
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);

  if (!isOpen || !currentItem) return null;

  // Mock versions based on current item
  const mockVersions: Version[] = [
    {
      id: 'v2',
      version_number: 2,
      created_at: '2026-06-26T14:30:00Z',
      image_url: currentItem.image_url,
      description: currentItem.description || 'Updated copy to be more engaging.',
      author: 'Admin'
    },
    {
      id: 'v1',
      version_number: 1,
      created_at: '2026-06-25T10:15:00Z',
      image_url: 'https://images.unsplash.com/photo-1611162618758-6a4fd45025ea?auto=format&fit=crop&w=400&q=80',
      description: 'Initial draft copy for the post.',
      author: 'Admin'
    }
  ];

  const selectedVersion = mockVersions.find(v => v.id === selectedVersionId) || mockVersions[0];

  return (
    <div className={`fixed inset-y-0 right-0 w-full md:w-[800px] bg-white shadow-2xl z-[60] flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center">
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors mr-2">
            <ArrowLeft size={18} />
          </button>
          <h2 className="text-lg font-bold text-gray-900 flex items-center">
            <History size={18} className="mr-2 text-[var(--brand-primary)]" />
            Version History
          </h2>
        </div>
        <div className="text-sm font-medium text-gray-500">
          Comparing to: V{mockVersions[0].version_number} (Current)
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        
        {/* Version List Sidebar */}
        <div className="w-1/3 border-r border-gray-100 bg-gray-50 flex flex-col overflow-y-auto custom-scrollbar">
          {mockVersions.map((v) => (
            <div 
              key={v.id}
              onClick={() => setSelectedVersionId(v.id)}
              className={`p-4 border-b border-gray-200 cursor-pointer transition-colors ${selectedVersionId === v.id || (!selectedVersionId && v.id === mockVersions[0].id) ? 'bg-white border-l-4 border-l-[var(--brand-primary)]' : 'hover:bg-gray-100 border-l-4 border-l-transparent'}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-gray-900">Version {v.version_number}</span>
                {v.id === mockVersions[0].id && (
                  <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">
                    Current
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 mb-2">
                {new Date(v.created_at).toLocaleString()} by {v.author}
              </div>
              <p className="text-xs text-gray-600 line-clamp-2">{v.description}</p>
            </div>
          ))}
        </div>

        {/* Side-by-Side Comparison */}
        <div className="w-2/3 flex flex-col bg-white overflow-y-auto custom-scrollbar">
          <div className="flex h-full">
            
            {/* Selected Old Version */}
            <div className="flex-1 border-r border-gray-100 p-6 flex flex-col">
              <h3 className="text-sm font-bold text-gray-800 mb-4 text-center">
                V{selectedVersion.version_number}
              </h3>
              
              <div className="w-full aspect-[4/5] bg-gray-100 rounded-lg mb-4 relative overflow-hidden border border-gray-200">
                {selectedVersion.image_url ? (
                  <img src={selectedVersion.image_url} alt="Version Media" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">No media</div>
                )}
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 text-sm text-gray-600 flex-1 whitespace-pre-wrap">
                {selectedVersion.description || 'No caption provided.'}
              </div>
            </div>

            {/* Current Version */}
            <div className="flex-1 p-6 flex flex-col">
              <h3 className="text-sm font-bold text-[var(--brand-primary)] mb-4 text-center flex items-center justify-center gap-1">
                Current
                <Check size={14} />
              </h3>
              
              <div className="w-full aspect-[4/5] bg-gray-100 rounded-lg mb-4 relative overflow-hidden border border-gray-200 shadow-sm ring-2 ring-[var(--brand-primary)]/20">
                {mockVersions[0].image_url ? (
                  <img src={mockVersions[0].image_url} alt="Current Media" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">No media</div>
                )}
              </div>
              
              <div className="p-4 bg-white rounded-lg border border-gray-200 text-sm text-gray-800 flex-1 whitespace-pre-wrap shadow-sm">
                {mockVersions[0].description || 'No caption provided.'}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
