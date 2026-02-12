# ✅ Implementación: Carousel con Redirecciones Inteligentes

## Resumen de Cambios

He actualizado el componente `Carousel.jsx` para permitir redirecciones dinámicas a categorías, productos, búsquedas o URLs externas.

---

## 🎯 Tipos de Redirecciones Soportadas

| Tipo | ActionType | Ejemplo | Destino |
|------|-----------|---------|---------|
| **Categoría** | `category` | `actionValue: "frutas"` | `/productos?category=frutas` |
| **Subcategoría** | `subcategory` | `actionValue: "frutas\|manzanas"` | `/productos?category=frutas&subcategory=manzanas` |
| **Producto** | `product` | `actionValue: "apple-granny-1kg"` | `/producto/apple-granny-1kg` |
| **Búsqueda** | `search` | `actionValue: "manzanas rojas"` | `/buscar?q=manzanas+rojas` |
| **URL Externa** | `url` | `actionValue: "https://blog.com"` | Abre en nueva pestaña |

---

## 📋 Estructura de Datos Esperada

```javascript
{
  id: 1,                           // ID único
  url: "https://cdn.example.com/banner.jpg",  // Imagen del banner
  title: "Título de la Promoción", // Texto a mostrar
  actionType: "category",          // Tipo de acción
  actionValue: "frutas"            // Valor específico
}
```

---

## 🔧 Ejemplo de Configuración en Backend

### FastAPI (Python)
```python
# En tu main.py o routes
@router.get("/api/promotions")
async def get_promotions():
    return [
        {
            "id": 1,
            "url": "https://...",
            "title": "Frutas Frescas",
            "actionType": "category",
            "actionValue": "frutas"
        },
        {
            "id": 2,
            "url": "https://...",
            "title": "Manzanas",
            "actionType": "subcategory",
            "actionValue": "frutas|manzanas"
        }
    ]
```

### Firestore (Firebase)
```
promotions/
├── doc_1: { title, url, actionType, actionValue, active, order }
├── doc_2: { title, url, actionType, actionValue, active, order }
└── ...
```

---

## 🚀 Uso en el Frontend

```jsx
// En Home.jsx
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
    <div>
      <Carousel images={promotions} />
      {/* ... más contenido ... */}
    </div>
  );
}
```

---

## 📝 Archivos Creados/Modificados

✅ **Modificado:** `src/components/Carousel.jsx`
- ✨ Ahora importa `useNavigate` de React Router
- ✨ Nueva función `handlePromotionClick()` con lógica de redirección
- ✨ Soporta 5 tipos diferentes de acciones
- ✨ Mantiene retrocompatibilidad con estructura antigua

✅ **Creado:** `PROMOCIONES_GUIDE.md`
- 📖 Documentación completa sobre cómo configurar promociones
- 📖 Ejemplos para cada tipo de acción
- 📖 Instrucciones de integración backend

✅ **Creado:** `backend-backup/ejemplo_promotions.py`
- 🐍 Ejemplos de código Python/FastAPI
- 🐍 Estructura de Firestore
- 🐍 Endpoints CRUD para promociones

---

## ⚡ Características

✅ **Redirecciones Inteligentes** - Soporta múltiples tipos de destinos  
✅ **Retrocompatibilidad** - Las promociones antiguas aún funcionan  
✅ **Validación** - Logs de advertencia si hay configuraciones inválidas  
✅ **URLs Dinámicas** - Encoda automáticamente parámetros URL  
✅ **Cursor Interactivo** - El cursor cambia a puntero al pasar sobre un banner  
✅ **Facil de Mantener** - Lógica clara y bien documentada  

---

## 🧪 Testing Rápido

Para probar en la consola del navegador:

```javascript
// Simula un click en una promoción de categoría
navigate('/productos?category=frutas');

// Simula un click en un producto específico
navigate('/producto/apple-granny-smith-1kg');

// Simula una búsqueda
navigate('/buscar?q=manzanas+rojas');
```

---

## 📚 Referencias

- Ver `PROMOCIONES_GUIDE.md` para documentación completa
- Ver `backend-backup/ejemplo_promotions.py` para ejemplos de backend
- El componente está en `src/components/Carousel.jsx`

---

## 💡 Próximos Pasos (Opcional)

1. Implementar el endpoint `/api/promotions` en tu backend
2. Crear una interfaz de admin para gestionar promociones
3. Agregar soporte para horarios de activación/desactivación de promociones
4. Implementar tracking de clics en promociones

---

**¡Implementación completada! ✅**
