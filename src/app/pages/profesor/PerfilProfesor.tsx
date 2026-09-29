import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { User, Mail, Hash, Save, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router';

const API_URL = import.meta.env.VITE_API_URL;

export default function PerfilProfesor() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [matricula, setMatricula] = useState('');

  // Redirect if not professor
  useEffect(() => {
    if (user && user.rol !== 'profesor') {
      navigate('/');
    }
  }, [user, navigate]);

  // Fetch current user details
  const fetchUserData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No estás autenticado');

      const response = await fetch(`${API_URL}/docentes/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar datos de perfil');
      }

      const data = await response.json();
      setNombre(data.nombre || '');
      setCorreo(data.correo || '');
      setMatricula(data.matricula || '');
    } catch (err: any) {
      toast.error(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.rol === 'profesor') {
      fetchUserData();
    }
  }, [user]);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!nombre.trim() || !correo.trim()) {
      toast.error('Nombre y correo son requeridos');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No autorizado');

      const response = await fetch(`${API_URL}/docentes/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nombre: nombre.trim(),
          correo: correo.trim(),
          matricula: matricula.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al guardar los cambios');
      }

      // Sync local storage username
      const stored = localStorage.getItem('usuario');
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.nombre = data.nombre;
        parsed.correo = data.correo;
        parsed.matricula = data.matricula;
        localStorage.setItem('usuario', JSON.stringify(parsed));
      }

      toast.success('Datos personales actualizados correctamente. Podrían requerir iniciar sesión de nuevo si modificaste tu correo.');
      fetchUserData();
    } catch (err: any) {
      toast.error(err.message || 'Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  if (!user?.rol || user.rol !== 'profesor') {
    return null;
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[var(--app-blue)] border-t-transparent rounded-full animate-spin" />
          <span className="text-[var(--app-text-secondary)] font-medium">Cargando perfil...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold" style={{ color: 'var(--app-text-primary)' }}>
          Mi Perfil
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--app-text-secondary)' }}>
          Modifica tus datos de contacto y clave única institucional.
        </p>
      </div>

      <div className="rounded-xl border border-[var(--app-border)] p-6 space-y-6 shadow-sm" style={{ background: 'var(--app-card-bg)' }}>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nombre */}
          <div>
            <label htmlFor="nombre" className="block text-sm font-semibold mb-2" style={{ color: 'var(--app-text-primary)' }}>
              Nombre Completo *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--app-text-secondary)' }} />
              <input
                id="nombre"
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre y Apellidos"
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-[var(--app-hover)] border border-[var(--app-border)] text-[var(--app-text-primary)] focus:ring-2 focus:ring-[var(--app-blue)] focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Correo */}
          <div>
            <label htmlFor="correo" className="block text-sm font-semibold mb-2" style={{ color: 'var(--app-text-primary)' }}>
              Correo Institucional *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--app-text-secondary)' }} />
              <input
                id="correo"
                type="email"
                required
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="docente@universidad.edu"
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-[var(--app-hover)] border border-[var(--app-border)] text-[var(--app-text-primary)] focus:ring-2 focus:ring-[var(--app-blue)] focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Matricula */}
          <div>
            <label htmlFor="matricula" className="block text-sm font-semibold mb-2" style={{ color: 'var(--app-text-primary)' }}>
              Matrícula / Número de Empleado
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--app-text-secondary)' }} />
              <input
                id="matricula"
                type="text"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                placeholder="Matrícula única"
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-[var(--app-hover)] border border-[var(--app-border)] text-[var(--app-text-primary)] focus:ring-2 focus:ring-[var(--app-blue)] focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex gap-3 p-4 rounded-lg bg-blue-500/10 border border-blue-500/25 text-blue-600 dark:text-blue-400 text-xs">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <div>
              <span className="font-semibold block mb-0.5">Nota de Seguridad</span>
              <span>Si cambias tu correo electrónico, asegúrate de tener acceso al nuevo buzón para recibir los códigos de autenticación 2FA en tu próximo inicio de sesión.</span>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-[var(--app-border)]">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-[var(--app-blue)] text-white rounded-lg font-bold hover:bg-opacity-90 active:scale-95 disabled:opacity-50 transition-all shadow-md cursor-pointer"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              <span>{saving ? 'Guardando...' : 'Guardar Datos'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
