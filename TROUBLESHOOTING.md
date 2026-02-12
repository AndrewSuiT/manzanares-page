# 🔧 TROUBLESHOOTING: Promociones No Aparecen

## Checklist de Verificación Paso a Paso

### Paso 1: Verificar Firestore ✅

1. Abre https://console.firebase.google.com/
2. Ve a **Firestore Database**
3. Busca la colección **`promotions`**
4. Verifica que tengas al menos un documento
5. Abre un documento y revisa:
   - ✅ Tiene 6 campos: `url`, `title`, `actionType`, `actionValue`, `active`, `order`
   - ✅ `active` está en `true`
   - ✅ `order` es un número (1, 2, 3...)

**Si aquí falla:**
```
→ Ve a CONFIGURAR_PROMOCIONES.md
→ Sigue los pasos para crear la colección
```

---

### Paso 2: Verificar Backend ✅

Abre el terminal y ejecuta:

```bash
# En la carpeta del backend
curl http://localhost:8001/api/promotions
```

Deberías ver una respuesta como:

```json
[
    {
        "id": "doc_id",
        "url": "https://...",
        "title": "Frutas",
        "actionType": "category",
        "actionValue": "frutas",
        "active": true,
        "order": 1
    }
]
```

**Si ves un array vacío `[]`:**
- La colección de Firestore está vacía o no se llama "promotions"
- Los documentos no tienen `active: true`

**Si ves un error:**
- El backend no está corriendo
- Hay un problema en firebase_service.py

---

### Paso 3: Verificar Frontend - Consola del Navegador ✅

1. Abre tu app: http://localhost:5174
2. **Presiona F12** para abrir Dev Tools
3. Ve a la pestaña **Console**
4. Busca los siguientes logs:

```
✅ Si ves esto:
"✅ Promociones cargadas: [...]"

❌ Si ves esto:
"❌ Error cargando promociones: ..."
```

**Si no ves ningún log:**
- El useEffect de carga de promociones no se está ejecutando
- Hay un problema en Home.jsx

---

### Paso 4: Verificar Network (Petición API) ✅

1. En Dev Tools, ve a la pestaña **Network**
2. Recarga la página (Ctrl + R)
3. Busca una petición llamada `promotions`
4. Haz click y revisa:
   - **Status:** Debe ser `200` (éxito)
   - **Response:** Debe mostrar un array con tus promociones
   - **Size:** Debe ser > 0

**Si ves `404`:**
- El endpoint `/api/promotions` no existe en el backend

**Si ves `500`:**
- Hay un error en el backend

**Si no aparece la petición:**
- api.getPromotions() no se está llamando

---

## 🔍 Verificaciones Específicas

### ¿El archivo api.js tiene getPromotions()?

Abre `src/services/api.js` y busca:

```javascript
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
```

**Si no está:** Necesito agregarlo.

---

### ¿Home.jsx está cargando las promociones?

Abre `src/pages/Home.jsx` y busca:

```javascript
// Debe haber un useEffect que cargue promociones:
useEffect(() => {
    const loadPromotions = async () => {
        try {
            const promos = await api.getPromotions();
            console.log('✅ Promociones cargadas:', promos);
            setPromotions(promos);
        } catch (error) {
            console.error('❌ Error cargando promociones:', error);
        }
    };
    loadPromotions();
}, []);

// Y debe pasar las promociones al Carousel:
<Carousel images={promotions} />
```

**Si no está:** Necesito agregarlo.

---

### ¿El Carousel recibe el parámetro `images`?

Abre `src/components/Carousel.jsx` y verifica que:

```javascript
export function Carousel({ images = [] }) {
    // ... resto del código
}

const slides = images.length > 0 ? images : defaultImages;
```

---

## 🐛 Problemas Comunes y Soluciones

### Problema 1: "Error 404 en `/api/promotions`"

