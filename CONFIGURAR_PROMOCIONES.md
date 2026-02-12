# ✅ Configuración Completa del Carrusel de Promociones

## Estado Actual

✅ **Backend:** Completamente configurado
✅ **Frontend:** Completamente configurado
✅ **API:** Endpoints listos

Solo falta: **Agregar las promociones en Firestore**

---

## 📋 Paso a Paso para Configurar Promociones en Firestore

### Paso 1: Acceder a Firebase Console

1. Ve a https://console.firebase.google.com/
2. Selecciona tu proyecto
3. Ve a **Firestore Database** (lado izquierdo)

---

### Paso 2: Crear la Colección "promotions"

1. Haz clic en **+ Crear Colección**
2. Nombre: `promotions` (en minúsculas)
3. Haz clic en **Siguiente**

---

### Paso 3: Agregar el Primer Documento

Haz clic en **Agregar documento**. El sistema te mostrará un panel para ingresar datos.

**Opción A: Generar ID automático**
- Haz clic en **Auto ID** (recomendado)

**Opción B: Ingresar ID manual**
- Escribe algo como: `promo_1`, `promo_frutas`, etc.

---

### Paso 4: Agregar los Campos

Para cada promoción, agrega estos campos exactamente como se muestran:

```
Colección: promotions
├── doc_id (Auto o manual)
│   ├── url (string)
│   ├── title (string)
│   ├── actionType (string)
│   ├── actionValue (string)
│   ├── active (boolean)
│   └── order (number)
```

---

## 📝 Ejemplos para Copiar y Pegar

### Ejemplo 1: Categoría Frutas

```
URL:         https://images.unsplash.com/photo-1599599810694-b5ac4dd57f60?w=1200&h=400
Title:       Frutas Frescas de Temporada
ActionType:  category
ActionValue: frutas
Active:      true
Order:       1
```

### Ejemplo 2: Subcategoría Manzanas

```
URL:         https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200&h=400
Title:       Manzanas Orgánicas
ActionType:  subcategory
ActionValue: frutas|manzanas
Active:      true
Order:       2
```

### Ejemplo 3: Producto Específico

```
URL:         https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&h=400
Title:       Manzana Premium del Mes
ActionType:  product
ActionValue: apple-granny-smith-1kg
Active:      true
Order:       3
```

### Ejemplo 4: Búsqueda

```
URL:         https://images.unsplash.com/photo-1473093295203-cad00df16e50?w=1200&h=400
Title:       Descubre Nuestras Ofertas
ActionType:  search
ActionValue: oferta descuento
Active:      true
Order:       4
```

### Ejemplo 5: URL Externa

```
URL:         https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=400
Title:       Lee Nuestro Blog
ActionType:  url
ActionValue: https://blog.manzanares.com
Active:      true
Order:       5
```

---

## 🖱️ Pasos en Firebase Console (Detallado)

### Para Agregar Cada Campo:

1. **Abre un nuevo documento** en la colección `promotions`
2. **Haz clic en agregar campo**
3. **Ingresa el nombre del campo** (ej: `url`, `title`, etc.)
4. **Selecciona el tipo de dato:**
   - `url`, `title`, `actionType`, `actionValue` → **String**
   - `active` → **Boolean**
   - `order` → **Number**
5. **Ingresa el valor** correspondiente
6. **Haz clic en Guardar**

---

## 📊 Tabla de Tipos de Datos

| Campo | Tipo | Ejemplo |
|-------|------|---------|
| `url` | String | `https://images.unsplash.com/...` |
| `title` | String | `Frutas Frescas` |
| `actionType` | String | `category` o `subcategory` o `product` o `search` o `url` |
| `actionValue` | String | `frutas` o `frutas\|manzanas` o `apple-id` o `oferta` |
| `active` | Boolean | `true` o `false` |
| `order` | Number | `1`, `2`, `3`, etc. |

---

## ⚠️ Requisitos Importantes

1. **TODOS los campos son obligatorios** - No puede faltar ninguno
2. **`active` debe ser `true`** para que aparezcan en el carousel
3. **`order` debe ser único y ordenado** - Usa 1, 2, 3, 4, 5... (no valores aleatorios)
4. **`actionValue` debe existir:**
   - Si es `category`: Debe existir una categoría con ese nombre en tu BD
   - Si es `product`: Debe existir un producto con ese ID
   - Si es `subcategory`: Formato es `Categoria|Subcategoria` (con el |)
