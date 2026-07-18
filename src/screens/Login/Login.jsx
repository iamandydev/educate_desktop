import { useState } from "react";
import md5 from "md5";
import "./Login.css";
import { User, Lock } from "lucide-react";

export default function Login({ onLogin }) {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!usuario.trim() || !password.trim()) {
      setError("Usuario y contraseña son requeridos");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await window.api.login(usuario.trim(), md5(password));

      if (data.status === "success") {
        if (rememberMe) {
          localStorage.setItem("rememberedUser", JSON.stringify(data.data));
        }
        onLogin(data.data);
      } else {
        setError(data.message || "Credenciales inválidas");
      }
    } catch (err) {
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="card">
        <div className="avatar">
          <User size={45} color="#fff" />
        </div>

        <div className="inputs">
          <div className="input-group">
            <div className="icon">
              <User size={18} color="white" />
            </div>
            <input
              type="text"
              placeholder="Usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>

          <div className="input-group">
            <div className="icon">
              <Lock size={18} color="white" />
            </div>
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>
        </div>

        {error && <p className="login-error">{error}</p>}

        <div className="options">
          <label>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            Remember me
          </label>
          <a href="#">Forgot Password?</a>
        </div>

        <button
          className="login-btn"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Cargando..." : "LOGIN"}
        </button>
      </div>
    </div>
  );
}
