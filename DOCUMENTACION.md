# 🥭 Manzanares - Documentación de la Aplicación

## Descripción General
Aplicación web de e-commerce para Manzanares que integra un sistema de recomendaciones de productos y productos similares usando el servicio de backend con Firebase.

---

## 📋 Estructura de Rutas

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/` | `Home` | Página principal con carrusel de promociones y productos destacados |
| `/categorias` | `Categories` | Página de categorías con filtrado y paginación (30 productos/página) |
| `/buscar` | `Search` | Búsqueda de productos con paginación |
| `/producto/:id` | `ProductDetail` | Detalle completo del producto y productos similares |
| `/ubicanos` | `About` | Información de ubicación, horarios y características |
| `/terminos` | `Terms` | Términos y condiciones de la tienda |
| `/carrito` | `Cart` | Carrito de compras (en desarrollo) |

---

## 🎨 Componentes Principales

### 1. **Header** (`src/components/Header.jsx`)
- Logo de Manzanares
- Barra de búsqueda por descripción/código
- Enlaces a redes sociales (Facebook, Instagram, WhatsApp)
- Botón del carrito
- Navegación secundaria (Categorías, Ubicanos, Términos)

### 2. **Footer** (`src/components/Footer.jsx`)
- Logo y descripción de la tienda
- Redes sociales
- Información de contacto (dirección, teléfono, email)
- Enlaces rápidos

### 3. **Carousel** (`src/components/Carousel.jsx`)
- Carrusel automático de promociones (rotación cada 5 segundos)
- Controles de navegación (flechas)
- Indicadores (puntos)
- Cada imagen puede filtrar productos por categoría

### 4. **ProductCard** (`src/components/ProductCard.jsx`)
- Tarjeta de producto con imagen, nombre, precio
- Categoría y tags
- Botón de agregar al carrito
- Stock disponible
- Enlace a detalle del producto

### 5. **CategorySidebar** (`src/components/CategorySidebar.jsx`)
- Lista expandible de categorías
- Subcategorías con filtrado
- Selección activa de categoría

### 6. **Layout** (`src/components/Layout.jsx`)
- Estructura base con Header, Footer y contenido principal
- Usa `<Outlet>` de React Router para renderizar páginas

---

## 📄 Páginas

### 1. **Home** (`src/pages/Home.jsx`)
**Características:**
- Carrusel de promociones destacadas
- Sidebar con categorías
- Grid de productos destacados (desde recomendaciones)
- Filtrado por categoría
- Carga desde API de recomendaciones

### 2. **Categories** (`src/pages/Categories.jsx`)
**Características:**
- Vista de todas las categorías con paginación
- **30 productos por página**
- Sidebar con árbol de categorías y subcategorías
- Filtrado de productos por categoría seleccionada
- **Navegación avanzada** (Primera, Anterior, Números, Siguiente, Última)
- Indicador de filtro activo
- Información de total de productos

### 3. **Search** (`src/pages/Search.jsx`)
**Características:**
- Página dedicada para resultados de búsqueda
- URL con query string (`?q=termino`)
- **30 productos por página**
- Paginación completa
- Contador de resultados encontrados
- Mensaje cuando no hay coincidencias
**Características:**
- Imagen grande del producto
- Información completa: nombre, precio, stock, categoría, tags
- Descripción detallada
- Especificaciones técnicas (tabla dinámica)
- Selector de cantidad
- Botón "Agregar al Carrito"
- Sección de productos similares (desde recomendaciones)
- Tracking de eventos (view, add_to_cart)

### 4. **About** (`src/pages/About.jsx`)
**Características:**
- Información de ubicación (dirección, horario, contacto)
- Mapa embebido de Google Maps
- Sección de "Por qué elegirnos" con características
- Entrega rápida, productos frescos, calidad garantizada

### 5. **Terms** (`src/pages/Terms.jsx`)
**Características:**
- Términos y condiciones completos
- Secciones: Aceptación, Uso, Propiedad Intelectual, Responsabilidad
- Política de devoluciones
- Política de envíos
- Contacto

### 6. **Cart** (`src/pages/Cart.jsx`)
**Características:**
- Tabla de items en el carrito (en desarrollo)
- Cantidad ajustable por producto
- Botón de eliminar
- Resumen de compra (subtotal, envío, total)
- Botón de "Proceder al Pago"

---

## 🔗 Integración con Backend

### API Endpoints Utilizados

1. **Recomendaciones (`GET /api/recommendations/home`)**
   ```javascript
   api.getRecommendations(limit=8)
   ```

2. **Productos (`GET /api/products`)**
   ```javascript
   api.getProducts(limit=30, category="frutas", subcategory="tropicales")
   ```

3. **Búsqueda (`GET /api/search`)**
   ```javascript
   api.searchProducts("termino")
   ```

4. **Categorías (`GET /api/categories`)**
   ```javascript
   api.getCategories()
   ```

5. **Detalle de Producto (`GET /api/product/{id}`)**
   ```javascript
   api.getProductDetail(productId)
   ```

6. **Tracking (`POST /api/track`)**
   ```javascript
   api.trackEvent(eventType, productId, category)
   ```

### Estructura de Datos de Producto

```javascript
{
  id: string,
  name: string,
  description: string,
  category: string,
  price: number,
  image_url: string,
  tags: array,
  stock: number,
  specifications: object,
  rating?: number
}
```

---

## 🎯 Características Implementadas

### ✅ Completadas
- [x] Sistema de rutas con React Router (7 rutas)
- [x] Componentes responsivos
- [x] Header con navegación y búsqueda funcional
- [x] Footer con información de tienda
- [x] Carrusel automático de promociones
- [x] Grid de productos
- [x] **Categorías con paginación (30/página)**
- [x] **Búsqueda dedicada con paginación (30/página)**
- [x] **Navegación avanzada** (Primera, Anterior, Números, Siguiente, Última)
- [x] Página de detalle de producto
- [x] Productos similares
- [x] Página de ubicación
- [x] Términos y condiciones
- [x] Página de carrito (estructura básica)
- [x] Integración con API de recomendaciones
- [x] Integración con API de búsqueda
- [x] Integración con API de categorías
- [x] Tracking de eventos

### 🔄 En Desarrollo
- [ ] Carrito funcional (guardar en localStorage/backend)
- [ ] Búsqueda por descripción/código
- [ ] Sistema de filtrado avanzado
- [ ] Autenticación de usuario
- [ ] Proceso de checkout
- [ ] Historial de compras

---

## 🎨 Estilos y Tema

### Colores
- **Primario:** `#667eea` (Morado)
- **Secundario:** `#764ba2` (Morado oscuro)
- **Fondo:** `#f5f5f5` (Gris claro)
- **Texto:** `#2c3e50` (Gris oscuro)
- **Acentos:** `#e74c3c` (Rojo)

