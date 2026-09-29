import { ProtectedRoute } from './ProtectedRoute';
import { ProfesorLayout } from './ProfesorLayout';

export function ProtectedProfesorLayout() {
  return (
    <ProtectedRoute profesorOnly>
      <ProfesorLayout />
    </ProtectedRoute>
  );
}
