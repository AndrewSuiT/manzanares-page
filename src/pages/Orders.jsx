import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Link } from 'react-router-dom';
import '../styles/Orders.css';

export function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Función auxiliar para formatear fecha
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

                  <div className="order-footer">
                    <span className="total-label">Total Pagado:</span>
                    <span className="total-amount">S/ {order.total?.toFixed(2)}</span>
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