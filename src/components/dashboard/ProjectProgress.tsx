import React from 'react';
import { Target, Building, CheckCircle2, Circle, Trophy, Calendar, Check } from 'lucide-react';

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
      <div className="bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-card)] border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Project Status</h2>
            <p className="text-sm text-[var(--text-muted)] mt-1 flex items-center">
              <Building size={14} className="mr-1" />
              {project.name}
            </p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black text-[var(--brand-primary)]">{currentProgress}%</span>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Complete</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row">
          {/* Phase Tracker */}
          <div className="p-6 md:w-1/2 border-b md:border-b-0 md:border-r border-gray-100">
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center">
              <Target size={16} className="mr-2 text-[var(--brand-primary)]" />
              Current Phase Map
            </h3>
            <div className="space-y-4">
              {phases.map((phase, idx) => {
                const isCompleted = currentProgress >= phase.limit && currentProgress > 0 && phase.limit > 0 || (idx === 0 && currentProgress > 0);
                const isActive = currentProgress < phase.limit && (idx === 0 || currentProgress >= phases[idx-1].limit);
                
                return (
                  <div key={idx} className={`flex ${isActive ? 'opacity-100' : isCompleted ? 'opacity-60' : 'opacity-40'}`}>
                    <div className="flex flex-col items-center mr-3 relative">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${isCompleted ? 'bg-green-500 text-white' : isActive ? 'bg-[var(--brand-primary)] text-white ring-4 ring-[var(--brand-primary)]/20' : 'bg-gray-200 text-gray-500'}`}>
                        {isCompleted ? <Check size={12} strokeWidth={3} /> : <span className="text-[10px] font-bold">{idx + 1}</span>}
                      </div>
                      {idx < phases.length - 1 && (
                        <div className={`w-0.5 h-full absolute top-6 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                      )}
                    </div>
                    <div className="pb-4">
                      <p className={`text-sm font-bold ${isActive ? 'text-[var(--brand-primary)]' : 'text-gray-800'}`}>{phase.name}</p>
                      {isActive && <p className="text-xs text-gray-500 mt-1">{phase.desc}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Weekly Checklist & Achievements */}
          <div className="p-6 md:w-1/2 flex flex-col gap-6 bg-gray-50/50">
            
            {/* Weekly Checklist */}
            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center">
                <Calendar size={16} className="mr-2 text-blue-500" />
                This Week's Focus
              </h3>
              <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm space-y-2">
                <div className="flex items-start">
                  <CheckCircle2 size={16} className="text-green-500 mr-2 shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700 line-through opacity-70">Approve content strategy</p>
                </div>
                <div className="flex items-start">
                  <Circle size={16} className="text-gray-300 mr-2 shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-800 font-medium">Review Q3 visual assets</p>
                </div>
                <div className="flex items-start">
                  <Circle size={16} className="text-gray-300 mr-2 shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-800 font-medium">Confirm budget for ads</p>
                </div>
              </div>
            </div>

            {/* Achievements Log */}
            <div className="flex-1">
              <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center">
                <Trophy size={16} className="mr-2 text-amber-500" />
                Milestones
              </h3>
              <div className="space-y-3">
                <div className="flex items-center p-2.5 bg-amber-50 rounded-lg border border-amber-100">
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mr-3 shrink-0">
                    <Trophy size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-900">First Review Completed</p>
                    <p className="text-[10px] text-amber-700">Awesome job staying on track!</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
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
