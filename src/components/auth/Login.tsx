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
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);

      const options: CustomAxiosRequestConfig = { noAuth: true };
      const response = await axiosInstance.post('/auth/login', formData, options);

      const encryptedToken = encryptToken(response.data.access_token);
      localStorage.setItem('access_token', encryptedToken);

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

      const formData = new FormData();
      formData.append('username', guestUsername);
      formData.append('password', guestPassword);

      const options: CustomAxiosRequestConfig = { noAuth: true };
      const response = await axiosInstance.post('/auth/login', formData, options);

      const encryptedToken = encryptToken(response.data.access_token);
      localStorage.setItem('access_token', encryptedToken);

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
    <div className="min-h-screen flex flex-col justify-center items-center px-6 relative overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at 20% 50%, rgba(48, 189, 242, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(99, 102, 241, 0.07) 0%, transparent 50%), linear-gradient(135deg, #0b1120 0%, #0d1628 50%, #0b1120 100%)'
      }}
    >
      {/* Background grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{
              background: 'linear-gradient(135deg, rgba(48,189,242,0.2) 0%, rgba(48,189,242,0.05) 100%)',
              border: '1px solid rgba(48,189,242,0.3)',
              boxShadow: '0 0 30px rgba(48,189,242,0.15)'
            }}
          >
            <span className="text-2xl font-black text-[#30BDF2]">₡</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-1"
            style={{
              background: 'linear-gradient(135deg, #30BDF2 0%, #83e0ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Cuan
          </h1>
          <p className="text-gray-400 text-sm tracking-wide">Catat Uang, Analisis, Nikmati!</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-6 mb-4"
          style={{
            background: 'linear-gradient(135deg, rgba(22,30,46,0.9) 0%, rgba(17,24,39,0.95) 100%)',
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(48,189,242,0.06)',
            backdropFilter: 'blur(20px)'
          }}
        >
          <h2 className="text-lg font-semibold text-white mb-6">Sign in to continue</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#30BDF2]/40 transition-all"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
                placeholder="Enter your username"
                required
                disabled={isLoading || isGuestLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#30BDF2]/40 transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                  placeholder="Enter your password"
                  required
                  disabled={isLoading || isGuestLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || isGuestLoading || !username || !password}
              className="w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-200 mt-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              style={{
                background: 'linear-gradient(135deg, #30BDF2 0%, #2DAAE0 100%)',
                boxShadow: '0 4px 15px rgba(48, 189, 242, 0.3)',
              }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 h-px bg-gray-800" />
          <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">or</span>
          <div className="flex-1 h-px bg-gray-800" />
        </div>

        {/* Guest button */}
        <button
          type="button"
          onClick={handleGuestLogin}
          disabled={isGuestLoading || isLoading}
          className="w-full py-3 px-4 rounded-xl font-medium text-gray-300 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {isGuestLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 rounded-full border-2 border-gray-400/30 border-t-gray-400 animate-spin" />
              Logging in as guest...
            </span>
          ) : 'Continue as Guest'}
        </button>
      </div>
    </div>
  );
}
