import { createBrowserRouter } from 'react-router';
import { ProtectedMap } from './components/ProtectedMap';
import { ProtectedAdminLayout } from './components/ProtectedAdminLayout';
import { RedirectToHome } from './components/RedirectToHome';
import Login from './pages/Login';
import Register from './pages/Register';
import Map from './pages/Map';
import AdminDashboard from './pages/admin/AdminDashboard';
import EventsManagement from './pages/admin/EventsManagement';
import EdificiosManagement from './pages/admin/EdificiosManagement';
import SalonesManagement from './pages/admin/SalonesManagement';
import Analytics from './pages/admin/Analytics';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Map, 
  },
  {
    path: '/login',
    Component: Login,
  },
  {
    path: '/register',
    Component: Register,
  },
  {
    path: '/map',
    Component: ProtectedMap
  },
  // Rutas de administrador
  {
    path: '/admin',
    Component: ProtectedAdminLayout,
    children: [
      {
        index: true,
        Component: AdminDashboard,
      },
      {
        path: 'edificios',
        Component: EdificiosManagement,
      },
      {
        path: 'events',
        Component: EventsManagement,
      },
      {
        path: 'salones',
        Component: SalonesManagement,
      },
      {
        path: 'analytics',
        Component: Analytics,
      },
    ]
  },
  {
    path: '*',
    Component: RedirectToHome,
  },
]);