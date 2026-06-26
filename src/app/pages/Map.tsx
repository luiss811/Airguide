import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Navigation, Building2, Route as RouteIcon, X, LocateFixed, Eye, Calendar, Clock, ClipboardCheck } from 'lucide-react';
import logoUTEQ from '../../styles/images/letras_uteq_azul2025.png';
import { useEdificios, useEventos, useProfesores } from '../hooks';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { SearchBar } from '../components/SearchBar';
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer, Polyline } from '@react-google-maps/api';
import { toast } from 'sonner';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselPrevious,
    CarouselNext,
} from '../components/ui/carousel';

const center = { lat: 20.656333, lng: -100.404745 };
const containerStyle = { width: '100%', height: '100%' };

// --- Iconos de Edificios ---
const getIcon = (color: string, stroke: string) => {
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
        <path fill="${color}" stroke="${stroke}" stroke-width="2" d="M16 0C7.163 0 0 7.163 0 16c0 8.837 16 26 16 26s16-17.163 16-26C32 7.163 24.837 0 16 0z"/>
        <circle cx="16" cy="16" r="6" fill="white"/>
    </svg>`;
    return 'data:image/svg+xml;base64,' + btoa(svg);
};

// --- Haversine Distance helper (meters) ---
function getDistance(p1: google.maps.LatLngLiteral, p2: google.maps.LatLngLiteral): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = (p2.lat - p1.lat) * Math.PI / 180;
    const dLng = (p2.lng - p1.lng) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// --- Dijkstra algorithm for caminosGeograficos ---
interface GraphNode {
    id: string;
    lat: number;
    lng: number;
}

interface Graph {
    nodes: Map<string, GraphNode>;
    edges: Map<string, Map<string, number>>; // node1 -> node2 -> distance
}

function buildGraph(paths: Array<{ id: number; tipo: string; path: google.maps.LatLngLiteral[] }>): Graph {
    const nodes = new Map<string, GraphNode>();
    const edges = new Map<string, Map<string, number>>();

    const getKey = (p: google.maps.LatLngLiteral) => `${p.lat.toFixed(6)},${p.lng.toFixed(6)}`;

    const addNode = (p: google.maps.LatLngLiteral) => {
        const key = getKey(p);
        if (!nodes.has(key)) {
            nodes.set(key, { id: key, lat: p.lat, lng: p.lng });
        }
        return key;
    };

    const addEdge = (p1: google.maps.LatLngLiteral, p2: google.maps.LatLngLiteral) => {
        const k1 = addNode(p1);
        const k2 = addNode(p2);
        const dist = getDistance(p1, p2);

        if (!edges.has(k1)) edges.set(k1, new Map());
        if (!edges.has(k2)) edges.set(k2, new Map());

        edges.get(k1)!.set(k2, dist);
        edges.get(k2)!.set(k1, dist);
    };

    for (const camino of paths) {
        for (let i = 0; i < camino.path.length - 1; i++) {
            addEdge(camino.path[i], camino.path[i + 1]);
        }
    }

    return { nodes, edges };
}

function findClosestNode(nodes: Map<string, GraphNode>, target: google.maps.LatLngLiteral): { key: string; distance: number } {
    let closestKey = '';
    let minDist = Infinity;
    for (const [key, node] of nodes.entries()) {
        const dist = getDistance(node, target);
        if (dist < minDist) {
            minDist = dist;
            closestKey = key;
        }
    }
    return { key: closestKey, distance: minDist };
}

function runDijkstra(graph: Graph, startKey: string, endKey: string): { previous: Map<string, string | null>; distance: number } {
    const distances = new Map<string, number>();
    const previous = new Map<string, string | null>();
    const queue = new Set<string>();

    for (const key of graph.nodes.keys()) {
        distances.set(key, Infinity);
        previous.set(key, null);
        queue.add(key);
    }
    distances.set(startKey, 0);

    while (queue.size > 0) {
        let u: string | null = null;
        let minDist = Infinity;
        for (const key of queue) {
            const dist = distances.get(key)!;
            if (dist < minDist) {
                minDist = dist;
                u = key;
            }
        }

        if (u === null || u === endKey || distances.get(u) === Infinity) {
            break;
        }

        queue.delete(u);

        const neighbors = graph.edges.get(u);
        if (neighbors) {
            for (const [v, weight] of neighbors.entries()) {
                if (!queue.has(v)) continue;
                const alt = distances.get(u)! + weight;
                if (alt < distances.get(v)!) {
                    distances.set(v, alt);
                    previous.set(v, u);
                }
            }
        }
    }

    return { previous, distance: distances.get(endKey) || Infinity };
}

function findShortestPath(
    graph: Graph,
    start: google.maps.LatLngLiteral,
    end: google.maps.LatLngLiteral
): google.maps.LatLngLiteral[] | null {
    if (graph.nodes.size === 0) return null;

    const startNode = findClosestNode(graph.nodes, start);
    const endNode = findClosestNode(graph.nodes, end);

    if (startNode.distance > 300 || endNode.distance > 300) {
        return null;
    }

    const { previous, distance } = runDijkstra(graph, startNode.key, endNode.key);

    if (distance === Infinity) {
        return null;
    }

    const path: google.maps.LatLngLiteral[] = [];
    let curr: string | null = endNode.key;
    while (curr !== null) {
        const node = graph.nodes.get(curr)!;
        path.unshift({ lat: node.lat, lng: node.lng });
        curr = previous.get(curr)!;
    }

    // Stitch origin and destination to the nearest nodes in the path
    return [start, ...path, end];
}

export default function MapPage() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { edificios } = useEdificios();
    const { eventos } = useEventos();
    const { profesores } = useProfesores();

    const [caminosRoutePath, setCaminosRoutePath] = useState<google.maps.LatLngLiteral[] | null>(null);
    const [activeTab, setActiveTab] = useState<'curso' | 'proximos'>('curso');

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

    const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
    const [routeInfo, setRouteInfo] = useState<{ duration: string; distance: string } | null>(null);
    const [autoStitchLines, setAutoStitchLines] = useState<{
        startLine: google.maps.LatLngLiteral[] | null;
        endLine: google.maps.LatLngLiteral[] | null;
    }>({ startLine: null, endLine: null });
    const [customRouteDetails, setCustomRouteDetails] = useState<google.maps.LatLngLiteral[] | null>(null);
    const [isCongested, setIsCongested] = useState(false);

    const [showHeatmap, setShowHeatmap] = useState(false);
    const [heatmapRoutes, setHeatmapRoutes] = useState<Array<{ path: google.maps.LatLngLiteral[], score: number }>>([]);
    const [caminosGeograficos, setCaminosGeograficos] = useState<Array<{ id: number; tipo: string; path: google.maps.LatLngLiteral[] }>>([]);

    // LÓGICA DE GEOLOCALIZACIÓN
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

    // CARGAR CAMINOS GEOGRÁFICOS
    useEffect(() => {
        const fetchCaminos = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'https://airguidebackend-production.up.railway.app/api';
                const res = await fetch(`${API_URL}/mapa/data`);
                if (res.ok) {
                    const data = await res.json();
                    if (data?.features) {
                        const paths = data.features
                            .filter((f: any) => f.properties?.type !== 'building')
                            .map((f: any) => {
                                const coordinates = f.geometry?.coordinates || [];
                                const pathPoints = coordinates.map((coord: [number, number]) => ({
                                    lat: coord[1],
                                    lng: coord[0]
                                }));
                                return {
                                    id: f.properties?.id,
                                    tipo: f.properties?.type,
                                    path: pathPoints
                                };
                            });
                        setCaminosGeograficos(paths);
                    }
                }
            } catch (error) {
                console.error("Error al cargar caminos geográficos:", error);
            }
        };
        fetchCaminos();
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

    const toggleHeatmap = async () => {
        if (showHeatmap) {
            setShowHeatmap(false);
            setHeatmapRoutes([]);
        } else {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'https://airguidebackend-production.up.railway.app/api';
                toast.info("Analizando datos de todas las rutas...", { duration: 3000 });
                const res = await fetch(`${API_URL}/rutas/heatmap`);
                if (res.ok) {
                    const data = await res.json();
                    setHeatmapRoutes(data);
                    setShowHeatmap(true);
                } else {
                    toast.error("Ocurrio un error al cargar el modelo de congestión. Intenta de nuevo más tarde.");
                }
            } catch {
                toast.error("No se pudo cargar el modelo de congestión. Intenta de nuevo más tarde.");
            }
        }
    };

    // FILTROS
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
    // CALCULO DE RUTA
    const calculateGraphRoute = (originCoords: google.maps.LatLngLiteral, destinationCoords: google.maps.LatLngLiteral): boolean => {
        if (caminosGeograficos && caminosGeograficos.length > 0) {
            const graph = buildGraph(caminosGeograficos);
            const path = findShortestPath(graph, originCoords, destinationCoords);
            if (path) {
                setCaminosRoutePath(path);

                let totalDist = 0;
                for (let i = 0; i < path.length - 1; i++) {
                    totalDist += getDistance(path[i], path[i + 1]);
                }
                const distStr = totalDist >= 1000 ? `${(totalDist / 1000).toFixed(1)} km` : `${totalDist.toFixed(0)} m`;
                const durationMin = Math.ceil((totalDist / 1.3) / 60);
                const durStr = `${durationMin} min`;

                setRouteInfo({ duration: durStr, distance: distStr });
                setDirectionsResponse(null);
                setCustomRouteDetails(null);
                setIsCongested(false);
                setAutoStitchLines({ startLine: null, endLine: null });

                setShowRoutePanel(false);
                return true;
            }
        }
        return false;
    };

    const fetchCustomPath = async (originId: number, destinationId: number): Promise<google.maps.LatLngLiteral[] | null> => {
        const API_URL = import.meta.env.VITE_API_URL || 'https://airguidebackend-production.up.railway.app/api';
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/rutas/find`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    origen_tipo: 'edificio',
                    origen_id: originId.toString(),
                    destino_tipo: 'edificio',
                    destino_id: destinationId.toString()
                })
            });
            if (res.ok) {
                const data = await res.json();
                if (data?.detalles?.length > 0) {
                    const customPath = data.detalles.map((d: any) => ({ lat: Number(d.latitud), lng: Number(d.longitud) }));
                    setCustomRouteDetails(customPath);

                    try {
                        const aiRes = await fetch(`${API_URL}/rutas/check-congestion`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id_ruta: data.id_ruta })
                        });
                        if (aiRes.ok) {
                            const aiData = await aiRes.json();

                            if (aiData.congested) {
                                toast.error(`Alto Flujo Detectado (Riesgo ${(aiData.score * 100).toFixed(0)}%). Sugerimos tomar vías alternas si tiene prisa.`, { duration: 8000 });
                                setIsCongested(true);
                            } else {
                                setIsCongested(false);
                            }
                        }
                    } catch (e) {
                        console.error('Error al verificar congestión', e);
                    }
                    return customPath;
                }
            }
        } catch (err) {
            console.error("Error find custom route:", err);
        }
        setCustomRouteDetails(null);
        setIsCongested(false);
        return null;
    };

    const calculateGoogleMapsRoute = (
        originCoords: google.maps.LatLngLiteral,
        destinationCoords: google.maps.LatLngLiteral,
        customPath: google.maps.LatLngLiteral[] | null
    ) => {
        if (!globalThis.google) return;
        const directionsService = new globalThis.google.maps.DirectionsService();

        let googleOrigin = originCoords;
        let googleDestination = destinationCoords;
        let isCustomPathAtOrigin = false;

        if (customPath && customPath.length > 0) {
            const distToOrigin = Math.pow(customPath[0].lat - originCoords.lat, 2) + Math.pow(customPath[0].lng - originCoords.lng, 2);
            const distToDest = Math.pow(customPath.at(-1)!.lat - destinationCoords.lat, 2) + Math.pow(customPath.at(-1)!.lng - destinationCoords.lng, 2);

            if (distToOrigin < distToDest) {
                isCustomPathAtOrigin = true;
                googleOrigin = customPath.at(-1)!;
            } else {
                googleDestination = customPath[0];
            }
        }

        directionsService.route(
            {
                origin: googleOrigin,
                destination: googleDestination,
                travelMode: globalThis.google.maps.TravelMode.WALKING
            },
            (result, status) => {
                if (status === globalThis.google.maps.DirectionsStatus.OK && result) {
                    setDirectionsResponse(result);
                    const leg = result.routes[0].legs[0];
                    setRouteInfo({ duration: leg.duration?.text || '', distance: leg.distance?.text || '' });
                    setCaminosRoutePath(null);

                    setAutoStitchLines({
                        startLine: isCustomPathAtOrigin ? null : [
                            originCoords,
                            { lat: leg.start_location.lat(), lng: leg.start_location.lng() }
                        ],
                        endLine: (!isCustomPathAtOrigin && customPath) ? null : [
                            { lat: leg.end_location.lat(), lng: leg.end_location.lng() },
                            destinationCoords
                        ]
                    });

                    setShowRoutePanel(false);
                } else {
                    toast.error("Google Maps no encontró una ruta peatonal válida entre estos puntos.");
                }
            }
        );
    };

    const calculateRoute = async () => {
        if (!routeOrigin || !routeDestination) {
            toast.error("Por favor selecciona un origen y un destino.");
            return;
        }

        let originCoords: google.maps.LatLngLiteral;

        if (routeOrigin === 'user') {
            if (!userLocation) {
                toast.error("Esperando señal GPS... asegúrate de dar permisos de ubicación.");
                return;
            }
            originCoords = userLocation;
        } else {
            const originB = edificios.find(e => e.id_edificio === routeOrigin);
            if (!originB) return;
            originCoords = { lat: Number(originB.latitud), lng: Number(originB.longitud) };
        }

        const destB = edificios.find(e => e.id_edificio === routeDestination);
        if (!destB) return;
        const destinationCoords = { lat: Number(destB.latitud), lng: Number(destB.longitud) };

        // 1. Prioridad: ruta en caminos geográficos locales
        const foundLocal = calculateGraphRoute(originCoords, destinationCoords);
        if (foundLocal) return;

        // 2. Fallback: buscar ruta custom en base de datos
        let customPath: google.maps.LatLngLiteral[] | null = null;
        if (routeOrigin === 'user') {
            setCustomRouteDetails(null);
            setIsCongested(false);
        } else {
            customPath = await fetchCustomPath(routeOrigin, routeDestination);
        }

        // 3. Fallback: Google Maps directions
        calculateGoogleMapsRoute(originCoords, destinationCoords, customPath);
    };

    const clearRoute = () => {
        setDirectionsResponse(null);
        setCaminosRoutePath(null);
        setAutoStitchLines({ startLine: null, endLine: null });
        setCustomRouteDetails(null);
        setIsCongested(false);
        setRouteInfo(null);
        setRouteOrigin(null);
        setRouteDestination(null);
        setShowHeatmap(false);
        setHeatmapRoutes([]);
    };

    const renderEventsCarousel = () => {
        const currentEventos = activeTab === 'curso' ? eventosEnCurso : eventosProximos;
        if (currentEventos.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-12 text-center text-[var(--app-text-secondary)] space-y-3 bg-[var(--app-hover)] rounded-2xl p-6">
                    <Calendar className="w-8 h-8 text-[var(--app-text-secondary)] opacity-50" />
                    <div>
                        <p className="font-semibold text-sm text-[var(--app-text-primary)]">Sin eventos</p>
                        <p className="text-xs">No hay eventos registrados en esta categoría.</p>
                    </div>
                </div>
            );
        }

        const badgeClass = activeTab === 'curso'
            ? 'bg-red-100 text-red-700 dark:bg-red-955 dark:text-red-300'
            : 'bg-blue-100 text-blue-700 dark:bg-blue-955 dark:text-blue-300';

        const labelText = activeTab === 'curso' ? 'En Curso' : 'Próximo';

        return (
            <div className="w-full relative px-10">
                <Carousel className="w-full relative" opts={{ align: "start" }}>
                    <CarouselContent>
                        {currentEventos.map((evento) => (
                            <CarouselItem key={evento.id_evento} className="basis-full">
                                <div className="bg-[var(--app-bg)] border border-[var(--app-border)] rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between h-[320px]">
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeClass}`}>
                                                {labelText}
                                            </span>
                                            {evento.prioridad_evento && (
                                                <span className="text-[10px] text-[var(--app-text-secondary)]">Prioridad: {evento.prioridad_evento}</span>
                                            )}
                                        </div>
                                        <h3 className="font-bold text-[var(--app-text-primary)] text-base line-clamp-1 mb-1">{evento.nombre}</h3>
                                        <p className="text-xs text-[var(--app-text-secondary)] line-clamp-3 mb-4">{evento.descripcion || 'Sin descripción disponible.'}</p>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="space-y-1.5 text-xs text-[var(--app-text-secondary)]">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-3.5 h-3.5 text-[var(--app-blue)]" />
                                                <span>
                                                    {new Date(evento.fecha_inicio).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })} • {new Date(evento.fecha_inicio).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            {evento.edificio && (
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-3.5 h-3.5 text-[var(--app-blue)]" />
                                                    <span className="font-medium text-[var(--app-text-primary)]">{evento.edificio.nombre}</span>
                                                </div>
                                            )}
                                        </div>

                                        {evento.edificio && (
                                            <div className="flex flex-col gap-2">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            if (map && evento.edificio) {
                                                                map.panTo({ lat: Number(evento.edificio.latitud), lng: Number(evento.edificio.longitud) });
                                                                map.setZoom(18);
                                                                setSelectedMarker({
                                                                    ...evento.edificio,
                                                                    type: 'edificio',
                                                                    nombre: evento.edificio.nombre,
                                                                    descripcion: `Edificio del evento: ${evento.nombre}. ${evento.descripcion || ''}`
                                                                });
                                                            }
                                                        }}
                                                        className="flex-1 bg-[var(--app-hover)] hover:bg-[var(--app-border)] text-[var(--app-text-primary)] text-[11px] font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" /> Ver en mapa
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (evento.edificio) {
                                                                setRouteDestination(evento.id_edificio);
                                                                setRouteOrigin('user');
                                                                setShowRoutePanel(true);
                                                                toast.info(`Calculando ruta hacia el ${evento.edificio.nombre}...`);
                                                                setTimeout(() => {
                                                                    calculateRoute();
                                                                }, 100);
                                                            }
                                                        }}
                                                        className="flex-1 bg-app-blue hover:bg-blue-600 text-white text-[11px] font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                                                    >
                                                        <Navigation className="w-3.5 h-3.5" /> Cómo llegar
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => navigate(`/eventos/${evento.id_evento}/confirmar`)}
                                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                                                >
                                                    <ClipboardCheck className="w-3.5 h-3.5" /> Confirmar Asistencia
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="absolute size-8 rounded-full top-1/2 -left-8 -translate-y-1/2" />
                    <CarouselNext className="absolute size-8 rounded-full top-1/2 -right-8 -translate-y-1/2" />
                </Carousel>
            </div>
        );
    };
    // EVENTOS FILTRADOS Y ORDENADOS
    const now = new Date();
    const sortedEventos = [...(eventos || [])].sort((a, b) => new Date(a.fecha_inicio).getTime() - new Date(b.fecha_inicio).getTime());

    const eventosEnCurso = sortedEventos.filter(e => {
        const start = new Date(e.fecha_inicio);
        const end = new Date(e.fecha_fin);
        return e.activo && start <= now && end >= now;
    });

    const eventosProximos = sortedEventos.filter(e => {
        const start = new Date(e.fecha_inicio);
        return e.activo && start > now;
    });

    if (loadError) return <div className="h-screen flex items-center justify-center">No pudimos cargar las rutas locales. Las rutas serán generadas por Google Maps, esto puede generar rutas erroneas</div>;

    return (
        <div className="h-screen flex flex-col">
            <header className="bg-[var(--app-header-bg)] border-b border-[var(--app-border)] px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <img src={logoUTEQ} alt="Logo UTEQ" className="h-8" />
                    <h1 className="text-xl font-semibold text-[var(--app-text-primary)]">AirGuide</h1>
                </div>
                <div className="flex items-center gap-3">
                    {user?.rol === "alumno" && (
                        <div className="flex items-center gap-4 px-3 py-2 bg-[var(--app-hover)] rounded-lg">
                            <span className="text-sm text-[var(--app-text-primary)]">{user.nombre}</span>
                            <button onClick={() => { logout(); navigate('/login'); }} className="bg-app-blue text-white px-3 py-1 rounded-lg text-sm">Cerrar Sesión</button>
                        </div>
                    )}
                    {user?.rol === "admin" ? (
                        <div className="flex items-center gap-4 px-3 py-2 bg-[var(--app-hover)] rounded-lg">
                            <span className="text-sm text-[var(--app-text-primary)]">{user.nombre}</span>
                            <button onClick={() => { navigate('/admin'); }} className="bg-app-blue text-white px-3 py-1 rounded-lg text-sm">Dashboard</button>
                            <button onClick={() => { logout(); navigate('/login'); }} className="bg-app-blue text-white px-3 py-1 rounded-lg text-sm">Cerrar Sesión</button>
                        </div>
                    ) : (
                        <button onClick={() => navigate('/login')} className="bg-app-blue text-white px-4 py-2 rounded-lg text-sm">Iniciar Sesión</button>
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

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 bg-[var(--app-bg)] overflow-hidden">
                {/* COLUMNA IZQUIERDA: Eventos */}
                <div className="lg:col-span-4 flex flex-col p-6 overflow-y-auto border-r border-[var(--app-border)] bg-[var(--app-card-bg)] space-y-6">
                    <div>
                        <h2 className="text-xl font-bold text-[var(--app-text-primary)]">Eventos del Campus</h2>
                        <p className="text-xs text-[var(--app-text-secondary)] mt-1">Descubre qué está pasando en la UTEQ y cómo llegar.</p>
                    </div>

                    {/* Selector de Pestañas (Tabs) */}
                    <div className="flex bg-[var(--app-hover)] p-1 rounded-xl">
                        <button
                            onClick={() => setActiveTab('curso')}
                            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${activeTab === 'curso'
                                ? 'bg-[var(--app-card-bg)] text-[var(--app-text-primary)] shadow-sm'
                                : 'text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)]'
                                }`}
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                            En Curso ({eventosEnCurso.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('proximos')}
                            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${activeTab === 'proximos'
                                ? 'bg-[var(--app-card-bg)] text-[var(--app-text-primary)] shadow-sm'
                                : 'text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)]'
                                }`}
                        >
                            <Calendar className="w-3.5 h-3.5 text-[var(--app-blue)]" />
                            Próximos ({eventosProximos.length})
                        </button>
                    </div>

                    {/* Carrusel de Eventos */}
                    <div className="flex-1 flex flex-col justify-center min-h-0 py-4">
                        {renderEventsCarousel()}
                    </div>
                </div>

                {/* Mapa */}
                <div className="lg:col-span-8 relative h-full min-h-0">
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
                                        path: globalThis.google.maps.SymbolPath.CIRCLE,
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
                                        scaledSize: new globalThis.google.maps.Size(30, 40),
                                        anchor: new globalThis.google.maps.Point(10, 35),
                                    }}
                                    onClick={() => {
                                        if (map) map.panTo({ lat: Number(edificio.latitud), lng: Number(edificio.longitud) });
                                        setSelectedMarker({ ...edificio, type: 'edificio' });
                                    }}
                                />
                            ))}

                            {directionsResponse && !caminosRoutePath && (
                                <DirectionsRenderer
                                    options={{
                                        directions: directionsResponse,
                                        polylineOptions: { strokeColor: '#3B82F6', strokeWeight: 6, strokeOpacity: 0.8 },
                                        suppressMarkers: true
                                    }}
                                />
                            )}

                            {caminosRoutePath && (
                                <Polyline
                                    path={caminosRoutePath}
                                    options={{
                                        strokeColor: '#3B82F6',
                                        strokeWeight: 6,
                                        strokeOpacity: 0.9,
                                    }}
                                />
                            )}

                            {autoStitchLines.startLine && (
                                <Polyline
                                    path={autoStitchLines.startLine}
                                    options={{
                                        strokeColor: '#3B82F6',
                                        strokeOpacity: 0,
                                        strokeWeight: 4,
                                        icons: [{
                                            icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 3 },
                                            offset: '0',
                                            repeat: '20px'
                                        }]
                                    }}
                                />
                            )}

                            {autoStitchLines.endLine && (
                                <Polyline
                                    path={autoStitchLines.endLine}
                                    options={{
                                        strokeColor: '#3B82F6',
                                        strokeOpacity: 0,
                                        strokeWeight: 4,
                                        icons: [{
                                            icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 3 },
                                            offset: '0',
                                            repeat: '20px'
                                        }]
                                    }}
                                />
                            )}

                            {customRouteDetails && (
                                <Polyline
                                    path={customRouteDetails}
                                    options={{
                                        strokeColor: isCongested ? '#EF4444' : '#9333EA', // Red if Congested, Purple otherwise
                                        strokeWeight: 6,
                                    }}
                                />
                            )}

                            {/* CAMINOS GEOGRÁFICOS PEATONALES */}
                            {caminosGeograficos.map((camino) => {
                                const isSteps = camino.tipo === 'steps';
                                return (
                                    <Polyline
                                        key={`camino-${camino.id}`}
                                        path={camino.path}
                                        options={{
                                            strokeColor: isSteps ? '#718096' : '#A0AEC0',
                                            strokeOpacity: 0.6,
                                            strokeWeight: isSteps ? 3.5 : 2.5,
                                            icons: isSteps ? [{
                                                icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 2 },
                                                offset: '0',
                                                repeat: '8px'
                                            }] : undefined,
                                            zIndex: 5
                                        }}
                                    />
                                );
                            })}

                            {/* GLOBAL AI HEATMAP */}
                            {showHeatmap && heatmapRoutes.map((h, i) => {
                                if (!h.path || h.path.length === 0) return null;
                                let color = '#10B981';
                                if (h.score > 0.7) {
                                    color = '#EF4444';
                                } else if (h.score > 0.4) {
                                    color = '#F59E0B';
                                }
                                return (
                                    <Polyline
                                        key={`heatmap-route-${i}`}
                                        path={h.path}
                                        options={{
                                            strokeColor: color,
                                            strokeOpacity: h.score > 0.7 ? 0.9 : 0.5, // Resaltar más las rojas
                                            strokeWeight: h.score > 0.7 ? 8 : 4,
                                            zIndex: h.score > 0.7 ? 20 : 10
                                        }}
                                    />
                                );
                            })}
                        </GoogleMap>
                    ) : (
                        <div className="h-full flex items-center justify-center">Cargando mapas...</div>
                    )}

                    {/* BOTÓN GPS */}
                    <button
                        onClick={centerOnUser}
                        className="absolute bottom-24 right-4 bg-white text-blue-600 p-3 rounded-full shadow-2xl z-[10] hover:bg-blue-100 transition-colors">
                        <LocateFixed className="w-6 h-6" />
                    </button>

                    {/* BOTÓN RUTAS */}
                    <button
                        onClick={() => setShowRoutePanel(!showRoutePanel)}
                        className="absolute bottom-4 right-4 bg-app-blue text-white p-3 rounded-full shadow-xl z-[10] flex items-center gap-2">
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
                                {user?.rol === 'admin' && (
                                    <button onClick={toggleHeatmap} className="w-full mt-2 bg-blue-600 text-white py-2 rounded flex items-center justify-center gap-2 font-bold shadow-md hover:bg-blue-700 transition-colors">
                                        <Eye className="w-4 h-4" />
                                        {showHeatmap ? 'Ocultar Heatmap AI' : 'Ver Heatmap Global'}
                                    </button>
                                )}
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
                                <MapPin className=" w-3 h-3 text-blue-500" /> Edificios
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                <div className="w-4 h-0.5 bg-[#A0AEC0]" /> Camino interno
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                <div className="w-4 h-0.5 border-t-2 border-blue-400 border-dashed" /> Caminando (Google Maps)
                            </div>
                            {user?.rol === 'admin' && (
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                    <div className="w-4 h-1 bg-[#EF4444]" /> Más usado
                                </div>
                            )}
                            {routeInfo && (
                                <div className="mt-2 pt-2 border-t text-xs text-blue-600 font-semibold">
                                    <div>Distancia: {routeInfo.distance}</div>
                                    <div>Tiempo estimado: {routeInfo.duration}</div>
                                </div>
                            )}
                        </div>
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