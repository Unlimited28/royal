import api from './api';
import { z } from 'zod';

// Define validation schemas for auth data
const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  role: z.enum(['ambassador', 'president', 'admin']),
  // Add other user fields as needed
});

const LoginResponseSchema = z.object({
  token: z.string(),
  user: UserSchema,
});

// Define types inferred from schemas
export type User = z.infer<typeof UserSchema>;
export type LoginCredentials = {
    email: string;
    password: string;
    role: string;
};

export type RegisterData = {
    email: string;
    password: string;
    role: string;
    // add more
};


/**
 * Logs in a user.
 * @param credentials - The user's email and role.
 * @returns A promise that resolves with the login response data.
 */
export const login = async (credentials: LoginCredentials) => {
  try {
    const response = await api.post('/auth/login.php', credentials);
    const validatedData = LoginResponseSchema.parse(response.data);

    // Store token and user data on successful login
    localStorage.setItem('authToken', validatedData.token);
    localStorage.setItem('user', JSON.stringify(validatedData.user));

    return validatedData;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

/**
 * Logs out the current user by clearing stored data.
 */
export const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  // The redirect will be handled by the component or context
};

/**
 * Retrieves the currently authenticated user from local storage.
 * @returns The user object or null if not found or invalid.
 */
export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    return null;
  }
  try {
    const userData = JSON.parse(userStr);
    return UserSchema.parse(userData);
  } catch (error) {
    console.error("Failed to parse user data from localStorage:", error);
    // Clear corrupted data
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    return null;
  }
};

/**
 * Registers a new user.
 * @param data - The registration data.
 * @returns A promise that resolves with the registration response.
 */
export const register = async (data: RegisterData) => {
  try {
    const response = await api.post('/auth/register.php', data);
    return response.data;
  } catch (error) {
    console.error("Registration failed:", error);
    throw error;
  }
};
