import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaBolt, FaFire, FaStar, FaRegStar } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import '../styles/FeaturedDeals.css';

function DealCard({ product, onAddToCart, initialFavorite }) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [isFavorite, setIsFavorite] = useState(initialFavorite || product?.isFavorite || false);

  const hasDiscount = product.discount_percent > 0 || product.discount_amount > 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
      addToast(`¡${product.name} agregado al carrito!`, 'success');
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
    <Link to={`/producto/${product.id}`} className="deal-card">
      <div className="deal-card-glow" />

      {hasDiscount && (
        <div className="deal-badge">
          <FaBolt className="deal-badge-icon" />
          {product.discount_percent > 0
            ? `${Math.round(product.discount_percent)}% OFF`
            : 'OFERTA'}
        </div>
      )}

      {/* Botón Favorito */}
      <button
        type="button"
        className={`deal-favorite-btn ${isFavorite ? 'active' : ''}`}
        onClick={handleToggleFavorite}
        title={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
      >
        {isFavorite ? <FaStar /> : <FaRegStar />}
      </button>

      <div className="deal-image-wrap">
        <img
          src={product.image_url || 'https://placehold.co/300x300?text=Sin+Imagen'}
          alt={product.name}
          className="deal-image"
          loading="lazy"
          onError={(e) => { e.target.src = 'https://placehold.co/300x300?text=Sin+Imagen'; }}
        />
        {product.stock === 0 && (
          <div className="deal-out-of-stock">Agotado</div>
        )}
      </div>

      <div className="deal-info">
        <p className="deal-category">{product.category}</p>
        <h3 className="deal-name">{product.name}</h3>

        <div className="deal-pricing">
          {hasDiscount ? (
            <>
              <span className="deal-price-now">S/ {Math.round(product.price)}</span>
              <span className="deal-price-was">
                S/ {Math.round(product.original_price || product.price)}
              </span>
            </>
          ) : (
            <span className="deal-price-now">S/ {Math.round(product.price)}</span>
          )}
        </div>
      </div>

      <button
        type="button"
        className="deal-cart-btn"
        onClick={handleAddToCart}
        disabled={product.stock === 0}
        aria-label="Agregar al carrito"
      >
        <FaShoppingCart />
        <span>Agregar</span>
      </button>
    </Link>
  );
}

export function FeaturedDeals({ deals, onAddToCart, userFavoriteIds = new Set() }) {
  if (!deals || !deals.active || !deals.products || deals.products.length === 0) {
    return null;
  }

  return (
    <section className="featured-deals">
      <div className="deals-bg-grid" aria-hidden="true" />

      <div className="deals-header">
        <div className="deals-title-group">
          <FaFire className="deals-fire-icon" />
          <h2 className="deals-title">{deals.title || 'Productos en Oferta'}</h2>
          <FaFire className="deals-fire-icon" />
        </div>
        <p className="deals-subtitle">Precios increíbles por tiempo limitado</p>
        <div className="deals-title-bar" />
      </div>

      <div
        className="deals-grid"
        style={{ '--card-count': deals.products.length }}
      >
        {deals.products.map((product) => (
          <DealCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            initialFavorite={userFavoriteIds.has(product.id)}
          />
        ))}
      </div>
    </section>
  );
}