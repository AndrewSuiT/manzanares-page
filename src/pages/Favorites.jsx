import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ProductCard } from '../components/ProductCard';
import { api } from '../services/api';
import { Link } from 'react-router-dom';
import '../styles/Categories.css'; // Reusamos estilos de grilla

export function Favorites() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadFavorites();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const data = await api.getFavorites(user.uid);
      // Marcar todos los favoritos como isFavorite: true
      const enrichedData = data.map(product => ({
        ...product,
        isFavorite: true
      }));
      setProducts(enrichedData);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  if (!user) {
    return (
      <div className="no-results" style={{margin: '2rem'}}>
        <h2>Inicia sesión para ver tus favoritos</h2>
        <Link to="/" style={{color: '#667eea'}}>Ir al inicio</Link>
      </div>
    );
  }

  return (
    <div className="categories-page">
      <div className="full-width-layout">
        <div className="center-content">
          <div className="search-header">
            <h1>Mis Favoritos ❤️</h1>
            <p className="search-subtitle">Todos los productos que te encantan</p>
          </div>

          {loading ? (
            <div className="loading">Cargando favoritos...</div>
          ) : products.length === 0 ? (
            <div className="no-results">
              <h2>Aún no tienes favoritos</h2>
              <p>Dale click al corazón en los productos que te gusten.</p>
              <Link to="/productos" className="pagination-btn" style={{display:'inline-block', marginTop:'1rem', textDecoration:'none'}}>
                Explorar Catálogo
              </Link>
            </div>
          ) : (
            <div className="products-grid-home">
              {products.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onAddToCart={handleAddToCart} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}