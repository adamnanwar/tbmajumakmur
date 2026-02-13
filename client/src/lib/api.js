import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Important for cookies (JWT)
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for logging
apiClient.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Only redirect to login if we're not already on login page
        // and only for authentication endpoints
        if (error.response?.status === 401) {
            const currentPath = window.location.pathname;
            if (currentPath !== '/login') {
                console.error('Authentication error:', error.response?.data?.message);
                // Comment out auto-redirect for now - let pages handle errors
                // window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (email, password) => apiClient.post('/auth/login', { email, password }),
    logout: () => apiClient.post('/auth/logout'),
    getCurrentUser: () => apiClient.get('/auth/me'),
};

// Products API
export const productsAPI = {
    getAll: (params) => apiClient.get('/products', { params }),
    getById: (id) => apiClient.get(`/products/${id}`),
    create: (data) => apiClient.post('/products', data),
    update: (id, data) => apiClient.put(`/products/${id}`, data),
    delete: (id) => apiClient.delete(`/products/${id}`),
    getLowStock: () => apiClient.get('/products/low-stock'),
    getSlowMoving: (params) => apiClient.get('/products/slow-moving', { params }),
};

// Categories API
export const categoriesAPI = {
    getAll: () => apiClient.get('/categories'),
    getById: (id) => apiClient.get(`/categories/${id}`),
    create: (data) => apiClient.post('/categories', data),
    update: (id, data) => apiClient.put(`/categories/${id}`, data),
    delete: (id) => apiClient.delete(`/categories/${id}`),
};

// Transactions API
export const transactionsAPI = {
    getAll: (params) => apiClient.get('/transactions', { params }),
    getById: (id) => apiClient.get(`/transactions/${id}`),
    create: (data) => apiClient.post('/transactions', data),
};

// Inventory/Stock Movement API
export const inventoryAPI = {
    adjust: (data) => apiClient.post('/inventory/adjust', data),
    getHistory: (params) => apiClient.get('/inventory/history', { params }),
};

// Reports API
export const reportsAPI = {
    getSales: (params) => apiClient.get('/reports/sales', { params }),
    getInventory: () => apiClient.get('/reports/inventory'),
};

// Users API
export const usersAPI = {
    getAll: () => apiClient.get('/users'),
    getById: (id) => apiClient.get(`/users/${id}`),
    create: (data) => apiClient.post('/users', data),
    update: (id, data) => apiClient.put(`/users/${id}`, data),
    delete: (id) => apiClient.delete(`/users/${id}`),
};

export default apiClient;
