import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: 'admin' | 'client';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const { user, loading, isAdmin, isClient } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Handle Admin protection
  if (role === 'admin') {
    // If not logged in as admin, redirect to admin login
    if (!user || !isAdmin) {
      // Check for legacy token as fallback during migration
      const legacyAdminToken = localStorage.getItem('adminToken');
      if (!legacyAdminToken) {
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
      }
    }
  }

  // Handle Client protection
  if (role === 'client') {
    // If not logged in as client, redirect to landing or identify
    const legacyClientToken = localStorage.getItem('clientToken');
    if (!user && !legacyClientToken) {
      return <Navigate to="/" state={{ from: location }} replace />;
    }
  }

  return <>{children}</>;
};
