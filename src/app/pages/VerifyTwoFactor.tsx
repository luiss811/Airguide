import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../components/ui/input-otp';
import { MapPin, Mail, ArrowLeft, RefreshCw, ShieldCheck } from 'lucide-react';

const RESEND_COOLDOWN = 60; // seconds

export default function VerifyTwoFactor() {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyTwoFactor, resendOtp } = useAuth();

  // Correo passed via navigation state
  const correo: string = (location.state as { correo?: string })?.correo || '';

  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');
  const [cooldown, setCooldown] = useState(0);

  // Redirect if no correo in state
  useEffect(() => {
    if (!correo) {
      navigate('/login', { replace: true });
    }
  }, [correo, navigate]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Auto-submit when all 6 digits filled
  useEffect(() => {
    if (codigo.length === 6) {
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codigo]);

  const handleSubmit = async () => {
    if (codigo.length !== 6) {
      setError('Ingresa el código de 6 dígitos.');
      return;
    }

    setError('');
    setResendSuccess('');
    setLoading(true);

    const result = await verifyTwoFactor(correo, codigo);
    setLoading(false);

    if (result.success) {
      const stored = localStorage.getItem('usuario');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.rol === 'admin') {
          navigate('/admin/analytics', { replace: true });
        } else {
          navigate('/map', { replace: true });
        }
      }
    } else {
      setError(result.error || 'Código incorrecto o expirado.');
      setCodigo('');
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resendLoading) return;

    setResendLoading(true);
    setError('');
    setResendSuccess('');

    await resendOtp(correo);

    setResendLoading(false);
    setResendSuccess('Nuevo código enviado. Revisa tu bandeja de entrada.');
    setCooldown(RESEND_COOLDOWN);
    setCodigo('');
  };

  const maskedEmail = correo
    ? correo.replace(/(.{2}).+(@.+)/, '$1***$2')
    : '';

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--app-bg)' }}
    >
      {/* Top-left back button */}
      <div className="absolute top-4 left-4">
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-[var(--app-hover)] transition-colors"
          style={{ color: 'var(--app-text-secondary)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Volver al inicio</span>
        </button>
      </div>

      {/* Theme toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <div
          className="rounded-2xl shadow-xl p-8"
          style={{
            background: 'var(--app-header-bg)',
            boxShadow: '0 20px 25px -5px var(--app-shadow)',
          }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
              style={{ background: 'var(--app-blue)' }}
            >
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--app-text-primary)' }}>
              Verificación en dos pasos
            </h1>
            <div
              className="mt-3 flex items-center justify-center gap-2 text-sm"
              style={{ color: 'var(--app-text-secondary)' }}
            >
              <Mail className="w-4 h-4 shrink-0" />
              <span>
                Código enviado a <strong>{maskedEmail}</strong>
              </span>
            </div>
          </div>

          {/* OTP Input */}
          <div className="flex flex-col items-center gap-6">
            <div className="flex flex-col items-center gap-3">
              <label
                className="text-sm font-medium"
                style={{ color: 'var(--app-text-primary)' }}
              >
                Ingresa el código de 6 dígitos
              </label>
              <InputOTP
                maxLength={6}
                value={codigo}
                onChange={(val) => {
                  setError('');
                  setCodigo(val);
                }}
                disabled={loading}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            {/* Error message */}
            {error && (
              <div
                className="w-full px-4 py-3 rounded-lg text-sm text-center"
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid var(--app-red)',
                  color: 'var(--app-red)',
                }}
              >
                {error}
              </div>
            )}

            {/* Success message */}
            {resendSuccess && !error && (
              <div
                className="w-full px-4 py-3 rounded-lg text-sm text-center"
                style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid var(--app-green)',
                  color: 'var(--app-green)',
                }}
              >
                {resendSuccess}
              </div>
            )}

            {/* Verify button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || codigo.length !== 6}
              className="w-full py-3 rounded-lg font-medium text-white transition-opacity disabled:opacity-50"
              style={{ background: 'var(--app-blue)' }}
            >
              {loading ? 'Verificando...' : 'Verificar código'}
            </button>

            {/* Resend */}
            <div className="flex flex-col items-center gap-1">
              <p className="text-sm" style={{ color: 'var(--app-text-secondary)' }}>
                ¿No recibiste el código?
              </p>
              <button
                type="button"
                onClick={handleResend}
                disabled={cooldown > 0 || resendLoading}
                className="flex items-center gap-2 text-sm font-medium transition-opacity disabled:opacity-50"
                style={{ color: cooldown > 0 ? 'var(--app-text-secondary)' : 'var(--app-blue)' }}
              >
                <RefreshCw className={`w-4 h-4 ${resendLoading ? 'animate-spin' : ''}`} />
                {cooldown > 0
                  ? `Reenviar en ${cooldown}s`
                  : resendLoading
                  ? 'Enviando...'
                  : 'Reenviar código'}
              </button>
            </div>

            {/* Info */}
            <p className="text-xs text-center" style={{ color: 'var(--app-text-secondary)' }}>
              El código expira en <strong>10 minutos</strong>. Revisa también tu carpeta de spam.
            </p>
          </div>
        </div>

        {/* Branding */}
        <div className="mt-6 flex items-center justify-center gap-2">
          <MapPin className="w-4 h-4" style={{ color: 'var(--app-blue)' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--app-text-secondary)' }}>
            AirGuide
          </span>
        </div>
      </div>
    </div>
  );
}
