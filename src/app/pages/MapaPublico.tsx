import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Calendar, Building2, Search, LogIn, Users, LogOut, Moon, Sun, Route as RouteIcon, X } from 'lucide-react';
import { useNavigate } from 'react-router';
import L from 'leaflet';
import 'leaflet-routing-machine';
import { useEdificios, useEventos } from '../hooks';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import 'leaflet/dist/leaflet.css';

// Fix para los iconos de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Iconos personalizados para edificios y eventos
const edificioIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
      <path fill="#3B82F6" stroke="#1E40AF" stroke-width="2" d="M16 0C7.163 0 0 7.163 0 16c0 8.837 16 26 16 26s16-17.163 16-26C32 7.163 24.837 0 16 0z"/>
      <circle cx="16" cy="16" r="6" fill="white"/>
    </svg>
  `),
  iconSize: [32, 42],
  iconAnchor: [16, 42],
  popupAnchor: [0, -42],
});

const eventoIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
      <path fill="#10B981" stroke="#059669" stroke-width="2" d="M16 0C7.163 0 0 7.163 0 16c0 8.837 16 26 16 26s16-17.163 16-26C32 7.163 24.837 0 16 0z"/>
      <circle cx="16" cy="16" r="6" fill="white"/>
    </svg>
  `),
  iconSize: [32, 42],
  iconAnchor: [16, 42],
  popupAnchor: [0, -42],
});

