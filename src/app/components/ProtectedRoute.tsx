import { Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

export function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { user, isAdmin } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin()) {
    return <Navigate to="/map" replace />;
  }

  return <>{children}</>;
}