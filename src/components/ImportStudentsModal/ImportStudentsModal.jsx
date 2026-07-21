import { useState, useEffect } from "react";
import { Upload, Check, X, FileSpreadsheet, AlertTriangle } from "lucide-react";
import "./ImportStudentsModal.css";

export default function ImportStudentsModal({ cursoId, cursoNombre, adminUsuario, onClose, onImported }) {
  const [step, setStep] = useState("file");
  const [fileName, setFileName] = useState("");
  const [fileData, setFileData] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [nameCol, setNameCol] = useState("");
  const [idCol, setIdCol] = useState("");
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);

  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const [results, setResults] = useState([]);
  const [log, setLog] = useState([]);

  const [duplicates, setDuplicates] = useState([]);

  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(cursoId ? String(cursoId) : "");

  useEffect(() => {
    const fetchCourses = async () => {
      const res = await window.api.getCourses();
      if (res.status === "success") setCourses(res.data);
    };
    fetchCourses();
  }, []);

  const handleSelectFile = async () => {
    const filePath = await window.api.openFile();
    if (!filePath) return;

    setLoading(true);
    setFileName(filePath.split(/[\\/]/).pop());

    const data = await window.api.readExcel(filePath);
    setLoading(false);

    if (data.error) {
      alert(data.error);
      return;
    }

    if (data.rows.length === 0) {
      alert("El archivo está vacío o no tiene datos");
      return;
    }

    setFileData(data);
    setHeaders(data.headers);

    const autoName = data.headers.find((h) =>
      /nombre|name|alumno|estudiante/i.test(h)
    );
    const autoId = data.headers.find((h) =>
      /ident|cedula|cedula|documento|id|dni|cédula/i.test(h)
    );

    if (autoName) setNameCol(autoName);
    if (autoId) setIdCol(autoId);

    setPreview(data.rows.slice(0, 5));
    setStep("mapping");
  };

  useEffect(() => {
    if (!fileData || !nameCol || !idCol) {
      setPreview([]);
      return;
    }
    const nameIdx = headers.indexOf(nameCol);
    const idIdx = headers.indexOf(idCol);
    setPreview(fileData.rows.slice(0, 5).map((r) => ({
      name: r[nameIdx] || "",
      id: r[idIdx] || "",
    })));
  }, [nameCol, idCol, fileData, headers]);

  const handleImport = async () => {
    if (!selectedCourseId || !nameCol || !idCol || !fileData) return;

    const course = courses.find((c) => c.id === Number(selectedCourseId));
    if (!course) return;

    const nameIdx = headers.indexOf(nameCol);
    const idIdx = headers.indexOf(idCol);
    const rows = fileData.rows.filter(
      (r) => r[nameIdx] && String(r[nameIdx]).trim() && r[idIdx] && String(r[idIdx]).trim()
    );

    setImporting(true);
    setTotal(rows.length);
    setProgress(0);
    setLog([]);
    setDuplicates([]);
    setStep("importing");

    const succeeded = [];
    const failed = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const nombre = String(row[nameIdx]).trim();
      const numId = String(row[idIdx]).trim();

      setProgress(i + 1);
      setLog((prev) => [...prev, { type: "loading", text: `${nombre}...` }]);

      const regRes = await window.api.createStudent(nombre, course.nombre, numId);

      if (regRes.status === "success") {
        const assignRes = await window.api.assignStudentToCourse(
          adminUsuario,
          course.id,
          regRes.data.codigo
        );

        if (assignRes.status === "success") {
          succeeded.push({ nombre, numId });
          setLog((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { type: "success", text: nombre };
            return updated;
          });
        } else {
          failed.push({ nombre, numId, error: assignRes.message || "Error al asignar" });
          setLog((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { type: "error", text: `${nombre} — ${assignRes.message}` };
            return updated;
          });
        }
      } else {
        const isDuplicate =
          regRes.message && /exist|duplic|ya\s/i.test(regRes.message);

        if (isDuplicate) {
          setDuplicates((prev) => [...prev, { nombre, numId, codigo: regRes.data?.codigo }]);
          setLog((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { type: "duplicate", text: `${nombre} — Ya existe` };
            return updated;
          });
        } else {
          failed.push({ nombre, numId, error: regRes.message || "Error al registrar" });
          setLog((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { type: "error", text: `${nombre} — ${regRes.message}` };
            return updated;
          });
        }
      }
    }

    setResults({ succeeded, failed });
    setStep("summary");
  };

  const handleUpdateDuplicate = async (dup) => {
    const course = courses.find((c) => c.id === Number(selectedCourseId));
    if (!course) return;

    await window.api.updateStudent(dup.codigo, adminUsuario, {
      nombre_completo: dup.nombre,
      curso: course.nombre,
      numero_identificacion: dup.numId,
    });

    setDuplicates((prev) => prev.filter((d) => d.numId !== dup.numId));
  };

  const handleUpdateAll = async () => {
    const course = courses.find((c) => c.id === Number(selectedCourseId));
    if (!course) return;

    for (const dup of duplicates) {
      await window.api.updateStudent(dup.codigo, adminUsuario, {
        nombre_completo: dup.nombre,
        curso: course.nombre,
        numero_identificacion: dup.numId,
      });
    }
    setDuplicates([]);
  };

  const handleClose = () => {
    if (step === "summary" || step === "importing") {
      onImported();
    }
    onClose();
  };

  return (
    <div className="imp-overlay">
      <div className="imp-modal">
        {/* STEP: Select file */}
        {step === "file" && (
          <>
            <h3 className="imp-title">
              <Upload size={18} />
              Importar alumnos desde archivo
            </h3>
            <p className="imp-hint">Formatos soportados: .xlsx, .xls, .csv</p>

            <button className="imp-btn-file" onClick={handleSelectFile} disabled={loading}>
              <FileSpreadsheet size={18} />
              {loading ? "Cargando..." : "Seleccionar archivo"}
            </button>

            <div className="imp-actions">
              <button className="imp-btn-cancel" onClick={onClose}>Cancelar</button>
            </div>
          </>
        )}

        {/* STEP: Column mapping */}
        {step === "mapping" && (
          <>
            <h3 className="imp-title">
              <Upload size={18} />
              Importar alumnos desde archivo
            </h3>
            <p className="imp-file-loaded">
              <FileSpreadsheet size={14} /> {fileName} — {fileData.total} registros
            </p>

            <div className="imp-form-group">
              <label>Curso destino</label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
              >
                <option value="">Seleccionar curso...</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>

            <div className="imp-mapping-row">
              <div className="imp-form-group">
                <label>Columna con nombres</label>
                <select value={nameCol} onChange={(e) => setNameCol(e.target.value)}>
                  <option value="">Seleccionar...</option>
                  {headers.map((h, i) => (
                    <option key={i} value={h}>{h}</option>
                  ))}
                </select>
              </div>
              <div className="imp-form-group">
                <label>Columna con identificación</label>
                <select value={idCol} onChange={(e) => setIdCol(e.target.value)}>
                  <option value="">Seleccionar...</option>
                  {headers.map((h, i) => (
                    <option key={i} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            </div>

            {preview.length > 0 && (
              <div className="imp-preview">
                <p className="imp-preview-title">Vista previa</p>
                <div className="imp-preview-table">
                  <div className="imp-preview-header">
                    <span>Nombre</span>
                    <span>Identificación</span>
                  </div>
                  {preview.map((p, i) => (
                    <div className="imp-preview-row" key={i}>
                      <span>{p.name || "—"}</span>
                      <span>{p.id || "—"}</span>
                    </div>
                  ))}
                </div>
                <p className="imp-preview-count">{fileData.total} alumnos detectados</p>
              </div>
            )}

            <div className="imp-actions">
              <button className="imp-btn-cancel" onClick={onClose}>Cancelar</button>
              <button
                className="imp-btn-confirm"
                onClick={handleImport}
                disabled={!selectedCourseId || !nameCol || !idCol}
              >
                Importar ({fileData.total})
              </button>
            </div>
          </>
        )}

        {/* STEP: Importing */}
        {step === "importing" && (
          <>
            <h3 className="imp-title">
              <Upload size={18} />
              Importando alumnos...
            </h3>
            <div className="imp-progress-bar">
              <div className="imp-progress-fill" style={{ width: `${(progress / total) * 100}%` }} />
            </div>
            <p className="imp-progress-text">{progress}/{total}</p>

            <div className="imp-log">
              {log.map((entry, i) => (
                <div key={i} className={`imp-log-entry imp-log-${entry.type}`}>
                  {entry.type === "success" && <Check size={14} />}
                  {entry.type === "error" && <X size={14} />}
                  {entry.type === "duplicate" && <AlertTriangle size={14} />}
                  {entry.type === "loading" && <span className="imp-spinner" />}
                  <span>{entry.text}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* STEP: Summary */}
        {step === "summary" && (
          <>
            <h3 className="imp-title">
              <Upload size={18} />
              Importación completada
            </h3>

            <div className="imp-summary-stats">
              <span className="imp-stat-success">
                <Check size={14} /> {results.succeeded.length} registrados
              </span>
              {results.failed.length > 0 && (
                <span className="imp-stat-error">
                  <X size={14} /> {results.failed.length} errores
                </span>
              )}
              {duplicates.length > 0 && (
                <span className="imp-stat-dup">
                  <AlertTriangle size={14} /> {duplicates.length} duplicados
                </span>
              )}
            </div>

            {duplicates.length > 0 && (
              <div className="imp-duplicates-section">
                <p className="imp-dup-label">Alumnos duplicados:</p>
                <div className="imp-dup-list">
                  {duplicates.map((dup, i) => (
                    <div key={i} className="imp-dup-item">
                      <div className="imp-dup-info">
                        <span className="imp-dup-name">{dup.nombre}</span>
                        <span className="imp-dup-id">{dup.numId}</span>
                      </div>
                      <div className="imp-dup-actions">
                        <button
                          className="imp-btn-sm imp-btn-update"
                          onClick={() => handleUpdateDuplicate(dup)}
                        >
                          Actualizar
                        </button>
                        <button
                          className="imp-btn-sm imp-btn-skip"
                          onClick={() => setDuplicates((prev) => prev.filter((d) => d.numId !== dup.numId))}
                        >
                          Omitir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="imp-dup-bulk">
                  <button className="imp-btn-sm imp-btn-update" onClick={handleUpdateAll}>
                    Actualizar todos
                  </button>
                  <button
                    className="imp-btn-sm imp-btn-skip"
                    onClick={() => setDuplicates([])}
                  >
                    Omitir todos
                  </button>
                </div>
              </div>
            )}

            {results.failed.length > 0 && (
              <div className="imp-errors-section">
                <p className="imp-err-label">Errores:</p>
                {results.failed.map((f, i) => (
                  <div key={i} className="imp-err-item">
                    <span>{f.nombre} — {f.error}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="imp-actions">
              <button className="imp-btn-confirm" onClick={handleClose}>
                {duplicates.length > 0 ? "Cerrar y confirmar" : "Cerrar"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
