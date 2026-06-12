// Architect: SP
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/admin/auth';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Login admin
export const loginAdmin = async (credentials) => {
  try {
    const response = await api.post('/login', credentials);
    
    if (response.data.admin) {
      // Store admin info (no sensitive data)
      localStorage.setItem('admin', JSON.stringify({
        id: response.data.admin.id,
        username: response.data.admin.username,
        name: response.data.admin.name,
        store: response.data.admin.store
      }));
    }

    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Login failed');
    }
    throw new Error('Network error. Please check your connection.');
  }
};

// Get current admin
export const getCurrentAdmin = () => {
  try {
    const admin = localStorage.getItem('admin');
    return admin ? JSON.parse(admin) : null;
  } catch (error) {
    console.error('Error parsing admin data:', error);
    return null;
  }
};

// Get admin's store
export const getAdminStore = () => {
  const admin = getCurrentAdmin();
  return admin ? admin.store : null;
};

// Check if admin is logged in
export const isAdminLoggedIn = async () => {
  const admin = getCurrentAdmin();
  if (!admin) return false;

  try {
    // Verify session with backend
    await api.get('/verify');
    return true;
  } catch (error) {
    console.error('Session verification failed:', error);
    localStorage.removeItem('admin');
    return false;
  }
};

// Logout admin
export const logoutAdmin = async () => {
  try {
    await api.post('/logout');
    localStorage.removeItem('admin');
  } catch (error) {
    console.error('Logout error:', error);
    // Still remove local data even if server request fails
    localStorage.removeItem('admin');
    throw new Error('Logout failed. Please try again.');
  }
};

// Intercept 401 responses
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Clear local storage on authentication error
      localStorage.removeItem('admin');
    }
    return Promise.reject(error);
  }
);
