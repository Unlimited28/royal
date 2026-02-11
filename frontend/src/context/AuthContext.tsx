
import React, { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import { type LoginCredentials, login as apiLogin, logout as apiLogout, getMe, type User } from '../services/authService';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const accessToken = localStorage.getItem('ra_access_token');
      if (accessToken) {
        try {
          const userProfile = await getMe();
          setUser(userProfile);
        } catch (error) {
          console.error("Session rehydration failed:", error);
          // logout will clear everything
          apiLogout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await apiLogin(credentials);
      setUser(response.user);
      const role = response.user.roles?.[0] || 'user';
      toast.success(`Logged in successfully as ${role}`);
    } catch (error: any) {
      console.error("Login failed:", error);
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(message);
      throw error;
    }
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
    toast.success('Logged out successfully.');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => { // eslint-disable-line react-refresh/only-export-components
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
