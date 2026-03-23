import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';
import MensajeRegistro from '../components/MensajeRegistro';
import { Mail, Lock, User, CreditCard, MapPin, ArrowLeft, CheckCircle } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    matricula: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);

    const success = await register(
      formData.correo,
      formData.password,
      formData.nombre,
      formData.matricula
    );

    setLoading(false);

    if (success) {
      setSuccess(true);
    } else {
      setError('Error al crear la cuenta. Verifica que el correo o matrícula no estén registrados.');
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
            <p className="mt-2" style={{ color: 'var(--app-text-secondary)' }}>Crear Cuenta de Alumno</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium mb-2" style={{ color: 'var(--app-text-primary)' }}>
                Nombre Completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--app-text-secondary)' }} />
                <input
                  id="nombre"
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{
                    background: 'var(--app-hover)',
                    border: '1px solid var(--app-border)',
                    color: 'var(--app-text-primary)'
                  }}
                  placeholder="Juan Pérez"
                />
              </div>
            </div>

            <div>
              <label htmlFor="correo" className="block text-sm font-medium mb-2" style={{ color: 'var(--app-text-primary)' }}>
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--app-text-secondary)' }} />
                <input
                  id="correo"
                  type="email"
                  value={formData.correo}
                  onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{
                    background: 'var(--app-hover)',
                    border: '1px solid var(--app-border)',
                    color: 'var(--app-text-primary)'
                  }}
                  placeholder="tu@universidad.edu"
                />
              </div>
            </div>

            <div>
              <label htmlFor="matricula" className="block text-sm font-medium mb-2" style={{ color: 'var(--app-text-primary)' }}>
                Matrícula
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--app-text-secondary)' }} />
                <input
                  id="matricula"
                  type="text"
                  value={formData.matricula}
                  onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{
                    background: 'var(--app-hover)',
                    border: '1px solid var(--app-border)',
                    color: 'var(--app-text-primary)'
                  }}
                  placeholder="Matrícula"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: 'var(--app-text-primary)' }}>
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--app-text-secondary)' }} />
                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{
                    background: 'var(--app-hover)',
                    border: '1px solid var(--app-border)',
                    color: 'var(--app-text-primary)'
                  }}
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2" style={{ color: 'var(--app-text-primary)' }}>
                Confirmar Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--app-text-secondary)' }} />
                <input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{
                    background: 'var(--app-hover)',
                    border: '1px solid var(--app-border)',
                    color: 'var(--app-text-primary)'
                  }}
                  placeholder="••••••••"
                />
              </div>
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

            {success && (
              <MensajeRegistro />
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-medium text-white transition-opacity disabled:opacity-50"
              style={{ background: 'var(--app-blue)' }}
            >
              {loading ? 'Registrando...' : 'Crear Cuenta'}
            </button>
          </form>

          {/* Login */}
          <div className="mt-6 text-center">
            <p className="text-sm" style={{ color: 'var(--app-text-secondary)' }}>
              ¿Ya tienes cuenta?{' '}
              <Link
                to="/login"
                className="font-medium hover:underline"
                style={{ color: 'var(--app-blue)' }}
              >
                Inicia sesión
              </Link>
            </p>
          </div>

          {/* Nota */}
          <div className="mt-6 p-4 rounded-lg" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid var(--app-blue)' }}>
            <p className="text-xs" style={{ color: 'var(--app-text-secondary)' }}>
              <strong style={{ color: 'var(--app-blue)' }}>Nota:</strong> Tu cuenta será revisada por un administrador.
              Una vez aprobada, podrás acceder a todas las funciones de AirGuide.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
