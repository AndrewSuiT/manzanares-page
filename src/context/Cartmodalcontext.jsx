import { createContext, useContext, useState, useCallback, useRef } from 'react';

const CartModalContext = createContext(null);

export function CartModalProvider({ children }) {
  const [modalData, setModalData] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef(null);

  const showCartModal = useCallback((product) => {
    // Limpiar timer anterior si existe
    if (timerRef.current) clearTimeout(timerRef.current);

    setModalData(product);
    setIsVisible(true);

    // Auto-cerrar después de 6 segundos
    timerRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 6000);
  }, []);

  const closeModal = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsVisible(false);
  }, []);

  return (
    <CartModalContext.Provider value={{ showCartModal, closeModal, modalData, isVisible }}>
      {children}
    </CartModalContext.Provider>
  );
}

export function useCartModal() {
  const context = useContext(CartModalContext);
  if (!context) {
    // Fallback silencioso si no hay provider (no rompe la app)
    return {
      showCartModal: () => {},
      closeModal: () => {},
      modalData: null,
      isVisible: false,
    };
  }
  return context;
}