**Solución:**
```
1. El backend no tiene el endpoint
2. Verifica que routes/products.py tenga:
   @router.get("/promotions")
   async def get_promotions():
       return firebase_service.get_promotions()
```

---

### Problema 2: "Error 500 en `/api/promotions`"

**Solución:**
```
1. Hay un error en firebase_service.py
2. Verifica que tenga el método get_promotions():
   def get_promotions(self) -> List[dict]:
       query = promotions_ref.where('active', '==', True).order_by('order')
       # ... resto del código
3. Revisa los logs del backend para ver el error exacto
```

---

### Problema 3: "Array vacío `[]` en la respuesta"

**Solución:**
```
1. La colección 'promotions' está vacía
2. Los documentos no tienen active: true
3. Los documentos no están en Firestore correctamente

Pasos:
- Abre Firebase Console
- Ve a Firestore Database
- Busca la colección 'promotions'
- Verifica que haya documentos
- Verifica que active = true
```

---

### Problema 4: "Console dice 'Error in getPromotions'"

**Solución:**
```
El fetch a /api/promotions falló. Revisa:

1. ¿El backend está corriendo?
   → npm run dev (en la carpeta del frontend)
   → python main.py (en la carpeta del backend)

2. ¿El URL es correcto?
   → Debe ser /api/promotions (no /promotions)

3. ¿CORS está configurado?
   → Verifica que el backend acepte el origen
```

---

### Problema 5: "El carousel se ve pero sin imágenes"

**Solución:**
```
1. Las imágenes se cargaron pero las URLs son inválidas
2. Revisa que cada promoción tenga una URL válida HTTPS
3. Prueba la URL en el navegador directamente
4. Si no carga la imagen, la URL es inválida
```

---

## 📋 Test Rápido

Copia esto en la consola del navegador (F12 > Console):

```javascript
// Test 1: Verificar que api existe
console.log('api:', typeof api);

// Test 2: Llamar a getPromotions directamente
api.getPromotions().then(promos => {
    console.log('Promociones:', promos);
});

// Test 3: Verificar que el Carousel recibe datos
// Abre el Dev Tools > React Developer Tools y busca el componente Carousel
// Verifica que tenga: images: [...]
```

---

## 🔄 Reiniciar Todo

Si nada funciona, reinicia en este orden:

```bash
# 1. Cierra el backend
# Ctrl + C en el terminal del backend

# 2. Cierra el frontend
# Ctrl + C en el terminal del frontend

# 3. Limpia caché
# Borra la carpeta node_modules (opcional):
# rm -r node_modules

# 4. Reinstala dependencias
npm install

# 5. Reinicia el frontend
npm run dev

# 6. Reinicia el backend
python main.py

# 7. Abre http://localhost:5174
# 8. Presiona Ctrl + Shift + R (reload fuerte)
```

---

## ✅ Checklist Final

```
□ Firestore tiene colección 'promotions'
□ Los documentos tienen 6 campos
□ active = true en todos
□ Backend tiene endpoint GET /api/promotions
□ firebase_service.py tiene método get_promotions()
□ api.js tiene método getPromotions()
□ Home.jsx carga promociones con useEffect
□ Home.jsx pasa images={promotions} a Carousel
□ Carousel.jsx recibe el parámetro images
□ No hay errores en la consola (F12)
□ El Network muestra GET /api/promotions con status 200
□ La respuesta del endpoint es un array con datos
```

---

## 📞 Cómo Reportar el Problema

Si aún no funciona, revisa:

1. La consola del navegador (F12 > Console)
2. El Network (F12 > Network > busca "promotions")
3. Los logs del backend
4. El contenido de Firestore (¿existen los documentos?)

**Luego puedes decirme:**
- ¿Qué ves en la consola exactamente?
- ¿Cuál es el status de la petición /api/promotions?
- ¿Qué dice Firestore cuando abres la colección promotions?

---

**Lee esta guía completa y sigue cada paso. El 99% de los problemas se resuelven aquí.** ✅
