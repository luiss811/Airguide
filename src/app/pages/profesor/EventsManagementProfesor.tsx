import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar, Building2, Search, QrCode, Download } from 'lucide-react';
import { useEdificios } from '../../hooks';
import { useAuth } from '../../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';

const API_URL = import.meta.env.VITE_API_URL;

export interface Evento {
  id_evento: number;
  nombre: string;
  descripcion?: string | null;
  fecha_inicio: string;
  fecha_fin: string;
  id_edificio: number;
  publico: boolean;
  activo: boolean;
  id_creador?: number;
  prioridad_evento?: number;
  total_invitados?: number;
  asistentes_confirmados?: number;
  es_de_paga?: boolean;
  precio?: number | string | null;
  edificio?: {
    id_edificio: number;
    nombre: string;
    tipo: string;
    latitud: number;
    longitud: number;
  };
}

export default function EventsManagementProfesor() {
  const { edificios } = useEdificios();
  const { user } = useAuth();
  
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrEvento, setQrEvento] = useState<Evento | null>(null);
  const [editingEvento, setEditingEvento] = useState<Evento | null>(null);
  const [deletingEvento, setDeletingEvento] = useState<Evento | null>(null);

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    id_edificio: '',
    total_invitados: 0,
    publico: true,
    activo: true,
    es_de_paga: false,
    precio: 0
  });

  const formatDatetimeForInput = (isoString: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      return d.toISOString().slice(0, 16);
    } catch { 
      return ''; 
    }
  };

  // Fetch events
  const fetchEventos = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No autorizado');

      const response = await fetch(`${API_URL}/docentes/eventos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Error al cargar eventos');
      const data = await response.json();
      setEventos(data);
    } catch (err: any) {
      toast.error(err.message || 'Error al obtener eventos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const eventosFiltrados = eventos.filter(e =>
    e.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No autorizado');

      const payload = {
        ...formData,
        id_edificio: Number.parseInt(formData.id_edificio),
        total_invitados: Number.parseInt(formData.total_invitados.toString()) || 0,
        es_de_paga: formData.es_de_paga,
        precio: formData.es_de_paga ? Number.parseFloat(formData.precio.toString()) : null
      };

      let response;
      if (editingEvento) {
        response = await fetch(`${API_URL}/docentes/eventos/${editingEvento.id_evento}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch(`${API_URL}/docentes/eventos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al guardar evento');
      }

      if (result.warning) {
        toast.info(result.warning, { duration: 6000 });
      } else {
        toast.success(editingEvento ? 'Evento actualizado correctamente' : 'Evento creado correctamente');
      }

      setShowModal(false);
      resetForm();
      fetchEventos();
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar evento');
    }
  };

  const handleEdit = (evento: Evento) => {
    setEditingEvento(evento);
    setFormData({
      nombre: evento.nombre,
      descripcion: evento.descripcion || '',
      fecha_inicio: formatDatetimeForInput(evento.fecha_inicio),
      fecha_fin: formatDatetimeForInput(evento.fecha_fin),
      id_edificio: evento.id_edificio.toString(),
      total_invitados: evento.total_invitados || 0,
      publico: evento.publico,
      activo: evento.activo,
      es_de_paga: evento.es_de_paga || false,
      precio: evento.precio ? Number.parseFloat(evento.precio.toString()) : 0
    });
    setShowModal(true);
  };

  const handleDeleteClick = (evento: Evento) => {
    setDeletingEvento(evento);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingEvento) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No autorizado');

      const response = await fetch(`${API_URL}/docentes/eventos/${deletingEvento.id_evento}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al eliminar evento');
      }

      toast.success('Evento eliminado correctamente');
      setShowDeleteModal(false);
      setDeletingEvento(null);
      fetchEventos();
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar evento');
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      fecha_inicio: '',
      fecha_fin: '',
      id_edificio: '',
      total_invitados: 0,
      publico: true,
      activo: true,
      es_de_paga: false,
      precio: 0
    });
    setEditingEvento(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const downloadEventPdf = (evento: Evento) => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const primaryColor = [59, 130, 246]; // #3b82f6 (blue)
      const textColor = [17, 24, 39]; // #111827
      const secondaryTextColor = [107, 114, 128]; // #6b7280

      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 210, 40, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('AIRGUIDE - EVENTO', 15, 25);

      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.setFontSize(20);
      doc.text(evento.nombre, 15, 55);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(secondaryTextColor[0], secondaryTextColor[1], secondaryTextColor[2]);
      doc.text('Detalles y registro de asistencia del evento', 15, 62);

      doc.setDrawColor(229, 231, 235);
      doc.line(15, 67, 195, 67);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      
      doc.text('Ubicacion:', 15, 77);
      doc.setFont('helvetica', 'normal');
      doc.text(evento.edificio?.nombre || 'Sin edificio', 45, 77);

      doc.setFont('helvetica', 'bold');
      doc.text('Fecha Inicio:', 15, 85);
      doc.setFont('helvetica', 'normal');
      doc.text(new Date(evento.fecha_inicio).toLocaleString('es-MX'), 45, 85);

      doc.setFont('helvetica', 'bold');
      doc.text('Fecha Fin:', 15, 93);
      doc.setFont('helvetica', 'normal');
      doc.text(new Date(evento.fecha_fin).toLocaleString('es-MX'), 45, 93);

      doc.setFont('helvetica', 'bold');
      doc.text('Costo:', 15, 101);
      doc.setFont('helvetica', 'normal');
      doc.text(evento.es_de_paga ? `$${Number.parseFloat(evento.precio as string).toFixed(2)} MXN` : 'Gratuito', 45, 101);

      if (evento.descripcion) {
        doc.setFont('helvetica', 'bold');
        doc.text('Descripcion:', 15, 110);
        doc.setFont('helvetica', 'normal');
        const splitDesc = doc.splitTextToSize(evento.descripcion, 180);
        doc.text(splitDesc, 15, 116);
      }

      const qrValue = `${globalThis.location.origin}/eventos/${evento.id_evento}/confirmar`;
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('ESCANEA EL CODIGO QR PARA REGISTRARTE', 105, 140, { align: 'center' });
        doc.addImage(img, 'PNG', 65, 148, 80, 80);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(secondaryTextColor[0], secondaryTextColor[1], secondaryTextColor[2]);
        doc.text('AirGuide - Sistema de Localizacion de Interiores', 105, 240, { align: 'center' });
        doc.text(`Enlace: ${qrValue}`, 105, 245, { align: 'center' });

        doc.save(`Detalles_Evento_${evento.id_evento}.pdf`);
        toast.success('Boleto/Flyer PDF descargado con éxito');
      };
      img.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrValue)}`;
    } catch (err) {
      console.error(err);
      toast.error('Error al generar el PDF del evento.');
    }
  };

  const isEventoActivo = (evento: Evento) => {
    const now = new Date();
    const inicio = new Date(evento.fecha_inicio);
    const fin = new Date(evento.fecha_fin);
    return now >= inicio && now <= fin && evento.activo;
  };

  const isEventoProximo = (evento: Evento) => {
    const now = new Date();
    const inicio = new Date(evento.fecha_inicio);
    return inicio > now && evento.activo;
  };

  const renderEstadoBadge = (evento: Evento) => {
    if (isEventoActivo(evento)) {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 w-fit">
          En curso
        </span>
      );
    }
    if (isEventoProximo(evento)) {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 w-fit">
          Próximo
        </span>
      );
    }
    return (
      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 w-fit">
        Finalizado
      </span>
    );
  };

  const renderPrecioBadge = (evento: Evento) => {
    if (evento.es_de_paga) {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 w-fit">
          ${Number.parseFloat(evento.precio as string).toFixed(2)} MXN
        </span>
      );
    }
    return (
      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 w-fit">
        Gratuito
      </span>
    );
  };

  const renderTableContent = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan={5} className="px-6 py-12 text-center">
            <div className="flex items-center justify-center gap-3">
              <div className="w-6 h-6 border-2 border-[var(--app-blue)] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-[var(--app-text-secondary)] font-medium">Cargando eventos...</span>
            </div>
          </td>
        </tr>
      );
    }

    if (eventosFiltrados.length === 0) {
      return (
        <tr>
          <td colSpan={5} className="px-6 py-12 text-center text-sm text-[var(--app-text-secondary)]">
            No se encontraron eventos agendados
          </td>
        </tr>
      );
    }

    return eventosFiltrados.map((evento) => {
      const isOwner = user && evento.id_creador === user.id;
      return (
        <tr key={evento.id_evento} className="hover:bg-[var(--app-hover)] transition-colors">
          <td className="px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 p-2.5 rounded-lg bg-[var(--app-blue-light)] text-[var(--app-blue)]">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-semibold text-[var(--app-text-primary)]">
                  {evento.nombre}
                </div>
                {evento.descripcion && (
                  <div className="text-xs text-[var(--app-text-secondary)] line-clamp-1 mt-0.5">
                    {evento.descripcion}
                  </div>
                )}
              </div>
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[var(--app-blue)]" />
              <span className="text-sm text-[var(--app-text-primary)]">
                {evento.edificio?.nombre || 'Sin edificio'}
              </span>
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="text-sm text-[var(--app-text-primary)] font-medium">
              {new Date(evento.fecha_inicio).toLocaleString('es-MX', {
                day: '2-digit', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
              })}
            </div>
            <div className="text-xs text-[var(--app-text-secondary)] mt-0.5">
              hasta {new Date(evento.fecha_fin).toLocaleString('es-MX', {
                day: '2-digit', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
              })}
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="flex flex-col gap-1">
              {renderEstadoBadge(evento)}
              {renderPrecioBadge(evento)}
            </div>
            {evento.total_invitados && evento.total_invitados > 0 ? (
              <div className="text-xs text-[var(--app-text-secondary)] mt-1 font-medium">
                {evento.asistentes_confirmados || 0} / {evento.total_invitados} confirmados
              </div>
            ) : null}
          </td>
          <td className="px-6 py-4 text-right text-sm font-medium">
            <div className="flex items-center justify-end gap-1">
              {isOwner && (
                <button
                  type="button"
                  onClick={() => { setQrEvento(evento); setShowQrModal(true); }}
                  className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/20 rounded-lg transition-colors"
                  title="Generar QR de Check-in"
                >
                  <QrCode className="w-4.5 h-4.5" />
                </button>
              )}
              {isOwner ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleEdit(evento)}
                    className="p-2 text-[var(--app-blue)] hover:bg-[var(--app-blue-light)] rounded-lg transition-colors"
                    title="Editar Evento"
                  >
                    <Edit className="w-4.5 h-4.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteClick(evento)}
                    className="p-2 text-red-500 hover:bg-red-500/15 rounded-lg transition-colors"
                    title="Eliminar Evento"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </>
              ) : (
                <span className="text-xs text-[var(--app-text-secondary)] italic mr-2 select-none">
                    Evento de otro docente
                </span>
              )}
            </div>
          </td>
        </tr>
      );
    });
  };

  return (
    <div className='min-h-screen bg-[var(--app-background)] p-6 space-y-6'>
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-[var(--app-text-primary)]">
            Mis Eventos
          </h2>
          <p className="text-sm text-[var(--app-text-secondary)] mt-1">
            Administra tus conferencias, reuniones y asesorías.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-3 bg-[var(--app-blue)] text-white font-bold rounded-lg hover:opacity-90 transition-opacity shadow-md cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Nuevo Evento
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--app-text-secondary)]" />
        <input
          type="text"
          placeholder="Buscar eventos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[var(--app-hover)] border border-[var(--app-border)] rounded-lg text-[var(--app-text-primary)] placeholder:text-[var(--app-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--app-blue)] transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-[var(--app-card-bg)] border border-[var(--app-border)] rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[var(--app-hover)] border-b border-[var(--app-border)]">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--app-text-secondary)] uppercase tracking-wider">
                Evento
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--app-text-secondary)] uppercase tracking-wider">
                Ubicación
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--app-text-secondary)] uppercase tracking-wider">
                Fechas
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--app-text-secondary)] uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-[var(--app-text-secondary)] uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--app-border)]">
            {renderTableContent()}
          </tbody>
        </table>
      </div>

      {/* Modal Crear/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--app-card-bg)] rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[var(--app-border)]">
            <div className="p-6 border-b border-[var(--app-border)]">
              <h3 className="text-xl font-bold text-[var(--app-text-primary)]">
                {editingEvento ? 'Editar Evento' : 'Nuevo Evento'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label htmlFor="nombre_evento" className="block text-sm font-semibold text-[var(--app-text-primary)] mb-1">
                  Nombre del Evento*
                </label>
                <input
                  id="nombre_evento"
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[var(--app-hover)] border border-[var(--app-border)] rounded-lg text-[var(--app-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--app-blue)] transition-all"
                  placeholder="Ej: Asesoría de Programación"
                />
              </div>

              <div>
                <label htmlFor="descripcion_evento" className="block text-sm font-semibold text-[var(--app-text-primary)] mb-1">
                  Descripción
                </label>
                <textarea
                  id="descripcion_evento"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[var(--app-hover)] border border-[var(--app-border)] rounded-lg text-[var(--app-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--app-blue)] transition-all"
                  rows={3}
                  placeholder="Describe brevemente de qué tratará el evento"
                />
              </div>

              <div>
                <label htmlFor="edificio_evento" className="block text-sm font-semibold text-[var(--app-text-primary)] mb-1">
                  Edificio*
                </label>
                <select
                  id="edificio_evento"
                  required
                  value={formData.id_edificio}
                  onChange={(e) => setFormData({ ...formData, id_edificio: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[var(--app-hover)] border border-[var(--app-border)] rounded-lg text-[var(--app-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--app-blue)] transition-all"
                >
                  <option value="">Selecciona un edificio...</option>
                  {edificios.map((edificio) => (
                    <option key={edificio.id_edificio} value={edificio.id_edificio}>
                      {edificio.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="organizador_evento" className="block text-sm font-semibold text-[var(--app-text-primary)] mb-1">
                    Organizador
                  </label>
                  <input
                    id="organizador_evento"
                    type="text"
                    disabled
                    value={`${user?.nombre}`}
                    className="w-full px-4 py-2.5 bg-[var(--app-hover)] border border-[var(--app-border)] rounded-lg text-[var(--app-text-secondary)] opacity-70 cursor-not-allowed text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="prioridad_evento" className="block text-sm font-semibold text-[var(--app-text-primary)] mb-1">
                    Prioridad del Evento
                  </label>
                  <input
                    id="prioridad_evento"
                    type="text"
                    disabled
                    value="Prioridad 3"
                    className="w-full px-4 py-2.5 bg-[var(--app-hover)] border border-[var(--app-border)] rounded-lg text-[var(--app-text-secondary)] opacity-70 cursor-not-allowed text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="total_invitados" className="block text-sm font-semibold text-[var(--app-text-primary)] mb-1">
                  Total de Invitados (0 = Sin límite)
                </label>
                <input
                  id="total_invitados"
                  type="number"
                  min="0"
                  value={formData.total_invitados}
                  onChange={(e) => setFormData({ ...formData, total_invitados: Number.parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 bg-[var(--app-hover)] border border-[var(--app-border)] rounded-lg text-[var(--app-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--app-blue)] transition-all"
                />
              </div>

              {/* Nuevo: Es de paga / Precio */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-b border-[var(--app-border)] py-4 my-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="es_de_paga"
                    checked={formData.es_de_paga}
                    onChange={(e) => setFormData({ ...formData, es_de_paga: e.target.checked })}
                    className="w-4 h-4 text-[var(--app-blue)] rounded focus:ring-[var(--app-blue)]"
                  />
                  <label htmlFor="es_de_paga" className="text-sm font-semibold text-[var(--app-text-primary)]">
                    Evento de paga
                  </label>
                </div>

                {formData.es_de_paga && (
                  <div>
                    <label htmlFor="precio_evento" className="block text-sm font-semibold text-[var(--app-text-primary)] mb-1">
                      Precio ($ MXN) *
                    </label>
                    <input
                      id="precio_evento"
                      type="number"
                      min="1"
                      step="0.01"
                      required
                      value={formData.precio}
                      onChange={(e) => setFormData({ ...formData, precio: Number.parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 bg-[var(--app-hover)] border border-[var(--app-border)] rounded-lg text-[var(--app-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--app-blue)] transition-all"
                      placeholder="Ej: 150.00"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fecha_inicio" className="block text-sm font-semibold text-[var(--app-text-primary)] mb-1">
                    Fecha de Inicio*
                  </label>
                  <input
                    id="fecha_inicio"
                    type="datetime-local"
                    required
                    value={formData.fecha_inicio}
                    onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[var(--app-hover)] border border-[var(--app-border)] rounded-lg text-[var(--app-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--app-blue)] transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="fecha_fin" className="block text-sm font-semibold text-[var(--app-text-primary)] mb-1">
                    Fecha de Fin*
                  </label>
                  <input
                    id="fecha_fin"
                    type="datetime-local"
                    required
                    value={formData.fecha_fin}
                    onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[var(--app-hover)] border border-[var(--app-border)] rounded-lg text-[var(--app-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--app-blue)] transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="publico"
                    checked={formData.publico}
                    onChange={(e) => setFormData({ ...formData, publico: e.target.checked })}
                    className="w-4 h-4 text-[var(--app-blue)] rounded focus:ring-[var(--app-blue)]"
                  />
                  <label htmlFor="publico" className="text-sm font-medium text-[var(--app-text-primary)]">
                    Evento público
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="activo"
                    checked={formData.activo}
                    onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                    className="w-4 h-4 text-[var(--app-blue)] rounded focus:ring-[var(--app-blue)]"
                  />
                  <label htmlFor="activo" className="text-sm font-medium text-[var(--app-text-primary)]">
                    Evento activo
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[var(--app-border)]">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 bg-[var(--app-hover)] border border-[var(--app-border)] text-[var(--app-text-primary)] rounded-lg hover:bg-opacity-80 transition-all font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[var(--app-blue)] text-white rounded-lg hover:opacity-90 transition-opacity font-semibold shadow-md cursor-pointer"
                >
                  {editingEvento ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {showDeleteModal && deletingEvento && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--app-card-bg)] rounded-xl shadow-xl max-w-md w-full p-6 border border-[var(--app-border)]">
            <h3 className="text-xl font-bold text-[var(--app-text-primary)] mb-2">
              Eliminar Evento
            </h3>
            <p className="text-sm text-[var(--app-text-secondary)] mb-6">
              ¿Estás seguro de que deseas eliminar el evento <strong>"{deletingEvento.nombre}"</strong>? Esta acción es irreversible.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingEvento(null);
                }}
                className="flex-1 px-4 py-2 bg-[var(--app-hover)] border border-[var(--app-border)] text-[var(--app-text-primary)] rounded-lg hover:bg-opacity-80 transition-all font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold shadow-md cursor-pointer"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal QR Code */}
      {showQrModal && qrEvento && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--app-card-bg)] rounded-xl shadow-xl max-w-sm w-full p-6 text-center border border-[var(--app-border)]">
            <h3 className="text-lg font-bold text-[var(--app-text-primary)] mb-2">
              QR de Asistencia y Registro
            </h3>
            <p className="text-sm font-bold text-[var(--app-blue)] truncate mb-4">
              {qrEvento.nombre}
            </p>
            <div className="bg-white p-4 rounded-xl inline-block shadow-sm mb-4">
              <QRCodeSVG 
                value={`${globalThis.location.origin}/eventos/${qrEvento.id_evento}/confirmar`}
                size={200}
                bgColor={"#ffffff"}
                fgColor={"#000000"}
                level={"H"}
              />
            </div>
            
            {/* Event Summary Details inside QR Modal */}
            <div className="text-left text-xs bg-[var(--app-hover)] p-3 rounded-lg border border-[var(--app-border)] space-y-1 mb-6 text-[var(--app-text-primary)]">
              <p><strong>Ubicación:</strong> {qrEvento.edificio?.nombre || 'Sin edificio'}</p>
              <p><strong>Tipo:</strong> {qrEvento.es_de_paga ? `De Paga ($${Number.parseFloat(qrEvento.precio as string).toFixed(2)} MXN)` : 'Gratuito'}</p>
              <p><strong>Inicio:</strong> {new Date(qrEvento.fecha_inicio).toLocaleString('es-MX')}</p>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => downloadEventPdf(qrEvento)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-[var(--app-blue)] hover:bg-opacity-90 text-white rounded-lg transition-all w-full font-semibold cursor-pointer"
              >
                <Download className="w-4.5 h-4.5" />
                Descargar Flyer PDF
              </button>
              <button
                type="button"
                onClick={() => { setShowQrModal(false); setQrEvento(null); }}
                className="px-4 py-2 bg-[var(--app-hover)] border border-[var(--app-border)] text-[var(--app-text-primary)] rounded-lg hover:bg-opacity-80 transition-all w-full font-semibold cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
