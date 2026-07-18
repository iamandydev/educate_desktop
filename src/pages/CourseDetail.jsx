import { useState, useEffect, useRef } from "react";
import { BookOpen, ArrowLeft, Users, FileText, UserPlus, Pencil, MoreVertical, Trash2, Check, X } from "lucide-react";
import "./CourseDetail.css";

export default function CourseDetail({ courseId, courseName, adminUsuario, onBack, onCreateStudent, onCourseUpdated, onCourseDeleted, onSelectStudent, onSelectLesson, onCreateLesson, refreshKey, lessonsRefreshKey }) {
  const [activeTab, setActiveTab] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const [lecciones, setLecciones] = useState([]);
  const [actividad, setActividad] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingName, setEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState("");
  const [nameError, setNameError] = useState("");
  const [saving, setSaving] = useState(false);

  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      const data = await window.api.getCourse(courseId);
      if (data.status === "success") {
        setAlumnos(data.data.alumnos || []);
      }
      setLoading(false);
    };
    fetchCourse();
  }, [courseId, refreshKey]);

  useEffect(() => {
    const fetchActividad = async () => {
      const data = await window.api.getCourseActivity(courseId);
      if (data.status === "success") {
        setActividad(data.data || []);
      }
    };
    fetchActividad();
  }, [courseId, refreshKey]);

  useEffect(() => {
    const fetchLecciones = async () => {
      const data = await window.api.getLessons(courseId);
      if (data.status === "success") {
        setLecciones(data.data || []);
      }
    };
    fetchLecciones();
  }, [courseId, lessonsRefreshKey]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTabClick = (tab) => {
    setActiveTab(activeTab === tab ? null : tab);
  };

  const handleEditName = () => {
    setEditNameValue(courseName);
    setNameError("");
    setEditingName(true);
    setShowMenu(false);
  };

  const handleCancelEdit = () => {
    setEditingName(false);
    setEditNameValue("");
    setNameError("");
  };

  const handleSaveName = async () => {
    const newName = editNameValue.trim();
    if (!newName) {
      setNameError("El nombre no puede estar vacío");
      return;
    }
    if (newName === courseName) {
      setEditingName(false);
      return;
    }

    setSaving(true);
    setNameError("");

    const data = await window.api.updateCourse(courseId, adminUsuario, newName);

    if (data.status === "success") {
      setEditingName(false);
      onCourseUpdated(newName);
    } else {
      setNameError(data.message || "Error al actualizar el nombre");
    }
    setSaving(false);
  };

  const handleNameKeyDown = (e) => {
    if (e.key === "Enter") handleSaveName();
    if (e.key === "Escape") handleCancelEdit();
  };

  const handleDelete = async () => {
    setShowMenu(false);

    if (!window.confirm("¿Eliminar este curso? Esta acción no se puede deshacer.")) {
      return;
    }

    const data = await window.api.deleteCourse(courseId, adminUsuario);

    if (data.status === "success") {
      onCourseDeleted();
    } else {
      window.alert(data.message || "Error al eliminar el curso");
    }
  };

  return (
    <div className="course-detail">
      <button className="back-btn" onClick={onBack}>
        <ArrowLeft size={18} />
        Volver
      </button>

      <div className="detail-header">
        <div className="detail-icon">
          <BookOpen size={28} color="#fff" />
        </div>
        <div className="detail-title-group">
          {editingName ? (
            <div className="edit-name-row">
              <input
                className="edit-name-input"
                value={editNameValue}
                onChange={(e) => setEditNameValue(e.target.value)}
                onKeyDown={handleNameKeyDown}
                disabled={saving}
                autoFocus
              />
              <button className="edit-save-btn" onClick={handleSaveName} disabled={saving}>
                <Check size={16} />
              </button>
              <button className="edit-cancel-btn" onClick={handleCancelEdit} disabled={saving}>
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="course-name-row">
              <h1>{courseName}</h1>
              <button className="edit-name-btn" onClick={handleEditName}>
                <Pencil size={16} />
              </button>
            </div>
          )}
          {nameError && <p className="name-error">{nameError}</p>}
          <p className="detail-subtitle">Curso activo</p>
        </div>

        <div className="header-menu-container" ref={menuRef}>
          <button className="menu-dots-btn" onClick={() => setShowMenu(!showMenu)}>
            <MoreVertical size={20} />
          </button>
          {showMenu && (
            <div className="header-dropdown">
              <button className="dropdown-item danger" onClick={handleDelete}>
                <Trash2 size={16} />
                Eliminar
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="detail-stats">
        <div
          className={`stat-card ${activeTab === "students" ? "active" : ""}`}
          onClick={() => handleTabClick("students")}
        >
          <Users size={20} color="#c4b5fd" />
          <div>
            <span className="stat-value">{alumnos.length}</span>
            <span className="stat-label">Estudiantes</span>
          </div>
        </div>

        <div
          className={`stat-card ${activeTab === "lessons" ? "active" : ""}`}
          onClick={() => handleTabClick("lessons")}
        >
          <FileText size={20} color="#f9a8d4" />
          <div>
            <span className="stat-value">{lecciones.length}</span>
            <span className="stat-label">Lecciones</span>
          </div>
        </div>
      </div>

      <div className="detail-content">
        {loading && <p className="detail-empty">Cargando...</p>}

        {!loading && activeTab === "students" && (
          <>
            <div className="content-header">
              <h3>Estudiantes del curso</h3>
              <button className="add-student-btn" onClick={onCreateStudent}>
                <UserPlus size={16} />
                Crear alumno
              </button>
            </div>
            {alumnos.length === 0 ? (
              <p className="detail-empty">No hay estudiantes inscritos aún.</p>
            ) : (
              alumnos.map((s) => (
                <div
                  className="list-item list-item--clickable"
                  key={s.id}
                  onClick={() => onSelectStudent(s.codigo)}
                >
                  <div className="list-avatar">{s.nombre_completo?.charAt(0) || "?"}</div>
                  <div className="list-info">
                    <span className="list-name">{s.nombre_completo}</span>
                    <span className="list-meta">{s.codigo}</span>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {!loading && activeTab === "lessons" && (
          <>
            <div className="content-header">
              <h3>Lecciones del curso</h3>
              <button className="add-student-btn" onClick={onCreateLesson}>
                <FileText size={16} />
                Crear lección
              </button>
            </div>
            {lecciones.length === 0 ? (
              <p className="detail-empty">No hay lecciones creadas aún.</p>
            ) : (
              lecciones.map((l, i) => (
                <div
                  className="list-item list-item--clickable"
                  key={l.id}
                  onClick={() => onSelectLesson(l.id, l.titulo)}
                >
                  <div className="list-number">{l.orden || i + 1}</div>
                  <div className="list-info">
                    <span className="list-name">{l.titulo}</span>
                    <span className="list-meta">
                      {l.orden ? `#${l.orden} · ` : ""}{l.descripcion || "Sin descripción"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {!loading && activeTab === null && (
          <>
            <div className="content-header">
              <h3>Actividad reciente de estudiantes</h3>
            </div>
            {actividad.length === 0 ? (
              <p className="detail-empty">
                Ningún estudiante ha respondido actividades aún.
              </p>
            ) : (
              actividad.map((a, i) => (
                <div
                  className="list-item list-item--clickable"
                  key={`${a.codigo}-${i}`}
                  onClick={() => onSelectStudent(a.codigo)}
                >
                  <div className="list-avatar">{a.nombre_completo?.charAt(0) || "?"}</div>
                  <div className="list-info">
                    <span className="list-name">{a.nombre_completo}</span>
                    <span className="list-meta">{a.nivel_titulo} · {a.leccion_titulo}</span>
                  </div>
                  <div className={`activity-badge ${a.correcto ? "correct" : "incorrect"}`}>
                    {a.correcto ? "Correcto" : "Incorrecto"}
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}
