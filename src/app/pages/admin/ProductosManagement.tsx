import React, { useState } from 'react';
import { ShoppingBag, Plus, Search, Edit2, Trash2, Tag, Package, Check, X } from 'lucide-react';
import { useProductos, Producto } from '../../hooks';
import { toast } from 'sonner';

export default function ProductosManagement() {
  const [categoriaFilter, setCategoriaFilter] = useState('todos');
  const [searchFilter, setSearchFilter] = useState('');
  const { productos, loading, error, createProducto, updateProducto, deleteProducto, fetchProductos } = useProductos(categoriaFilter, searchFilter);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    categoria: 'playera',
    stock: '',
    imagen_url: '',
    activo: true,
  });

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      nombre: '',
      descripcion: '',
      precio: '',
      categoria: 'playera',
      stock: '10',
      imagen_url: '',
      activo: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prod: Producto) => {
    setEditingProduct(prod);
    setFormData({
      nombre: prod.nombre,
      descripcion: prod.descripcion || '',
      precio: String(prod.precio),
      categoria: prod.categoria,
      stock: String(prod.stock),
      imagen_url: prod.imagen_url || '',
      activo: prod.activo,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await updateProducto(editingProduct.id_producto, {
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          precio: Number(formData.precio),
          categoria: formData.categoria,
          stock: Number(formData.stock),
          imagen_url: formData.imagen_url,
          activo: formData.activo,
        });
        toast.success('Producto actualizado exitosamente');
      } else {
        await createProducto({
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          precio: Number(formData.precio),
          categoria: formData.categoria,
          stock: Number(formData.stock),
          imagen_url: formData.imagen_url,
          activo: formData.activo,
        });
        toast.success('Producto creado exitosamente');
      }
      setIsModalOpen(false);
      fetchProductos();
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar producto');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;
    try {
      await deleteProducto(id);
      toast.success('Producto eliminado exitosamente');
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar producto');
    }
  };

  const handleToggleActive = async (prod: Producto) => {
    try {
      await updateProducto(prod.id_producto, { activo: !prod.activo });
      toast.success(`Producto ${!prod.activo ? 'activado' : 'desactivado'}`);
    } catch (err: any) {
      toast.error(err.message || 'Error al cambiar estado');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-7 h-7 text-[var(--app-blue)]" />
            <h1 className="text-2xl font-bold text-[var(--app-text-primary)]">Gestión de Mercancía</h1>
          </div>
          <p className="text-sm text-[var(--app-text-secondary)] mt-1">
            Administra el catálogo de productos oficiales UTEQ (Playeras, Termos, Llaveros, Sudaderas)
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-[var(--app-blue)] text-white font-medium rounded-lg hover:opacity-90 transition-opacity shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span>Nuevo Producto</span>
        </button>
      </div>

      {/* Filters & Search bar */}
      <div className="bg-[var(--app-card-bg)] border border-[var(--app-border)] rounded-xl p-4 mb-6 shadow-sm flex flex-col md:flex-row items-center gap-4 justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--app-text-secondary)]" />
          <input
            type="text"
            placeholder="Buscar por nombre o descripción..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--app-hover)] border border-[var(--app-border)] rounded-lg text-[var(--app-text-primary)] placeholder-[var(--app-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--app-blue)]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {['todos', 'playera', 'termo', 'llavero', 'sudadera'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoriaFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                categoriaFilter === cat
                  ? 'bg-[var(--app-blue)] text-white'
                  : 'bg-[var(--app-hover)] text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-[var(--app-card-bg)] border border-[var(--app-border)] rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-[var(--app-text-secondary)]">Cargando productos...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : productos.length === 0 ? (
          <div className="p-8 text-center text-[var(--app-text-secondary)]">No se encontraron productos registrados.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[var(--app-text-primary)]">
              <thead className="bg-[var(--app-hover)] border-b border-[var(--app-border)] text-xs uppercase text-[var(--app-text-secondary)]">
                <tr>
                  <th className="px-6 py-3">Producto</th>
                  <th className="px-6 py-3">Categoría</th>
                  <th className="px-6 py-3">Precio</th>
                  <th className="px-6 py-3">Stock</th>
                  <th className="px-6 py-3">Estado</th>
                  <th className="px-6 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--app-border)]">
                {productos.map((prod) => (
                  <tr key={prod.id_producto} className="hover:bg-[var(--app-hover)] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {prod.imagen_url ? (
                          <img
                            src={prod.imagen_url}
                            alt={prod.nombre}
                            className="w-12 h-12 rounded-lg object-cover border border-[var(--app-border)]"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-[var(--app-hover)] border border-[var(--app-border)] flex items-center justify-center text-[var(--app-text-secondary)]">
                            <Tag className="w-6 h-6" />
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-[var(--app-text-primary)]">{prod.nombre}</div>
                          <div className="text-xs text-[var(--app-text-secondary)] line-clamp-1">{prod.descripcion}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--app-blue-light)] text-[var(--app-blue)] uppercase">
                        {prod.categoria}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-[var(--app-text-primary)]">
                      ${Number(prod.precio).toFixed(2)} MXN
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 font-semibold ${prod.stock > 10 ? 'text-[var(--app-green)]' : prod.stock > 0 ? 'text-amber-500' : 'text-red-500'}`}>
                        <Package className="w-4 h-4" />
                        {prod.stock} un.
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(prod)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                          prod.activo
                            ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300'
                            : 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                        }`}
                      >
                        {prod.activo ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                        {prod.activo ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(prod)}
                          className="p-2 text-[var(--app-blue)] hover:bg-[var(--app-hover)] rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(prod.id_producto)}
                          className="p-2 text-red-500 hover:bg-[var(--app-hover)] rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[var(--app-card-bg)] border border-[var(--app-border)] rounded-2xl w-full max-w-lg shadow-2xl p-6 relative overflow-hidden">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)] p-1 rounded-lg hover:bg-[var(--app-hover)]"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-[var(--app-text-primary)] mb-4">
              {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--app-text-secondary)] uppercase mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="ej. Playera Algodón UTEQ"
                  className="w-full px-3 py-2 bg-[var(--app-hover)] border border-[var(--app-border)] rounded-lg text-[var(--app-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--app-blue)] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--app-text-secondary)] uppercase mb-1">Descripción</label>
                <textarea
                  rows={2}
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Detalles del producto..."
                  className="w-full px-3 py-2 bg-[var(--app-hover)] border border-[var(--app-border)] rounded-lg text-[var(--app-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--app-blue)] text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--app-text-secondary)] uppercase mb-1">Precio ($ MXN)</label>
                  <input
                    type="number"
                    step="0.50"
                    required
                    min="0"
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                    className="w-full px-3 py-2 bg-[var(--app-hover)] border border-[var(--app-border)] rounded-lg text-[var(--app-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--app-blue)] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--app-text-secondary)] uppercase mb-1">Categoría</label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="w-full px-3 py-2 bg-[var(--app-hover)] border border-[var(--app-border)] rounded-lg text-[var(--app-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--app-blue)] text-sm"
                  >
                    <option value="playera">Playera</option>
                    <option value="termo">Termo</option>
                    <option value="llavero">Llavero</option>
                    <option value="sudadera">Sudadera</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--app-text-secondary)] uppercase mb-1">Stock disponible</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3 py-2 bg-[var(--app-hover)] border border-[var(--app-border)] rounded-lg text-[var(--app-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--app-blue)] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--app-text-secondary)] uppercase mb-1">Estado</label>
                  <div className="flex items-center h-10 gap-3">
                    <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-[var(--app-text-primary)]">
                      <input
                        type="checkbox"
                        checked={formData.activo}
                        onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                        className="w-4 h-4 rounded text-[var(--app-blue)] focus:ring-[var(--app-blue)]"
                      />
                      Producto Activo
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--app-text-secondary)] uppercase mb-1">URL de Imagen</label>
                <input
                  type="url"
                  value={formData.imagen_url}
                  onChange={(e) => setFormData({ ...formData, imagen_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-[var(--app-hover)] border border-[var(--app-border)] rounded-lg text-[var(--app-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--app-blue)] text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--app-border)]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm text-[var(--app-text-secondary)] hover:bg-[var(--app-hover)]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[var(--app-blue)] text-white font-medium text-sm rounded-lg hover:opacity-90 transition-opacity"
                >
                  {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
