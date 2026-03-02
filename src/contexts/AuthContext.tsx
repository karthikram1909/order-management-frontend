import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  isClient: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      updateRoles(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      updateRoles(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const updateRoles = (user: User | null) => {
    if (!user) {
      setIsAdmin(false);
      setIsClient(false);
      return;
    }

    // Role detection logic
    // Usually admin uses email login, client uses phone
    const hasEmail = !!user.email;
    const hasPhone = !!user.phone;

    setIsAdmin(hasEmail && !hasPhone); // Simple heuristic, can be improved with metadata
    setIsClient(hasPhone);

    // If clientToken/adminToken exist in localStorage but no session, they might be legacy
    // For now we trust the Supabase session
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('adminToken');
    localStorage.removeItem('clientToken');
    localStorage.removeItem('clientInfo');
    sessionStorage.removeItem('clientInfo');
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, isClient, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
