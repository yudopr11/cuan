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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0e1629] py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold text-[#30BDF2]">
          Cuan
        </h1>
        <p className="mt-2 text-sm text-gray-300">
          Catat Uang, Analisis, Nikmati!
        </p>
      </div>
      
      <div className="max-w-md w-full bg-[#111a2f] p-8 rounded-lg shadow-lg">
        <h2 className="text-xl text-white font-medium mb-6">
          Login to continue
        </h2>
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              className="appearance-none block w-full px-3 py-2 border border-gray-600 bg-gray-700 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-[#30BDF2] focus:border-[#30BDF2] focus:z-10 sm:text-sm"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                className="appearance-none block w-full px-3 py-2 border border-gray-600 bg-gray-700 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-[#30BDF2] focus:border-[#30BDF2] focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#30BDF2] hover:bg-[#2DAAE0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#30BDF2] disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Login'}
            </button>
          </div>
        </form>
      </div>
      
      <div className="hidden">
        <p className="mt-4 text-center text-sm text-gray-400">
          Cuan is <span className="font-bold">Catat Uang, Analisis, Nikmati!</span>
        </p>
      </div>
    </div>
  );
} 