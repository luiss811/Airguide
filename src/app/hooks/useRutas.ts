import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface RutaDetalle {
  id_detalle: number;
  id_ruta: number;
  orden: number;
  instruccion: string;
  latitud: number;
  longitud: number;
}

export interface Ruta {
  id_ruta: number;
  tipo: 'interna' | 'externa';
  origen_tipo: 'edificio' | 'salon' | 'cubiculo' | 'evento';
  origen_id: number;
  destino_tipo: 'edificio' | 'salon' | 'cubiculo' | 'evento';
  destino_id: number;
  tiempo_estimado?: number | null;
  activo: boolean;
  detalles?: RutaDetalle[];
}

export function useRutas(autoFetch = true) {
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRutas = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/rutas`);
      if (!response.ok) throw new Error('Error al cargar rutas');
      const data = await response.json();
      setRutas(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const findRuta = async (origen_tipo: string, origen_id: number, destino_tipo: string, destino_id: number) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No autorizado');

    const response = await fetch(`${API_URL}/rutas/find`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ origen_tipo, origen_id, destino_tipo, destino_id }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al buscar ruta');
    }

    return await response.json();
  };

  const createRuta = async (data: Partial<Ruta>) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No autorizado');

    const response = await fetch(`${API_URL}/rutas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al crear ruta');
    }

    const newRuta = await response.json();
    setRutas(prev => [...prev, newRuta]);
    return newRuta;
  };

  const updateRuta = async (id: number, data: Partial<Ruta>) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No autorizado');

    const response = await fetch(`${API_URL}/rutas/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al actualizar ruta');
    }

    const updatedRuta = await response.json();
    setRutas(prev => prev.map(r => r.id_ruta === id ? updatedRuta : r));
    return updatedRuta;
  };

  const deleteRuta = async (id: number) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No autorizado');

    const response = await fetch(`${API_URL}/rutas/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al eliminar ruta');
    }

    setRutas(prev => prev.filter(r => r.id_ruta !== id));
  };

  useEffect(() => {
    if (autoFetch) {
      fetchRutas();
    }
  }, [autoFetch]);

  return {
    rutas,
    loading,
    error,
    fetchRutas,
    findRuta,
    createRuta,
    updateRuta,
    deleteRuta,
  };
}