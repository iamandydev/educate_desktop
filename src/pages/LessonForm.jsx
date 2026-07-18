import React, { useState } from "react";
import { ArrowLeft, FileText } from "lucide-react";
import "../styles/variables.css";
import "./LessonForm.css";

const LessonForm = ({ courseId, courseName, adminUsuario, lesson, onBack, onSaved }) => {
  const [titulo, setTitulo] = useState(lesson ? lesson.titulo : "");
  const [descripcion, setDescripcion] = useState(lesson ? lesson.descripcion || "" : "");
  const [orden, setOrden] = useState(lesson && lesson.orden ? lesson.orden : "");
  const [fechaLimite, setFechaLimite] = useState(lesson && lesson.fecha_limite ? lesson.fecha_limite : "");
  const [tiempoLimite, setTiempoLimite] = useState(lesson && lesson.tiempo_limite_minutos ? lesson.tiempo_limite_minutos : "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isEdit = !!lesson;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titulo.trim()) {
      setError("El título es obligatorio");
      return;
    }

    setLoading(true);
    setError("");

    const data = { titulo: titulo.trim() };
    if (descripcion.trim()) data.descripcion = descripcion.trim();
    if (orden !== "") data.orden = parseInt(orden);
    if (fechaLimite) data.fecha_limite = fechaLimite;
    if (tiempoLimite !== "") data.tiempo_limite_minutos = parseInt(tiempoLimite);

    try {
      const result = isEdit
        ? await window.api.updateLesson(courseId, lesson.id, adminUsuario, data)
        : await window.api.createLesson(courseId, adminUsuario, data);

      if (result.status === "success") {
        onSaved();
      } else {
        setError(result.message || "Error al guardar la lección");
      }
    } catch (err) {
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lesson-form">
      <button className="back-btn" onClick={onBack}>
        <ArrowLeft size={20} />
      </button>

      <div className="register-header">
        <div className="register-icon">
          <FileText size={28} color="#fff" />
        </div>
        <div>
          <h1>{isEdit ? "Editar lección" : "Crear lección"}</h1>
          <p className="register-subtitle">Curso: {courseName}</p>
        </div>
      </div>

      <form className="register-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Título *</label>
          <input
            type="text"
            placeholder="Ej: Lección 1"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Descripción</label>
          <textarea
            placeholder="Descripción de la lección..."
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Orden</label>
            <input
              type="number"
              placeholder="1"
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Fecha límite</label>
            <input
              type="date"
              value={fechaLimite}
              onChange={(e) => setFechaLimite(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Tiempo límite (min)</label>
            <input
              type="number"
              placeholder="30"
              value={tiempoLimite}
              onChange={(e) => setTiempoLimite(e.target.value)}
            />
          </div>
        </div>

        {error && <p className="register-error">{error}</p>}

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={onBack}>
            Cancelar
          </button>
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear lección"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LessonForm;
