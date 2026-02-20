import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaArrowRight, FaCheck, FaTimes } from 'react-icons/fa';
import { useCartModal } from '../context/CartModalContext';
import '../styles/CartAddedModal.css';

export function CartAddedModal() {
  const { modalData, isVisible, closeModal } = useCartModal();
  const navigate = useNavigate();
  const progressRef = useRef(null);

  useEffect(() => {
    if (isVisible && progressRef.current) {
      progressRef.current.style.animation = 'none';
      void progressRef.current.offsetWidth; // reflow
      progressRef.current.style.animation = 'progressBar 6s linear forwards';
    }
  }, [isVisible, modalData]);

  const handleGoToCart = () => {
    closeModal();
    navigate('/carrito');
  };

  const handleContinue = () => {
    closeModal();
  };

  if (!modalData) return null;

  return (
    <>
      {/* Overlay transparente para cerrar al hacer click afuera */}
      <div
        className={`cart-modal-overlay ${isVisible ? 'visible' : ''}`}
        onClick={closeModal}
      />

      <div className={`cart-added-modal ${isVisible ? 'modal-enter' : 'modal-exit'}`}>
        {/* Barra de progreso */}
        <div className="cart-modal-progress">
          <div className="cart-modal-progress-bar" ref={progressRef} />
        </div>

        {/* Encabezado */}
        <div className="cart-modal-header">
          <div className="cart-modal-check">
            <FaCheck />
          </div>
          <span className="cart-modal-title">¡Agregado al carrito!</span>
          <button className="cart-modal-close" onClick={closeModal} aria-label="Cerrar">
            <FaTimes />
          </button>
        </div>

        {/* Contenido del producto */}
        <div className="cart-modal-body">
          <div className="cart-modal-product">
            <div className="cart-modal-img-wrap">
              <img
                src={modalData.image_url || 'https://placehold.co/80x80?text=Img'}
                alt={modalData.name}
                className="cart-modal-img"
                onError={(e) => { e.target.src = 'https://placehold.co/80x80?text=Img'; }}
              />
            </div>
            <div className="cart-modal-product-info">
              <p className="cart-modal-product-name">{modalData.name}</p>
              <p className="cart-modal-product-price">S/ {Math.round(modalData.price)}</p>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="cart-modal-actions">
          <button className="cart-modal-btn-secondary" onClick={handleContinue}>
            Seguir comprando
          </button>
          <button className="cart-modal-btn-primary" onClick={handleGoToCart}>
            <FaShoppingCart />
            <span>Ir al carrito</span>
            <FaArrowRight className="cart-modal-arrow" />
          </button>
        </div>
      </div>
    </>
  );
}