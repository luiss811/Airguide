import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { CheckCircle, XCircle, Loader2, ArrowLeft, Calendar, MapPin, DollarSign, CreditCard, Award, QrCode, Download, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import { QRCodeSVG } from 'qrcode.react';

interface EventoDetails {
  id_evento: number;
  nombre: string;
  descripcion: string | null;
  fecha_inicio: string;
  fecha_fin: string;
  id_edificio: number;
  es_de_paga: boolean;
  precio: number | string | null;
  edificio?: {
    nombre: string;
  };
}

interface GuestDetails {
  id_invitado: number;
  id_evento: number;
  nombre: string;
  apellido: string;
  edad: number;
  correo: string;
  pagado: boolean;
  metodo_pago: string | null;
  monto_pagado: number | null;
}

const validateCardPayment = (cardNumber: string, cardExpiry: string, cardCvv: string, cardHolder: string) => {
  if (cardNumber.replace(/\s/g, '').length !== 16) {
    throw new Error('Número de tarjeta inválido. Debe contener 16 dígitos.');
  }
  if (cardExpiry.length !== 5 || !cardExpiry.includes('/')) {
    throw new Error('Fecha de expiración inválida (MM/AA).');
  }
  if (cardCvv.length < 3) {
    throw new Error('Código CVV inválido.');
  }
  if (!cardHolder) {
    throw new Error('Indica el nombre del titular de la tarjeta.');
  }
};

const downloadTicketPdf = (guest: GuestDetails, event: EventoDetails) => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a6'
    });

    const primaryColor = event.es_de_paga ? [217, 119, 6] : [59, 130, 246]; // Amber for paid, blue for free
    const textColor = [17, 24, 39];
    const lightBg = [249, 250, 251];

    // Header Banner
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 105, 25, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('BOLETO DE ENTRADA', 52.5, 10, { align: 'center' });
    doc.setFontSize(7.5);
    doc.text(event.es_de_paga ? 'PAGO COMPROBADO' : 'REGISTRO GRATUITO', 52.5, 17, { align: 'center' });

    // Body container
    doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    doc.rect(5, 30, 95, 110, 'F');

    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(event.nombre.slice(0, 38), 10, 39);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(`Ubicacion: ${event.edificio?.nombre || 'Sin edificio'}`, 10, 45);
    doc.text(`Fecha: ${new Date(event.fecha_inicio).toLocaleString('es-MX')}`, 10, 50);

    doc.setDrawColor(209, 213, 219);
    doc.setLineDashPattern([1.5, 1.5], 0);
    doc.line(10, 55, 95, 55);

    // Guest details
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('Invitado:', 10, 62);
    doc.setFont('helvetica', 'normal');
    doc.text(`${guest.nombre} ${guest.apellido}`, 30, 62);

    doc.setFont('helvetica', 'bold');
    doc.text('Correo:', 10, 68);
    doc.setFont('helvetica', 'normal');
    doc.text(guest.correo, 30, 68);

    doc.setFont('helvetica', 'bold');
    doc.text('Edad:', 10, 74);
    doc.setFont('helvetica', 'normal');
    doc.text(`${guest.edad} anos`, 30, 74);

    if (event.es_de_paga) {
      doc.setFont('helvetica', 'bold');
      doc.text('Monto:', 10, 80);
      doc.setFont('helvetica', 'normal');
      doc.text(`$${Number.parseFloat(event.precio as string).toFixed(2)} MXN`, 30, 80);

      doc.setFont('helvetica', 'bold');
      doc.text('Metodo:', 10, 86);
      doc.setFont('helvetica', 'normal');
      doc.text(guest.metodo_pago || 'Confirmado', 30, 86);
    }

    doc.setLineDashPattern([0, 0], 0);
    doc.line(10, 92, 95, 92);

    const ticketUrl = `${globalThis.location.origin}/eventos/ticket/${guest.id_invitado}/verificar`;
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      doc.addImage(img, 'PNG', 37.5, 96, 30, 30);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.5);
      doc.setTextColor(107, 114, 128);
      doc.text('Muestra este codigo en el acceso para registrar asistencia', 52.5, 134, { align: 'center' });

      doc.save(`Boleto_AirGuide_${guest.id_invitado}.pdf`);
      toast.success('Boleto descargado exitosamente');
    };
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(ticketUrl)}`;
  } catch (err) {
    console.error(err);
    toast.error('Error al generar PDF del boleto');
  }
};

export default function EventConfirmation() {
  const { id } = useParams();
  const [eventData, setEventData] = useState<EventoDetails | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [registeredGuest, setRegisteredGuest] = useState<GuestDetails | null>(null);
  const [error, setError] = useState('');

  // Form states
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [edad, setEdad] = useState('');
  const [correo, setCorreo] = useState('');

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'spei' | 'cash'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);

  const getSubmitButtonContent = () => {
    if (registering || processingPayment) {
      return (
        <>
          <Loader2 className="w-5 h-5 mr-2.5 animate-spin" />
          {processingPayment ? 'Procesando Pago Seguro...' : 'Registrando asistencia...'}
        </>
      );
    }
    if (eventData?.es_de_paga) {
      return `Pagar $${Number.parseFloat(eventData.precio as string).toFixed(2)} MXN y Registrarse`;
    }
    return 'Confirmar Asistencia';
  };

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL;
        const response = await fetch(`${API_URL}/eventos/${id}`);
        if (!response.ok) throw new Error('No se pudieron obtener los detalles del evento.');
        const data = await response.json();
        setEventData(data);
      } catch (err: any) {
        setError(err.message || 'Error al conectar con el servidor.');
      } finally {
        setLoadingEvent(false);
      }
    };
    if (id) fetchEvent();
  }, [id]);

  const handleRegister = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!nombre || !apellido || !edad || !correo) {
      toast.error('Por favor, completa todos los campos del registro.');
      return;
    }

    setRegistering(true);
    setError('');

    try {
      let isPaid = false;
      let payMethodStr = 'Free';
      let paidAmt = null;

      if (eventData?.es_de_paga) {
        setProcessingPayment(true);
        // Simulate payment gateway delay (1.5s)
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Validation rules for simulated credit card checkout
        if (paymentMethod === 'card') {
          validateCardPayment(cardNumber, cardExpiry, cardCvv, cardHolder);
          payMethodStr = 'Tarjeta de Crédito/Débito';
        } else if (paymentMethod === 'paypal') {
          payMethodStr = 'PayPal';
        } else if (paymentMethod === 'spei') {
          payMethodStr = 'Transferencia SPEI';
        } else if (paymentMethod === 'cash') {
          payMethodStr = 'Efectivo / OXXO';
        }

        isPaid = true;
        paidAmt = Number.parseFloat(eventData.precio as string);
        setProcessingPayment(false);
      }

      const API_URL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${API_URL}/eventos/${id}/registrar-invitado`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          apellido,
          edad: Number.parseInt(edad),
          correo,
          pagado: isPaid,
          metodo_pago: payMethodStr,
          monto_pagado: paidAmt
        })
      });

      const data = await response.json();
      if (response.ok) {
        setRegisteredGuest(data);
        toast.success(isPaid ? '¡Pago y registro completados con éxito!' : '¡Registro completado con éxito!');
      } else {
        throw new Error(data.error || 'Error al procesar el registro.');
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error inesperado.');
      setProcessingPayment(false);
    } finally {
      setRegistering(false);
    }
  };

  if (loadingEvent) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-app-blue animate-spin mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Cargando detalles del evento...</h2>
        </div>
      </div>
    );
  }

  if (error && !eventData) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-sm w-full p-8 text-center border border-red-100 dark:border-red-950/20">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error de Carga</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <Link to="/map" className="inline-flex items-center text-app-blue hover:underline font-semibold">
            <ArrowLeft className="w-4 h-4 mr-2" /> Volver al mapa
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center py-12 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden transition-all duration-300 border border-gray-100 dark:border-gray-700">

        {/* Banner */}
        <div className="bg-app-blue p-8 text-white relative">
          <Link to="/map" className="absolute top-6 left-6 text-white/80 hover:text-white transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="text-center pt-2">
            <Award className="w-10 h-10 mx-auto mb-3 text-white opacity-95 animate-pulse" />
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight truncate">
              {eventData?.nombre}
            </h1>
            <p className="text-xs text-white/80 mt-1.5 flex items-center justify-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5" />
              {eventData?.fecha_inicio && new Date(eventData.fecha_inicio).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        {/* Dynamic content rendering */}
        <div className="p-8">
          {registeredGuest ? (
            /* Ticket Card View */
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green-50 dark:bg-green-950/30 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-1">¡Registro Completado!</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center">
                Te has registrado exitosamente al evento. Aquí tienes tu boleto de acceso digital.
              </p>

              {/* Graphic Ticket Component */}
              <div className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-inner text-left relative overflow-hidden mb-6">
                <div className="absolute top-0 right-0 w-24 h-24 bg-app-blue/5 rounded-full -mr-8 -mt-8" />

                <h3 className="text-base font-extrabold text-gray-950 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-800 pb-2">
                  Pase de Acceso
                </h3>

                <div className="space-y-2 mb-6">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Nombre:</strong> {registeredGuest.nombre} {registeredGuest.apellido}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Correo:</strong> {registeredGuest.correo}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Evento:</strong> {eventData?.nombre}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Ubicación:</strong> {eventData?.edificio?.nombre || 'Instalación Universitaria'}
                  </p>
                  {eventData?.es_de_paga && (
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4" /> Pagado: ${Number.parseFloat(eventData.precio as string).toFixed(2)} MXN
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-center justify-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 w-fit mx-auto">
                  <QRCodeSVG
                    value={`${globalThis.location.origin}/eventos/ticket/${registeredGuest.id_invitado}/verificar`}
                    size={130}
                    bgColor={"#ffffff"}
                    fgColor={"#000000"}
                    level={"H"}
                  />
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-2.5 flex items-center gap-1">
                    <QrCode className="w-3 h-3" /> Escanear al entrar
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 w-full">
                <button
                  onClick={() => downloadTicketPdf(registeredGuest, eventData!)}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-app-blue hover:bg-opacity-90 text-white font-bold rounded-xl transition-all shadow-md cursor-pointer"
                >
                  <Download className="w-5 h-5" />
                  Descargar Boleto PDF
                </button>
                <Link
                  to="/map"
                  className="flex items-center justify-center py-3 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-white font-semibold rounded-xl transition-all text-center"
                >
                  Regresar al Mapa
                </Link>
              </div>
            </div>
          ) : (
            /* Registration Form View */
            <form onSubmit={handleRegister} className="space-y-5">
                {error && (
                  <div className="p-3.5 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 text-sm rounded-xl flex items-start">
                    <XCircle className="w-5 h-5 mr-2.5 flex-shrink-0 mt-0.5" />
                    <span className="text-left font-medium">{error}</span>
                  </div>
                )}

                {/* Event Description (Flyer text) */}
                {eventData?.descripcion && (
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 text-left text-sm text-gray-600 dark:text-gray-300">
                    <p className="font-bold text-gray-800 dark:text-white mb-1">Acerca del evento:</p>
                    <p>{eventData.descripcion}</p>
                  </div>
                )}

                {/* Location Summary card */}
                <div className="flex items-center gap-3 bg-app-blue/5 p-4 rounded-2xl text-left border border-app-blue/10 text-gray-700 dark:text-gray-300">
                  <MapPin className="w-6 h-6 text-app-blue flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Ubicación física</p>
                    <p className="text-sm font-bold text-gray-950 dark:text-white">{eventData?.edificio?.nombre || 'Instalación'}</p>
                  </div>
                </div>

                {/* Guest Form Fields */}
                <div className="space-y-4 text-left">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Información del Asistente</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="nombre_asistente" className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Nombre *</label>
                      <input
                        id="nombre_asistente"
                        type="text"
                        required
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-app-blue text-sm"
                        placeholder="Juan"
                      />
                    </div>
                    <div>
                      <label htmlFor="apellido_asistente" className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Apellido *</label>
                      <input
                        id="apellido_asistente"
                        type="text"
                        required
                        value={apellido}
                        onChange={(e) => setApellido(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-app-blue text-sm"
                        placeholder="Pérez"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1">
                      <label htmlFor="edad_asistente" className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Edad *</label>
                      <input
                        id="edad_asistente"
                        type="number"
                        required
                        min="1"
                        max="120"
                        value={edad}
                        onChange={(e) => setEdad(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-app-blue text-sm"
                        placeholder="21"
                      />
                    </div>
                    <div className="col-span-2">
                      <label htmlFor="correo_asistente" className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Correo Electrónico *</label>
                      <input
                        id="correo_asistente"
                        type="email"
                        required
                        value={correo}
                        onChange={(e) => setCorreo(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-app-blue text-sm"
                        placeholder="juan@correo.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Pricing & Checkout Block (Visible if paid event) */}
                {eventData?.es_de_paga && (
                  <div className="border-t border-gray-200 dark:border-gray-800 pt-5 text-left space-y-4">
                    <div className="flex justify-between items-center bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-amber-500" />
                        <span className="font-bold text-gray-950 dark:text-white text-sm">Costo del boleto:</span>
                      </div>
                      <span className="text-lg font-black text-amber-600 dark:text-amber-400">
                        ${Number.parseFloat(eventData.precio as string).toFixed(2)} MXN
                      </span>
                    </div>

                    <div className="space-y-3">
                      <span className="block text-xs font-bold text-gray-500 dark:text-gray-400">Método de Pago</span>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('card')}
                          className={`py-2 px-3 border rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${paymentMethod === 'card' ? 'border-app-blue bg-app-blue/5 font-bold text-app-blue' : 'border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400'}`}
                        >
                          <CreditCard className="w-4 h-4" />
                          <span className="text-[10px]">Tarjeta</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('paypal')}
                          className={`py-2 px-3 border rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${paymentMethod === 'paypal' ? 'border-app-blue bg-app-blue/5 font-bold text-app-blue' : 'border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400'}`}
                        >
                          <span className="text-xs font-bold tracking-tight italic">PayPal</span>
                          <span className="text-[10px]">Portal</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('spei')}
                          className={`py-2 px-3 border rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${paymentMethod === 'spei' ? 'border-app-blue bg-app-blue/5 font-bold text-app-blue' : 'border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400'}`}
                        >
                          <span className="text-xs font-bold">SPEI</span>
                          <span className="text-[10px]">Transfer</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('cash')}
                          className={`py-2 px-3 border rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${paymentMethod === 'cash' ? 'border-app-blue bg-app-blue/5 font-bold text-app-blue' : 'border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400'}`}
                        >
                          <span className="text-xs font-bold">Efectivo</span>
                          <span className="text-[10px]">OXXO</span>
                        </button>
                      </div>
                    </div>

                    {/* Simulated Card form if credit card is selected */}
                    {paymentMethod === 'card' && (
                      <div className="bg-gray-50 dark:bg-gray-900/50 p-5 rounded-2xl border border-gray-150 dark:border-gray-800 space-y-3.5 animate-fadeIn">
                        <h4 className="text-xs font-extrabold text-gray-400 uppercase">Tarjeta Bancaria (Simulación)</h4>

                        <div>
                          <label htmlFor="card_number" className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1">NÚMERO DE TARJETA</label>
                          <input
                            id="card_number"
                            type="text"
                            maxLength={19}
                            value={cardNumber}
                            onChange={(e) => {
                              // Automatically add spaces to number string
                              const v = e.target.value.replace(/\s+/g, '').replace(/\D/g, '');
                              const matches = v.match(/\d{4,16}/g);
                              const match = matches?.[0] || '';
                              const parts = [];
                              for (let i = 0, len = match.length; i < len; i += 4) {
                                parts.push(match.substring(i, i + 4));
                              }
                              if (parts.length > 0) {
                                setCardNumber(parts.join(' '));
                              } else {
                                setCardNumber(v);
                              }
                            }}
                            className="w-full px-3.5 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-1.5 focus:ring-app-blue text-sm font-mono tracking-widest"
                            placeholder="4152 3456 7890 1234"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="card_expiry" className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1">EXPIRACIÓN (MM/AA)</label>
                            <input
                              id="card_expiry"
                              type="text"
                              maxLength={5}
                              value={cardExpiry}
                              onChange={(e) => {
                                let v = e.target.value.replace(/\D/g, '');
                                if (v.length > 2) {
                                  v = v.substring(0, 2) + '/' + v.substring(2, 4);
                                }
                                setCardExpiry(v);
                              }}
                              className="w-full px-3.5 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-1.5 focus:ring-app-blue text-sm font-mono"
                              placeholder="12/28"
                            />
                          </div>
                          <div>
                            <label htmlFor="card_cvv" className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1">CVV (SEGURIDAD)</label>
                            <input
                              id="card_cvv"
                              type="password"
                              maxLength={4}
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                              className="w-full px-3.5 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-1.5 focus:ring-app-blue text-sm font-mono"
                              placeholder="123"
                            />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="card_holder" className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1">NOMBRE EN LA TARJETA</label>
                          <input
                            id="card_holder"
                            type="text"
                            value={cardHolder}
                            onChange={(e) => setCardHolder(e.target.value)}
                            className="w-full px-3.5 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-1.5 focus:ring-app-blue text-sm"
                            placeholder="TITULAR DE LA TARJETA"
                          />
                        </div>
                      </div>
                    )}

                    {paymentMethod !== 'card' && (
                      <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-150 dark:border-gray-800 text-xs text-gray-500">
                        Al presionar registrarte, serás redirigido a una confirmación segura de {paymentMethod.toUpperCase()} simulando la validación del fondo.
                      </div>
                    )}
                  </div>
                )}

                {/* Submit Buttons */}
                <button
                  type="submit"
                  disabled={registering || processingPayment}
                  className="w-full py-3.5 px-4 bg-app-blue hover:bg-opacity-95 text-white font-extrabold rounded-xl transition-all disabled:opacity-50 flex justify-center items-center cursor-pointer shadow-md text-sm"
                >
                  {getSubmitButtonContent()}
                </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
