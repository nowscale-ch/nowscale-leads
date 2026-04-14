import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const initAuth = useCallback(async () => {
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        const { data: prof } = await supabase.from('profiles').select('*').eq('id', data.session.user.id).single();
        setUser(data.session.user);
        setProfile(prof);
      }
    } catch (e) {
      console.error('Init auth error:', e);
    }
    setLoading(false);
  }, []);

  useEffect(() => { initAuth(); }, [initAuth]);

  const login = useCallback(async (input, password) => {
    let email = input;
    if (!input.includes('@')) {
      const { data: prof } = await supabase.from('profiles').select('email,username').eq('username', input).maybeSingle();
      if (prof && prof.email) { email = prof.email; }
      else { email = input.replace(/[^a-zA-Z0-9._-]/g, '') + '@noreply.nowscale.ai'; }
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.session) {
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', data.session.user.id).single();
      setUser(data.session.user);
      setProfile(prof);
      return { user: data.session.user, profile: prof };
    }
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
