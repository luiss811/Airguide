import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface Evento {
  id_evento: number;
  nombre: string;
  descripcion?: string | null;
  fecha_inicio: string;
  fecha_fin: string;
  id_edificio: number;
  publico: boolean;
  activo: boolean;
  id_creador?: number;
  prioridad_evento?: number;
  edificio?: {
    id_edificio: number;
    nombre: string;
    tipo: string;
    latitud: number;
    longitud: number;
  };
}

export function useEventos(autoFetch = true) {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEventos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/eventos`);
      if (!response.ok) throw new Error('Error al cargar eventos');
      const data = await response.json();
      setEventos(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createEvento = async (data: Partial<Evento>) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No autorizado');

    const response = await fetch(`${API_URL}/eventos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al crear evento');
    }

    const newEvento = await response.json();
    setEventos(prev => [...prev, newEvento]);
    return newEvento;
  };

  const updateEvento = async (id: number, data: Partial<Evento>) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No autorizado');

    const response = await fetch(`${API_URL}/eventos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al actualizar evento');
    }

    const updatedEvento = await response.json();
    setEventos(prev => prev.map(e => e.id_evento === id ? updatedEvento : e));
    return updatedEvento;
  };

  const trainNeuralNetwork = async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No autorizado');

    const response = await fetch(`${API_URL}/eventos/entrenar-neurona`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al entrenar la red neuronal');
    }

    return await response.json();
  };

  const deleteEvento = async (id: number) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No autorizado');

    const response = await fetch(`${API_URL}/eventos/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al eliminar evento');
    }

    setEventos(prev => prev.filter(e => e.id_evento !== id));
  };

  useEffect(() => {
    if (autoFetch) {
      fetchEventos();
    }
  }, [autoFetch]);

  return {
    eventos,
    loading,
    error,
    fetchEventos,
    createEvento,
    updateEvento,
    deleteEvento,
    trainNeuralNetwork,
  };
}