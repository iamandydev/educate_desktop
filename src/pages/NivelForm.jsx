import React, { useState, useEffect } from "react";
import { ArrowLeft, Layers } from "lucide-react";
import "../styles/variables.css";
import "./NivelForm.css";

const NivelForm = ({ leccionId, leccionTitulo, adminUsuario, nivel, onBack, onSaved }) => {
  const isEdit = !!nivel;

  const [titulo, setTitulo] = useState(nivel ? nivel.titulo : "");
  const [objetivo, setObjetivo] = useState(nivel ? nivel.objetivo || "" : "");
  const [orden, setOrden] = useState(nivel && nivel.orden ? nivel.orden : "");
  const [opciones, setOpciones] = useState(() => {
    if (nivel && nivel.pregunta && nivel.pregunta.opciones) {
      const opts = nivel.pregunta.opciones;
      return [opts[0] || "", opts[1] || "", opts[2] || "", opts[3] || ""];
    }
    return ["", "", "", ""];
  });
  const [respuestaCorrecta, setRespuestaCorrecta] = useState(
    nivel && nivel.pregunta ? nivel.pregunta.respuesta_correcta : ""
  );

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isEdit || !nivel || !nivel.id) return;

    const fetchNivel = async () => {
      try {
        const result = await window.api.getLevel(leccionId, nivel.id);
        if (result.status === "success" && result.data) {
          const d = result.data;
          setTitulo(d.titulo || "");
          setObjetivo(d.objetivo || "");
          setOrden(d.orden || "");
          if (d.pregunta && d.pregunta.opciones) {
            const opts = d.pregunta.opciones;
            setOpciones([opts[0] || "", opts[1] || "", opts[2] || "", opts[3] || ""]);
          }
          if (d.pregunta) {
            setRespuestaCorrecta(d.pregunta.respuesta_correcta || "");
          }
        }
      } catch (err) {
        setError("Error al cargar datos del nivel");
      }
    };

    fetchNivel();
  }, [isEdit, leccionId, nivel?.id]);

  const handleOptionChange = (index, value) => {
    const newOpciones = [...opciones];
    newOpciones[index] = value;
    setOpciones(newOpciones);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!titulo.trim()) {
      setError("El título es obligatorio");
      return;
    }

    const filledOptions = opciones.filter((o) => o.trim());
    if (filledOptions.length < 2) {
      setError("Debes ingresar al menos 2 opciones de respuesta");
      return;
    }

    if (!respuestaCorrecta) {
      setError("Selecciona la respuesta correcta");
      return;
    }

    setLoading(true);
    setError("");

    const data = {
      titulo: titulo.trim(),
      opciones: opciones.filter((o) => o.trim()),
      respuesta_correcta: respuestaCorrecta,
    };
    if (objetivo.trim()) data.objetivo = objetivo.trim();
    if (orden !== "") data.orden = parseInt(orden);

    try {
      const result = isEdit
        ? await window.api.updateLevel(leccionId, nivel.id, adminUsuario, data)
        : await window.api.createLevel(leccionId, adminUsuario, data);

      if (result.status === "success") {
        onSaved();
      } else {
        setError(result.message || "Error al guardar el nivel");
      }
    } catch (err) {
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nivel-form">
      <button className="back-btn" onClick={onBack}>
        <ArrowLeft size={20} />
      </button>

      <div className="register-header">
        <div className="register-icon">
          <Layers size={28} color="#fff" />
        </div>
        <div>
          <h1>{isEdit ? "Editar nivel" : "Crear nivel"}</h1>
          <p className="register-subtitle">Lección: {leccionTitulo}</p>
        </div>
      </div>

      <form className="register-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Título *</label>
          <input
            type="text"
            placeholder="Ej: Nivel 1"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Objetivo</label>
          <input
            type="text"
            placeholder="Objetivo del nivel..."
            value={objetivo}
            onChange={(e) => setObjetivo(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Orden</label>
          <input
            type="number"
            placeholder="1"
            value={orden}
            onChange={(e) => setOrden(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Opciones de respuesta *</label>
          {["A", "B", "C", "D"].map((letter, i) => (
            <div className="option-row" key={letter}>
              <span className={`option-letter ${respuestaCorrecta === letter ? "correct" : ""}`}>
                {letter}
              </span>
              <input
                type="text"
                placeholder={`Opción ${letter}`}
                value={opciones[i]}
                onChange={(e) => handleOptionChange(i, e.target.value)}
              />
            </div>
          ))}
        </div>

        <div className="form-group">
          <label>Respuesta correcta *</label>
          <div className="correct-answer-row">
            {["A", "B", "C", "D"].map((letter) => (
              <label
                key={letter}
                className={`answer-option ${respuestaCorrecta === letter ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="respuesta"
                  value={letter}
                  checked={respuestaCorrecta === letter}
                  onChange={() => setRespuestaCorrecta(letter)}
                />
                {letter}
              </label>
            ))}
          </div>
        </div>

        {error && <p className="register-error">{error}</p>}

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={onBack}>
            Cancelar
          </button>
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear nivel"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NivelForm;
