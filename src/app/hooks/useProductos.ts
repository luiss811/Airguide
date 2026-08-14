import { useState, useEffect } from 'react';
import { API_URL } from '../config/api';

export interface Producto {
  id_producto: number;
  nombre: string;
  descripcion?: string | null;
  precio: number | string;
  categoria: 'playera' | 'termo' | 'llavero' | 'sudadera' | string;
  stock: number;
  imagen_url?: string | null;
  activo: boolean;
  fecha_creacion?: string;
}

export interface CartItem {
  producto: Producto;
  cantidad: number;
}

export function useProductos(categoriaFilter = 'todos', searchFilter = '', autoFetch = true) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProductos = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (categoriaFilter && categoriaFilter !== 'todos') {
        params.append('categoria', categoriaFilter);
      }
      if (searchFilter) {
        params.append('search', searchFilter);
      }

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await fetch(`${API_URL}/productos${queryString}`);
      if (!response.ok) throw new Error('Error al cargar mercancía');
      const data = await response.json();
      setProductos(data);
    } catch (err: any) {
      setError(err.message || 'Error al conectar con la tienda');
    } finally {
      setLoading(false);
    }
  };

  const createProducto = async (data: Partial<Producto>) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No autorizado');

    const response = await fetch(`${API_URL}/productos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Error al crear producto');
    }

    const newProduct = await response.json();
    setProductos(prev => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProducto = async (id: number, data: Partial<Producto>) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No autorizado');

    const response = await fetch(`${API_URL}/productos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Error al actualizar producto');
    }

    const updated = await response.json();
    setProductos(prev => prev.map(p => p.id_producto === id ? updated : p));
    return updated;
  };

  const deleteProducto = async (id: number) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No autorizado');

    const response = await fetch(`${API_URL}/productos/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Error al eliminar producto');
    }

    setProductos(prev => prev.filter(p => p.id_producto !== id));
  };

  const realizarCompra = async (payload: {
    cliente_nombre: string;
    cliente_correo: string;
    metodo_pago: string;
    items: { id_producto: number; cantidad: number }[];
    id_usuario?: number;
  }) => {
    const response = await fetch(`${API_URL}/ventas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Error al procesar la orden de compra');
    }

    const result = await response.json();
    fetchProductos();
    return result;
  };

  useEffect(() => {
    if (autoFetch) {
      fetchProductos();
    }
  }, [categoriaFilter, searchFilter, autoFetch]);

  return {
    productos,
    loading,
    error,
    fetchProductos,
    createProducto,
    updateProducto,
    deleteProducto,
    realizarCompra,
  };
}
