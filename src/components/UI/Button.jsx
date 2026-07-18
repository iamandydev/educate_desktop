import "./UI.css";

export default function Button({ children, variant = "primary", onClick }) {
  return (
    <button className={`ui-btn ui-btn-${variant}`} onClick={onClick}>
      {children}
    </button>
  );
}
