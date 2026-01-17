
import React, { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import { type LoginCredentials } from '../services/authService';
import { jwtDecode } from "jwt-decode";
import toast from 'react-hot-toast';

interface DecodedToken {
  id: string;
  role: string;
  email: string;
  exp?: number;
}

interface User {
  id: string;
  role: string;
  email: string;
  rank?: string;
  association?: string;
  exam_approved?: boolean;
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
        const decodedToken: DecodedToken = jwtDecode(token);
        // NOTE: In a real app, you'd verify the token's expiration (decodedToken.exp * 1000 > Date.now())
        setUser({ // eslint-disable-line react-hooks/set-state-in-effect
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
    // For now, always use demo mode to allow login with any credentials
    const mockUser: User = {
      id: '1',
      role: credentials.role,
      email: credentials.email || 'demo@example.com',
      rank: 'Candidate', // Default rank for demo users
      association: 'Ikeja Association', // Default association for demo users
      // Ambassadors start unapproved to show locked state in demo
      exam_approved: credentials.role !== 'ambassador',
    };

    const mockPayload = {
      id: mockUser.id,
      role: mockUser.role,
      email: mockUser.email,
      exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour expiration
    };

    try {
      // Create a mock JWT token that can be decoded by jwt-decode
      const mockToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify(mockPayload))}.mock-signature`;

      localStorage.setItem('ra_token', mockToken);
      setUser(mockUser);
      toast.success(`Logged in as ${credentials.role}`);
      return Promise.resolve();
    } catch (error) {
      console.error("Mock login failed:", error);
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
