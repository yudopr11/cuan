import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { logout } from '../../services/auth';

export default function LogoutHandler() {
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Logging out...</h2>
        <p className="text-gray-600">Please wait while we log you out.</p>
      </div>
    </div>
  );
} 