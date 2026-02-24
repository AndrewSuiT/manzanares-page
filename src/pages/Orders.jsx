// src/pages/Orders.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { FaWhatsapp, FaTruck } from 'react-icons/fa'; // <-- Nuevos iconos
import '../styles/Orders.css';

export function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // <-- Hook de navegación

  useEffect(() => {
    if (user) {
      loadOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadOrders = async () => {
    try {
      const data = await api.getUserOrders(user.uid);
      setOrders(data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  // Función para abrir WhatsApp
  const handleOpenWhatsapp = (order) => {
    const message = `Hola soy ${order.nombre} con DNI ${order.dni}, aqui esta el codigo de mi carritoweb: *${order.id}*, espero su mensaje.`;
    const whatsappUrl = `https://wa.me/51957833503?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Función para ir a Seguir Envío
  const handleTrackOrder = (order) => {
    navigate('/seguir_envio', { 
      state: { 
        autoTrackOrderId: order.id, 
        autoTrackDni: order.dni 
      } 
    });
  };

  if (!user) {
    return (
      <div className="no-results" style={{margin: '4rem auto', textAlign: 'center'}}>
        <h2>Inicia sesión para ver tus pedidos</h2>
        <Link to="/" className="pagination-btn" style={{textDecoration:'none', marginTop:'1rem', display:'inline-block'}}>
            Ir al Inicio
        </Link>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="orders-page">
      <div className="orders-container">
        <div className="orders-header">
          <h1>Mis Pedidos 📦</h1>
        </div>

        {loading ? (
          <div className="loading">Cargando historial...</div>
        ) : orders.length === 0 ? (
          <div className="no-results" style={{background: 'white', padding: '3rem', borderRadius: '8px'}}>
            <h2>No has realizado pedidos aún.</h2>
            <p>¡Llena tu carrito y realiza tu primera compra!</p>
            <Link to="/productos" className="pagination-btn" style={{textDecoration:'none', marginTop:'1rem', display:'inline-block'}}>
              Ver Catálogo
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div>
                    <span className="order-id">Pedido #{order.id}</span>
                    <div className="order-date">{formatDate(order.fecha)}</div>
                  </div>
                  <span className={`order-status status-${order.estado?.toLowerCase() || 'pendiente'}`}>
                    {order.estado || 'Pendiente'}
                  </span>
                </div>

                <div className="order-body">
                  <div className="order-items">
                    {order.detalles && order.detalles.map((item, idx) => (
                      <div key={idx} className="order-item-row">
                        <span>
                          <span className="item-qty">{item.cantidad}x</span> 
                          {item.nombre}
                        </span>
                        <span>S/ {(item.precio * item.cantidad).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {/* NUEVO FOOTER CON BOTONES */}
                  <div className="order-footer">
                    <div className="order-actions">
                      <button className="btn-track" onClick={() => handleTrackOrder(order)}>
                        <FaTruck /> Seguir Envío
                      </button>
                      <button className="btn-whatsapp" onClick={() => handleOpenWhatsapp(order)}>
                        <FaWhatsapp /> Contactar
                      </button>
                    </div>
                    <div className="order-total-block">
                      <span className="total-label">Total Pagado:</span>
                      <span className="total-amount">S/ {order.total?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}