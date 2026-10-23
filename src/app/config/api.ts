/**
 * Configuración centralizada de API.
 * Sanea y normaliza la URL proveniente de las variables de entorno de Vite / Vercel.
 * Si el usuario introduce el dominio sin protocolo,
 * se le antepone "https://" para evitar que el navegador lo trate como ruta relativa.
 */
function normalizeApiUrl(rawUrl?: string): string {
  if (!rawUrl || rawUrl.trim() === '') {
    return 'http://localhost:3001/api';
  }

  let cleanUrl = rawUrl.trim();

  // Si no empieza con http://, https:// ni con barra relativa /
  if (!/^https?:\/\//i.test(cleanUrl) && !cleanUrl.startsWith('/')) {
    if (cleanUrl.startsWith('localhost') || cleanUrl.startsWith('127.0.0.1')) {
      cleanUrl = `http://${cleanUrl}`;
    } else {
      cleanUrl = `https://${cleanUrl}`;
    }
  }

  // Eliminar barras finales redundantes
  cleanUrl = cleanUrl.replace(/\/+$/, '');

  // Asegurar que termine en /api si no es una ruta ya terminada en /api
  if (!cleanUrl.endsWith('/api')) {
    cleanUrl = `${cleanUrl}/api`;
  }

  return cleanUrl;
}

export const API_URL = normalizeApiUrl(import.meta.env.VITE_API_URL);