5. **Las URLs deben ser válidas** - Pueden ser HTTPS URLs externas

---

## ✅ Checklist de Configuración

- [ ] Creé la colección `promotions` en Firestore
- [ ] Agregué al menos una promoción
- [ ] Todos los documentos tienen los 6 campos requeridos
- [ ] El campo `active` está en `true`
- [ ] El campo `order` está bien numerado (1, 2, 3...)
- [ ] Las URLs apuntan a imágenes válidas
- [ ] Los `actionValue` coinciden con mis categorías/productos
- [ ] Testeé haciendo click en el carousel (debe redirigir)

---

## 🧪 Testing

Después de agregar las promociones:

1. **Guarda los cambios en Firebase** (debe estar guardado automáticamente)
2. **Ve a tu app** (http://localhost:5174)
3. **Abre el Home**
4. **El carousel debería mostrar tus promociones**
5. **Haz click en una promoción** - Debería redirigir al destino

Si no aparecen:
- Revisa la consola del navegador (F12)
- Verifica que `active: true` en Firestore
- Verifica que el endpoint `/api/promotions` devuelva datos

---

## 🔧 Editar/Eliminar Promociones

### Para Editar:
1. Abre Firestore
2. Ve a la colección `promotions`
3. Haz clic en el documento
4. Edita los campos que desees
5. Guarda automáticamente

### Para Eliminar:
1. Abre Firestore
2. Ve a la colección `promotions`
3. Haz clic en los 3 puntos del documento
4. Selecciona **Eliminar documento**

### Para Desactivar (sin eliminar):
1. Cambia `active` de `true` a `false`
2. La promoción desaparecerá del carousel pero el documento se mantiene

---

## 📸 Imágenes Recomendadas

Puedes usar:
- **Unsplash** (gratis): https://unsplash.com
- **Pexels** (gratis): https://pexels.com
- **Tu CDN privado**: Si tienes imágenes subidas

Dimensiones recomendadas: **1200x400px**

---

## 🎯 Estructura Completa de Firestore

Así debería verse tu Firestore después de agregar promociones:

```
Firestore Database
├── promociones (colección)
│   ├── doc_1 (document)
│   │   ├── url: "https://..."
│   │   ├── title: "Frutas"
│   │   ├── actionType: "category"
│   │   ├── actionValue: "frutas"
│   │   ├── active: true
│   │   └── order: 1
│   │
│   ├── doc_2 (document)
│   │   ├── url: "https://..."
│   │   ├── title: "Manzanas"
│   │   ├── actionType: "subcategory"
│   │   ├── actionValue: "frutas|manzanas"
│   │   ├── active: true
│   │   └── order: 2
│   │
│   └── doc_3 (document)
│       ├── url: "https://..."
│       ├── title: "Producto Premium"
│       ├── actionType: "product"
│       ├── actionValue: "apple-granny-smith-1kg"
│       ├── active: true
│       └── order: 3
└── ...
```

---

## 🚀 ¡Listo!

Una vez que tengas las promociones en Firestore:

1. El backend automáticamente las servirá por `/api/promotions`
2. El frontend las cargará automáticamente en Home.jsx
3. El carousel las mostrará y redirigirá correctamente

**No necesitas reiniciar nada - Todo es dinámico.**

---

## 💡 Preguntas Frecuentes

**P: ¿Puedo cambiar el orden después de crear?**
R: Sí, edita el campo `order` en Firestore.

**P: ¿Puedo tener promociones inactivas?**
R: Sí, cambia `active` a `false`.

**P: ¿Cuántas promociones puedo tener?**
R: Las que quieras, el carousel las rotará automáticamente.

**P: ¿Se actualizan en tiempo real?**
R: Sí, al cambiar algo en Firestore se refleja al recargar la página.

**P: ¿Debo hacer deploy para que funcione?**
R: No, si estás en desarrollo local, los cambios aparecen al recargar.

---

## 📞 Si Hay Problemas

1. **Verifica la consola** (F12 → Console)
2. **Revisa que `active: true`** en Firestore
3. **Verifica que la colección se llama exactamente `promotions`**
4. **Asegúrate que todos los campos están correctos**
5. **Recarga la página** (Ctrl + R)

---

**¡Ya está todo listo! Solo agrega las promociones en Firestore y listo.** 🎉
