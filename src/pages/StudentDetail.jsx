import { useState, useEffect } from "react";
import { User, ArrowLeft, BookOpen, Calendar, Hash, Clock, CheckCircle, XCircle } from "lucide-react";
import "./StudentDetail.css";

export default function StudentDetail({ studentCode, onBack }) {
  const [student, setStudent] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      setLoading(true);
      const data = await window.api.getStudent(studentCode);
      if (data.status === "success") {
        setStudent(data.data.alumno);
      }
      setLoading(false);
    };
    fetchStudent();
  }, [studentCode]);

  useEffect(() => {
    const fetchHistorial = async () => {
      const data = await window.api.getStudentHistory(studentCode);
      if (data.status === "success") {
        setHistorial(data.data.lecciones || []);
      }
    };
    fetchHistorial();
  }, [studentCode]);

  return (
    <div className="student-detail">
      <button className="back-btn" onClick={onBack}>
        <ArrowLeft size={18} />
        Volver
      </button>

      {loading && <p className="detail-empty">Cargando...</p>}

      {!loading && !student && (
        <p className="detail-empty">Alumno no encontrado.</p>
      )}

      {!loading && student && (
        <>
          <div className="student-header">
            <div className="student-avatar">
              {student.nombre_completo?.charAt(0) || "?"}
            </div>
            <div>
              <h1>{student.nombre_completo}</h1>
              <p className="detail-subtitle">Código: {student.codigo}</p>
            </div>
          </div>

          <div className="student-info-card">
            <div className="info-row">
              <Hash size={16} color="#999" />
              <span className="info-label">Código</span>
              <span className="info-value">{student.codigo}</span>
            </div>
            <div className="info-row">
              <BookOpen size={16} color="#999" />
              <span className="info-label">Curso principal</span>
              <span className="info-value">{student.curso}</span>
            </div>
            <div className="info-row">
              <User size={16} color="#999" />
              <span className="info-label">Estado</span>
              <span className={`info-badge ${student.estado ? "active" : "inactive"}`}>
                {student.estado ? "Activo" : "Inactivo"}
              </span>
            </div>
            <div className="info-row">
              <Calendar size={16} color="#999" />
              <span className="info-label">Fecha de registro</span>
              <span className="info-value">{student.created_at}</span>
            </div>
          </div>

          <div className="student-history-section">
            <h3>Historial de respuestas</h3>
            {historial.length === 0 ? (
              <p className="detail-empty">Este estudiante aún no ha respondido actividades.</p>
            ) : (
              historial.map((leccion) => (
                <div className="history-lesson-group" key={leccion.leccion_id}>
                  <div className="history-lesson-header">
                    <BookOpen size={14} />
                    <span>{leccion.leccion_titulo}</span>
                    <span className="history-lesson-score">
                      {leccion.niveles_correctos}/{leccion.total_niveles}
                    </span>
                  </div>
                  {leccion.niveles_respondidos.map((nivel, i) => (
                    <div className="history-item" key={`${nivel.nivel_id}-${i}`}>
                      <div className="history-item-left">
                        {nivel.correcto
                          ? <CheckCircle size={16} className="history-icon correct" />
                          : <XCircle size={16} className="history-icon incorrect" />}
                        <div className="history-item-info">
                          <span className="history-nivel-name">{nivel.nivel_titulo}</span>
                          <span className="history-time">{nivel.tiempo_segundos}s</span>
                        </div>
                      </div>
                      <span className={`history-badge ${nivel.correcto ? "correct" : "incorrect"}`}>
                        {nivel.correcto ? "Correcto" : "Incorrecto"}
                      </span>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
