import { useNavigate } from 'react-router';
import {
  Building2,
  Calendar,
  BarChart3,
  Users,
  MapPin,
  Settings,
  Route,
  UserCheck,
  UserX,
  TrendingUp
} from 'lucide-react';
import { useAnalytics, useUsuarios } from '../../hooks';
import { useAuth } from '../../context/AuthContext';

export default function DashboardAdmin() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { dashboardStats, loading } = useAnalytics(true);
  const { usuariosPendientes, validarUsuario } = useUsuarios();

  if (user?.rol !== 'admin') {
    navigate('/');
    return null;
  }

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
      <div className="p-6 space-y-6">
        {/* Estadísticas Generales */}
        <div>
          <h2 className="text-lg font-semibold text-[var(--app-text-primary)] mb-4">
            Resumen General
          </h2>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-[var(--app-blue)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Usuarios */}
              <div className="bg-[var(--app-header-bg)] border border-[var(--app-border)] rounded-lg p-5">
                <div className="flex items-center justify-between mb-3">
                  <Users className="w-8 h-8 text-[var(--app-blue)]" />
                  <span className="text-xs text-[var(--app-text-secondary)]">Total</span>
                </div>
                <div className="text-3xl font-bold text-[var(--app-text-primary)] mb-1">
                  {dashboardStats?.usuarios.total || 0}
                </div>
                <div className="text-sm text-[var(--app-text-secondary)]">Usuarios</div>
                <div className="mt-3 flex gap-4 text-xs">
                  <span className="text-[var(--app-green)]">
                    ✓ {dashboardStats?.usuarios.activos || 0} activos
                  </span>
                  <span className="text-orange-500">
                    ⏳ {dashboardStats?.usuarios.pendientes || 0} pendientes
                  </span>
                </div>
              </div>

              {/* Edificios */}
              <div className="bg-[var(--app-header-bg)] border border-[var(--app-border)] rounded-lg p-5">
                <div className="flex items-center justify-between mb-3">
                  <Building2 className="w-8 h-8 text-purple-500" />
                  <span className="text-xs text-[var(--app-text-secondary)]">Total</span>
                </div>
                <div className="text-3xl font-bold text-[var(--app-text-primary)] mb-1">
                  {dashboardStats?.edificios.total || 0}
                </div>
                <div className="text-sm text-[var(--app-text-secondary)]">Edificios</div>
                <div className="mt-3 text-xs text-[var(--app-text-secondary)]">
                  {dashboardStats?.salones || 0} salones totales
                </div>
              </div>

              {/* Eventos */}
              <div className="bg-[var(--app-header-bg)] border border-[var(--app-border)] rounded-lg p-5">
                <div className="flex items-center justify-between mb-3">
                  <Calendar className="w-8 h-8 text-[var(--app-green)]" />
                  <span className="text-xs text-[var(--app-text-secondary)]">Total</span>
                </div>
                <div className="text-3xl font-bold text-[var(--app-text-primary)] mb-1">
                  {dashboardStats?.eventos.total || 0}
                </div>
                <div className="text-sm text-[var(--app-text-secondary)]">Eventos</div>
                <div className="mt-3 text-xs text-[var(--app-green)]">
                  ✓ {dashboardStats?.eventos.activos || 0} activos
                </div>
              </div>

              {/* Rutas */}
              <div className="bg-[var(--app-header-bg)] border border-[var(--app-border)] rounded-lg p-5">
                <div className="flex items-center justify-between mb-3">
                  <Route className="w-8 h-8 text-orange-500" />
                  <span className="text-xs text-[var(--app-text-secondary)]">Total</span>
                </div>
                <div className="text-3xl font-bold text-[var(--app-text-primary)] mb-1">
                  {dashboardStats?.rutas.total || 0}
                </div>
                <div className="text-sm text-[var(--app-text-secondary)]">Rutas</div>
                <div className="mt-3 text-xs text-[var(--app-green)]">
                  ✓ {dashboardStats?.rutas.activas || 0} activas
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Usuarios Pendientes de Validación */}
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

        {/* Accesos Rápidos */}
        <div>
          <h2 className="text-lg font-semibold text-[var(--app-text-primary)] mb-4">
            Gestión de Contenido
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/admin/edificios')}
              className="bg-[var(--app-header-bg)] border border-[var(--app-border)] rounded-lg p-6 hover:border-[var(--app-blue)] transition-colors text-left"
            >
              <Building2 className="w-8 h-8 text-purple-500 mb-3" />
              <h3 className="font-semibold text-[var(--app-text-primary)] mb-1">
                Edificios & Aulas
              </h3>
              <p className="text-sm text-[var(--app-text-secondary)]">
                Gestionar edificios, salones y cubículos
              </p>
            </button>

            <button
              onClick={() => navigate('/admin/eventos')}
              className="bg-[var(--app-header-bg)] border border-[var(--app-border)] rounded-lg p-6 hover:border-[var(--app-blue)] transition-colors text-left"
            >
              <Calendar className="w-8 h-8 text-[var(--app-green)] mb-3" />
              <h3 className="font-semibold text-[var(--app-text-primary)] mb-1">
                Eventos
              </h3>
              <p className="text-sm text-[var(--app-text-secondary)]">
                Crear y gestionar eventos universitarios
              </p>
            </button>

            <button
              onClick={() => navigate('/admin/usuarios')}
              className="bg-[var(--app-header-bg)] border border-[var(--app-border)] rounded-lg p-6 hover:border-[var(--app-blue)] transition-colors text-left"
            >
              <Users className="w-8 h-8 text-indigo-500 mb-3" />
              <h3 className="font-semibold text-[var(--app-text-primary)] mb-1">
                Usuarios
              </h3>
              <p className="text-sm text-[var(--app-text-secondary)]">
                Gestionar base de usuarios
              </p>
            </button>

            <button
              onClick={() => navigate('/admin/analytics')}
              className="bg-[var(--app-header-bg)] border border-[var(--app-border)] rounded-lg p-6 hover:border-[var(--app-blue)] transition-colors text-left"
            >
              <TrendingUp className="w-8 h-8 text-[var(--app-blue)] mb-3" />
              <h3 className="font-semibold text-[var(--app-text-primary)] mb-1">
                Analíticas
              </h3>
              <p className="text-sm text-[var(--app-text-secondary)]">
                Ver gráficas y estadísticas
              </p>
            </button>
          </div>
        </div>
      </div>
  );
}