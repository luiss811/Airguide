import React, { useState } from 'react';
import { Plus, Edit, Trash2, DoorOpen, Building2, Search, User } from 'lucide-react';
import { useCubiculos, useEdificios, useProfesores } from '../../hooks';
import { toast } from 'sonner';

export default function CubiculosManagement() {
    const { cubiculos, loading, createCubiculo, updateCubiculo, deleteCubiculo, fetchCubiculos } = useCubiculos();
    const { edificios } = useEdificios();
    const { profesores } = useProfesores();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editingCubiculo, setEditingCubiculo] = useState<any>(null);
    const [deletingCubiculo, setDeletingCubiculo] = useState<any>(null);
    const [formData, setFormData] = useState({
        numero: '',
        piso: '',
        id_edificio: '',
        id_profesor: '',
        referencia: '',
        activo: true
    });

    const cubiculosFiltrados = cubiculos.filter(c =>
        (c.numero || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.edificio?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.profesor?.usuario?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderTableBody = () => {
        if (loading) {
            return (
                <tr>
                    <td colSpan={6} className="px-6 py-8 text-center">
                        <div className="flex items-center justify-center gap-3">
                            <div className="w-5 h-5 border-2 border-[var(--app-blue)] border-t-transparent rounded-full animate-spin" />
                            <span className="text-sm text-[var(--app-text-secondary)]">Cargando...</span>
                        </div>
                    </td>
                </tr>
            );
        }

        if (cubiculosFiltrados.length === 0) {
            return (
                <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-[var(--app-text-secondary)]">
                        No se encontraron cubículos
                    </td>
                </tr>
            );
        }

        return cubiculosFiltrados.map((cubiculo) => (
            <tr key={cubiculo.id_cubiculo} className="hover:bg-[var(--app-hover)]">
                <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                            <DoorOpen className="w-8 h-8 text-[var(--app-blue)]" />
                        </div>
                        <div>
                            <div className="text-sm font-medium text-[var(--app-text-primary)]">
                                Cubículo {cubiculo.numero}
                            </div>
                            <div className="text-xs text-[var(--app-text-secondary)]">
                                Piso {cubiculo.piso}
                            </div>
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[var(--app-blue)]" />
                        <span className="text-sm text-[var(--app-text-primary)]">
                            {cubiculo.edificio?.nombre || 'Sin edificio'}
                        </span>
                    </div>
                </td>
                <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-sm text-[var(--app-text-primary)]">
                            {cubiculo.profesor?.usuario?.nombre || 'Sin asignar'}
                        </span>
                    </div>
                </td>
                <td className="px-6 py-4">
                    <span className="text-sm text-[var(--app-text-secondary)] max-w-[200px] line-clamp-1 block" title={cubiculo.referencia}>
                        {cubiculo.referencia || 'Sin referencias'}
                    </span>
                </td>
                <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${cubiculo.activo
                        ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                        : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                        }`}>
                        {cubiculo.activo ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                        <button
                            onClick={() => handleEdit(cubiculo)}
                            className="p-2 text-[var(--app-blue)] hover:bg-[var(--app-hover)] rounded-lg transition-colors"
                            title="Editar"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handleDeleteClick(cubiculo)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors"
                            title="Eliminar"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </td>
            </tr>
        ));
    };

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const data = {
                numero: formData.numero,
                piso: Number.parseInt(formData.piso),
                id_edificio: Number.parseInt(formData.id_edificio),
                id_profesor: Number.parseInt(formData.id_profesor),
                referencia: formData.referencia,
                activo: formData.activo
            };

            if (editingCubiculo) {
                await updateCubiculo(editingCubiculo.id_cubiculo, data);
                toast.success('Cubículo actualizado correctamente');
            } else {
                await createCubiculo(data);
                toast.success('Cubículo creado correctamente');
            }

            setShowModal(false);
            resetForm();
            fetchCubiculos();
        } catch (error: any) {
            toast.error(error.message || 'Error al guardar cubículo');
        }
    };

    const handleEdit = (cubiculo: any) => {
        setEditingCubiculo(cubiculo);
        setFormData({
            numero: cubiculo.numero,
            piso: cubiculo.piso.toString(),
            id_edificio: cubiculo.id_edificio.toString(),
            id_profesor: cubiculo.id_profesor.toString(),
            referencia: cubiculo.referencia || '',
            activo: cubiculo.activo
        });
        setShowModal(true);
    };

    const handleDeleteClick = (cubiculo: any) => {
        setDeletingCubiculo(cubiculo);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!deletingCubiculo) return;

        try {
            await deleteCubiculo(deletingCubiculo.id_cubiculo);
            toast.success('Cubículo eliminado correctamente');
            setShowDeleteModal(false);
            setDeletingCubiculo(null);
            fetchCubiculos();
        } catch (error: any) {
            toast.error(error.message || 'Error al eliminar cubículo');
        }
    };

    const resetForm = () => {
        setFormData({
            numero: '',
            piso: '',
            id_edificio: '',
            id_profesor: '',
            referencia: '',
            activo: true
        });
        setEditingCubiculo(null);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        resetForm();
    };

    return (
        <div className='min-h-screen bg-[var(--app-background)] p-6'>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-[var(--app-text-primary)]">
                        Gestión de Cubículos
                    </h2>
                    <p className="text-sm text-[var(--app-text-secondary)] mt-1">
                        Administra los cubículos designados a profesores
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--app-blue)] text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                    <Plus className="w-4 h-4" />
                    Nuevo Cubículo
                </button>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--app-text-secondary)]" />
                    <input
                        type="text"
                        placeholder="Buscar por número, edificio o profesor..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-[var(--app-hover)] border border-[var(--app-border)] rounded-lg text-[var(--app-text-primary)] placeholder:text-[var(--app-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--app-blue)]"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-[var(--app-card-bg)] border border-[var(--app-border)] rounded-lg overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-[var(--app-hover)] border-b border-[var(--app-border)]">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--app-text-secondary)] uppercase tracking-wider">
                                Cubículo
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--app-text-secondary)] uppercase tracking-wider">
                                Profesor Asociado
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--app-text-secondary)] uppercase tracking-wider">
                                Edificio
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--app-text-secondary)] uppercase tracking-wider">
                                Piso
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
                        {renderTableBody()}
                    </tbody>
                </table>
            </div>

            {/* Modal Crear/Editar */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-[var(--app-card-bg)] rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-[var(--app-border)]">
                            <h3 className="text-xl font-bold text-[var(--app-text-primary)]">
                                {editingCubiculo ? 'Editar Cubículo' : 'Nuevo Cubículo'}
                            </h3>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="numero" className="block text-sm font-medium text-[var(--app-text-primary)] mb-1">
                                        Número de Cubículo
                                    </label>
                                    <input
                                        type="text"
                                        id="numero"
                                        required
                                        value={formData.numero}
                                        onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                                        className="w-full px-3 py-2 bg-[var(--app-hover)] border border-[var(--app-border)] rounded-lg text-[var(--app-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--app-blue)]"
                                        placeholder="Ej: C-104"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="piso" className="block text-sm font-medium text-[var(--app-text-primary)] mb-1">
                                        Piso
                                    </label>
                                    <input
                                        type="number"
                                        id="piso"
                                        required
                                        min="1"
                                        value={formData.piso}
                                        onChange={(e) => setFormData({ ...formData, piso: e.target.value })}
                                        className="w-full px-3 py-2 bg-[var(--app-hover)] border border-[var(--app-border)] rounded-lg text-[var(--app-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--app-blue)]"
                                        placeholder="1"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="id_profesor" className="block text-sm font-medium text-[var(--app-text-primary)] mb-1">
                                    Profesor Asignado
                                </label>
                                <select
                                    required
                                    id="id_profesor"
                                    value={formData.id_profesor}
                                    onChange={(e) => setFormData({ ...formData, id_profesor: e.target.value })}
                                    className="w-full px-3 py-2 bg-[var(--app-hover)] border border-[var(--app-border)] rounded-lg text-[var(--app-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--app-blue)]"
                                >
                                    <option value="">Selecciona un profesor...</option>
                                    {profesores.map((profesor) => (
                                        <option key={profesor.id_profesor} value={profesor.id_profesor}>
                                            {profesor.usuario.nombre} - {profesor.departamento}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="id_edificio" className="block text-sm font-medium text-[var(--app-text-primary)] mb-1">
                                    Edificio
                                </label>
                                <select
                                    required
                                    id="id_edificio"
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

                            <div>
                                <label htmlFor="referencia" className="block text-sm font-medium text-[var(--app-text-primary)] mb-1">
                                    Referencia u Observaciones
                                </label>
                                <textarea
                                    id="referencia"
                                    value={formData.referencia}
                                    onChange={(e) => setFormData({ ...formData, referencia: e.target.value })}
                                    className="w-full px-3 py-2 bg-[var(--app-hover)] border border-[var(--app-border)] rounded-lg text-[var(--app-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--app-blue)]"
                                    placeholder="Maestro de Arquitectura de Software, horario 15:00 - 20:00, etc."
                                    rows={2}
                                />
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
                                    Cubículo activo
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
                                    {editingCubiculo ? 'Actualizar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Eliminar */}
            {showDeleteModal && deletingCubiculo && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-[var(--app-card-bg)] rounded-lg shadow-xl max-w-md w-full">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                                    <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-[var(--app-text-primary)]">
                                        Eliminar Cubículo
                                    </h3>
                                    <p className="text-sm text-[var(--app-text-secondary)]">
                                        Esta acción no se puede deshacer
                                    </p>
                                </div>
                            </div>

                            <p className="text-sm text-[var(--app-text-primary)] mb-6">
                                ¿Estás seguro de que deseas eliminar el cubículo <strong>{deletingCubiculo.numero}</strong>?
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setDeletingCubiculo(null);
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