### Tipos de Letra
- Font Family: System UI fonts (Apple System Font, Segoe UI, etc.)
- Responsive: Tipografía fluida según pantalla

### Breakpoints Responsivos
- Desktop: `> 1024px`
- Tablet: `768px - 1024px`
- Mobile: `< 768px`

---

## 📦 Dependencias

```json
{
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "react-router-dom": "^7.x",
  "react-icons": "^5.x"
}
```

---

## 🚀 Comandos Disponibles

```bash
# Iniciar servidor de desarrollo
npm run dev

# Build para producción
npm run build

# Preview de producción
npm run preview

# Linting
npm run lint
```

---

## 📱 Características Responsivas

- Header adaptable (barra de búsqueda se ajusta)
- Grid de productos con 2-4 columnas según pantalla
- Sidebar de categorías oculto en mobile (colapsable)
- Tabla de carrito se convierte en acordeón en mobile
- Imágenes optimizadas y adaptadas

---

## 🔐 Variables de Entorno

```env
VITE_API_URL=http://localhost:8000  # URL del backend
```

---

## 📝 Notas de Desarrollo

### Campos Dinámicos para Promociones
El carrusel está preparado para recibir un campo personalizado en las imágenes:
```javascript
{
  id: 1,
  url: "...",
  title: "Promoción 1",
  category: "frutas"  // Se usa para filtrar productos
}
```

### Tracking Automático
Los eventos se registran automáticamente:
- **view**: Cuando se abre un producto
- **click**: Cuando se hace clic en un producto
- **add_to_cart**: Cuando se agrega al carrito

### Optimizaciones Futuras
- Implementar caché de productos
- Lazy loading de imágenes
- Progressive Web App (PWA)
- Service Workers
- Compresión de imágenes

---

## 🤝 Integración con Backend

El backend proporciona:
1. Recomendaciones personalizadas
2. Detalles de productos con especificaciones
3. Productos similares basados en categoría/marca
4. Tracking de eventos para ML

---

Última actualización: **17 de Diciembre de 2025**
