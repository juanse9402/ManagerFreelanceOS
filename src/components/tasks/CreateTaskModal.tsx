import React, { useState } from 'react';
import { X, Save, FileText, Type, Paperclip } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useTimeTracking } from '../../contexts/TimeTrackingContext';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose, onSave }) => {
  const { activeClientId } = useAuth();
  
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [visibility, setVisibility] = useState<'admin_only' | 'client_visible'>('admin_only');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Task estimate fields
  const { saveTaskEstimate, saveTaskRecurrence } = useTimeTracking();
  const [estimatedTimeValue, setEstimatedTimeValue] = useState('');
  const [estimatedTimeUnit, setEstimatedTimeUnit] = useState<'hours' | 'minutes'>('hours');

  // Recurrence fields
  const [recurrenceDays, setRecurrenceDays] = useState<string[]>([]);
  const WEEKDAYS = [
    { key: 'Mon', label: 'L' },
    { key: 'Tue', label: 'M' },
    { key: 'Wed', label: 'X' },
    { key: 'Thu', label: 'J' },
    { key: 'Fri', label: 'V' },
    { key: 'Sat', label: 'S' },
    { key: 'Sun', label: 'D' }
  ];

  const toggleRecurrenceDay = (day: string) => {
    setRecurrenceDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClientId) {
      alert('Por favor, selecciona un cliente primero.');
      return;
    }
    
    setLoading(true);
    
    let finalAttachmentUrl = '';

    if (attachment) {
      const fileExt = attachment.name.split('.').pop();
      const fileName = `task_${Math.random()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage.from('content_media').upload(fileName, attachment);
      if (uploadError) {
        alert(`Error subiendo adjunto: ${uploadError.message}`);
        setLoading(false);
        return;
      }
      const { data } = supabase.storage.from('content_media').getPublicUrl(fileName);
      finalAttachmentUrl = data.publicUrl;
    }

    const newTask = {
      title,
      category,
      date: date || null,
      status: 'todo',
      client_id: activeClientId,
      description,
      internal_notes: internalNotes,
      visibility,
      attachment_url: finalAttachmentUrl
    };

    // Chain select() to retrieve the generated task ID
    const { data, error } = await supabase.from('tasks').insert([newTask]).select();
    
    if (!error) {
      if (data && data.length > 0) {
        const generatedTaskId = data[0].id;
        if (estimatedTimeValue) {
          saveTaskEstimate(generatedTaskId, {
            value: Number(estimatedTimeValue),
            unit: estimatedTimeUnit
          });
        }
        if (recurrenceDays.length > 0) {
          saveTaskRecurrence(generatedTaskId, recurrenceDays);
        }
      }
      
      setTitle('');
      setCategory('General');
      setDate('');
      setDescription('');
      setInternalNotes('');
      setVisibility('admin_only');
      setAttachment(null);
      setEstimatedTimeValue('');
      setRecurrenceDays([]);
      setLoading(false);
      onSave();
      onClose();
    } else {
      alert(`Error al crear la tarea: ${error.message || JSON.stringify(error)}`);
      console.error('Insert Error:', error);
      setLoading(false);
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
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex justify-between">
                <span>Fecha límite (Date)</span>
                <span className="text-xs text-gray-400 font-normal">Opcional</span>
              </label>
              <input 
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] transition-all"
              />
            </div>

            {/* Estimated Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Estimated Time (Optional)</label>
                <input 
                  type="number"
                  value={estimatedTimeValue}
                  onChange={(e) => setEstimatedTimeValue(e.target.value)}
                  placeholder="e.g. 5"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] transition-all animate-in"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Unit</label>
                <select
                  value={estimatedTimeUnit}
                  onChange={(e) => setEstimatedTimeUnit(e.target.value as 'hours' | 'minutes')}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] transition-all bg-white cursor-pointer"
                >
                  <option value="hours">Hours</option>
                  <option value="minutes">Minutes</option>
                </select>
              </div>
            </div>

            {/* Recurrencia */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center">
                🔁 ¿Se repite esta actividad?
              </label>
              <div className="flex gap-2">
                {WEEKDAYS.map(day => {
                  const isSelected = recurrenceDays.includes(day.key);
                  return (
                    <button
                      key={day.key}
                      type="button"
                      onClick={() => toggleRecurrenceDay(day.key)}
                      className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center border transition-all ${
                        isSelected 
                          ? 'bg-[var(--brand-primary)] border-[var(--brand-primary)] text-white shadow-sm' 
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                      title={day.key}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-400 mt-1.5">Selecciona los días en que se repite esta tarea para reiniciarla automáticamente.</p>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center">
                <FileText size={14} className="mr-1.5" /> Client-Facing Description
              </label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details visible to the client..."
                rows={2}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] transition-all resize-none custom-scrollbar"
              />
            </div>

            {/* Notas Internas */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center text-amber-700">
                <FileText size={14} className="mr-1.5" /> Internal Notes (Admin only)
              </label>
              <textarea 
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="Private notes for your team..."
                rows={2}
                className="w-full border border-amber-200 bg-amber-50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all resize-none custom-scrollbar"
              />
            </div>

            {/* Visibilidad */}
            <div className="flex items-center gap-3 py-2">
              <input 
                type="checkbox"
                id="visibility-toggle"
                checked={visibility === 'client_visible'}
                onChange={(e) => setVisibility(e.target.checked ? 'client_visible' : 'admin_only')}
                className="h-4 w-4 rounded border-gray-300 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
              />
              <label htmlFor="visibility-toggle" className="text-sm font-medium text-gray-700 cursor-pointer">
                Visible to Client
              </label>
            </div>

            {/* Adjunto */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center">
                <Paperclip size={14} className="mr-1.5" /> Recursos / Adjuntos
              </label>
              <input 
                type="file"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setAttachment(e.target.files[0]);
                  }
                }}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] transition-all bg-white"
              />
              <p className="text-xs text-gray-500 mt-1.5">Sube imágenes, documentos o cualquier recurso necesario.</p>
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
