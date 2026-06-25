import React from 'react';
import { Bell, Search, UserCircle2 } from 'lucide-react';
import { useTheme } from '../../theme/ThemeContext';
import type { UserRole } from '../../App';

interface HeaderProps {
  role: UserRole;
  setRole: (role: UserRole) => void;
}

export const Header: React.FC<HeaderProps> = ({ role, setRole }) => {
  const { theme, setTheme } = useTheme();

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
      <div className="flex items-center">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search projects, tasks..." 
            className="pl-9 pr-4 py-2 w-64 bg-gray-50 border-none rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition-all placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Role Switcher */}
        <button 
          onClick={() => setRole(role === 'admin' ? 'client' : 'admin')}
          className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs font-semibold text-gray-700 transition-colors"
          title="Simulate view"
        >
          <UserCircle2 size={14} />
          <span>View: {role === 'admin' ? 'Admin' : 'Client'}</span>
        </button>

        <div className="flex items-center space-x-2 bg-gray-50 rounded-full p-1 border border-gray-100">
          <button 
            onClick={() => setTheme('vibrante')}
            className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${theme === 'vibrante' ? 'bg-white shadow-sm ring-1 ring-gray-200' : 'hover:bg-gray-200'}`}
            title="Tema Vibrante"
          >
            <div className="w-4 h-4 rounded-full bg-[#8B5CF6]"></div>
          </button>
          <button 
            onClick={() => setTheme('calido')}
            className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${theme === 'calido' ? 'bg-white shadow-sm ring-1 ring-gray-200' : 'hover:bg-gray-200'}`}
            title="Tema Cálido"
          >
            <div className="w-4 h-4 rounded-full bg-[#E17055]"></div>
          </button>
          <button 
            onClick={() => setTheme('tecnologico')}
            className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${theme === 'tecnologico' ? 'bg-white shadow-sm ring-1 ring-gray-200' : 'hover:bg-gray-200'}`}
            title="Tema Tecnológico"
          >
            <div className="w-4 h-4 rounded-full bg-[#0984E3]"></div>
          </button>
        </div>

        <button className="relative p-2 text-gray-500 hover:text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10 rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--brand-accent)] rounded-full border-2 border-white"></span>
        </button>
      </div>
    </header>
  );
};
