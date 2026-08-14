import { createBrowserRouter, Navigate } from "react-router";
import { AdminLayout } from './components/AdminLayout';
import { ProtectedProfesorLayout } from './components/ProtectedProfesorLayout';
import Map from "./pages/Map";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyTwoFactor from "./pages/VerifyTwoFactor";
import EdificiosManagement from "./pages/admin/EdificiosManagement";
import EventsManagement from "./pages/admin/EventsManagement";
import Analytics from "./pages/admin/Analytics";
import ProfesoresManagement from './pages/admin/ProfesoresManagement';
import CubiculosManagement from './pages/admin/CubiculosManagement';
import SalonesManagement from "./pages/admin/SalonesManagement";
import UsuariosManagement from "./pages/admin/UsuariosManagement";
import EventConfirmation from "./pages/EventConfirmation";
import Mercancia from "./pages/Mercancia";
import ProductosManagement from "./pages/admin/ProductosManagement";
import GestionProfesor from "./pages/profesor/GestionProfesor";
import PerfilProfesor from "./pages/profesor/PerfilProfesor";
import EventsManagementProfesor from "./pages/profesor/EventsManagementProfesor";
import TicketVerification from "./pages/TicketVerification";


const isAuthenticated = () => {
  return localStorage.getItem("usuario") !== null;
};

const isAdmin = () => {
  const user = localStorage.getItem("usuario");
  if (!user) return false;
  const userData = JSON.parse(user);
  return userData.rol === "admin";
};

const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin()) {
    return <Navigate to="/map" replace />;
  }

  return <>{children}</>;
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/verify-2fa",
    element: <VerifyTwoFactor />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
  {
    path: "/map",
    element: (
      <ProtectedRoute>
        <Map />
      </ProtectedRoute>),
  },
  {
    path: "/eventos/:id/confirmar",
    element: <EventConfirmation />,
  },
  {
    path: "/mercancia",
    element: <Mercancia />,
  },
  {
    path: "/eventos/ticket/:id_invitado/verificar",
    element: <TicketVerification />,
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute adminOnly>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/admin/analytics" replace />,
      },
      {
        path: "productos",
        element: <ProductosManagement />,
      },
      {
        path: "edificios",
        element: <EdificiosManagement />,
      },
      {
        path: "events",
        element: <EventsManagement />,
      },
      {
        path: "analytics",
        element: <Analytics />,
      },
      {
        path: "profesores",
        element: <ProfesoresManagement />
      },
      {
        path: "cubiculos",
        element: <CubiculosManagement />
      },
      {
        path: "salones",
        element: <SalonesManagement />,
      },
      {
        path: "usuarios",
        element: <UsuariosManagement />,
      },
    ],
  },
  {
    path: "/profesor",
    element: <ProtectedProfesorLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/profesor/gestion" replace />,
      },
      {
        path: "gestion",
        element: <GestionProfesor />,
      },
      {
        path: "perfil",
        element: <PerfilProfesor />,
      },
      {
        path: "eventos",
        element: <EventsManagementProfesor />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
]);