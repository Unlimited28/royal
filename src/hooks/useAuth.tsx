// src/hooks/useAuth.tsx
import { useState } from 'react';

type UserRole = 'ambassador' | 'association_president' | 'super_admin' | 'public';

interface User {
  role: UserRole;
  // Add other user properties here if needed
  name: string;
}

// This is a mock implementation of the useAuth hook.
// In a real application, this would be connected to an authentication context.
export const useAuth = () => {
  const [user, setUser] = useState<User | null>({
    // Change this role to test different user types
    // Options: 'ambassador', 'association_president', 'super_admin', 'public'
    role: 'super_admin',
    name: 'Jules'
  });

  const logout = () => {
    setUser(null)
  }

  return { user, logout };
};
