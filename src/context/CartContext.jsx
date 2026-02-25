import { createContext, useState, useContext, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../services/api';

const CartContext = createContext();

/**
 * Estrategia de carrito al hacer login:
 *
 * - Si el usuario tenía items como invitado → usar SOLO esos (es lo que vino a comprar).
 *   El carrito de Firebase de sesiones anteriores se descarta.
 *
 * - Si el usuario NO tenía items locales → restaurar el carrito de Firebase
 *   (usuario que vuelve y quiere encontrar lo que dejó guardado).
 */
function mergeCarts(localItems, remoteItems) {
  if (localItems.length > 0) {
    return localItems;
  }
  return remoteItems;
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const { user } = useAuth();

  const prevUserRef = useRef(undefined);
  const saveTimerRef = useRef(null);
  const isLoadingRemoteRef = useRef(false);

  // 1. Cargar carrito de localStorage al montar
  useEffect(() => {
    const savedCart = localStorage.getItem('manzanares_cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error cargando carrito:', error);
      }
    }
  }, []);

  // 2. Sincronizar con Firebase al hacer login / logout
  useEffect(() => {
    const prevUser = prevUserRef.current;
    prevUserRef.current = user;

    if (prevUser === undefined) return; // primer render

    if (user && !prevUser) {
      // Usuario acaba de iniciar sesion
      const localItems = (() => {
        try { return JSON.parse(localStorage.getItem('manzanares_cart') || '[]'); }
        catch { return []; }
      })();

      isLoadingRemoteRef.current = true;
      setCartLoading(true);

      (async () => {
        try {
          const remoteItems = await api.getCart(user.uid);
          const finalCart = mergeCarts(localItems, remoteItems);

          // Guardar en Firebase el carrito resultante (sobreescribe cualquier versión anterior)
          await api.saveCart(user.uid, finalCart);

          localStorage.removeItem('manzanares_cart');
          setCartItems(finalCart);
        } catch (error) {
          console.error('Error sincronizando carrito:', error);
        } finally {
          isLoadingRemoteRef.current = false;
          setCartLoading(false);
        }
      })();

    } else if (!user && prevUser) {
      // Usuario cerro sesion: limpiar
      localStorage.removeItem('manzanares_cart');
      setCartItems([]);
    }
  }, [user]);

  // 3. Persistir carrito cada vez que cambia
  useEffect(() => {
    if (isLoadingRemoteRef.current) return;

    if (!user) {
      localStorage.setItem('manzanares_cart', JSON.stringify(cartItems));
    } else {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        api.saveCart(user.uid, cartItems);
      }, 800);
    }
  }, [cartItems, user]);

  const addToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) { removeFromCart(productId); return; }
    setCartItems(prev =>
      prev.map(item => item.id === productId ? { ...item, quantity } : item)
    );
  };

  const clearCart = () => {
    setCartItems([]);
    if (user) api.clearRemoteCart(user.uid);
  };

  const getTotalItems = () => cartItems.reduce((total, item) => total + item.quantity, 0);

  const getTotalPrice = () => {
    const total = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    return Math.round(total);
  };

  return (
    <CartContext.Provider value={{
      cartItems, cartLoading,
      addToCart, removeFromCart, updateQuantity, clearCart,
      getTotalItems, getTotalPrice,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart debe ser usado dentro de CartProvider');
  return context;
}