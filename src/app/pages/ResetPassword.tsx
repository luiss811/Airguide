import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ThemeToggle } from '../components/ThemeToggle';
import { Lock, MapPin, KeyRound, ArrowLeft } from 'lucide-react';

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  const initialEmail = location.state?.correo || '';

  const [correo] = useState(initialEmail);
  const [codigo, setCodigo] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If user arrived here magically without an email, maybe they typed the URL. 
    // We let them use the form anyway but it's prefilled if they came from ForgotPassword
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!correo || !codigo || !newPassword || !confirmPassword) {
      setError('Por favor, completa todos los campos');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://airguidebackend-production.up.railway.app/api';
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, codigo, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ocurrió un problema al restablecer la contraseña');
      }

      setSuccess(data.message);

      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--app-bg)' }}>
      <div className="absolute top-4 left-4">
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-[var(--app-hover)] transition-colors"
          style={{ color: 'var(--app-text-secondary)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Volver al login</span>
        </button>
      </div>

      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="rounded-2xl shadow-xl p-8" style={{ background: 'var(--app-header-bg)', boxShadow: '0 20px 25px -5px var(--app-shadow)' }}>
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ background: 'var(--app-blue)' }}>
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--app-text-primary)' }}>AirGuide</h1>
            <p className="mt-2" style={{ color: 'var(--app-text-secondary)' }}>Crear nueva contraseña</p>
          </div>

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--app-text-primary)' }}>
                  Código de Verificación
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--app-text-secondary)' }} />
                  <input
                    type="text"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                    className="w-full pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono tracking-widest uppercase"
                    style={{ background: 'var(--app-hover)', border: '1px solid var(--app-border)', color: 'var(--app-text-primary)' }}
                    placeholder="XXXXXX"
                    maxLength={6}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--app-text-primary)' }}>
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--app-text-secondary)' }} />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500"
                    style={{ background: 'var(--app-hover)', border: '1px solid var(--app-border)', color: 'var(--app-text-primary)' }}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--app-text-primary)' }}>
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--app-text-secondary)' }} />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500"
                    style={{ background: 'var(--app-hover)', border: '1px solid var(--app-border)', color: 'var(--app-text-primary)' }}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error && (
                <div className="px-4 py-3 rounded-lg text-sm" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--app-red)', color: 'var(--app-red)' }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg font-medium text-white transition-opacity disabled:opacity-50"
                style={{ background: 'var(--app-blue)' }}
              >
                {loading ? 'Restableciendo...' : 'Guardar nueva contraseña'}
              </button>
            </form>
          ) : (
            <div className="px-4 py-6 rounded-lg text-center" style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid var(--app-green)' }}>
              <p style={{ color: 'var(--app-green)' }} className="font-medium text-lg mb-2">¡Completado!</p>
              <p style={{ color: 'var(--app-text-secondary)' }}>{success}</p>
              <p className="mt-4 text-sm" style={{ color: 'var(--app-text-secondary)' }}>Redirigiendo al inicio de sesión...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
