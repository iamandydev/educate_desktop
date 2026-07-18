import { useState, useEffect } from "react";
import { Copy, Check } from "lucide-react";
import "./DuplicateLessonModal.css";

export default function DuplicateLessonModal({
  lesson,
  courseId,
  adminUsuario,
  niveles,
  onClose,
  onDuplicated,
}) {
  const [courses, setCourses] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [duplicating, setDuplicating] = useState(false);
  const [progress, setProgress] = useState("");
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      const res = await window.api.getCourses();
      if (res.status === "success") {
        setCourses(res.data.filter((c) => c.id !== courseId));
      }
      setLoading(false);
    };
    fetchCourses();
  }, [courseId]);

  const toggleCourse = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === courses.length) setSelected(new Set());
    else setSelected(new Set(courses.map((c) => c.id)));
  };

  const handleDuplicate = async () => {
    if (selected.size === 0 || niveles.length === 0) return;

    setDuplicating(true);
    setErrors([]);
    const targets = courses.filter((c) => selected.has(c.id));
    const failed = [];

    for (let i = 0; i < targets.length; i++) {
      const course = targets[i];
      setProgress(`Duplicando en "${course.nombre}" (${i + 1}/${targets.length})...`);

      const lessonData = {
        titulo: lesson.titulo,
        descripcion: lesson.descripcion || undefined,
        orden: lesson.orden || undefined,
        fecha_limite: lesson.fecha_limite || undefined,
        tiempo_limite_minutos: lesson.tiempo_limite_minutos || undefined,
      };

      const lessonRes = await window.api.createLesson(course.id, adminUsuario, lessonData);

      if (lessonRes.status !== "success") {
        failed.push({ name: course.nombre, error: lessonRes.message });
        continue;
      }

      const newLessonId = lessonRes.data?.id;
      if (!newLessonId) {
        failed.push({ name: course.nombre, error: "No se obtuvo el ID de la lección creada" });
        continue;
      }

      for (const nivel of niveles) {
        const nivelRes = await window.api.getLevel(lesson.id, nivel.id);
        if (nivelRes.status !== "success" || !nivelRes.data) continue;

        const nd = nivelRes.data;
        const createData = { titulo: nd.titulo, orden: nd.orden || undefined };
        if (nd.objetivo) createData.objetivo = nd.objetivo;
        if (nd.pregunta) {
          createData.opciones = nd.pregunta.opciones;
          createData.respuesta_correcta = nd.pregunta.respuesta_correcta;
        }

        await window.api.createLevel(newLessonId, adminUsuario, createData);
      }
    }

    if (failed.length > 0) {
      setErrors(failed);
      setProgress(`Completado con ${failed.length} error(es) de ${targets.length} cursos`);
    } else {
      setProgress(`Lección duplicada en ${targets.length} curso(s) correctamente`);
    }

    setTimeout(() => onDuplicated(), 1500);
  };

  return (
    <div className="dup-overlay">
      <div className="dup-modal">
        <h3 className="dup-title">
          <Copy size={18} />
          Duplicar lección
        </h3>
        <p className="dup-lesson-name">{lesson.titulo}</p>
        <p className="dup-lesson-info">{niveles.length} nivel(es) se copiarán</p>

        {loading ? (
          <p className="dup-status">Cargando cursos...</p>
        ) : duplicating ? (
          <div className="dup-progress">
            <p className="dup-status">{progress}</p>
            {errors.length > 0 && (
              <ul className="dup-errors">
                {errors.map((e, i) => (
                  <li key={i}>{e.name}: {e.error}</li>
                ))}
              </ul>
            )}
          </div>
        ) : courses.length === 0 ? (
          <p className="dup-status">No hay otros cursos disponibles</p>
        ) : (
          <>
            <label className="dup-select-all" onClick={toggleAll}>
              <input
                type="checkbox"
                checked={selected.size === courses.length && courses.length > 0}
                readOnly
              />
              Seleccionar todos ({courses.length})
            </label>
            <div className="dup-course-list">
              {courses.map((course) => (
                <label
                  key={course.id}
                  className={`dup-course-item ${selected.has(course.id) ? "selected" : ""}`}
                  onClick={() => toggleCourse(course.id)}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(course.id)}
                    readOnly
                  />
                  <span className="dup-course-name">{course.nombre}</span>
                  {selected.has(course.id) && <Check size={14} className="dup-check-icon" />}
                </label>
              ))}
            </div>
          </>
        )}

        <div className="dup-actions">
          <button className="dup-btn-cancel" onClick={onClose}>
            {duplicating ? "Cerrar" : "Cancelar"}
          </button>
          {!duplicating && (
            <button
              className="dup-btn-confirm"
              onClick={handleDuplicate}
              disabled={selected.size === 0 || niveles.length === 0}
            >
              Duplicar{selected.size > 0 ? ` (${selected.size})` : ""}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
