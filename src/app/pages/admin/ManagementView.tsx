import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { Building2, Calendar, BarChart3, Settings, ArrowLeft, LogOut, Moon, Sun, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function ManagementView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const tabs = [
    {
      id: 'edificios',
      label: 'Edificios',
      icon: Building2,
      path: '/gestion/edificios',
      description: 'Gestión de edificios y ubicaciones'
    },
    {
      id: 'eventos',
      label: 'Eventos',
      icon: Calendar,
      path: '/gestion/eventos',
      description: 'Administración de eventos'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      path: '/gestion/analytics',
      description: 'Estadísticas y reportes'
    },
    {
      id: 'salones',
      label: 'Salones',
      icon: Settings,
      path: '/gestion/salones',
      description: 'Gestión de salones'
    }
  ];

  const activeTab = tabs.find(tab => location.pathname.includes(tab.id)) || tabs[0];

  const handleLogout = () => {
    logout();
    navigate('/mapa');
  };

  return (
    <div className="min-h-screen bg-[var(--app-background)]">
      {/* Header */}
      <header className="bg-[var(--app-header-bg)] border-b border-[var(--app-border)] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2 px-3 py-2 text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)] hover:bg-[var(--app-hover)] rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al Dashboard
            </button>
            <div className="h-6 w-px bg-[var(--app-border)]" />
            <div className="flex items-center gap-3">
              <activeTab.icon className="w-6 h-6 text-[var(--app-blue)]" />
              <div>
                <h1 className="text-xl font-bold text-[var(--app-text-primary)]">
                  {activeTab.label}
                </h1>
                <p className="text-xs text-[var(--app-text-secondary)]">
                  {activeTab.description}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-[var(--app-hover)] rounded-lg">
              <Users className="w-4 h-4 text-[var(--app-text-secondary)]" />
              <span className="text-sm text-[var(--app-text-primary)]">{user?.nombre}</span>
              <span className="text-xs text-[var(--app-text-secondary)] bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-full">
                Admin
              </span>
            </div>
            <button
              onClick={toggleTheme}
              className="px-4 py-2 bg-[var(--app-blue)] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="bg-[var(--app-header-bg)] border-b border-[var(--app-border)] px-6">
        <nav className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`
                flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all
                ${location.pathname.includes(tab.id)
                  ? 'text-[var(--app-blue)] border-b-2 border-[var(--app-blue)] bg-[var(--app-hover)]'
                  : 'text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)] hover:bg-[var(--app-hover)]'
                }
              `}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
