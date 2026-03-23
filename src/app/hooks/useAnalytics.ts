import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface DashboardStats {
  usuarios: {
    total: number;
    activos: number;
    pendientes: number;
  };
  edificios: {
    total: number;
    activos: number;
  };
  salones: number;
  profesores: number;
  cubiculos: number;
  eventos: {
    total: number;
    activos: number;
  };
  rutas: {
    total: number;
    activas: number;
  };
  totalAccesos: number;
}

export function useAnalytics(autoFetch = true) {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No autorizado');

      const response = await fetch(`${API_URL}/analytics/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Error al cargar estadísticas');
      const data = await response.json();
      setDashboardStats(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchEdificiosPorTipo = async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No autorizado');

    const response = await fetch(`${API_URL}/analytics/edificios-tipo`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error('Error al cargar datos');
    return await response.json();
  };

  const fetchEventosProximos = async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No autorizado');

    const response = await fetch(`${API_URL}/analytics/eventos-proximos`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error('Error al cargar eventos');
    return await response.json();
  };

  const fetchAccesosRecientes = async (days = 7) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No autorizado');

    const response = await fetch(`${API_URL}/analytics/accesos-recientes?days=${days}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error('Error al cargar accesos');
    return await response.json();
  };

  const fetchAccesosTimeline = async (days = 30) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No autorizado');

    const response = await fetch(`${API_URL}/analytics/accesos-timeline?days=${days}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error('Error al cargar timeline');
    return await response.json();
  };

  const fetchUsuariosPorRol = async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No autorizado');

    const response = await fetch(`${API_URL}/analytics/usuarios-rol`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error('Error al cargar usuarios');
    return await response.json();
  };

  const fetchRutasPopulares = async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No autorizado');

    const response = await fetch(`${API_URL}/analytics/rutas-populares`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error('Error al cargar rutas');
    return await response.json();
  };

  useEffect(() => {
    if (autoFetch) {
      fetchDashboardStats();
    }
  }, [autoFetch]);

  return {
    dashboardStats,
    loading,
    error,
    fetchDashboardStats,
    fetchEdificiosPorTipo,
    fetchEventosProximos,
    fetchAccesosRecientes,
    fetchAccesosTimeline,
    fetchUsuariosPorRol,
    fetchRutasPopulares,
  };
}