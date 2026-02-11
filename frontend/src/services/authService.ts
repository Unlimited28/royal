import api from './api';
import { z } from 'zod';

// Define validation schemas for auth data
const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  userCode: z.string(),
  rank: z.string(),
  roles: z.array(z.string()).optional(),
  role: z.string().optional(), // Fallback for some frontend parts
});

const LoginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: UserSchema,
});

// Define types inferred from schemas
export type User = z.infer<typeof UserSchema>;
export type LoginCredentials = {
    email: string;
    password: string;
    passcode?: string;
    role?: string;
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
    const { role, ...payload } = credentials;
    const response = await api.post('/auth/login', payload);
    const validatedData = LoginResponseSchema.parse(response.data);

    // Store tokens and user data on successful login
    localStorage.setItem('ra_access_token', validatedData.accessToken);
    localStorage.setItem('ra_refresh_token', validatedData.refreshToken);
    localStorage.setItem('ra_user', JSON.stringify(validatedData.user));

    return validatedData;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

/**
 * Logs out the current user by clearing stored data.
 */
export const logout = async () => {
  try {
    const refreshToken = localStorage.getItem('ra_refresh_token');
    await api.post('/auth/logout', { refreshToken });
  } catch (error) {
    console.error("Logout API call failed:", error);
  } finally {
    localStorage.removeItem('ra_access_token');
    localStorage.removeItem('ra_refresh_token');
    localStorage.removeItem('ra_user');
  }
};

/**
 * Retrieves the currently authenticated user from local storage.
 * @returns The user object or null if not found or invalid.
 */
export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('ra_user');
  if (!userStr) {
    return null;
  }
  try {
    const userData = JSON.parse(userStr);
    return UserSchema.parse(userData);
  } catch (error) {
    console.error("Failed to parse user data from localStorage:", error);
    // Clear corrupted data
    localStorage.removeItem('ra_user');
    localStorage.removeItem('ra_access_token');
    localStorage.removeItem('ra_refresh_token');
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
    console.log('Sending registration request...', data.email);
    const response = await api.post('/auth/register', data);
    console.log('Received registration response:', response.status);
    const validatedData = LoginResponseSchema.parse(response.data);

    localStorage.setItem('ra_access_token', validatedData.accessToken);
    localStorage.setItem('ra_refresh_token', validatedData.refreshToken);
    localStorage.setItem('ra_user', JSON.stringify(validatedData.user));

    return validatedData;
  } catch (error) {
    console.error("Registration failed:", error);
    throw error;
  }
};

export const getMe = async () => {
  try {
    const response = await api.get('/auth/me');
    const user = UserSchema.parse(response.data);
    localStorage.setItem('ra_user', JSON.stringify(user));
    return user;
  } catch (error) {
    console.error("Failed to fetch user profile:", error);
    throw error;
  }
};
