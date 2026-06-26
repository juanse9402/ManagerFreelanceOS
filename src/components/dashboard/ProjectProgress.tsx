import React from 'react';
import { Target, Building } from 'lucide-react';

interface ProjectProgressProps {
  project?: any;
  loading?: boolean;
}

export const ProjectProgress: React.FC<ProjectProgressProps> = ({ project, loading }) => {
  const currentProgress = project?.progress || 0;
  const currentPhase = project?.status || 'No Active Project';
  
  const phases = [
    { name: 'Planning', limit: 0 },
    { name: 'Strategy', limit: 25 },
    { name: 'Production', limit: 50 },
    { name: 'Review', limit: 75 },
    { name: 'Publishing', limit: 100 },
  ];

  return (
    <div className="bg-white rounded-[var(--radius-card)] p-6 shadow-[var(--shadow-card)] flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Overall Progress</h2>
          <p className="text-sm text-[var(--text-muted)] mt-1 flex items-center">
            <Building size={14} className="mr-1" />
            {loading ? 'Loading...' : project ? project.name : 'No projects yet'}
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-[var(--brand-primary)]/10 px-3 py-1.5 rounded-full shrink-0">
          <Target size={16} className="text-[var(--brand-primary)]" />
          <span className="font-semibold text-xs sm:text-sm text-[var(--brand-primary)]">Phase: {currentPhase}</span>
        </div>
      </div>

      <div className="relative pt-1 mt-auto">
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
        <div className="flex justify-between text-[10px] sm:text-xs text-gray-400 font-medium px-1 overflow-x-auto custom-scrollbar pb-1">
          {phases.map((phase, idx) => (
            <div key={idx} className={`text-center px-1 ${currentProgress >= phase.limit ? 'text-[var(--brand-primary)]' : ''}`}>
              {phase.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
