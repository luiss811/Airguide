import React, { useState, useEffect } from 'react';
import { useEdificios } from '../../hooks';
import { toast } from 'sonner';
import { 
  Briefcase, 
  FileText, 
  UploadCloud, 
  Building2, 
  ToggleLeft, 
  ToggleRight, 
  Trash2, 
  Eye, 
  Save, 
  AlertCircle 
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://airguidebackend-production.up.railway.app/api';

export default function GestionProfesor() {
  const { edificios } = useEdificios();
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [activo, setActivo] = useState(true);
  const [departamento, setDepartamento] = useState('');
  const [horarioPdf, setHorarioPdf] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string | null>(null);

  // Cubicle states
  const [idEdificio, setIdEdificio] = useState('');
  const [piso, setPiso] = useState('1');
  const [numero, setNumero] = useState('');
  const [referencia, setReferencia] = useState('');


  // Fetch teacher profile
  const fetchProfile = async () => {
    setProfileLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No estás autenticado');

      const response = await fetch(`${API_URL}/docentes/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener los datos del profesor');
      }

      const data = await response.json();
      const perfil = data.profesor_perfil;

      if (perfil) {
        setActivo(perfil.activo);
        setDepartamento(perfil.departamento || '');
        setHorarioPdf(perfil.horario_pdf || null);
        if (perfil.horario_pdf) {
          setPdfFileName('horario_actual.pdf');
        }

        if (perfil.cubiculos && perfil.cubiculos.length > 0) {
          const cub = perfil.cubiculos[0];
          setIdEdificio(cub.id_edificio?.toString() || '');
          setPiso(cub.piso?.toString() || '1');
          setNumero(cub.numero || '');
          setReferencia(cub.referencia || '');
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Error de conexión');
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle PDF file selection and base64 conversion
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Por favor selecciona únicamente archivos PDF');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('El archivo es demasiado pesado. El tamaño máximo permitido es 5MB');
      return;
    }

    setPdfFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setHorarioPdf(result);
      toast.success('PDF cargado. Guarda los cambios para subirlo.');
    };
    reader.onerror = () => {
      toast.error('Error al leer el archivo PDF');
    };
    reader.readAsDataURL(file);
  };

  // Open PDF in a new tab
  const handleViewPdf = () => {
    if (!horarioPdf) return;
    try {
      const newTab = window.open();
      if (newTab) {
        newTab.document.write(
          `<iframe src="${horarioPdf}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
        );
      } else {
        toast.error('El navegador bloqueó la ventana emergente. Por favor permítelas.');
      }
    } catch (e) {
      toast.error('No se pudo visualizar el PDF');
    }
  };

  // Remove local PDF
  const handleRemovePdf = () => {
    setHorarioPdf(null);
    setPdfFileName(null);
    toast.info('Se removerá el horario PDF cuando guardes los cambios');
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No autorizado');

      const payload = {
        activo,
        departamento: departamento.trim(),
        horario_pdf: horarioPdf,
        cubiculo: idEdificio && numero ? {
          id_edificio: parseInt(idEdificio),
          piso: parseInt(piso) || 1,
          numero: numero.trim(),
          referencia: referencia.trim()
        } : null
      };

      const response = await fetch(`${API_URL}/docentes/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al guardar los cambios');
      }

      toast.success('Cambios guardados correctamente');
      
      // Update local storage username if changed or sync
      const stored = localStorage.getItem('usuario');
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.estado = data.estado;
        localStorage.setItem('usuario', JSON.stringify(parsed));
      }

      // Re-fetch profile to sync
      fetchProfile();
    } catch (err: any) {
      toast.error(err.message || 'Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  if (profileLoading) {
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
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold" style={{ color: 'var(--app-text-primary)' }}>
          Gestión Docente
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--app-text-secondary)' }}>
          Configura tu disponibilidad, horario académico en PDF y los datos de tu cubículo.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-3 gap-6">
        
        {/* Left Side: General Profile Status & Schedule */}
        <div className="md:col-span-2 space-y-6">
          {/* Availability Card */}
          <div className="rounded-xl border border-[var(--app-border)] p-6 space-y-4 shadow-sm" style={{ background: 'var(--app-card-bg)' }}>
            <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--app-text-primary)' }}>
              <Briefcase className="w-5 h-5 text-[var(--app-blue)]" />
              Disponibilidad
            </h3>

            <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--app-hover)] border border-[var(--app-border)]">
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--app-text-primary)' }}>
                  Estatus de Docente
                </p>
                <p className="text-xs" style={{ color: 'var(--app-text-secondary)' }}>
                  Indica a tus alumnos si te encuentras disponible.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActivo(!activo)}
                className="focus:outline-none transition-transform active:scale-95"
              >
                {activo ? (
                  <ToggleRight className="w-14 h-8 text-green-500" />
                ) : (
                  <ToggleLeft className="w-14 h-8 text-[var(--app-text-secondary)]" />
                )}
              </button>
            </div>

            <div>
              <label htmlFor="departamento" className="block text-sm font-semibold mb-2" style={{ color: 'var(--app-text-primary)' }}>
                Departamento / Academia
              </label>
              <input
                id="departamento"
                type="text"
                value={departamento}
                onChange={(e) => setDepartamento(e.target.value)}
                placeholder="Ej: Computación y Sistemas"
                className="w-full px-4 py-3 rounded-lg bg-[var(--app-hover)] border border-[var(--app-border)] text-[var(--app-text-primary)] focus:ring-2 focus:ring-[var(--app-blue)] focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Schedule PDF Upload Card */}
          <div className="rounded-xl border border-[var(--app-border)] p-6 space-y-4 shadow-sm" style={{ background: 'var(--app-card-bg)' }}>
            <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--app-text-primary)' }}>
              <FileText className="w-5 h-5 text-red-500" />
              Horario de Clases (PDF)
            </h3>
            <p className="text-xs" style={{ color: 'var(--app-text-secondary)' }}>
              Sube tu horario en formato PDF para que los alumnos lo puedan consultar desde el mapa. (Máximo 5MB).
            </p>

            {!horarioPdf ? (
              <div 
                className="border-2 border-dashed border-[var(--app-border)] rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-[var(--app-hover)] hover:border-[var(--app-blue)] transition-all duration-300 group"
                onClick={() => document.getElementById('pdf-upload')?.click()}
              >
                <div className="p-4 rounded-full bg-[var(--app-blue-light)] text-[var(--app-blue)] group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-sm" style={{ color: 'var(--app-text-primary)' }}>
                    Haz clic para cargar el archivo
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--app-text-secondary)' }}>
                    Formatos soportados: PDF únicamente
                  </p>
                </div>
                <input
                  id="pdf-upload"
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 rounded bg-green-500 text-white shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-semibold truncate text-[var(--app-text-primary)]">
                      {pdfFileName || 'horario.pdf'}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                      PDF Cargado
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleViewPdf}
                    className="p-2 text-[var(--app-blue)] hover:bg-[var(--app-blue-light)] rounded-lg transition-colors"
                    title="Ver PDF"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleRemovePdf}
                    className="p-2 text-red-500 hover:bg-red-500/15 rounded-lg transition-colors"
                    title="Remover"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Cubicle Details */}
        <div className="space-y-6">
          <div className="rounded-xl border border-[var(--app-border)] p-6 space-y-4 shadow-sm h-full" style={{ background: 'var(--app-card-bg)' }}>
            <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--app-text-primary)' }}>
              <Building2 className="w-5 h-5 text-orange-500" />
              Detalles de Cubículo
            </h3>
            <p className="text-xs" style={{ color: 'var(--app-text-secondary)' }}>
              Edita la ubicación física de tu cubículo.
            </p>

            <div className="space-y-4">
              <div>
                <label htmlFor="edificio" className="block text-xs font-semibold mb-1" style={{ color: 'var(--app-text-primary)' }}>
                  Edificio*
                </label>
                <select
                  id="edificio"
                  value={idEdificio}
                  onChange={(e) => setIdEdificio(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-[var(--app-hover)] border border-[var(--app-border)] text-[var(--app-text-primary)] focus:ring-2 focus:ring-[var(--app-blue)] focus:outline-none transition-all text-sm"
                >
                  <option value="">Selecciona edificio...</option>
                  {edificios.map(ed => (
                    <option key={ed.id_edificio} value={ed.id_edificio}>
                      {ed.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="piso" className="block text-xs font-semibold mb-1" style={{ color: 'var(--app-text-primary)' }}>
                    Piso
                  </label>
                  <input
                    id="piso"
                    type="number"
                    min="1"
                    max="10"
                    value={piso}
                    onChange={(e) => setPiso(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--app-hover)] border border-[var(--app-border)] text-[var(--app-text-primary)] focus:ring-2 focus:ring-[var(--app-blue)] focus:outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="numero" className="block text-xs font-semibold mb-1" style={{ color: 'var(--app-text-primary)' }}>
                    Número*
                  </label>
                  <input
                    id="numero"
                    type="text"
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                    placeholder="Ej: C-23"
                    className="w-full px-3 py-2 rounded-lg bg-[var(--app-hover)] border border-[var(--app-border)] text-[var(--app-text-primary)] focus:ring-2 focus:ring-[var(--app-blue)] focus:outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="referencia" className="block text-xs font-semibold mb-1" style={{ color: 'var(--app-text-primary)' }}>
                  Referencias
                </label>
                <textarea
                  id="referencia"
                  rows={4}
                  value={referencia}
                  onChange={(e) => setReferencia(e.target.value)}
                  placeholder="Ej: Junto a las escaleras del segundo piso"
                  className="w-full px-3 py-2 rounded-lg bg-[var(--app-hover)] border border-[var(--app-border)] text-[var(--app-text-primary)] focus:ring-2 focus:ring-[var(--app-blue)] focus:outline-none transition-all text-sm"
                />
              </div>

              {(!idEdificio || !numero) && (
                <div className="flex gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Para asignar un cubículo debes seleccionar edificio y número.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form Actions footer */}
        <div className="md:col-span-3 flex justify-end gap-3 pt-4 border-t border-[var(--app-border)]">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[var(--app-blue)] text-white rounded-lg font-bold hover:bg-opacity-90 active:scale-95 disabled:opacity-50 transition-all shadow-md cursor-pointer"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
