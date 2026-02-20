import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import '../styles/Profile.css';

export function Profile() {
  const { user } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();
  const returnTo = location.state?.returnTo;

  const [formData, setFormData] = useState({
    nombre: '',
    dni: '',
    telefono: '',
    direccion: '',
    sucursal: ''
  });
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      loadData();
      loadSucursales();
    }
  }, [user]);

  const loadData = async () => {
    const data = await api.getUserProfile(user.uid);
    setFormData({
      nombre: data?.nombre || user.displayName || '',
      dni: data?.dni || '',
      telefono: data?.telefono || '',
      direccion: data?.direccion || '',
      sucursal: data?.sucursal || ''
    });
    setLoading(false);
  };

  const loadSucursales = async () => {
    const data = await api.getSucursales();
    setSucursales(data);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: '', text: '' });
    
    const success = await api.updateUserProfile(user.uid, formData);
    
    if (success) {
      setMsg({ type: 'success', text: '¡Datos actualizados correctamente!' });
      
      if (returnTo) {
        setTimeout(() => {
          navigate(returnTo);
        }, 1500);
      }
    } else {
      setMsg({ type: 'error', text: 'Error al guardar los datos.' });
    }
    setSaving(false);
  };

  if (loading) return <div className="profile-loading">Cargando perfil...</div>;

  return (
    <div className="profile-container">
      <h1 className="profile-title">Mi Perfil</h1>
      
      {user && (
        <div className="profile-user-info">
          <img src={user.photoURL} alt="" className="profile-avatar" />
          <div>
            <h3 className="profile-user-name">{user.displayName}</h3>
            <p className="profile-user-email">{user.email}</p>
          </div>
        </div>
      )}

      {msg.text && (
        <div className={`profile-message ${msg.type}`}>
          {msg.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="profile-form-group">
          <label>Nombre Completo para Pedidos</label>
          <input 
            type="text" 
            name="nombre" 
            value={formData.nombre} 
            onChange={handleChange}
          />
        </div>

        <div className="profile-form-group">
          <label>DNI / Documento</label>
          <input 
            type="text" 
            name="dni" 
            value={formData.dni} 
            onChange={handleChange}
            placeholder="Para autocompletar tus pedidos"
          />
        </div>

        <div className="profile-form-group">
          <label>Sucursal Preferida</label>
          <select 
            name="sucursal" 
            value={formData.sucursal} 
            onChange={handleChange}
          >
            <option value="">Selecciona una sucursal</option>
            {sucursales.map(s => (
              <option key={s.id} value={s.id}>{s.nombre}</option>
            ))}
          </select>
        </div>

        <div className="profile-form-group">
          <label>Dirección (Opcional)</label>
          <input 
            type="text" 
            name="direccion" 
            value={formData.direccion} 
            onChange={handleChange}
            placeholder="Para autocompletar en envíos a domicilio"
          />
        </div>

        <div className="profile-form-group">
          <label>Teléfono</label>
          <input 
            type="tel" 
            name="telefono" 
            value={formData.telefono} 
            onChange={handleChange}
          />
        </div>

        <button 
          type="submit" 
          disabled={saving}
          className="profile-submit-btn"
        >
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </form>
    </div>
  );
}