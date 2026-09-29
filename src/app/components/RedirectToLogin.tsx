import { Navigate } from 'react-router';

export function RedirectToLogin() {
  return <Navigate to="/login" replace />;
}
