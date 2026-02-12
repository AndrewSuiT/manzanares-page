import '../styles/LoadingSpinner.css';

export function LoadingSpinner({ size = 'medium', text = 'Cargando...' }) {
  return (
    <div className={`loading-spinner loading-spinner-${size}`}>
      <div className="spinner-rings">
        <div className="ring"></div>
        <div className="ring"></div>
        <div className="ring"></div>
      </div>
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
}
