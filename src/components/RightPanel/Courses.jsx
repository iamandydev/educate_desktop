import { useState, useEffect } from "react";
import "./Courses.css";

const COLORS = ["#8edbff", "#c4b5fd", "#f9a8d4", "#fcd34d", "#86efac"];

export default function Courses({ onSelectCourse, user, refreshKey }) {
  const [courses, setCourses] = useState([]);
  const [showInput, setShowInput] = useState(false);
  const [newCourse, setNewCourse] = useState("");
  const [error, setError] = useState("");

  const fetchCourses = async () => {
    const data = await window.api.getCourses();
    if (data.status === "success") {
      setCourses(data.data);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [refreshKey]);

  const handleAdd = async () => {
    const name = newCourse.trim();
    if (!name) return;

    setError("");
    const data = await window.api.createCourse(user.usuario, name);

    if (data.status === "success") {
      setNewCourse("");
      setShowInput(false);
      fetchCourses();
    } else {
      setError(data.message || "Error al crear curso");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleAdd();
    if (e.key === "Escape") {
      setNewCourse("");
      setShowInput(false);
      setError("");
    }
  };

  return (
    <div className="courses">
      <div className="courses-header">
        <h3>Cursos</h3>
        {!showInput && (
          <button className="add-btn" onClick={() => setShowInput(true)}>
            + Añadir curso
          </button>
        )}
      </div>

      {showInput && (
        <>
          <div className="add-input">
            <input
              type="text"
              placeholder="Nombre del curso"
              value={newCourse}
              onChange={(e) => setNewCourse(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            <div className="add-actions">
              <button className="add-confirm" onClick={handleAdd}>✓</button>
              <button
                className="add-cancel"
                onClick={() => {
                  setNewCourse("");
                  setShowInput(false);
                  setError("");
                }}
              >
                ✕
              </button>
            </div>
          </div>
          {error && <p className="course-error">{error}</p>}
        </>
      )}

      {courses.map((course, i) => (
        <div
          className="course-item"
          key={course.id}
          onClick={() => onSelectCourse({ id: course.id, nombre: course.nombre })}
        >
          <div
            className="course-dot"
            style={{ background: COLORS[i % COLORS.length] }}
          ></div>
          <div className="course-info">
            <p className="course-name">{course.nombre}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
