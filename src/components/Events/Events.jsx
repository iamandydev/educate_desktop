import { useState, useEffect } from "react";
import EventCard from "./EventCard";
import "./Events.css";

export default function Events() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const coursesRes = await window.api.getCourses();
      if (coursesRes.status !== "success") {
        setLoading(false);
        return;
      }

      const allLessons = [];
      await Promise.all(
        coursesRes.data.map(async (course) => {
          const lessonsRes = await window.api.getLessons(course.id);
          if (lessonsRes.status === "success" && lessonsRes.data) {
            lessonsRes.data.forEach((l) => {
              if (l.fecha_limite) {
                allLessons.push({
                  ...l,
                  cursoNombre: course.nombre,
                });
              }
            });
          }
        })
      );

      allLessons.sort(
        (a, b) => new Date(a.fecha_limite) - new Date(b.fecha_limite)
      );

      setLessons(allLessons);
      setLoading(false);
    };

    fetchAll();
  }, []);

  return (
    <div className="events">
      <h3 className="events-title">Próximas lecciones</h3>
      {loading ? (
        <p className="events-empty">Cargando...</p>
      ) : lessons.length === 0 ? (
        <p className="events-empty">No hay lecciones con fecha límite</p>
      ) : (
        <div className="events-list">
          {lessons.map((lesson) => (
            <EventCard key={lesson.id} lesson={lesson} />
          ))}
        </div>
      )}
    </div>
  );
}
