# Airguide

Plataforma de Navegación Universitaria y Gestión de Eventos Académicos desarrollada con React 18, Vite 6, TypeScript, Material-UI y Tailwind CSS.

---

## Arquitectura y Tecnologías

- **Core & Bundler:** React 18 + Vite 6
- **Lenguaje:** TypeScript
- **Estilos & Componentes UI:** Material-UI (MUI v7), Tailwind CSS 4, Radix UI, Emotion
- **Enrutamiento:** React Router v7
- **Gráficos & Mapa:** Google Maps API, Recharts
- **Iconografía & Animaciones:** Lucide React, Motion (Framer Motion)

---

# Aclaraciones:

Es una aplicación web interactiva diseñada para la Universidad Tecnologica de Queretaro, pero tambien puede ser usada como otro servicio para terceros. Permite consultar mapas interactivos dentro de la universidad, calcular rutas entre edificios y salones, consultar la ubicación de cubículos de docentes y visualizar eventos universitarios próximos.

---

## Pasos para correr el proyecto

### 1. Clonar los Repositorios

Debes clonar tanto el repositorio del Frontend como el del Backend:

```bash
# Frontend
git clone https://github.com/luiss811/Airguide.git

# Backend
git clone https://github.com/luiss811/Backend-Airguide.git
```

### 2. Abre la terminal en Visual Studio Code
En la rama principal ``` \Airguide> ``` 

Ejecuta el comando 
```bash
npm install --legacy-peer-deps 
```
. Tardara unos minutos. Cuando finalice, abre una nueva terminal en Visual Studio Code y navega hacia el backend. ``` cd Backend-Airguide ```

Servidor Backend
En la rama del servidor ``` \Backend-Airguide> ```

Ejecuta el comando 
```bash 
npm install --legacy-peer-deps
```

### 3. Instalación de Dependencias del Frontend

Navega a la carpeta `Airguide`:

```bash
cd Airguide
npm install --legacy-peer-deps
```

### 4. Configuración de Variables de Entorno (.env)

### 5. Ahora sí, en la terminal del servidor backend (Terminal 2), ejecuta el comando 
```bash 
npm run dev
```
. Eso debe de inciar el servidor.

### 6. En la terminal del frontend (Terminal 1), ejecuta el comando 
```bash 
npm run dev
```
. Eso debe de inciar el frontend.

## Seguridad y DevSecOps

El proyecto cuenta con controles de seguridad integrados:
- **Sanitización de Entradas:** Validación de formularios y prevención de XSS.
- **Manejo Seguro de Sesión:** Almacenamiento seguro de tokens JWT expirables.
- **Configuración Centralizada de API:** Ninguna URL de backend se encuentra hardcodeada en el código fuente (`src/app/config/api.ts`).

---

Desarrollado por el equipo **Airguide** | Todos los derechos reservados.
