# Manual de Instalación — PC Forum
## ET N° 20 D.E. 20 "Carolina Muzilli"

---

## Resumen

Este documento explica cómo instalar el sistema PC Forum en el servidor de la escuela (Windows Server) usando **Docker**. Docker empaqueta todo lo necesario (Node.js, PostgreSQL, etc.) en contenedores, por lo que no hace falta instalar nada más en el servidor.

**Tiempo estimado de instalación:** 20–30 minutos  
**Nivel requerido:** Básico (saber usar el CMD o PowerShell)

---

## ¿Qué es Docker y por qué lo usamos?

Docker es una herramienta que crea "cajas virtuales" (contenedores) donde vive el software. Ventajas para la escuela:

- **Un solo comando** para arrancar todo el sistema
- **No contamina** el servidor con instalaciones sueltas
- **Fácil backup** de los datos
- **Si algo falla**, se reinicia automáticamente
- **Funciona igual** en cualquier máquina

---

## Requisitos del servidor

| Requisito | Mínimo | Recomendado |
|-----------|--------|-------------|
| Sistema operativo | Windows Server 2019 | Windows Server 2022 |
| RAM | 2 GB libres | 4 GB libres |
| Disco | 5 GB libres | 20 GB libres |
| CPU | 2 núcleos | 4 núcleos |
| Red | Puerto 3000 accesible desde la red interna | — |

> **Importante:** El servidor necesita tener **Hyper-V** habilitado (viene con Windows Server 2019/2022). Si es una máquina virtual, hay que habilitar "virtualización anidada".

---

## Paso 1 — Instalar Docker Desktop en Windows Server

### 1.1 Habilitar Hyper-V y Containers

Abrir **PowerShell como Administrador** y ejecutar:

```powershell
# Habilitar Hyper-V
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All

# Habilitar el feature de Containers
Enable-WindowsOptionalFeature -Online -FeatureName Containers -All
```

El sistema pedirá **reiniciar**. Hacerlo.

### 1.2 Instalar WSL2 (subsistema Linux — necesario para Docker)

En PowerShell como Administrador:

```powershell
wsl --install
```

Si el comando no existe (Windows Server más antiguo):

```powershell
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
```

Reiniciar el servidor.

Después del reinicio, establecer WSL2 como versión por defecto:

```powershell
wsl --set-default-version 2
```

### 1.3 Descargar e instalar Docker Desktop

1. Descargar Docker Desktop desde: `https://www.docker.com/products/docker-desktop/`
2. Ejecutar el instalador (`Docker Desktop Installer.exe`)
3. En la pantalla de opciones, marcar:
   - ✅ Use WSL 2 instead of Hyper-V
   - ✅ Add shortcut to desktop
4. Hacer clic en **Ok** y esperar que termine
5. **Reiniciar** el servidor cuando lo pida

### 1.4 Verificar que Docker funciona

Abrir **PowerShell** y escribir:

```powershell
docker --version
docker compose version
```

Debería mostrar algo como:
```
Docker version 26.x.x
Docker Compose version v2.x.x
```

Si aparece un error, abrir Docker Desktop desde el escritorio y esperar a que el ícono de la ballena en la barra de tareas se ponga verde.

---

## Paso 2 — Copiar el proyecto al servidor

### Opción A — Desde un pendrive

1. Conectar el pendrive al servidor
2. Abrir el pendrive en el Explorador de archivos
3. Copiar la carpeta completa del proyecto (la que tiene `docker-compose.yml`) a:
   ```
   C:\pcforum\
   ```

### Opción B — Desde la red escolar

Si el proyecto está en un recurso compartido de la red:

```powershell
# Ejemplo: copiar desde \\servidor-almacen\proyectos\pcforum
Copy-Item -Path "\\servidor-almacen\proyectos\pcforum" -Destination "C:\pcforum" -Recurse
```

### Verificar que quedó bien

