// Admin/app/services/api.js
// Enhanced and Extended API service

// ==================== CONFIGURATION ====================
// CRITICAL FIX: Force the correct backend URL
const API_BASE_URL = 'https://clicktoeat-pw67.onrender.com';

// Runtime validation
if (typeof window !== 'undefined') {
  console.log('🌐 Admin API Configuration:', {
    API_BASE_URL,
    environment: process.env.NODE_ENV,
    envVarValue: process.env.NEXT_PUBLIC_API_URL
  });
}

// ==================== HELPER FUNCTIONS ====================
async function handleResponse(response) {
  if (!response.ok) {
    let errorMessage = 'Request failed';
    try {
      const error = await response.json();
      errorMessage = error.error || error.message || errorMessage;
    } catch {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }
  
  if (response.status === 204) {
    return { success: true };
  }
  
  return response.json();
}

// ==================== SESSION MANAGEMENT ====================
export function getSessionId() {
  if (typeof window === 'undefined') return null;
  
  let sessionId = localStorage.getItem('cart_session_id');
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('cart_session_id', sessionId);
    console.log('🆔 New session created:', sessionId);
  }
  return sessionId;
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('cart_session_id');
  console.log('🗑️ Session cleared');
}

// ==================== AUTHENTICATION FUNCTIONS ====================
export async function signup(username, email, password, fullName, srCode, role = 'member', foodPartner = '') {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/signup/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        username,
        email,
        password,
        full_name: fullName,
        sr_code: srCode,
        role,
        food_partner: foodPartner
      })
    });
    return handleResponse(response);
  } catch (error) {
    console.error('❌ Signup error:', error);
    throw error;
  }
}

export async function logout() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/logout/`, {
      method: 'POST',
      credentials: 'include'
    });
    clearSession();
    return handleResponse(response);
  } catch (error) {
    console.error('❌ Logout error:', error);
    throw error;
  }
}

export async function checkAuth() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/check/`, {
      credentials: 'include'
    });
    return handleResponse(response);
  } catch (error) {
    console.error('❌ Check auth error:', error);
    throw error;
  }
}

export async function updateProfile(userId, profileData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/profile/${userId}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(profileData)
    });
    return handleResponse(response);
  } catch (error) {
    console.error('❌ Update profile error:', error);
    throw error;
  }
}

export async function changePassword(oldPassword, newPassword) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/change-password/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ old_password: oldPassword, new_password: newPassword })
    });
    return handleResponse(response);
  } catch (error) {
    console.error('❌ Change password error:', error);
    throw error;
  }
}

// ==================== MENU FUNCTIONS ====================
export async function getMenuItems(filters = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.partner) params.append('partner', filters.partner);
    if (filters.search) params.append('search', filters.search);
    if (filters.minPrice) params.append('min_price', filters.minPrice);
    if (filters.maxPrice) params.append('max_price', filters.maxPrice);
    
    const url = `${API_BASE_URL}/api/menu/${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url);
    return handleResponse(response);
  } catch (error) {
    console.error('❌ Get menu items error:', error);
    throw error;
  }
}

export async function getMenuItem(itemId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/menu/${itemId}/`);
    return handleResponse(response);
  } catch (error) {
    console.error('❌ Get menu item error:', error);
    throw error;
  }
}

export async function getCategories() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/menu/categories/`);
    return handleResponse(response);
  } catch (error) {
    console.error('❌ Get categories error:', error);
    throw error;
  }
}

// ==================== CART FUNCTIONS ====================
export async function getCart() {
  try {
    const sessionId = getSessionId();
    const response = await fetch(`${API_BASE_URL}/api/cart/?session_id=${sessionId}`);
    return handleResponse(response);
  } catch (error) {
    console.error('❌ Get cart error:', error);
    throw error;
  }
}

export async function addToCart(menuItemId, quantity = 1) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/cart/add/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        menu_item_id: menuItemId,
        quantity: quantity,
        session_id: getSessionId()
      })
    });
    return handleResponse(response);
  } catch (error) {
    console.error('❌ Add to cart error:', error);
    throw error;
  }
}

export async function updateCartItem(itemId, quantity) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/cart/update/${itemId}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity })
    });
    return handleResponse(response);
  } catch (error) {
    console.error('❌ Update cart error:', error);
    throw error;
  }
}

export async function removeFromCart(itemId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/cart/remove/${itemId}/`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  } catch (error) {
    console.error('❌ Remove from cart error:', error);
    throw error;
  }
}

