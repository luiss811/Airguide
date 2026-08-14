import { createBrowserRouter } from 'react-router';
import { ProtectedMap } from './components/ProtectedMap';
import { ProtectedAdminLayout } from './components/ProtectedAdminLayout';
import { ProtectedProfesorLayout } from './components/ProtectedProfesorLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Map from './pages/Map';
import AdminDashboard from './pages/admin/AdminDashboard';
import EventsManagement from './pages/admin/EventsManagement';
import EdificiosManagement from './pages/admin/EdificiosManagement';
import SalonesManagement from './pages/admin/SalonesManagement';
import Analytics from './pages/admin/Analytics';
import ProfesoresManagement from './pages/admin/ProfesoresManagement';
import UsuariosManagement from './pages/admin/UsuariosManagement';
import VerifyTwoFactor from './pages/VerifyTwoFactor';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import CubiculosManagement from './pages/admin/CubiculosManagement';
import EventConfirmation from './pages/EventConfirmation';
import Mercancia from './pages/Mercancia';
import ProductosManagement from './pages/admin/ProductosManagement';
import GestionProfesor from './pages/profesor/GestionProfesor';
import PerfilProfesor from './pages/profesor/PerfilProfesor';
import EventsManagementProfesor from './pages/profesor/EventsManagementProfesor';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Map, 
  },
  {
    path: '/mercancia',
    Component: Mercancia,
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
  {
    path:'verify-2fa',
    Component: VerifyTwoFactor
  },
  {
    path: 'forgot-password',
    Component: ForgotPassword
  },
  {
    path: 'reset-password',
    Component: ResetPassword
  },
  {
    path: "/eventos/:id/confirmar",
    Component: EventConfirmation
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
        path: 'productos',
        Component: ProductosManagement,
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
      },{
        path: 'cubiculos',
        Component: CubiculosManagement,
      },
      {
        path: 'profesores',
        Component: ProfesoresManagement,
      },
      {
        path: 'usuarios',
        Component: UsuariosManagement,
      },
      {
        path: 'analytics',
        Component: Analytics,
      },
    ]
  },
  {
    path: '/profesor',
    Component: ProtectedProfesorLayout,
    children: [
      {
        index: true,
        Component: GestionProfesor,
      },
      {
        path: 'gestion',
        Component: GestionProfesor,
      },
      {
        path: 'perfil',
        Component: PerfilProfesor,
      },
      {
        path: 'eventos',
        Component: EventsManagementProfesor,
      },
    ]
  },
  {
    path: '*',
    Component: Login,
  },
]);