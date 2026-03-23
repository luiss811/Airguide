import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface Edificio {
  id_edificio: number;
  nombre: string;
  descripcion?: string | null;
  latitud: number;
  longitud: number;
  tipo: 'academico' | 'administrativo' | 'recreativo';
  activo: boolean;
  _count?: {
    salones: number;
    cubiculos: number;
    eventos: number;
  };
}

export function useEdificios(autoFetch = true) {
  const [edificios, setEdificios] = useState<Edificio[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEdificios = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/edificios`);
      if (!response.ok) throw new Error('Error al cargar edificios');
      const data = await response.json();
      setEdificios(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createEdificio = async (data: Partial<Edificio>) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No autorizado');

    const response = await fetch(`${API_URL}/edificios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al crear edificio');
    }

    const newEdificio = await response.json();
    setEdificios(prev => [...prev, newEdificio]);
    return newEdificio;
  };

  const updateEdificio = async (id: number, data: Partial<Edificio>) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No autorizado');

    const response = await fetch(`${API_URL}/edificios/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al actualizar edificio');
    }

    const updatedEdificio = await response.json();
    setEdificios(prev => prev.map(e => e.id_edificio === id ? updatedEdificio : e));
    return updatedEdificio;
  };

  const deleteEdificio = async (id: number) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No autorizado');

    const response = await fetch(`${API_URL}/edificios/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al eliminar edificio');
    }

    setEdificios(prev => prev.filter(e => e.id_edificio !== id));
  };

  useEffect(() => {
    if (autoFetch) {
      fetchEdificios();
    }
  }, [autoFetch]);

  return {
    edificios,
    loading,
    error,
    fetchEdificios,
    createEdificio,
    updateEdificio,
    deleteEdificio,
  };
}