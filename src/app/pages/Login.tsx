import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { Mail, Lock, MapPin, ArrowLeft } from 'lucide-react';

export default function Login() {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password || !correo) {
      setError('Por favor, completa todos los campos');
      return;
    }

    setLoading(true);

    const success = await login(correo, password);
    setLoading(false);

    if (success) {
      const userData = localStorage.getItem('usuario');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        if (parsedUser.rol === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      }
    } else {
      setError('Credenciales incorrectas o usuario no activo');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--app-bg)' }}>
      <div className="absolute top-4 left-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-[var(--app-hover)] transition-colors"
          style={{ color: 'var(--app-text-secondary)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Volver al mapa</span>
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
            <p className="mt-2" style={{ color: 'var(--app-text-secondary)' }}>Iniciar Sesión</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="correo" className="block text-sm font-medium mb-2" style={{ color: 'var(--app-text-primary)' }}>
                Correo Electrónico
              </label>
              {error ?
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--app-red)' }} />
                  <input
                    id="correo"
                    type="email"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid var(--app-red)',
                      color: 'var(--app-red)'
                    }}
                    placeholder="tu correo institucional"
                  />
                </div>
                : (
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--app-text-secondary)' }} />
                    <input
                      id="correo"
                      type="email"
                      value={correo}
                      onChange={(e) => setCorreo(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      style={{
                        background: 'var(--app-hover)',
                        border: '1px solid var(--app-border)',
                        color: 'var(--app-text-primary)'
                      }}
                      placeholder="tu correo institucional"
                    />
                  </div>
                )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: 'var(--app-text-primary)' }}>
                Contraseña
              </label>
              {error ?
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--app-red)' }} />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid var(--app-red)',
                      color: 'var(--app-red)'
                    }}
                    placeholder="••••••••"
                  />
                </div> : (
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--app-text-secondary)' }} />
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      style={{
                        background: 'var(--app-hover)',
                        border: '1px solid var(--app-border)',
                        color: 'var(--app-text-primary)'
                      }}
                      placeholder="••••••••"
                    />
                  </div>
                )}
            </div>

            {error && (
              <div className="px-4 py-3 rounded-lg text-sm" style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid var(--app-red)',
                color: 'var(--app-red)'
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-medium text-white transition-opacity disabled:opacity-50"
              style={{ background: 'var(--app-blue)' }}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Olvidaste tu contrasña? */}
          <div className="mt-6 text-center">
            <p className="text-sm" style={{ color: 'var(--app-text-secondary)' }}>
              {' '}
              <Link
                to="/login"
                className="font-medium hover:underline"
                style={{ color: 'var(--app-blue)' }}
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </p>
          </div>

          {/* Registro */}
          <div className="mt-6 text-center">
            <p className="text-sm" style={{ color: 'var(--app-text-secondary)' }}>
              ¿No tienes cuenta?{' '}
              <Link
                to="/register"
                className="font-medium hover:underline"
                style={{ color: 'var(--app-blue)' }}
              >
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
