import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FaStar, FaRegStar } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { ProductSlider } from '../components/ProductSlider';
import { LoadingSpinner } from '../components/LoadingSpinner';
import '../styles/ProductDetail.css';

export function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    loadProduct();
    // Reiniciar cantidad al cambiar de producto
    setQuantity(1);
  }, [id, user]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      // CORRECCIÓN: Usar el nombre real de la función en api.js
      const data = await api.getProductById(id);

      if (!data) {
        setProduct(null);
        setLoading(false);
        return;
      }

      // Cargar favoritos si hay usuario
      let favData = [];
      if (user) {
        favData = await api.getFavorites(user.uid);
      }
      const favIds = new Set(favData.map(fav => fav.id));
      setIsFavorite(favIds.has(data.product.id));
      
      setProduct(data.product);
      setSimilarProducts(data.similar_products || []);
      
      // Tracking de vista
      api.trackEvent('view', id, data.product?.category, user?.uid);

    } catch (error) {
      console.error('Error loading product:', error);
    }
    setLoading(false);
  };

  const handleAddToCart = (itemOrEvent) => {
    let targetProduct = product;
    let targetQty = quantity;

    // Si viene del Slider (es un objeto producto con ID)
    if (itemOrEvent && itemOrEvent.id) {
      targetProduct = itemOrEvent;
      targetQty = 1; // En el slider siempre agregamos 1
    }
    
    if (targetProduct) {
      addToCart(targetProduct, targetQty);
      addToast(`¡${targetProduct.name} agregado al carrito!`, 'success');
      api.trackEvent('add_to_cart', targetProduct.id, targetProduct.category, user?.uid);
      console.log(`Agregando ${targetQty} unidades de ${targetProduct.name}`);
    }
  };

  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      addToast("Inicia sesión para guardar favoritos", "info");
      return;
    }

    const previousState = isFavorite; 
    setIsFavorite(!previousState); // 1. Cambio visual optimista (inmediato)

    try {
      if (previousState) {
        await api.removeFavorite(user.uid, product.id);
        addToast("Eliminado de Favoritos", "info");
      } else {
        await api.addFavorite(user.uid, product);
        addToast("Agregado a Favoritos ⭐", "success");
      }
    } catch (error) {
      // 2. SI FALLA: Revertimos el cambio visual
      console.error("Fallo al guardar favorito:", error);
      setIsFavorite(previousState); // <--- ESTO ES CLAVE
      addToast("No se pudo guardar: " + error.message, "error");
    }
  };

  if (loading) return <LoadingSpinner size="large" text="Cargando producto..." />;
  if (!product) return <div className="error">Producto no encontrado</div>;

  return (
    <div className="product-detail-page">
      <div className="detail-container">
        {/* Imagen del producto */}
        <div className="detail-image">
          <img 
            src={product.image_url} 
            alt={product.name}
            onClick={() => setShowImageModal(true)}
            style={{ cursor: 'pointer' }}
          />
          {/* Botón favorito dentro de la imagen para posicionamiento en mobile */}
          <div className="product-title-with-favorite">
            <button
              type="button"
              className={`favorite-btn-detail ${isFavorite ? 'active' : ''}`}
              onClick={handleToggleFavorite}
              title={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
            >
              {isFavorite ? <FaStar /> : <FaRegStar />}
              <span className="favorite-text">Agregar a Favoritos</span>
            </button>
          </div>
        </div>

        {/* Información del producto */}
        <div className="detail-info">
          <div className="product-title-with-favorite">
            <h1 title={product.name}>{product.name}</h1>
            <button
              type="button"
              className={`favorite-btn-detail ${isFavorite ? 'active' : ''}`}
              onClick={handleToggleFavorite}
              title={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
            >
              {isFavorite ? <FaStar /> : <FaRegStar />}
              <span className="favorite-text">Agregar a Favoritos</span>
            </button>
          </div>

          {/* Descripción breve */}
          <div className="description">
            <p>{product.code}</p>
          </div>

          {/* Marca, Categoría y Subcategoría */}
          <div className="product-metadata">
            {product.marca && product.marca !== 'Sin marca' && (
              <div className="metadata-item">
                <span className="metadata-label">Marca:</span>
                <span className="metadata-value">{product.marca}</span>
              </div>
            )}
            <div className="metadata-item">
              <span className="metadata-label">Categoría:</span>
              <span className="metadata-value">{product.category}</span>
            </div>
            {product.subcategory && (
              <div className="metadata-item">
                <span className="metadata-label">Subcategoría:</span>
                <span className="metadata-value">{product.subcategory}</span>
              </div>
            )}
          </div>

          {/* Precio y Cantidad */}
          <div className="detail-footer">
            <div className="price-section">
              {product.discount_amount > 0 ? (
                <div className="price-with-discount">
                  <span className="price-detail-discount">S/ {Math.round(product.price)}</span>
                  <span className="price-detail-original">S/ {Math.round(product.original_price)}</span>
                  <span className="discount-label">OFERTA</span>
                </div>
              ) : (
                /* Precio normal */
                <span className="price-detail">S/ {Math.round(product.price)}</span>
              )}
            </div>

            <div className="quantity-section">
              <label>Cantidad:</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              />
            </div>

            <button
              className="add-to-cart"
              onClick={handleAddToCart} 
              disabled={product.stock === 0}
            >
              {product.stock > 0 ? 'Agregar al Carrito' : 'Agotado'}
            </button>
          </div>
        </div>
      </div>

      {/* Descripción detallada y Especificaciones en dos columnas */}
      <div className="product-details-section">
        <div className="details-column">
          {product.description && (
            <div className="detailed-description">
              <h2>Descripción Detallada</h2>
              <p>{product.description}</p>
            </div>
          )}
        </div>

        <div className="details-column">
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="specifications">
              <h2>Especificaciones</h2>
              <ul>
                {Object.entries(product.specifications).map(([key, value]) => (
                  <li key={key}>
                    <strong>{key}:</strong> {value}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Productos similares por subcategoría */}
      {similarProducts && similarProducts.length > 0 && (
        <ProductSlider
          title={`Productos Similares en ${product.subcategory || product.category}`}
          products={similarProducts}
          onAddToCart={handleAddToCart} 
        />
      )}

      {/* Modal para ver imagen completa */}
      {showImageModal && (
        <div className="image-modal" onClick={() => setShowImageModal(false)}>
          <div className="modal-content">
            <img src={product.image_url} alt={product.name} />
            <button className="close-modal" onClick={() => setShowImageModal(false)}>×</button>
          </div>
        </div>
      )}
    </div>
  );
}