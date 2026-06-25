import React from 'react';
import { Camera, PlaySquare, Calendar as CalendarIcon, MessageSquare, Clock } from 'lucide-react';

export const NextContentPreview: React.FC = () => {
  return (
    <div className="bg-white rounded-[var(--radius-card)] p-6 shadow-[var(--shadow-card)] flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Next Content</h2>
        <span className="text-xs font-semibold px-2.5 py-1 bg-purple-50 text-purple-600 rounded-full flex items-center border border-purple-100">
          <Camera size={14} className="mr-1" /> Instagram
        </span>
      </div>

      <div className="flex-1 flex flex-col sm:flex-row gap-4">
        {/* Placeholder image mock */}
        <div className="w-full sm:w-1/3 aspect-[4/5] bg-gray-100 rounded-lg flex flex-col items-center justify-center relative overflow-hidden group">
          <img 
            src="https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80" 
            alt="Preview" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
          <PlaySquare className="text-white relative z-10 opacity-80" size={32} />
          <span className="text-white text-xs font-semibold relative z-10 mt-2 bg-black/40 px-2 py-1 rounded backdrop-blur-sm">Reel</span>
        </div>
        
        {/* Info */}
        <div className="w-full sm:w-2/3 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2 py-0.5 bg-gray-100 text-[var(--text-muted)] text-[10px] font-bold uppercase rounded">Reel</span>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase rounded flex items-center"><Clock size={10} className="mr-1"/> In Review</span>
            </div>
            <h3 className="font-bold text-[var(--text-primary)] leading-tight mb-2">Productivity Tips for Freelancers</h3>
            <p className="text-sm text-[var(--text-muted)] line-clamp-2">Are you disorganized? Try these 3 methods to save up to 10 hours a week...</p>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center text-xs text-gray-500 font-medium">
                <CalendarIcon size={14} className="mr-1" /> Tomorrow, 10:00 AM
              </div>
              <div className="flex items-center text-xs text-gray-500 font-medium">
                <MessageSquare size={14} className="mr-1" /> 2 Comments
              </div>
            </div>
            <button className="w-full justify-center text-[var(--brand-primary)] bg-[var(--brand-primary)]/10 hover:bg-[var(--brand-primary)]/20 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center">
              <MessageSquare size={16} className="mr-1.5" />
              Approve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
