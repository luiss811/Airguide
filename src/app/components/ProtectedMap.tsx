import { ProtectedRoute } from './ProtectedRoute';
import Map from '../pages/Map';

export function ProtectedMap() {
  return (
    <ProtectedRoute>
      <Map />
    </ProtectedRoute>
  );
}