export default function MapaPublico() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { edificios, loading: loadingEdificios } = useEdificios();
  const { eventos, loading: loadingEventos } = useEventos();

  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const routingControlRef = useRef<any>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMarker, setSelectedMarker] = useState<any>(null);
  const [routeOrigin, setRouteOrigin] = useState<number | null>(null);
  const [routeDestination, setRouteDestination] = useState<number | null>(null);
  const [showRoutePanel, setShowRoutePanel] = useState(false);

  // Filtrar edificios y eventos según búsqueda
  const edificiosFiltrados = edificios.filter(e =>
    e.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const eventosFiltrados = eventos.filter(e =>
    e.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Inicializar mapa
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Crear mapa centrado en Monterrey, México
    const map = L.map(mapContainerRef.current).setView([20.656333, -100.404745], 15);

    // Agregar capa de tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Actualizar marcadores cuando cambian los datos o la búsqueda
  useEffect(() => {
    if (!mapRef.current) return;

    // Limpiar marcadores anteriores
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Agregar marcadores de edificios
    edificiosFiltrados.forEach((edificio) => {
      const marker = L.marker(
        [Number(edificio.latitud), Number(edificio.longitud)],
        { icon: edificioIcon }
      );

      marker.bindPopup(`
        <div class="p-2">
          <div class="flex items-center gap-2 mb-2">
            <strong class="text-sm">${edificio.nombre}</strong>
          </div>
          ${edificio.descripcion ? `<p class="text-xs text-gray-600 mb-2">${edificio.descripcion}</p>` : ''}
          <span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
            ${edificio.tipo}
          </span>
        </div>
      `);

      marker.on('click', () => {
        setSelectedMarker({ ...edificio, type: 'edificio' });
      });

      marker.addTo(mapRef.current!);
      markersRef.current.push(marker);
    });

    // Agregar marcadores de eventos
    eventosFiltrados.forEach((evento) => {
      if (!evento.edificio) return;

      const marker = L.marker(
        [Number(evento.edificio.latitud), Number(evento.edificio.longitud)],
        { icon: eventoIcon }
      );

      marker.bindPopup(`
        <div class="p-2">
          <div class="flex items-center gap-2 mb-2">
            <strong class="text-sm">${evento.nombre}</strong>
          </div>
          ${evento.descripcion ? `<p class="text-xs text-gray-600 mb-2">${evento.descripcion}</p>` : ''}
          <p class="text-xs text-gray-500">
            ${new Date(evento.fecha_inicio).toLocaleDateString()} - ${new Date(evento.fecha_fin).toLocaleDateString()}
          </p>
        </div>
      `);

      marker.on('click', () => {
        setSelectedMarker({ ...evento, type: 'evento' });
      });

      marker.addTo(mapRef.current!);
      markersRef.current.push(marker);
    });
  }, [edificiosFiltrados, eventosFiltrados]);

  // Función para calcular ruta entre dos edificios
  const calculateRoute = () => {
    if (!mapRef.current || !routeOrigin || !routeDestination) return;

    const origin = edificios.find(e => e.id_edificio === routeOrigin);
    const destination = edificios.find(e => e.id_edificio === routeDestination);

    if (!origin || !destination) return;

    // Limpiar ruta anterior si existe
    if (routingControlRef.current) {
      mapRef.current.removeControl(routingControlRef.current);
      routingControlRef.current = null;
    }

    // Crear nueva ruta con estilo personalizado en rojo
    const routingControl = (L as any).Routing.control({
      waypoints: [
        L.latLng(Number(origin.latitud), Number(origin.longitud)),
        L.latLng(Number(destination.latitud), Number(destination.longitud))
      ],
      routeWhileDragging: true,
      showAlternatives: true,
      addWaypoints: false,
      lineOptions: {
        styles: [
          { color: '#EF4444', opacity: 0.8, weight: 6 }
        ],
        extendToWaypoints: true,
        missingRouteTolerance: 0
      },
      altLineOptions: {
        styles: [
          { color: '#F87171', opacity: 0.5, weight: 4 }
        ],
        extendToWaypoints: true,
        missingRouteTolerance: 0
      },
      createMarker: function (i: number, waypoint: any, n: number) {
        const markerIcon = new L.Icon({
          iconUrl: 'data:image/svg+xml;base64,' + btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
              <path fill="${i === 0 ? '#22C55E' : '#EF4444'}" stroke="${i === 0 ? '#16A34A' : '#DC2626'}" stroke-width="2" d="M16 0C7.163 0 0 7.163 0 16c0 8.837 16 26 16 26s16-17.163 16-26C32 7.163 24.837 0 16 0z"/>
              <circle cx="16" cy="16" r="6" fill="white"/>
            </svg>
          `),
          iconSize: [32, 42],
          iconAnchor: [16, 42],
          popupAnchor: [0, -42],
        });

        return L.marker(waypoint.latLng, {
          icon: markerIcon,
          draggable: false
        }).bindPopup(i === 0 ? `Origen: ${origin.nombre}` : `Destino: ${destination.nombre}`);
      }
    }).addTo(mapRef.current);

    routingControlRef.current = routingControl;

    // Ajustar vista del mapa para mostrar toda la ruta
    const bounds = L.latLngBounds([
      [Number(origin.latitud), Number(origin.longitud)],
      [Number(destination.latitud), Number(destination.longitud)]
    ]);
    mapRef.current.fitBounds(bounds, { padding: [50, 50] });
  };

  // Limpiar ruta
  const clearRoute = () => {
    if (routingControlRef.current && mapRef.current) {
      mapRef.current.removeControl(routingControlRef.current);
      routingControlRef.current = null;
    }
    setRouteOrigin(null);
    setRouteDestination(null);
  };

  const handleNavigateToLocation = () => {
    if (!user) {
      alert('Debes iniciar sesión como alumno para crear rutas');
      navigate('/login');
      return;
    }
    if (user.rol !== 'alumno') {
      alert('Solo los alumnos pueden crear rutas');
      return;
    }
    // Aquí iría la lógica de navegación/ruta
    alert('Funcionalidad de navegación próximamente');
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Barra Superior */}
      <header className="bg-[var(--app-header-bg)] border-b border-[var(--app-border)] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MapPin className="w-6 h-6 text-[var(--app-blue)]" />
          <h1 className="text-xl font-semibold text-[var(--app-text-primary)]">
            AirGuide
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="flex items-center gap-2 px-3 py-2 bg-[var(--app-hover)] rounded-lg">
                <Users className="w-4 h-4 text-[var(--app-text-secondary)]" />
                <span className="text-sm text-[var(--app-text-primary)]">{user.nombre}</span>
                <span className="text-xs text-[var(--app-text-secondary)] bg-[var(--app-blue-light)] px-2 py-0.5 rounded-full">
                  {user.rol}
                </span>
              </div>
              {user.rol === 'admin' && (
                <button
                  onClick={() => navigate('/admin/dashboard')}
                  className="px-4 py-2 bg-[var(--app-blue)] text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  Dashboard
                </button>
              )}
              <button
                onClick={() => navigate('/logout')}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--app-blue)] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <LogIn className="w-4 h-4" />
              Iniciar Sesión
            </button>
          )}
          <button
            onClick={toggleTheme}
            className="px-4 py-2 bg-[var(--app-blue)] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Barra de Búsqueda */}
      <div className="bg-[var(--app-header-bg)] border-b border-[var(--app-border)] px-4 py-3">
        <div className="max-w-2xl mx-auto relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--app-text-secondary)]" />
          <input
            type="text"
            placeholder="Buscar edificios, eventos, salones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[var(--app-hover)] border border-[var(--app-border)] rounded-lg text-[var(--app-text-primary)] placeholder:text-[var(--app-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--app-blue)] focus:border-transparent"
          />
        </div>
      </div>

      {/* Contenedor del Mapa */}
      <div className="flex-1 relative">
        <div ref={mapContainerRef} className="h-full w-full" />

        {/* Panel de Información del Marcador Seleccionado */}
        {selectedMarker && (
          <div className="absolute top-4 right-4 bg-white rounded-lg shadow-xl p-4 w-80 max-h-96 overflow-y-auto z-[1000]">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-[var(--app-text-primary)]">
                {selectedMarker.nombre}
              </h3>
              <button
                onClick={() => setSelectedMarker(null)}
                className="text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedMarker.type === 'edificio' && (
              <>
                <div className="mb-3">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--app-blue-light)] text-[var(--app-blue)] text-xs rounded-full mb-2">
                    <Building2 className="w-3 h-3" />
                    {selectedMarker.tipo}
                  </span>
                </div>
                {selectedMarker.descripcion && (
                  <p className="text-sm text-[var(--app-text-secondary)] mb-3">
                    {selectedMarker.descripcion}
                  </p>
                )}
                {selectedMarker._count && (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="text-center p-2 bg-[var(--app-hover)] rounded">
                      <div className="text-lg font-semibold text-[var(--app-text-primary)]">
                        {selectedMarker._count.salones}
                      </div>
                      <div className="text-xs text-[var(--app-text-secondary)]">Salones</div>
                    </div>
                    <div className="text-center p-2 bg-[var(--app-hover)] rounded">
                      <div className="text-lg font-semibold text-[var(--app-text-primary)]">
                        {selectedMarker._count.cubiculos}
                      </div>
                      <div className="text-xs text-[var(--app-text-secondary)]">Cubículos</div>
                    </div>
                    <div className="text-center p-2 bg-[var(--app-hover)] rounded">
                      <div className="text-lg font-semibold text-[var(--app-text-primary)]">
                        {selectedMarker._count.eventos}
                      </div>
                      <div className="text-xs text-[var(--app-text-secondary)]">Eventos</div>
                    </div>
                  </div>
                )}
              </>
            )}

            {selectedMarker.type === 'evento' && (
              <>
                <div className="mb-3">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full mb-2">
                    <Calendar className="w-3 h-3" />
                    Evento
                  </span>
                </div>
                {selectedMarker.descripcion && (
                  <p className="text-sm text-[var(--app-text-secondary)] mb-3">
                    {selectedMarker.descripcion}
                  </p>
                )}
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--app-text-secondary)]">Inicio:</span>
                    <span className="text-[var(--app-text-primary)] font-medium">
                      {new Date(selectedMarker.fecha_inicio).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--app-text-secondary)]">Fin:</span>
                    <span className="text-[var(--app-text-primary)] font-medium">
                      {new Date(selectedMarker.fecha_fin).toLocaleDateString()}
                    </span>
                  </div>
                  {selectedMarker.edificio && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--app-text-secondary)]">Ubicación:</span>
                      <span className="text-[var(--app-text-primary)] font-medium">
                        {selectedMarker.edificio.nombre}
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}

            {user?.rol === 'alumno' && (
              <button
                onClick={handleNavigateToLocation}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[var(--app-blue)] text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                <Navigation className="w-4 h-4" />
                Cómo llegar
              </button>
            )}
            {!user && (
              <p className="text-xs text-center text-[var(--app-text-secondary)] mt-2">
                Inicia sesión como alumno para crear rutas
              </p>
            )}
          </div>
        )}

        {/* Leyenda */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
          <h4 className="text-xs font-semibold text-[var(--app-text-primary)] mb-2">Leyenda</h4>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[var(--app-blue)]" />
              <span className="text-xs text-[var(--app-text-secondary)]">Edificios</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[var(--app-green)]" />
              <span className="text-xs text-[var(--app-text-secondary)]">Eventos</span>
            </div>
          </div>
        </div>

        {/* Botón para mostrar panel de rutas */}
        <button
          onClick={() => setShowRoutePanel(!showRoutePanel)}
          className="absolute bottom-4 right-4 bg-[var(--app-blue)] text-white p-3 rounded-full shadow-xl hover:opacity-90 transition-opacity z-[1000] flex items-center gap-2"
          title="Calcular ruta"
        >
          <RouteIcon className="w-5 h-5" />
          {showRoutePanel && <span className="text-sm font-medium pr-1">Rutas</span>}
        </button>

        {/* Panel de Cálculo de Rutas */}
        {showRoutePanel && (
          <div className="absolute bottom-20 right-4 bg-white rounded-lg shadow-xl p-4 w-80 z-[1000]">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-[var(--app-text-primary)] flex items-center gap-2">
                <RouteIcon className="w-5 h-5 text-[var(--app-blue)]" />
                Calcular Ruta
              </h3>
              <button
                onClick={() => setShowRoutePanel(false)}
                className="text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Selector de Origen */}
              <div>
                <label className="block text-sm font-medium text-[var(--app-text-primary)] mb-1">
                  Origen
                </label>
                <select
                  value={routeOrigin || ''}
                  onChange={(e) => setRouteOrigin(Number(e.target.value) || null)}
                  className="w-full px-3 py-2 bg-[var(--app-hover)] border border-[var(--app-border)] rounded-lg text-[var(--app-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--app-blue)] focus:border-transparent"
                >
                  <option value="">Selecciona origen...</option>
                  {edificios.map((edificio) => (
                    <option key={edificio.id_edificio} value={edificio.id_edificio}>
                      {edificio.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selector de Destino */}
              <div>
                <label className="block text-sm font-medium text-[var(--app-text-primary)] mb-1">
                  Destino
                </label>
                <select
                  value={routeDestination || ''}
                  onChange={(e) => setRouteDestination(Number(e.target.value) || null)}
                  className="w-full px-3 py-2 bg-[var(--app-hover)] border border-[var(--app-border)] rounded-lg text-[var(--app-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--app-blue)] focus:border-transparent"
                >
                  <option value="">Selecciona destino...</option>
                  {edificios.map((edificio) => (
                    <option key={edificio.id_edificio} value={edificio.id_edificio}>
                      {edificio.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Botones de Acción */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={calculateRoute}
                  disabled={!routeOrigin || !routeDestination}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[var(--app-blue)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Navigation className="w-4 h-4" />
                  Calcular
                </button>
                <button
                  onClick={clearRoute}
                  disabled={!routingControlRef.current}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-4 h-4" />
                  Limpiar
                </button>
              </div>

              {/* Información adicional */}
              {routeOrigin && routeDestination && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    <strong>Origen:</strong> {edificios.find(e => e.id_edificio === routeOrigin)?.nombre}
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    <strong>Destino:</strong> {edificios.find(e => e.id_edificio === routeDestination)?.nombre}
                  </p>
                </div>
              )}

              {/* Nota informativa */}
              <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  💡 La ruta se mostrará en color <span className="text-red-600 font-medium">rojo</span> sobre el mapa
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Estado de Carga */}
        {(loadingEdificios || loadingEventos) && (
          <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center z-[1000]">
            <div className="bg-white rounded-lg p-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-[var(--app-blue)] border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-[var(--app-text-primary)]">Cargando mapa...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}