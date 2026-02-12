import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ProductCard } from '../components/ProductCard';
import { api } from '../services/api';
import { Link } from 'react-router-dom';
import '../styles/Categories.css';

export function History() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadHistory();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadHistory = async () => {
    setLoading(true);
    try {

      const data = await api.getRecentlyViewed(user.uid);
      
      setProducts(data);
    } catch (error) {
      console.error("Error cargando historial:", error);
    }
    setLoading(false);
  };

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  if (!user) {
    return (
      <div className="no-results" style={{margin: '2rem'}}>
        <h2>Inicia sesión para ver tu historial</h2>
      </div>
    );
  }

  return (
    <div className="categories-page">
      <div className="full-width-layout">
        <div className="center-content">
          <div className="search-header">
            <h1>Historial de Navegación 👀</h1>
            <p className="search-subtitle">Lo que has visto recientemente</p>
          </div>

          {loading ? (
            <div className="loading">Cargando historial...</div>
          ) : products.length === 0 ? (
            <div className="no-results">
              <h2>No hay historial reciente</h2>
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