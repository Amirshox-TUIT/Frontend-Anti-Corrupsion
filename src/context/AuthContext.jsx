import { createContext, useContext, useEffect, useState } from 'react';
import { adminService } from '../services/api.js';
import {
  clearStoredAdminSession,
  getStoredAdminSession,
  setStoredAdminSession,
} from '../services/storage.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => getStoredAdminSession());
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    if (session?.token) {
      setStoredAdminSession(session);
      return;
    }

    clearStoredAdminSession();
  }, [session]);

  const login = async (credentials) => {
    setAuthLoading(true);

    try {
      const response = await adminService.login(credentials);
      setSession(response);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'admin.authFailed',
      };
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    setSession(null);
    clearStoredAdminSession();
  };

  return (
    <AuthContext.Provider
      value={{
        admin: session,
        authLoading,
        isAuthenticated: Boolean(session?.token),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider.');
  }

  return context;
}
