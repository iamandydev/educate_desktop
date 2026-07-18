import "./EventCard.css";

const MONTHS = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

export default function EventCard({ lesson }) {
  const deadline = new Date(lesson.fecha_limite);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffMs = deadline.getTime() - today.getTime();
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const day = deadline.getDate();
  const month = MONTHS[deadline.getMonth()];
  const isPast = daysLeft < 0;
  const isToday = daysLeft === 0;

  return (
    <div className={`event-card ${isPast ? "past" : ""} ${isToday ? "today" : ""}`}>
      <div className="event-days">
        <span className="event-days-number">{isPast ? 0 : daysLeft}</span>
        <span className="event-days-label">{isPast ? "vencida" : "días"}</span>
      </div>
      <h3 className="event-lesson-title">{lesson.titulo}</h3>
      <p className="event-course-name">{lesson.cursoNombre}</p>
      <small className="event-date">
        {day} {month}
      </small>
    </div>
  );
}
