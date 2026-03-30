import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    MapPin, Navigation, Calendar, Building2, Search,
    LogIn, UserCog, Users, LogOut, Route as RouteIcon,
    X, LocateFixed
} from 'lucide-react';
import { useNavigate } from 'react-router';
import logoUTEQ from '../../styles/images/letras_uteq_azul2025.png';
import { useEdificios, useEventos, useProfesores } from '../hooks';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { SearchBar } from '../components/SearchBar';
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from '@react-google-maps/api';

const center = { lat: 20.656333, lng: -100.404745 };
const containerStyle = { width: '100%', height: '100%' };

// --- ICONOS PERSONALIZADOS ---
const getIcon = (color: string, stroke: string) => {
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
      <path fill="${color}" stroke="${stroke}" stroke-width="2" d="M16 0C7.163 0 0 7.163 0 16c0 8.837 16 26 16 26s16-17.163 16-26C32 7.163 24.837 0 16 0z"/>
      <circle cx="16" cy="16" r="6" fill="white"/>
    </svg>`;
    return 'data:image/svg+xml;base64,' + btoa(svg);
};

export default function Map() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { edificios } = useEdificios();
    useEventos();
    const { profesores } = useProfesores();

    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: "AIzaSyBCORaDyk1go3cDfKQNSM9-CS8wv12GSJM"
    });

    const [map, setMap] = useState<google.maps.Map | null>(null);
    const watchIdRef = useRef<number | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMarker, setSelectedMarker] = useState<any>(null);
    const [routeOrigin, setRouteOrigin] = useState<number | 'user' | null>(null);
    const [routeDestination, setRouteDestination] = useState<number | null>(null);
    const [showRoutePanel, setShowRoutePanel] = useState(false);
    const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
    const [geojsonData, setGeojsonData] = useState<any>(null);

    const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
    const [routeInfo, setRouteInfo] = useState<{ duration: string; distance: string } | null>(null);

    // 2. LÓGICA DE GEOLOCALIZACIÓN
    useEffect(() => {
        if (!navigator.geolocation) return;
        watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setUserLocation({ lat: latitude, lng: longitude });
            },
            (err) => console.error("Error GPS:", err),
            { enableHighAccuracy: true }
        );
        return () => { if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current); };
    }, []);

    const centerOnUser = () => {
        if (map && userLocation) {
            map.panTo(userLocation);
            map.setZoom(18);
        }
    };

    const onLoad = useCallback(function callback(mapInstance: google.maps.Map) {
        setMap(mapInstance);
    }, []);

    const onUnmount = useCallback(function callback() {
        setMap(null);
    }, []);

    // 4. DIBUJAR CAPA GEOJSON
    useEffect(() => {
        if (map && geojsonData) {
            map.data.forEach((feature) => map.data.remove(feature));
            map.data.addGeoJson(geojsonData);
            map.data.setStyle((feature) => {
                const type = feature.getProperty('type');
                const isPath = type === 'path' || type === 'footway';
                return {
                    fillColor: isPath ? 'transparent' : '#3B82F6',
                    fillOpacity: isPath ? 0 : 0.1,
                    strokeColor: isPath ? '#94a3b8' : '#3B82F6',
                    strokeWeight: isPath ? 2 : 1,
                    clickable: false
                };
            });
        }
    }, [map, geojsonData]);

    // 5. FILTROS
    const canViewProfesores = user && ['alumno', 'admin', 'rector'].includes(user.rol);
    const profesoresFiltrados = canViewProfesores ? profesores.filter(p =>
        p.usuario?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.departamento?.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    const edificiosFiltrados = edificios.filter(e => {
        const matchesEdificio = e.nombre.toLowerCase().includes(searchTerm.toLowerCase());
        const hasMatchingProfesor = profesoresFiltrados.some(p =>
            p.cubiculos?.some(c => c.id_edificio === e.id_edificio)
        );
        return matchesEdificio || (searchTerm !== '' && hasMatchingProfesor);
    });

    // 6. CÁLCULO DE RUTA
    const calculateRoute = () => {
        if (!routeOrigin || !routeDestination) {
            return alert("Por favor selecciona un origen y un destino.");
        }

        let originCoords: google.maps.LatLngLiteral;

        if (routeOrigin === 'user') {
            if (!userLocation) return alert("Esperando señal GPS... asegúrate de dar permisos de ubicación.");
            originCoords = userLocation;
        } else {
            const originB = edificios.find(e => e.id_edificio === routeOrigin);
            if (!originB) return;
            originCoords = { lat: Number(originB.latitud), lng: Number(originB.longitud) };
        }

        const destB = edificios.find(e => e.id_edificio === routeDestination);
        if (!destB) return;
        const destinationCoords = { lat: Number(destB.latitud), lng: Number(destB.longitud) };

        if (!window.google) return;
        const directionsService = new window.google.maps.DirectionsService();

        directionsService.route(
            {
                origin: originCoords,
                destination: destinationCoords,
                travelMode: window.google.maps.TravelMode.WALKING
            },
            (result, status) => {
                if (status === window.google.maps.DirectionsStatus.OK && result) {
                    setDirectionsResponse(result);
                    const leg = result.routes[0].legs[0];
                    setRouteInfo({ duration: leg.duration?.text || '', distance: leg.distance?.text || '' });
                    setShowRoutePanel(false);
                } else {
                    alert("Google no encontró una ruta peatonal válida entre estos puntos.");
                }
            }
        );
    };

    const clearRoute = () => {
        setDirectionsResponse(null);
        setRouteInfo(null);
        setRouteOrigin(null);
        setRouteDestination(null);
    };

    if (loadError) return <div className="h-screen flex items-center justify-center">Error cargando Google Maps</div>;

    return (
        <div className="h-screen flex flex-col">
            <header className="bg-[var(--app-header-bg)] border-b border-[var(--app-border)] px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <img src={logoUTEQ} alt="Logo" className="h-8" />
                    <h1 className="text-xl font-semibold text-[var(--app-text-primary)]">AirGuide</h1>
                </div>
                <div className="flex items-center gap-3">
                    {user ? (
                        <div className="flex items-center gap-4 px-3 py-2 bg-[var(--app-hover)] rounded-lg">
                            <span className="text-sm text-[var(--app-text-primary)]">{user.nombre}</span>
                            <button onClick={() => { logout(); navigate('/login'); }} className="bg-[var(--app-blue)] text-white px-3 py-1 rounded-lg text-sm">Cerrar Sesión</button>
                        </div>
                    ) : (
                        <button onClick={() => navigate('/login')} className="bg-[var(--app-blue)] text-white px-4 py-2 rounded-lg text-sm">Iniciar Sesión</button>
                    )}
                    <ThemeToggle />
                </div>
            </header>

            <SearchBar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                profesoresFiltrados={profesoresFiltrados}
                canViewProfesores={!!canViewProfesores}
                onProfesorSelect={(p, cubiculo) => {
                    const ed = cubiculo.edificio;
                    if (ed && map) {
                        map.panTo({ lat: Number(ed.latitud), lng: Number(ed.longitud) });
                        map.setZoom(18);
                        setSelectedMarker({
                            ...ed,
                            type: 'profesor',
                            profesorNombre: p.usuario?.nombre,
                            departamento: p.departamento,
                            cubiculoInfo: `Cubículo ${cubiculo.numero}, Piso ${cubiculo.piso}`
                        });
                    }
                }}
            />

            <div className="flex-1 relative">
                {isLoaded ? (
                    <GoogleMap
                        mapContainerStyle={containerStyle}
                        center={center}
                        zoom={15}
                        onLoad={onLoad}
                        onUnmount={onUnmount}
                        options={{ mapTypeControl: false, streetViewControl: false }}
                    >
                        {userLocation && (
                            <Marker
                                position={userLocation}
                                icon={{
                                    path: window.google.maps.SymbolPath.CIRCLE,
                                    scale: 9,
                                    fillColor: "#3B82F6",
                                    fillOpacity: 0.8,
                                    strokeColor: "white",
                                    strokeWeight: 2,
                                }}
                                title="Tu ubicación actual"
                            />
                        )}

                        {edificiosFiltrados.map((edificio) => (
                            <Marker
                                key={edificio.id_edificio}
                                position={{ lat: Number(edificio.latitud), lng: Number(edificio.longitud) }}
                                icon={{
                                    url: getIcon('#3B82F6', '#1E40AF'),
                                    scaledSize: new window.google.maps.Size(32, 42),
                                    anchor: new window.google.maps.Point(16, 42),
                                }}
                                onClick={() => {
                                    if (map) map.panTo({ lat: Number(edificio.latitud), lng: Number(edificio.longitud) });
                                    setSelectedMarker({ ...edificio, type: 'edificio' });
                                }}
                            />
                        ))}

                        {directionsResponse && (
                            <DirectionsRenderer
                                options={{
                                    directions: directionsResponse,
                                    polylineOptions: { strokeColor: '#3B82F6', strokeWeight: 6, strokeOpacity: 0.8 },
                                    suppressMarkers: true
                                }}
                            />
                        )}
                    </GoogleMap>
                ) : (
                    <div className="h-full flex items-center justify-center">Cargando mapas...</div>
                )}

                {/* BOTÓN GPS */}
                <button
                    onClick={centerOnUser}
                    className="absolute bottom-24 right-4 bg-white text-blue-600 p-3 rounded-full shadow-2xl z-[10] hover:bg-blue-100 transition-colors"
                >
                    <LocateFixed className="w-6 h-6" />
                </button>

                {/* BOTÓN RUTAS */}
                <button
                    onClick={() => setShowRoutePanel(!showRoutePanel)}
                    className="absolute bottom-4 right-4 bg-[var(--app-blue)] text-white p-3 rounded-full shadow-xl z-[10] flex items-center gap-2"
                >
                    <RouteIcon className="w-5 h-5" />
                    {showRoutePanel && <span className="text-sm font-medium">Rutas</span>}
                </button>

                {showRoutePanel && (
                    <div className="absolute bottom-20 right-4 bg-white rounded-lg shadow-2xl p-4 w-80 z-[10]">
                        <div className="flex justify-between items-center mb-4 text-gray-800">
                            <h3 className="font-bold">Navegación Interna</h3>
                            <X className="w-4 h-4 cursor-pointer" onClick={() => setShowRoutePanel(false)} />
                        </div>
                        <div className="space-y-4">
                            <select
                                className="w-full p-2 border rounded text-sm text-gray-700"
                                value={routeOrigin || ''}
                                onChange={(e) => setRouteOrigin(e.target.value === 'user' ? 'user' : Number(e.target.value))}
                            >
                                <option value="">Punto de origen...</option>
                                {userLocation && <option value="user" className="text-blue-600 font-bold">📍 Mi ubicación actual</option>}
                                {edificios.map(e => <option key={e.id_edificio} value={e.id_edificio}>{e.nombre}</option>)}
                            </select>
                            <select
                                className="w-full p-2 border rounded text-sm text-gray-700"
                                value={routeDestination || ''}
                                onChange={(e) => setRouteDestination(Number(e.target.value))}
                            >
                                <option value="">Destino final...</option>
                                {edificios.map(e => <option key={e.id_edificio} value={e.id_edificio}>{e.nombre}</option>)}
                            </select>
                            <div className="flex gap-2">
                                <button onClick={calculateRoute} className="flex-1 bg-blue-600 text-white py-2 rounded font-bold">Calcular</button>
                                <button onClick={clearRoute} className="p-2 bg-red-100 text-red-600 rounded"><X className="w-5 h-5" /></button>
                            </div>
                        </div>
                    </div>
                )}

                {/* INFO PANEL */}
                {selectedMarker && (
                    <div className="absolute top-4 right-4 bg-white rounded-lg shadow-xl p-4 w-72 z-[10]">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-blue-900">{selectedMarker.profesorNombre || selectedMarker.nombre}</h3>
                            <X className="w-4 h-4 cursor-pointer text-gray-400" onClick={() => setSelectedMarker(null)} />
                        </div>

                        {selectedMarker.type === 'profesor' ? (
                            <div className="mb-4">
                                <p className="text-sm font-semibold text-gray-700">{selectedMarker.departamento}</p>
                                <p className="text-xs text-gray-600 mt-1">
                                    <Building2 className="w-3 h-3 inline mr-1" />
                                    {selectedMarker.nombre} - {selectedMarker.cubiculoInfo}
                                </p>
                            </div>
                        ) : (
                            <p className="text-xs text-gray-600 mb-4">{selectedMarker.descripcion}</p>
                        )}

                        <button
                            onClick={() => { setRouteDestination(selectedMarker.id_edificio); setRouteOrigin('user'); setShowRoutePanel(true); }}
                            className="w-full bg-blue-600 text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2"
                        >
                            <Navigation className="w-3 h-3" /> Cómo llegar aquí
                        </button>
                    </div>
                )}

                {/* LEYENDA */}
                <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[10]">
                    <h4 className="text-xs font-semibold mb-2 text-gray-800 border-b pb-1">Leyenda</h4>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                            <div className="w-3 h-3 rounded-full bg-blue-500 border border-white" /> Tú (GPS)
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                            <MapPin className=" w-3 h-3 text-blue-500" />Edificios
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                            <div className="w-4 h-0.5 border-t-2 border-blue-400" /> Rutas Internas
                        </div>
                        {routeInfo && (
                            <div className="mt-2 pt-2 border-t text-xs text-blue-600 font-semibold">
                                <div>Distancia: {routeInfo.distance}</div>
                                <div>Tiempo estimado: {routeInfo.duration}</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <footer className="bg-white dark:bg-gray-900 border-t px-4 py-3 text-xs text-gray-500 flex justify-between items-center">
                <p>&copy; {new Date().getFullYear()} Vexel - UTEQ. AirGuide Project.</p>
                <div className="flex gap-4 underline">
                    <a href="https://www.uteq.edu.mx">UTEQ</a>
                    <a href="https://github.com/luiss811/Airguide">GitHub</a>
                </div>
            </footer>
        </div>
    );
}