La estructura debería verse así en `C:\pcforum\`:

```
C:\pcforum\
├── docker-compose.yml     ← el archivo principal
├── Dockerfile
├── .env
├── package.json
├── prisma\
├── src\
└── Frontend\
```

---

## Paso 3 — Configurar las variables de entorno

1. Ir a `C:\pcforum\`
2. Copiar el archivo `.env.example` y renombrarlo como `.env`

```powershell
Copy-Item "C:\pcforum\.env.example" "C:\pcforum\.env"
```

3. Abrir `.env` con el Bloc de Notas y editar los valores:

```powershell
notepad "C:\pcforum\.env"
```

El archivo contiene:

```env
DB_PASSWORD=pcforum_pass_2024
JWT_SECRET=helpdesk_jwt_super_secreto_2024_CAMBIA_ESTO
APP_PORT=3000
```

**Cambiar los valores:**
- `DB_PASSWORD` → una contraseña segura para la base de datos (solo letras y números, sin caracteres especiales)
- `JWT_SECRET` → una cadena larga y aleatoria. Para generar una:
  ```powershell
  # En PowerShell
  [Convert]::ToBase64String((1..32 | ForEach-Object { [byte](Get-Random -Max 256) }))
  ```
- `APP_PORT` → dejar en `3000` salvo que ese puerto esté ocupado

Guardar y cerrar el Bloc de Notas.

---

## Paso 4 — Iniciar el sistema

Abrir **PowerShell como Administrador**, ir a la carpeta del proyecto y ejecutar:

```powershell
cd C:\pcforum
docker compose up -d
```

Docker va a:
1. Descargar las imágenes de PostgreSQL y Node.js (~500 MB, solo la primera vez)
2. Construir la imagen de la aplicación
3. Iniciar la base de datos
4. Aplicar las migraciones (crear las tablas)
5. Crear el usuario Admin inicial
6. Iniciar el servidor web

**La primera vez tarda entre 3 y 10 minutos** según la velocidad de internet.

### Verificar que todo está corriendo

```powershell
docker compose ps
```

Debería mostrar algo así:

```
NAME             STATUS          PORTS
pcforum_db       running         0.0.0.0:5432->5432/tcp
pcforum_app      running         0.0.0.0:3000->3000/tcp
```

Si ambos dicen `running`, el sistema está listo.

### Probar desde el mismo servidor

Abrir un navegador en el servidor y entrar a:
```
http://localhost:3000
```

Debería aparecer la pantalla de login del PC Forum.

---

## Paso 5 — Acceder desde la red escolar

Los usuarios de la red interna acceden usando la **IP del servidor**.

### Encontrar la IP del servidor

```powershell
ipconfig
```

Buscar la línea "Dirección IPv4" que empiece con `192.168.` — esa es la IP del servidor en la red escolar. Ejemplo: `192.168.0.31`

Los usuarios abren en su navegador:
```
http://192.168.0.31:3000
```

### Abrir el puerto en el Firewall de Windows

```powershell
# Ejecutar en PowerShell como Administrador
New-NetFirewallRule `
  -DisplayName "PC Forum (puerto 3000)" `
  -Direction Inbound `
  -Protocol TCP `
  -LocalPort 3000 `
  -Action Allow
```

Verificar que funciona abriendo `http://192.168.0.31:3000` desde otra computadora de la escuela.

---

## Paso 6 — Credenciales del Admin inicial

El sistema crea automáticamente un usuario administrador:

| Campo | Valor |
|-------|-------|
| Email | `admin@pcforum.edu` |
| Contraseña | `admin123` |

> **⚠️ Importante:** Cambiar la contraseña del admin después del primer ingreso. El admin puede crear profesores y alumnos desde el panel.

---

## Paso 7 — Hacer que arranque automáticamente con Windows

Para que el sistema se inicie solo cuando el servidor prende (sin que nadie tenga que ejecutar comandos):

### Crear una tarea programada

```powershell
# Ejecutar en PowerShell como Administrador
$action  = New-ScheduledTaskAction -Execute "docker" -Argument "compose -f C:\pcforum\docker-compose.yml up -d" -WorkingDirectory "C:\pcforum"
$trigger = New-ScheduledTaskTrigger -AtStartup
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1)

Register-ScheduledTask `
  -TaskName    "PCForum - Inicio automático" `
  -Action      $action `
  -Trigger     $trigger `
  -RunLevel    Highest `
  -Settings    $settings `
  -Description "Inicia los contenedores de PC Forum al arrancar el servidor"
```

Para verificar que se creó:
```powershell
Get-ScheduledTask -TaskName "PCForum*"
```

---

## Comandos de mantenimiento diario

```powershell
# Ir siempre a la carpeta del proyecto primero
cd C:\pcforum

# Ver el estado de los contenedores
docker compose ps

# Ver los logs del servidor (últimas 50 líneas)
docker compose logs --tail=50 app

# Ver logs en tiempo real (Ctrl+C para salir)
docker compose logs -f app

# Reiniciar solo la app (sin tocar la BD)
docker compose restart app

# Detener todo (los datos quedan guardados)
docker compose down

# Volver a iniciar
docker compose up -d

# Ver cuánto espacio usan los contenedores
docker system df
```

