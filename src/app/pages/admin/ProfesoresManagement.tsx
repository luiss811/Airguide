import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  X,
  Building2,
  Mail,
  Phone,
  Briefcase,
  MapPin
} from 'lucide-react';
import { useProfesores, useSalones } from '../../../hooks';

/**
 * Profesores Management
 * CRUD completo de profesores con asignación de cubículos
 */
export default function ProfesoresManagement() {
  const { 
    profesores, 
    loading, 
    createProfesor, 
    updateProfesor, 
    deleteProfesor 
  } = useProfesores();
  
  const { salones } = useSalones();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingProfesor, setEditingProfesor] = useState<any | null>(null);
  const [deletingProfesor, setDeletingProfesor] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    departamento: '',
    id_cubiculo: '',
    activo: true
  });
  const [formErrors, setFormErrors] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);

  // Filtrar solo cubículos (tipo: oficina)
  const cubiculos = salones.filter(s => s.tipo === 'oficina');

  // Filtrar profesores por búsqueda
  const profesoresFiltrados = profesores.filter(p =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.departamento?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (profesor?: any) => {
    if (profesor) {
      setEditingProfesor(profesor);
      setFormData({
        nombre: profesor.nombre,
        apellido: profesor.apellido,
        email: profesor.email,
        telefono: profesor.telefono || '',
        departamento: profesor.departamento || '',
        id_cubiculo: profesor.id_cubiculo?.toString() || '',
        activo: profesor.activo
      });
    } else {
      setEditingProfesor(null);
      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        departamento: '',
        id_cubiculo: '',
        activo: true
      });
    }
    setFormErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProfesor(null);
    setFormData({
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      departamento: '',
      id_cubiculo: '',
      activo: true
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors: any = {};
    
    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre es requerido';
    }
    
    if (!formData.apellido.trim()) {
      errors.apellido = 'El apellido es requerido';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'El email no es válido';
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    
    try {
      const data: any = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        email: formData.email.trim(),
        telefono: formData.telefono.trim() || null,
        departamento: formData.departamento.trim() || null,
        id_cubiculo: formData.id_cubiculo ? parseInt(formData.id_cubiculo) : null,
        activo: formData.activo
      };

      if (editingProfesor) {
        await updateProfesor(editingProfesor.id_profesor, data);
      } else {
        await createProfesor(data);
      }
      
      handleCloseModal();
    } catch (error: any) {
      setFormErrors({ submit: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingProfesor) return;
    
    setSubmitting(true);
    try {
      await deleteProfesor(deletingProfesor.id_profesor);
      setShowDeleteModal(false);
      setDeletingProfesor(null);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteModal = (profesor: any) => {
    setDeletingProfesor(profesor);
    setShowDeleteModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-[var(--app-blue)] border-t-transparent rounded-full animate-spin" />
          <span className="text-lg text-[var(--app-text-secondary)]">Cargando profesores...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--app-text-primary)]">
            Gestión de Profesores
          </h2>
          <p className="text-sm text-[var(--app-text-secondary)] mt-1">
            Administra los profesores y sus cubículos asignados
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--app-blue)] text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Agregar Profesor
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-[var(--app-card-bg)] border border-[var(--app-border)] rounded-lg p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--app-text-secondary)]" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o departamento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--app-hover)] border border-[var(--app-border)] rounded-lg text-[var(--app-text-primary)] placeholder-[var(--app-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--app-blue)]"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[var(--app-card-bg)] border border-[var(--app-border)] rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--app-text-primary)]">
                {profesores.length}
              </p>
              <p className="text-sm text-[var(--app-text-secondary)]">Total Profesores</p>
            </div>
          </div>
        </div>
        <div className="bg-[var(--app-card-bg)] border border-[var(--app-border)] rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <MapPin className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--app-text-primary)]">
                {profesores.filter(p => p.id_cubiculo).length}
              </p>
              <p className="text-sm text-[var(--app-text-secondary)]">Con Cubículo Asignado</p>
            </div>
          </div>
        </div>
        <div className="bg-[var(--app-card-bg)] border border-[var(--app-border)] rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Briefcase className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--app-text-primary)]">
                {profesores.filter(p => p.activo).length}
              </p>
              <p className="text-sm text-[var(--app-text-secondary)]">Profesores Activos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--app-card-bg)] border border-[var(--app-border)] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--app-hover)] border-b border-[var(--app-border)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--app-text-secondary)] uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--app-text-secondary)] uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--app-text-secondary)] uppercase tracking-wider">
                  Departamento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--app-text-secondary)] uppercase tracking-wider">
                  Cubículo
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
              {profesoresFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-[var(--app-text-secondary)]">
                    No se encontraron profesores
                  </td>
                </tr>
              ) : (
                profesoresFiltrados.map((profesor) => (
                  <tr key={profesor.id_profesor} className="hover:bg-[var(--app-hover)] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-10 h-10 bg-[var(--app-blue-light)] rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-[var(--app-blue)]">
                            {profesor.nombre.charAt(0)}{profesor.apellido.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-[var(--app-text-primary)]">
                            {profesor.nombre} {profesor.apellido}
                          </div>
                          {profesor.telefono && (
                            <div className="text-xs text-[var(--app-text-secondary)] flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {profesor.telefono}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-[var(--app-text-secondary)]">
                        <Mail className="w-4 h-4" />
                        {profesor.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[var(--app-text-primary)]">
                        {profesor.departamento || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {profesor.cubiculo ? (
                        <div className="text-sm">
                          <div className="flex items-center gap-1 text-[var(--app-text-primary)] font-medium">
                            <Building2 className="w-4 h-4" />
                            {profesor.cubiculo.nombre}
                          </div>
                          <div className="text-xs text-[var(--app-text-secondary)]">
                            {profesor.cubiculo.edificio?.nombre} - Piso {profesor.cubiculo.piso}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-[var(--app-text-secondary)]">Sin cubículo</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        profesor.activo
                          ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                          : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                      }`}>
                        {profesor.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenModal(profesor)}
                        className="text-[var(--app-blue)] hover:text-blue-600 mr-3"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(profesor)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Agregar/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--app-card-bg)] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[var(--app-border)]">
              <h3 className="text-xl font-bold text-[var(--app-text-primary)]">
                {editingProfesor ? 'Editar Profesor' : 'Agregar Nuevo Profesor'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)]"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formErrors.submit && (
                <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
                  {formErrors.submit}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--app-text-primary)] mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className={`w-full px-3 py-2 bg-[var(--app-hover)] border rounded-lg text-[var(--app-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--app-blue)] ${
                      formErrors.nombre ? 'border-red-500' : 'border-[var(--app-border)]'
                    }`}
                  />
                  {formErrors.nombre && (
                    <p className="mt-1 text-xs text-red-500">{formErrors.nombre}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--app-text-primary)] mb-2">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    value={formData.apellido}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                    className={`w-full px-3 py-2 bg-[var(--app-hover)] border rounded-lg text-[var(--app-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--app-blue)] ${
                      formErrors.apellido ? 'border-red-500' : 'border-[var(--app-border)]'
                    }`}
                  />
                  {formErrors.apellido && (
                    <p className="mt-1 text-xs text-red-500">{formErrors.apellido}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--app-text-primary)] mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-3 py-2 bg-[var(--app-hover)] border rounded-lg text-[var(--app-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--app-blue)] ${
                    formErrors.email ? 'border-red-500' : 'border-[var(--app-border)]'
                  }`}
                />
                {formErrors.email && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.email}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--app-text-primary)] mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full px-3 py-2 bg-[var(--app-hover)] border border-[var(--app-border)] rounded-lg text-[var(--app-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--app-blue)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--app-text-primary)] mb-2">
                    Departamento
                  </label>
                  <input
                    type="text"
                    value={formData.departamento}
                    onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                    className="w-full px-3 py-2 bg-[var(--app-hover)] border border-[var(--app-border)] rounded-lg text-[var(--app-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--app-blue)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--app-text-primary)] mb-2">
                  Cubículo Asignado
                </label>
                <select
                  value={formData.id_cubiculo}
                  onChange={(e) => setFormData({ ...formData, id_cubiculo: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--app-hover)] border border-[var(--app-border)] rounded-lg text-[var(--app-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--app-blue)]"
                >
                  <option value="">Sin cubículo asignado</option>
                  {cubiculos.map((cubiculo) => (
                    <option key={cubiculo.id_salon} value={cubiculo.id_salon}>
                      {cubiculo.nombre} - {cubiculo.edificio?.nombre} (Piso {cubiculo.piso})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="activo"
                  checked={formData.activo}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                  className="w-4 h-4 text-[var(--app-blue)] rounded focus:ring-2 focus:ring-[var(--app-blue)]"
                />
                <label htmlFor="activo" className="text-sm text-[var(--app-text-primary)]">
                  Profesor activo
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--app-border)]">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-[var(--app-border)] text-[var(--app-text-primary)] rounded-lg hover:bg-[var(--app-hover)] transition-colors"
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[var(--app-blue)] text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                  disabled={submitting}
                >
                  {submitting ? 'Guardando...' : editingProfesor ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {showDeleteModal && deletingProfesor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--app-card-bg)] rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-[var(--app-text-primary)] mb-4">
              Eliminar Profesor
            </h3>
            <p className="text-[var(--app-text-secondary)] mb-6">
              ¿Estás seguro de que deseas eliminar al profesor{' '}
              <strong className="text-[var(--app-text-primary)]">
                {deletingProfesor.nombre} {deletingProfesor.apellido}
              </strong>?
              Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingProfesor(null);
                }}
                className="px-4 py-2 border border-[var(--app-border)] text-[var(--app-text-primary)] rounded-lg hover:bg-[var(--app-hover)] transition-colors"
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                disabled={submitting}
              >
                {submitting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
