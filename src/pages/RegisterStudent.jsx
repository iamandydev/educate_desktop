import { useState, useEffect } from "react";
import { ArrowLeft, UserPlus, Upload } from "lucide-react";
import ImportStudentsModal from "../components/ImportStudentsModal/ImportStudentsModal";
import "./RegisterStudent.css";

export default function RegisterStudent({ courseName, courseId, adminUsuario, onBack, onStudentCreated }) {
  const [cursos, setCursos] = useState([]);
  const [selectedCursoId, setSelectedCursoId] = useState("");
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [numeroIdentificacion, setNumeroIdentificacion] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    const fetchCursos = async () => {
      const data = await window.api.getCourses();
      if (data.status === "success") {
        setCursos(data.data);
        if (courseId) {
          setSelectedCursoId(String(courseId));
        }
      }
    };
    fetchCursos();
  }, [courseId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nombreCompleto.trim()) {
      setError("El nombre completo es requerido");
      return;
    }
    if (!selectedCursoId) {
      setError("Debe seleccionar un curso");
      return;
    }
    if (!numeroIdentificacion.trim()) {
      setError("El número de identificación es requerido");
      return;
    }

    setLoading(true);
    setError("");

    const cursoSeleccionado = cursos.find((c) => c.id === Number(selectedCursoId));

    const regData = await window.api.createStudent(
      nombreCompleto.trim(),
      cursoSeleccionado.nombre,
      numeroIdentificacion.trim()
    );

    if (regData.status !== "success") {
      setError(regData.message || "Error al registrar el alumno");
      setLoading(false);
      return;
    }

    const assignData = await window.api.assignStudentToCourse(
      adminUsuario,
      Number(selectedCursoId),
      regData.data.codigo
    );

    setLoading(false);

    if (assignData.status === "success") {
      onStudentCreated();
    } else {
      setError(assignData.message || "Alumno registrado pero error al asignar al curso");
    }
  };

  return (
    <div className="register-student">
      <button className="back-btn" onClick={onBack}>
        <ArrowLeft size={18} />
        Volver
      </button>

      <div className="register-header">
        <div className="register-icon">
          <UserPlus size={28} color="#fff" />
        </div>
        <div>
          <h1>Registrar alumno</h1>
          <p className="register-subtitle">
            {courseName ? `Curso: ${courseName}` : "Registro general de alumno"}
          </p>
        </div>
        <button className="import-btn" onClick={() => setShowImportModal(true)}>
          <Upload size={16} />
          Importar
        </button>
      </div>

      <form className="register-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nombre completo</label>
          <input
            type="text"
            placeholder="Ej: Andrés Marcial"
            value={nombreCompleto}
            onChange={(e) => setNombreCompleto(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Curso</label>
          <select
            value={selectedCursoId}
            onChange={(e) => setSelectedCursoId(e.target.value)}
          >
            <option value="">Seleccionar curso...</option>
            {cursos.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Número de identificación</label>
          <input
            type="text"
            placeholder="Ej: 1029773287"
            value={numeroIdentificacion}
            onChange={(e) => setNumeroIdentificacion(e.target.value)}
          />
        </div>

        {error && <p className="register-error">{error}</p>}

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={onBack}>
            Cancelar
          </button>
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? "Registrando..." : "Registrar"}
          </button>
        </div>
      </form>

      {showImportModal && (
        <ImportStudentsModal
          cursoId={courseId}
          cursoNombre={courseName}
          adminUsuario={adminUsuario}
          onClose={() => setShowImportModal(false)}
          onImported={() => {
            setShowImportModal(false);
            onStudentCreated();
          }}
        />
      )}
    </div>
  );
}
