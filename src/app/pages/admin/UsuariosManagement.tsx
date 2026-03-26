import { useState } from 'react';
import {
  Users,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  User
} from 'lucide-react';
import { useUsuarios } from '../../hooks';
import { toast } from 'sonner';

export default function UsuariosManagement() {
  const { usuarios, loading, validarUsuario } = useUsuarios();
  const [searchTerm, setSearchTerm] = useState('');

  const usuariosFiltrados = usuarios.filter(u =>
    u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.matricula.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleValidar = async (id: number, nuevoEstado: 'activo' | 'rechazado') => {
    try {
      await validarUsuario(id, nuevoEstado);
      toast.success(`Usuario ${nuevoEstado === 'activo' ? 'aprobado' : 'rechazado'} correctamente`);
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar estado del usuario');
    }
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'activo':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
            <CheckCircle className="w-3 h-3" />
            Activo
          </span>
        );
      case 'rechazado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300">
            <XCircle className="w-3 h-3" />
            Rechazado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300">
            <Clock className="w-3 h-3" />
            Pendiente
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[var(--app-text-primary)]">Usuarios</h2>
          <p className="text-[var(--app-text-secondary)]">Gestiona los accesos y estado de los usuarios</p>
        </div>
      </div>

      <div className="bg-[var(--app-card-bg)] rounded-xl shadow-sm border border-[var(--app-border)] overflow-hidden">
        {/* Header Controls */}
        <div className="p-4 border-b border-[var(--app-border)] flex gap-4 bg-[var(--app-hover)]">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--app-text-secondary)]" />
            <input
              type="text"
              placeholder="Buscar por nombre, correo o matrícula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[var(--app-card-bg)] border border-[var(--app-border)] rounded-lg text-[var(--app-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--app-blue)] transition-shadow"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[var(--app-hover)] border-b border-[var(--app-border)]">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-[var(--app-text-secondary)] uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-[var(--app-text-secondary)] uppercase tracking-wider">
                  Matrícula/Nómina
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-[var(--app-text-secondary)] uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-[var(--app-text-secondary)] uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-[var(--app-text-secondary)] uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--app-border)]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[var(--app-text-secondary)]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--app-blue)] mx-auto mb-4"></div>
                    Cargando usuarios...
                  </td>
                </tr>
              ) : usuariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[var(--app-text-secondary)]">
                    <div className="flex flex-col items-center justify-center">
                      <Users className="w-12 h-12 text-[var(--app-text-secondary)] opacity-50 mb-4" />
                      <p>No se encontraron usuarios</p>
                    </div>
                  </td>
                </tr>
              ) : (
                usuariosFiltrados.map((usuario) => (
                  <tr key={usuario.id_usuario} className="hover:bg-[var(--app-hover)] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--app-blue-light)] flex items-center justify-center text-[var(--app-blue)] font-bold">
                          {usuario.nombre.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-[var(--app-text-primary)]">
                            {usuario.nombre}
                          </div>
                          <div className="text-sm text-[var(--app-text-secondary)]">
                            {usuario.correo}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[var(--app-text-primary)]">
                      {usuario.matricula}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-sm text-[var(--app-text-secondary)] capitalize">
                        {usuario.rol === 'admin' ? <Shield className="w-4 h-4 text-purple-500" /> : <User className="w-4 h-4 text-slate-500" />}
                        {usuario.rol}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(usuario.estado)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {usuario.estado === 'pendiente' && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleValidar(usuario.id_usuario, 'activo')}
                            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-950 rounded-lg transition-colors"
                            title="Aprobar"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleValidar(usuario.id_usuario, 'rechazado')}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors"
                            title="Rechazar"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                      {usuario.estado === 'activo' && usuario.rol !== 'admin' && (
                        <button
                          onClick={() => handleValidar(usuario.id_usuario, 'rechazado')}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors"
                          title="Revocar acceso"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      )}
                      {usuario.estado === 'rechazado' && (
                        <button
                          onClick={() => handleValidar(usuario.id_usuario, 'activo')}
                          className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-950 rounded-lg transition-colors"
                          title="Reactivar acceso"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
