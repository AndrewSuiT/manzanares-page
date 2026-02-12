import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ProductCard } from '../components/ProductCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { api } from '../services/api';
import '../styles/Search.css';

const ITEMS_PER_PAGE = 30;

export function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('relevancia');
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    loadSearchResults();
    setCurrentPage(1);
  }, [query]);

  const loadSearchResults = async () => {
    if (!query.trim()) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await api.searchProducts(query);

      // Cargar favoritos si hay usuario
      let favData = [];
      if (user) {
        favData = await api.getFavorites(user.uid);
      }
      setFavorites(favData);

      // Enriquecer productos con información de favoritos
      const favIds = new Set(favData.map(fav => fav.id));
      const enrichedData = data.map(product => ({
        ...product,
        isFavorite: favIds.has(product.id)
      }));

      setProducts(enrichedData);
    } catch (error) {
      console.error('Error searching:', error);
    }
    setLoading(false);
  };

  const handleAddToCart = (product) => {
    addToCart(product); 
    api.trackEvent('add_to_cart', product.id, product.category, user?.uid);
  };

  const handleSort = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  const sortedProducts = () => {
    const productsArray = [...products];
    switch (sortBy) {
      case 'precio-asc':
        return productsArray.sort((a, b) => (a.price || 0) - (b.price || 0));
      case 'precio-desc':
        return productsArray.sort((a, b) => (b.price || 0) - (a.price || 0));
      case 'popularidad':
        return productsArray.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'relevancia':
      default:
        return productsArray;
    }
  };

  const sortedFilteredProducts = sortedProducts();
  const totalPages = Math.ceil(sortedFilteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = sortedFilteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="search-page">
      <div className="search-container">
        {/* Cabecera de Búsqueda */}
        <div className="search-header">
          <h1>Resultados de búsqueda</h1>
          {query && <p className="search-subtitle">Para: "<strong>{query}</strong>"</p>}
        </div>

        {loading ? (
          <LoadingSpinner size="medium" text="Buscando productos..." />
        ) : sortedFilteredProducts.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h2>No encontramos coincidencias</h2>
            <p>Intenta con palabras más generales o verifica la ortografía.</p>
          </div>
        ) : (
          <>
            {/* Barra de Herramientas (Toolbar) */}
            <div className="search-toolbar">
              <div className="results-count">
                Encontrados: <strong>{sortedFilteredProducts.length}</strong> productos
              </div>
              
              <div className="sort-wrapper">
                <label htmlFor="sort-select">Ordenar:</label>
                <select id="sort-select" value={sortBy} onChange={handleSort}>
                  <option value="relevancia">Relevancia</option>
                  <option value="precio-asc">Menor Precio</option>
                  <option value="precio-desc">Mayor Precio</option>
                  <option value="popularidad">Más Populares</option>
                </select>
              </div>
            </div>

            {/* Grilla de Productos */}
            <div className="products-grid-home">
              {paginatedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  ← Anterior
                </button>
                <span className="pagination-info">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}