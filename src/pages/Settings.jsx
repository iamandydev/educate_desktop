import { useState, useEffect } from "react";
import { Settings as SettingsIcon, LogIn } from "lucide-react";
import "../styles/variables.css";
import "./Settings.css";

export default function Settings() {
  const [rememberMe, setRememberMe] = useState(() => {
    try {
      return localStorage.getItem("rememberedUser") !== null;
    } catch {
      return false;
    }
  });

  const handleToggleRememberMe = (checked) => {
    setRememberMe(checked);
    if (!checked) {
      localStorage.removeItem("rememberedUser");
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <div className="settings-icon">
          <SettingsIcon size={28} color="#fff" />
        </div>
        <div>
          <h1>Ajustes</h1>
          <p className="settings-subtitle">Configuración de la aplicación</p>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-header">
          <LogIn size={18} />
          <h3>Inicio de sesión</h3>
        </div>

        <div className="settings-option">
          <div className="settings-option-info">
            <span className="settings-option-label">Recordar sesión</span>
            <span className="settings-option-desc">
              Mantener la sesión iniciada al cerrar la aplicación
            </span>
          </div>
          <label className="settings-toggle">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => handleToggleRememberMe(e.target.checked)}
            />
            <span className="settings-toggle-slider"></span>
          </label>
        </div>
      </div>
    </div>
  );
}
