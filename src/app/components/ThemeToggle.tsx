import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg transition-colors hover:bg-[var(--app-hover)] border border-[var(--app-border)]"
      aria-label="Cambiar tema"
      title={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5 text-[var(--app-text-secondary)]" />
      ) : (
        <Sun className="w-5 h-5 text-[var(--app-text-secondary)]" />
      )}
    </button>
  );
}
