import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Calendar, Building2, Search, LogIn, Users, LogOut, Route as RouteIcon, X, LocateFixed } from 'lucide-react';
import { useNavigate } from 'react-router';
import logoUTEQ from '../../styles/images/letras_uteq_azul2025.png';
import L from 'leaflet';
import 'leaflet-routing-machine';
import { useEdificios, useEventos } from '../hooks';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';
import 'leaflet/dist/leaflet.css';

// Configuración de iconos por defecto de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// --- ICONOS PERSONALIZADOS ---
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

// Icono para el usuario (Punto azul de GPS)
const userLocationIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8" fill="#3B82F6" fill-opacity="0.3" stroke="#3B82F6" stroke-width="1"/>
      <circle cx="12" cy="12" r="4" fill="#3B82F6" stroke="white" stroke-width="2"/>
    </svg>
  `),
    iconSize: [36, 36],
    iconAnchor: [18, 18],
});

export default function Map() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { edificios, loading: loadingEdificios } = useEdificios();
    const { eventos, loading: loadingEventos } = useEventos();

    const mapRef = useRef<L.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const markersRef = useRef<L.Marker[]>([]);
    const routingControlRef = useRef<any>(null);

    // REFS PARA GEOLOCALIZACIÓN
    const userMarkerRef = useRef<L.Marker | null>(null);
    const watchIdRef = useRef<number | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMarker, setSelectedMarker] = useState<any>(null);

    // Modificado para aceptar 'user'
    const [routeOrigin, setRouteOrigin] = useState<number | 'user' | null>(null);
    const [routeDestination, setRouteDestination] = useState<number | null>(null);
    const [showRoutePanel, setShowRoutePanel] = useState(false);
    const [userLocation, setUserLocation] = useState<L.LatLng | null>(null);

    // --- LÓGICA DE GEOLOCALIZACIÓN ---
    useEffect(() => {
        if (!navigator.geolocation) return;

        watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const latLng = new L.LatLng(latitude, longitude);
                setUserLocation(latLng);

                if (mapRef.current) {
                    if (userMarkerRef.current) {
                        userMarkerRef.current.setLatLng(latLng);
                    } else {
                        userMarkerRef.current = L.marker(latLng, {
                            icon: userLocationIcon,
                            zIndexOffset: 1000
                        }).addTo(mapRef.current).bindPopup("Tu ubicación actual");
                    }
                }
            },
            (err) => console.error("Error GPS:", err),
            { enableHighAccuracy: true }
        );

        return () => {
            if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
        };
    }, []);

    const centerOnUser = () => {
        if (mapRef.current && userLocation) {
            mapRef.current.flyTo(userLocation, 18);
        }
    };

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
        const map = L.map(mapContainerRef.current).setView([20.656333, -100.404745], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);
        mapRef.current = map;
        return () => { map.remove(); mapRef.current = null; };
    }, []);

    // Actualizar marcadores
    useEffect(() => {
        if (!mapRef.current) return;
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        edificiosFiltrados.forEach((edificio) => {
            const marker = L.marker([Number(edificio.latitud), Number(edificio.longitud)], { icon: edificioIcon })
                .addTo(mapRef.current!)
                .on('click', () => setSelectedMarker({ ...edificio, type: 'edificio' }));
            markersRef.current.push(marker);
        });

        eventosFiltrados.forEach((evento) => {
            if (!evento.edificio) return;
            const marker = L.marker([Number(evento.edificio.latitud), Number(evento.edificio.longitud)], { icon: eventoIcon })
                .addTo(mapRef.current!)
                .on('click', () => setSelectedMarker({ ...evento, type: 'evento' }));
            markersRef.current.push(marker);
        });
    }, [edificiosFiltrados, eventosFiltrados]);

    // Función para calcular ruta (MODIFICADA PARA GPS)
    const calculateRoute = () => {
        if (!mapRef.current || !routeOrigin || !routeDestination) return;

        let originPoint: L.LatLng;
        let originLabel: string;

        if (routeOrigin === 'user') {
            if (!userLocation) {
                alert("Esperando señal de GPS...");
                return;
            }
            originPoint = userLocation;
            originLabel = "Tu ubicación";
        } else {
            const originB = edificios.find(e => e.id_edificio === routeOrigin);
            if (!originB) return;
            originPoint = L.latLng(Number(originB.latitud), Number(originB.longitud));
            originLabel = originB.nombre;
        }

        const destination = edificios.find(e => e.id_edificio === routeDestination);
        if (!destination) return;

        if (routingControlRef.current) {
            mapRef.current.removeControl(routingControlRef.current);
        }

        const routingControl = (L as any).Routing.control({
            waypoints: [originPoint, L.latLng(Number(destination.latitud), Number(destination.longitud))],
            lineOptions: { styles: [{ color: '#EF4444', opacity: 0.8, weight: 6 }] },
            createMarker: (i: number, waypoint: any) => {
                return L.marker(waypoint.latLng).bindPopup(i === 0 ? originLabel : destination.nombre);
            }
        }).addTo(mapRef.current);

        routingControlRef.current = routingControl;
        setShowRoutePanel(false); // Cerramos panel al calcular
    };

    const clearRoute = () => {
        if (routingControlRef.current && mapRef.current) {
            mapRef.current.removeControl(routingControlRef.current);
            routingControlRef.current = null;
        }
        setRouteOrigin(null);
        setRouteDestination(null);
    };

    const handleLogout = () => { logout(); navigate('/login'); };

    return (
        <div className="h-screen flex flex-col">
            <header className="bg-[var(--app-header-bg)] border-b border-[var(--app-border)] px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <img src={logoUTEQ} alt="Logo" className="h-8 img-fluid" />
                    <h1 className="text-xl font-semibold text-[var(--app-text-primary)]">AirGuide</h1>
                </div>
                <div className="flex items-center gap-3">
                    {user ? (
                        <div className="flex items-center gap-4 px-3 py-2 bg-[var(--app-hover)] rounded-lg">
                            <span className="text-sm text-[var(--app-text-primary)]">{user.nombre}</span>
                            <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-1 bg-[var(--app-blue)] text-white rounded-lg text-sm">Cerrar Sesión</button>
                        </div>
                    ) : (
                            <button onClick={() => navigate('/login')} className="bg-[var(--app-blue)] text-white px-4 py-2 rounded-lg text-sm">Iniciar Sesión</button>
                    )}
                    <ThemeToggle />
                </div>
            </header>

            <div className="bg-[var(--app-header-bg)] border-b border-[var(--app-border)] px-4 py-3">
                <div className="max-w-2xl mx-auto relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--app-text-secondary)]" />
                    <input
                        type="text"
                        placeholder="Buscar en el campus..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-[var(--app-hover)] border border-[var(--app-border)] rounded-lg text-[var(--app-text-primary)]"
                    />
                </div>
            </div>

            <div className="flex-1 relative">
                <div ref={mapContainerRef} className="h-full w-full" />

                {/* BOTÓN FLOTANTE GPS */}
                <button
                    onClick={centerOnUser}
                    className="absolute bottom-24 right-4 bg-white text-blue-600 p-3 rounded-full shadow-2xl z-[1000] hover:bg-blue-50 transition-colors"
                    title="Centrar en mi ubicación"
                >
                    <LocateFixed className="w-6 h-6" />
                </button>

                {/* PANEL DE RUTAS ACTUALIZADO */}
                <button
                    onClick={() => setShowRoutePanel(!showRoutePanel)}
                    className="absolute bottom-4 right-4 bg-[var(--app-blue)] text-white p-3 rounded-full shadow-xl z-[1000] flex items-center gap-2"
                >
                    <RouteIcon className="w-5 h-5" />
                    {showRoutePanel && <span className="text-sm font-medium">Rutas</span>}
                </button>

                {showRoutePanel && (
                    <div className="absolute bottom-20 right-4 bg-white rounded-lg shadow-2xl p-4 w-80 z-[1000]">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-800">Calcular Ruta</h3>
                            <X className="w-4 h-4 cursor-pointer" onClick={() => setShowRoutePanel(false)} />
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 block mb-1">ORIGEN</label>
                                <select 
                                    className="w-full p-2 border rounded-md text-sm"
                                    value={routeOrigin || ''}
                                    onChange={(e) => setRouteOrigin(e.target.value === 'user' ? 'user' : Number(e.target.value))}
                                >
                                    <option value="">Selecciona origen...</option>
                                    {userLocation && <option value="user" className="text-blue-600 font-bold">📍 Mi ubicación actual</option>}
                                    {edificios.map(e => <option key={e.id_edificio} value={e.id_edificio}>{e.nombre}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 block mb-1">DESTINO</label>
                                <select 
                                    className="w-full p-2 border rounded-md text-sm"
                                    value={routeDestination || ''}
                                    onChange={(e) => setRouteDestination(Number(e.target.value))}
                                >
                                    <option value="">Selecciona destino...</option>
                                    {edificios.map(e => <option key={e.id_edificio} value={e.id_edificio}>{e.nombre}</option>)}
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={calculateRoute} className="flex-1 bg-blue-600 text-white py-2 rounded-md text-sm font-bold">Calcular</button>
                                <button onClick={clearRoute} className="p-2 bg-red-100 text-red-600 rounded-md"><X className="w-5 h-5" /></button>
                            </div>
                        </div>
                    </div>
                )}

                {/* LEYENDA */}
                <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
                    <h4 className="text-xs font-semibold mb-2">Leyenda</h4>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                            <div className="w-3 h-3 rounded-full bg-blue-500 border border-white shadow-sm" /> Tú (GPS)
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Building2 className="w-4 h-4 text-blue-500" /> Edificios
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Calendar className="w-4 h-4 text-green-500" /> Eventos
                        </div>
                    </div>
                </div>

                {/* Panel de Info (Edificios) */}
                {selectedMarker && (
                    <div className="absolute top-4 right-4 bg-white rounded-lg shadow-xl p-4 w-72 z-[1000]">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-blue-900">{selectedMarker.nombre}</h3>
                            <X className="w-4 h-4 cursor-pointer" onClick={() => setSelectedMarker(null)} />
                        </div>
                        <p className="text-xs text-gray-600 mb-4">{selectedMarker.descripcion}</p>
                        <button
                            onClick={() => {
                                setRouteDestination(selectedMarker.id_edificio);
                                setRouteOrigin('user');
                                setShowRoutePanel(true);
                            }}
                            className="w-full bg-blue-600 text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2"
                        >
                            <Navigation className="w-3 h-3" /> Cómo llegar desde aquí
                        </button>
                    </div>
                )}
            </div>
            <footer className="bg-[var(--app-header-bg)] border-b border-[var(--app-border)] px-4 py-3 flex items-center justify-between">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center md:flex-row">
                        <div className="mb-4 md:mb-0">
                            <p className="text-center md:text-left">
                                &copy; {new Date().getFullYear()} Vexel - UTEQ. All rights reserved.
                            </p>
                        </div>

                    </div>
                    <div className="flex space-x-6">
                        <a href="https://www.uteq.edu.mx" className=" text-[var(--app-text-primary)]" aria-label="UTEQ">
                            UTEQ
                        </a>
                        <a href="https://github.com/luiss811/Airguide/tree/main" className="text-[var(--app-text-primary)]" aria-label="GitHub">
                            GitHub
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}