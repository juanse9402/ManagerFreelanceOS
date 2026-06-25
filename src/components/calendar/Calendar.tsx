import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { ContentDrawer } from './ContentDrawer';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export const CalendarView: React.FC = () => {
  const { activeClientId } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, [activeClientId]);

  const fetchEvents = async () => {
    if (!activeClientId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('content_posts')
        .select('*')
        .eq('client_id', activeClientId);
        
      if (error) throw error;
      if (data) {
        setEvents(data);
      }
    } catch (error) {
      console.error('Error fetching content posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContent = async () => {
    if (!activeClientId) {
      alert("Please select a workspace client first.");
      return;
    }
    
    const newContent = {
      title: 'New Content Post',
      type: 'Post',
      platform: 'Instagram',
      status: 'Draft',
      date: '2026-06-15', // Default to today in our mock calendar
      client_id: activeClientId
    };
    
    const { data, error } = await supabase.from('content_posts').insert([newContent]).select();
    if (!error && data) {
      fetchEvents();
    } else {
      console.error("Error creating content:", error);
    }
  };

  // Generamos una grilla simple de 35 días para el mock
  const days = Array.from({ length: 35 }, (_, i) => i + 1 - 4); // Empieza en negativo para padding de mes anterior

  return (
    <div className="bg-white rounded-[var(--radius-card)] p-6 shadow-[var(--shadow-card)] flex flex-col min-h-[calc(100vh-120px)] h-full">
      
      {/* Header del Calendario */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Content Calendar</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Plan and visualize all content across networks.</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
            <button className="px-3 py-1.5 text-sm font-medium bg-gray-100 rounded-md text-gray-800">Month</button>
            <button className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-800">Week</button>
          </div>
          <button 
            onClick={handleCreateContent}
            className="flex items-center space-x-2 px-4 py-2 bg-[var(--brand-primary)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--brand-primary)]/90 shadow-sm transition-colors"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">New Content</span>
          </button>
        </div>
      </div>

      {/* Grid del Calendario */}
      <div className="flex-1 flex flex-col">
        {/* Días de la semana */}
        <div className="grid grid-cols-7 gap-px border-b border-gray-200 mb-2">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
            <div key={day} className="text-center text-xs font-semibold text-gray-400 py-2 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>
        
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10 backdrop-blur-sm">
            <span className="text-[var(--brand-primary)] font-medium">Loading calendar data...</span>
          </div>
        )}
        
        {/* Celdas de días */}
        <div className="grid grid-cols-7 flex-1 gap-1 relative">
          {days.map((dayNum, i) => {
            const isCurrentMonth = dayNum > 0 && dayNum <= 30;
            const displayDay = dayNum > 30 ? dayNum - 30 : dayNum <= 0 ? 31 + dayNum : dayNum;
            const isToday = dayNum === 15; // Mock "today"
            
            // Encontrar eventos para este día
            const dayEvents = isCurrentMonth 
              ? events.filter(e => e.date && e.date.endsWith(`-${dayNum.toString().padStart(2, '0')}`)) 
              : [];

            return (
              <div 
                key={i} 
                className={`min-h-[100px] border border-gray-100 rounded-lg p-2 flex flex-col ${
                  !isCurrentMonth ? 'bg-gray-50 opacity-50' : 'hover:border-gray-300 transition-colors'
                } ${isToday ? 'ring-2 ring-[var(--brand-primary)]/50 bg-[var(--brand-primary)]/5' : ''}`}
              >
                <div className={`text-right text-sm font-semibold mb-1 ${isToday ? 'text-[var(--brand-primary)]' : 'text-gray-500'}`}>
                  {displayDay}
                </div>
                
                <div className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
                  {dayEvents.map(event => (
                    <div 
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className={`text-xs p-1.5 rounded cursor-pointer font-medium truncate border shadow-sm transition-transform hover:scale-[1.02] ${
                        event.platform === 'Instagram' 
                          ? 'bg-pink-50 border-pink-100 text-pink-700' 
                          : 'bg-slate-800 border-slate-900 text-slate-100'
                      }`}
                    >
                      <span className="opacity-80 font-bold mr-1">{event.type}:</span>
                      {event.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ContentDrawer 
        isOpen={!!selectedEvent} 
        onClose={() => setSelectedEvent(null)} 
        item={selectedEvent}
        onUpdate={fetchEvents}
      />
    </div>
  );
};
