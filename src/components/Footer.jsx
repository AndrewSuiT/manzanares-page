import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaWhatsapp, FaMapMarkerAlt, FaPhone, FaEnvelope, FaTiktok } from 'react-icons/fa';
import '../styles/Footer.css';

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Logo y redes sociales */}
        <div className="footer-section">
          <Link to="/" className="logo">
          {/* Reemplaza '/logo.png' con la ruta real de tu imagen */}
            <img 
              src="/logo2.png" 
              alt="Manzanares Logo" 
              className="logo-img" 
            />
          </Link>
          <h3>Manzanares S.A.C.</h3>
          <p>RUC N° 20120752601</p>
          <div className="social-footer">
            <a href="https://www.facebook.com/ManzanaresIslay" target="_blank" rel="noopener noreferrer">
              <FaFacebook />
            </a>
            <a href="https://www.tiktok.com/@manzanaressac" target="_blank" rel="noopener noreferrer">
              <FaTiktok />
            </a>
            <a href="https://wa.me/51957833503" target="_blank" rel="noopener noreferrer">
              <FaWhatsapp />
            </a>
          </div>
        </div>

        {/* Información de la tienda */}
        <div className="footer-section">
          <h4>Información</h4>
          <div className="info-item">
            <FaMapMarkerAlt />
            <span>Calle Comercio #632 - Mollendo</span>
          </div>
          <div className="info-item">
            <FaPhone />
            <span>+51 957833503</span>
          </div>
          <div className="info-item">
            <FaEnvelope />
            <span>manzanaresenlinea@gmail.com</span>
          </div>
        </div>

        {/* Enlaces rápidos */}
        <div className="footer-section">
          <h4>Enlaces</h4>
          <nav className="footer-nav">
            <Link to="/ubicanos">Ubicanos</Link>
            <Link to="/terminos">Términos y Condiciones</Link>
            <Link to="/productos">Categorías</Link>
            <Link to="/">Inicio</Link>
          </nav>
        </div>
      </div>

      <div className="footer-bottom">
        <p>Manzanares &copy; 2025 Creado por ATP.</p>
      </div>
    </footer>
  );
}
