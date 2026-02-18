import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaEye, FaTrophy } from 'react-icons/fa';
import { Carousel } from '../components/Carousel';
import { CategorySidebar } from '../components/CategorySidebar';
import { ProductCard } from '../components/ProductCard';
import { ProductSlider } from '../components/ProductSlider';
import { SplashScreen } from '../components/SplashScreen';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { FeaturedDeals } from '../components/FeaturedDeals';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import '../styles/Home.css';

export function Home() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // --- ESTADOS INDEPENDIENTES ---
  const [promotions, setPromotions] = useState([]);
  const [promosLoading, setPromosLoading] = useState(true);

  // Featured Deals (Productos en Oferta)
  const [featuredDeals, setFeaturedDeals] = useState(null);
  const [dealsLoading, setDealsLoading] = useState(true);

  // Estados de carga separados para percepción de velocidad
  const [products, setProducts] = useState([]);
  const [recsLoading, setRecsLoading] = useState(true); // Solo para recomendaciones

  const [favorites, setFavorites] = useState([]);
  const [favsLoading, setFavsLoading] = useState(false); // Carga independiente de favoritos

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false); // Carga independiente de historial

  // Control de Splash Screen (solo primera vez)
  const [isFirstLoad, setIsFirstLoad] = useState(() => {
    return sessionStorage.getItem('app_first_load_completed') !== 'true';
  });

  // Refs para evitar doble fetching en React StrictMode
  const promosLoaded = useRef(false);
  const productsLoaded = useRef(false);
  const dealsLoaded = useRef(false);


  // 1. CARGA RÁPIDA: Promociones (Carousel)
  useEffect(() => {
    if (promosLoaded.current) return;
    promosLoaded.current = true;

    const loadPromos = async () => {
      try {
        const data = await api.getPromotions();
        setPromotions(data);
      } catch (error) {
        console.error('Error loading promotions:', error);
      } finally {
        setPromosLoading(false);
      }
    };
    loadPromos();
  }, []);

  // 1b. CARGA RÁPIDA: Productos en Oferta (Destacados desde Firebase)
  useEffect(() => {
    if (dealsLoaded.current) return;
    dealsLoaded.current = true;

    const loadDeals = async () => {
      try {
        const data = await api.getFeaturedDeals();
        setFeaturedDeals(data);
      } catch (error) {
        console.error('Error loading featured deals:', error);
        setFeaturedDeals({ active: false });
      } finally {
        setDealsLoading(false);
      }
    };
    loadDeals();
  }, []);

  // 2. CARGA PESADA: Productos, Favoritos, Historial (PARALELO E INDEPENDIENTE)
  useEffect(() => {
    if (authLoading) return;
    if (productsLoaded.current) return;
    productsLoaded.current = true;

    const userId = user ? user.uid : null;

    // A. CARGA DE DATOS DE USUARIO (Favoritos e Historial)
    if (userId) {
      // 1. Favoritos: Carga independiente
      setFavsLoading(true);
      api.getFavorites(userId)
        .then((data) => {
          // Procesamos los datos para marcar 'isFavorite'
          const enriched = data.map(p => ({ ...p, isFavorite: true }));
          setFavorites(enriched);
        })
        .catch((e) => console.error("Error cargando favoritos:", e))
        .finally(() => setFavsLoading(false)); // Se libera independientemente

      // 2. Historial: Carga independiente
      setHistoryLoading(true);
      api.getRecentlyViewed(userId)
        .then((data) => setHistory(data))
        .catch((e) => console.error("Error cargando historial:", e))
        .finally(() => setHistoryLoading(false)); // Se libera independientemente
    }

    // B. CARGA DE RECOMENDACIONES (General)
    const loadRecs = async () => {
      try {
        setRecsLoading(true); // Aseguramos que el spinner de productos se active
        const data = await api.getHomeRecommendations(userId);
        setProducts(data);
      } catch (error) {
        console.error('Error loading recommendations:', error);
      } finally {
        setRecsLoading(false); // Solo apaga el spinner de la grilla principal

        // Manejo del Splash Screen (Se quita cuando carga lo principal)
        if (isFirstLoad) {
          setTimeout(() => {
            setIsFirstLoad(false);
            sessionStorage.setItem('app_first_load_completed', 'true');
          }, 1000);
        }
      }
    };

    loadRecs();

  }, [authLoading, user, isFirstLoad]);

  const handleSelectCategory = (category) => {
    if (category) {
      if (category.parentCategory && category.categoryName) {
        navigate(`/productos?category=${encodeURIComponent(category.parentCategory)}&subcategory=${encodeURIComponent(category.categoryName)}`);
      } else if (category.parentCategory) {
        navigate(`/productos?category=${encodeURIComponent(category.parentCategory)}`);
      } else {
        navigate(`/productos?category=${encodeURIComponent(category.categoryName || '')}`);
      }
    } else {
      navigate('/productos');
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    api.trackEvent('add_to_cart', product.id, product.category, user?.uid);
  };

  return (
    <>
      <SplashScreen isVisible={isFirstLoad} />

      <div className="home">
        <Carousel images={promotions} />

        <section className="home-content">
          <div className="sidebar-products">
            <CategorySidebar onSelectCategory={handleSelectCategory} />

            <div className="products-section">

              {/* --- PRODUCTOS EN OFERTA (Arriba de todo, para usuarios no logueados o antes de favoritos) --- */}
              {/* Para usuarios NO logueados: aparece justo encima de Productos Destacados */}
              {/* Para usuarios logueados: aparece antes de Favoritos */}
              {!dealsLoading && (
                <FeaturedDeals
                  deals={featuredDeals}
                  onAddToCart={handleAddToCart}
                  userFavoriteIds={new Set(favorites.map(f => f.id))}
                />
              )}

              {/* --- FAVORITOS (Se muestran apenas carguen SU propia data) --- */}
              {!favsLoading && user && favorites.length > 0 && (
                <ProductSlider
                  title={
                    <span className="section-title-styled favorites-title">
                      <FaStar className="section-title-icon star-icon" />
                      Tus Favoritos
                    </span>
                  }
                  products={favorites}
                  viewAllLink="/favoritos"
                  onAddToCart={handleAddToCart}
                />
              )}

              {/* --- HISTORIAL (Se muestran apenas carguen SU propia data) --- */}
              {!historyLoading && user && history.length > 0 && (
                <ProductSlider
                  title={
                    <span className="section-title-styled history-title">
                      <FaEye className="section-title-icon eye-icon" />
                      Vistos Recientemente
                    </span>
                  }
                  products={history}
                  viewAllLink="/historial"
                  onAddToCart={handleAddToCart}
                />
              )}

              {/* --- PRODUCTOS DESTACADOS --- */}
              <div className="section-header">
                <div className="section-title-styled featured-title">
                  <FaTrophy className="section-title-icon trophy-icon" />
                  <h2>Productos Destacados</h2>
                </div>
                <p className="section-subtitle">Explora nuestras recomendaciones para ti</p>
              </div>

              {/* Spinner SOLO afecta a esta sección ahora */}
              {recsLoading ? (
                <div style={{ padding: '40px', display: 'flex', justifyContent: 'center' }}>
                  <LoadingSpinner size="medium" text="Buscando las mejores ofertas..." />
                </div>
              ) : products.length > 0 ? (
                <div className="products-grid-home">
                  {products.slice(0, 12).map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>
              ) : (
                <div className="no-products">
                  <p>No hay productos disponibles</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}