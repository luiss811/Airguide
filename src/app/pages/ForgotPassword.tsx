import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ThemeToggle } from '../components/ThemeToggle';
import { Mail, MapPin, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const [correo, setCorreo] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!correo) {
      setError('Por favor, ingresa tu correo electrónico');
      return;
    }

    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://airguidebackend-production.up.railway.app/api';
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar código');
      }

      setSuccess(data.message);

      // Pass the email to the reset password page
      setTimeout(() => {
        navigate('/reset-password', { state: { correo } });
      }, 2000);

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
          <span className="text-sm">Volver</span>
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
            <p className="mt-2" style={{ color: 'var(--app-text-secondary)' }}>Recuperar Contraseña</p>
          </div>

          <p className="mb-6 text-sm text-center" style={{ color: 'var(--app-text-secondary)' }}>
            Ingresa tu correo institucional y te enviaremos un código para restablecer tu contraseña.
          </p>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="correo" className="block text-sm font-medium mb-2" style={{ color: 'var(--app-text-primary)' }}>
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                  style={{ color: error ? 'var(--app-red)' : 'var(--app-text-secondary)' }}
                />
                <input
                  id="correo"
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{
                    background: error ? 'rgba(239, 68, 68, 0.1)' : 'var(--app-hover)',
                    border: `1px solid ${error ? 'var(--app-red)' : 'var(--app-border)'}`,
                    color: error ? 'var(--app-red)' : 'var(--app-text-primary)',
                  }}
                  placeholder="tu correo institucional"
                  disabled={loading || !!success}
                />
              </div>
            </div>

            {error && (
              <div
                className="px-4 py-3 rounded-lg text-sm"
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid var(--app-red)',
                  color: 'var(--app-red)',
                }}
              >
                {error}
              </div>
            )}

            {success && (
              <div
                className="px-4 py-3 rounded-lg text-sm text-center"
                style={{
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid var(--app-green)',
                  color: 'var(--app-green)',
                }}
              >
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !!success}
              className="w-full py-3 rounded-lg font-medium text-white transition-opacity disabled:opacity-50"
              style={{ background: 'var(--app-blue)' }}
            >
              {loading ? 'Enviando código...' : 'Enviar Código'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
