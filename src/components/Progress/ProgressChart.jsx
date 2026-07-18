import "./Progress.css";

export default function ProgressChart() {
  const total = 85;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (total / 100) * circumference;

  return (
    <div className="progress-chart">
      <h3>Overall Progress</h3>
      <div className="chart-container">
        <svg width="150" height="150" viewBox="0 0 150 150">
          <circle
            cx="75"
            cy="75"
            r={radius}
            fill="none"
            stroke="#edf2f7"
            strokeWidth="12"
          />
          <circle
            cx="75"
            cy="75"
            r={radius}
            fill="none"
            stroke="#8edbff"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 75 75)"
          />
        </svg>
        <div className="chart-text">
          <span className="chart-number">{total}%</span>
          <span className="chart-label">Completed</span>
        </div>
      </div>
    </div>
  );
}
