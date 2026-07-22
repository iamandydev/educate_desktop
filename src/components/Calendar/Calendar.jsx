import { useState } from "react";
import "./Calendar.css";

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function isSameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}

export default function Calendar() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const daysInPrevMonth = getDaysInMonth(
    currentMonth === 0 ? currentYear - 1 : currentYear,
    currentMonth === 0 ? 11 : currentMonth - 1
  );

  const cells = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    cells.push({ day, month: prevMonth, year: prevYear, otherMonth: true });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ day, month: currentMonth, year: currentYear, otherMonth: false });
  }

  const remaining = 42 - cells.length;
  for (let day = 1; day <= remaining; day++) {
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    cells.push({ day, month: nextMonth, year: nextYear, otherMonth: true });
  }

  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleCellClick = (cell) => {
    if (cell.otherMonth) {
      setCurrentMonth(cell.month);
      setCurrentYear(cell.year);
    }
    setSelectedDate(new Date(cell.year, cell.month, cell.day));
  };

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button className="calendar-nav" onClick={goToPrevMonth}>‹</button>
        <h2 className="calendar-title">
          {MONTH_NAMES[currentMonth]} {currentYear}
        </h2>
        <button className="calendar-nav" onClick={goToNextMonth}>›</button>
      </div>

      <div className="calendar-weekdays">
        {WEEKDAYS.map((wd) => (
          <div key={wd} className="calendar-weekday">{wd}</div>
        ))}
      </div>

      <div className="calendar-grid">
        {cells.map((cell, i) => {
          const dateObj = new Date(cell.year, cell.month, cell.day);
          const isToday = isSameDay(dateObj, today);
          const isSelected = selectedDate && isSameDay(dateObj, selectedDate);

          let cls = "calendar-day";
          if (cell.otherMonth) cls += " other-month";
          if (isToday) cls += " today";
          if (isSelected) cls += " selected";

          return (
            <button
              key={i}
              className={cls}
              onClick={() => handleCellClick(cell)}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
