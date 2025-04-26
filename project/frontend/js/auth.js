/**
 * Authentication related functions
 */

// Token storage key
const TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';

// Store authentication token and user data
function setAuth(token, userData) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
}

// Get authentication token
function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

// Get current user data
function getCurrentUser() {
  const userData = localStorage.getItem(USER_DATA_KEY);
  return userData ? JSON.parse(userData) : null;
}

// Check if user is authenticated
function isAuthenticated() {
  return !!getToken();
}

// Check if user is admin
function isAdmin() {
  const user = getCurrentUser();
  return user && user.isAdmin === true;
}

// Register new user
async function register(userData) {
  try {
    const response = await utils.fetchAPI('/users', 'POST', userData);
    setAuth(response.token, {
      _id: response._id,
      firstName: response.firstName,
      lastName: response.lastName,
      email: response.email,
      isAdmin: response.isAdmin
    });
    return response;
  } catch (error) {
    throw error;
  }
}

// Login user
async function login(email, password) {
  try {
    const response = await utils.fetchAPI('/users/login', 'POST', { email, password });
    setAuth(response.token, {
      _id: response._id,
      firstName: response.firstName,
      lastName: response.lastName,
      email: response.email,
      isAdmin: response.isAdmin
    });
    return response;
  } catch (error) {
    throw error;
  }
}

// Admin login
async function adminLogin(email, password) {
  try {
    // Use the same endpoint but verify admin status after login
    const response = await utils.fetchAPI('/users/login', 'POST', { email, password });
    
    if (!response.isAdmin) {
      throw new Error('Not authorized as admin');
    }
    
    setAuth(response.token, {
      _id: response._id,
      firstName: response.firstName,
      lastName: response.lastName,
      email: response.email,
      isAdmin: response.isAdmin
    });
    
    return response;
  } catch (error) {
    throw error;
  }
}

// Logout user
function logout(redirectUrl = '/login.html') {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_DATA_KEY);
  window.location.href = redirectUrl;
}

// Update user profile
async function updateProfile(userData) {
  try {
    const token = getToken();
    const response = await utils.fetchAPI('/users/profile', 'PUT', userData, token);
    
    // Update stored user data
    const currentUser = getCurrentUser();
    const updatedUser = {
      ...currentUser,
      firstName: response.firstName,
      lastName: response.lastName,
      email: response.email
    };
    
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedUser));
    
    return response;
  } catch (error) {
    throw error;
  }
}

// Get user profile data
async function getProfile() {
  try {
    const token = getToken();
    return await utils.fetchAPI('/users/profile', 'GET', null, token);
  } catch (error) {
    throw error;
  }
}

// Check admin status
function checkAdmin() {
  if (!isAuthenticated()) {
    window.location.href = '/admin/login.html';
    return false;
  }
  
  if (!isAdmin()) {
    window.location.href = '/dashboard.html';
    return false;
  }
  
  return true;
}

// Check authentication status
function checkAuth() {
  if (!isAuthenticated()) {
    window.location.href = '/login.html';
    return false;
  }
  
  return true;
}

// Export auth functions
window.auth = {
  register,
  login,
  adminLogin,
  logout,
  isAuthenticated,
  isAdmin,
  getCurrentUser,
  getToken,
  updateProfile,
  getProfile,
  checkAuth,
  checkAdmin
};