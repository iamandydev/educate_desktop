import {
  LayoutDashboard,
  CalendarDays,
  UserPlus,
  Settings,
  LogOut
} from "lucide-react";

import "./Sidebar.css";

export default function Sidebar({ onLogout, onCreateStudent, onGoDashboard, onGoCalendar, onGoSettings, activeView }) {
  return (
    <div className="sidebar">
      <div>
        <h2 className="sidebar-logo">Educate</h2>

        <nav>
          <button
            className={activeView === "dashboard" ? "active" : ""}
            onClick={onGoDashboard}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </button>

          <button
            className={activeView === "calendar" ? "active" : ""}
            onClick={onGoCalendar}
          >
            <CalendarDays size={18} />
            Calendario
          </button>

          <button
            className={activeView === "register" ? "active" : ""}
            onClick={onCreateStudent}
          >
            <UserPlus size={18} />
            Crear alumno
          </button>

          <button
            className={activeView === "settings" ? "active" : ""}
            onClick={onGoSettings}
          >
            <Settings size={18} />
            Ajustes
          </button>
        </nav>
      </div>

      <button className="logout" onClick={onLogout}>
        <LogOut size={18} />
        Logout
      </button>
    </div>
  );
}
