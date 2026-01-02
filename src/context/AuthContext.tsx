
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { login as apiLogin, LoginCredentials } from '../services/authService';
import { jwtDecode } from "jwt-decode";
import toast from 'react-hot-toast';

interface User {
  id: string;
  role: string;
  email: string;
  // Add other user properties as needed
}

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
    const token = localStorage.getItem('ra_token');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        // NOTE: In a real app, you'd verify the token's expiration (decodedToken.exp * 1000 > Date.now())
        setUser({
            id: decodedToken.id,
            role: decodedToken.role,
            email: decodedToken.email
        });
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem('ra_token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const { token } = await apiLogin(credentials);
      localStorage.setItem('ra_token', token);
      const decodedToken: any = jwtDecode(token);
      setUser({
        id: decodedToken.id,
        role: decodedToken.role,
        email: decodedToken.email
      });
      toast.success('Login successful!');
    } catch (error) {
      toast.error('Login failed. Please check your credentials.');
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ra_token');
    toast.success('Logged out successfully.');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
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
