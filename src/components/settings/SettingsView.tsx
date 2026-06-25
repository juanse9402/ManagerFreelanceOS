import React from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { Palette, Share2, Users, Check, Plus, Globe } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Client Settings</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Manage brand preferences and integrations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Colors & Branding */}
        <div className="md:col-span-2 bg-white rounded-[var(--radius-card)] p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center mb-6 border-b border-gray-100 pb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg mr-3">
              <Palette size={20} />
            </div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Colors & Branding</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Client Logo</label>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                  <Plus size={24} />
                </div>
                <div>
                  <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                    Upload Image
                  </button>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Visual Theme (Simulation)</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button 
                  onClick={() => setTheme('vibrante')}
                  className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${theme === 'vibrante' ? 'border-[#8B5CF6] bg-[#8B5CF6]/5' : 'border-gray-100 hover:border-gray-200'}`}
                >
                  <div className="flex space-x-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-[#8B5CF6]"></div>
                    <div className="w-6 h-6 rounded-full bg-[#C4B5FD]"></div>
                    <div className="w-6 h-6 rounded-full bg-[#F59E0B]"></div>
                  </div>
                  <span className="font-semibold text-sm">Vibrant</span>
                  <span className="text-xs text-gray-500 mt-1 text-center">Entertainment / Creative</span>
                </button>

                <button 
                  onClick={() => setTheme('calido')}
                  className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${theme === 'calido' ? 'border-[#E17055] bg-[#E17055]/5' : 'border-gray-100 hover:border-gray-200'}`}
                >
                  <div className="flex space-x-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-[#E17055]"></div>
                    <div className="w-6 h-6 rounded-full bg-[#FAB1A0]"></div>
                    <div className="w-6 h-6 rounded-full bg-[#00CEC9]"></div>
                  </div>
                  <span className="font-semibold text-sm">Warm</span>
                  <span className="text-xs text-gray-500 mt-1 text-center">Fashion / Lifestyle</span>
                </button>

                <button 
                  onClick={() => setTheme('tecnologico')}
                  className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${theme === 'tecnologico' ? 'border-[#0984E3] bg-[#0984E3]/5' : 'border-gray-100 hover:border-gray-200'}`}
                >
                  <div className="flex space-x-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-[#0984E3]"></div>
                    <div className="w-6 h-6 rounded-full bg-[#74B9FF]"></div>
                    <div className="w-6 h-6 rounded-full bg-[#FD79A8]"></div>
                  </div>
                  <span className="font-semibold text-sm">Tech</span>
                  <span className="text-xs text-gray-500 mt-1 text-center">Software / Minimalist</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Settings (Redes y Equipo) */}
        <div className="space-y-6">
          
          {/* Connected Networks */}
          <div className="bg-white rounded-[var(--radius-card)] p-6 shadow-[var(--shadow-card)]">
            <div className="flex items-center mb-4 border-b border-gray-100 pb-3">
              <div className="p-1.5 bg-green-50 text-green-600 rounded mr-2">
                <Share2 size={16} />
              </div>
              <h2 className="font-bold text-[var(--text-primary)]">Connected Networks</h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 rounded text-white flex items-center justify-center font-bold font-serif text-lg">
                    ig
                  </div>
                  <span className="font-medium text-sm">Instagram</span>
                </div>
                <span className="flex items-center text-xs text-green-600 font-semibold bg-green-100 px-2 py-1 rounded-full">
                  <Check size={12} className="mr-1" /> Connected
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-black rounded text-white flex items-center justify-center font-bold text-xs">
                    TT
                  </div>
                  <span className="font-medium text-sm">TikTok</span>
                </div>
                <span className="flex items-center text-xs text-green-600 font-semibold bg-green-100 px-2 py-1 rounded-full">
                  <Check size={12} className="mr-1" /> Connected
                </span>
              </div>
              
              <button className="w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-500 font-medium hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors">
                + Connect another network
              </button>
            </div>
          </div>

          {/* Team & Permissions */}
          <div className="bg-white rounded-[var(--radius-card)] p-6 shadow-[var(--shadow-card)]">
            <div className="flex items-center mb-4 border-b border-gray-100 pb-3">
              <div className="p-1.5 bg-purple-50 text-purple-600 rounded mr-2">
                <Users size={16} />
              </div>
              <h2 className="font-bold text-[var(--text-primary)]">Team & Permissions</h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <img src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="Anna" className="w-8 h-8 rounded-full bg-gray-200" />
                  <div>
                    <p className="text-sm font-semibold">Anna Marketer</p>
                    <p className="text-[10px] text-gray-500">Admin (Freelancer)</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <img src="https://i.pravatar.cc/150?u=cliente" alt="Cliente" className="w-8 h-8 rounded-full bg-gray-200" />
                  <div>
                    <p className="text-sm font-semibold">Carlos (Cliente)</p>
                    <p className="text-[10px] text-gray-500">Revisor</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
