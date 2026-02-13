import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { CategorySidebar } from '../components/CategorySidebar';
import { ProductCard } from '../components/ProductCard';
import { AdvancedFilters } from '../components/AdvancedFilters';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { api } from '../services/api';
import { FaThList, FaFilter, FaTimes } from 'react-icons/fa';
import '../styles/Categories.css';
import '../styles/Home.css';

const ITEMS_PER_PAGE = 30;

export function Categories() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Capturamos el parámetro highlight de la URL
  const highlightParam = searchParams.get('highlight');
  
  const { user } = useAuth();
  const { addToCart } = useCart();
  
  // Extraer parámetros de la URL actual
  const getCategoryFromUrl = (search) => {
    const params = new URLSearchParams(search);
    const urlCategory = params.get('category');
    const urlSubcategory = params.get('subcategory');
    const urlBrand = params.get('brand');

    return {
      category: urlCategory || null,
      subcategory: urlSubcategory || null,
      brand: urlBrand || null
    };
  };

  const [selectedCategory, setSelectedCategory] = useState(() => 
    getCategoryFromUrl(location.search)
  );

  const [originalProducts, setOriginalProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [availableBrands, setAvailableBrands] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [hasMore, setHasMore] = useState(true); 

  const [showCategorySidebar, setShowCategorySidebar] = useState(false);
  const [showFiltersSidebar, setShowFiltersSidebar] = useState(false);

  // Clave para resetear filtros visuales si cambia la categoría base
  const categoryKey = `${selectedCategory.category || 'all'}-${selectedCategory.subcategory || 'none'}`;

  const [activeFilters, setActiveFilters] = useState({
    minPrice: null,
    maxPrice: null,
    sort: 'relevance'
  });

  // EFECTO PRINCIPAL: Escuchar cambios en la URL
  useEffect(() => {
    const newCategory = getCategoryFromUrl(location.search);
    setSelectedCategory(newCategory);
    setShowCategorySidebar(false);
    setShowFiltersSidebar(false);
    
    // Al cambiar la URL, cargamos productos y marcas
    loadInitialProducts(newCategory);
    loadAvailableBrands(newCategory);
  }, [location.search, user]); 

  // Carga inicial de productos
  const loadInitialProducts = async (params, currentFilters = activeFilters) => {
    console.log('📥 loadInitialProducts - Parámetros:', { params, currentFilters });
    setLoading(true);
    setOriginalProducts([]);
    setDisplayedProducts([]); 
    setHasMore(true);
    
    try {
      const { category, subcategory, brand } = params;
      
      // Construimos los filtros incluyendo highlight (si existe en la URL actual)
      const filtersToSend = {
        ...currentFilters,
        highlight: highlightParam
      };

      // Llamada API con los filtros completos
      const data = await api.getProducts(
        ITEMS_PER_PAGE, 
        category, 
        subcategory, 
        null, 
        brand,
        filtersToSend
      );
      
      if (data.length < ITEMS_PER_PAGE) setHasMore(false);

      let favData = [];
      if (user) {
        favData = await api.getFavorites(user.uid);
      }
      setFavorites(favData);

      const favIds = new Set(favData.map(fav => fav.id));
      const enrichedData = (data || []).map(product => ({
        ...product,
        isFavorite: favIds.has(product.id)
      }));

      setOriginalProducts(enrichedData);
      setDisplayedProducts(enrichedData);
    } catch (error) {
      console.error('Error cargando productos:', error);
      setHasMore(false);
    }
    setLoading(false);
  };

  // Cargar marcas disponibles
  const loadAvailableBrands = async (params) => {
    try {
      const { category, subcategory } = params;
      const brands = await api.getBrands(category, subcategory);
      setAvailableBrands(brands || []);
    } catch (error) {
      console.error('Error cargando marcas:', error);
      setAvailableBrands([]);
    }
  };

  // ✅ CORRECCIÓN: AL CARGAR MÁS, QUITAMOS EL HIGHLIGHT
  const handleLoadMore = async () => {
    if (originalProducts.length === 0 || !hasMore) return;
    setLoadingMore(true);
    const lastProduct = originalProducts[originalProducts.length - 1];
    
    try {
      const { category, subcategory, brand } = selectedCategory;
      
      // Forzamos highlight: null para que la paginación sea natural
      const filtersToSend = {
        ...activeFilters,
        highlight: null 
      };

      const newData = await api.getProducts(
        ITEMS_PER_PAGE, 
        category, 
        subcategory, 
        lastProduct.id,
        brand,
        filtersToSend
      );

      if (newData.length < ITEMS_PER_PAGE) setHasMore(false);

      const favIds = new Set(favorites.map(fav => fav.id));
      const enrichedNewData = (newData || []).map(product => ({
        ...product,
        isFavorite: favIds.has(product.id)
      }));

      setOriginalProducts(prev => [...prev, ...enrichedNewData]);
      setDisplayedProducts(prev => [...prev, ...enrichedNewData]); 
    } catch (error) {
      setHasMore(false);
    }
    setLoadingMore(false);
  };

  const handleSelectCategory = (categoryInfo) => {
    const params = new URLSearchParams();
    if (categoryInfo.parentCategory) params.set('category', categoryInfo.parentCategory);
    if (categoryInfo.categoryName) params.set('subcategory', categoryInfo.categoryName);
    
    // Al cambiar categoría, se crea una URL nueva limpia (sin highlight)
    navigate(`/productos?${params.toString()}`);
  };

  // ✅ CORRECCIÓN: AL CAMBIAR MARCA, QUITAMOS EL HIGHLIGHT DE LA URL
  const handleBrandChange = (brand) => {
    const newParams = new URLSearchParams(searchParams);
    if (brand) {
      newParams.set('brand', brand);
    } else {
      newParams.delete('brand');
    }
    
    // Eliminamos el parámetro highlight para limpiar la URL
    newParams.delete('highlight');
    
    setSearchParams(newParams);
  };

  // ✅ CORRECCIÓN: AL FILTRAR PRECIO/ORDEN, QUITAMOS EL HIGHLIGHT
  const handleServerFilterChange = (newFilters) => {
    const updatedFilters = { ...activeFilters, ...newFilters };
    setActiveFilters(updatedFilters);
    
    // Si existe highlight, lo eliminamos de la URL y dejamos que el useEffect recargue
    if (highlightParam) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('highlight');
      setSearchParams(newParams);
      // El useEffect detectará el cambio de URL y recargará los productos sin highlight
    } else {
      // Si no hay highlight que limpiar, recargamos manualmente
      loadInitialProducts(selectedCategory, updatedFilters);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    api.trackEvent('add_to_cart', product.id, product.category, user?.uid);
  };

  const handleOverlayClick = () => {
    setShowCategorySidebar(false);
    setShowFiltersSidebar(false);
  };

  return (
    <div className="categories-page">
      <div className="categories-layout">
        <aside className="left-sidebar">
          <CategorySidebar onSelectCategory={handleSelectCategory} />
        </aside>

        <main className="center-content">
          <div className="main-header">
            <h1>
              <span className="category-path">
                {selectedCategory.category 
                  ? (selectedCategory.subcategory 
                      ? `${selectedCategory.category} > ${selectedCategory.subcategory}` 
                      : selectedCategory.category) 
                  : 'Catálogo Completo'}
              </span>

              {selectedCategory.brand && (
                <>
                  <span className="title-separator">•</span>
                  <span className="brand-highlight">{selectedCategory.brand}</span>
                </>
              )}
            </h1>

            <p className="results-count">
              Mostrando {displayedProducts.length} productos
            </p>
          </div>

          {loading && originalProducts.length === 0 ? (
            <LoadingSpinner size="medium" text="Cargando catálogo..." />
          ) : (
            <>
              {displayedProducts.length === 0 ? (
                <div className="no-products">
                  <p>No se encontraron productos.</p>
                </div>
              ) : (
                <div className="products-grid-home">
                  {displayedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>
              )}

              {displayedProducts.length > 0 && hasMore && (
                <div className="load-more-section">
                  {loadingMore ? (
                    <LoadingSpinner size="small" text="Cargando más..." />
                  ) : (
                    <button className="load-more-btn" onClick={handleLoadMore}>
                      Ver más productos
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </main>

        <aside className="right-sidebar">
          <AdvancedFilters 
            products={originalProducts} 
            onBrandChange={handleBrandChange}
            availableBrands={availableBrands} 
            selectedBrand={selectedCategory.brand}
            categoryKey={categoryKey} 
            onServerFilterChange={handleServerFilterChange} 
            initialFilters={activeFilters}
          />
        </aside>
      </div>

      <div className="mobile-filter-buttons">
        <button className="mobile-btn" onClick={() => setShowCategorySidebar(true)}>
          <FaThList /> Categorías
        </button>
        <button className="mobile-btn" onClick={() => setShowFiltersSidebar(true)}>
          <FaFilter /> Filtros
        </button>
      </div>

      <div 
        className={`mobile-sidebar-overlay ${showCategorySidebar ? 'active' : ''}`}
        onClick={handleOverlayClick}
      >
        <div className={`mobile-sidebar-panel left ${showCategorySidebar ? 'active' : ''}`}>
          <div className="mobile-sidebar-header">
            <h3>Categorías</h3>
            <button className="close-sidebar-btn" onClick={() => setShowCategorySidebar(false)}>
              <FaTimes />
            </button>
          </div>
          <div className="mobile-sidebar-content">
            <CategorySidebar onSelectCategory={handleSelectCategory} isMobileOverlay={true} />
          </div>
        </div>
      </div>

      <div 
        className={`mobile-sidebar-overlay ${showFiltersSidebar ? 'active' : ''}`}
        onClick={handleOverlayClick}
      >
        <div className={`mobile-sidebar-panel right ${showFiltersSidebar ? 'active' : ''}`}>
          <div className="mobile-sidebar-header">
            <h3>Filtros</h3>
            <button className="close-sidebar-btn" onClick={() => setShowFiltersSidebar(false)}>
              <FaTimes />
            </button>
          </div>
          <div className="mobile-sidebar-content">
            <AdvancedFilters 
              products={originalProducts} 
              onBrandChange={handleBrandChange}
              availableBrands={availableBrands}
              selectedBrand={selectedCategory.brand}
              categoryKey={categoryKey}
              onServerFilterChange={handleServerFilterChange} 
              initialFilters={activeFilters}
            />
          </div>
        </div>
      </div>
    </div>
  );
}