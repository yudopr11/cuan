import axios from 'axios';
import axiosInstance from './axiosConfig';
import type { CustomAxiosRequestConfig } from './axiosConfig';
import toast from 'react-hot-toast';
import { encryptToken, decryptToken } from './encryption';

interface LoginResponse {
  access_token: string;
  token_type: string;
}

export const login = async (username: string, password: string): Promise<LoginResponse> => {
  try {
    // Create form data
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    // Make login request
    const response = await axiosInstance.post<LoginResponse>(
      '/auth/login',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        noAuth: true // Skip auth interceptor for login
      } as CustomAxiosRequestConfig // Use our custom type that includes noAuth
    );
    
    if (!response.data.access_token) {
      throw new Error('Invalid response from server');
    }
    
    // Encrypt token before storing
    const encryptedToken = encryptToken(response.data.access_token);
    localStorage.setItem('access_token', encryptedToken);
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Clear any existing token
      localStorage.removeItem('access_token');
      
      if (error.response?.status === 401) {
        throw new Error('Invalid username or password');
      } else if (error.response?.status === 422) {
        throw new Error(error.response.data?.detail || 'Validation error');
      }
      throw new Error(error.response?.data?.detail || 'Login failed');
    }
    throw new Error('Login failed');
  }
};

export const refreshToken = async (): Promise<LoginResponse> => {
  try {
    const response = await axiosInstance.post<LoginResponse>(
      '/auth/refresh',
      {},
      {
        withCredentials: true, // Important: needed to send cookies
      }
    );
    
    // Encrypt new token before storing
    const encryptedToken = encryptToken(response.data.access_token);
    localStorage.setItem('access_token', encryptedToken);
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.detail || 'Token refresh failed');
    }
    throw new Error('Token refresh failed');
  }
};

export const logout = async (isManualLogout = false) => {
  try {
    // Call logout endpoint to clear refresh token cookie
    await axiosInstance.post('/auth/logout', {}, {
      // No need to specify withCredentials here as it's set in axiosInstance
      // Skip auth interceptor to prevent token errors during logout
      noAuth: isManualLogout
    } as any); // Use type assertion for custom config
  } catch (error) {
    // Only show user-friendly message without exposing error details
    const errorMessage = axios.isAxiosError(error)
      ? error.response?.data?.detail || 'Failed to logout properly'
      : 'Failed to logout properly';
    
    // Only log in development
    if (import.meta.env.DEV) {
      console.error('Logout error:', error);
    }

    // Only show error toast if this is not a manual logout
    if (!isManualLogout) {
      toast.error(errorMessage, {
        duration: 5000,
        icon: '⚠️'
      });
    }
  } finally {
    // Always clear local storage token
    localStorage.removeItem('access_token');
  }
};

export const getToken = (): string | null => {
  const encryptedToken = localStorage.getItem('access_token');
  if (!encryptedToken) return null;
  
  // Decrypt token before returning
  return decryptToken(encryptedToken);
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
}; 