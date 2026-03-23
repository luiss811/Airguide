import { CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router';


export default function MensajeRegistro() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--app-bg)' }}>
            <div className="w-full max-w-sm">
                <div className="rounded-2xl shadow-xl p-8 text-center" style={{ background: 'var(--app-header-bg)' }}>
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                        <CheckCircle className="w-8 h-8" style={{ color: 'var(--app-green)' }} />
                    </div>
                    <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--app-text-primary)' }}>
                        ¡Registro Exitoso!
                    </h2>
                    <p className="mb-6" style={{ color: 'var(--app-text-secondary)' }}>
                        Tu cuenta ha sido creada y está pendiente de validación por un administrador.
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full py-3 rounded-lg font-medium text-white"
                        style={{ background: 'var(--app-blue)' }}
                    >
                        Ir al Login
                    </button>
                </div>
            </div>
        </div>
    );
}