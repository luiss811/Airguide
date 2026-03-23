
  # AirGuide
  # Aclaraciones:
  Vas a tener 3 terminales abiertas en visual studio. Terminal 1: frontend. Terminal 2: servidor backend. Terminal 3: Prisma studio
  
  ## Pasos para correr el proyecto

  #1. Abre la terminal en Visual Studio Code
  En la rama principal ``` \Airguidev1-main> ``` 
  
  Ejecuta el comando 
  ```bash
  npm install --legacy-peer-deps 
  ```
  . Tardara unos minutos. Cuando finalice, abre una nueva terminal en Visual Studio Code y navega hacia el servidor. ``` cd server ```

  #2. Servidor Backend
  En la rama del servidor ``` \Airguidev1-main\server> ```

  Ejecuta el comando 
  ```bash 
  npm install --legacy-peer-deps
  ```
  . Cuando finalice; dentro de la carpeta server, deberas crear un archivo llamado .env, lo creas y pegas este codigo:
  
  ---
  ```bash
  # Database - PostgreSQL en Prisma Cloud
  DATABASE_URL="postgres://f7a35276552eb6c4aa3bd70770cb509caeb73a885b11fcbbc269562a4a873e46:sk_isnKgYV7R84c6doSZiLKK@db.prisma.io:5432/postgres?sslmode=require&pool=true"

  # Server
  PORT=3001
  NODE_ENV=development

  # JWT
  JWT_SECRET=airguide-secret-key-app-in-development-2026
  JWT_EXPIRES_IN=1d

  # CORS
  CORS_ORIGIN=http://localhost:5173
  ```
  #3. Abre otra terminal en Visual y navega hacia el servidor ``` cd server```.
  Ejecuta el comando 
  ```bash 
  npm run prisma:studio
  ```
  .

  #4. Ahora sí, en la terminal del servidor backend (Terminal 2), ejecuta el comando 
  ```bash 
  npm run dev
  ```
  . Eso debe de inciar el servidor.

  #5. En la terminal del frontend (Terminal 1), ejecuta el comando 
  ```bash 
  npm run dev
  ```
  . Eso debe de inciar el frontend.
  
