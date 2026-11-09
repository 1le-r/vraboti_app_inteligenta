import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, tokenStore } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!tokenStore.get());

  useEffect(() => {
    if (!tokenStore.get()) return;
    api.me().then(setUser).catch(() => tokenStore.clear()).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onLogout = () => setUser(null);
    window.addEventListener('vraboti:logout', onLogout);
    return () => window.removeEventListener('vraboti:logout', onLogout);
  }, []);

  const handleAuth = useCallback(({ token, user }) => {
    tokenStore.set(token);
    setUser(user);
    return user;
  }, []);

  const value = {
    user,
    loading,
    isEmployer: user?.role === 'EMPLOYER',
    login: async (email, password) => handleAuth(await api.login(email, password)),
    register: (data) => api.register(data),
    setSession: handleAuth,
    logout: () => { tokenStore.clear(); setUser(null); },
    setUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