export async function clearCart() {
  try {
    const sessionId = getSessionId();
    const response = await fetch(`${API_BASE_URL}/api/cart/clear/?session_id=${sessionId}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  } catch (error) {
    console.error('❌ Clear cart error:', error);
    throw error;
  }
}

// ==================== ORDER FUNCTIONS ====================
export async function createOrder(orderData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders/create/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...orderData,
        session_id: getSessionId()
      })
    });
    return handleResponse(response);
  } catch (error) {
    console.error('❌ Create order error:', error);
    throw error;
  }
}

export async function getOrders() {
  try {
    const sessionId = getSessionId();
    const response = await fetch(`${API_BASE_URL}/api/orders/?session_id=${sessionId}`);
    return handleResponse(response);
  } catch (error) {
    console.error('❌ Get orders error:', error);
    throw error;
  }
}

export async function getOrder(orderId) {
  try {
    const sessionId = getSessionId();
    const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/?session_id=${sessionId}`);
    return handleResponse(response);
  } catch (error) {
    console.error('❌ Get order error:', error);
    throw error;
  }
}

export async function cancelOrder(orderId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/cancel/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: getSessionId() })
    });
    return handleResponse(response);
  } catch (error) {
    console.error('❌ Cancel order error:', error);
    throw error;
  }
}

export async function rateOrder(orderId, rating, comment = '') {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/rate/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rating,
        comment,
        session_id: getSessionId()
      })
    });
    return handleResponse(response);
  } catch (error) {
    console.error('❌ Rate order error:', error);
    throw error;
  }
}

// ==================== FAVORITE FUNCTIONS ====================
export async function addFavorite(menuItemId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/favorites/add/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        menu_item_id: menuItemId,
        session_id: getSessionId()
      })
    });
    return handleResponse(response);
  } catch (error) {
    console.error('❌ Add favorite error:', error);
    throw error;
  }
}

export async function removeFavorite(menuItemId) {
  try {
    const sessionId = getSessionId();
    const response = await fetch(
      `${API_BASE_URL}/api/favorites/remove/?session_id=${sessionId}&menu_item_id=${menuItemId}`,
      { method: 'DELETE' }
    );
    return handleResponse(response);
  } catch (error) {
    console.error('❌ Remove favorite error:', error);
    throw error;
  }
}

export async function getFavorites() {
  try {
    const sessionId = getSessionId();
    const response = await fetch(`${API_BASE_URL}/api/favorites/?session_id=${sessionId}`);
    return handleResponse(response);
  } catch (error) {
    console.error('❌ Get favorites error:', error);
    throw error;
  }
}

export async function getFavoriteIds() {
  try {
    const sessionId = getSessionId();
    const response = await fetch(`${API_BASE_URL}/api/favorites/ids/?session_id=${sessionId}`);
    return handleResponse(response);
  } catch (error) {
    console.error('❌ Get favorite IDs error:', error);
    throw error;
  }
}

// ==================== FOOD PARTNER FUNCTIONS ====================
export async function getFoodPartners() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/partners/`);
    return handleResponse(response);
  } catch (error) {
    console.error('❌ Get partners error:', error);
    throw error;
  }
}

export async function getPartnerMenuItems(partnerName) {
  try {
    const encodedName = encodeURIComponent(partnerName);
    const response = await fetch(`${API_BASE_URL}/api/partners/${encodedName}/menu/`);
    return handleResponse(response);
  } catch (error) {
    console.error('❌ Get partner menu error:', error);
    throw error;
  }
}

export async function getPartnerDetails(partnerName) {
  try {
    const encodedName = encodeURIComponent(partnerName);
    const response = await fetch(`${API_BASE_URL}/api/partners/${encodedName}/`);
    return handleResponse(response);
  } catch (error) {
    console.error('❌ Get partner details error:', error);
    throw error;
  }
}

// ==================== ADMIN MENU FUNCTIONS ====================
export async function getAllMenuItemsAdmin() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/menu/`);
    return handleResponse(response);
  } catch (error) {
    console.error('❌ Get admin menu error:', error);
    throw error;
  }
}

export async function createMenuItem(itemData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/menu/create/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData)
    });
    return handleResponse(response);
  } catch (error) {
    console.error('❌ Create menu item error:', error);
    throw error;
  }
}

export async function updateMenuItem(itemId, itemData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/menu/update/${itemId}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData)
    });
    return handleResponse(response);
  } catch (error) {
    console.error('❌ Update menu item error:', error);
    throw error;
  }
}

