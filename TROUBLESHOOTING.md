import firebase_admin
from firebase_admin import credentials, firestore
from app.config import settings
from typing import List, Optional
from functools import lru_cache
import logging
import time
import random
import string

logger = logging.getLogger(__name__)

class FirebaseService:
    def __init__(self):
        self.db = None
        self.initialized = False
        self._search_cache = []
        self._last_cache_time = 0
        self._CACHE_DURATION = 600
    
    def initialize(self):
        try:
            if not self.initialized:
                cred = credentials.Certificate(settings.firebase_credentials_path)
                firebase_admin.initialize_app(cred)
                self.db = firestore.client()
                self.initialized = True
                logger.info("Firebase inicializado correctamente")
        except Exception as e:
            logger.error(f"Error inicializando Firebase: {e}")
            raise

    def _translate_doc(self, doc):
        d = doc.to_dict()
        if not d: return None

        specs = d.get("especificaciones", {})
        if not isinstance(specs, dict): specs = {}
        
        stock_val = 0
        try: stock_val = int(d.get("stock", 0))
        except: pass

        raw_tags = [
            str(d.get("marca", "")),
            str(d.get("categoria", "")),
            str(d.get("subcategoria", "")),
            str(d.get("etiqueta", ""))
        ]
        tags_final = list(set([t for t in raw_tags if t and t.strip() not in ["", "None", "sin marca"]]))

        return {
            "id": doc.id,
            "code": str(d.get("codigo", "")),
            "name": str(d.get("descripcion", "Sin nombre")),
            "description": str(d.get("descripcion_detallada") or d.get("descripcion", "")),
            "category": str(d.get("categoria", "General")),
            "subcategory": str(d.get("subcategoria", "")),
            "price": float(d.get("precio", 0) or 0),
            "image_url": d.get("img_item") or d.get("imagen") or "https://i.imgur.com/NpSGH68.jpg",
            "tags": tags_final,
            "marca": str(d.get("marca", "Sin marca")),
            "etiqueta": str(d.get("etiqueta", "")),
            "stock": stock_val,
            "stock_verified": bool(d.get("stock_verified", False)),
            "created_at": None,
            "specifications": specs
        }

    def get_products_by_ids(self, product_ids: List[str]) -> List[dict]:
        """Obtiene multiples productos en UNA sola consulta de red"""
        if not product_ids: return []
        
        try:
            # Firestore permite buscar hasta 30 items con 'in', pero get_all es mas eficiente por referencias
            refs = [self.db.collection('productos').document(pid) for pid in product_ids]
            docs = self.db.get_all(refs) # ESTO ES LA MAGIA: 1 SOLA CONSULTA
            
            discounts = self.get_discounts()
            products = []
            
            for doc in docs:
                if doc.exists:
                    p = self._translate_doc(doc)
                    # Aplicar descuento
                    discount = self.get_discount_for_product(p, discounts)
                    p['discount_amount'] = discount
                    if discount > 0:
                        p['original_price'] = p['price']
                        # Redondeo entero para consistencia
                        p['price'] = round(p['price'] - discount)
                    products.append(p)
            return products
        except Exception as e:
            logger.error(f"Error en batch get: {e}")
            return []

    # --- NUEVA FUNCIoN: SIMILARES DIRECTO DE DB ---
    def get_similar_products_db(self, product_id: str, category: str, subcategory: str = None, limit: int = 6) -> List[dict]:
        """Busca similares usando queries eficientes en lugar de descargar todo"""
        try:
            products_ref = self.db.collection('productos')
            
            # Intentar buscar por misma subcategoria primero (mas relevante)
            # Agregamos filtro basico de stock aqui tambien
            query = products_ref.where('activo', '==', True).where('stock', '>=', 1)
            
            if subcategory:
                query = query.where('subcategoria', '==', subcategory)
            else:
                query = query.where('categoria', '==', category)
                
            # Limitamos a 20 para tener variedad y luego elegimos al azar en Python
            docs = query.limit(20).stream()
            
            candidates = []
            discounts = self.get_discounts()
            
            for doc in docs:
                if doc.id == product_id: continue # Excluir el actual
                
                p = self._translate_doc(doc)
                
                # Filtro extra de seguridad: Precio > 1
                if p['price'] <= 1: continue

                # Aplicar descuento
                discount = self.get_discount_for_product(p, discounts)
                p['discount_amount'] = discount
                if discount > 0:
                    p['original_price'] = p['price']
                    p['price'] = round(p['price'] - discount)
                candidates.append(p)
            
            # Mezclar y devolver solo el limite
            if len(candidates) > limit:
                return random.sample(candidates, limit)
            return candidates

        except Exception as e:
            logger.error(f"Error buscando similares: {e}")
            return []

    def get_products(self, limit: int = 50, category: str = None, subcategory: str = None, 
                     brand: str = None, last_doc_id: str = None, 
                     min_price: float = None, max_price: float = None, sort: str = None, highlight_ids: list = None) -> List[dict]:
        try:
            discounts = self.get_discounts()
            products_ref = self.db.collection('productos')

            final_products = []
            pinned_ids = []

            if highlight_ids and not last_doc_id:
                # Reutilizamos tu funcion existente que es eficiente
                highlighted_products = self.get_products_by_ids(highlight_ids)
                final_products.extend(highlighted_products)
                pinned_ids = [p['id'] for p in highlighted_products]

            # --- 1. PREPARAR CURSOR INICIAL ---
            last_doc_snapshot = None
            if last_doc_id:
                doc_ref = products_ref.document(last_doc_id).get()
                if doc_ref.exists:
                    last_doc_snapshot = doc_ref

            products = []
            attempts = 0
            max_attempts = 10 # Un poco mas de margen si filtramos mucho en memoria
            
            # --- 2. BUCLE INTELIGENTE (Smart Fetching) ---
            while len(products) < limit and attempts < max_attempts:
                attempts += 1
                remaining = limit - len(products)
                fetch_limit = remaining + 15 # Buffer

                query = products_ref.where('activo', '==', True)

                if category: query = query.where('categoria', '==', category)
                if subcategory: query = query.where('subcategoria', '==', subcategory)
                if brand: query = query.where('marca', '==', brand)
                
                # --- 3. ESTRATEGIA DE ORDENAMIENTO HIBRIDA ---
                apply_price_filter_in_db = False

                if sort == 'price-asc': 
                    # Si el usuario PIDE ordenar por precio, filtramos en DB (es rapido)
                    query = query.where('precio', '>', 1)
                    if min_price is not None: query = query.where('precio', '>=', float(min_price))
                    if max_price is not None: query = query.where('precio', '<=', float(max_price))
                    query = query.order_by('precio', direction=firestore.Query.ASCENDING)
                    apply_price_filter_in_db = True

                elif sort == 'price-desc': 
                    query = query.where('precio', '>', 1)
                    if min_price is not None: query = query.where('precio', '>=', float(min_price))
                    if max_price is not None: query = query.where('precio', '<=', float(max_price))
                    query = query.order_by('precio', direction=firestore.Query.DESCENDING)
                    apply_price_filter_in_db = True

                elif sort == 'alpha-asc': 
                    query = query.order_by('descripcion', direction=firestore.Query.ASCENDING)
                    # Filtramos precio en memoria para no romper el orden alfabetico
                
                else: 
                    # === RELEVANCIA (Default) ===
                    # NO aplicamos filtros de precio en DB para evitar que Firestore
                    # fuerce el ordenamiento por precio.
                    # Filtraremos en memoria (Python) abajo.
                    pass

                # Aplicar Cursor
                if last_doc_snapshot:
                    query = query.start_after(last_doc_snapshot)

                # Ejecutar consulta
                docs_stream = query.limit(fetch_limit).stream()
                docs_list = list(docs_stream)
                
                if not docs_list:
                    break
                
                for doc in docs_list:
                    last_doc_snapshot = doc 
                    try:
                        p = self._translate_doc(doc)

                        if p['id'] in pinned_ids:
                            continue

                        # Filtros b sicos de seguridad
                        if p['stock'] >= 1 and p['price'] > 1:
                            
                            # Calcular Precio Final
                            discount = self.get_discount_for_product(p, discounts)
                            p['discount_amount'] = discount
                            if discount > 0:
                                p['original_price'] = p['price']
                                p['price'] = round(p['price'] - discount)
                            
                            # === FILTRADO DE PRECIO EN MEMORIA (Si no se hizo en DB) ===
                            if not apply_price_filter_in_db:
                                final_price = p['price']
                                if min_price is not None and final_price < float(min_price):
                                    continue
                                if max_price is not None and final_price > float(max_price):
                                    continue

                            products.append(p)
                            
                            if len(products) == limit:
                                break
                    except: continue

            # === ALEATORIZACION PARA RECOMENDACIONES ===
            # Si NO hay filtros especificos (categoria, marca, sort), aleatorizar
            # Esto asegura variedad en la pagina principal
            if not category and not brand and not sort and not last_doc_id:
                random.shuffle(products)
                logger.info(f"Productos aleatorizados para variedad: {len(products)}")

            return final_products + products

        except Exception as e:
            logger.error(f"Error en get_products: {e}")
            return []

    def get_random_products_fast(self, sample_size: int = 100) -> List[dict]:
        """
        MUESTREO ALEATORIO RAPIDO de productos de TODA la base de datos
        
        Estrategia optima para 1200+ productos:
        1. Hace multiples queries pequenas desde puntos aleatorios de la BD
        2. Cada query trae 10-15 productos desde un ID aleatorio
        3. Combina resultados y elimina duplicados
        4. Total: ~100 productos unicos de diferentes partes de la BD
        
        VENTAJAS:
        - Muy rapido (solo 8-10 queries pequenas)
        - Verdadera aleatorizacion (diferentes secciones de la BD)
        - No carga 1200 productos en memoria
        
        Returns:
            Lista de productos aleatorios de toda la BD
        """
        try:
            import string
            
            products_ref = self.db.collection('productos')
            discounts = self.get_discounts()
            all_products = []
            seen_ids = set()
            
            # Configuracion
            num_queries = 10  # 10 queries desde puntos diferentes
            products_per_query = (sample_size // num_queries) + 5  # ~15 por query
            
            logger.info(f"Iniciando muestreo aleatorio: {num_queries} queries de ~{products_per_query} productos")
            
            # Hacer queries desde diferentes puntos aleatorios
            for i in range(num_queries):
                try:
                    # Generar un prefijo aleatorio de 1-3 caracteres
                    # Esto hace que cada query empiece desde un punto diferente
                    prefix_length = random.randint(1, 3)
                    random_prefix = ''.join(random.choices(string.ascii_letters + string.digits, k=prefix_length))
                    
                    # Query desde este punto
                    query = products_ref.where('activo', '==', True)
                    query = query.order_by('__name__')
                    query = query.start_at({'__name__': random_prefix})
                    query = query.limit(products_per_query)
                    
                    docs = list(query.stream())
                    
                    for doc in docs:
                        try:
                            # Evitar duplicados
                            if doc.id in seen_ids:
                                continue
                            seen_ids.add(doc.id)
                            
                            p = self._translate_doc(doc)
                            
                            # Filtros basicos
                            if p['stock'] <= 0 or p['price'] <= 1:
                                continue
                            
                            # Aplicar descuentos
                            discount = self.get_discount_for_product(p, discounts)
                            p['discount_amount'] = discount
                            if discount > 0:
                                p['original_price'] = p['price']
                                p['price'] = round(p['price'] - discount)
                            
                            all_products.append(p)
                            
                        except Exception as doc_error:
                            continue
                    
                    logger.debug(f"Query {i+1}: obtenidos {len(docs)} docs, total acumulado: {len(all_products)}")
                    
                except Exception as query_error:
                    logger.warning(f"Query {i+1} fallo: {query_error}")
                    continue
            
            # Shuffle para maxima aleatoriedad
            random.shuffle(all_products)
            result = all_products[:sample_size]
            
            logger.info(f"Muestreo completado: {len(result)} productos unicos de {len(all_products)} obtenidos")
            
            # Si obtuvimos muy pocos, usar fallback
            if len(result) < sample_size // 3:
                logger.warning(f"Muestreo insuficiente ({len(result)}), usando metodo tradicional")
                return self.get_products(limit=sample_size)
            
            return result
            
        except Exception as e:
            logger.error(f"Error en get_random_products_fast: {e}")
            # Fallback: metodo tradicional
            return self.get_products(limit=sample_size)

    def get_product_by_id(self, product_id: str) -> Optional[dict]:
        try:
            doc = self.db.collection('productos').document(product_id).get()
            if not doc.exists: return None
            
            p = self._translate_doc(doc)
            discounts = self.get_discounts()
            discount = self.get_discount_for_product(p, discounts)
            p['discount_amount'] = discount
            if discount > 0:
                p['original_price'] = p['price']
                p['price'] = round(p['price'] - discount)
            return p
        except: return None

    def get_categories(self) -> List[dict]:
        try:
            docs = self.db.collection('categorias').stream()
            categories = []
            for doc in docs:
                data = doc.to_dict()
                categories.append({
                    "id": doc.id,
                    "name": data.get("nombre", doc.id),
                    "subcategories": [
                        {"id": sub, "name": sub} for sub in data.get("subcategorias", [])
                    ]
                })
            return categories
        except: return []

    @lru_cache(maxsize=1)
    def _get_cached_discounts(self, ttl_hash=None):
        """Wrapper interno para cachear resultado"""
        return self._fetch_discounts_from_db()

    def get_discounts(self) -> List[dict]:
        # Truco: Cambia el hash cada 5 minutos (300 segundos) para invalidar cache automaticamente
        ttl_hash = round(time.time() / 300) 
        return self._get_cached_discounts(ttl_hash)

    def _fetch_discounts_from_db(self):
        """La logica original de get_discounts va aqui"""
        try:
            docs = self.db.collection('descuentos').stream()
            discounts = []
            for doc in docs:
                data = doc.to_dict()
                if data.get('activo', True):
                    discounts.append({
                        'id': doc.id,
                        'product_id': data.get('id_producto'),
                        'category': data.get('categoria'),
                        'subcategory': data.get('subcategoria'),
                        'brand': data.get('marca'),
                        'discount_amount': float(data.get('monto', 0)),
                        'name': data.get('nombre', ''),
                        'active': data.get('activo', True)
                    })
            return discounts
        except Exception as e:
            logger.error(f"Error get_discounts: {e}")
            return []

    def get_discount_for_product(self, product: dict, discounts: List[dict]) -> float:
        """
        Calcula el mejor descuento aplicable.
        Prioridad: Producto > Marca+Subcat > Subcat > Marca > Categoria
        """
        best_discount = 0
        priority_level = 0 
        
        # Niveles de prioridad para desempatar reglas:
        # 5: ID Producto exacto
        # 4: Marca + Subcategoria (Tu caso de LG Refrigeracion)
        # 3: Solo Subcategoria
        # 2: Marca + Categoria
        # 1: Solo Categoria o Solo Marca (Reglas generales)

        for d in discounts:
            # --- VALIDACION DE REGLAS (Logica "Y") ---
            # Si el descuento tiene una condici n definida, el producto DEBE cumplirla.
            
            # 1. Validar ID de producto (si existe en el descuento)
            if d['product_id'] and d['product_id'] != product['id']:
                continue
            
            # 2. Validar Marca (si existe en el descuento)
            if d['brand'] and d['brand'].lower() != product.get('marca', '').lower():
                continue

            # 3. Validar Subcategoria (si existe en el descuento)
            if d['subcategory'] and d['subcategory'].lower() != product.get('subcategory', '').lower():
                continue

            # 4. Validar Categoria (si existe en el descuento)
            if d['category'] and d['category'].lower() != product.get('category', '').lower():
                continue

            # --- CALCULO DE PRIORIDAD ---
            current_priority = 0
            
            if d['product_id']:
                current_priority = 5
            elif d['brand'] and d['subcategory']:
                current_priority = 4
            elif d['subcategory']:
                current_priority = 3
            elif d['brand'] and d['category']: # Marca dentro de una categoria mayor
                current_priority = 2
            elif d['category'] or d['brand']:
                current_priority = 1
            
            # Si encontramos una regla mas especifica, o de igual especificidad pero mayor %, la aplicamos
            if current_priority > priority_level:
                priority_level = current_priority
                best_discount = d['discount_amount']
            elif current_priority == priority_level:
                if d['discount_amount'] > best_discount:
                    best_discount = d['discount_amount']
        
        return round(best_discount)

    def get_brands(self, category: str = None, subcategory: str = None) -> List[str]:
        """Obtener marcas unicas disponibles, opcionalmente filtradas por categoria/subcategoria"""
        try:
            products_ref = self.db.collection('productos')
            query = products_ref.where(field_path='activo', op_string='==', value=True)
            
            if category:
                query = query.where(field_path='categoria', op_string='==', value=category)
            if subcategory:
                query = query.where(field_path='subcategoria', op_string='==', value=subcategory)
            
            docs = query.stream()
            brands = set()
            
            for doc in docs:
                try:
                    data = doc.to_dict()
                    marca = data.get('marca')
                    if marca:
                        brands.add(marca)
                except:
                    continue
            
            return sorted(list(brands))
        except Exception as e:
            logger.error(f"Error get_brands: {e}")
            return []

    def search_products(self, query_text: str) -> List[dict]:
        try:
            current_time = time.time()
            if not self._search_cache or (current_time - self._last_cache_time > self._CACHE_DURATION):
                docs = self.db.collection('productos').where(field_path='activo', op_string='==', value=True).stream()
                temp = []
                for doc in docs:
                    try:
                        p = self._translate_doc(doc)
                        if p['stock'] > 0: temp.append(p)
                    except: pass
                self._search_cache = temp
                self._last_cache_time = current_time
            
            import unicodedata
            from difflib import SequenceMatcher
            import re  # Importamos Regex para busqueda de palabra exacta
            
            def normalize_text(text):
                return ''.join(c for c in unicodedata.normalize('NFD', text) 
                              if unicodedata.category(c) != 'Mn').lower()
            
            def get_similarity(a, b):
                return SequenceMatcher(None, a, b).ratio()
            
            q = query_text.lower().strip()
            q_normalized = normalize_text(q)
            q_words = q_normalized.split()
            
            weights = {
                'name': 1.5,       # El nombre es lo mas importante
                'category': 1.2,   # La categor a es muy relevante
                'subcategory': 1.2,
                'marca': 1.0,
                'tags': 0.8,
                'description': 0.5 # La descripcion tiene menos peso (evita falsos positivos como "motor")
            }

            FUZZY_THRESHOLD = 0.8  # Subimos un poco la exigencia
            results_with_score = []
            
            for p in self._search_cache:
                total_score = 0
                
                # Campos donde buscar
                search_fields = {
                    'name': normalize_text(p['name']),
                    'category': normalize_text(p['category']),
                    'subcategory': normalize_text(p['subcategory']),
                    'marca': normalize_text(p.get('marca', '')),
                    'tags': normalize_text(" ".join(p['tags'])),
                    'description': normalize_text(p['description'])
                }
                
                matches_found = False

                for field_key, field_text in search_fields.items():
                    if not field_text: continue
                    
                    field_score = 0
                    weight = weights.get(field_key, 1.0)
                    words_in_field = field_text.split()
                
                    # ── Calcular score por CADA PALABRA de la query ──
                    word_scores = []
                    for q_word in q_words:
                        if not q_word: continue
                        w_score = 0
                
                        # 1. Coincidencia exacta de palabra
                        if re.search(r'\b' + re.escape(q_word) + r'\b', field_text):
                            w_score = 1.0
                
                        # 2. Substring (si no es exacta)
                        elif q_word in field_text:
                            w_score = 0.3 if len(q_word) < 4 else 0.7
                
                        # 3. Fuzzy contra cada palabra del campo
                        else:
                            best_sim = 0
                            for field_word in words_in_field:
                                if len(q_word) > 3 and len(field_word) > 3:
                                    sim = get_similarity(q_word, field_word)
                                    if sim > best_sim:
                                        best_sim = sim
                            if best_sim >= FUZZY_THRESHOLD:
                                w_score = best_sim * 0.6
                
                        word_scores.append(w_score)
                
                    if not word_scores:
                        continue
                
                    # Promedio ponderado: penaliza si alguna palabra no matchea nada
                    matched_words = sum(1 for s in word_scores if s > 0)
                    coverage = matched_words / len(word_scores)  # % de palabras encontradas
                
                    # Si ninguna palabra matchea, ignorar este campo
                    if coverage == 0:
                        continue
                
                    # Score = promedio de scores × cobertura (penaliza matches parciales)
                    field_score = (sum(word_scores) / len(word_scores)) * coverage * weight
                    total_score += field_score

                if total_score > 0:
                    results_with_score.append((p, total_score))
            
            # Ordenar por puntaje (mayor a menor)
            results_with_score.sort(key=lambda x: x[1], reverse=True)
            
            # Procesar descuentos y retornar
            results = [p.copy() for p, score in results_with_score]
            discounts = self.get_discounts()
            
            for p in results:
                discount = self.get_discount_for_product(p, discounts)
                p['discount_amount'] = discount
                if discount > 0:
                    p['original_price'] = p['price']
                    p['price'] = round(p['price'] - discount)
            
            return results

        except Exception as e:
            logger.error(f"Error search: {e}")
            return []

    def toggle_favorite(self, user_id: str, product_id: str) -> bool:
        try:
            user_ref = self.db.collection('users').document(user_id)
            doc = user_ref.get()
            if not doc.exists:
                user_ref.set({'favorites': [product_id]})
                return True
            
            favs = doc.to_dict().get('favorites', [])
            if product_id in favs:
                user_ref.update({'favorites': firestore.ArrayRemove([product_id])})
                return False
            else:
                user_ref.update({'favorites': firestore.ArrayUnion([product_id])})
                return True
        except Exception as e:
            logger.error(f"Error toggle_favorite: {e}")
            return False

    def get_user_favorites(self, user_id: str) -> List[dict]:
        try:
            doc = self.db.collection('users').document(user_id).get()
            if not doc.exists: return []
            fav_ids = doc.to_dict().get('favorites', [])
            
            return self.get_products_by_ids(fav_ids)
        except: return []

    # --- PERFIL DE USUARIO ---
    def get_user_info(self, user_id: str) -> dict:
        try:
            doc = self.db.collection('users').document(user_id).get()
            if doc.exists:
                return doc.to_dict()
            return {}
        except Exception as e:
            logger.error(f"Error getting user info: {e}")
            return {}

    def update_user_info(self, user_id: str, data: dict) -> bool:
        try:
            # Usamos merge=True para no borrar favoritos si existen
            self.db.collection('users').document(user_id).set(data, merge=True)
            return True
        except Exception as e:
            logger.error(f"Error updating user info: {e}")
            return False

    # --- HISTORIAL ---
    def get_recently_viewed(self, user_id: str, limit: int = 10) -> List[dict]:
        try:
            # 1. Obtenemos los eventos ordenados por fecha
            query = self.db.collection('tracking_events')\
                .where(field_path='client_id', op_string='==', value=user_id)\
                .where(field_path='event_type', op_string='==', value='view')\
                .order_by('timestamp', direction=firestore.Query.DESCENDING)\
                .limit(limit * 3) 
            
            docs = query.stream()
            seen = set()
            product_ids_to_fetch = []
            
            # Aqu  product_ids_to_fetch tiene el orden correcto (Cronologico)
            for doc in docs:
                pid = doc.to_dict().get('product_id')
                if pid and pid not in seen:
                    seen.add(pid)
                    product_ids_to_fetch.append(pid)
                    if len(product_ids_to_fetch) >= limit: break
            
            # 2. Obtenemos los detalles de los productos
            products = self.get_products_by_ids(product_ids_to_fetch)

            products.sort(key=lambda p: product_ids_to_fetch.index(p['id']) if p['id'] in product_ids_to_fetch else 999)

            return products
        except Exception as e:
            logger.error(f"Error historial: {e}")
            return []

    def get_user_preferences(self, client_id: str) -> dict:
        try:
            query = self.db.collection('tracking_events')\
                .where(field_path='client_id', op_string='==', value=client_id)\
                .order_by('timestamp', direction=firestore.Query.DESCENDING)\
                .limit(20)
            docs = query.stream()
            counts = {}
            for doc in docs:
                c = doc.to_dict().get('category')
                if c and c != "general": 
                    counts[c] = counts.get(c, 0) + 1
            if not counts: return None
            return {"top_category": max(counts, key=counts.get)}
        except: return None

    def save_tracking_event(self, event_data: dict):
        try:
            self.db.collection('tracking_events').add(event_data)
            logger.info(f"Guardado evento {event_data.get('event_type')} para usuario {event_data.get('client_id')}")
        except Exception as e:
            logger.error(f"Error guardando tracking: {e}")
            
    def get_user_orders(self, client_id: str) -> List[dict]:
        try:
            # Consultamos la coleccion 'pedido_local' filtrando por client_id
            query = self.db.collection('pedido_local')\
                .where(field_path='client_id', op_string='==', value=client_id)\
                .order_by('fecha', direction=firestore.Query.DESCENDING)
            
            docs = query.stream()
            orders = []
            for doc in docs:
                data = doc.to_dict()
                # Convertir timestamp a string para que sea serializable
                if data.get('fecha'):
                    data['fecha'] = data['fecha'].isoformat()
                orders.append(data)
            return orders
        except Exception as e:
            logger.error(f"Error obteniendo pedidos de usuario: {e}")
            return []

    # --- TRACKING PUBLICO ---
    def get_order_for_tracking(self, order_id: str, dni: str) -> Optional[dict]:
        """Obtiene un pedido por ID y DNI para el seguimiento publico (sin autenticacion)"""
        try:
            doc = self.db.collection('pedido_local').document(order_id).get()
            if not doc.exists:
                return None
            data = doc.to_dict()
            # Verificar que el DNI coincida (seguridad basica)
            if data.get('dni') != dni:
                return None
            # Convertir timestamp a string
            if data.get('fecha'):
                try:
                    data['fecha'] = data['fecha'].isoformat()
                except Exception:
                    data['fecha'] = str(data['fecha'])
            data['id'] = doc.id
            return data
        except Exception as e:
            logger.error(f"Error en get_order_for_tracking: {e}")
            return None

    # --- GESTION DE PEDIDOS ---
    def create_order(self, order_data: dict) -> dict:
        try:
            orders_ref = self.db.collection('pedido_local')
            
            # 1. Generar ID Aleatorio (N0000 - N9999) unico
            while True:
                rand_num = random.randint(0, 9999)
                final_id = f"N{rand_num:04d}"
                
                # Verificamos que no exista para evitar colisiones
                doc = orders_ref.document(final_id).get()
                if not doc.exists:
                    break
            
            # 2. Construir el pedido
            pedido = {
                "id": final_id,
                "cod_vendedor": "007", # C digo web
                "dni": order_data.get("dni"),
                "nombre": order_data.get("nombre"),
                "telefono": order_data.get("telefono"), # Obligatorio
                "email": order_data.get("email"),       # Nuevo campo
                "sucursal": order_data.get("sucursal"), 
                "tipo_entrega": order_data.get("tipo_entrega"), 
                "direccion": order_data.get("direccion", ""),  
                "costo_envio": order_data.get("costo_envio", 0),  
                "fecha": firestore.SERVER_TIMESTAMP,
                "total": order_data.get("total"),
                "estado": "pendiente",
                "visible": False,
                "client_id": order_data.get("client_id"), 
                "detalles": order_data.get("items", []) 
            }

            # 3. Guardar en 'pedido_local' usando el ID como nombre de documento
            orders_ref.document(final_id).set(pedido)
            
            # 4. Actualizar datos del usuario si esta logueado
            if order_data.get("client_id"):
                user_update = {
                    "dni": order_data["dni"], 
                    "nombre": order_data["nombre"],
                    "telefono": order_data["telefono"],
                    "email": order_data["email"], # Guardamos el correo
                    "sucursal": order_data.get("sucursal")
                }
                if order_data.get("direccion"):
                    user_update["direccion"] = order_data["direccion"]
                    
                self.db.collection('users').document(order_data["client_id"]).set(
                    user_update, 
                    merge=True
                )

            return {"order_id": final_id}
            
        except Exception as e:
            logger.error(f"Error creando pedido: {e}")
            raise

    # --- GESTION DE PRODUCTOS DESTACADOS EN HOME ---
    def get_featured_deals(self) -> dict:
        """
        Obtiene la configuracion de productos destacados en oferta para la home.
        Lee el documento 'home_featured' de la coleccion 'config'.
        
        Estructura del documento en Firebase:
        {
            active: true,
            title: "Productos en Oferta",
            product_ids: ["id1", "id2", "id3", "id4"]
        }
        """
        try:
            doc = self.db.collection('config').document('home_featured').get()
            if not doc.exists:
                return {"active": False, "product_ids": [], "title": "Productos en Oferta"}
            
            data = doc.to_dict()
            
            if not data.get('active', True):
                return {"active": False, "product_ids": [], "title": "Productos en Oferta"}
            
            product_ids = data.get('product_ids', [])
            if not product_ids:
                return {"active": False, "product_ids": [], "title": data.get('title', 'Productos en Oferta')}
            
            # Obtener los productos por IDs (batch get - 1 sola consulta)
            products = self.get_products_by_ids(product_ids)
            
            # Preservar el orden definido en Firebase
            id_order = {pid: i for i, pid in enumerate(product_ids)}
            products.sort(key=lambda p: id_order.get(p['id'], 999))
            
            return {
                "active": True,
                "title": data.get('title', 'Productos en Oferta'),
                "product_ids": product_ids,
                "products": products
            }
        except Exception as e:
            logger.error(f"Error obteniendo featured deals: {e}")
            return {"active": False, "product_ids": [], "title": "Productos en Oferta"}

    # --- GESTION DE PROMOCIONES ---
    def get_promotions(self) -> List[dict]:
        """Obtener todas las promociones activas ordenadas por 'order'"""
        try:
            promotions_ref = self.db.collection('promotions')
            # Filtrar solo las activas y ordenar por 'order'
            query = promotions_ref.where('active', '==', True).order_by('order')
            docs = query.stream()
            
            promotions = []
            for doc in docs:
                data = doc.to_dict()
                data['id'] = doc.id  # Incluir el ID del documento
                promotions.append(data)
            
            logger.info(f"Obtuvimos {len(promotions)} promociones activas")
            return promotions
        except Exception as e:
            logger.error(f"Error obteniendo promociones: {e}")
            return []

    def get_promotion_by_id(self, promo_id: str) -> Optional[dict]:
        """Obtener una promocion especifica por ID"""
        try:
            doc = self.db.collection('promotions').document(promo_id).get()
            if doc.exists:
                data = doc.to_dict()
                data['id'] = doc.id
                return data
            return None
        except Exception as e:
            logger.error(f"Error obteniendo promocion {promo_id}: {e}")
            return None

    def get_random_candidates(self, limit: int = 50) -> List[dict]:
        """
        Obtiene una muestra aleatoria OPTIMIZADA de productos activos
        
        ANTES (LENTO - 2-3 segundos):
        - Cargaba TODOS los IDs (1200+) 
        - Luego seleccionaba aleatoriamente
        
        AHORA (RAPIDO - 100-200ms):
        - Hace multiples queries pequenas desde puntos aleatorios
        - Solo trae los productos necesarios
        """
        try:
            # Usar el nuevo metodo optimizado
            return self.get_random_products_fast(sample_size=limit)
            
        except Exception as e:
            logger.error(f"Error obteniendo candidatos aleatorios: {e}")
            # Fallback al metodo tradicional
            return self.get_products(limit=limit)

    # --- GESTION DE SUCURSALES Y COSTOS DE ENVIO ---
    def get_sucursales(self) -> List[dict]:
        """Obtener todas las sucursales activas"""
        try:
            sucursales_ref = self.db.collection('sucursales')
            docs = sucursales_ref.where('activo', '==', True).stream()
            
            sucursales = []
            for doc in docs:
                data = doc.to_dict()
                data['id'] = doc.id
                sucursales.append(data)
            
            logger.info(f"Obtuvimos {len(sucursales)} sucursales activas")
            return sucursales
        except Exception as e:
            logger.error(f"Error obteniendo sucursales: {e}")
            # Retornar sucursales por defecto si falla
            return [
                {"id": "mollendo", "nombre": "Mollendo", "permite_envio": True, "costo_envio": 0, "costo_minimo_envio_gratis": 200, "activo": True},
                {"id": "cocachacra", "nombre": "Cocachacra", "permite_envio": True, "costo_envio": 0, "costo_minimo_envio_gratis": 200, "activo": True},
                {"id": "ilo", "nombre": "Ilo", "permite_envio": False, "costo_envio": 0, "costo_minimo_envio_gratis": 0, "activo": True},
                {"id": "lajoya", "nombre": "La Joya", "permite_envio": False, "costo_envio": 0, "costo_minimo_envio_gratis": 0, "activo": True},
                {"id": "pedregal", "nombre": "Pedregal", "permite_envio": False, "costo_envio": 0, "costo_minimo_envio_gratis": 0, "activo": True}
            ]

    def get_sucursal_by_id(self, sucursal_id: str) -> Optional[dict]:
        """Obtener configuracion de una sucursal especifica"""
        try:
            doc = self.db.collection('sucursales').document(sucursal_id).get()
            if doc.exists:
                data = doc.to_dict()
                data['id'] = doc.id
                return data
            return None
        except Exception as e:
            logger.error(f"Error obteniendo sucursal {sucursal_id}: {e}")
            return None

    def calculate_shipping_cost(self, sucursal_id: str, subtotal: float, delivery_type: str) -> float:
        """Calcular costo de envio basado en la sucursal y el subtotal"""
        try:
            # Si es recojo en tienda, siempre es gratis
            if delivery_type == "recojo":
                return 0
            
            # Obtener configuracion de la sucursal
            sucursal = self.get_sucursal_by_id(sucursal_id)
            
            if not sucursal:
                return 0
            
            # Si la sucursal no permite envio, retornar 0
            if not sucursal.get('permite_envio', False):
                return 0
            
            # Si el subtotal supera el minimo para envio gratis
            costo_minimo = sucursal.get('costo_minimo_envio_gratis', 200)
            if subtotal >= costo_minimo:
                return 0
            
            # Retornar el costo de envio configurado
            return sucursal.get('costo_envio', 0)
            
        except Exception as e:
            logger.error(f"Error calculando costo de envio: {e}")
            return 0

    # --- GESTI N DE CARRITO PERSISTENTE ---

    def get_cart(self, user_id: str) -> List[dict]:
        """Obtener el carrito guardado de un usuario en Firestore"""
        try:
            doc = self.db.collection('users').document(user_id).get()
            if not doc.exists:
                return []
            return doc.to_dict().get('cart', [])
        except Exception as e:
            logger.error(f"Error obteniendo carrito de {user_id}: {e}")
            return []

    def save_cart(self, user_id: str, items: List[dict]) -> bool:
        """Guardar el carrito completo de un usuario en Firestore.
        Solo persiste los campos esenciales para no desperdiciar espacio."""
        try:
            # Guardar solo campos esenciales de cada item
            cart_to_save = [
                {
                    "id": item.get("id"),
                    "name": item.get("name"),
                    "price": item.get("price"),
                    "quantity": item.get("quantity"),
                    "image_url": item.get("image_url"),
                    "marca": item.get("marca"),
                    "category": item.get("category"),
                    "original_price": item.get("original_price"),
                    "discount_amount": item.get("discount_amount", 0),
                    "discount_percent": item.get("discount_percent", 0),
                }
                for item in items if item.get("id")
            ]
            self.db.collection('users').document(user_id).set(
                {"cart": cart_to_save},
                merge=True
            )
            return True
        except Exception as e:
            logger.error(f"Error guardando carrito de {user_id}: {e}")
            return False

    def clear_cart(self, user_id: str) -> bool:
        """Vaciar el carrito de un usuario en Firestore"""
        try:
            self.db.collection('users').document(user_id).set(
                {"cart": []},
                merge=True
            )
            return True
        except Exception as e:
            logger.error(f"Error vaciando carrito de {user_id}: {e}")
            return False


firebase_service = FirebaseService()
