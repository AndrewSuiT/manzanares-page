import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Desplazarse al inicio de la página cuando cambia la ruta
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
