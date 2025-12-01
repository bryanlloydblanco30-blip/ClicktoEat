const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const ADMIN_API_URL = '/admin-api'; // Use the proxy

// ==================== HELPER FUNCTIONS ====================

// Get CSRF token from cookies
function getCsrfToken() {
  if (typeof document === 'undefined') return null;
  
  const name = 'csrftoken';
  const cookies = document.cookie.split(';');
  
  for (let cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=');
    if (cookieName === name) {
      return cookieValue;
    }
  }
  return null;
}

// Generic fetch wrapper with CSRF token
async function apiFetch(url, options = {}) {
  const csrfToken = getCsrfToken();
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };
  
  // Add CSRF token if available
  if (csrfToken) {
    defaultHeaders['X-CSRFToken'] = csrfToken;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include', // Always include credentials
  };

  const response = await fetch(`${API_BASE_URL}${url}`, config);
  return response;
}

// Get or create session ID (for guest users)
function getSessionId() {
  if (typeof window === 'undefined') return null;
  
  let sessionId = localStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = 'session_' + Math.random().toString(36).substr(2, 9) + Date.now();
    localStorage.setItem('session_id', sessionId);
  }
  return sessionId;
}

// Helper function to get current user from localStorage
export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

// Helper function to check user role
export function hasRole(role) {
  const user = getCurrentUser();
  return user && user.role === role;
}

// ==================== AUTHENTICATION FUNCTIONS ====================

// Get CSRF token from backend
async function fetchCsrfToken() {
  try {
    const response = await fetch(`${ADMIN_API_URL}/api/auth/check/`, {
      credentials: 'include'
    });
    // This will set the CSRF cookie
    return true;
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
    return false;
  }
}

// Signup
export async function signup(username, email, password, role = 'member', foodPartner = '', fullName = '', srCode = '') {
  // Get CSRF token first
  await fetchCsrfToken();
  
  const response = await fetch(`${ADMIN_API_URL}/api/auth/signup/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCsrfToken() || '',
    },
    credentials: 'include',
    body: JSON.stringify({
      username,
      email,
      password,
      role,
      food_partner: foodPartner,
      full_name: fullName,
      sr_code: srCode
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Signup failed');
  }
  const data = await response.json();
  
  // Store user info in localStorage
  if (data.user) {
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  
  return data;
}

// Login - USES PROXY TO AVOID CORS ISSUES
// Login - USES PROXY TO AVOID CORS ISSUES
// Login - USES PROXY TO AVOID CORS ISSUES
export async function login(username, password) {
  try {
    // Ensure trailing slash
    const loginUrl = `${ADMIN_API_URL}/api/auth/login/`;
    
    console.log('=== LOGIN DEBUG START ===');
    console.log('🎯 Login URL:', loginUrl);
    
    // Get CSRF token first
    await fetchCsrfToken();
    
    const csrfToken = getCsrfToken();
    console.log('🔑 CSRF Token:', csrfToken || 'MISSING');
    
    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken || '',
      },
      credentials: 'include',
      redirect: 'follow', // Follow redirects
      body: JSON.stringify({ username, password })
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response URL:', response.url);
    
    const responseText = await response.text();
    console.log('📄 Raw response:', responseText);

    if (!response.ok) {
      let error = {};
      try {
        error = JSON.parse(responseText);
      } catch (e) {
        error = { message: responseText || `HTTP ${response.status}` };
      }
      
      console.error('❌ Error:', error);
      throw new Error(error.error || error.message || 'Login failed');
    }

    const data = JSON.parse(responseText);
    console.log('✅ Success:', data);

    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  } catch (err) {
    console.error('❌ Exception:', err);
    throw err;
  }
}

// Logout
export async function logout() {
  const response = await apiFetch('/api/auth/logout/', {
    method: 'POST'
  });
  
  if (!response.ok) {
    throw new Error('Logout failed');
  }
  
  // Clear user info from localStorage
  localStorage.removeItem('user');
  
  return response.json();
}

// Check authentication status
export async function checkAuth() {
  try {
    const response = await apiFetch('/api/auth/check/');
    
    if (!response.ok) {
      // Clear localStorage if auth check fails
      localStorage.removeItem('user');
      return { authenticated: false, user: null };
    }
    
    const data = await response.json();
    
    // Update localStorage with current user data
    if (data.authenticated && data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    } else {
      localStorage.removeItem('user');
    }
    
    return data;
  } catch (error) {
    console.error('Auth check error:', error);
    localStorage.removeItem('user');
    return { authenticated: false, user: null };
  }
}

// Helper function to check if user is authenticated
export async function isAuthenticated() {
  try {
    const data = await checkAuth();
    return data.authenticated === true;
  } catch (error) {
    return false;
  }
}

// ==================== CART FUNCTIONS ====================

// Get cart - works for both authenticated and guest users
export async function getCart() {
  const sessionId = getSessionId();
  const response = await apiFetch(`/api/cart/?session_id=${sessionId}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch cart');
  }
  return response.json();
}

