import React, { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { 
  BarChart3,
  Building2,
  Calendar,
  Route,
  TrendingUp,
  Users,
  MapPin,
  LogOut,
  Moon,
  Sun
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/admin/edificios', label: 'Edificios & Aulas', icon: Building2 },
    { path: '/admin/eventos', label: 'Eventos', icon: Calendar },
    { path: '/admin/rutas', label: 'Rutas', icon: Route },
    { path: '/admin/analytics', label: 'Analíticas', icon: TrendingUp },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[var(--app-bg)] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[var(--app-header-bg)] border-r border-[var(--app-border)] flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-[var(--app-border)]">
          <div className="flex items-center gap-3">
            <MapPin className="w-8 h-8 text-[var(--app-blue)]" />
            <div>
              <h1 className="text-lg font-semibold text-[var(--app-text-primary)]">
                AirGuide
              </h1>
              <p className="text-xs text-[var(--app-text-secondary)]">Panel Admin</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-[var(--app-blue)] text-white'
                    : 'text-[var(--app-text-secondary)] hover:bg-[var(--app-hover)] hover:text-[var(--app-text-primary)]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-[var(--app-border)] space-y-2">
          <div className="flex items-center gap-3 px-3 py-2 bg-[var(--app-hover)] rounded-lg">
            <div className="w-8 h-8 rounded-full bg-[var(--app-blue-light)] flex items-center justify-center">
              <span className="text-sm font-medium text-[var(--app-blue)]">
                {user?.nombre.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--app-text-primary)] truncate">
                {user?.nombre}
              </p>
              <p className="text-xs text-[var(--app-text-secondary)]">Administrador</p>
            </div>
          </div>
          
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[var(--app-text-secondary)] hover:bg-[var(--app-hover)] hover:text-[var(--app-text-primary)] rounded-lg transition-colors"
          >
            <MapPin className="w-4 h-4" />
            Ver Mapa
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-[var(--app-header-bg)] border-b border-[var(--app-border)] px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-[var(--app-text-primary)]">
              {title}
            </h2>
            
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-[var(--app-hover)] transition-colors text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)]"
              title={`Cambiar a tema ${theme === 'light' ? 'oscuro' : 'claro'}`}
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
