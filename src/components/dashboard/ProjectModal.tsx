import React, { useState, useEffect } from 'react';
import { X, Save, Users, Building } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [clientId, setClientId] = useState('');
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchClients();
    }
  }, [isOpen]);

  const fetchClients = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('role', 'client')
      .eq('status', 'approved');
      
    if (data && !error) {
      setClients(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !clientId) return;
    
    setLoading(true);
    const { error } = await supabase.from('projects').insert([{
      name: name,
      client_id: clientId,
      status: 'Planning',
      progress: 0
    }]);
    
    setLoading(false);
    
    if (!error) {
      setName('');
      setClientId('');
      onSave();
      onClose();
    } else {
      alert('Error creating project');
      console.error(error);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <Building size={18} className="mr-2 text-[var(--brand-primary)]" />
              New Project
            </h2>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 transition-colors">
              <X size={18} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Project Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Summer Campaign 2026"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent transition-all"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Assign to Client</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Users size={16} className="text-gray-400" />
                  </div>
                  <select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent transition-all appearance-none"
                    required
                  >
                    <option value="" disabled>Select a client...</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.full_name || 'Unnamed Client'}</option>
                    ))}
                  </select>
                </div>
                {clients.length === 0 && (
                  <p className="text-xs text-amber-600 mt-2 font-medium">No approved clients found. Please approve a client in Settings first.</p>
                )}
              </div>
            </div>
            
            <div className="mt-8 pt-4 border-t border-gray-100 flex justify-end space-x-3">
              <button 
                type="button" 
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--brand-primary)] transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading || !clientId}
                className="px-4 py-2 text-sm font-medium text-white bg-[var(--brand-primary)] rounded-lg hover:bg-[var(--brand-primary)]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--brand-primary)] transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : (
                  <>
                    <Save size={16} className="mr-2" />
                    Create Project
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