// Add to cart
export async function addToCart(menuItemId, quantity = 1) {
  const response = await apiFetch('/api/cart/add/', {
    method: 'POST',
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
  const response = await apiFetch(`/api/cart/update/${itemId}/`, {
    method: 'PUT',
    body: JSON.stringify({ quantity })
  });
  
  if (!response.ok) {
    throw new Error('Failed to update cart item');
  }
  return response.json();
}

// Remove from cart
export async function removeFromCart(itemId) {
  const response = await apiFetch(`/api/cart/remove/${itemId}/`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    throw new Error('Failed to remove from cart');
  }
  return response.json();
}

// ==================== ORDER FUNCTIONS ====================

// Create order - requires authentication
export async function createOrder(orderData) {
  const response = await apiFetch('/api/orders/create/', {
    method: 'POST',
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

// Get orders - requires authentication
export async function getOrders() {
  const sessionId = getSessionId();
  const response = await apiFetch(`/api/orders/?session_id=${sessionId}`);
  
  if (response.status === 401) {
    throw new Error('Authentication required');
  }
  
  if (!response.ok) {
    throw new Error('Failed to fetch orders');
  }
  return response.json();
}

// ==================== FAVORITE FUNCTIONS ====================

// Add to favorites
export async function addFavorite(menuItemId) {
  const response = await apiFetch('/api/favorites/add/', {
    method: 'POST',
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
  const response = await apiFetch(
    `/api/favorites/remove/?session_id=${sessionId}&menu_item_id=${menuItemId}`,
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
  const response = await apiFetch(`/api/favorites/?session_id=${sessionId}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch favorites');
  }
  return response.json();
}

// Get favorite IDs
export async function getFavoriteIds() {
  const sessionId = getSessionId();
  const response = await apiFetch(`/api/favorites/ids/?session_id=${sessionId}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch favorite IDs');
  }
  return response.json();
}

// ==================== MENU FUNCTIONS ====================

// Get all available menu items
export async function getMenuItems() {
  const response = await apiFetch('/api/menu/');
  
  if (!response.ok) {
    throw new Error('Failed to fetch menu items');
  }
  return response.json();
}

// Get menu item by ID
export async function getMenuItemById(id) {
  const response = await apiFetch(`/api/menu/${id}/`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch menu item');
  }
  
  return response.json();
}

// ==================== FOOD PARTNER FUNCTIONS ====================

// Get all food partners
export async function getFoodPartners() {
  const response = await apiFetch('/api/partners/');
  
  if (!response.ok) throw new Error('Failed to fetch partners');
  return response.json();
}

// Get menu items for a specific partner
export async function getPartnerMenuItems(partnerName) {
  if (!partnerName || partnerName === 'undefined') {
    console.error('Invalid partner name:', partnerName);
    throw new Error('Partner name is required');
  }
  
  const encodedName = encodeURIComponent(partnerName);
  const response = await apiFetch(`/api/partners/${encodedName}/menu/`);
  
  if (!response.ok) {
    console.error('Failed to fetch partner menu. Status:', response.status);
    throw new Error('Failed to fetch partner menu');
  }
  
  return response.json();
}

// ==================== ADMIN FUNCTIONS ====================

// Get all menu items (Admin)
export async function getAllMenuItemsAdmin() {
  const response = await apiFetch('/api/admin/menu/');
  
  if (!response.ok) {
    throw new Error('Failed to fetch admin menu items');
  }
  return response.json();
}

// Create menu item (Admin)
export async function createMenuItem(itemData) {
  const response = await apiFetch('/api/admin/menu/create/', {
    method: 'POST',
    body: JSON.stringify(itemData)
  });
  
  if (!response.ok) {
    throw new Error('Failed to create menu item');
  }
  return response.json();
}

// Update menu item (Admin)
export async function updateMenuItem(itemId, itemData) {
  const response = await apiFetch(`/api/admin/menu/update/${itemId}/`, {
    method: 'PUT',
    body: JSON.stringify(itemData)
  });
  
  if (!response.ok) {
    throw new Error('Failed to update menu item');
  }
  return response.json();
}

// Delete menu item (Admin)
export async function deleteMenuItem(itemId) {
  const response = await apiFetch(`/api/admin/menu/delete/${itemId}/`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete menu item');
  }
  return response.json();
}

// Get all orders (Admin)
export async function getAllOrders() {
  const response = await apiFetch('/api/admin/orders/');
  
  if (!response.ok) throw new Error('Failed to fetch orders');
  return response.json();
}

// Update order status (Admin)
export async function updateOrderStatus(orderId, status) {
  const response = await apiFetch(`/api/admin/orders/${orderId}/status/`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });
  
  if (!response.ok) throw new Error('Failed to update order status');
  return response.json();
} 