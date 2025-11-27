// Frontend/app/services/api.js
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';


// ==================== SESSION MANAGEMENT ====================
export function getSessionId() {
  if (typeof window === 'undefined') return null;
  
  let sessionId = localStorage.getItem('cart_session_id');
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('cart_session_id', sessionId);
  }
  return sessionId;
}

// ==================== AUTHENTICATION FUNCTIONS ====================
export async function signup(username, email, password, role = 'member', foodPartner = '') {
  const response = await fetch(`${API_BASE_URL}/api/auth/signup/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      username,
      email,
      password,
      role,
      food_partner: foodPartner
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Signup failed');
  }
  return response.json();
}

export async function login(username, password) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }
  return response.json();
}

export async function logout() {
  const response = await fetch(`${API_BASE_URL}/api/auth/logout/`, {
    method: 'POST',
    credentials: 'include'
  });
  
  if (!response.ok) {
    throw new Error('Logout failed');
  }
  return response.json();
}

export async function checkAuth() {
  const response = await fetch(`${API_BASE_URL}/api/auth/check/`, {
    credentials: 'include'
  });
  
  if (!response.ok) {
    throw new Error('Failed to check authentication');
  }
  return response.json();
}

// ==================== MENU FUNCTIONS ====================
export async function getMenuItems() {
  const response = await fetch(`${API_BASE_URL}/api/menu/`);
  if (!response.ok) throw new Error('Failed to fetch menu items');
  return response.json();
}

// ==================== CART FUNCTIONS ====================
export async function getCart() {
  const response = await fetch(`${API_BASE_URL}/api/cart/?session_id=${getSessionId()}`);
  if (!response.ok) throw new Error('Failed to fetch cart');
  return response.json();
}

export async function addToCart(menuItemId, quantity = 1) {
  const response = await fetch(`${API_BASE_URL}/api/cart/add/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      menu_item_id: menuItemId,
      quantity: quantity,
      session_id: getSessionId()
    })
  });
  if (!response.ok) throw new Error('Failed to add to cart');
  return response.json();
}

export async function updateCartItem(itemId, quantity) {
  const response = await fetch(`${API_BASE_URL}/api/cart/update/${itemId}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity })
  });
  if (!response.ok) throw new Error('Failed to update cart');
  return response.json();
}

export async function removeFromCart(itemId) {
  const response = await fetch(`${API_BASE_URL}/api/cart/remove/${itemId}/`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to remove from cart');
  return response.json();
}

// ==================== ORDER FUNCTIONS ====================
export async function createOrder(orderData) {
  const response = await fetch(`${API_BASE_URL}/api/orders/create/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...orderData,
      session_id: getSessionId()
    })
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create order');
  }
  return response.json();
}

export async function getOrders() {
  const sessionId = getSessionId();
  const response = await fetch(`${API_BASE_URL}/api/orders/?session_id=${sessionId}`);
  if (!response.ok) throw new Error('Failed to fetch orders');
  return response.json();
}

// ==================== FAVORITE FUNCTIONS ====================
export async function addFavorite(menuItemId) {
  const response = await fetch(`${API_BASE_URL}/api/favorites/add/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      menu_item_id: menuItemId,
      session_id: getSessionId()
    })
  });
  if (!response.ok) throw new Error('Failed to add favorite');
  return response.json();
}

export async function removeFavorite(menuItemId) {
  const sessionId = getSessionId();
  const response = await fetch(
    `${API_BASE_URL}/api/favorites/remove/?session_id=${sessionId}&menu_item_id=${menuItemId}`,
    { method: 'DELETE' }
  );
  if (!response.ok) throw new Error('Failed to remove favorite');
  return response.json();
}

export async function getFavorites() {
  const sessionId = getSessionId();
  const response = await fetch(`${API_BASE_URL}/api/favorites/?session_id=${sessionId}`);
  if (!response.ok) throw new Error('Failed to fetch favorites');
  return response.json();
}

export async function getFavoriteIds() {
  const sessionId = getSessionId();
  const response = await fetch(`${API_BASE_URL}/api/favorites/ids/?session_id=${sessionId}`);
  if (!response.ok) throw new Error('Failed to fetch favorite IDs');
  return response.json();
}

// ==================== FOOD PARTNER FUNCTIONS ====================
export async function getFoodPartners() {
  const response = await fetch(`${API_BASE_URL}/api/partners/`);
  if (!response.ok) throw new Error('Failed to fetch partners');
  return response.json();
}

export async function getPartnerMenuItems(partnerName) {
  const encodedName = encodeURIComponent(partnerName);
  const response = await fetch(`${API_BASE_URL}/api/partners/${encodedName}/menu/`);
  if (!response.ok) throw new Error('Failed to fetch partner menu');
  return response.json();
}

// ==================== ADMIN MENU FUNCTIONS ====================
export async function getAllMenuItemsAdmin() {
  const response = await fetch(`${API_BASE_URL}/api/admin/menu/`);
  if (!response.ok) throw new Error('Failed to fetch admin menu items');
  return response.json();
}

export async function createMenuItem(itemData) {
  const response = await fetch(`${API_BASE_URL}/api/admin/menu/create/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(itemData)
  });
  if (!response.ok) throw new Error('Failed to create menu item');
  return response.json();
}

export async function updateMenuItem(itemId, itemData) {
  const response = await fetch(`${API_BASE_URL}/api/admin/menu/update/${itemId}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(itemData)
  });
  if (!response.ok) throw new Error('Failed to update menu item');
  return response.json();
}

export async function deleteMenuItem(itemId) {
  const response = await fetch(`${API_BASE_URL}/api/admin/menu/delete/${itemId}/`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to delete item');
  }

  if (response.status === 204) return null;
  return response.json();
}

// ==================== ADMIN ORDER FUNCTIONS ====================
export async function getAllOrders() {
  const response = await fetch(`${API_BASE_URL}/api/admin/orders/`);
  if (!response.ok) throw new Error('Failed to fetch orders');
  return response.json();
}

export async function updateOrderStatus(orderId, status) {
  const response = await fetch(`${API_BASE_URL}/api/admin/orders/${orderId}/status/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!response.ok) throw new Error('Failed to update order status');
  return response.json();
}

// ==================== PARTNER STAFF FUNCTIONS ====================
// ==================== PARTNER STAFF FUNCTIONS ====================
export async function getPartnerOrders(partnerName) {
  const response = await fetch(
    `${API_BASE_URL}/api/partner/orders/?partner=${encodeURIComponent(partnerName)}`
  );
  if (!response.ok) throw new Error('Failed to fetch partner orders');
  return response.json();
}

export async function updatePartnerOrderStatus(orderId, status) {
  const response = await fetch(`${API_BASE_URL}/api/partner/orders/${orderId}/status/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!response.ok) throw new Error('Failed to update status');
  return response.json();
}