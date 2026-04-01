import React from 'react';
import { useNavigate } from 'react-router';
import { LayoutDashboard, Building2, Calendar, BarChart3, Users, Moon, Sun, Settings, UserCheck, UserX } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useAnalytics, useUsuarios } from '../../hooks';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { dashboardStats, loading } = useAnalytics(true);
  const { usuariosPendientes, validarUsuario } = useUsuarios();

  if (user?.rol !== 'admin') {
    navigate('/');
    return null;
  }

  const quickActions = [
    {
      title: 'Edificios',
      description: 'Gestionar edificios y ubicaciones',
      icon: Building2,
      color: 'bg-blue-500',
      path: '/admin/edificios',
      count: dashboardStats?.edificios.total || 0
    },
    {
      title: 'Eventos',
      description: 'Administrar eventos de la universidad',
      icon: Calendar,
      color: 'bg-green-500',
      path: '/admin/events',
      count: dashboardStats?.eventos.total || 0
    },
    {
      title: 'Analytics',
      description: 'Ver estadísticas y reportes',
      icon: BarChart3,
      color: 'bg-purple-500',
      path: '/admin/analytics',
      count: dashboardStats?.totalAccesos || 0
    },
    {
      title: 'Salones',
      description: 'Gestionar salones dentro de edificios',
      icon: Settings,
      color: 'bg-orange-500',
      path: '/admin/salones',
      count: dashboardStats?.salones || 0
    }
  ];

  const handleValidarUsuario = async (id: number, estado: 'activo' | 'rechazado') => {
    if (!confirm(`¿Confirmar ${estado === 'activo' ? 'aprobación' : 'rechazo'} del usuario?`)) {
      return;
    }
    try {
      await validarUsuario(id, estado);
      alert(`Usuario ${estado === 'activo' ? 'aprobado' : 'rechazado'} exitosamente`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--app-background)]">
      {/* Header */}
      <header className="bg-[var(--app-header-bg)] border-b border-[var(--app-border)] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-6 h-6 text-[var(--app-blue)]" />
            <h1 className="text-2xl font-bold text-[var(--app-text-primary)]">
              Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-[var(--app-hover)] rounded-lg">
              <Users className="w-4 h-4 text-[var(--app-text-secondary)]" />
              <span className="text-sm text-[var(--app-text-primary)]">{user?.nombre}</span>
              <span className="text-xs text-[var(--app-text-secondary)] bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-full">
                Admin
              </span>
            </div>
            <button
              onClick={() => navigate('/mapa')}
              className="px-4 py-2 bg-[var(--app-blue)] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Ver Mapa
            </button>
            <button
              onClick={toggleTheme}
              className="px-4 py-2 bg-[var(--app-blue)] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--app-text-primary)]">
              Usuarios Pendientes de Validación
            </h2>
            <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full">
              {usuariosPendientes.length} pendientes
            </span>
          </div>

          {usuariosPendientes.length === 0 ? (
            <div className="bg-[var(--app-header-bg)] border border-[var(--app-border)] rounded-lg p-8 text-center">
              <UserCheck className="w-12 h-12 text-[var(--app-green)] mx-auto mb-3" />
              <p className="text-[var(--app-text-secondary)]">
                No hay usuarios pendientes de validación
              </p>
            </div>
          ) : (
            <div className="bg-[var(--app-header-bg)] border border-[var(--app-border)] rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[var(--app-hover)] border-b border-[var(--app-border)]">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-[var(--app-text-secondary)] uppercase">
                        Nombre
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-[var(--app-text-secondary)] uppercase">
                        Correo
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-[var(--app-text-secondary)] uppercase">
                        Matrícula
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-[var(--app-text-secondary)] uppercase">
                        Fecha Registro
                      </th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-[var(--app-text-secondary)] uppercase">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--app-border)]">
                    {usuariosPendientes.map((usuario) => (
                      <tr key={usuario.id_usuario} className="hover:bg-[var(--app-hover)] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[var(--app-blue-light)] flex items-center justify-center">
                              <span className="text-sm font-medium text-[var(--app-blue)]">
                                {usuario.nombre.charAt(0)}
                              </span>
                            </div>
                            <span className="text-sm font-medium text-[var(--app-text-primary)]">
                              {usuario.nombre}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-[var(--app-text-secondary)]">
                          {usuario.correo}
                        </td>
                        <td className="px-6 py-4 text-sm text-[var(--app-text-secondary)]">
                          {usuario.matricula || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-[var(--app-text-secondary)]">
                          {new Date(usuario.fecha_registro).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleValidarUsuario(usuario.id_usuario, 'activo')}
                              className="flex items-center gap-1 px-3 py-1.5 bg-[var(--app-green)] text-white text-sm rounded hover:opacity-90 transition-opacity"
                            >
                              <UserCheck className="w-4 h-4" />
                              Aprobar
                            </button>
                            <button
                              onClick={() => handleValidarUsuario(usuario.id_usuario, 'rechazado')}
                              className="flex items-center gap-1 px-3 py-1.5 bg-[var(--app-red)] text-white text-sm rounded hover:opacity-90 transition-opacity"
                            >
                              <UserX className="w-4 h-4" />
                              Rechazar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-[var(--app-card-bg)] border border-[var(--app-border)] rounded-lg p-6 animate-pulse">
                <div className="h-12 bg-[var(--app-hover)] rounded mb-4" />
                <div className="h-8 bg-[var(--app-hover)] rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-[var(--app-text-primary)] mb-6">
            Acciones Rápidas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => navigate(action.path)}
                className="bg-[var(--app-card-bg)] border border-[var(--app-border)] rounded-lg p-6 hover:shadow-lg hover:scale-105 transition-all text-left group"
              >
                <div className={`${action.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-[var(--app-text-primary)] mb-2">
                  {action.title}
                </h4>
                <p className="text-sm text-[var(--app-text-secondary)] mb-3">
                  {action.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--app-text-secondary)]">
                    Total: <strong className="text-[var(--app-text-primary)]">{action.count}</strong>
                  </span>
                  <span className="text-[var(--app-blue)] group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
