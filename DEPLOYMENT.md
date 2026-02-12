# 🚀 Guía de Deployment y Configuración

## 📋 Requisitos Previos

```bash
- Node.js 16+
- npm 8+
- Git
```

## 🔧 Instalación

### 1. Clonar/Acceder al proyecto
```bash
cd d:\DOCUMENTOS\sistemaapp\appmanza\pagina_react\manzanares-page
```

### 2. Instalar dependencias
```bash
npm install
```

## ⚙️ Configuración

### Variables de Entorno
Crear archivo `.env` en la raíz:

```env
# .env
VITE_API_URL=http://localhost:8000
```

Cambiar según tu entorno:
- **Desarrollo:** `http://localhost:8000`
- **Producción:** `https://api.manzanares.com`

## 🚀 Desarrollo

### Iniciar servidor de desarrollo
```bash
npm run dev
```

Abrirá en: `http://localhost:5173/`

### Hot Module Replacement (HMR)
- Los cambios se reflejan automáticamente
- No necesita recargar manualmente

## 🏗️ Build para Producción

### Compilar
```bash
npm run build
```

Genera carpeta `dist/` con archivos optimizados

### Preview de build
```bash
npm run preview
```

Prueba la versión de producción localmente

## 🎨 Lint y Formato

### Revisar errores
```bash
npm run lint
```

## 📦 Estructura de Carpetas

```
manzanares-page/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── Carousel.jsx
│   │   ├── ProductCard.jsx
│   │   ├── CategorySidebar.jsx
│   │   ├── Layout.jsx
│   │   └── index.js
│   ├── pages/              # Páginas de la aplicación
│   │   ├── Home.jsx
│   │   ├── Categories.jsx
│   │   ├── Search.jsx
│   │   ├── ProductDetail.jsx
│   │   ├── About.jsx
│   │   ├── Terms.jsx
│   │   ├── Cart.jsx
│   │   └── index.js
│   ├── styles/             # Estilos CSS
│   │   ├── Header.css
│   │   ├── Footer.css
│   │   ├── Carousel.css
│   │   ├── ProductCard.css
│   │   ├── CategorySidebar.css
│   │   ├── Layout.css
│   │   ├── Home.css
│   │   ├── Categories.css
│   │   ├── Search.css
│   │   ├── ProductDetail.css
│   │   ├── About.css
│   │   ├── Terms.css
│   │   └── Cart.css
│   ├── services/           # Servicios API
│   │   └── api.js
│   ├── assets/             # Imágenes, fuentes, etc.
│   ├── App.jsx             # Componente raíz
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── public/                 # Archivos estáticos
├── .env                    # Variables de entorno (NO versionar)
├── .env.example           # Plantilla de .env
├── vite.config.js         # Configuración de Vite
├── package.json
├── package-lock.json
├── eslint.config.js
├── index.html
└── README.md
```

## 🌍 Rutas Disponibles

| Ruta | Página | Descripción |
|------|--------|-------------|
| `/` | Home | Página principal |
| `/categorias` | Categories | Categorías con paginación |
| `/buscar?q=termino` | Search | Búsqueda de productos |
| `/producto/:id` | ProductDetail | Detalle del producto |
| `/ubicanos` | About | Ubicación y horarios |
| `/terminos` | Terms | Términos y condiciones |
| `/carrito` | Cart | Carrito de compras |

## 🔗 API Endpoints Esperados

```
Base URL: http://localhost:8000/api

GET     /api/products
GET     /api/product/{id}
GET     /api/recommendations/home
GET     /api/search?q=termino
GET     /api/categories
POST    /api/track
```

## 🐛 Troubleshooting

### Error: "Cannot find module 'react-router-dom'"
```bash
npm install react-router-dom react-icons
```

### Puerto 5173 en uso
```bash
npm run dev -- --port 3000
```

### Build falla
```bash
# Limpiar caché
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Búsqueda no funciona
- Verificar que el backend esté corriendo
- Revisar `VITE_API_URL` en `.env`
- Comprobar endpoint `/api/search` en backend

## 📊 Optimizaciones

### Recomendadas:
1. **Lazy Loading** - Cargar rutas bajo demanda
2. **Code Splitting** - Separar chunks por página
3. **Image Optimization** - Comprimir imágenes
4. **Caching** - HTTP headers para caché
5. **CDN** - Servir assets desde CDN

### Implementadas:
- ✅ Vite para bundling rápido
- ✅ React Fast Refresh (HMR)
- ✅ CSS Modules opcionales
- ✅ Tree Shaking automático

## 🔐 Seguridad

### Recomendaciones:
1. No subir `.env` al repositorio
2. Usar HTTPS en producción
3. Validar inputs en búsqueda
4. CORS configurado en backend
5. Rate limiting en API

## 📈 Monitoreo

### Verificar Performance:
```bash
npm run build
# Analizar tamaño de bundle
npm install -g serve
serve -s dist
```

## 🤝 Git Workflow

```bash
# Crear rama
git checkout -b feature/mi-feature

# Hacer cambios
git add .
git commit -m "feat: descripción"

# Subir rama
git push origin feature/mi-feature

# Pull Request en GitHub
```

## 📝 Notas Importantes

- El proyecto usa **React Router v7+**
- Estilos CSS personalizados (sin Tailwind)
- API Service centralizado en `src/services/api.js`
- Paginación: **30 productos por página**
- Responsive en móvil, tablet y desktop

## 📞 Soporte

Para problemas o preguntas:
1. Revisar documentación en `DOCUMENTACION.md`
2. Ver guía de mejoras en `MEJORAS_CATEGORIAS_BUSQUEDA.md`
3. Consultar archivos backup en `/backend-backup`

---

**Última actualización:** 17 de Diciembre de 2025
