# 💼 Casos de Uso: Ejemplos Prácticos

## Caso 1: Banner Promocional → Categoría

**Situación:** Quieres que un banner lleve a los usuarios a ver todas las frutas disponibles.

```javascript
{
  "id": 1,
  "url": "https://cdn.example.com/frutas-banner.jpg",
  "title": "Frutas Frescas en Oferta 🍎",
  "actionType": "category",
  "actionValue": "frutas"
}
```

**Resultado:** Click en el banner → `/productos?category=frutas`

---

## Caso 2: Banner Promocional → Subcategoría

**Situación:** Quieres destacar manzanas específicamente dentro de frutas.

```javascript
{
  "id": 2,
  "url": "https://cdn.example.com/manzanas-banner.jpg",
  "title": "Manzanas Orgánicas Premium 🌱",
  "actionType": "subcategory",
  "actionValue": "frutas|manzanas"
}
```

**Resultado:** Click en el banner → `/productos?category=frutas&subcategory=manzanas`

---

## Caso 3: Banner Promocional → Producto Específico

**Situación:** Tienes un producto en oferta especial que quieres destacar.

```javascript
{
  "id": 3,
  "url": "https://cdn.example.com/producto-destacado.jpg",
  "title": "Manzana Granny Smith - 50% OFF ⚡",
  "actionType": "product",
  "actionValue": "apple-granny-smith-1kg-id123"
}
```

**Resultado:** Click en el banner → `/producto/apple-granny-smith-1kg-id123`

---

## Caso 4: Banner de Búsqueda

**Situación:** Quieres dirigir a usuarios a buscar productos con descuento.

```javascript
{
  "id": 4,
  "url": "https://cdn.example.com/ofertas-banner.jpg",
  "title": "Descubre Nuestras Mejores Ofertas 🎉",
  "actionType": "search",
  "actionValue": "oferta descuento"
}
```

**Resultado:** Click en el banner → `/buscar?q=oferta+descuento`

---

## Caso 5: Banner que Abre URL Externa

**Situación:** Quieres que un banner lleve a tu blog o red social.

```javascript
{
  "id": 5,
  "url": "https://cdn.example.com/blog-banner.jpg",
  "title": "Lee Nuestros Tips de Salud 📖",
  "actionType": "url",
  "actionValue": "https://blog.manzanares.com/tips-frutas-saludables"
}
```

**Resultado:** Click en el banner → Se abre en nueva pestaña

---

## 🎯 Estrategia de Marketing Completa

```python
# Estructura de una campaña promocional bien pensada
PROMOTIONS = [
    # 1. Banner principal - Categoría popular
    {
        "id": 1,
        "url": "https://cdn.example.com/main-frutas.jpg",
        "title": "Frutas Frescas de Temporada",
        "actionType": "category",
        "actionValue": "frutas",
        "order": 1
    },
    
    # 2. Destaque de subcategoría con oferta
    {
        "id": 2,
        "url": "https://cdn.example.com/manzanas-special.jpg",
        "title": "Manzanas Orgánicas - 30% Descuento",
        "actionType": "subcategory",
        "actionValue": "frutas|manzanas",
        "order": 2
    },
    
    # 3. Producto específico de alto valor
    {
        "id": 3,
        "url": "https://cdn.example.com/premium-producto.jpg",
        "title": "Producto Premium del Mes",
        "actionType": "product",
        "actionValue": "premium-organic-apple-2kg",
        "order": 3
    },
    
    # 4. Búsqueda temática
    {
        "id": 4,
        "url": "https://cdn.example.com/naturales.jpg",
        "title": "Productos Naturales y Orgánicos",
        "actionType": "search",
        "actionValue": "orgánico natural ecológico",
        "order": 4
    },
    
    # 5. Redirección externa - Blog
    {
        "id": 5,
        "url": "https://cdn.example.com/blog-banner.jpg",
        "title": "Lee Nuestro Blog de Nutrición",
        "actionType": "url",
        "actionValue": "https://blog.manzanares.com",
        "order": 5
    }
]
```

---

## 📊 Matriz de Decisión

**¿Qué tipo de acción usar?**

