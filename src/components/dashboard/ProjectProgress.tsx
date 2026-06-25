import React from 'react';
import { Target, TrendingUp, CheckCircle, Clock } from 'lucide-react';

export const ProjectProgress: React.FC = () => {
  const currentProgress = 65; // Mock data
  const currentPhase = 'Review';
  
  const phases = [
    { name: 'Strategy', limit: 20 },
    { name: 'Production', limit: 60 },
    { name: 'Review', limit: 80 },
    { name: 'Publishing', limit: 100 },
  ];

  return (
    <div className="bg-white rounded-[var(--radius-card)] p-6 shadow-[var(--shadow-card)]">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Overall Progress</h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">Monthly Campaign: June 2026</p>
        </div>
        <div className="flex items-center space-x-2 bg-[var(--brand-primary)]/10 px-3 py-1.5 rounded-full">
          <Target size={16} className="text-[var(--brand-primary)]" />
          <span className="font-semibold text-sm text-[var(--brand-primary)]">Current Phase: {currentPhase}</span>
        </div>
      </div>

      <div className="relative pt-1">
        <div className="flex mb-2 items-center justify-between">
          <div>
            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-[var(--brand-primary)] bg-[var(--brand-primary)]/10">
              Progress
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold inline-block text-[var(--brand-primary)]">
              {currentProgress}%
            </span>
          </div>
        </div>
        
        {/* Progress Bar Track */}
        <div className="overflow-hidden h-4 mb-4 text-xs flex rounded-full bg-gray-100">
          <div 
            style={{ width: `${currentProgress}%` }} 
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[var(--brand-primary)] transition-all duration-1000 ease-out"
          ></div>
        </div>
        
        {/* Phase Labels */}
        <div className="flex justify-between text-xs text-gray-400 font-medium px-1">
          {phases.map((phase, idx) => (
            <div key={idx} className={`text-center ${currentProgress >= phase.limit - 10 ? 'text-[var(--brand-primary)]' : ''}`}>
              {phase.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
