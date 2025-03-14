import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { logout } from '../../services/auth';
import usePageTitle from '../../hooks/usePageTitle';

export default function LogoutHandler() {
  usePageTitle('Logout');
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Use the logout function from auth service
        await logout(true);
        
        // Show success message
        toast.success('Successfully logged out');
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        // Redirect to login page
        navigate('/login');
      }
    };

    performLogout();
  }, [navigate]);

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
      
      <div className="max-w-md w-full bg-[#111a2f] p-8 rounded-lg shadow-lg text-center">
        <div className="animate-pulse">
          <h2 className="text-xl text-white font-medium mb-3">
            Logging out...
          </h2>
          <p className="text-gray-300 text-sm">
            Please wait while we log you out of your account.
          </p>
        </div>
      </div>
    </div>
  );
} 