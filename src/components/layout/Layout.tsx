import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import type { UserRole } from '../../App';

interface LayoutProps {
  children: React.ReactNode;
  activeView: string;
  setActiveView: (view: string) => void;
  role: UserRole;
  setRole: (role: UserRole) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeView, setActiveView, role, setRole }) => {
  return (
    <div className="flex h-screen bg-[var(--background)] overflow-hidden">
      <Sidebar activeView={activeView} setActiveView={setActiveView} role={role} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Header role={role} setRole={setRole} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto w-full h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
