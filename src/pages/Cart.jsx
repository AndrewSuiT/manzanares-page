import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { FaWhatsapp } from 'react-icons/fa';
import '../styles/Cart.css';

export function Cart() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Estados para los Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    nombre: user ? user.displayName : '',
    dni: ''
  });
  const [orderData, setOrderData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const shippingCost = 0; // ENVÍO GRATIS
  const total = getTotalPrice();
  const finalTotal = total + shippingCost;

  if (cartItems.length === 0 && !isConfirmationModalOpen) {
    return (
      <div className="cart-page">
        <div className="cart-container">
          <h1>Tu Carrito de Compras</h1>
          <div className="empty-cart">
            <h2>Tu carrito está vacío</h2>
            <p>Agrega algunos productos para comenzar</p>
            <Link to="/productos" className="continue-shopping">
              Continuar Comprando
            </Link>
          </div>
        </div>
      </div>
    );
  }
  // Abrir modal y pre-cargar datos
  const handleOpenCheckout = async () => {
    setIsModalOpen(true);
    
    if (user) {
        // Intentar obtener datos guardados del perfil
        setIsProcessing(true); // Usamos este loading visualmente si quieres, o uno local
        const profile = await api.getUserProfile(user.uid);
        setIsProcessing(false);

        setFormData(prev => ({
            ...prev,
            nombre: profile?.nombre || user.displayName || '',
            dni: profile?.dni || ''
        }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProcessOrder = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // 1. Guardar cantidad de items ANTES de limpiar
      const itemCount = cartItems.length;

      // 2. Preparar datos para el backend
      const orderPayload = {
        client_id: user ? user.uid : null,
        dni: formData.dni,
        nombre: formData.nombre,
        total: finalTotal,
        items: cartItems.map(item => ({
            cod_producto: item.id,
            nombre: item.name,
            cantidad: item.quantity,
            precio: item.price
        }))
      };

      // 3. Enviar al Backend
      const response = await api.createOrder(orderPayload);
      const orderId = response.order_id;

      // 4. Guardar datos del pedido en el estado ANTES de limpiar
      const newOrderData = {
        orderId,
        nombre: formData.nombre,
        dni: formData.dni,
        total: finalTotal,
        itemCount: itemCount
      };
      setOrderData(newOrderData);
      
      // 5. Limpiar carrito
      clearCart();

      // 6. Mostrar modal de confirmación
      setIsModalOpen(false);
      setIsConfirmationModalOpen(true);
      setIsProcessing(false);

    } catch (error) {
      console.error("Error procesando pedido:", error);
      alert("Hubo un error al procesar el pedido. Inténtalo de nuevo.");
      setIsProcessing(false);
    }
  };

  const handleOpenWhatsapp = () => {
    if (!orderData) return;
    const message = `Hola soy ${orderData.nombre} con DNI ${orderData.dni}, aqui esta el codigo de mi carritoweb: *${orderData.orderId}*, espero su mensaje.`;
    const whatsappUrl = `https://wa.me/51957833501?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="cart-page">
      <div className="cart-container">
        <h1>Tu Carrito de Compras</h1>

        <div className="cart-content">
          <div className="cart-items">
            <table className="items-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Precio</th>
                  <th>Cantidad</th>
                  <th>Subtotal</th>
                  <th>Eliminar</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="item-name">
                        <img src={item.image_url} alt={item.name} className="item-image" />
                        <div className="item-details">
                          <p className="item-title">{item.name}</p>
                          {(item.brand || item.category) && (
                            <p className="item-brand">Marca: {item.marca}</p>
                          )}
                          <p className="item-code">Cód: {item.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="price-cell">
                      {Math.round(item.discount_percent) > 0 ? (
                        <div className="price-container">
                          <span className="original-price">S/ {Math.round(item.original_price || item.price)}</span>
                          <span className="discount-price">S/ {Math.round(item.price)}</span>
                        </div>
                      ) : (
                        <span>S/ {Math.round(item.price)}</span>
                      )}
                    </td>
                    <td className="quantity-cell">
                      <div className="quantity-control">
                        <button className="qty-btn" onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}>−</button>
                        <input 
                          type="number" 
                          min="1" 
                          value={item.quantity} 
                          onChange={(e) => {
                            const newQty = Math.max(1, parseInt(e.target.value) || 1);
                            updateQuantity(item.id, newQty);
                          }}
                          className="qty-input" 
                        />
                        <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                      </div>
                    </td>
                    <td className="subtotal-cell">
                      {Math.round(item.discount_percent) > 0 ? (
                        <div className="subtotal-price-container">
                          <span className="original-price">S/ {Math.round((item.original_price || item.price) * item.quantity)}</span>
                          <span className="discount-price">S/ {Math.round(item.price * item.quantity)}</span>
                        </div>
                      ) : (
                        <span>S/ {Math.round(item.price * item.quantity)}</span>
                      )}
                    </td>
                    <td className="action-cell">
                      <button onClick={() => removeFromCart(item.id)} className="remove-btn">✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="cart-summary">
            <h3>Resumen de Compra</h3>
            <div className="summary-item">
              <span>Subtotal:</span>
              <span>S/ {Math.round(total)}</span>
            </div>
            <div className="summary-item">
              <span>Envío:</span>
              <span style={{color: '#27ae60', fontWeight: 'bold'}}>GRATIS</span>
            </div>
            <div className="summary-item total">
              <span>Total:</span>
              <span>S/ {Math.round(finalTotal)}</span>
            </div>
            
            <button className="checkout-btn" onClick={handleOpenCheckout}>
              Procesar Pedido
            </button>
            
            <button className="continue-btn" onClick={() => window.history.back()}>
              Continuar Comprando
            </button>
          </div>
        </div>
      </div>

      {/* MODAL DE CHECKOUT */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Finalizar Compra</h2>
            <p>Inicia sesión si quieres guardar tus pedidos.</p>
            
            <form onSubmit={handleProcessOrder}>
              <div className="form-group">
                <label>Nombre Completo:</label>
                <input 
                  type="text" 
                  name="nombre"
                  value={formData.nombre} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="Ej: Juan Pérez"
                />
              </div>
              
              <div className="form-group">
                <label>DNI / Documento:</label>
                <input 
                  type="text" 
                  name="dni"
                  value={formData.dni} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="Ej: 12345678"
                  pattern="[0-9]*"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="confirm-btn" disabled={isProcessing}>
                  {isProcessing ? 'Procesando...' : (
                    <> <FaWhatsapp /> Solicitar por WhatsApp </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN DE PEDIDO */}
      {isConfirmationModalOpen && orderData && (
        <div className="modal-overlay">
          <div className="modal-content confirmation-modal">
            <h2>✓ Pedido Generado Exitosamente</h2>
            
            <div className="order-details">
              <div className="detail-item">
                <span className="label">Número de Pedido:</span>
                <span className="value order-id">{orderData.orderId}</span>
              </div>
              <div className="detail-item">
                <span className="label">Nombre:</span>
                <span className="value">{orderData.nombre}</span>
              </div>
              <div className="detail-item">
                <span className="label">DNI:</span>
                <span className="value">{orderData.dni}</span>
              </div>
              <div className="detail-item">
                <span className="label">Cantidad de Productos:</span>
                <span className="value">{orderData.itemCount}</span>
              </div>
              <div className="detail-item total">
                <span className="label">Total:</span>
                <span className="value">S/ {orderData.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="confirmation-message">
              <p>💬 <strong>Puedes hablarnos al WhatsApp con tu número de pedido: {orderData.orderId}</strong></p>
            </div>

            <div className="modal-actions">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => {
                  setIsConfirmationModalOpen(false);
                  navigate('/productos');
                }}
              >
                Regresar a la página
              </button>
              <button 
                type="button" 
                className="btn btn-whatsapp" 
                onClick={handleOpenWhatsapp}
              >
                <FaWhatsapp /> Contactar por WhatsApp
              </button>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={() => {
                  setIsConfirmationModalOpen(false);
                  navigate('/pedidos');
                }}
              >
                Ver Mis Pedidos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}