import React, { useState } from 'react';
import { Plus, Edit, Trash2, DoorOpen, Building2, Search, Users } from 'lucide-react';
import { useSalones, useEdificios } from '../../hooks';
import { toast } from 'sonner';

export default function SalonesManagement() {
    const { salones, loading, createSalon, updateSalon, deleteSalon, fetchSalones } = useSalones();
    const { edificios } = useEdificios();
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editingSalon, setEditingSalon] = useState<any>(null);
    const [deletingSalon, setDeletingSalon] = useState<any>(null);
    const [formData, setFormData] = useState({
        nombre: '',
        capacidad: '',
        tipo: 'aula' as 'aula' | 'laboratorio' | 'auditorio' | 'oficina',
        id_edificio: '',
        piso: '',
        activo: true
    });

    const salonesFiltrados = salones.filter(s =>
        s.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.edificio?.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const data = {
                nombre: formData.nombre,
                capacidad: parseInt(formData.capacidad),
                tipo: formData.tipo,
                id_edificio: parseInt(formData.id_edificio),
                piso: parseInt(formData.piso),
                activo: formData.activo
            };

            if (editingSalon) {
                await updateSalon(editingSalon.id_salon, data);
                toast.success('Salón actualizado correctamente');
            } else {
                await createSalon(data);
                toast.success('Salón creado correctamente');
            }

            setShowModal(false);
            resetForm();
            fetchSalones();
        } catch (error: any) {
            toast.error(error.message || 'Error al guardar salón');
        }
    };

    const handleEdit = (salon: any) => {
        setEditingSalon(salon);
        setFormData({
            nombre: salon.nombre,
            capacidad: salon.capacidad.toString(),
            tipo: salon.tipo,
            id_edificio: salon.id_edificio.toString(),
            piso: salon.piso.toString(),
            activo: salon.activo
        });
        setShowModal(true);
    };

    const handleDeleteClick = (salon: any) => {
        setDeletingSalon(salon);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!deletingSalon) return;

        try {
            await deleteSalon(deletingSalon.id_salon);
            toast.success('Salón eliminado correctamente');
            setShowDeleteModal(false);
            setDeletingSalon(null);
            fetchSalones();
        } catch (error: any) {
            toast.error(error.message || 'Error al eliminar salón');
        }
    };

    const resetForm = () => {
        setFormData({
            nombre: '',
            capacidad: '',
            tipo: 'aula',
            id_edificio: '',
            piso: '',
            activo: true
        });
        setEditingSalon(null);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        resetForm();
    };

    const getTipoColor = (tipo: string) => {
        const colores: Record<string, string> = {
            aula: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
            laboratorio: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300',
            auditorio: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
            oficina: 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300'
        };
        return colores[tipo] || colores.aula;
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-[var(--app-text-primary)]">
                        Gestión de Salones
                    </h2>
                    <p className="text-sm text-[var(--app-text-secondary)] mt-1">
                        Administra los salones dentro de los edificios
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--app-blue)] text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                    <Plus className="w-4 h-4" />
                    Nuevo Salón
                </button>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--app-text-secondary)]" />
                    <input
                        type="text"
                        placeholder="Buscar salones..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-[var(--app-hover)] border border-[var(--app-border)] rounded-lg text-[var(--app-text-primary)] placeholder:text-[var(--app-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--app-blue)]"
                    />
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-[var(--app-card-bg)] border border-[var(--app-border)] rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-[var(--app-text-secondary)]">Total Salones</p>
                            <p className="text-2xl font-bold text-[var(--app-text-primary)]">{salones.length}</p>
                        </div>
                        <DoorOpen className="w-8 h-8 text-[var(--app-blue)] opacity-50" />
                    </div>
                </div>
                <div className="bg-[var(--app-card-bg)] border border-[var(--app-border)] rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-[var(--app-text-secondary)]">Aulas</p>
                            <p className="text-2xl font-bold text-[var(--app-text-primary)]">
                                {salones.filter(s => s.tipo === 'aula').length}
                            </p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <span className="text-xs font-bold text-blue-700 dark:text-blue-300">A</span>
                        </div>
                    </div>
                </div>
                <div className="bg-[var(--app-card-bg)] border border-[var(--app-border)] rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-[var(--app-text-secondary)]">Laboratorios</p>
                            <p className="text-2xl font-bold text-[var(--app-text-primary)]">
                                {salones.filter(s => s.tipo === 'laboratorio').length}
                            </p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                            <span className="text-xs font-bold text-purple-700 dark:text-purple-300">L</span>
                        </div>
                    </div>
                </div>
                <div className="bg-[var(--app-card-bg)] border border-[var(--app-border)] rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-[var(--app-text-secondary)]">Capacidad Total</p>
                            <p className="text-2xl font-bold text-[var(--app-text-primary)]">
                                {salones.reduce((sum, s) => sum + s.capacidad, 0)}
                            </p>
                        </div>
                        <Users className="w-8 h-8 text-green-600 dark:text-green-400 opacity-50" />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-[var(--app-card-bg)] border border-[var(--app-border)] rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-[var(--app-hover)] border-b border-[var(--app-border)]">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--app-text-secondary)] uppercase tracking-wider">
                                Salón
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--app-text-secondary)] uppercase tracking-wider">
                                Edificio
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--app-text-secondary)] uppercase tracking-wider">
                                Tipo
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--app-text-secondary)] uppercase tracking-wider">
                                Piso
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--app-text-secondary)] uppercase tracking-wider">
                                Capacidad
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
                                <td colSpan={7} className="px-6 py-8 text-center">
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="w-5 h-5 border-2 border-[var(--app-blue)] border-t-transparent rounded-full animate-spin" />
                                        <span className="text-sm text-[var(--app-text-secondary)]">Cargando...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : salonesFiltrados.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-sm text-[var(--app-text-secondary)]">
                                    No se encontraron salones
                                </td>
                            </tr>
                        ) : (
                            salonesFiltrados.map((salon) => (
                                <tr key={salon.id_salon} className="hover:bg-[var(--app-hover)]">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-shrink-0">
                                                <DoorOpen className="w-8 h-8 text-[var(--app-blue)]" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-[var(--app-text-primary)]">
                                                    {salon.nombre}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="w-4 h-4 text-[var(--app-blue)]" />
                                            <span className="text-sm text-[var(--app-text-primary)]">
                                                {salon.edificio?.nombre || 'Sin edificio'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTipoColor(salon.tipo)}`}>
                                            {salon.tipo}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-[var(--app-text-primary)]">
                                            Piso {salon.piso}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-[var(--app-text-primary)]">
                                            {salon.capacidad} personas
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${salon.activo
                                            ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                                            : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                                            }`}>
                                            {salon.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(salon)}
                                                className="p-2 text-[var(--app-blue)] hover:bg-[var(--app-hover)] rounded-lg transition-colors"
                                                title="Editar"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(salon)}
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-[var(--app-card-bg)] rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-[var(--app-border)]">
                            <h3 className="text-xl font-bold text-[var(--app-text-primary)]">
                                {editingSalon ? 'Editar Salón' : 'Nuevo Salón'}
                            </h3>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--app-text-primary)] mb-1">
                                    Nombre del Salón *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    className="w-full px-3 py-2 bg-[var(--app-hover)] border border-[var(--app-border)] rounded-lg text-[var(--app-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--app-blue)]"
                                    placeholder="Ej: Aula 101"
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
                                        Tipo *
                                    </label>
                                    <select
                                        value={formData.tipo}
                                        onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
                                        className="w-full px-3 py-2 bg-[var(--app-hover)] border border-[var(--app-border)] rounded-lg text-[var(--app-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--app-blue)]"
                                    >
                                        <option value="aula">Aula</option>
                                        <option value="laboratorio">Laboratorio</option>
                                        <option value="auditorio">Auditorio</option>
                                        <option value="oficina">Oficina</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[var(--app-text-primary)] mb-1">
                                        Piso *
                                    </label>
                                    <input
                                        type="number"
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
                                <label className="block text-sm font-medium text-[var(--app-text-primary)] mb-1">
                                    Capacidad *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={formData.capacidad}
                                    onChange={(e) => setFormData({ ...formData, capacidad: e.target.value })}
                                    className="w-full px-3 py-2 bg-[var(--app-hover)] border border-[var(--app-border)] rounded-lg text-[var(--app-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--app-blue)]"
                                    placeholder="30"
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
                                    Salón activo
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
                                    {editingSalon ? 'Actualizar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Eliminar */}
            {showDeleteModal && deletingSalon && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-[var(--app-card-bg)] rounded-lg shadow-xl max-w-md w-full">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                                    <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-[var(--app-text-primary)]">
                                        Eliminar Salón
                                    </h3>
                                    <p className="text-sm text-[var(--app-text-secondary)]">
                                        Esta acción no se puede deshacer
                                    </p>
                                </div>
                            </div>

                            <p className="text-sm text-[var(--app-text-primary)] mb-6">
                                ¿Estás seguro de que deseas eliminar el salón <strong>"{deletingSalon.nombre}"</strong>?
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setDeletingSalon(null);
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