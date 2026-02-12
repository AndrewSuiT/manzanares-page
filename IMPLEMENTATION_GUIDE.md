# 🛠️ Guía de Implementación: Endpoint de Promociones

## Rápido Inicio (5 minutos)

### Paso 1: Agregar endpoint en tu `main.py`

```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Datos de ejemplo (reemplazar con Firestore después)
PROMOTIONS = [
    {
        "id": 1,
        "url": "https://images.unsplash.com/photo-1599599810694-b5ac4dd57f60?w=1200&h=400",
        "title": "Frutas Frescas de Temporada",
        "actionType": "category",
        "actionValue": "frutas",
    },
    {
        "id": 2,
        "url": "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200&h=400",
        "title": "Manzanas Orgánicas",
        "actionType": "subcategory",
        "actionValue": "frutas|manzanas",
    },
    {
        "id": 3,
        "url": "https://images.unsplash.com/photo-1490921575539-c119fb6baff5?w=1200&h=400",
        "title": "Verduras Frescas",
        "actionType": "category",
        "actionValue": "verduras",
    },
]

@app.get("/api/promotions")
async def get_promotions():
    return PROMOTIONS
```

### Paso 2: Agregar llamada en `src/services/api.js`

```javascript
export const api = {
  // ... otros endpoints ...
  
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

### Paso 3: Usar en `src/pages/Home.jsx`

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

## 🔥 Versión con Firebase Firestore

Si usas Firestore, aquí está la versión más robusta:

### Backend: `routes/promotions.py`

```python
from fastapi import APIRouter, HTTPException
from typing import List
from firebase_admin import firestore
from datetime import datetime

router = APIRouter(prefix="/api/promotions", tags=["Promotions"])
db = firestore.client()

@router.get("")
async def get_promotions() -> List[dict]:
    """Obtiene todas las promociones activas ordenadas"""
    try:
        docs = db.collection('promotions').where('active', '==', True).order_by('order').stream()
        promotions = []
        for doc in docs:
            promo = doc.to_dict()
            promo['id'] = doc.id
            promotions.append(promo)
        return promotions
    except Exception as e:
        print(f"Error fetching promotions: {e}")
        return []

@router.get("/{promo_id}")
async def get_promotion(promo_id: str) -> dict:
    """Obtiene una promoción específica"""
    try:
        doc = db.collection('promotions').document(promo_id).get()
        if doc.exists:
            promo = doc.to_dict()
            promo['id'] = doc.id
            return promo
        raise HTTPException(status_code=404, detail="Promoción no encontrada")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

### Agregar en `main.py`

```python
from routes import promotions  # Si lo separas en otro archivo

# Incluir routers
app.include_router(promotions.router)
```

---

## 📊 Estructura de Firestore

Crea una colección llamada `promotions` con esta estructura:

```json
{
  "url": "https://images.unsplash.com/photo-...",
  "title": "Frutas Frescas",
  "actionType": "category",
  "actionValue": "frutas",
  "active": true,
  "order": 1,
  "createdAt": "2026-01-28T10:30:00Z",
  "updatedAt": "2026-01-28T10:30:00Z"
}
```

### Crear documentos en Firestore (manual):

1. Ve a Firebase Console → Firestore Database
2. Crea una colección llamada `promotions`
3. Agrega un nuevo documento con los campos anteriores
4. Repite para cada promoción

### Crear documentos desde Python:

```python
from firebase_admin import firestore

db = firestore.client()

# Crear promoción
db.collection('promotions').document('promo_1').set({
    "url": "https://images.unsplash.com/photo-...",
    "title": "Frutas Frescas",
    "actionType": "category",
    "actionValue": "frutas",
    "active": True,
    "order": 1,
    "createdAt": datetime.now(),
    "updatedAt": datetime.now()
})
```

---

## 🎨 Ejemplos de Promociones (Copiar y Pegar)

