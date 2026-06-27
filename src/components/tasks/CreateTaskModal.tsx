import React, { useState } from 'react';
import { X, Save, FileText, Type } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose, onSave }) => {
  const { activeClientId } = useAuth();
  
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClientId) {
      alert('Por favor, selecciona un cliente primero.');
      return;
    }
    
    setLoading(true);
    
    const newTask = {
      title,
      category,
      date,
      status: 'todo',
      client_id: activeClientId
    };

    const { error } = await supabase.from('tasks').insert([newTask]);
    
    setLoading(false);
    
    if (!error) {
      setTitle('');
      setCategory('General');
      onSave();
      onClose();
    } else {
      alert(`Error al crear la tarea: ${error.message || JSON.stringify(error)}`);
      console.error('Insert Error:', error);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg my-8 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 sticky top-0 z-10">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <FileText size={18} className="mr-2 text-[var(--brand-primary)]" />
              Nueva Tarea
            </h2>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 transition-colors">
              <X size={18} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            
            {/* Título */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center">
                <Type size={14} className="mr-1.5" /> Título de la Tarea
              </label>
              <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Revisar diseño de la web"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] transition-all"
                required
              />
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Categoría</label>
              <input 
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ej. Diseño, Desarrollo, Marketing..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] transition-all"
                required
              />
            </div>

            {/* Fecha */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Fecha límite (Date)</label>
              <input 
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] transition-all"
                required
              />
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
                disabled={loading || !title.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-[var(--brand-primary)] rounded-lg hover:bg-[var(--brand-primary)]/90 transition-colors flex items-center disabled:opacity-50"
              >
                {loading ? 'Guardando...' : (
                  <>
                    <Save size={16} className="mr-2" />
                    Crear Tarea
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
