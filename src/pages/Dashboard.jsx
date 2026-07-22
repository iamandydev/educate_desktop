import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import SearchBar from "../components/Header/SearchBar";
import Banner from "../components/Banner/Banner";
import Events from "../components/Events/Events";
import ProgressBars from "../components/Progress/ProgressBars";
import Courses from "../components/RightPanel/Courses";
import CourseDetail from "./CourseDetail";
import RegisterStudent from "./RegisterStudent";
import StudentDetail from "./StudentDetail";
import LessonForm from "./LessonForm";
import LessonDetail from "./LessonDetail";
import NivelForm from "./NivelForm";
import Settings from "./Settings";
import Calendar from "../components/Calendar/Calendar";

import "../styles/dashboard.css";

export default function Dashboard({ user, onLogout }) {
  const [view, setView] = useState("dashboard");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseName, setCourseName] = useState("");
  const [selectedStudentCode, setSelectedStudentCode] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshCoursesKey, setRefreshCoursesKey] = useState(0);
  const [selectedLessonId, setSelectedLessonId] = useState(null);
  const [lessonTitulo, setLessonTitulo] = useState("");
  const [editingLesson, setEditingLesson] = useState(null);
  const [lessonsRefreshKey, setLessonsRefreshKey] = useState(0);
  const [editingNivel, setEditingNivel] = useState(null);
  const [nivelRefreshKey, setNivelRefreshKey] = useState(0);

  useEffect(() => {
    if (selectedCourse) {
      setCourseName(selectedCourse.nombre);
      setView("course-detail");
    }
  }, [selectedCourse?.id]);

  const handleStudentCreated = () => {
    setView("course-detail");
    setRefreshKey((k) => k + 1);
  };

  const handleCourseUpdated = (newName) => {
    setCourseName(newName);
    setSelectedCourse((prev) => prev ? { ...prev, nombre: newName } : prev);
    setRefreshCoursesKey((k) => k + 1);
  };

  const handleCourseDeleted = () => {
    setSelectedCourse(null);
    setView("dashboard");
    setRefreshCoursesKey((k) => k + 1);
  };

  const handleBackFromRegister = () => {
    if (selectedCourse) {
      setView("course-detail");
    } else {
      setView("dashboard");
    }
  };

  const handleBackFromCourseDetail = () => {
    setSelectedCourse(null);
    setView("dashboard");
  };

  const handleBackFromStudent = () => {
    setView("course-detail");
  };

  const activeSidebarView = (() => {
    if (view === "settings") return "settings";
    if (view === "register" && !selectedCourse) return "register";
    if (view === "dashboard") return "dashboard";
    if (view === "calendar") return "calendar";
    return "";
  })();

  return (
    <div className="dashboard">
      <Sidebar
        onLogout={onLogout}
        onGoDashboard={() => {
          setSelectedCourse(null);
          setSelectedLessonId(null);
          setEditingLesson(null);
          setEditingNivel(null);
          setView("dashboard");
        }}
        onCreateStudent={() => {
          setSelectedCourse(null);
          setView("register");
        }}
        onGoSettings={() => setView("settings")}
        onGoCalendar={() => setView("calendar")}
        activeView={activeSidebarView}
      />

      <main className="content">
        {view === "dashboard" && <SearchBar />}

        {view === "settings" ? (
          <Settings />
        ) : view === "calendar" ? (
          <Calendar />
        ) : view === "nivel-form" && selectedCourse && selectedLessonId ? (
          <NivelForm
            leccionId={selectedLessonId}
            leccionTitulo={lessonTitulo}
            adminUsuario={user.usuario}
            nivel={editingNivel}
            onBack={() => { setEditingNivel(null); setView("lesson-detail"); }}
            onSaved={() => {
              setEditingNivel(null);
              setView("lesson-detail");
              setNivelRefreshKey((k) => k + 1);
            }}
          />
        ) : view === "lesson-form" && selectedCourse ? (
          <LessonForm
            courseId={selectedCourse.id}
            courseName={courseName}
            adminUsuario={user.usuario}
            lesson={editingLesson}
            onBack={() => { setEditingLesson(null); setView("course-detail"); }}
            onSaved={() => {
              setEditingLesson(null);
              setView("course-detail");
              setLessonsRefreshKey((k) => k + 1);
            }}
          />
        ) : view === "lesson-detail" && selectedCourse && selectedLessonId ? (
          <LessonDetail
            courseId={selectedCourse.id}
            courseName={courseName}
            lessonId={selectedLessonId}
            adminUsuario={user.usuario}
            onBack={() => setView("course-detail")}
            onEditLesson={(lesson) => {
              setEditingLesson(lesson);
              setView("lesson-form");
            }}
            onDeleteLesson={() => {
              setSelectedLessonId(null);
              setView("course-detail");
              setLessonsRefreshKey((k) => k + 1);
            }}
            onCreateNivel={() => setView("nivel-form")}
            onEditNivel={(nivel) => { setEditingNivel(nivel); setView("nivel-form"); }}
            onDeleteNivel={() => setNivelRefreshKey((k) => k + 1)}
            nivelRefreshKey={nivelRefreshKey}
          />
        ) : view === "register" && selectedCourse ? (
          <RegisterStudent
            courseName={courseName}
            courseId={selectedCourse.id}
            adminUsuario={user.usuario}
            onBack={handleBackFromRegister}
            onStudentCreated={handleStudentCreated}
          />
        ) : view === "register" ? (
          <RegisterStudent
            adminUsuario={user.usuario}
            onBack={handleBackFromRegister}
            onStudentCreated={handleStudentCreated}
          />
        ) : view === "student-detail" && selectedStudentCode ? (
          <StudentDetail
            studentCode={selectedStudentCode}
            onBack={handleBackFromStudent}
          />
        ) : view === "course-detail" && selectedCourse ? (
          <CourseDetail
            courseId={selectedCourse.id}
            courseName={courseName}
            adminUsuario={user.usuario}
            onBack={handleBackFromCourseDetail}
            onCreateStudent={() => setView("register")}
            onCourseUpdated={handleCourseUpdated}
            onCourseDeleted={handleCourseDeleted}
            onSelectStudent={(code) => {
              setSelectedStudentCode(code);
              setView("student-detail");
            }}
            onCreateLesson={() => { setEditingLesson(null); setView("lesson-form"); }}
            onSelectLesson={(id, titulo) => { setSelectedLessonId(id); setLessonTitulo(titulo); setView("lesson-detail"); }}
            refreshKey={refreshKey}
            lessonsRefreshKey={lessonsRefreshKey}
          />
        ) : (
          <>
            <Banner />
            <Events />
            <ProgressBars />
          </>
        )}
      </main>

      <aside className="right-panel">
        <Courses onSelectCourse={setSelectedCourse} user={user} refreshKey={refreshCoursesKey} />
      </aside>
    </div>
  );
}
