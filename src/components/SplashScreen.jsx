import { useState, useEffect } from 'react';
import '../styles/SplashScreen.css';

export function SplashScreen({ isVisible }) {
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    if (!isVisible) {
      // Esperar a que termine la transición CSS antes de desmontar
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 1200); // Mismo tiempo que la transición en CSS
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!shouldRender) {
    return null;
  }

  return (
    <div className={`splash-screen ${!isVisible ? 'fade-out' : ''}`}>
      <div className="splash-content">
        {/* Logo */}
        <div className="splash-logo">
          <img src="/logo4.png" alt="Manzanares" />
        </div>

        {/* Texto */}
        <div className="splash-text">
          <h1>Manzanares</h1>
          <p>Cargando...</p>
        </div>

        {/* Animación de carga */}
        <div className="splash-loader">
          <div className="loader-ring"></div>
          <div className="loader-ring"></div>
          <div className="loader-ring"></div>
        </div>
      </div>
    </div>
  );
}