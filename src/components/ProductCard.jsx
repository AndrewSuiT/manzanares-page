import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { FaShoppingCart, FaStar, FaRegStar, FaWhatsapp } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useCartModal } from '../context/CartModalContext';
import { api } from '../services/api';
import '../styles/ProductCard.css';

// ── Helpers de stock ────────────────────────────────────────────────────────
const needsConsultation = (product) =>
  !product.stock_verified && product.stock >= 1 && product.stock <= 2;

const getWhatsAppUrl = (product) => {
  const msg =
    `Hola! Quisiera consultar si el siguiente producto está disponible para compra:\n\n` +
    `Código: ${product.code || product.id}\n` +
    `Producto: ${product.name}\n` +
    `\n¿Está disponible para comprar?`;
  return `https://wa.me/51957833503?text=${encodeURIComponent(msg)}`;
};
// ───────────────────────────────────────────────────────────────────────────

export function ProductCard({ product, onAddToCart }) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { showCartModal } = useCartModal();
  const [isFavorite, setIsFavorite] = useState(product?.isFavorite || false);
  const [imageSrc, setImageSrc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const imgRef = useRef(null);

  const outOfStock     = product.stock === 0;
  const consultar      = needsConsultation(product);
  const whatsappUrl    = getWhatsAppUrl(product);

  const getOptimizedUrl = (url) => {
    if (!url) return 'https://placehold.co/300x300?text=Sin+Imagen';
    if (!url.includes('imgur.com')) return url;
    try {
      const fileName = url.split('/').pop();
      return `https://ik.imagekit.io/f8gpta6bw/${fileName}?tr=w-320,f-auto`;
    } catch (e) {
      return url;
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const container = entry.target;
          const originalSrc = container.dataset.src;
          const optimizedSrc = getOptimizedUrl(originalSrc);

          const tempImg = new Image();
          tempImg.onload = () => { setImageSrc(optimizedSrc); setIsLoading(false); };
          tempImg.onerror = () => { setImageSrc(originalSrc); setIsLoading(false); };
          tempImg.src = optimizedSrc;
          observer.unobserve(container);
        }
      });
    }, { rootMargin: '200px', threshold: 0.01 });

    if (imgRef.current) observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, []);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
      showCartModal(product);
    }
  };

  const handleToggleFavorite = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!user) {
      addToast("Debes iniciar sesión para guardar favoritos", "error");
      return;
    }
    const newState = !isFavorite;
    setIsFavorite(newState);
    addToast(newState ? "Agregado a Favoritos ⭐" : "Eliminado de Favoritos", newState ? "success" : "info");
    try {
      const result = await api.toggleFavorite(user.uid, product.id);
      if (!result) setIsFavorite(!newState);
    } catch (error) {
      setIsFavorite(!newState);
      addToast("Error al conectar con el servidor", "error");
    }
  };

  return (
    <div className="product-card">
      <Link to={`/producto/${product.id}`} className="product-card-link">
        <div className="product-image-container">
          <div
            className="image-placeholder"
            ref={imgRef}
            data-src={product.image_url || 'https://via.placeholder.com/200x200?text=Sin+imagen'}
          >
            {imageSrc && (
              <img
                src={imageSrc}
                alt={product.name}
                className="product-image"
                decoding="async"
                loading="lazy"
              />
            )}
            {isLoading && <div className="image-skeleton"></div>}
          </div>

          {outOfStock && <div className="out-of-stock">Agotado</div>}

          <div className="product-overlay">
            {outOfStock ? (
              /* Agotado — botón deshabilitado */
              <button type="button" className="add-to-cart-btn" disabled>
                <FaShoppingCart /> <span className="btn-text">Agotado</span>
              </button>
            ) : consultar ? (
              /* Consultar stock — abre WhatsApp */
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="add-to-cart-btn whatsapp-overlay-btn"
                onClick={(e) => e.stopPropagation()}
              >
                <FaWhatsapp />
                <span className="btn-text">Consultar Stock</span>
              </a>
            ) : (
              /* Normal — agregar al carrito */
              <button
                type="button"
                className="add-to-cart-btn"
                onClick={handleAddToCart}
              >
                <FaShoppingCart /> <span className="btn-text">Agregar</span>
              </button>
            )}
          </div>
        </div>

        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          <p className="product-category">{product.category}</p>

          {product.tags && product.tags.length > 0 && (
            <div className="product-tags">
              {product.tags.map((tag, idx) => (
                <span key={idx} className="tag-card">{tag}</span>
              ))}
            </div>
          )}

          <div className="product-price">
            {product.discount_amount > 0 ? (
              <>
                <div className="price-row">
                  <span className="price-discount">S/ {Math.round(product.price)}</span>
                  <span className="discount-badge">Oferta</span>
                </div>
                <span className="price-original">
                  S/ {product.original_price ? Math.round(product.original_price) : Math.round(product.price)}
                </span>
              </>
            ) : (
              <span className="price">S/ {Math.round(product.price)}</span>
            )}
          </div>
        </div>
      </Link>

      <button
        type="button"
        className={`favorite-btn ${isFavorite ? 'active' : ''}`}
        onClick={handleToggleFavorite}
        title={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
      >
        {isFavorite ? <FaStar /> : <FaRegStar />}
      </button>
    </div>
  );
}