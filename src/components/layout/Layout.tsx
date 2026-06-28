import React, { useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import type { UserRole } from '../../App';
import { useAuth } from '../../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  activeView: string;
  setActiveView: (view: string) => void;
  role: UserRole;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeView, setActiveView, role }) => {
  const { clientProfile, activeClientId, availableClients } = useAuth();
  
  useEffect(() => {
    let brandSettings = null;
    if (role === 'client' && clientProfile?.brand_settings) {
      brandSettings = clientProfile.brand_settings;
    } else if (role === 'admin' && activeClientId) {
      const adminClient = availableClients.find(c => c.id === activeClientId);
      brandSettings = adminClient?.brand_settings;
    }

    if (brandSettings) {
      document.documentElement.style.setProperty('--brand-primary', brandSettings.primaryColor);
      document.documentElement.style.setProperty('--brand-accent', brandSettings.accentColor);
      // Optional: Set font family if supported in Tailwind config
      // document.documentElement.style.setProperty('--font-brand', `"${brandSettings.font}", sans-serif`);
    } else {
      // Reset to defaults
      document.documentElement.style.removeProperty('--brand-primary');
      document.documentElement.style.removeProperty('--brand-accent');
    }
  }, [role, clientProfile, activeClientId, availableClients]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans relative">
      <Sidebar activeView={activeView} setActiveView={setActiveView} role={role} />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header role={role} />
        <main className="flex-1 overflow-y-auto p-4 pb-24 md:pb-6 md:p-6 lg:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto w-full h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
