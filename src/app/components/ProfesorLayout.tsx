import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, User, Calendar, Map, LogOut, Menu, X } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useState } from 'react';

export function ProfesorLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/profesor/gestion', icon: LayoutDashboard, label: 'Gestión Docente' },
    { path: '/profesor/perfil', icon: User, label: 'Mi Perfil' },
    { path: '/profesor/eventos', icon: Calendar, label: 'Mis Eventos' },
    { path: '/map', icon: Map, label: 'Ver Mapa' }
  ];

  return (
    <div className="flex h-screen" style={{ background: 'var(--app-bg)' }}>
      {/* Sidebar Desktop */}
      <aside
        className="hidden md:flex md:flex-col w-64"
        style={{
          background: 'var(--app-sidebar-bg)',
          borderRight: '1px solid var(--app-border)'
        }}
      >
        <div className="p-6" style={{ borderBottom: '1px solid var(--app-border)' }}>
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-semibold animate-pulse" style={{ color: 'var(--app-text-primary)' }}>Panel deProfesor</h1>
            <ThemeToggle />
          </div>
          <p className="text-sm font-medium" style={{ color: 'var(--app-blue)' }}>{user?.nombre}</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--app-text-secondary)' }}>Docente Activo</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300"
                style={{
                  background: isActive ? 'var(--app-blue-light)' : 'transparent',
                  color: isActive ? 'var(--app-blue)' : 'var(--app-text-primary)'
                }}
                onMouseEnter={(e) => !isActive && (e.currentTarget.style.background = 'var(--app-hover)')}
                onMouseLeave={(e) => !isActive && (e.currentTarget.style.background = 'transparent')}
              >
                <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4" style={{ borderTop: '1px solid var(--app-border)' }}>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg transition-colors hover:bg-red-50 dark:hover:bg-red-950/20"
            style={{ color: 'var(--app-red)' }}
          >
            <LogOut className="w-5 h-5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg shadow-lg"
        style={{ background: 'var(--app-header-bg)', border: '1px solid var(--app-border)' }}
      >
        {mobileMenuOpen ? (
          <X className="w-6 h-6" style={{ color: 'var(--app-text-primary)' }} />
        ) : (
          <Menu className="w-6 h-6" style={{ color: 'var(--app-text-primary)' }} />
        )}
      </button>

      {/* Sidebar Mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          {/* Backdrop */}
          <button
            type="button"
            className="fixed inset-0 bg-black bg-opacity-50 border-0 outline-hidden w-full h-full cursor-default"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Cerrar menú"
          />
          {/* Sidebar content */}
          <aside
            className="relative w-64 h-full z-50"
            style={{ background: 'var(--app-sidebar-bg)' }}
          >
            <div className="p-6" style={{ borderBottom: '1px solid var(--app-border)' }}>
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-xl font-semibold" style={{ color: 'var(--app-text-primary)' }}>Profesor Panel</h1>
                <ThemeToggle />
              </div>
              <p className="text-sm font-medium" style={{ color: 'var(--app-blue)' }}>{user?.nombre}</p>
            </div>

            <nav className="p-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
                    style={{
                      background: isActive ? 'var(--app-blue-light)' : 'transparent',
                      color: isActive ? 'var(--app-blue)' : 'var(--app-text-primary)'
                    }}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="absolute bottom-0 left-0 right-0 p-4" style={{ borderTop: '1px solid var(--app-border)' }}>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 w-full rounded-lg transition-colors"
                style={{ color: 'var(--app-red)' }}
              >
                <LogOut className="w-5 h-5" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
