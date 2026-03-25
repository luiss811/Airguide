import React, { useState } from 'react';
import { Plus, Edit, Trash2, Calendar, Building2, Search } from 'lucide-react';
import { useEventos, useEdificios } from '../../hooks';
import { toast } from 'sonner';

export default function EventsManagement() {
  const { eventos, loading, createEvento, updateEvento, deleteEvento, fetchEventos } = useEventos();
  const { edificios } = useEdificios();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingEvento, setEditingEvento] = useState<any>(null);
  const [deletingEvento, setDeletingEvento] = useState<any>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    id_edificio: '',
    publico: true,
    activo: true
  });

  const eventosFiltrados = eventos.filter(e =>
    e.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingEvento) {
        await updateEvento(editingEvento.id_evento, {
          ...formData,
          id_edificio: parseInt(formData.id_edificio)
        });
        toast.success('Evento actualizado correctamente');
      } else {
        await createEvento({
          ...formData,
          id_edificio: parseInt(formData.id_edificio)
        });
        toast.success('Evento creado correctamente');
      }

      setShowModal(false);
      resetForm();
      fetchEventos();
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar evento');
    }
  };

  const handleEdit = (evento: any) => {
    setEditingEvento(evento);
    setFormData({
      nombre: evento.nombre,
      descripcion: evento.descripcion || '',
      fecha_inicio: evento.fecha_inicio.split('T')[0],
      fecha_fin: evento.fecha_fin.split('T')[0],
      id_edificio: evento.id_edificio.toString(),
      publico: evento.publico,
      activo: evento.activo
    });
    setShowModal(true);
  };

  const handleDeleteClick = (evento: any) => {
    setDeletingEvento(evento);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingEvento) return;

    try {
      await deleteEvento(deletingEvento.id_evento);
      toast.success('Evento eliminado correctamente');
      setShowDeleteModal(false);
      setDeletingEvento(null);
      fetchEventos();
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar evento');
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      fecha_inicio: '',
      fecha_fin: '',
      id_edificio: '',
      publico: true,
      activo: true
    });
    setEditingEvento(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const isEventoActivo = (evento: any) => {
    const now = new Date();
    const inicio = new Date(evento.fecha_inicio);
    const fin = new Date(evento.fecha_fin);
    return now >= inicio && now <= fin && evento.activo;
  };

  const isEventoProximo = (evento: any) => {
    const now = new Date();
    const inicio = new Date(evento.fecha_inicio);
    return inicio > now && evento.activo;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[var(--app-text-primary)]">
            Gestión de Eventos
          </h2>
          <p className="text-sm text-[var(--app-text-secondary)] mt-1">
            Administra los eventos de la universidad
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--app-blue)] text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Nuevo Evento
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--app-text-secondary)]" />
          <input
            type="text"
            placeholder="Buscar eventos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--app-hover)] border border-[var(--app-border)] rounded-lg text-[var(--app-text-primary)] placeholder:text-[var(--app-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--app-blue)]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--app-card-bg)] border border-[var(--app-border)] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-[var(--app-hover)] border-b border-[var(--app-border)]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--app-text-secondary)] uppercase tracking-wider">
                Evento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--app-text-secondary)] uppercase tracking-wider">
                Ubicación
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--app-text-secondary)] uppercase tracking-wider">
                Fechas
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--app-text-secondary)] uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-[var(--app-text-secondary)] uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--app-border)]">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-[var(--app-blue)] border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-[var(--app-text-secondary)]">Cargando...</span>
                  </div>
                </td>
              </tr>
            ) : eventosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-[var(--app-text-secondary)]">
                  No se encontraron eventos
                </td>
              </tr>
            ) : (
              eventosFiltrados.map((evento) => (
                <tr key={evento.id_evento} className="hover:bg-[var(--app-hover)]">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <Calendar className="w-8 h-8 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[var(--app-text-primary)]">
                          {evento.nombre}
                        </div>
                        {evento.descripcion && (
                          <div className="text-xs text-[var(--app-text-secondary)] line-clamp-1">
                            {evento.descripcion}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[var(--app-blue)]" />
                      <span className="text-sm text-[var(--app-text-primary)]">
                        {evento.edificio?.nombre || 'Sin edificio'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-[var(--app-text-primary)]">
                      {new Date(evento.fecha_inicio).toLocaleDateString('es-MX', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                    <div className="text-xs text-[var(--app-text-secondary)]">
                      hasta {new Date(evento.fecha_fin).toLocaleDateString('es-MX', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {isEventoActivo(evento) ? (
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 w-fit">
                          En curso
                        </span>
                      ) : isEventoProximo(evento) ? (
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 w-fit">
                          Próximo
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 w-fit">
                          Finalizado
                        </span>
                      )}
                      {evento.publico && (
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 w-fit">
                          Público
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(evento)}
                        className="p-2 text-[var(--app-blue)] hover:bg-[var(--app-hover)] rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(evento)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Crear/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--app-card-bg)] rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[var(--app-border)]">
              <h3 className="text-xl font-bold text-[var(--app-text-primary)]">
                {editingEvento ? 'Editar Evento' : 'Nuevo Evento'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--app-text-primary)] mb-1">
                  Nombre del Evento *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--app-hover)] border border-[var(--app-border)] rounded-lg text-[var(--app-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--app-blue)]"
                  placeholder="Ej: Conferencia de Tecnología"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--app-text-primary)] mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--app-hover)] border border-[var(--app-border)] rounded-lg text-[var(--app-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--app-blue)]"
                  rows={3}
                  placeholder="Descripción del evento"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--app-text-primary)] mb-1">
                  Edificio *
                </label>
                <select
                  required
                  value={formData.id_edificio}
                  onChange={(e) => setFormData({ ...formData, id_edificio: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--app-hover)] border border-[var(--app-border)] rounded-lg text-[var(--app-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--app-blue)]"
                >
                  <option value="">Selecciona un edificio...</option>
                  {edificios.map((edificio) => (
                    <option key={edificio.id_edificio} value={edificio.id_edificio}>
                      {edificio.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--app-text-primary)] mb-1">
                    Fecha de Inicio *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.fecha_inicio}
                    onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                    className="w-full px-3 py-2 bg-[var(--app-hover)] border border-[var(--app-border)] rounded-lg text-[var(--app-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--app-blue)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--app-text-primary)] mb-1">
                    Fecha de Fin *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.fecha_fin}
                    onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                    className="w-full px-3 py-2 bg-[var(--app-hover)] border border-[var(--app-border)] rounded-lg text-[var(--app-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--app-blue)]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="publico"
                    checked={formData.publico}
                    onChange={(e) => setFormData({ ...formData, publico: e.target.checked })}
                    className="w-4 h-4 text-[var(--app-blue)] rounded"
                  />
                  <label htmlFor="publico" className="text-sm text-[var(--app-text-primary)]">
                    Evento público
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="activo"
                    checked={formData.activo}
                    onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                    className="w-4 h-4 text-[var(--app-blue)] rounded"
                  />
                  <label htmlFor="activo" className="text-sm text-[var(--app-text-primary)]">
                    Evento activo
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[var(--app-border)]">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 bg-[var(--app-hover)] text-[var(--app-text-primary)] rounded-lg hover:bg-opacity-80 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[var(--app-blue)] text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  {editingEvento ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {showDeleteModal && deletingEvento && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--app-card-bg)] rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--app-text-primary)]">
                    Eliminar Evento
                  </h3>
                  <p className="text-sm text-[var(--app-text-secondary)]">
                    Esta acción no se puede deshacer
                  </p>
                </div>
              </div>

              <p className="text-sm text-[var(--app-text-primary)] mb-6">
                ¿Estás seguro de que deseas eliminar el evento <strong>"{deletingEvento.nombre}"</strong>?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletingEvento(null);
                  }}
                  className="flex-1 px-4 py-2 bg-[var(--app-hover)] text-[var(--app-text-primary)] rounded-lg hover:bg-opacity-80 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
