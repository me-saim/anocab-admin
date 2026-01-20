import axios from 'axios';

// Use absolute URL for development (when React runs on 3000 and API on 5000)
// Use relative path in production (when served from same server)
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'development' ? 'http://localhost:5000/api' : '/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout. Please check your connection and try again.';
    } else if (error.response) {
      // Server responded with error
      error.message = error.response.data?.error || error.message;
    } else if (error.request) {
      // Request made but no response
      error.message = 'No response from server. Please check if the server is running.';
    }
    return Promise.reject(error);
  }
);

// Admins
export const adminsAPI = {
  getAll: () => api.get('/admins'),
  getById: (id) => api.get(`/admins/${id}`),
  create: (data) => api.post('/admins', data),
  update: (id, data) => api.put(`/admins/${id}`, data),
  delete: (id) => api.delete(`/admins/${id}`),
  login: (credentials) => api.post('/admins/login', credentials),
};

// Users
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  getRedeemable: (id) => api.get(`/users/${id}/redeemable`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getDealersByCity: (city) => api.get('/users/dealers/by-city', { params: { city } }),
  getElectriciansByCity: (city) => api.get('/users/electricians/by-city', { params: { city } }),
};

// Blogs
export const blogsAPI = {
  getAll: (params) => api.get('/blogs', { params }),
  getById: (id) => api.get(`/blogs/${id}`),
  create: (data) => api.post('/blogs', data),
  update: (id, data) => api.put(`/blogs/${id}`, data),
  delete: (id) => api.delete(`/blogs/${id}`),
};

// Upload
export const uploadAPI = {
  uploadImage: (formData) => {
    return api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Catalog
export const catalogAPI = {
  getAll: (params) => api.get('/catalog', { params }),
  getById: (id) => api.get(`/catalog/${id}`),
  create: (data) => api.post('/catalog', data),
  update: (id, data) => api.put(`/catalog/${id}`, data),
  delete: (id) => api.delete(`/catalog/${id}`),
};

// QR Codes
export const qrCodesAPI = {
  getAll: (params) => api.get('/qr-codes', { params }),
  getById: (id) => api.get(`/qr-codes/${id}`),
  create: (data) => api.post('/qr-codes', data),
  update: (id, data) => api.put(`/qr-codes/${id}`, data),
  delete: (id) => api.delete(`/qr-codes/${id}`),
};

// QR Scans
export const qrScansAPI = {
  getAll: (params) => api.get('/qr-scans', { params }),
  getById: (id) => api.get(`/qr-scans/${id}`),
};

// Redeem Transactions
export const redeemTransactionsAPI = {
  getAll: (params) => api.get('/redeem-transactions', { params }),
  getById: (id) => api.get(`/redeem-transactions/${id}`),
  update: (id, data) => api.put(`/redeem-transactions/${id}`, data),
  delete: (id) => api.delete(`/redeem-transactions/${id}`),
};

// Payment Transactions
export const paymentTransactionsAPI = {
  getAll: (params) => api.get('/payment-transactions', { params }),
  getById: (id) => api.get(`/payment-transactions/${id}`),
  update: (id, data) => api.put(`/payment-transactions/${id}`, data),
};

// Calculator Data
export const calculatorDataAPI = {
  getAll: (params) => api.get('/calculator-data', { params }),
  getById: (id) => api.get(`/calculator-data/${id}`),
  create: (data) => api.post('/calculator-data', data),
  update: (id, data) => api.put(`/calculator-data/${id}`, data),
  delete: (id) => api.delete(`/calculator-data/${id}`),
};

// Dashboard
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getRecent: () => api.get('/dashboard/recent'),
};

export default api;
