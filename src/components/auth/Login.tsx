import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../services/axiosConfig';
import type { CustomAxiosRequestConfig } from '../../services/axiosConfig';
import usePageTitle from '../../hooks/usePageTitle';
import { encryptToken } from '../../services/encryption';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function Login() {
  usePageTitle('Login');
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast.error('Please enter both username and password');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create form data for login
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      
      // Configure options with noAuth flag
      const options: CustomAxiosRequestConfig = { noAuth: true };
      
      // Make login request using axiosInstance with correct endpoint
      const response = await axiosInstance.post('/auth/login', formData, options);
      
      // Encrypt and store token in localStorage
      const encryptedToken = encryptToken(response.data.access_token);
      localStorage.setItem('access_token', encryptedToken);
      
      // Redirect to dashboard
      navigate('/');
      toast.success('Login successful!');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsGuestLoading(true);
    
    try {
      const guestUsername = import.meta.env.VITE_GUEST_USERNAME;
      const guestPassword = import.meta.env.VITE_GUEST_PASSWORD;
      
      if (!guestUsername || !guestPassword) {
        throw new Error('Guest credentials not configured');
      }
      
      // Create form data for login
      const formData = new FormData();
      formData.append('username', guestUsername);
      formData.append('password', guestPassword);
      
      // Configure options with noAuth flag
      const options: CustomAxiosRequestConfig = { noAuth: true };
      
      // Make login request using axiosInstance with correct endpoint
      const response = await axiosInstance.post('/auth/login', formData, options);
      
      // Encrypt and store token in localStorage
      const encryptedToken = encryptToken(response.data.access_token);
      localStorage.setItem('access_token', encryptedToken);
      
      // Redirect to dashboard
      navigate('/');
      toast.success('Logged in as guest!');
    } catch (error) {
      console.error('Guest login error:', error);
      toast.error('Guest login failed. Please contact administrator.');
    } finally {
      setIsGuestLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 flex flex-col justify-center items-center px-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#30BDF2] mb-2">Cuan</h1>
          <p className="text-gray-400">Catat Uang, Analisis, Nikmati!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-lg p-6">
            <h2 className="text-xl text-white font-semibold mb-6">Login to continue</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-400 mb-1">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#30BDF2] focus:border-transparent"
                  placeholder="Enter your username"
                  required
                  disabled={isLoading || isGuestLoading}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#30BDF2] focus:border-transparent pr-10"
                    placeholder="Enter your password"
                    required
                    disabled={isLoading || isGuestLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200 transition-colors"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || isGuestLoading || !username || !password}
            className="w-full bg-[#30BDF2] hover:bg-[#2DAAE0] text-white py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-[#30BDF2] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
          
          <div className="flex items-center justify-center my-4">
            <div className="flex-grow h-px bg-gray-700"></div>
            <span className="px-4 text-sm text-gray-400">OR</span>
            <div className="flex-grow h-px bg-gray-700"></div>
          </div>
          
          <button
            type="button"
            onClick={handleGuestLogin}
            disabled={isGuestLoading || isLoading}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGuestLoading ? 'Logging in as guest...' : 'Continue as Guest'}
          </button>
          
        </form>
      </div>
    </div>
  );
} 