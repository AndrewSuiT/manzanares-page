import { useParams, Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { FaStar, FaRegStar } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useCartModal } from '../context/CartModalContext';
import { api } from '../services/api';
import { ProductSlider } from '../components/ProductSlider';
import { LoadingSpinner } from '../components/LoadingSpinner';
import '../styles/ProductDetail.css';

export function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();
  const { showCartModal } = useCartModal();
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [showQtyTooltip, setShowQtyTooltip] = useState(false);
  const MAX_QTY = 2;
  const qtyTooltipRef = useRef(null);

  // Cerrar tooltip al hacer click en cualquier lado
  useEffect(() => {
    if (!showQtyTooltip) return;
    const handler = (e) => {
      if (qtyTooltipRef.current && !qtyTooltipRef.current.contains(e.target)) {
        setShowQtyTooltip(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showQtyTooltip]);

  useEffect(() => {
    loadProduct();
    setQuantity(1);
  }, [id, user]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const data = await api.getProductById(id);
      if (!data) {
        setProduct(null);
        setLoading(false);
        return;
      }
      let favData = [];
      if (user) favData = await api.getFavorites(user.uid);
      const favIds = new Set(favData.map(fav => fav.id));
      setIsFavorite(favIds.has(data.product.id));
      setProduct(data.product);
      setSimilarProducts(data.similar_products || []);
      api.trackEvent('view', id, data.product?.category, user?.uid);
    } catch (error) {
      console.error('Error loading product:', error);
    }
    setLoading(false);
  };

  const handleAddToCart = (itemOrEvent) => {
    let targetProduct = product;
    let targetQty = quantity;
    if (itemOrEvent && itemOrEvent.id) {
      targetProduct = itemOrEvent;
      targetQty = 1;
    }
    if (targetProduct) {
      addToCart(targetProduct, targetQty);
      showCartModal(targetProduct);
      api.trackEvent('add_to_cart', targetProduct.id, targetProduct.category, user?.uid);
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
    setIsFavorite(!previousState);
    try {
      if (previousState) {
        await api.removeFavorite(user.uid, product.id);
        addToast("Eliminado de Favoritos", "info");
      } else {
        await api.addFavorite(user.uid, product);
        addToast("Agregado a Favoritos ⭐", "success");
      }
    } catch (error) {
      console.error("Fallo al guardar favorito:", error);
      setIsFavorite(previousState);
      addToast("No se pudo guardar: " + error.message, "error");
    }
  };

  if (loading) return <LoadingSpinner size="large" text="Cargando producto..." />;
  if (!product) return <div className="error">Producto no encontrado</div>;

  return (
    <div className="product-detail-page">
      <div className="detail-container">

        {/* ── Imagen ── */}
        <div className="detail-image">
          <img
            src={product.image_url}
            alt={product.name}
            onClick={() => setShowImageModal(true)}
          />
          {/* Botón favorito flotante — solo visible en mobile (CSS lo muestra/oculta) */}
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

        {/* ── Panel de información ──
            En DESKTOP: orden natural (título → código → metadata → footer)
            En MOBILE: CSS reordena con `order` para mostrar
                       título → footer(precio+botón) → código → metadata
            sin cambiar el HTML, solo con CSS flex order.             ── */}
        <div className="detail-info">

          {/* Orden natural 1 / Mobile order 1: Título + favorito (desktop) */}
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

          {/* Orden natural 2 / Mobile order 3: Código */}
          <div className="description">
            <p><span className="code-label">Código:</span> {product.code}</p>
          </div>

          {/* Orden natural 3 / Mobile order 4: Metadata (marca, categoría, subcategoría) */}
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

          {/* Orden natural 4 / Mobile order 2: Precio + cantidad + botón
              En mobile sube al tope gracias a `order: 2` en CSS              */}
          <div className="detail-footer">
            <div className="price-section">
              {product.discount_amount > 0 ? (
                <div className="price-with-discount">
                  <span className="price-detail-discount">S/ {Math.round(product.price)}</span>
                  <span className="price-detail-original">S/ {Math.round(product.original_price)}</span>
                  <span className="discount-label">OFERTA</span>
                </div>
              ) : (
                <span className="price-detail">S/ {Math.round(product.price)}</span>
              )}
            </div>

            <div className="quantity-section">
              <label>Cantidad:</label>
              <div className="quantity-control">
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  aria-label="Disminuir cantidad"
                >−</button>
                <span className="qty-value">{quantity}</span>
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => {
                    if (quantity >= MAX_QTY) {
                      setShowQtyTooltip(true);
                      setTimeout(() => setShowQtyTooltip(false), 4000);
                    } else {
                      setQuantity(q => q + 1);
                    }
                  }}
                  aria-label="Aumentar cantidad"
                >+</button>
              </div>
              <div className="qty-info-wrapper" ref={qtyTooltipRef}>
                <button
                  type="button"
                  className="qty-info-btn"
                  onClick={() => setShowQtyTooltip(v => !v)}
                  title="Información sobre el límite de cantidad"
                >ℹ</button>
                {showQtyTooltip && (
                  <div className="qty-tooltip">
                    Si desea más de 2 productos, genere su pedido y al contactar con nosotros mencionelo y editamos su pedido.
                    <button className="qty-tooltip-close" onClick={() => setShowQtyTooltip(false)}>×</button>
                  </div>
                )}
              </div>
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

      {/* ── Descripción + especificaciones ── */}
      <div className="product-details-section">
        <div className="details-column">
          {product.description && (
            <div className="detailed-description">
              <h2>Descripción Detallada</h2>
              {/* Cada oración (separada por ". ") en su propia línea */}
              <div className={`desc-text${showFullDesc ? ' desc-expanded' : ''}`}>
                {product.description
                  .split(/\.\s+/)
                  .filter(s => s.trim().length > 0)
                  .map((sentence, i, arr) => (
                    <span key={i} className="desc-sentence">
                      {sentence.endsWith('.') ? sentence : sentence + (i < arr.length - 1 ? '.' : '')}
                    </span>
                  ))
                }
              </div>
              {/* Botón solo visible en mobile via CSS */}
              <button
                className="ver-mas-btn"
                onClick={() => setShowFullDesc(v => !v)}
              >
                {showFullDesc ? 'Ver menos ▲' : 'Ver más ▼'}
              </button>
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

      {/* ── Productos similares ── */}
      {similarProducts && similarProducts.length > 0 && (
        <ProductSlider
          title={`Productos Similares en ${product.subcategory || product.category}`}
          products={similarProducts}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* ── Modal imagen completa ── */}
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