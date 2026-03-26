import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface Profesor {
  id_profesor: number;
  id_usuario: number;
  departamento?: string | null;
  id_cubiculo?: number | null;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
  usuario?: {
    nombre: string;
    correo: string;
  };
  cubiculos?: Array<{
    id_cubiculo: number;
    id_profesor: number;
    id_edificio: number;
    numero: string;
    piso: number;
    referencia?: string | null;
    edificio?: {
      id_edificio: number;
      nombre: string;
      latitud: string;
      longitud: string;
      tipo: string;
    };
  }>;
}

export function useProfesores(autoFetch = true) {
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfesores = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/profesores`);
      if (!response.ok) throw new Error('Error al cargar profesores');
      const data = await response.json();
      setProfesores(data);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching profesores:', err);
    } finally {
      setLoading(false);
    }
  };

  const createProfesor = async (data: Partial<Profesor>) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No autorizado');

    const response = await fetch(`${API_URL}/profesores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al crear profesor');
    }

    const newProfesor = await response.json();
    setProfesores(prev => [...prev, newProfesor]);
    return newProfesor;
  };

  const updateProfesor = async (id: number, data: Partial<Profesor>) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No autorizado');

    const response = await fetch(`${API_URL}/profesores/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al actualizar profesor');
    }

    const updatedProfesor = await response.json();
    setProfesores(prev => prev.map(p => p.id_profesor === id ? updatedProfesor : p));
    return updatedProfesor;
  };

  const deleteProfesor = async (id: number) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No autorizado');

    const response = await fetch(`${API_URL}/profesores/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al eliminar profesor');
    }

    setProfesores(prev => prev.filter(p => p.id_profesor !== id));
  };

  useEffect(() => {
    if (autoFetch) {
      fetchProfesores();
    }
  }, [autoFetch]);

  return {
    profesores,
    loading,
    error,
    fetchProfesores,
    createProfesor,
    updateProfesor,
    deleteProfesor,
  };
}
