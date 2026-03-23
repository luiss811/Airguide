import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface Salon {
    id_salon: number;
    nombre: string;
    capacidad: number;
    tipo: 'aula' | 'laboratorio' | 'auditorio' | 'oficina';
    id_edificio: number;
    piso: number;
    activo: boolean;
    edificio?: {
        id_edificio: number;
        nombre: string;
        tipo: string;
    };
}

export function useSalones(autoFetch = true) {
  const [salones, setSalones] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSalones = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/edificios/salones`);
      if (!response.ok) throw new Error('Error al cargar salones');
      const data = await response.json();
      setSalones(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createSalon = async (data: Partial<Salon>) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No autorizado');

    const response = await fetch(`${API_URL}/edificios/${data.id_edificio}/salones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al crear salón');
    }

    const newSalon = await response.json();
    setSalones(prev => [...prev, newSalon]);
    return newSalon;
  };

  const updateSalon = async (id: number, data: Partial<Salon>) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No autorizado');

    const response = await fetch(`${API_URL}/edificios/salones/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al actualizar salón');
    }

    const updatedSalon = await response.json();
    setSalones(prev => prev.map(s => s.id_salon === id ? updatedSalon : s));
    return updatedSalon;
  };

  const deleteSalon = async (id: number) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No autorizado');

    const response = await fetch(`${API_URL}/edificios/salones/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al eliminar salón');
    }

    setSalones(prev => prev.filter(s => s.id_salon !== id));
  };

  useEffect(() => {
    if (autoFetch) {
      fetchSalones();
    }
  }, [autoFetch]);

  return {
    salones,
    loading,
    error,
    fetchSalones,
    createSalon,
    updateSalon,
    deleteSalon,
  };
}
