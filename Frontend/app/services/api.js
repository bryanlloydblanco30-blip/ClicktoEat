// Frontend/app/services/api.js
// Complete Fixed API Service

// ==================== CONFIGURATION ====================
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://clicktoeat-pw67.onrender.com';

console.log('🌐 API Configuration:', {
  API_BASE_URL,
  environment: process.env.NODE_ENV
});

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

// ==================== AUTHENTICATION FUNCTIONS ====================
export async function signup(username, email, password, fullName, srCode, role = 'member', foodPartner = '') {
  try {
    console.log('📝 Signup attempt:', { username, email, role });
    
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
    
    const data = await handleResponse(response);
    console.log('✅ Signup successful:', data);
    return data;
  } catch (error) {
    console.error('❌ Signup error:', error);
    throw error;
  }
}

export async function login(username, password) {
  try {
    console.log('🔐 Login attempt:', username);
    
    const response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      redirect: 'manual', // CRITICAL: Prevent automatic redirects
      body: JSON.stringify({ username, password })
    });
    
    console.log('📡 Login response status:', response.status);
    console.log('📡 Login response type:', response.type);
    
    // Check if response is a redirect (which we want to prevent)
    if (response.type === 'opaqueredirect' || response.status === 302 || response.status === 301) {
      console.warn('⚠️ Server attempted redirect - this should not happen!');
      throw new Error('Server configuration error: unexpected redirect');
    }
    
    const data = await handleResponse(response);
    console.log('✅ Login successful:', data);
    
    // Store user info in localStorage for quick access
    if (data.user) {
      localStorage.setItem('user_id', data.user.id.toString());
      localStorage.setItem('username', data.user.username);
      localStorage.setItem('user_role', data.user.role);
      console.log('💾 User data stored in localStorage');
    }
    
    return data;
  } catch (error) {
    console.error('❌ Login error:', error);
    throw error;
  }
}

export async function logout() {
  try {
    console.log('🚪 Logout attempt');
    
    const response = await fetch(`${API_BASE_URL}/api/auth/logout/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    
    const data = await handleResponse(response);
    
    // Clear localStorage
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
    localStorage.removeItem('user_role');
    localStorage.removeItem('cart_session_id');
    console.log('🗑️ User data cleared from localStorage');
    
    console.log('✅ Logout successful');
    return data;
  } catch (error) {
    console.error('❌ Logout error:', error);
    throw error;
  }
}

export async function checkAuth() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/check/`, {
      headers: { 'Accept': 'application/json' },
      credentials: 'include'
    });
    
    const data = await handleResponse(response);
    console.log('🔍 Auth check result:', data.authenticated ? 'Authenticated' : 'Not authenticated');
    return data;
  } catch (error) {
    console.error('❌ Check auth error:', error);
    // Return not authenticated instead of throwing
    return { authenticated: false };
  }
}

// ==================== MENU FUNCTIONS ====================
export async function getMenuItems() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/menu/`, {
      credentials: 'include'
    });
    return handleResponse(response);
  } catch (error) {
    console.error('❌ Get menu items error:', error);
    throw error;
  }
}

export async function getMenuItemById(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/menu/${id}/`, {
      credentials: 'include'
    });
    return handleResponse(response);
  } catch (error) {
    console.error('❌ Get menu item error:', error);
    throw error;
  }
}

// ==================== CART FUNCTIONS ====================
export async function getCart() {
  try {
    const sessionId = getSessionId();
    const response = await fetch(`${API_BASE_URL}/api/cart/?session_id=${sessionId}`, {
      credentials: 'include'
    });
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
      credentials: 'include',
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
      credentials: 'include',
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
      credentials: 'include'
    });
    return handleResponse(response);
  } catch (error) {
    console.error('❌ Remove from cart error:', error);
    throw error;
  }
}

// ==================== ORDER FUNCTIONS ====================
export async function createOrder(orderData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders/create/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
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
    const response = await fetch(`${API_BASE_URL}/api/orders/?session_id=${sessionId}`, {
      credentials: 'include'
    });
    return handleResponse(response);
  } catch (error) {
    console.error('❌ Get orders error:', error);
    throw error;
  }
}

