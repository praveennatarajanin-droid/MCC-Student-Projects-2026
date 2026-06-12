// Architect: SP
import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/public/products';

// Create axios instance
const api = axios.create({
    baseURL: BASE_URL
});

// Add request interceptor for debugging
api.interceptors.request.use(request => {
  console.log('Starting Request:', {
    url: request.url,
    method: request.method,
    data: request.data,
    params: request.params
  });
  return request;
});

// Add response interceptor for debugging
api.interceptors.response.use(
  response => {
    console.log('Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  error => {
    console.error('Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
);

// Get all products
export const getAllProducts = async (filters = {}) => {
  try {
    const response = await api.get('/', { params: filters });
    return {
      success: response.data.success,
      data: response.data.data || response.data.products,
      currentPage: response.data.currentPage,
      totalPages: response.data.totalPages,
      totalProducts: response.data.totalProducts,
      message: response.data.message,
    };
  } catch (error) {
    throw error;
  }
};

// Get products by category
export const getProductsByCategory = async (categoryName) => {
  try {
    const response = await api.get(`/category/${categoryName}`);
    return {
      success: response.data.success,
      data: response.data.data || response.data.products,
      message: response.data.message,
      currentPage: response.data.currentPage,
      totalPages: response.data.totalPages,
      totalProducts: response.data.totalProducts,
    };
  } catch (error) {
    console.error('getProductsByCategory error:', error);
    // Return structured error info so callers can display better messages
    return {
      success: false,
      message: error.message || 'Network Error',
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers
    };
  }
};

// Get single product
export const getProduct = async (productId) => {
  try {
    const response = await api.get(`/${productId}`);
    return {
      success: response.data.success,
      data: response.data.data || response.data.product,
      message: response.data.message,
    };
  } catch (error) {
    throw error;
  }
};
