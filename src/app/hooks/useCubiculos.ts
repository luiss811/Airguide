import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config/api';

export interface Cubiculo {
  id_cubiculo: number;
  id_profesor: number;
  id_edificio: number;
  numero: string;
  piso: number;
  referencia: string | null;
  activo: boolean;
  edificio: {
    id_edificio: number;
    nombre: string;
  };
  profesor: {
    id_profesor: number;
    usuario: {
      nombre: string;
      correo: string;
    };
  };
}

export function useCubiculos() {
  const [cubiculos, setCubiculos] = useState<Cubiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {user} = useAuth();
  
  const fetchCubiculos = async () => {
    try {
      setLoading(true);
      const headers: Record<string, string> = {};
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/edificios/cubiculos`, { headers });
      if (!response.ok) throw new Error('Error al cargar cubículos');
      const data = await response.json();
      setCubiculos(data);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching cubiculos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCubiculos();
  }, []);

  const createCubiculo = async (data: Partial<Cubiculo>) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/edificios/cubiculos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear cubículo');
      }

      const newCubiculo = await response.json();
      setCubiculos(prev => [...prev, newCubiculo]);
      return newCubiculo;
    } catch (err: any) {
      throw err;
    }
  };

  const updateCubiculo = async (id: number, data: Partial<Cubiculo>) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/edificios/cubiculos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar cubículo');
      }

      const updatedCubiculo = await response.json();
      setCubiculos(cubiculos.map(c => c.id_cubiculo === id ? updatedCubiculo : c));
      return updatedCubiculo;
    } catch (err: any) {
      throw err;
    }
  };

  const deleteCubiculo = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/edificios/cubiculos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar cubículo');
      }

      setCubiculos(cubiculos.filter(c => c.id_cubiculo !== id));
      return true;
    } catch (err: any) {
      throw err;
    }
  };

  return {
    cubiculos,
    loading,
    error,
    fetchCubiculos,
    createCubiculo,
    updateCubiculo,
    deleteCubiculo
  };
}
