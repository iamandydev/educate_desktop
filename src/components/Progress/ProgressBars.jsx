import { useState, useEffect } from "react";
import "./Progress.css";

export default function ProgressBars() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const coursesRes = await window.api.getCourses();
      if (coursesRes.status !== "success") {
        setLoading(false);
        return;
      }

      const results = await Promise.all(
        coursesRes.data.map(async (course) => {
          const lessonsRes = await window.api.getLessons(course.id);
          if (lessonsRes.status !== "success" || !lessonsRes.data) {
            return { name: course.nombre, total: 0, completed: 0, percent: 0 };
          }

          let totalLevels = 0;
          const levelCounts = await Promise.all(
            lessonsRes.data.map(async (lesson) => {
              const levelsRes = await window.api.getLevels(lesson.id);
              if (levelsRes.status === "success" && levelsRes.data) {
                return { count: levelsRes.data.length, lesson };
              }
              return { count: 0, lesson };
            })
          );

          levelCounts.forEach((lc) => {
            totalLevels += lc.count;
          });

          const activityRes = await window.api.getCourseActivity(course.id);
          let completedLevels = 0;
          if (activityRes.status === "success" && activityRes.data) {
            const unique = new Set();
            activityRes.data.forEach((a) => {
              unique.add(`${a.nivel_titulo}|||${a.leccion_titulo}`);
            });
            completedLevels = unique.size;
          }

          const percent =
            totalLevels > 0
              ? Math.round((completedLevels / totalLevels) * 100)
              : 0;

          return {
            name: course.nombre,
            total: totalLevels,
            completed: completedLevels,
            percent,
          };
        })
      );

      setCourses(results);
      setLoading(false);
    };

    fetchAll();
  }, []);

  return (
    <div className="progress-bars">
      <h3>Progreso de cursos</h3>
      {loading ? (
        <p className="progress-empty">Cargando...</p>
      ) : courses.length === 0 ? (
        <p className="progress-empty">No hay cursos creados aún</p>
      ) : (
        courses.map((c) => (
          <div key={c.name} className="progress-item">
            <div className="progress-header">
              <p>{c.name}</p>
              <span>
                {c.completed}/{c.total} · {c.percent}%
              </span>
            </div>
            <div className="bar">
              <div style={{ width: `${c.percent}%` }}></div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
