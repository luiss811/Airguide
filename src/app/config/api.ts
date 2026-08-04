/**
 * Configuración centralizada.
 * Toda URL de Backend proviene estrictamente de variables de entorno (import.meta.env.VITE_API_URL).
 * Evita la exposición o hardcoding de URLs de producción en el código fuente.
 */
export const API_URL = import.meta.env.VITE_API_URL || '/api';