### Ejemplo 1: Categoría Simples
```python
PROMOTIONS = [
    {
        "id": 1,
        "url": "https://images.unsplash.com/photo-1599599810694-b5ac4dd57f60?w=1200&h=400",
        "title": "Frutas Frescas",
        "actionType": "category",
        "actionValue": "frutas"
    },
    {
        "id": 2,
        "url": "https://images.unsplash.com/photo-1490921575539-c119fb6baff5?w=1200&h=400",
        "title": "Verduras",
        "actionType": "category",
        "actionValue": "verduras"
    }
]
```

### Ejemplo 2: Con Subcategorías
```python
PROMOTIONS = [
    {
        "id": 1,
        "url": "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200&h=400",
        "title": "Manzanas Orgánicas",
        "actionType": "subcategory",
        "actionValue": "frutas|manzanas"
    },
    {
        "id": 2,
        "url": "https://images.unsplash.com/photo-1464226184837-280ecc440399?w=1200&h=400",
        "title": "Lechugas Frescas",
        "actionType": "subcategory",
        "actionValue": "verduras|lechugas"
    }
]
```

### Ejemplo 3: Con Productos
```python
PROMOTIONS = [
    {
        "id": 1,
        "url": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&h=400",
        "title": "Producto Premium del Mes",
        "actionType": "product",
        "actionValue": "apple-granny-smith-1kg"
    },
    {
        "id": 2,
        "url": "https://images.unsplash.com/photo-1464454709131-ffd692591ee5?w=1200&h=400",
        "title": "Tomates Especiales",
        "actionType": "product",
        "actionValue": "tomato-roma-2kg"
    }
]
```

### Ejemplo 4: Mezcla Total
```python
PROMOTIONS = [
    {
        "id": 1,
        "url": "https://images.unsplash.com/photo-1599599810694-b5ac4dd57f60?w=1200&h=400",
        "title": "Frutas en Oferta",
        "actionType": "category",
        "actionValue": "frutas"
    },
    {
        "id": 2,
        "url": "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200&h=400",
        "title": "Manzanas Gourmet",
        "actionType": "subcategory",
        "actionValue": "frutas|manzanas"
    },
    {
        "id": 3,
        "url": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&h=400",
        "title": "Mejor Precio",
        "actionType": "product",
        "actionValue": "special-promo-123"
    },
    {
        "id": 4,
        "url": "https://images.unsplash.com/photo-1473093295203-cad00df16e50?w=1200&h=400",
        "title": "Busca Ofertas",
        "actionType": "search",
        "actionValue": "descuento oferta"
    }
]
```

---

## ✅ Checklist de Implementación

- [ ] Agregar endpoint `/api/promotions` en backend
- [ ] Crear colección `promotions` en Firestore (si usas Firebase)
- [ ] Agregar método `getPromotions()` en `src/services/api.js`
- [ ] Usar `<Carousel images={promotions} />` en Home.jsx
- [ ] Cargar promociones con `useEffect` en Home.jsx
- [ ] Probar haciendo click en un banner (debe redirigir)
- [ ] Verificar en consola que no hay errores

---

## 🐛 Troubleshooting

| Problema | Solución |
|----------|----------|
| Los banners no cambian | Verifica que `images` tiene datos en el Carousel |
| No redirecciona al hacer click | Revisa que `actionType` y `actionValue` sean válidos |
| Error CORS | Agrega `"http://localhost:5174"` a `allow_origins` |
| Promociones no cargan | Verifica el endpoint `/api/promotions` en backend |
| Categoría/Producto no existe | Asegúrate que el `actionValue` existe en tu BD |

---

## 📞 Soporte

Si tienes problemas, revisa:
1. La consola del navegador (F12 → Console)
2. Los logs del backend
3. La estructura de datos de Firestore
4. Los valores de `actionType` y `actionValue`

---

**¡Listo para implementar! 🚀**
