import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  FileText,
  MoreVertical,
  Pencil,
  Trash2,
  Plus,
  Copy,
} from "lucide-react";
import DuplicateLessonModal from "../components/DuplicateLessonModal/DuplicateLessonModal";
import "../styles/variables.css";
import "./LessonDetail.css";

const LessonDetail = ({
  courseId,
  courseName,
  lessonId,
  adminUsuario,
  onBack,
  onEditLesson,
  onDeleteLesson,
  onCreateNivel,
  onEditNivel,
  onDeleteNivel,
  nivelRefreshKey,
}) => {
  const [lesson, setLesson] = useState(null);
  const [niveles, setNiveles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const menuRef = useRef(null);

  const [showNivelMenu, setShowNivelMenu] = useState(null);
  const [nivelToDelete, setNivelToDelete] = useState(null);
  const nivelMenuRefs = useRef({});
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  useEffect(() => {
    const fetchLesson = async () => {
      const data = await window.api.getLesson(courseId, lessonId);
      if (data.status === "success") {
        setLesson(data.data);
      } else {
        setError(data.message || "Error al cargar la lección");
      }
      setLoading(false);
    };
    fetchLesson();
  }, [courseId, lessonId]);

  useEffect(() => {
    const fetchNiveles = async () => {
      const data = await window.api.getLevels(lessonId);
      if (data.status === "success") {
        setNiveles(data.data || []);
      }
    };
    fetchNiveles();
  }, [lessonId, nivelRefreshKey]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
      Object.values(nivelMenuRefs.current).forEach((ref) => {
        if (ref && !ref.contains(e.target)) {
          setShowNivelMenu(null);
        }
      });
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleDelete = async () => {
    const data = await window.api.deleteLesson(courseId, lessonId, adminUsuario);
    if (data.status === "success") {
      setShowConfirm(false);
      onDeleteLesson();
    }
  };

  const handleDeleteNivel = async () => {
    if (!nivelToDelete) return;
    const data = await window.api.deleteLevel(lessonId, nivelToDelete.id, adminUsuario);
    if (data.status === "success") {
      setNivelToDelete(null);
      setShowNivelMenu(null);
      onDeleteNivel();
    }
  };

  if (loading) {
    return (
      <div className="student-detail">
        <p className="detail-loading">Cargando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-detail">
        <p className="detail-error">{error}</p>
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={20} /> Volver
        </button>
      </div>
    );
  }

  return (
    <div className="student-detail">
      <button className="back-btn" onClick={onBack}>
        <ArrowLeft size={20} />
      </button>

      <div className="detail-header">
        <div className="detail-icon">
          <FileText size={28} color="#fff" />
        </div>
        <div className="detail-title-group">
          <h1>{lesson.titulo}</h1>
          <p className="detail-subtitle">{courseName}</p>
        </div>

        <div className="header-menu-container" ref={menuRef}>
          <button
            className="menu-dots-btn"
            onClick={() => setShowMenu(!showMenu)}
          >
            <MoreVertical size={20} />
          </button>
          {showMenu && (
            <div className="header-dropdown">
              <button
                className="dropdown-item"
                onClick={() => {
                  setShowMenu(false);
                  onEditLesson(lesson);
                }}
              >
                <Pencil size={16} /> Editar
              </button>
              <button
                className="dropdown-item"
                onClick={() => {
                  setShowMenu(false);
                  setShowDuplicateModal(true);
                }}
              >
                <Copy size={16} /> Duplicar
              </button>
              <button
                className="dropdown-item danger"
                onClick={() => {
                  setShowMenu(false);
                  setShowConfirm(true);
                }}
              >
                <Trash2 size={16} /> Eliminar
              </button>
            </div>
          )}
        </div>
      </div>
      
      {lesson.descripcion && (
        <p className="description-block">{lesson.descripcion}</p>
      )}

      <div className="student-info-card">
        {lesson.fecha_limite && (
          <div className="info-row">
            <span className="info-label">Fecha límite</span>
            <span className="info-value">{lesson.fecha_limite}</span>
          </div>
        )}
        {lesson.tiempo_limite_minutos && (
          <div className="info-row">
            <span className="info-label">Tiempo límite</span>
            <span className="info-value">{lesson.tiempo_limite_minutos} min</span>
          </div>
        )}
      </div>

      <div className="student-courses-section">
        <div className="content-header">
          <h3>Niveles de la lección</h3>
          <button className="add-student-btn" onClick={onCreateNivel}>
            <Plus size={16} />
            Crear nivel
          </button>
        </div>
        {niveles.length === 0 ? (
          <p className="detail-empty">No hay niveles creados aún.</p>
        ) : (
          niveles.map((n, i) => (
            <div className="list-item list-item--menu" key={n.id}>
              <div className="list-number">{n.orden || i + 1}</div>
              <div className="list-info">
                <span className="list-name">{n.titulo}</span>
                <span className="list-meta">{n.objetivo || "Sin objetivo"}</span>
              </div>
              <div
                className="item-menu-container"
                ref={(el) => (nivelMenuRefs.current[n.id] = el)}
              >
                <button
                  className="menu-dots-btn"
                  onClick={() => setShowNivelMenu(showNivelMenu === n.id ? null : n.id)}
                >
                  <MoreVertical size={16} />
                </button>
                {showNivelMenu === n.id && (
                  <div className="item-dropdown">
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        setShowNivelMenu(null);
                        onEditNivel(n);
                      }}
                    >
                      <Pencil size={14} /> Editar
                    </button>
                    <button
                      className="dropdown-item danger"
                      onClick={() => {
                        setShowNivelMenu(null);
                        setNivelToDelete(n);
                      }}
                    >
                      <Trash2 size={14} /> Eliminar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-dialog">
            <p>
              ¿Eliminar la lección <strong>{lesson.titulo}</strong>?
            </p>
            <div className="confirm-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowConfirm(false)}
              >
                Cancelar
              </button>
              <button className="btn-danger" onClick={handleDelete}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {nivelToDelete && (
        <div className="confirm-overlay">
          <div className="confirm-dialog">
            <p>
              ¿Eliminar el nivel <strong>{nivelToDelete.titulo}</strong>?
            </p>
            <div className="confirm-actions">
              <button
                className="btn-cancel"
                onClick={() => setNivelToDelete(null)}
              >
                Cancelar
              </button>
              <button className="btn-danger" onClick={handleDeleteNivel}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {showDuplicateModal && (
        <DuplicateLessonModal
          lesson={lesson}
          courseId={courseId}
          adminUsuario={adminUsuario}
          niveles={niveles}
          onClose={() => setShowDuplicateModal(false)}
          onDuplicated={() => setShowDuplicateModal(false)}
        />
      )}
    </div>
  );
};

export default LessonDetail;
