/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  // Agrega más variables de entorno aquí si las necesitas
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
