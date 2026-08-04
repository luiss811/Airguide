import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { CheckCircle, AlertTriangle, XCircle, Loader2, Calendar, MapPin, User, Mail, DollarSign } from 'lucide-react';

interface VerificationResult {
  message: string;
  yaConfirmado: boolean;
  invitado?: {
    nombre: string;
    apellido: string;
    correo: string;
    edad: number;
    asistencia: boolean;
    pagado: boolean;
    metodo_pago: string | null;
    monto_pagado: number | null;
    evento: string;
    edificio: string;
  };
}

export default function TicketVerification() {
  const { id_invitado } = useParams();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const verifyTicket = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL;
        const response = await fetch(`${API_URL}/eventos/confirmar-ticket/${id_invitado}`, {
          method: 'POST',
        });

        const data = await response.json();
        if (response.ok) {
          setResult(data);
        } else {
          setError(data.error || 'Código de boleto inválido o no registrado.');
        }
      } catch (err: any) {
        setError(err.message || 'Ocurrio un problema al verificar el boleto.');
      } finally {
        setLoading(false);
      }
    };

    if (id_invitado) {
      verifyTicket();
    }
  }, [id_invitado]);

  let barColor = 'bg-green-500';
  if (loading) {
    barColor = 'bg-blue-500';
  } else if (error) {
    barColor = 'bg-red-500';
  } else if (result?.yaConfirmado) {
    barColor = 'bg-amber-500';
  }

  let content;
  if (loading) {
    content = (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Verificando Boleto...</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Por favor, espera un momento</p>
      </div>
    );
  } else if (error) {
    content = (
      <div className="flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-red-50 dark:bg-red-950/30 rounded-full flex items-center justify-center mb-6">
          <XCircle className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Boleto Inválido</h2>
        <p className="text-red-500 font-medium mb-6 text-sm bg-red-50 dark:bg-red-950/20 px-4 py-2 rounded-xl">
          {error}
        </p>
        <div className="w-full border-t border-gray-100 dark:border-gray-700 pt-6">
          <Link to="/map" className="inline-flex items-center justify-center w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-app-text-secondary dark:text-white font-semibold rounded-xl transition-all">
            Ir al Mapa
          </Link>
        </div>
      </div>
    );
  } else {
    content = (
      <div className="flex flex-col">
        <div className="flex flex-col items-center text-center mb-6">
          {result?.yaConfirmado ? (
            <>
              <div className="w-20 h-20 bg-amber-50 dark:bg-amber-950/30 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-12 h-12 text-amber-500" />
              </div>
              <h2 className="text-2xl font-extrabold text-gray-950 dark:text-white">Asistencia Registrada</h2>
              <p className="text-amber-600 dark:text-amber-400 text-xs font-semibold uppercase tracking-wider mt-1">
                Ya Confirmada Previamente
              </p>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-green-50 dark:bg-green-950/30 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
              <h2 className="text-2xl font-extrabold text-gray-950 dark:text-white">Acceso Concedido</h2>
              <p className="text-green-600 dark:text-green-400 text-xs font-semibold uppercase tracking-wider mt-1">
                Entrada Válida
              </p>
            </>
          )}
        </div>

        {/* Attendee Details */}
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-5 mb-6 border border-gray-100 dark:border-gray-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500 uppercase font-semibold">Invitado</p>
              <p className="text-sm font-bold text-gray-800 dark:text-white">
                {result?.invitado?.nombre} {result?.invitado?.apellido}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
              <Mail className="w-5 h-5" />
            </div>
            <div className="truncate">
              <p className="text-xs text-gray-400 dark:text-gray-500 uppercase font-semibold">Correo y Edad</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                {result?.invitado?.correo} <span className="text-gray-400 dark:text-gray-500">({result?.invitado?.edad} años)</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500 uppercase font-semibold">Evento</p>
              <p className="text-sm font-bold text-gray-800 dark:text-white">
                {result?.invitado?.evento}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500 uppercase font-semibold">Ubicación</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-white">
                {result?.invitado?.edificio}
              </p>
            </div>
          </div>

          {result?.invitado?.pagado && (
            <div className="flex items-center gap-3 pt-2 border-t border-gray-200/50 dark:border-gray-800">
              <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 uppercase font-bold">Pago Confirmado</p>
                <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                  ${result?.invitado?.monto_pagado?.toFixed(2)} MXN via {result?.invitado?.metodo_pago}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Back actions */}
        <div className="w-full border-t border-gray-100 dark:border-gray-700 pt-6">
          <Link to="/map" className="inline-flex items-center justify-center w-full py-3 px-4 bg-app-blue hover:bg-opacity-95 text-white font-semibold rounded-xl transition-all shadow-md">
            Aceptar y Continuar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 max-w-md w-full overflow-hidden transition-all duration-300">
        <div className={`h-3 w-full ${barColor}`} />
        <div className="p-8">
          {content}
        </div>
      </div>
    </div>
  );
}
