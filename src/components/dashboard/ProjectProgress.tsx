import React from 'react';
import { Target, Building, Check } from 'lucide-react';

interface ProjectProgressProps {
  project?: any;
  loading?: boolean;
  isClientView?: boolean;
}

export const ProjectProgress: React.FC<ProjectProgressProps> = ({ project, loading, isClientView }) => {
  const currentProgress = project?.progress || 0;
  const currentPhase = project?.status || 'No Active Project';
  
  const phases = [
    { name: 'Planning', limit: 0, desc: 'Defining strategy and goals.' },
    { name: 'Strategy', limit: 25, desc: 'Content pillars and themes.' },
    { name: 'Production', limit: 50, desc: 'Creating assets and copy.' },
    { name: 'Review', limit: 75, desc: 'Awaiting your approval.' },
    { name: 'Publishing', limit: 100, desc: 'Live on social platforms.' },
  ];

  if (isClientView && project) {
    return (
      <div className="flex flex-col space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-500 mb-2">Current phase: {currentPhase}</h3>
          
          <div className="flex h-12 w-full rounded-lg overflow-hidden border border-gray-200">
            {phases.map((phase, idx) => {
              const isCompleted = currentProgress >= phase.limit && currentProgress > 0 && phase.limit > 0 || (idx === 0 && currentProgress > 0);
              const isActive = currentProgress < phase.limit && (idx === 0 || currentProgress >= phases[idx-1].limit);
              
              let bgClass = 'bg-gray-100';
              let textClass = 'text-gray-400';
              if (isCompleted) {
                bgClass = 'bg-[var(--brand-primary)]';
                textClass = 'text-white';
              } else if (isActive) {
                bgClass = 'bg-[var(--brand-primary)]/20';
                textClass = 'text-[var(--brand-primary)] font-bold';
              }

              return (
                <div 
                  key={phase.name}
                  className={`flex-1 flex flex-col items-center justify-center relative group cursor-default transition-colors border-r border-white/20 last:border-r-0 ${bgClass}`}
                >
                  <div className={`text-xs ${textClass} flex items-center space-x-1`}>
                    {isCompleted && <Check size={12} className="shrink-0" strokeWidth={3} />}
                    <span className="hidden sm:inline">{phase.name}</span>
                  </div>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 text-center pointer-events-none shadow-xl">
                    <div className="font-bold mb-1">{phase.name}</div>
                    <div className="text-gray-300">{phase.desc}</div>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2">This week's tasks — 3 of 5 completed</h3>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-2 border border-gray-200">
            <div className="h-full bg-[var(--brand-primary)] rounded-full transition-all duration-500" style={{ width: '60%' }}></div>
          </div>
          <p className="text-xs text-gray-500">More than halfway through this week's goals.</p>
        </div>
      </div>
    );
  }

  // Standard Admin View
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

      {project ? (
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
      ) : (
        <div className="flex flex-col items-center justify-center flex-1 py-6 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50 mt-4">
          <Building size={32} className="text-gray-300 mb-3" />
          <h3 className="text-sm font-semibold text-gray-900 mb-1">No active projects</h3>
          <p className="text-xs text-gray-500 text-center max-w-[200px]">
            Create a new project to start tracking your work phases.
          </p>
        </div>
      )}
    </div>
  );
};