---

## Backup de la base de datos

Los datos de la base de datos viven en un **volumen Docker** llamado `pcforum_postgres_data`. Para hacer backup:

```powershell
# Crear backup
docker exec pcforum_db pg_dump -U postgres helpdesk_db > "C:\backups\pcforum_$(Get-Date -Format 'yyyy-MM-dd').sql"

# Crear la carpeta de backups si no existe
New-Item -ItemType Directory -Path "C:\backups" -Force
```

**Backup automático diario** (tarea programada):

```powershell
$backupScript = @"
New-Item -ItemType Directory -Path 'C:\backups' -Force | Out-Null
docker exec pcforum_db pg_dump -U postgres helpdesk_db > "C:\backups\pcforum_`$(Get-Date -Format 'yyyy-MM-dd').sql"
# Borrar backups de más de 30 días
Get-ChildItem 'C:\backups\*.sql' | Where-Object { `$_.LastWriteTime -lt (Get-Date).AddDays(-30) } | Remove-Item
"@
$backupScript | Out-File "C:\pcforum\backup.ps1" -Encoding UTF8

$action  = New-ScheduledTaskAction -Execute "powershell" -Argument "-File C:\pcforum\backup.ps1"
$trigger = New-ScheduledTaskTrigger -Daily -At "02:00"

Register-ScheduledTask `
  -TaskName    "PCForum - Backup diario" `
  -Action      $action `
  -Trigger     $trigger `
  -RunLevel    Highest `
  -Description "Backup nocturno de la BD de PC Forum"
```

### Restaurar un backup

```powershell
# Restaurar desde un archivo de backup
Get-Content "C:\backups\pcforum_2024-01-15.sql" | docker exec -i pcforum_db psql -U postgres -d helpdesk_db
```

---

## Actualizar el sistema (nueva versión)

Cuando haya una actualización del código:

```powershell
cd C:\pcforum

# 1. Copiar los nuevos archivos sobre la carpeta existente (no borrar .env)

# 2. Reconstruir la imagen con el nuevo código
docker compose up -d --build

# Docker se encarga de:
# - Detener el contenedor viejo
# - Construir la nueva imagen
# - Aplicar nuevas migraciones de BD
# - Reiniciar el servidor
# Los datos en la BD NO se pierden
```

---

## Solución de problemas frecuentes

### El sitio no abre desde otras PCs

```powershell
# 1. Verificar que los contenedores están corriendo
docker compose ps

# 2. Verificar que el puerto está abierto en el firewall
Get-NetFirewallRule -DisplayName "PC Forum*"

# 3. Probar desde el mismo servidor
Invoke-WebRequest http://localhost:3000/api/health
```

### "Cannot connect to Docker daemon"

Docker Desktop no está corriendo. Abrirlo desde el Escritorio o:
```powershell
Start-Service com.docker.service
```

### Los contenedores se detienen solos

```powershell
# Ver qué pasó
docker compose logs app

# Reiniciar
docker compose up -d
```

### La BD no arranca

```powershell
# Ver el estado detallado
docker compose logs postgres

# Si dice "data directory has wrong ownership", limpiar y empezar de nuevo
# ADVERTENCIA: esto borra todos los datos
docker compose down -v
docker compose up -d
```

### "Port 3000 already in use"

Otro proceso está usando el puerto 3000. Opciones:
```powershell
# Opción A: ver qué proceso lo usa y cerrarlo
netstat -ano | findstr :3000

# Opción B: cambiar el puerto en .env
# APP_PORT=3001
# y volver a ejecutar: docker compose up -d
```

---

## Información del sistema en producción

Una vez instalado, estos son los datos de acceso:

| Dato | Valor |
|------|-------|
| URL de acceso (red escolar) | `http://[IP-DEL-SERVIDOR]:3000` |
| Admin por defecto | `admin@pcforum.edu` / `admin123` |
| Puerto de la app | 3000 |
| Puerto de la BD | 5432 (solo accesible desde el servidor) |
| Datos de la BD | Volumen Docker `pcforum_postgres_data` |
| Backups | `C:\backups\` |
| Logs | `docker compose logs app` |

---

*PC Forum v1.0 — ET N° 20 D.E. 20 "Carolina Muzilli" — Especialidad TICs y Multimedia*
