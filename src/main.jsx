import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext' // Asegúrate de importar esto también si no estaba
import { ToastProvider } from './context/ToastContext' // <--- IMPORTANTE
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <ToastProvider> {/* <--- AÑADIDO */}
          <App />
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  </StrictMode>,
)