// src/pages/SeguimientoPedido.jsx
import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useLocation } from 'react-router-dom';
import '../styles/SeguimientoPedido.css';

const SP_ESTADOS = {
  pendiente:           { label: 'Pendiente',           icon: '🕐', desc: 'Esperando aprobación.' },
  aprobado:            { label: 'Aprobado',            icon: '✅', desc: 'Pedido aprobado.' },
  empaquetando_pedido: { label: 'Empaquetando',        icon: '📦', desc: 'Armando tu pedido.' },
  pedido_en_ruta:      { label: 'En Ruta a Sucursal',  icon: '🚚', desc: 'En camino a la sucursal.' },
  pedido_en_sucursal:  { label: 'En Sucursal',         icon: '🏪', desc: 'Llegó a la sucursal.' },
  espera_cliente:      { label: 'Listo para Recojo',   icon: '🎉', desc: '¡Ya puedes venir a recogerlo!' },
  en_ruta_a_domicilio: { label: 'En Camino',           icon: '🛵', desc: 'En camino a tu domicilio.' },
  completado:          { label: 'Completado',          icon: '🏆', desc: '¡Pedido entregado!' },
  cancelado:           { label: 'Cancelado',           icon: '❌', desc: 'Pedido cancelado.' },
};

const spGetPasos = (tipo, sucursal) => {
  const isMollendo = sucursal?.toLowerCase() === 'mollendo';
  if (tipo === 'recojo') {
    return isMollendo
      ? ['pendiente','aprobado','empaquetando_pedido','espera_cliente','completado']
      : ['pendiente','aprobado','empaquetando_pedido','pedido_en_ruta','pedido_en_sucursal','espera_cliente','completado'];
  } else {
    return isMollendo
      ? ['pendiente','aprobado','empaquetando_pedido','en_ruta_a_domicilio','completado']
      : ['pendiente','aprobado','empaquetando_pedido','pedido_en_ruta','pedido_en_sucursal','en_ruta_a_domicilio','completado'];
  }
};

