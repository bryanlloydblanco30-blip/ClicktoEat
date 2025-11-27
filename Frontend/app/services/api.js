const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ==================== CART FUNCTIONS ====================

// Get cart
export async function getCart() {
  const sessionId = getSessionId();
  const response = await fetch(`${API_BASE_URL}/api/cart/?session_id=${sessionId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch cart');
  }
  return response.json();
}

// Add to cart
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
  if (!response.ok) {
    throw new Error('Failed to add to cart');
  }
  return response.json();
}

// Update cart item
export async function updateCartItem(itemId, quantity) {
  const response = await fetch(`${API_BASE_URL}/api/cart/update/${itemId}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity })
  });
  if (!response.ok) {
    throw new Error('Failed to update cart item');
  }
  return response.json();
}

// Remove from cart
export async function removeFromCart(itemId) {
  const response = await fetch(`${API_BASE_URL}/api/cart/remove/${itemId}/`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to remove from cart');
  }
  return response.json();
}

// ==================== FAVORITE FUNCTIONS ====================

// Add to favorites
export async function addFavorite(menuItemId) {
  const response = await fetch(`${API_BASE_URL}/api/favorites/add/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      menu_item_id: menuItemId,
      session_id: getSessionId()
    })
  });
  if (!response.ok) {
    throw new Error('Failed to add to favorites');
  }
  return response.json();
}

// Remove from favorites
export async function removeFavorite(menuItemId) {
  const sessionId = getSessionId();
  const response = await fetch(
    `${API_BASE_URL}/api/favorites/remove/?session_id=${sessionId}&menu_item_id=${menuItemId}`,
    { method: 'DELETE' }
  );
  if (!response.ok) {
    throw new Error('Failed to remove from favorites');
  }
  return response.json();
}

// Get all favorites
export async function getFavorites() {
  const sessionId = getSessionId();
  const response = await fetch(`${API_BASE_URL}/api/favorites/?session_id=${sessionId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch favorites');
  }
  return response.json();
}

// Get favorite IDs (for quick checking if item is favorited)
export async function getFavoriteIds() {
  const sessionId = getSessionId();
  const response = await fetch(`${API_BASE_URL}/api/favorites/ids/?session_id=${sessionId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch favorite IDs');
  }
  return response.json();
}

// ==================== ORDER FUNCTIONS ====================

// Create order
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

// Get orders
export async function getOrders() {
  const sessionId = getSessionId();
  const response = await fetch(`${API_BASE_URL}/api/orders/?session_id=${sessionId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch orders');
  }
  return response.json();
}

// ==================== ADMIN FUNCTIONS ====================

// Get all menu items (Admin - includes unavailable items)
export async function getAllMenuItemsAdmin() {
  const response = await fetch(`${API_BASE_URL}/api/admin/menu/`);
  if (!response.ok) {
    throw new Error('Failed to fetch admin menu items');
  }
  return response.json();
}

// Create menu item (Admin)
export async function createMenuItem(itemData) {
  const response = await fetch(`${API_BASE_URL}/api/admin/menu/create/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(itemData)
  });
  if (!response.ok) {
    throw new Error('Failed to create menu item');
  }
  return response.json();
}

// Update menu item (Admin)
export async function updateMenuItem(itemId, itemData) {
  const response = await fetch(`${API_BASE_URL}/api/admin/menu/update/${itemId}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(itemData)
  });
  if (!response.ok) {
    throw new Error('Failed to update menu item');
  }
  return response.json();
}

// Delete menu item (Admin)
export async function deleteMenuItem(itemId) {
  const response = await fetch(`${API_BASE_URL}/api/admin/menu/delete/${itemId}/`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete menu item');
  }
  return response.json();
}

// ==================== FOOD PARTNER FUNCTIONS ====================

// Get all food partners
export async function getFoodPartners() {
  const response = await fetch(`${API_BASE_URL}/api/partners/`);
  if (!response.ok) throw new Error('Failed to fetch partners');
  return response.json();
}

// Get menu items for a specific partner
export async function getPartnerMenuItems(partnerName) {
  const encodedName = encodeURIComponent(partnerName);
  const response = await fetch(`${API_BASE_URL}/api/partners/${encodedName}/menu/`);
  if (!response.ok) throw new Error('Failed to fetch partner menu');
  return response.json();
}

// ==================== ADMIN ORDER FUNCTIONS ====================

// Get all orders (Admin)
export async function getAllOrders() {
  const response = await fetch(`${API_BASE_URL}/api/admin/orders/`);
  if (!response.ok) throw new Error('Failed to fetch orders');
  return response.json();
}

// Update order status (Admin)
export async function updateOrderStatus(orderId, status) {
  const response = await fetch(`${API_BASE_URL}/api/admin/orders/${orderId}/status/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!response.ok) throw new Error('Failed to update order status');
  return response.json();
}

// ==================== AUTHENTICATION FUNCTIONS ====================

// Signup
// Updated signup function in services/api.js

export async function signup(username, email, password, role = 'member', foodPartner = '', fullName = '', srCode = '') {
  const response = await fetch(`${API_BASE_URL}/api/auth/signup/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      username,
      email,
      password,
      role,
      food_partner: foodPartner,
      full_name: fullName,    // NEW
      sr_code: srCode         // NEW
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Signup failed');
  }
  return response.json();
}
// Login
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

// Logout
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

// Check authentication status
export async function checkAuth() {
  const response = await fetch(`${API_BASE_URL}/api/auth/check/`, {
    credentials: 'include'
  });
  
  if (!response.ok) {
    throw new Error('Failed to check authentication');
  }
  return response.json();
}

// Helper function to get current user from localStorage
export function getCurrentUser() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

// Helper function to check if user is authenticated
export function isAuthenticated() {
  return getCurrentUser() !== null;
}

// Helper function to check user role
export function hasRole(role) {
  const user = getCurrentUser();
  return user && user.role === role;
}

// ==================== MENU FUNCTIONS ====================

// Get all available menu items
export async function getMenuItems() {
  const response = await fetch(`${API_BASE_URL}/api/menu/`);
  if (!response.ok) {
    throw new Error('Failed to fetch menu items');
  }
  return response.json();
}

// Get menu item by ID
export async function getMenuItemById(id) {
  const response = await fetch(`${API_BASE_URL}/api/menu/${id}/`, {
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch menu item');
  }
  
  return response.json();
}

// ==================== HELPER FUNCTIONS ====================

// Get or create session ID
function getSessionId() {
  if (typeof window === 'undefined') return null; // Server-side check
  
  let sessionId = localStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = 'session_' + Math.random().toString(36).substr(2, 9) + Date.now();
    localStorage.setItem('session_id', sessionId);
  }
  return sessionId;
}