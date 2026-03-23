import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Building2, Calendar, TrendingUp, Activity, MapPin, Clock } from 'lucide-react';
import { useAnalytics } from '../../hooks';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Analytics() {
  const {
    dashboardStats,
    loading,
    fetchEdificiosPorTipo,
    fetchEventosProximos,
    fetchAccesosRecientes,
    fetchAccesosTimeline,
    fetchUsuariosPorRol,
    fetchRutasPopulares
  } = useAnalytics();

  const [edificiosPorTipo, setEdificiosPorTipo] = useState<any[]>([]);
  const [eventosProximos, setEventosProximos] = useState<any[]>([]);
  const [accesosTimeline, setAccesosTimeline] = useState<any[]>([]);
  const [usuariosPorRol, setUsuariosPorRol] = useState<any[]>([]);
  const [rutasPopulares, setRutasPopulares] = useState<any[]>([]);
  const [loadingCharts, setLoadingCharts] = useState(true);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'];

  useEffect(() => {
    loadChartsData();
  }, []);

  const loadChartsData = async () => {
    setLoadingCharts(true);
    try {
      const [edificios, eventos, timeline, usuarios, rutas] = await Promise.all([
        fetchEdificiosPorTipo(),
        fetchEventosProximos(),
        fetchAccesosTimeline(30),
        fetchUsuariosPorRol(),
        fetchRutasPopulares()
      ]);

      setEdificiosPorTipo(edificios);
      setEventosProximos(eventos);
      setAccesosTimeline(timeline);
      setUsuariosPorRol(usuarios);
      setRutasPopulares(rutas);
    } catch (error) {
      console.error('Error loading charts data:', error);
    } finally {
      setLoadingCharts(false);
    }
  };

  const statsCards = [
    {
      title: 'Total Usuarios',
      value: dashboardStats?.usuarios.total || 0,
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Edificios Activos',
      value: dashboardStats?.edificios.activos || 0,
      icon: Building2,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900',
      change: '+5%',
      trend: 'up'
    },
    {
      title: 'Eventos Activos',
      value: dashboardStats?.eventos.activos || 0,
      icon: Calendar,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900',
      change: '+8%',
      trend: 'up'
    },
    {
      title: 'Rutas Creadas',
      value: dashboardStats?.rutas.total || 0,
      icon: MapPin,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900',
      change: '+15%',
      trend: 'up'
    }
  ];

  if (loading || loadingCharts) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-[var(--app-blue)] border-t-transparent rounded-full animate-spin" />
          <span className="text-lg text-[var(--app-text-secondary)]">Cargando analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[var(--app-text-primary)]">
          Analytics y Reportes
        </h2>
        <p className="text-sm text-[var(--app-text-secondary)] mt-1">
          Estadísticas y métricas del sistema AirGuide
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <div
            key={index}
            className="bg-[var(--app-card-bg)] border border-[var(--app-border)] rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="flex items-center gap-1 text-xs">
                <TrendingUp className={`w-4 h-4 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`} />
                <span className={stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                  {stat.change}
                </span>
              </div>
            </div>
            <div className="text-3xl font-bold text-[var(--app-text-primary)] mb-1">
              {stat.value}
            </div>
            <div className="text-sm text-[var(--app-text-secondary)]">
              {stat.title}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Edificios por Tipo */}
        <div className="bg-[var(--app-card-bg)] border border-[var(--app-border)] rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-[var(--app-blue)]" />
            <h3 className="text-lg font-bold text-[var(--app-text-primary)]">
              Edificios por Tipo
            </h3>
          </div>
          {edificiosPorTipo.length === 0 ? (
            <div className="flex items-center justify-center h-[300px]">
              <p className="text-sm text-[var(--app-text-secondary)]">
                No hay datos disponibles
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={edificiosPorTipo}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="cantidad"
                  nameKey="tipo"
                >
                  {edificiosPorTipo.map((entry, index) => (
                    <Cell key={`cell-edificio-${entry.tipo}-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Usuarios por Rol */}
        <div className="bg-[var(--app-card-bg)] border border-[var(--app-border)] rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-[var(--app-blue)]" />
            <h3 className="text-lg font-bold text-[var(--app-text-primary)]">
              Usuarios por Rol
            </h3>
          </div>
          {usuariosPorRol.length === 0 ? (
            <div className="flex items-center justify-center h-[300px]">
              <p className="text-sm text-[var(--app-text-secondary)]">
                No hay datos disponibles
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={usuariosPorRol}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--app-border)" />
                <XAxis dataKey="rol" stroke="var(--app-text-secondary)" />
                <YAxis stroke="var(--app-text-secondary)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--app-card-bg)',
                    border: '1px solid var(--app-border)',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="cantidad" fill="#3B82F6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Timeline de Accesos */}
        <div className="bg-[var(--app-card-bg)] border border-[var(--app-border)] rounded-lg p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-[var(--app-blue)]" />
            <h3 className="text-lg font-bold text-[var(--app-text-primary)]">
              Accesos en los Últimos 30 Días
            </h3>
          </div>
          {accesosTimeline.length === 0 ? (
            <div className="flex items-center justify-center h-[300px]">
              <p className="text-sm text-[var(--app-text-secondary)]">
                No hay datos disponibles
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={accesosTimeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--app-border)" />
                <XAxis
                  dataKey="fecha"
                  stroke="var(--app-text-secondary)"
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getDate()}/${date.getMonth() + 1}`;
                  }}
                />
                <YAxis stroke="var(--app-text-secondary)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--app-card-bg)',
                    border: '1px solid var(--app-border)',
                    borderRadius: '8px'
                  }}
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString('es-MX');
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="accesos"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Eventos Próximos */}
        <div className="bg-[var(--app-card-bg)] border border-[var(--app-border)] rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-[var(--app-blue)]" />
            <h3 className="text-lg font-bold text-[var(--app-text-primary)]">
              Próximos Eventos
            </h3>
          </div>
          <div className="space-y-3">
            {eventosProximos.length === 0 ? (
              <p className="text-sm text-[var(--app-text-secondary)] text-center py-4">
                No hay eventos próximos
              </p>
            ) : (
              eventosProximos.slice(0, 5).map((evento, index) => (
                <div
                  key={evento.id || `evento-${index}`}
                  className="flex items-start gap-3 p-3 bg-[var(--app-hover)] rounded-lg"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--app-text-primary)] truncate">
                      {evento.nombre}
                    </p>
                    <p className="text-xs text-[var(--app-text-secondary)]">
                      {new Date(evento.fecha_inicio).toLocaleDateString('es-MX')}
                    </p>
                    <p className="text-xs text-[var(--app-text-secondary)]">
                      {evento.edificio?.nombre}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                      {evento.publico ? 'Público' : 'Privado'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Rutas Populares */}
        <div className="bg-[var(--app-card-bg)] border border-[var(--app-border)] rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-[var(--app-blue)]" />
            <h3 className="text-lg font-bold text-[var(--app-text-primary)]">
              Rutas Más Populares
            </h3>
          </div>
          <div className="space-y-3">
            {rutasPopulares.length === 0 ? (
              <p className="text-sm text-[var(--app-text-secondary)] text-center py-4">
                No hay datos de rutas
              </p>
            ) : (
              rutasPopulares.slice(0, 5).map((ruta, index) => (
                <div
                  key={ruta.id || `ruta-${index}`}
                  className="flex items-center gap-3 p-3 bg-[var(--app-hover)] rounded-lg"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--app-text-primary)] truncate">
                      {ruta.origen} → {ruta.destino}
                    </p>
                    <p className="text-xs text-[var(--app-text-secondary)]">
                      {ruta.usos} usos
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <Activity className="w-4 h-4 text-[var(--app-blue)]" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="bg-[var(--app-card-bg)] border border-[var(--app-border)] rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-[var(--app-blue)]" />
          <h3 className="text-lg font-bold text-[var(--app-text-primary)]">
            Estadísticas Generales
          </h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-[var(--app-hover)] rounded-lg">
            <div className="text-2xl font-bold text-[var(--app-text-primary)] mb-1">
              {dashboardStats?.salones || 0}
            </div>
            <div className="text-xs text-[var(--app-text-secondary)]">Total Salones</div>
          </div>
          <div className="p-4 bg-[var(--app-hover)] rounded-lg">
            <div className="text-2xl font-bold text-[var(--app-text-primary)] mb-1">
              {dashboardStats?.profesores || 0}
            </div>
            <div className="text-xs text-[var(--app-text-secondary)]">Profesores</div>
          </div>
          <div className="p-4 bg-[var(--app-hover)] rounded-lg">
            <div className="text-2xl font-bold text-[var(--app-text-primary)] mb-1">
              {dashboardStats?.cubiculos || 0}
            </div>
            <div className="text-xs text-[var(--app-text-secondary)]">Cubículos</div>
          </div>
          <div className="p-4 bg-[var(--app-hover)] rounded-lg">
            <div className="text-2xl font-bold text-[var(--app-text-primary)] mb-1">
              {dashboardStats?.totalAccesos || 0}
            </div>
            <div className="text-xs text-[var(--app-text-secondary)]">Total Accesos</div>
          </div>
        </div>
      </div>

      {/* Pending Users Alert */}
      {dashboardStats && dashboardStats.usuarios.pendientes > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Usuarios Pendientes de Aprobación
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                Hay {dashboardStats.usuarios.pendientes} usuarios esperando validación
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}