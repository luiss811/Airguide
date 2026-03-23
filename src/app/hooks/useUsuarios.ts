import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface Usuario {
  id_usuario: number;
  correo: string;
  nombre: string;
  matricula: string;
  rol: 'admin' | 'alumno';
  estado: 'pendiente' | 'activo' | 'rechazado';
  fecha_registro: string;
  fecha_validacion?: string | null;
}

export function useUsuarios(autoFetch = true) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuariosPendientes, setUsuariosPendientes] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsuarios = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No autorizado');

      const response = await fetch(`${API_URL}/auth/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Error al cargar usuarios');
      const data = await response.json();
      setUsuarios(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsuariosPendientes = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No autorizado');

      const response = await fetch(`${API_URL}/auth/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Error al cargar usuarios pendientes');
      const data = await response.json();
      setUsuariosPendientes(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const validarUsuario = async (id: number, estado: 'activo' | 'rechazado') => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No autorizado');

    const response = await fetch(`${API_URL}/auth/validate/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ estado }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al validar usuario');
    }

    const updatedUsuario = await response.json();
    
    // Actualizar listas locales
    setUsuariosPendientes(prev => prev.filter(u => u.id_usuario !== id));
    setUsuarios(prev => prev.map(u => u.id_usuario === id ? updatedUsuario : u));
    
    return updatedUsuario;
  };

  useEffect(() => {
    if (autoFetch) {
      fetchUsuarios();
      fetchUsuariosPendientes();
    }
  }, [autoFetch]);

  return {
    usuarios,
    usuariosPendientes,
    loading,
    error,
    fetchUsuarios,
    fetchUsuariosPendientes,
    validarUsuario,
  };
}