export async function deleteMenuItem(itemId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/menu/delete/${itemId}/`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(response);
  } catch (error) {
    console.error('❌ Delete menu item error:', error);
    throw error;
  }
}

export async function bulkUpdateMenuItems(updates) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/menu/bulk-update/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates })
    });
    return handleResponse(response);
  } catch (error) {
    console.error('❌ Bulk update error:', error);
    throw error;
  }
}

// ==================== ADMIN ORDER FUNCTIONS ====================
export async function getAllOrders() {
  try {
    const url = `${API_BASE_URL}/api/admin/orders/`;
    console.log('🔍 Fetching admin orders from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response URL:', response.url);
    
    const data = await handleResponse(response);
    console.log('✅ Orders received:', data.orders?.length || 0, 'orders');
    return data;
  } catch (error) {
    console.error('❌ Get all orders error:', error);
    throw error;
  }
}

export async function getOrderStats(dateRange = {}) {
  try {
    const params = new URLSearchParams();
    if (dateRange.start) params.append('start_date', dateRange.start);
    if (dateRange.end) params.append('end_date', dateRange.end);
    
    const url = `${API_BASE_URL}/api/admin/orders/stats/${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url);
    return handleResponse(response);
  } catch (error) {
    console.error('❌ Get order stats error:', error);
    throw error;
  }
}

export async function getRevenueAnalytics(period = 'week') {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/analytics/revenue/?period=${period}`);
    return handleResponse(response);
  } catch (error) {
    console.error('❌ Get revenue analytics error:', error);
    throw error;
  }
}

// ==================== PARTNER STAFF FUNCTIONS ====================
export async function getPartnerOrders(partnerName) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/partner/orders/?partner=${encodeURIComponent(partnerName)}`
    );
    const data = await handleResponse(response);
    return data;
  } catch (error) {
    console.error('❌ Get partner orders error:', error);
    throw error;
  }
}

export async function updatePartnerOrderStatus(orderId, status) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/partner/orders/${orderId}/status/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return handleResponse(response);
  } catch (error) {
    console.error('❌ Update partner order status error:', error);
    throw error;
  }
}

export async function getPartnerStats(partnerName) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/partner/stats/?partner=${encodeURIComponent(partnerName)}`
    );
    return handleResponse(response);
  } catch (error) {
    console.error('❌ Get partner stats error:', error);
    throw error;
  }
}

// ==================== NOTIFICATIONS ====================
export async function getNotifications() {
  try {
    const sessionId = getSessionId();
    const response = await fetch(`${API_BASE_URL}/api/notifications/?session_id=${sessionId}`);
    return handleResponse(response);
  } catch (error) {
    console.error('❌ Get notifications error:', error);
    throw error;
  }
}

export async function markNotificationRead(notificationId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}/read/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(response);
  } catch (error) {
    console.error('❌ Mark notification read error:', error);
    throw error;
  }
}

// ==================== REVIEWS ====================
export async function submitMenuReview(menuItemId, rating, comment) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/menu/${menuItemId}/reviews/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rating,
        comment,
        session_id: getSessionId()
      })
    });
    return handleResponse(response);
  } catch (error) {
    console.error('❌ Submit review error:', error);
    throw error;
  }
}

export async function getMenuReviews(menuItemId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/menu/${menuItemId}/reviews/`);
    return handleResponse(response);
  } catch (error) {
    console.error('❌ Get reviews error:', error);
    throw error;
  }
}

// ==================== SEARCH ====================
export async function searchAll(query) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/search/?q=${encodeURIComponent(query)}`);
    return handleResponse(response);
  } catch (error) {
    console.error('❌ Search error:', error);
    throw error;
  }
}

// ==================== UTILITY FUNCTIONS ====================
export async function checkServiceAvailability() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/status/`);
    return handleResponse(response);
  } catch (error) {
    console.error('❌ Service check error:', error);
    throw error;
  }
}

export async function getAvailablePickupTimes(date) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/pickup-times/?date=${date}`);
    return handleResponse(response);
  } catch (error) {
    console.error('❌ Get pickup times error:', error);
    throw error;
  }
}

// Owner/app/services/api.js

export async function getPartnerOrders(foodPartner) {
  try {
    const url = `${API_BASE_URL}/api/partner/orders/?partner=${encodeURIComponent(foodPartner)}`;
    console.log('📡 Fetching from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('❌ Get partner orders error:', error);
    throw error;
  }
}

export async function updatePartnerOrderStatus(orderId, status) {
  try {
    const url = `${API_BASE_URL}/api/partner/orders/${orderId}/status/`;
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Update order status error:', error);
    throw error;
  }
}

export { API_BASE_URL };
// ==================== EXPORT ====================
