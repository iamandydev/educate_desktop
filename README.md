# Educate Desktop

Aplicación de escritorio para la gestión de cursos y estudiantes, construida con
Electron + React.

## Características

- Autenticación de administradores (login con MD5)
- Dashboard con estadísticas y resumen
- Gestión de cursos (listar, crear, ver detalle)
- Gestión de estudiantes (listar por curso, registrar, ver detalle)
- Vista de lecciones por curso
- Diseño glassmorphism + gradientes violeta/rosa
- Sidebar de navegación con cierre de sesión

## Stack Tecnológico

- Electron 43
- React 19
- Electron Forge (webpack plugin)
- Babel (preset-react, preset-env)
- Lucide React (iconos)
- md5 (hash de contraseñas)

## Requisitos Previos

- Node.js (>=18)
- npm

## Instalación y Ejecución

```bash
cd educate_desktop
npm install
```

**Node.js v24+:** ejecutar antes de `npm start`:
```powershell
$env:npm_config_user_agent="npm/11.18.0"
```

```bash
npm start
```

## Estructura del Proyecto

```
src/
├── main.js                    # Proceso principal, handlers IPC
├── preload.js                 # contextBridge, expone API al renderer
├── App.jsx                    # Componente raíz, estado de sesión
├── renderer.js                # Entry point del renderer
├── screens/
│   └── Login/                 # Login.jsx + Login.css
├── pages/
│   ├── Dashboard.jsx          # Layout principal con navegación
│   ├── CourseDetail.jsx/css   # Detalle de curso (alumnos, lecciones)
│   └── RegisterStudent.jsx/css # Formulario de registro
├── components/
│   ├── Sidebar/               # Barra lateral de navegación
│   ├── Header/                # SearchBar
│   ├── Banner/                # Banner principal
│   ├── Events/                # Tarjetas de eventos
│   ├── Progress/              # Gráficas de progreso
│   ├── RightPanel/            # Lista de cursos
│   └── UI/                    # Card, Button (genéricos)
└── styles/
    └── dashboard.css          # Layout grid principal
```

## Flujo de la Aplicación

1. **Login** → validar credenciales
2. **Dashboard** → cursos, eventos, estadísticas
3. **Click en curso** → CourseDetail (pestañas Alumnos / Lecciones)
4. **"Crear alumno"** → RegisterStudent (formulario con validación)
5. **Submit** → vuelve a CourseDetail con lista actualizada
6. **Click en alumno** → StudentDetail (detalles del alumno)
7. **"Volver"** → regresa a la vista anterior

## Arquitectura IPC

Renderer no llama a la API directamente. Flujo:

```
Renderer → window.api.* → preload.js (contextBridge) → ipcRenderer.invoke
→ main.js (ipcMain.handle) → fetch → API externa
```

Esto permite mantener `contextIsolation: true` y `nodeIntegration: false`.

## Licencia

MIT
