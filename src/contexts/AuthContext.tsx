import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  role: 'admin' | 'client';
  status: 'pending' | 'approved' | 'rejected';
  profileName: string;
  activeClientId: string | null;
  setActiveClientId: (id: string | null) => void;
  availableClients: any[];
  fetchAvailableClients: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  role: 'client',
  status: 'pending',
  profileName: '',
  activeClientId: null,
  setActiveClientId: () => {},
  availableClients: [],
  fetchAvailableClients: async () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<'admin' | 'client'>('client');
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [profileName, setProfileName] = useState('');
  
  // Workspace State
  const [activeClientId, setActiveClientId] = useState<string | null>(null);
  const [availableClients, setAvailableClients] = useState<any[]>([]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (data && !error) {
        setRole(data.role as 'admin' | 'client');
        setStatus(data.status as 'pending' | 'approved' | 'rejected');
        setProfileName(data.full_name || '');
        
        if (data.role === 'admin') {
          fetchAvailableClients();
        } else {
          setActiveClientId(userId); // El cliente es su propio workspace
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchAvailableClients = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('role', 'client')
      .eq('status', 'approved');
      
    if (data && !error) {
      setAvailableClients(data);
      // Si es admin y no ha seleccionado cliente, pero hay clientes disponibles, auto-seleccionar el primero
      if (!activeClientId && data.length > 0) {
        setActiveClientId(data[0].id);
      }
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).then(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setRole('client');
        setStatus('pending');
        setActiveClientId(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      loading, 
      role, 
      status, 
      profileName,
      activeClientId,
      setActiveClientId,
      availableClients,
      fetchAvailableClients
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
