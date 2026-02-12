# 📸 Vista Visual de Firestore - Promociones

## Cómo Debe Verse tu Firestore

### Vista General de la Colección

```
Firestore Database
│
├── productos (colección existente)
│   ├── doc_1 → { producto 1 }
│   ├── doc_2 → { producto 2 }
│   └── ...
│
├── usuarios (colección existente)
│   ├── uid_1 → { user 1 }
│   └── ...
│
└── PROMOTIONS ← NUEVA COLECCIÓN
    ├── promo_1 (documento)
    │   ├── url: "https://images.unsplash.com/photo-1599599810694-b5ac4dd57f60?w=1200&h=400"
    │   ├── title: "Frutas Frescas de Temporada"
    │   ├── actionType: "category"
    │   ├── actionValue: "frutas"
    │   ├── active: true
    │   └── order: 1
    │
    ├── promo_2 (documento)
    │   ├── url: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200&h=400"
    │   ├── title: "Manzanas Orgánicas Premium"
    │   ├── actionType: "subcategory"
    │   ├── actionValue: "frutas|manzanas"
    │   ├── active: true
    │   └── order: 2
    │
    ├── promo_3 (documento)
    │   ├── url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&h=400"
    │   ├── title: "Producto Premium del Mes"
    │   ├── actionType: "product"
    │   ├── actionValue: "apple-granny-smith-1kg"
    │   ├── active: true
    │   └── order: 3
    │
    ├── promo_4 (documento)
    │   ├── url: "https://images.unsplash.com/photo-1473093295203-cad00df16e50?w=1200&h=400"
    │   ├── title: "Descubre Nuestras Ofertas"
    │   ├── actionType: "search"
    │   ├── actionValue: "oferta descuento"
    │   ├── active: true
    │   └── order: 4
    │
    └── promo_5 (documento)
        ├── url: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=400"
        ├── title: "Lee Nuestro Blog"
        ├── actionType: "url"
        ├── actionValue: "https://blog.manzanares.com"
        ├── active: true
        └── order: 5
```

---

## 🖼️ Captura de Pantalla (Representación)

```
┌─────────────────────────────────────────────────────────────────┐
│ Firestore Database > promotions                                  │
├─────────────────────────────────────────────────────────────────┤
│  Nombre del documento | url | title | actionType | actionValue   │
├─────────────────────────────────────────────────────────────────┤
│  promo_1              | ... | Frutas Frescas | category | frutas │
│  promo_2              | ... | Manzanas       | subcategory | ... │
│  promo_3              | ... | Producto Prem. | product | apple.. │
│  promo_4              | ... | Ofertas        | search | oferta.. │
│  promo_5              | ... | Blog           | url | https://... │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 Cada Documento Expandido

### Documento: promo_1

```
┌─────────────────────────────────────────────────────────┐
│ Colección: promotions                                   │
│ Documento: promo_1 (o Auto ID: randomstring)           │
├─────────────────────────────────────────────────────────┤
│ Campo                │ Tipo      │ Valor              │
├─────────────────────────────────────────────────────────┤
│ url                  │ String    │ https://images...  │
│ title                │ String    │ Frutas Frescas...  │
│ actionType           │ String    │ category           │
│ actionValue          │ String    │ frutas             │
│ active               │ Boolean   │ true               │
│ order                │ Number    │ 1                  │
└─────────────────────────────────────────────────────────┘
```

### Documento: promo_2

```
┌─────────────────────────────────────────────────────────┐
│ Colección: promotions                                   │
│ Documento: promo_2                                      │
├─────────────────────────────────────────────────────────┤
│ Campo                │ Tipo      │ Valor              │
├─────────────────────────────────────────────────────────┤
│ url                  │ String    │ https://images...  │
│ title                │ String    │ Manzanas Orgánicas │
│ actionType           │ String    │ subcategory        │
│ actionValue          │ String    │ frutas|manzanas    │
│ active               │ Boolean   │ true               │
│ order                │ Number    │ 2                  │
└─────────────────────────────────────────────────────────┘
```

### Documento: promo_3

```
┌─────────────────────────────────────────────────────────┐
│ Colección: promotions                                   │
│ Documento: promo_3                                      │
├─────────────────────────────────────────────────────────┤
│ Campo                │ Tipo      │ Valor              │
├─────────────────────────────────────────────────────────┤
│ url                  │ String    │ https://images...  │
│ title                │ String    │ Producto del Mes   │
│ actionType           │ String    │ product            │
│ actionValue          │ String    │ apple-granny-... │
│ active               │ Boolean   │ true               │
│ order                │ Number    │ 3                  │
└─────────────────────────────────────────────────────────┘
```

---

## 🎬 Pasos en Firebase Console

### Paso 1: Crear Colección

```
Firebase Console
    ↓
Firestore Database (en el menú izquierdo)
    ↓
Botón "+ Crear Colección"
    ↓
Nombre: "promotions"
    ↓
