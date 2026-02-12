import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

import { 
  FaShoppingCart, FaSearch, FaBars, FaUser, 
  FaBoxOpen, FaHeart, FaHistory, FaSignOutAlt,
  FaFacebook, FaWhatsapp, 
  FaTiktok,
  FaTimes 
} from 'react-icons/fa';

import '../styles/Header.css'; 

export function Header() {
  const { getTotalItems } = useCart(); 
  const { user, loginWithGoogle, logout } = useAuth();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/buscar?q=${encodeURIComponent(searchTerm)}`);
      setIsMobileSearchOpen(false);
      setIsMenuOpen(false);
    }
  };

  const toggleMobileSearch = () => {
    setIsMobileSearchOpen(!isMobileSearchOpen);
    if (isMenuOpen) setIsMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="header-container">
        
        {/* --- LOGO --- */}
        <Link to="/" className="logo">
          <img src="/logo3.png" alt="Manzanares Logo" className="logo-img" />
        </Link>

        {/* --- NAVEGACIÓN --- */}
        <nav className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/" onClick={() => setIsMenuOpen(false)}>Inicio</Link>
          <Link to="/productos" onClick={() => setIsMenuOpen(false)}>Catálogo</Link>
          <Link to="/ubicanos" onClick={() => setIsMenuOpen(false)}>Ubícanos</Link>
          <Link to="/terminos" onClick={() => setIsMenuOpen(false)}>Términos</Link> 
        </nav>

        {/* --- BUSCADOR ESCRITORIO --- */}
        <form className="search-desktop" onSubmit={handleSearch}>
          <input 
            type="text" 
            placeholder="Buscar productos..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="search-btn-desktop">
            <FaSearch />
          </button>
        </form>

        {/* --- ACCIONES --- */}
        <div className="header-actions">
          
          <div className="social-links-desktop">
            <a href="https://www.facebook.com/ManzanaresIslay" target="_blank" rel="noreferrer" className="social-icon fb"><FaFacebook /></a>
            <a href="https://www.tiktok.com/@manzanaressac" target="_blank" rel="noreferrer" className="social-icon ig"><FaTiktok /></a>
            <a href="https://wa.me/957833503" target="_blank" rel="noreferrer" className="social-icon wa"><FaWhatsapp /></a>
          </div>

          {/* LUPA MÓVIL */}
          <button 
            className="search-toggle-mobile" 
            onClick={toggleMobileSearch}
            aria-label="Buscar"
          >
            {isMobileSearchOpen ? <FaTimes /> : <FaSearch />}
          </button>

          {/* CARRITO */}
          <Link to="/carrito" className="cart-icon-wrapper">
            <FaShoppingCart className="icon-lg" />
            <span className="cart-count">
                {getTotalItems ? getTotalItems() : 0} 
            </span>
          </Link>

          {/* LOGIN / USER MENU */}
          {user ? (
            <div className="user-menu-container" ref={dropdownRef}>
              <button className="user-trigger" onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>
                <img src={user.photoURL || "https://via.placeholder.com/40"} alt="User" className="user-avatar" />
                <span className="user-name">{user.displayName?.split(' ')[0]}</span>
              </button>
              {isUserMenuOpen && (
                <div className="user-dropdown">
                  <Link to="/perfil" onClick={() => setIsUserMenuOpen(false)}><FaUser /> Mi Cuenta</Link>
                  <Link to="/pedidos" onClick={() => setIsUserMenuOpen(false)}><FaBoxOpen /> Mis Pedidos</Link>
                  <Link to="/favoritos" onClick={() => setIsUserMenuOpen(false)}><FaHeart /> Favoritos</Link>
                  <Link to="/historial" onClick={() => setIsUserMenuOpen(false)}><FaHistory /> Historial</Link>
                  <div className="dropdown-divider"></div>
                  <button onClick={logout} className="logout-item"><FaSignOutAlt /> Cerrar Sesión</button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={loginWithGoogle} className="login-btn">
              <FaUser /> Entrar
            </button>
          )}

          {/* MENÚ HAMBURGUESA */}
          <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <FaBars />
          </button>
        </div>
      </div>

      {/* PANEL BÚSQUEDA MÓVIL */}
      <div className={`search-dropdown-panel ${isMobileSearchOpen ? 'open' : ''}`}>
        <div className="search-panel-inner">
          <form onSubmit={handleSearch} className="search-form-mobile">
            <input
              type="text"
              placeholder="¿Qué estás buscando?"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="search-submit-mobile">
              <FaSearch />
            </button>
          </form>
        </div>
      </div>

    </header>
  );
}