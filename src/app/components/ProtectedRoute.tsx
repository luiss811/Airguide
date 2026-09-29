import { Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
  profesorOnly?: boolean;
}

export function ProtectedRoute({ children, adminOnly = false, profesorOnly = false }: ProtectedRouteProps) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.rol !== 'admin') {
    return <Navigate to="/map" replace />;
  }

  if (profesorOnly && user.rol !== 'profesor') {
    return <Navigate to="/map" replace />;
  }

  return <>{children}</>;
}