// ==================== FAVORITE FUNCTIONS ====================
export async function addFavorite(menuItemId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/favorites/add/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
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
      { 
        method: 'DELETE',
        credentials: 'include'
      }
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
    const response = await fetch(`${API_BASE_URL}/api/favorites/?session_id=${sessionId}`, {
      credentials: 'include'
    });
    return handleResponse(response);
  } catch (error) {
    console.error('❌ Get favorites error:', error);
    throw error;
  }
}

export async function getFavoriteIds() {
  try {
    const sessionId = getSessionId();
    const response = await fetch(`${API_BASE_URL}/api/favorites/ids/?session_id=${sessionId}`, {
      credentials: 'include'
    });
    return handleResponse(response);
  } catch (error) {
    console.error('❌ Get favorite IDs error:', error);
    throw error;
  }
}

// ==================== FOOD PARTNER FUNCTIONS ====================
export async function getFoodPartners() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/partners/`, {
      credentials: 'include'
    });
    return handleResponse(response);
  } catch (error) {
    console.error('❌ Get partners error:', error);
    throw error;
  }
}

export async function getPartnerMenuItems(partnerName) {
  try {
    const encodedName = encodeURIComponent(partnerName);
    console.log('Fetching menu for partner:', partnerName);
    console.log('Encoded partner name:', encodedName);
    const response = await fetch(`${API_BASE_URL}/api/partners/${encodedName}/menu/`, {
      credentials: 'include'
    });
    return handleResponse(response);
  } catch (error) {
    console.error('❌ Get partner menu error:', error);
    throw error;
  }
}

// ==================== ADMIN MENU FUNCTIONS ====================
export async function getAllMenuItemsAdmin() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/menu/`, {
      credentials: 'include'
    });
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
      credentials: 'include',
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
      credentials: 'include',
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
      credentials: 'include'
    });
    return handleResponse(response);
  } catch (error) {
    console.error('❌ Delete menu item error:', error);
    throw error;
  }
}

// ==================== ADMIN ORDER FUNCTIONS ====================
export async function getAllOrders() {
  try {
    console.log('📡 Fetching all orders from:', `${API_BASE_URL}/api/admin/orders/`);
    const response = await fetch(`${API_BASE_URL}/api/admin/orders/`, {
      credentials: 'include'
    });
    const data = await handleResponse(response);
    console.log('✅ Orders fetched successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Get all orders error:', error);
    throw error;
  }
}

export async function updateOrderStatus(orderId, status) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/orders/${orderId}/status/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status })
    });
    return handleResponse(response);
  } catch (error) {
    console.error('❌ Update order status error:', error);
    throw error;
  }
}

// ==================== PARTNER STAFF FUNCTIONS ====================
export async function getPartnerOrders(partnerName) {
  try {
    console.log('📡 Fetching orders for partner:', partnerName);
    const response = await fetch(
      `${API_BASE_URL}/api/partner/orders/?partner=${encodeURIComponent(partnerName)}`,
      { credentials: 'include' }
    );
    const data = await handleResponse(response);
    console.log('✅ Partner orders fetched:', data);
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
      credentials: 'include',
      body: JSON.stringify({ status })
    });
    return handleResponse(response);
  } catch (error) {
    console.error('❌ Update partner order status error:', error);
    throw error;
  }
}

// ==================== HELPER FUNCTIONS ====================
export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  
  const userId = localStorage.getItem('user_id');
  const username = localStorage.getItem('username');
  const role = localStorage.getItem('user_role');
  
  if (userId && username) {
    return {
      id: parseInt(userId),
      username,
      role
    };
  }
  
  return null;
}

export async function isAuthenticated() {
  try {
    const data = await checkAuth();
    return data.authenticated;
  } catch (error) {
    return false;
  }
}

export function hasRole(role) {
  const user = getCurrentUser();
  return user && user.role === role;
}

// ==================== EXPORT API BASE URL ====================
export { API_BASE_URL };