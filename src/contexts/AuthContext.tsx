import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  role: 'admin' | 'client';
  status: 'pending' | 'approved' | 'rejected';
  profileName: string;
  hasCompletedOrientation: boolean;
  setHasCompletedOrientation: (value: boolean) => void;
  activeClientId: string | null;
  setActiveClientId: (id: string | null) => void;
  availableClients: any[];
  fetchAvailableClients: () => Promise<void>;
  clientProfile: any | null;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  role: 'client',
  status: 'pending',
  profileName: '',
  hasCompletedOrientation: true,
  setHasCompletedOrientation: () => {},
  activeClientId: null,
  setActiveClientId: () => {},
  availableClients: [],
  fetchAvailableClients: async () => {},
  clientProfile: null
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<'admin' | 'client'>('client');
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [profileName, setProfileName] = useState('');
  const [hasCompletedOrientation, setHasCompletedOrientationState] = useState(true);
  const orientationCompletedLocally = useRef(false);
  
  const setHasCompletedOrientation = (val: boolean) => {
    if (val) {
      orientationCompletedLocally.current = true;
      if (user) {
        localStorage.setItem(`orientation_completed_${user.id}`, 'true');
      }
    }
    setHasCompletedOrientationState(val);
  };
  
  // Workspace State
  const [activeClientId, setActiveClientId] = useState<string | null>(null);
  const [availableClients, setAvailableClients] = useState<any[]>([]);
  const [clientProfile, setClientProfile] = useState<any | null>(null);

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
        
        const localCompleted = localStorage.getItem(`orientation_completed_${userId}`) === 'true';
        setHasCompletedOrientationState(
          localCompleted || orientationCompletedLocally.current ? true : (data.has_completed_orientation ?? true)
        );
        
        setClientProfile(data);
        
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
      .select('*')
      .eq('role', 'client')
      .eq('status', 'approved');
      
    if (data && !error) {
      setAvailableClients(data);
      if (!activeClientId && data.length > 0) {
        setActiveClientId(data[0].id);
      }
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).then(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

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
      hasCompletedOrientation,
      setHasCompletedOrientation,
      activeClientId,
      setActiveClientId,
      availableClients,
      fetchAvailableClients,
      clientProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
