const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");

if (require("electron-squirrel-startup")) {
  app.quit();
}

const API_BASE = "http://localhost/educate_api";

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  mainWindow.removeMenu();

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  mainWindow.webContents.openDevTools();
};

// ── Auth ──
ipcMain.handle("auth:login", async (event, usuario, password) => {
  try {
    const response = await fetch(`${API_BASE}/auth/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario, password }),
    });
    return await response.json();
  } catch (err) {
    return { status: "error", message: "Error de conexión con el servidor" };
  }
});

// ── Cursos ──
ipcMain.handle("courses:list", async () => {
  try {
    const response = await fetch(`${API_BASE}/cursos`);
    return await response.json();
  } catch (err) {
    return { status: "error", message: "Error de conexión con el servidor" };
  }
});

ipcMain.handle("courses:create", async (event, adminUsuario, nombre) => {
  try {
    const response = await fetch(`${API_BASE}/cursos/crear`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ admin_usuario: adminUsuario, nombre }),
    });
    return await response.json();
  } catch (err) {
    return { status: "error", message: "Error de conexión con el servidor" };
  }
});

ipcMain.handle("courses:get", async (event, id) => {
  try {
    const response = await fetch(`${API_BASE}/cursos/${id}`);
    return await response.json();
  } catch (err) {
    return { status: "error", message: "Error de conexión con el servidor" };
  }
});

ipcMain.handle("courses:update", async (event, id, adminUsuario, nombre) => {
  try {
    const response = await fetch(`${API_BASE}/cursos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ admin_usuario: adminUsuario, nombre }),
    });
    return await response.json();
  } catch (err) {
    return { status: "error", message: "Error de conexión con el servidor" };
  }
});

ipcMain.handle("courses:delete", async (event, id, adminUsuario) => {
  try {
    const response = await fetch(`${API_BASE}/cursos/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ admin_usuario: adminUsuario }),
    });
    return await response.json();
  } catch (err) {
    return { status: "error", message: "Error de conexión con el servidor" };
  }
});

ipcMain.handle("courses:getActivity", async (event, id) => {
  try {
    const response = await fetch(`${API_BASE}/cursos/${id}/actividad`);
    return await response.json();
  } catch (err) {
    return { status: "error", message: "Error de conexión con el servidor" };
  }
});

// ── Alumnos ──
ipcMain.handle(
  "students:create",
  async (event, nombreCompleto, curso, numeroIdentificacion) => {
    try {
      const response = await fetch(`${API_BASE}/alumnos/registrar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre_completo: nombreCompleto,
          curso,
          numero_identificacion: numeroIdentificacion,
        }),
      });
      return await response.json();
    } catch (err) {
      return { status: "error", message: "Error de conexión con el servidor" };
    }
  },
);

ipcMain.handle(
  "courses:assignStudent",
  async (event, adminUsuario, cursoId, codigoAlumno) => {
    try {
      const response = await fetch(`${API_BASE}/cursos/asignar-alumno`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          admin_usuario: adminUsuario,
          curso_id: cursoId,
          codigo_alumno: codigoAlumno,
        }),
      });
      return await response.json();
    } catch (err) {
      return { status: "error", message: "Error de conexión con el servidor" };
    }
  },
);

ipcMain.handle("students:get", async (event, codigo) => {
  try {
    const response = await fetch(`${API_BASE}/alumnos/${codigo}`);
    return await response.json();
  } catch (err) {
    return { status: "error", message: "Error de conexión con el servidor" };
  }
});

ipcMain.handle("students:getHistory", async (event, codigo) => {
  try {
    const response = await fetch(`${API_BASE}/alumnos/${codigo}/progreso`);
    return await response.json();
  } catch (err) {
    return { status: "error", message: "Error de conexión con el servidor" };
  }
});

// ── Lecciones ──
ipcMain.handle("lessons:list", async (event, cursoId) => {
  try {
    const response = await fetch(`${API_BASE}/cursos/${cursoId}/lecciones`);
    return await response.json();
  } catch (err) {
    return { status: "error", message: "Error de conexión con el servidor" };
  }
});

ipcMain.handle("lessons:create", async (event, cursoId, adminUsuario, data) => {
  try {
    const response = await fetch(`${API_BASE}/cursos/${cursoId}/lecciones`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ admin_usuario: adminUsuario, ...data }),
    });
    return await response.json();
  } catch (err) {
    return { status: "error", message: "Error de conexión con el servidor" };
  }
});

ipcMain.handle("lessons:get", async (event, cursoId, leccionId) => {
  try {
    const response = await fetch(`${API_BASE}/cursos/${cursoId}/lecciones/${leccionId}`);
    return await response.json();
  } catch (err) {
    return { status: "error", message: "Error de conexión con el servidor" };
  }
});

ipcMain.handle("lessons:update", async (event, cursoId, leccionId, adminUsuario, data) => {
  try {
    const response = await fetch(`${API_BASE}/cursos/${cursoId}/lecciones/${leccionId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ admin_usuario: adminUsuario, ...data }),
    });
    return await response.json();
  } catch (err) {
    return { status: "error", message: "Error de conexión con el servidor" };
  }
});

ipcMain.handle("lessons:delete", async (event, cursoId, leccionId, adminUsuario) => {
  try {
    const response = await fetch(`${API_BASE}/cursos/${cursoId}/lecciones/${leccionId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ admin_usuario: adminUsuario }),
    });
    return await response.json();
  } catch (err) {
    return { status: "error", message: "Error de conexión con el servidor" };
  }
});

// ── Niveles ──
ipcMain.handle("levels:list", async (event, leccionId) => {
  try {
    const response = await fetch(`${API_BASE}/lecciones/${leccionId}/niveles`);
    return await response.json();
  } catch (err) {
    return { status: "error", message: "Error de conexión con el servidor" };
  }
});

ipcMain.handle("levels:create", async (event, leccionId, adminUsuario, data) => {
  try {
    const response = await fetch(`${API_BASE}/lecciones/${leccionId}/niveles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ admin_usuario: adminUsuario, ...data }),
    });
    return await response.json();
  } catch (err) {
    return { status: "error", message: "Error de conexión con el servidor" };
  }
});

ipcMain.handle("levels:get", async (event, leccionId, nivelId) => {
  try {
    const response = await fetch(`${API_BASE}/lecciones/${leccionId}/niveles/${nivelId}`);
    return await response.json();
  } catch (err) {
    return { status: "error", message: "Error de conexión con el servidor" };
  }
});

ipcMain.handle("levels:update", async (event, leccionId, nivelId, adminUsuario, data) => {
  try {
    const response = await fetch(`${API_BASE}/lecciones/${leccionId}/niveles/${nivelId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ admin_usuario: adminUsuario, ...data }),
    });
    return await response.json();
  } catch (err) {
    return { status: "error", message: "Error de conexión con el servidor" };
  }
});

ipcMain.handle("levels:delete", async (event, leccionId, nivelId, adminUsuario) => {
  try {
    const response = await fetch(`${API_BASE}/lecciones/${leccionId}/niveles/${nivelId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ admin_usuario: adminUsuario }),
    });
    return await response.json();
  } catch (err) {
    return { status: "error", message: "Error de conexión con el servidor" };
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
