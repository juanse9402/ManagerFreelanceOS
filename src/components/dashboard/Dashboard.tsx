import React from 'react';
import { ProjectProgress } from './ProjectProgress';
import { TaskSummary } from './TaskSummary';
import { NextContentPreview } from './NextContentPreview';

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>
        <div className="text-sm text-[var(--text-muted)]">Welcome back, <span className="font-semibold text-gray-700">Team</span> 👋</div>
      </div>
      
      {/* Top row: Progress & Tasks Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProjectProgress />
        <TaskSummary />
      </div>
      
      {/* Bottom row: Next content preview & Recent Activity (Placeholder) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <NextContentPreview />
        </div>
        <div className="bg-white rounded-[var(--radius-card)] p-6 shadow-[var(--shadow-card)]">
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Actividad Reciente</h2>
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
            {/* Timeline item mock */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-green-100 text-green-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                <svg className="fill-current" xmlns="http://www.w3.org/2000/svg" width="12" height="10">
                  <path fillRule="nonzero" d="M10.422 1.257 4.655 7.025 2.553 4.923A.896.896 0 0 0 1.284 6.19l2.736 2.736a.897.897 0 0 0 1.268 0l6.402-6.402a.896.896 0 1 0-1.268-1.267Z" />
                </svg>
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-3 rounded shadow-sm border border-gray-50">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-bold text-[var(--text-primary)] text-sm">Contenido Aprobado</div>
                  <time className="text-xs font-medium text-[var(--brand-primary)]">Hace 2h</time>
                </div>
                <div className="text-xs text-[var(--text-muted)]">El cliente aprobó el Carrusel "Mitos de SEO".</div>
              </div>
            </div>
            {/* Timeline item mock */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-3 rounded shadow-sm border border-gray-50">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-bold text-[var(--text-primary)] text-sm">Nuevo Comentario</div>
                  <time className="text-xs font-medium text-gray-500">Ayer</time>
                </div>
                <div className="text-xs text-[var(--text-muted)]">"Me gustaría cambiar la foto 2 por una más iluminada".</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