Siguiente
```

### Paso 2: Agregar Primer Documento

```
Haz clic en "+ Agregar Documento"
    ↓
Selecciona "Auto ID" (o ingresa un ID manual)
    ↓
Agrega los campos:
    ├─ url (String)
    ├─ title (String)
    ├─ actionType (String)
    ├─ actionValue (String)
    ├─ active (Boolean)
    └─ order (Number)
    ↓
Haz clic en "Guardar"
```

### Paso 3: Agregar Más Documentos

```
Repite el Paso 2 para cada promoción
    ↓
Incremente el campo "order" en cada documento:
    ├─ Primer doc: order = 1
    ├─ Segundo doc: order = 2
    ├─ Tercer doc: order = 3
    └─ ...
```

---

## 📐 Dimensiones y Límites

| Aspecto | Recomendación |
|---------|--------------|
| **Tamaño de imagen** | 1200x400px |
| **Formato de imagen** | JPG, PNG |
| **Máximo de promociones** | Sin límite |
| **Nombre colección** | `promotions` (exactamente) |
| **Campos obligatorios** | Todos 6 |
| **Caracteres título** | 30-60 caracteres |
| **URL máxima** | 500 caracteres |

---

## 🔍 Verificar Que Esté Correcto

Después de agregar una promoción, debería verse así:

```
✅ Colección visible: "promotions"
✅ Documentos visibles: promo_1, promo_2, etc.
✅ Cada documento con 6 campos
✅ Campo "active" = true
✅ Campo "order" = números secuenciales
✅ Sin campos vacíos
✅ Sin errores mostrados
```

---

## 🚨 Errores Comunes y Cómo Evitarlos

### Error 1: Colección se llama "Promotions" (con mayúscula)
```
❌ Promotions
✅ promotions
```

### Error 2: Faltan campos
```
❌ Solo agregué: url, title, actionType
✅ Debo agregar todos: url, title, actionType, actionValue, active, order
```

### Error 3: active = false
```
❌ active: false (promoción oculta)
✅ active: true (promoción visible)
```

### Error 4: actionValue vacío
```
❌ actionValue: ""
✅ actionValue: "frutas"
```

### Error 5: order = 0 o números aleatorios
```
❌ order: 0, order: 10, order: 100
✅ order: 1, order: 2, order: 3
```

### Error 6: URL inválida
```
❌ https://example.com/image (sin parámetros)
✅ https://example.com/image?w=1200&h=400
```

---

## 🎯 Checklist Visual

Antes de presionar guardar, verifica:

```
□ Campo: url        Tipo: String     Valor: https://...        ✓
□ Campo: title      Tipo: String     Valor: Texto visible      ✓
□ Campo: actionType Tipo: String     Valor: category/...       ✓
□ Campo: actionValue Tipo: String    Valor: nombre/id          ✓
□ Campo: active     Tipo: Boolean    Valor: true               ✓
□ Campo: order      Tipo: Number     Valor: 1, 2, 3...        ✓

               → Guardar
```

---

## 📊 Ejemplo Real Completo

### Promoción 1: Frutas

```
Colección: promotions
Documento ID: auto_generated_id_1 (o "frutas_promocion")

Fields:
- url:          "https://images.unsplash.com/photo-1599599810694-b5ac4dd57f60?w=1200&h=400"
- title:        "Frutas Frescas de Temporada"
- actionType:   "category"
- actionValue:  "frutas"
- active:       true
- order:        1
```

**Resultado:** Al hacer click → `/productos?category=frutas`

---

### Promoción 2: Manzanas

```
Colección: promotions
Documento ID: auto_generated_id_2

Fields:
- url:          "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200&h=400"
- title:        "Manzanas Orgánicas Premium"
- actionType:   "subcategory"
- actionValue:  "frutas|manzanas"
- active:       true
- order:        2
```

**Resultado:** Al hacer click → `/productos?category=frutas&subcategory=manzanas`

---

### Promoción 3: Producto

```
Colección: promotions
Documento ID: auto_generated_id_3

Fields:
- url:          "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&h=400"
- title:        "Manzana Granny Smith Premium"
- actionType:   "product"
- actionValue:  "apple-granny-smith-1kg"
- active:       true
- order:        3
```

**Resultado:** Al hacer click → `/producto/apple-granny-smith-1kg`

---

## 💾 Guardar y Verificar

```
1. Ingresa todos los campos
        ↓
2. Haz clic en "Guardar"
        ↓
3. Verifica que aparezca en la lista
        ↓
4. Recarga tu app (F5)
        ↓
5. La promoción debería aparecer en el carousel
```

---

## 🎉 Listo

Una vez que tengas la colección `promotions` con documentos correctos:

- ✅ Backend la sirve automáticamente
- ✅ Frontend la carga automáticamente
- ✅ Carousel la renderiza automáticamente
- ✅ Los clicks redirigen automáticamente

**No necesitas hacer nada más en código.**

---

**Ahora ve a Firebase Console y crea tu colección de promociones.** 🚀
