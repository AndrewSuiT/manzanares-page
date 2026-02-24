// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { CartModalProvider } from './context/CartModalContext';
import { CartAddedModal } from './components/CartAddedModal';
import { Layout } from './components/Layout';
import { ScrollToTop } from './components/ScrollToTop';
import { Home, Categories, Search, ProductDetail, About, Terms, Cart, Profile, Favorites, History, Orders, SeguimientoPedido } from './pages'; 
import './App.css';

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <CartModalProvider>
          <CartAddedModal />
          <ScrollToTop />
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/productos" element={<Categories />} />
              <Route path="/buscar" element={<Search />} />
              <Route path="/producto/:id" element={<ProductDetail />} />
              <Route path="/ubicanos" element={<About />} />
              <Route path="/terminos" element={<Terms />} />
              <Route path="/carrito" element={<Cart />} />
              <Route path="/perfil" element={<Profile />} />
              <Route path="/pedidos" element={<Orders />} />
              <Route path="/favoritos" element={<Favorites />} />
              <Route path="/historial" element={<History />} />
              <Route path="/seguir_envio" element={<SeguimientoPedido />} /> 
            </Route>
          </Routes>
        </CartModalProvider>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;