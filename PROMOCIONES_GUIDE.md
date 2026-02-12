# Guía de Configuración de Promociones (Carousel)

## Descripción General

El componente Carousel ahora soporta redirecciones inteligentes a diferentes destinos: categorías, subcategorías, productos específicos, búsquedas o URLs externas.

## Estructura de Datos

Cada promoción debe seguir esta estructura:

```javascript
{
  id: number,                    // ID único de la promoción
  url: string,                   // URL de la imagen del banner
  title: string,                 // Título a mostrar
  actionType: string,            // Tipo de acción (ver tipos abajo)
  actionValue: string            // Valor específico según el tipo de acción
}
```

## Tipos de Acciones Soportadas

### 1. **Categoría** (`actionType: 'category'`)
Redirecciona a la página de productos filtrada por categoría.

**Ejemplo:**
```javascript
{
  id: 1,
  url: 'https://example.com/image.jpg',
  title: 'Frutas Frescas',
  actionType: 'category',
  actionValue: 'frutas'          // Nombre exacto de la categoría
}
```

**URL generada:** `/productos?category=frutas`

---

### 2. **Subcategoría** (`actionType: 'subcategory'`)
Redirecciona a una categoría con su subcategoría específica.

**Formato:** Usa el separador `|` para indicar categoría|subcategoría

**Ejemplo:**
```javascript
{
  id: 2,
  url: 'https://example.com/image.jpg',
  title: 'Manzanas Orgánicas',
  actionType: 'subcategory',
  actionValue: 'frutas|manzanas'  // Formato: Categoria|Subcategoria
}
```

**URL generada:** `/productos?category=frutas&subcategory=manzanas`

---

### 3. **Producto** (`actionType: 'product'`)
Redirecciona al detalle de un producto específico.

**Ejemplo:**
```javascript
{
  id: 3,
  url: 'https://example.com/image.jpg',
  title: 'Producto Destacado',
  actionType: 'product',
  actionValue: 'PROD12345'        // ID del producto
}
```

**URL generada:** `/producto/PROD12345`

---

### 4. **Búsqueda** (`actionType: 'search'`)
Redirecciona a la página de búsqueda con un término específico.

**Ejemplo:**
```javascript
{
  id: 4,
  url: 'https://example.com/image.jpg',
  title: 'Buscar Ofertas',
  actionType: 'search',
  actionValue: 'manzanas rojas'   // Término de búsqueda
}
```

**URL generada:** `/buscar?q=manzanas+rojas`

---

### 5. **URL Externa** (`actionType: 'url'`)
Abre una URL externa en una nueva pestaña.

**Ejemplo:**
```javascript
{
  id: 5,
  url: 'https://example.com/image.jpg',
  title: 'Ir a Blog',
  actionType: 'url',
  actionValue: 'https://blog.example.com/articulo'
}
```

**Comportamiento:** Se abre en `_blank`

---

## Retrocompatibilidad

Las promociones antiguas que usan la estructura `category` aún funcionan:

```javascript
{
  id: 1,
  url: 'https://example.com/image.jpg',
  title: 'Frutas',
  category: 'frutas'  // DEPRECATED pero aún soportado
}
```

Se trata como `actionType: 'category'` automáticamente.

---

## Ejemplos Completos

### Backend Response (ejemplo)
```javascript
{
  "promotions": [
    {
      "id": 1,
      "url": "https://cdn.example.com/banner-frutas.jpg",
      "title": "Frutas Frescas de Temporada",
      "actionType": "category",
      "actionValue": "frutas"
    },
    {
      "id": 2,
      "url": "https://cdn.example.com/banner-manzanas.jpg",
      "title": "Manzanas Orgánicas Premium",
      "actionType": "subcategory",
      "actionValue": "frutas|manzanas"
    },
    {
      "id": 3,
      "url": "https://cdn.example.com/banner-producto.jpg",
      "title": "Producto del Mes",
      "actionType": "product",
      "actionValue": "apple-granny-smith-1kg"
    },
    {
      "id": 4,
      "url": "https://cdn.example.com/banner-ofertas.jpg",
      "title": "Busca Tus Ofertas",
      "actionType": "search",
      "actionValue": "oferta descuento"
    }
  ]
}
```

---

## Implementación en el Backend

Si usas Firebase Firestore, la colección de promociones debería verse así:

```
firestore/
└── promotions/
    ├── doc_1
    │   ├── id: 1
    │   ├── url: "https://..."
    │   ├── title: "Frutas Frescas"
    │   ├── actionType: "category"
    │   └── actionValue: "frutas"
    ├── doc_2
    │   ├── id: 2
    │   ├── url: "https://..."
    │   ├── title: "Manzanas"
    │   ├── actionType: "subcategory"
    │   └── actionValue: "frutas|manzanas"
    └── ...
```

---

## Integración con API

En tu archivo `src/services/api.js`, agrega un endpoint para obtener promociones:

```javascript
export const api = {
  // ... otros endpoints ...
  
  // Obtener promociones para el carousel
  getPromotions: async () => {
    try {
      const response = await fetch(`${API_URL}/promotions`);
      if (!response.ok) throw new Error('Error fetching promotions');
      return await response.json();
    } catch (error) {
      console.error('❌ Error in getPromotions:', error);
      return [];
    }
  }
};
```

---

## Uso en el Componente Home

```jsx
import { Carousel } from '../components/Carousel';
import { api } from '../services/api';

export function Home() {
  const [promotions, setPromotions] = useState([]);

  useEffect(() => {
    const loadPromotions = async () => {
      const data = await api.getPromotions();
      setPromotions(data);
    };
    loadPromotions();
  }, []);

  return (
    <div className="home">
      <Carousel images={promotions} />
      {/* ... resto del contenido ... */}
    </div>
  );
}
```

---

## Validaciones y Errores

El componente valida:
- ✅ Que `actionValue` no esté vacío
- ✅ Que el `actionType` sea válido
- ⚠️ Si hay errores, se muestran en la consola del navegador

**Ejemplos de logs útiles:**
```
⚠️ Promoción sin destino configurado: {...}
⚠️ Tipo de acción desconocido: 'invalid_type'
```

---

## Testing

Para probar diferentes tipos de redirecciones en desarrollo:

```javascript
// En el navegador console, puedes simular clicks:
const testPromo = {
  id: 99,
  url: 'https://example.com/test.jpg',
  title: 'Test',
  actionType: 'category',
  actionValue: 'frutas'
};

// El click dispara:
// navigate(`/productos?category=frutas`)
```

---

## Notas Importantes

1. **Asegúrate que las categorías/subcategorías existan** en tu base de datos, sino verá "No encontramos coincidencias"
2. **Los IDs de productos deben ser exactos** para que funcione la redirección
3. **Usa URLs HTTPS** para las imágenes en producción
4. **El carousel rotará automáticamente** cada 5 segundos
5. **Los indicadores son clickeables** para saltar a un slide específico

---

## Soporte Futuro

Se pueden agregar más tipos de acciones fácilmente:
- `'collection'` - Colecciones personalizadas
- `'brand'` - Filtrar por marca
- `'promo-code'` - Código de descuento automático
- `'modal'` - Abrir un modal personalizado
