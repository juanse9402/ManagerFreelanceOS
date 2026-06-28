import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { ContentDrawer } from './ContentDrawer';
import { AddContentDrawer } from './AddContentDrawer';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export const CalendarView: React.FC = () => {
  const { activeClientId } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'month' | 'week'>('month');

  useEffect(() => {
    fetchEvents();
  }, [activeClientId]);

  // Set default view based on role
  const { role } = useAuth();
  useEffect(() => {
    if (role === 'client') {
      setView('week');
    } else {
      setView('month');
    }
  }, [role]);

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

  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);

  const handleCreateContent = () => {
    if (!activeClientId) {
      alert("Please select a workspace client first.");
      return;
    }
    setIsAddDrawerOpen(true);
  };

  // Generamos una grilla simple para el mock
  const monthDays = Array.from({ length: 35 }, (_, i) => i + 1 - 4); // Empieza en negativo para padding de mes anterior
  const weekDays = Array.from({ length: 7 }, (_, i) => i + 15 - 3); // Semana actual centrada en el día 15
  const displayedDays = view === 'month' ? monthDays : weekDays;

  return (
    <div className="bg-white rounded-[var(--radius-card)] p-6 shadow-[var(--shadow-card)] flex flex-col min-h-[calc(100vh-120px)] h-full">
      
      {/* Header del Calendario */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Content Calendar</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Plan and visualize all content across networks.</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => {
              setView(role === 'client' ? 'week' : 'month');
              // scroll to today if needed, for now just a UI state
            }}
            className="hidden sm:flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            Today
          </button>
          
          <div className="flex items-center space-x-2 bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
            <button 
              onClick={() => setView('month')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${view === 'month' ? 'bg-gray-100 text-gray-800' : 'text-gray-500 hover:text-gray-800'}`}
            >
              Month
            </button>
            <button 
              onClick={() => setView('week')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${view === 'week' ? 'bg-gray-100 text-gray-800' : 'text-gray-500 hover:text-gray-800'}`}
            >
              Week
            </button>
          </div>
          {role === 'admin' && (
            <button 
              onClick={handleCreateContent}
              className="flex items-center space-x-2 px-4 py-2 bg-[var(--brand-primary)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--brand-primary)]/90 shadow-sm transition-colors"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">New Content</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar (Client only, or shared) */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button className="px-3 py-1.5 rounded-full text-xs font-bold border border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white shadow-sm">
          All Platforms
        </button>
        <button className="px-3 py-1.5 rounded-full text-xs font-semibold border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors">
          Instagram
        </button>
        <button className="px-3 py-1.5 rounded-full text-xs font-semibold border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors">
          TikTok
        </button>
        <div className="w-px h-6 bg-gray-200 mx-2 self-center"></div>
        <button className="px-3 py-1.5 rounded-full text-xs font-semibold border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors">
          Approved
        </button>
        <button className="px-3 py-1.5 rounded-full text-xs font-semibold border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors">
          In Review
        </button>
      </div>

      {/* Grid del Calendario o Empty State */}
      <div className="flex-1 flex flex-col relative">
        {events.length === 0 && !loading ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-50/80 backdrop-blur-[2px] rounded-2xl border-2 border-dashed border-gray-200">
            <div className="w-16 h-16 bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] rounded-full flex items-center justify-center mb-4">
              <Plus size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Nothing scheduled yet.</h3>
            <p className="text-gray-500 text-center max-w-md mb-6">
              Add content pieces to see them here.
            </p>
            <button 
              onClick={handleCreateContent}
              className="flex items-center space-x-2 px-5 py-2.5 bg-[var(--brand-primary)] text-white rounded-xl font-medium hover:opacity-90 transition-opacity shadow-sm"
            >
              <Plus size={18} />
              <span>Add Content</span>
            </button>
          </div>
        ) : null}

        {/* Días de la semana */}
        <div className="grid grid-cols-7 gap-px border-b border-gray-200 mb-2">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
            <div key={day} className="text-center text-xs font-semibold text-gray-400 py-2 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>
        
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-20 backdrop-blur-sm">
            <span className="text-[var(--brand-primary)] font-medium">Loading calendar data...</span>
          </div>
        )}
        
        {/* Celdas de días */}
        <div className={`grid grid-cols-7 flex-1 gap-1 relative ${view === 'month' ? 'grid-rows-5' : 'grid-rows-1'}`}>
          {displayedDays.map((dayNum, i) => {
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
                className={`border border-gray-100 rounded-lg p-2 flex flex-col min-h-0 ${
                  !isCurrentMonth ? 'bg-gray-50 opacity-50' : 'hover:border-gray-300 transition-colors'
                } ${isToday ? 'ring-2 ring-[var(--brand-primary)]/50 bg-[var(--brand-primary)]/5' : ''}`}
              >
                <div className={`text-right text-sm font-semibold mb-1 ${isToday ? 'text-[var(--brand-primary)]' : 'text-gray-500'}`}>
                  {displayDay}
                </div>
                
                <div className="flex-1 space-y-1.5 overflow-y-auto custom-scrollbar pt-1">
                  {dayEvents.map(event => {
                    // Status dot color mapping
                    const getStatusColor = (status: string) => {
                      if (status === 'Approved') return 'bg-green-500';
                      if (status === 'In Review') return 'bg-amber-500';
                      if (status === 'Pending') return 'bg-blue-500';
                      return 'bg-gray-400'; // Draft
                    };
                    
                    // Platform styling
                    const isIg = event.platform === 'Instagram';
                    
                    return (
                      <div 
                        key={event.id}
                        onClick={() => setSelectedEvent(event)}
                        className={`text-[11px] p-1.5 rounded cursor-pointer border shadow-sm transition-all hover:shadow hover:-translate-y-px relative pl-3 overflow-hidden ${
                          isIg 
                            ? 'bg-white border-pink-100 hover:border-pink-300' 
                            : 'bg-white border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        {/* Platform left border strip */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${isIg ? 'bg-gradient-to-b from-pink-500 to-orange-400' : 'bg-black'}`}></div>
                        
                        <div className="flex items-start justify-between gap-1 mb-0.5">
                          <span className={`font-bold truncate ${isIg ? 'text-pink-700' : 'text-slate-800'}`}>
                            {event.type}
                          </span>
                          <span className="flex-shrink-0 mt-1" title={`Status: ${event.status}`}>
                            <span className={`block w-1.5 h-1.5 rounded-full ${getStatusColor(event.status)}`}></span>
                          </span>
                        </div>
                        <div className="text-gray-600 truncate font-medium">
                          {event.title}
                        </div>
                        {event.category && (
                          <div className="mt-1 flex">
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-medium truncate">
                              {event.category}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
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

      <AddContentDrawer 
        isOpen={isAddDrawerOpen}
        onClose={() => setIsAddDrawerOpen(false)}
        onSave={fetchEvents}
      />
    </div>
  );
};
