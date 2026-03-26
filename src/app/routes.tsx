import { createBrowserRouter, Navigate } from "react-router";
import { AdminLayout } from './components/AdminLayout';
import Map from "./pages/Map";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyTwoFactor from "./pages/VerifyTwoFactor";
import EdificiosManagement from "./pages/admin/EdificiosManagement";
import EventsManagement from "./pages/admin/EventsManagement";
import Analytics from "./pages/admin/Analytics";
import SalonesManagement from "./pages/admin/SalonesManagement";
import UsuariosManagement from "./pages/admin/UsuariosManagement";


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
    return <Navigate to="/" replace />;
  }

  if (adminOnly && !isAdmin()) {
    return <Navigate to="/map" replace />;
  }

  return <>{children}</>;
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/" replace />,
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
    path: "/map",
    element: (
      <ProtectedRoute>
        <Map />
      </ProtectedRoute>),
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
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);