const spFecha = (s) => {
  if (!s) return '—';
  try {
    return new Date(s).toLocaleDateString('es-PE', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return s; }
};

export function SeguimientoPedido() {
  const location = useLocation();
  const [orderId,   setOrderId]   = useState('');
  const [dni,       setDni]       = useState('');
  const [orderData, setOrderData] = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');

  useEffect(() => {
    if (location.state?.autoTrackOrderId && location.state?.autoTrackDni) {
      fetchTrackingData(location.state.autoTrackOrderId, location.state.autoTrackDni);
    }
  }, [location.state]);

  // Función separada para poder llamarla automática o manualmente
  const fetchTrackingData = async (searchOrderId, searchDni) => {
    setLoading(true); setError(''); setOrderData(null);
    const result = await api.getOrderTracking(searchOrderId.trim().toUpperCase(), searchDni.trim());
    if      (result?.error === 'not_found') setError('No encontramos esa orden. Verifica los datos.');
    else if (result?.error)                 setError('Error de conexión. Intenta de nuevo.');
    else                                    setOrderData(result);
    setLoading(false);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    fetchTrackingData(orderId, dni);
  };

  const handleReset = () => {
    setOrderData(null);
    setOrderId('');
    setDni('');
    setError('');

    window.history.replaceState({}, document.title);
  };

  /* ── Tracker horizontal — PC ─────────────────────────── */
  const renderTrackerH = (pasos, idx) => {
    const pct = pasos.length <= 1 ? 100 : (idx / (pasos.length - 1)) * 100;
    return (
      <div className="sp-tracker-h">
        <div className="sp-h-rail"><div className="sp-h-fill" style={{ width: `${pct}%` }} /></div>
        <div className="sp-h-steps">
          {pasos.map((paso, i) => {
            const done = i < idx, active = i === idx;
            const cfg  = SP_ESTADOS[paso];
            return (
              <div key={paso} className={`sp-h-step${done?' sp-done':''}${active?' sp-active':''}`}>
                <div className="sp-h-circle">{done ? '✓' : cfg?.icon}</div>
                <span className="sp-h-label">{cfg?.label}</span>
                {active && <div className="sp-h-tooltip">{cfg?.desc}</div>}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  /* ── Tracker vertical — Móvil ────────────────────────── */
  const renderTrackerV = (pasos, idx) => (
    <div className="sp-vtrack">
      {pasos.map((paso, i) => {
        const done = i < idx, active = i === idx, last = i === pasos.length - 1;
        const cfg  = SP_ESTADOS[paso];
        return (
          <div key={paso} className="sp-vtrack-row">
            <div className="sp-vtrack-left">
              <div className={`sp-vt-circle${done?' sp-done':''}${active?' sp-active':''}`}>
                {done ? '✓' : cfg?.icon}
              </div>
              {!last && <div className={`sp-vt-line${done?' sp-done':''}`} />}
            </div>
            <div className={`sp-vt-content${done?' sp-done':''}${active?' sp-active':''}`}>
              <span className="sp-vt-label">{cfg?.label}</span>
              {active && <span className="sp-vt-desc">{cfg?.desc}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderCancelado = () => (
    <div className="sp-cancelado">
      <span className="sp-cancelado-icon">✕</span>
      <div>
        <strong>Pedido Cancelado</strong>
        <p>Este pedido ya no se encuentra en proceso.</p>
      </div>
    </div>
  );

  /* ══════════════════════════════════════════
     VISTA 1 — Formulario
  ══════════════════════════════════════════ */
  if (!orderData) {
    return (
      <div className="sp-page">
        <div className="sp-hero">
          <span className="sp-hero-icon">🚚</span>
          <h1>Seguir mi Pedido</h1>
          <p>Ingresa tu número de orden y DNI para ver el estado.</p>
        </div>

        <form onSubmit={handleSearch} className="sp-form">
          <div className="sp-field">
            <label>Número de Orden</label>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value.toUpperCase())}
              placeholder="Ej: N0042"
              required
            />
          </div>
          <div className="sp-field">
            <label>DNI</label>
            <input
              type="text"
              value={dni}
              onChange={(e) => setDni(e.target.value.replace(/\D/g, ''))}
              placeholder="Tu número de documento"
              required
              maxLength={8}
            />
          </div>
          <div className="sp-field-btn">
            <label className="sp-invisible-label">·</label>
            <button type="submit" className="sp-btn" disabled={loading}>
              {loading ? 'Buscando...' : '🔍 Buscar Pedido'}
            </button>
          </div>
        </form>

        {error && <div className="sp-error">⚠️ {error}</div>}
      </div>
    );
  }

  /* ══════════════════════════════════════════
     VISTA 2 — Resultado
  ══════════════════════════════════════════ */
  const pasos = spGetPasos(orderData.tipo_entrega, orderData.sucursal);
  const idx   = pasos.indexOf(orderData.estado);
  const isCancelado = orderData.estado === 'cancelado';

  return (
    <div className="sp-page sp-page-result">

      {/* Botón regresar */}
      <button className="sp-back-btn" onClick={handleReset}>
        ← Buscar otro pedido
      </button>

      <div className="sp-card">

        {/* Encabezado */}
        <div className="sp-card-head">
          <div className="sp-result-id">
            <span className="sp-id-label">Orden</span>
            <span className="sp-id-value">#{orderData.id}</span>
          </div>
          <span className={`sp-badge sp-badge-${orderData.estado}`}>
            {SP_ESTADOS[orderData.estado]?.icon} {SP_ESTADOS[orderData.estado]?.label}
          </span>
        </div>

        {/* Tracker */}
        <div className="sp-tracker-wrap">
          {isCancelado
            ? renderCancelado()
            : (
              <>
                {renderTrackerH(pasos, idx)}
                {renderTrackerV(pasos, idx)}
              </>
            )
          }
        </div>

        {/* Info grid: Pedido + Logística */}
        <div className="sp-info-grid">
          <div className="sp-info-box">
            <h4>📋 Pedido</h4>
            <div className="sp-info-row"><span>Orden</span>   <strong>#{orderData.id}</strong></div>
            {orderData.nombre && <div className="sp-info-row"><span>Cliente</span> <strong>{orderData.nombre}</strong></div>}
            <div className="sp-info-row"><span>Fecha</span>   <strong>{spFecha(orderData.fecha)}</strong></div>
            <div className="sp-info-row">
              <span>Entrega</span>
              <strong>{orderData.tipo_entrega === 'recojo' ? '🏪 Recojo' : '🚚 Envío'}</strong>
            </div>
            <div className="sp-info-row"><span>Sucursal</span><strong>{orderData.sucursal?.toUpperCase()}</strong></div>
          </div>

          <div className="sp-info-box">
            <h4>📍 Logística</h4>
            <div className="sp-info-row"><span>DNI</span><strong>{orderData.dni}</strong></div>
            {orderData.telefono  && <div className="sp-info-row"><span>Teléfono</span> <strong>{orderData.telefono}</strong></div>}
            {orderData.direccion && <div className="sp-info-row"><span>Dirección</span><strong>{orderData.direccion}</strong></div>}
            {orderData.costo_envio != null && (
              <div className="sp-info-row">
                <span>Costo envío</span>
                <strong>{orderData.costo_envio === 0 ? 'Gratis' : `S/ ${orderData.costo_envio.toFixed(2)}`}</strong>
              </div>
            )}
          </div>
        </div>

        {/* Productos */}
        <div className="sp-products">
          <h4>🛒 Productos</h4>
          <div className="sp-prod-list">
            {orderData.detalles?.map((prod, i) => (
              <div key={i} className="sp-prod-item">
                <span className="sp-prod-qty">{prod.cantidad}×</span>
                <span className="sp-prod-name">{prod.nombre}</span>
                {prod.precio != null && (
                  <span className="sp-prod-price">S/ {(prod.precio * prod.cantidad).toFixed(2)}</span>
                )}
              </div>
            ))}
          </div>
          {orderData.total != null && (
            <div className="sp-total-row">
              <span>Total Pagado</span>
              <strong>S/ {Number(orderData.total).toFixed(2)}</strong>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}