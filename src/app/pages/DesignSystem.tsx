import { useState } from 'react';
import { ThemeToggle } from '../components/ThemeToggle';
import { 
  MapPin, Mail, Lock, User, Navigation, Route, Calendar, 
  BarChart3, LayoutDashboard, Settings, LogOut, Moon, Sun,
  Menu, X, Plus, Edit, Trash2, Eye, AlertCircle, CheckCircle
} from 'lucide-react';

export default function DesignSystem() {
  const [showAlert, setShowAlert] = useState(true);
  const [inputValue, setInputValue] = useState('');

  return (
    <div className="min-h-screen" style={{ background: 'var(--app-bg)' }}>
      {/* Header */}
      <header 
        className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between shadow-sm"
        style={{ 
          background: 'var(--app-header-bg)', 
          borderBottom: '1px solid var(--app-border)' 
        }}
      >
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--app-text-primary)' }}>
            Sistema de Diseño AirGuide
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--app-text-secondary)' }}>
            Documentación interactiva de componentes y estilos
          </p>
        </div>
        <ThemeToggle />
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-12">
        
        {/* Colors Section */}
        <section>
          <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--app-text-primary)' }}>
            Paleta de Colores
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Backgrounds */}
            <div 
              className="rounded-lg p-6"
              style={{ background: 'var(--app-header-bg)', border: '1px solid var(--app-border)' }}
            >
              <h3 className="font-medium mb-4" style={{ color: 'var(--app-text-primary)' }}>
                Fondos
              </h3>
              <div className="space-y-3">
                <ColorSwatch name="app-bg" label="Fondo Principal" />
                <ColorSwatch name="app-header-bg" label="Fondo Header/Card" />
                <ColorSwatch name="app-sidebar-bg" label="Fondo Sidebar" />
                <ColorSwatch name="app-hover" label="Hover/Input Background" />
              </div>
            </div>

            {/* Text Colors */}
            <div 
              className="rounded-lg p-6"
              style={{ background: 'var(--app-header-bg)', border: '1px solid var(--app-border)' }}
            >
              <h3 className="font-medium mb-4" style={{ color: 'var(--app-text-primary)' }}>
                Textos
              </h3>
              <div className="space-y-3">
                <ColorSwatch name="app-text-primary" label="Texto Principal" />
                <ColorSwatch name="app-text-secondary" label="Texto Secundario" />
              </div>
            </div>

            {/* Action Colors */}
            <div 
              className="rounded-lg p-6"
              style={{ background: 'var(--app-header-bg)', border: '1px solid var(--app-border)' }}
            >
              <h3 className="font-medium mb-4" style={{ color: 'var(--app-text-primary)' }}>
                Colores de Acción
              </h3>
              <div className="space-y-3">
                <ColorSwatch name="app-blue" label="Primario (Blue)" />
                <ColorSwatch name="app-green" label="Éxito (Green)" />
                <ColorSwatch name="app-red" label="Peligro (Red)" />
                <ColorSwatch name="app-border" label="Bordes" />
              </div>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section>
          <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--app-text-primary)' }}>
            Tipografía
          </h2>
          
          <div 
            className="rounded-lg p-6"
            style={{ background: 'var(--app-header-bg)', border: '1px solid var(--app-border)' }}
          >
            <div className="space-y-4">
              <div>
                <p className="text-xs mb-2" style={{ color: 'var(--app-text-secondary)' }}>H1 - Título Principal</p>
                <h1 style={{ color: 'var(--app-text-primary)' }}>The quick brown fox jumps</h1>
              </div>
              <div>
                <p className="text-xs mb-2" style={{ color: 'var(--app-text-secondary)' }}>H2 - Subtítulo</p>
                <h2 style={{ color: 'var(--app-text-primary)' }}>The quick brown fox jumps</h2>
              </div>
              <div>
                <p className="text-xs mb-2" style={{ color: 'var(--app-text-secondary)' }}>H3 - Título de Componente</p>
                <h3 style={{ color: 'var(--app-text-primary)' }}>The quick brown fox jumps</h3>
              </div>
              <div>
                <p className="text-xs mb-2" style={{ color: 'var(--app-text-secondary)' }}>Body - Texto Regular</p>
                <p style={{ color: 'var(--app-text-primary)' }}>The quick brown fox jumps over the lazy dog</p>
              </div>
              <div>
                <p className="text-xs mb-2" style={{ color: 'var(--app-text-secondary)' }}>Small - Texto Pequeño</p>
                <p className="text-sm" style={{ color: 'var(--app-text-secondary)' }}>The quick brown fox jumps over the lazy dog</p>
              </div>
            </div>
          </div>
        </section>

        {/* Buttons */}
        <section>
          <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--app-text-primary)' }}>
            Botones
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Primary Buttons */}
            <div 
              className="rounded-lg p-6"
              style={{ background: 'var(--app-header-bg)', border: '1px solid var(--app-border)' }}
            >
              <h3 className="font-medium mb-4" style={{ color: 'var(--app-text-primary)' }}>
                Botones Primarios
              </h3>
              <div className="space-y-3">
                <button
                  className="w-full px-4 py-3 rounded-lg transition-colors"
                  style={{ background: 'var(--app-blue)', color: 'white' }}
                >
                  Botón Primario
                </button>
                <button
                  className="w-full px-4 py-3 rounded-lg transition-colors"
                  style={{ background: 'var(--app-green)', color: 'white' }}
                >
                  Botón de Éxito
                </button>
                <button
                  className="w-full px-4 py-3 rounded-lg transition-colors"
                  style={{ background: 'var(--app-red)', color: 'white' }}
                >
                  Botón de Peligro
                </button>
              </div>
            </div>

            {/* Secondary Buttons */}
            <div 
              className="rounded-lg p-6"
              style={{ background: 'var(--app-header-bg)', border: '1px solid var(--app-border)' }}
            >
              <h3 className="font-medium mb-4" style={{ color: 'var(--app-text-primary)' }}>
                Botones Secundarios
              </h3>
              <div className="space-y-3">
                <button
                  className="w-full px-4 py-3 rounded-lg transition-colors border"
                  style={{ 
                    border: '1px solid var(--app-border)',
                    color: 'var(--app-text-primary)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--app-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  Botón Secundario
                </button>
                <button
                  className="w-full px-4 py-3 rounded-lg transition-colors opacity-50 cursor-not-allowed"
                  style={{ background: 'var(--app-blue)', color: 'white' }}
                  disabled
                >
                  Botón Deshabilitado
                </button>
                <div className="flex gap-2">
                  <button
                    className="p-2 rounded-lg transition-colors border"
                    style={{ border: '1px solid var(--app-border)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--app-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <Plus className="w-5 h-5" style={{ color: 'var(--app-text-secondary)' }} />
                  </button>
                  <button
                    className="p-2 rounded-lg transition-colors border"
                    style={{ border: '1px solid var(--app-border)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--app-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <Edit className="w-5 h-5" style={{ color: 'var(--app-text-secondary)' }} />
                  </button>
                  <button
                    className="p-2 rounded-lg transition-colors border"
                    style={{ border: '1px solid var(--app-border)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--app-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <Trash2 className="w-5 h-5" style={{ color: 'var(--app-red)' }} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Inputs */}
        <section>
          <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--app-text-primary)' }}>
            Campos de Entrada
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div 
              className="rounded-lg p-6"
              style={{ background: 'var(--app-header-bg)', border: '1px solid var(--app-border)' }}
            >
              <h3 className="font-medium mb-4" style={{ color: 'var(--app-text-primary)' }}>
                Input con Icono
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--app-text-primary)' }}>
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" 
                      style={{ color: 'var(--app-text-secondary)' }} 
                    />
                    <input
                      type="email"
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
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--app-text-primary)' }}>
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" 
                      style={{ color: 'var(--app-text-secondary)' }} 
                    />
                    <input
                      type="password"
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
              </div>
            </div>

            <div 
              className="rounded-lg p-6"
              style={{ background: 'var(--app-header-bg)', border: '1px solid var(--app-border)' }}
            >
              <h3 className="font-medium mb-4" style={{ color: 'var(--app-text-primary)' }}>
                Input Simple
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--app-text-primary)' }}>
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={{ 
                      background: 'var(--app-hover)', 
                      border: '1px solid var(--app-border)',
                      color: 'var(--app-text-primary)'
                    }}
                    placeholder="Escribe algo..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--app-text-primary)' }}>
                    Descripción
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    style={{ 
                      background: 'var(--app-hover)', 
                      border: '1px solid var(--app-border)',
                      color: 'var(--app-text-primary)'
                    }}
                    placeholder="Descripción..."
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cards */}
        <section>
          <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--app-text-primary)' }}>
            Cards (Tarjetas)
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div 
              className="rounded-lg p-6"
              style={{ background: 'var(--app-header-bg)', border: '1px solid var(--app-border)' }}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                style={{ background: 'var(--app-blue)' }}
              >
                <Route className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2" style={{ color: 'var(--app-text-primary)' }}>
                Card Estándar
              </h3>
              <p className="text-sm" style={{ color: 'var(--app-text-secondary)' }}>
                Esta es una tarjeta con contenido de ejemplo.
              </p>
            </div>

            <div 
              className="rounded-lg shadow-lg p-6"
              style={{ 
                background: 'var(--app-header-bg)', 
                border: '1px solid var(--app-border)',
                boxShadow: '0 10px 15px -3px var(--app-shadow)'
              }}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                style={{ background: 'var(--app-green)' }}
              >
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2" style={{ color: 'var(--app-text-primary)' }}>
                Card con Sombra
              </h3>
              <p className="text-sm" style={{ color: 'var(--app-text-secondary)' }}>
                Esta tarjeta tiene una sombra elevada.
              </p>
            </div>

            <button
              className="text-left rounded-lg p-6 transition-all"
              style={{ 
                background: 'var(--app-blue-light)', 
                border: '2px solid var(--app-blue)' 
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                style={{ background: 'var(--app-blue)' }}
              >
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2" style={{ color: 'var(--app-blue)' }}>
                Card Interactiva
              </h3>
              <p className="text-sm" style={{ color: 'var(--app-text-secondary)' }}>
                Esta tarjeta es clickeable y tiene hover.
              </p>
            </button>
          </div>
        </section>

        {/* Alerts */}
        <section>
          <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--app-text-primary)' }}>
            Alertas y Notificaciones
          </h2>
          
          <div className="space-y-4">
            <div 
              className="px-4 py-3 rounded-lg text-sm flex items-center gap-3"
              style={{ 
                background: 'rgba(239, 68, 68, 0.1)', 
                border: '1px solid var(--app-red)',
                color: 'var(--app-red)'
              }}
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <div>
                <strong>Error:</strong> Ha ocurrido un error al procesar tu solicitud.
              </div>
            </div>

            <div 
              className="px-4 py-3 rounded-lg text-sm flex items-center gap-3"
              style={{ 
                background: 'rgba(16, 185, 129, 0.1)', 
                border: '1px solid var(--app-green)',
                color: 'var(--app-green)'
              }}
            >
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <div>
                <strong>Éxito:</strong> La operación se completó exitosamente.
              </div>
            </div>

            <div 
              className="px-4 py-3 rounded-lg text-sm flex items-center gap-3"
              style={{ 
                background: 'rgba(59, 130, 246, 0.1)', 
                border: '1px solid var(--app-blue)',
                color: 'var(--app-blue)'
              }}
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <div>
                <strong>Info:</strong> Tienes 3 rutas nuevas disponibles.
              </div>
            </div>
          </div>
        </section>

        {/* Badges/Tags */}
        <section>
          <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--app-text-primary)' }}>
            Etiquetas (Badges)
          </h2>
          
          <div 
            className="rounded-lg p-6"
            style={{ background: 'var(--app-header-bg)', border: '1px solid var(--app-border)' }}
          >
            <div className="flex flex-wrap gap-3">
              <span 
                className="text-xs px-3 py-1 rounded-full"
                style={{ 
                  background: 'var(--app-hover)', 
                  color: 'var(--app-text-secondary)' 
                }}
              >
                Neutro
              </span>
              <span 
                className="text-xs px-3 py-1 rounded-full"
                style={{ 
                  background: 'var(--app-blue-light)', 
                  color: 'var(--app-blue)' 
                }}
              >
                Primario
              </span>
              <span 
                className="text-xs px-3 py-1 rounded-full"
                style={{ 
                  background: 'var(--app-green)', 
                  color: 'white' 
                }}
              >
                Activo
              </span>
              <span 
                className="text-xs px-3 py-1 rounded-full"
                style={{ 
                  background: 'rgba(239, 68, 68, 0.1)', 
                  color: 'var(--app-red)' 
                }}
              >
                Inactivo
              </span>
              <span 
                className="text-xs px-3 py-1 rounded-full border"
                style={{ 
                  border: '1px solid var(--app-border)',
                  color: 'var(--app-text-secondary)' 
                }}
              >
                Con Borde
              </span>
            </div>
          </div>
        </section>

        {/* Icons */}
        <section>
          <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--app-text-primary)' }}>
            Iconografía (Lucide React)
          </h2>
          
          <div 
            className="rounded-lg p-6"
            style={{ background: 'var(--app-header-bg)', border: '1px solid var(--app-border)' }}
          >
            <div className="grid grid-cols-4 md:grid-cols-8 gap-6">
              <IconDisplay icon={MapPin} label="MapPin" />
              <IconDisplay icon={Navigation} label="Navigation" />
              <IconDisplay icon={Route} label="Route" />
              <IconDisplay icon={Calendar} label="Calendar" />
              <IconDisplay icon={BarChart3} label="BarChart3" />
              <IconDisplay icon={LayoutDashboard} label="Dashboard" />
              <IconDisplay icon={Settings} label="Settings" />
              <IconDisplay icon={LogOut} label="LogOut" />
              <IconDisplay icon={Moon} label="Moon" />
              <IconDisplay icon={Sun} label="Sun" />
              <IconDisplay icon={Menu} label="Menu" />
              <IconDisplay icon={X} label="X" />
              <IconDisplay icon={Mail} label="Mail" />
              <IconDisplay icon={Lock} label="Lock" />
              <IconDisplay icon={User} label="User" />
              <IconDisplay icon={Plus} label="Plus" />
              <IconDisplay icon={Edit} label="Edit" />
              <IconDisplay icon={Trash2} label="Trash2" />
              <IconDisplay icon={Eye} label="Eye" />
              <IconDisplay icon={CheckCircle} label="Check" />
            </div>
          </div>
        </section>

        {/* Table */}
        <section>
          <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--app-text-primary)' }}>
            Tablas
          </h2>
          
          <div 
            className="rounded-lg overflow-hidden"
            style={{ border: '1px solid var(--app-border)' }}
          >
            <table className="w-full">
              <thead style={{ background: 'var(--app-hover)' }}>
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium" style={{ color: 'var(--app-text-primary)' }}>
                    Nombre
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium" style={{ color: 'var(--app-text-primary)' }}>
                    Estado
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium" style={{ color: 'var(--app-text-primary)' }}>
                    Categoría
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium" style={{ color: 'var(--app-text-primary)' }}>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody style={{ background: 'var(--app-header-bg)' }}>
                <tr style={{ borderTop: '1px solid var(--app-border)' }}>
                  <td className="px-6 py-4" style={{ color: 'var(--app-text-primary)' }}>Ruta A</td>
                  <td className="px-6 py-4">
                    <span 
                      className="text-xs px-2 py-1 rounded-full"
                      style={{ background: 'var(--app-green)', color: 'white' }}
                    >
                      Activa
                    </span>
                  </td>
                  <td className="px-6 py-4" style={{ color: 'var(--app-text-secondary)' }}>Edificios</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="p-1">
                        <Eye className="w-4 h-4" style={{ color: 'var(--app-blue)' }} />
                      </button>
                      <button className="p-1">
                        <Edit className="w-4 h-4" style={{ color: 'var(--app-text-secondary)' }} />
                      </button>
                      <button className="p-1">
                        <Trash2 className="w-4 h-4" style={{ color: 'var(--app-red)' }} />
                      </button>
                    </div>
                  </td>
                </tr>
                <tr style={{ borderTop: '1px solid var(--app-border)' }}>
                  <td className="px-6 py-4" style={{ color: 'var(--app-text-primary)' }}>Ruta B</td>
                  <td className="px-6 py-4">
                    <span 
                      className="text-xs px-2 py-1 rounded-full"
                      style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--app-red)' }}
                    >
                      Inactiva
                    </span>
                  </td>
                  <td className="px-6 py-4" style={{ color: 'var(--app-text-secondary)' }}>Parques</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="p-1">
                        <Eye className="w-4 h-4" style={{ color: 'var(--app-blue)' }} />
                      </button>
                      <button className="p-1">
                        <Edit className="w-4 h-4" style={{ color: 'var(--app-text-secondary)' }} />
                      </button>
                      <button className="p-1">
                        <Trash2 className="w-4 h-4" style={{ color: 'var(--app-red)' }} />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Spacing */}
        <section>
          <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--app-text-primary)' }}>
            Espaciado
          </h2>
          
          <div 
            className="rounded-lg p-6"
            style={{ background: 'var(--app-header-bg)', border: '1px solid var(--app-border)' }}
          >
            <div className="space-y-4">
              {[
                { size: '2', value: '0.5rem (8px)' },
                { size: '3', value: '0.75rem (12px)' },
                { size: '4', value: '1rem (16px)' },
                { size: '6', value: '1.5rem (24px)' },
                { size: '8', value: '2rem (32px)' },
              ].map((spacing) => (
                <div key={spacing.size} className="flex items-center gap-4">
                  <div 
                    className="h-12 rounded"
                    style={{ 
                      width: spacing.value.split('(')[1].replace(')', ''),
                      background: 'var(--app-blue)' 
                    }}
                  />
                  <div>
                    <p className="font-mono text-sm" style={{ color: 'var(--app-text-primary)' }}>
                      gap-{spacing.size} / p-{spacing.size}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--app-text-secondary)' }}>
                      {spacing.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

// Helper Components
function ColorSwatch({ name, label }: { name: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div 
        className="w-12 h-12 rounded-lg border"
        style={{ 
          background: `var(--${name})`,
          border: '1px solid var(--app-border)'
        }}
      />
      <div className="flex-1">
        <p className="text-sm font-medium" style={{ color: 'var(--app-text-primary)' }}>
          {label}
        </p>
        <p className="text-xs font-mono" style={{ color: 'var(--app-text-secondary)' }}>
          --{name}
        </p>
      </div>
    </div>
  );
}

function IconDisplay({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div 
        className="w-12 h-12 rounded-lg flex items-center justify-center"
        style={{ background: 'var(--app-hover)' }}
      >
        <Icon className="w-6 h-6" style={{ color: 'var(--app-text-secondary)' }} />
      </div>
      <p className="text-xs text-center" style={{ color: 'var(--app-text-secondary)' }}>
        {label}
      </p>
    </div>
  );
}