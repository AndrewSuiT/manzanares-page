// api.js - Ejemplo con el método getBrands agregado

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class API {
  async getProducts(limit = 50, category = null, subcategory = null, lastDocId = null, brand = null, filters = {}) {
    try {
      const params = new URLSearchParams();
      params.append('limit', limit);
      if (category) params.append('category', category);
      if (subcategory) params.append('subcategory', subcategory);
      if (lastDocId) params.append('last_doc_id', lastDocId);
      if (brand) params.append('brand', brand);
      
      if (filters.minPrice !== undefined && filters.minPrice !== null) params.append('min_price', filters.minPrice);
      if (filters.maxPrice !== undefined && filters.maxPrice !== null) params.append('max_price', filters.maxPrice);
      if (filters.sort) params.append('sort', filters.sort);
      if (filters.highlight) params.append('highlight', filters.highlight);

      const url = `${API_URL}/api/products?${params}`;
      console.log('🌐 getProducts - URL:', url);
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Error fetching products');
      return await response.json();
    } catch (error) {
      console.error('Error en getProducts:', error);
      return [];
    }
  }

  // ✅ Obtener productos destacados en oferta para la home
  async getFeaturedDeals() {
    try {
      const response = await fetch(`${API_URL}/api/featured-deals`);
      if (!response.ok) throw new Error('Error fetching featured deals');
      return await response.json();
    } catch (error) {
      console.error('Error en getFeaturedDeals:', error);
      return { active: false, product_ids: [], products: [] };
    }
  }

  // ✅ NUEVO: Obtener todas las marcas disponibles (filtradas por categoría si se especifica)
  async getBrands(category = null, subcategory = null) {
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (subcategory) params.append('subcategory', subcategory);

      const response = await fetch(`${API_URL}/api/brands?${params}`);
      if (!response.ok) throw new Error('Error fetching brands');
      return await response.json();
    } catch (error) {
      console.error('Error en getBrands:', error);
      return [];
    }
  }

  async getProductById(productId) {
    try {
      const response = await fetch(`${API_URL}/api/product/${productId}`);
      if (!response.ok) throw new Error('Product not found');
      return await response.json();
    } catch (error) {
      console.error('Error en getProductById:', error);
      return null;
    }
  }

  async getCategories() {
    try {
      const response = await fetch(`${API_URL}/api/categories`);
      if (!response.ok) throw new Error('Error fetching categories');
      return await response.json();
    } catch (error) {
      console.error('Error en getCategories:', error);
      return [];
    }
  }

  async searchProducts(query) {
    try {
      const params = new URLSearchParams({ q: query });
      const response = await fetch(`${API_URL}/api/search?${params}`);
      if (!response.ok) throw new Error('Error in search');
      return await response.json();
    } catch (error) {
      console.error('Error en searchProducts:', error);
      return [];
    }
  }

  async getHomeRecommendations(clientId = null, limit = 8) {
    try {
      const params = new URLSearchParams({ limit });
      if (clientId) params.append('client_id', clientId);
      
      const response = await fetch(`${API_URL}/api/recommendations/home?${params}`);
      if (!response.ok) throw new Error('Error fetching recommendations');
      return await response.json();
    } catch (error) {
      console.error('Error en getHomeRecommendations:', error);
      return [];
    }
  }

  async trackEvent(eventType, productId, category, clientId = null) {
    // Generar/recuperar un ID anónimo si no hay usuario
    const resolvedClientId = clientId ?? (() => {
      let anonId = localStorage.getItem('anon_id');
      if (!anonId) {
        anonId = 'anon_' + crypto.randomUUID();
        localStorage.setItem('anon_id', anonId);
      }
      return anonId;
    })();

    await fetch(`${API_URL}/api/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: eventType,
        product_id: productId,
        category,
        client_id: resolvedClientId,  // ← Nunca será null
        timestamp: new Date().toISOString()
      })
    });
  }

  async toggleFavorite(clientId, productId) {
    try {
      const response = await fetch(`${API_URL}/api/favorites/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          product_id: productId,
          event_type: "toggle_favorite",
          timestamp: new Date().toISOString()
        })
      });
      if (!response.ok) throw new Error('Error toggling favorite');
      return await response.json();
    } catch (error) {
      console.error('Error en toggleFavorite:', error);
      return { status: 'error' };
    }
  }

  async getFavorites(userId) {
    try {
      const response = await fetch(`${API_URL}/api/user/${userId}/favorites`);
      if (!response.ok) throw new Error('Error fetching favorites');
      return await response.json();
    } catch (error) {
      console.error('Error en getFavorites:', error);
      return [];
    }
  }

  async getRecentlyViewed(userId) {
    try {
      const response = await fetch(`${API_URL}/api/user/${userId}/history`);
      if (!response.ok) throw new Error('Error fetching history');
      return await response.json();
    } catch (error) {
      console.error('Error en getRecentlyViewed:', error);
      return [];
    }
  }

  async createOrder(orderData) {
    try {
      const response = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      if (!response.ok) throw new Error('Error creating order');
      return await response.json();
    } catch (error) {
      console.error('Error en createOrder:', error);
      throw error;
    }
  }

  async getOrderTracking(orderId, dni) {
    try {
      const params = new URLSearchParams({ order_id: orderId, dni });
      const response = await fetch(`${API_URL}/api/orders/track?${params}`);
      if (response.status === 404) return { error: 'not_found' };
      if (!response.ok) throw new Error('Error fetching order tracking');
      return await response.json();
    } catch (error) {
      console.error('Error en getOrderTracking:', error);
      return { error: 'network_error' };
    }
  }

  async getUserOrders(clientId) {
    try {
      const response = await fetch(`${API_URL}/api/orders/user/${clientId}`);
      if (!response.ok) throw new Error('Error fetching orders');
      return await response.json();
    } catch (error) {
      console.error('Error en getUserOrders:', error);
      return [];
    }
  }

  async getUserProfile(userId) {
    try {
      const response = await fetch(`${API_URL}/api/user/${userId}/profile`);
      if (!response.ok) throw new Error('Error fetching profile');
      return await response.json();
    } catch (error) {
      console.error('Error en getUserProfile:', error);
      return {};
    }
  }

  async updateUserProfile(userId, profileData) {
    try {
      const response = await fetch(`${API_URL}/api/user/${userId}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });
      if (!response.ok) throw new Error('Error updating profile');
      return await response.json();
    } catch (error) {
      console.error('Error en updateUserProfile:', error);
      throw error;
    }
  }

  async getPromotions() {
    try {
      const response = await fetch(`${API_URL}/api/promotions`);
      if (!response.ok) throw new Error('Error fetching promotions');
      return await response.json();
    } catch (error) {
      console.error('Error en getPromotions:', error);
      return [];
    }
  }

  async getPromotionById(promoId) {
    try {
      const response = await fetch(`${API_URL}/api/promotions/${promoId}`);
      if (!response.ok) throw new Error('Error fetching promotion');
      return await response.json();
    } catch (error) {
      console.error('Error en getPromotionById:', error);
      return null;
    }
  }

  async addFavorite(userId, product) {
    try {
      const response = await fetch(`${API_URL}/api/favorites/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: userId,
          product: product // Enviamos todo el objeto
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error en addFavorite:', error);
      throw error;
    }
  }

  async removeFavorite(userId, productId) {
    try {
      const response = await fetch(`${API_URL}/api/favorites/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: userId,
          product_id: productId
        })
      });

      if (!response.ok) throw new Error('Error eliminando favorito');
      return await response.json();
    } catch (error) {
      console.error('Error en removeFavorite:', error);
      throw error;
    }
  }

  // --- MÉTODOS DE SUCURSALES ---
  async getSucursales() {
    try {
      const response = await fetch(`${API_URL}/api/sucursales`);
      if (!response.ok) throw new Error('Error fetching sucursales');
      return await response.json();
    } catch (error) {
      console.error('Error en getSucursales:', error);
      return [];
    }
  }

  async getSucursalById(sucursalId) {
    try {
      const response = await fetch(`${API_URL}/api/sucursales/${sucursalId}`);
      if (!response.ok) throw new Error('Error fetching sucursal');
      return await response.json();
    } catch (error) {
      console.error('Error en getSucursalById:', error);
      return null;
    }
  }

  async calculateShipping(sucursalId, subtotal, deliveryType) {
    try {
      const response = await fetch(`${API_URL}/api/calculate-shipping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sucursal_id: sucursalId,
          subtotal: subtotal,
          delivery_type: deliveryType
        })
      });
      if (!response.ok) throw new Error('Error calculating shipping');
      return await response.json();
    } catch (error) {
      console.error('Error en calculateShipping:', error);
      return { shipping_cost: 0 };
    }
  }
  // --- MÉTODOS DE CARRITO PERSISTENTE ---

  async getCart(userId) {
    try {
      const response = await fetch(`${API_URL}/api/cart/${userId}`);
      if (!response.ok) throw new Error('Error fetching cart');
      return await response.json();
    } catch (error) {
      console.error('Error en getCart:', error);
      return [];
    }
  }

  async saveCart(userId, items) {
    try {
      const response = await fetch(`${API_URL}/api/cart/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      });
      if (!response.ok) throw new Error('Error saving cart');
      return await response.json();
    } catch (error) {
      console.error('Error en saveCart:', error);
    }
  }

  async clearRemoteCart(userId) {
    try {
      const response = await fetch(`${API_URL}/api/cart/${userId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Error clearing cart');
      return await response.json();
    } catch (error) {
      console.error('Error en clearRemoteCart:', error);
    }
  }

  async mergeTrackingEvents(anonId, userId) {
    const response = await fetch(`${API_URL}/api/track/merge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        anon_id: anonId,
        user_id: userId
      })
    });
    if (!response.ok) throw new Error('Error merging tracking');
    return await response.json();
  }
}

export const api = new API();