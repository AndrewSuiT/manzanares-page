import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import '../styles/AdvancedFilters.css'; // Reusamos estilos de form por simplicidad

export function Profile() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    nombre: '',
    dni: '',
    telefono: '',
    direccion: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    const data = await api.getUserProfile(user.uid);
    setFormData({
      nombre: data?.nombre || user.displayName || '',
      dni: data?.dni || '',
      telefono: data?.telefono || '',
      direccion: data?.direccion || ''
    });
    setLoading(false);
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
    } else {
      setMsg({ type: 'error', text: 'Error al guardar los datos.' });
    }
    setSaving(false);
  };

  if (loading) return <div style={{padding: '4rem', textAlign:'center'}}>Cargando perfil...</div>;

  return (
    <div style={{ maxWidth: '600px', margin: '3rem auto', padding: '2rem', background: 'white', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
      <h1 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>Mi Perfil</h1>
      
      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #eee' }}>
          <img src={user.photoURL} alt="" style={{ width: '60px', height: '60px', borderRadius: '50%' }} />
          <div>
            <h3 style={{ margin: 0 }}>{user.displayName}</h3>
            <p style={{ margin: 0, color: '#7f8c8d' }}>{user.email}</p>
          </div>
        </div>
      )}

      {msg.text && (
        <div style={{ 
          padding: '1rem', 
          borderRadius: '6px', 
          marginBottom: '1rem',
          background: msg.type === 'success' ? '#d4edda' : '#f8d7da',
          color: msg.type === 'success' ? '#155724' : '#721c24'
        }}>
          {msg.text}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Nombre Completo para Pedidos</label>
          <input 
            type="text" 
            name="nombre" 
            value={formData.nombre} 
            onChange={handleChange}
            style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '6px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>DNI / Documento</label>
          <input 
            type="text" 
            name="dni" 
            value={formData.dni} 
            onChange={handleChange}
            placeholder="Para autocompletar tus pedidos"
            style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '6px' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Teléfono</label>
            <input 
              type="tel" 
              name="telefono" 
              value={formData.telefono} 
              onChange={handleChange}
              style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '6px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Dirección (Opcional)</label>
            <input 
              type="text" 
              name="direccion" 
              value={formData.direccion} 
              onChange={handleChange}
              style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '6px' }}
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={saving}
          style={{ 
            marginTop: '1rem', 
            padding: '1rem', 
            background: '#667eea', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px', 
            fontWeight: 'bold', 
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1
          }}
        >
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </form>
    </div>
  );
}