| Objetivo | ActionType | ActionValue Ejemplo |
|----------|-----------|-------------------|
| Mostrar todos los productos de una categoría | `category` | `"frutas"` |
| Destacar subcategoría específica | `subcategory` | `"frutas\|manzanas"` |
| Promocionar UN producto | `product` | `"apple-granny-smith-1kg"` |
| Búsqueda temática (ej: ofertas) | `search` | `"oferta descuento"` |
| Link externo (blog, redes) | `url` | `"https://blog.com"` |

---

## 🔄 Ciclo de Vida de una Promoción

```
1. CREACIÓN
   └─ Crear promoción en Firestore con status "active": false

2. CONFIGURACIÓN
   └─ Definir actionType y actionValue
   └─ Establecer orden (order: 1, 2, 3...)

3. ACTIVACIÓN
   └─ Cambiar "active" a true en Firestore

4. MONITOREO (Opcional)
   └─ Rastrear clics en cada promoción
   └─ Medir conversiones

5. DESACTIVACIÓN
   └─ Cambiar "active" a false cuando expire

6. ANÁLISIS
   └─ Revisar métricas y ajustar estrategia
```

---

## 💡 Tips Avanzados

### Rotación de Promociones
```python
# Cada semana cambias las promociones
# Semana 1: Frutas en oferta
# Semana 2: Verduras en oferta
# Semana 3: Productos orgánicos
# Semana 4: Promoción especial
```

### Promociones por Temporada
```python
PROMOTIONS = [
    # Invierno
    {"id": 1, "actionValue": "verduras", "season": "winter"},
    # Verano
    {"id": 2, "actionValue": "frutas", "season": "summer"},
]
```

### Tracking de Clics (Avanzado)
```javascript
// En handlePromotionClick(), enviar evento:
api.trackPromoClick(slide.id, actionType, actionValue);
```

### A/B Testing
```python
# Versión A del banner
{"id": 1, "title": "Ofertas Especiales", "actionType": "search", "actionValue": "oferta"}

# Versión B del banner
{"id": 2, "title": "Productos en Descuento", "actionType": "search", "actionValue": "descuento"}

# Mostrar random a usuarios y medir conversión
```

---

## 🎨 Buenas Prácticas de Diseño

1. **Imágenes de calidad:** Usa imágenes HD (1200x400px mínimo)
2. **Textos claros:** El título debe ser legible desde lejos
3. **Llamada a acción:** "Compra Ahora", "Descubre", "Ver Oferta"
4. **Colores contrastantes:** Que se vea bien contra el fondo
5. **Relevancia:** La imagen debe coincidir con el destino
6. **Velocidad:** Las imágenes deben cargar rápido (comprimir)

---

## ❌ Errores Comunes a Evitar

| ❌ Error | ✅ Solución |
|---------|----------|
| `actionValue: ""` (vacío) | Siempre proporcionar un valor |
| `actionType: "invalid"` | Usar solo: category, subcategory, product, search, url |
| `actionValue: "Frutas"` (con mayúscula) | Usar minúsculas o coincidir exactamente con BD |
| Imágenes rotas | Verificar URLs en Firestore |
| Categoria inexistente | Validar que exista en tu BD |
| Banners sin enlace | Todos deben tener actionType y actionValue |

---

## 📈 Métricas a Rastrear

Para medir el éxito de tus promociones:

```javascript
// Evento a implementar en handlePromotionClick
{
  "event": "promo_click",
  "promo_id": slide.id,
  "promo_title": slide.title,
  "action_type": actionType,
  "action_value": actionValue,
  "timestamp": new Date().toISOString(),
  "user_id": user?.uid || "guest"
}
```

Luego analizar:
- CTR (Click-Through Rate) por promoción
- Conversion Rate (clicks → compras)
- Tiempo promedio de permanencia
- Tasa de rebote

---

## 🚀 Plan de Ejecución

```
Semana 1: Implementar 3-5 promociones básicas (categorías)
Semana 2: Agregar promociones de productos específicos
Semana 3: Implementar tracking de clics
Semana 4: Analizar datos y optimizar
Semana 5: Agregar más tipos (búsqueda, URLs externas)
```

---

**¡Ahora estás listo para crear una estrategia de promociones exitosa! 🎯**
