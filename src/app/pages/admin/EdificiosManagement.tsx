import React, { useState } from 'react';
import { Plus, Edit, Trash2, Building2, MapPin, Search } from 'lucide-react';
import { useEdificios } from '../../hooks';
import { toast } from 'sonner';

export default function EdificiosManagement() {
  const { edificios, loading, createEdificio, updateEdificio, deleteEdificio, fetchEdificios } = useEdificios();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEdificio, setEditingEdificio] = useState<any>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    latitud: '',
    longitud: '',
    tipo: 'academico' as 'academico' | 'administrativo' | 'recreativo',
    activo: true
  });

  const edificiosFiltrados = edificios.filter(e =>
    e.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingEdificio) {
        await updateEdificio(editingEdificio.id_edificio, {
          ...formData,
          latitud: parseFloat(formData.latitud),
          longitud: parseFloat(formData.longitud)
        });
        toast.success('Edificio actualizado correctamente');
      } else {
        await createEdificio({
          ...formData,
          latitud: parseFloat(formData.latitud),
          longitud: parseFloat(formData.longitud)
        });
        toast.success('Edificio creado correctamente');
      }

      setShowModal(false);
      resetForm();
      fetchEdificios();
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar edificio');
    }
  };

  const handleEdit = (edificio: any) => {
    setEditingEdificio(edificio);
    setFormData({
      nombre: edificio.nombre,
      descripcion: edificio.descripcion || '',
      latitud: edificio.latitud.toString(),
      longitud: edificio.longitud.toString(),
      tipo: edificio.tipo,
      activo: edificio.activo
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number, nombre: string) => {
    if (!confirm(`¿Estás seguro de eliminar el edificio "${nombre}"?`)) return;

    try {
      await deleteEdificio(id);
      toast.success('Edificio eliminado correctamente');
      fetchEdificios();
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar edificio');
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      latitud: '',
      longitud: '',
      tipo: 'academico',
      activo: true
    });
    setEditingEdificio(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[var(--app-text-primary)]">
            Gestión de Edificios
          </h2>
          <p className="text-sm text-[var(--app-text-secondary)] mt-1">
            Administra los edificios de la universidad
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--app-blue)] text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Nuevo Edificio
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--app-text-secondary)]" />
          <input
            type="text"
            placeholder="Buscar edificios..."
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
                Edificio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--app-text-secondary)] uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--app-text-secondary)] uppercase tracking-wider">
                Ubicación
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
            ) : edificiosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-[var(--app-text-secondary)]">
                  No se encontraron edificios
                </td>
              </tr>
            ) : (
              edificiosFiltrados.map((edificio) => (
                <tr key={edificio.id_edificio} className="hover:bg-[var(--app-hover)]">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <Building2 className="w-8 h-8 text-[var(--app-blue)]" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[var(--app-text-primary)]">
                          {edificio.nombre}
                        </div>
                        {edificio.descripcion && (
                          <div className="text-xs text-[var(--app-text-secondary)]">
                            {edificio.descripcion}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-[var(--app-blue-light)] text-[var(--app-blue)]">
                      {edificio.tipo}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm text-[var(--app-text-secondary)]">
                      <MapPin className="w-3 h-3" />
                      {edificio.latitud}, {edificio.longitud}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${edificio.activo
                      ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                      : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                      }`}>
                      {edificio.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(edificio)}
                        className="p-2 text-[var(--app-blue)] hover:bg-[var(--app-hover)] rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(edificio.id_edificio, edificio.nombre)}
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--app-card-bg)] rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[var(--app-border)]">
              <h3 className="text-xl font-bold text-[var(--app-text-primary)]">
                {editingEdificio ? 'Editar Edificio' : 'Nuevo Edificio'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--app-text-primary)] mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--app-hover)] border border-[var(--app-border)] rounded-lg text-[var(--app-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--app-blue)]"
                  placeholder="Ej: Edificio Central"
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
                  placeholder="Descripción del edificio"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--app-text-primary)] mb-1">
                    Latitud *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.latitud}
                    onChange={(e) => setFormData({ ...formData, latitud: e.target.value })}
                    className="w-full px-3 py-2 bg-[var(--app-hover)] border border-[var(--app-border)] rounded-lg text-[var(--app-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--app-blue)]"
                    placeholder="25.6866"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--app-text-primary)] mb-1">
                    Longitud *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.longitud}
                    onChange={(e) => setFormData({ ...formData, longitud: e.target.value })}
                    className="w-full px-3 py-2 bg-[var(--app-hover)] border border-[var(--app-border)] rounded-lg text-[var(--app-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--app-blue)]"
                    placeholder="-100.3161"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--app-text-primary)] mb-1">
                  Tipo *
                </label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
                  className="w-full px-3 py-2 bg-[var(--app-hover)] border border-[var(--app-border)] rounded-lg text-[var(--app-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--app-blue)]"
                >
                  <option value="academico">Académico</option>
                  <option value="administrativo">Administrativo</option>
                  <option value="recreativo">Recreativo</option>
                </select>
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
                  Edificio activo
                </label>
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
                  {editingEdificio ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
