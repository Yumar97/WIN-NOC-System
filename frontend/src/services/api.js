import axios from 'axios';

// Configuración base de axios
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para requests - agregar token de autorización
api.interceptors.request.use(
  (config) => {
    // El token se agregará en el AuthContext
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para responses - manejo de errores globales
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Manejo de errores de red
    if (!error.response) {
      console.error('Error de red:', error.message);
      return Promise.reject({
        message: 'Error de conexión. Verifica tu conexión a internet.',
        type: 'network_error',
      });
    }

    // Manejo de errores HTTP
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        console.error('Bad Request:', data);
        break;
      case 401:
        console.error('Unauthorized:', data);
        break;
      case 403:
        console.error('Forbidden:', data);
        break;
      case 404:
        console.error('Not Found:', data);
        break;
      case 422:
        console.error('Validation Error:', data);
        break;
      case 429:
        console.error('Rate Limited:', data);
        break;
      case 500:
        console.error('Server Error:', data);
        break;
      default:
        console.error('HTTP Error:', status, data);
    }

    return Promise.reject(error);
  }
);

// ===== SERVICIOS DE AUTENTICACIÓN =====
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: (token) => api.post('/auth/logout', {}, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refresh_token: refreshToken }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', {
    token,
    new_password: newPassword,
    confirm_password: newPassword
  }),
  getMe: (token) => api.get('/auth/me', {
    headers: { Authorization: `Bearer ${token}` }
  }),
  changePassword: (passwordData) => api.post('/auth/change-password', passwordData),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
};

// ===== SERVICIOS DE DASHBOARD =====
export const dashboardAPI = {
  getOverview: () => api.get('/dashboard/overview'),
  getMetrics: (timeRange = '24h') => api.get(`/dashboard/metrics?range=${timeRange}`),
  getRecentIncidents: (limit = 10) => api.get(`/dashboard/incidents/recent?limit=${limit}`),
  getNetworkStatus: () => api.get('/dashboard/network/status'),
  getAlerts: (limit = 20) => api.get(`/dashboard/alerts?limit=${limit}`),
  getPerformanceMetrics: () => api.get('/dashboard/performance'),
};

// ===== SERVICIOS DE INCIDENCIAS =====
export const incidentsAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/incidents?${queryString}`);
  },
  getById: (id) => api.get(`/incidents/${id}`),
  create: (incidentData) => api.post('/incidents', incidentData),
  update: (id, incidentData) => api.put(`/incidents/${id}`, incidentData),
  delete: (id) => api.delete(`/incidents/${id}`),
  assign: (id, userId) => api.post(`/incidents/${id}/assign`, { user_id: userId }),
  escalate: (id, level) => api.post(`/incidents/${id}/escalate`, { level }),
  addComment: (id, comment) => api.post(`/incidents/${id}/comments`, { message: comment }),
  getComments: (id) => api.get(`/incidents/${id}/comments`),
  updateStatus: (id, status) => api.patch(`/incidents/${id}/status`, { status }),
  getStatistics: (dateRange) => api.get('/incidents/statistics', { params: dateRange }),
  export: (format, filters) => api.get('/incidents/export', {
    params: { format, ...filters },
    responseType: 'blob'
  }),
};

// ===== SERVICIOS DE RED Y DISPOSITIVOS =====
export const networkAPI = {
  getDevices: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/network/devices?${queryString}`);
  },
  getDeviceById: (id) => api.get(`/network/devices/${id}`),
  createDevice: (deviceData) => api.post('/network/devices', deviceData),
  updateDevice: (id, deviceData) => api.put(`/network/devices/${id}`, deviceData),
  deleteDevice: (id) => api.delete(`/network/devices/${id}`),
  getDeviceMetrics: (id, timeRange = '24h') => api.get(`/network/devices/${id}/metrics?range=${timeRange}`),
  getDeviceInterfaces: (id) => api.get(`/network/devices/${id}/interfaces`),
  updateDeviceInterface: (deviceId, interfaceId, data) => 
    api.put(`/network/devices/${deviceId}/interfaces/${interfaceId}`, data),
  pingDevice: (id) => api.post(`/network/devices/${id}/ping`),
  backupDevice: (id) => api.post(`/network/devices/${id}/backup`),
  getTopology: () => api.get('/network/topology'),
  getNetworkMap: () => api.get('/network/map'),
  getPerformanceMetrics: (timeRange = '24h') => api.get(`/network/performance?range=${timeRange}`),
};

// ===== SERVICIOS DE ANALYTICS =====
export const analyticsAPI = {
  getIncidentTrends: (timeRange = '30d') => api.get(`/analytics/incidents/trends?range=${timeRange}`),
  getNetworkPerformance: (timeRange = '30d') => api.get(`/analytics/network/performance?range=${timeRange}`),
  getCustomerSatisfaction: (timeRange = '30d') => api.get(`/analytics/customer/satisfaction?range=${timeRange}`),
  getSLAMetrics: (timeRange = '30d') => api.get(`/analytics/sla?range=${timeRange}`),
  getAvailabilityReport: (timeRange = '30d') => api.get(`/analytics/availability?range=${timeRange}`),
  getPredictiveAnalysis: () => api.get('/analytics/predictive'),
  getCustomReport: (reportConfig) => api.post('/analytics/custom-report', reportConfig),
  exportAnalytics: (type, timeRange, format = 'pdf') => api.get('/analytics/export', {
    params: { type, range: timeRange, format },
    responseType: 'blob'
  }),
};

// ===== SERVICIOS DE CLIENTES =====
export const customersAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/customers?${queryString}`);
  },
  getById: (id) => api.get(`/customers/${id}`),
  create: (customerData) => api.post('/customers', customerData),
  update: (id, customerData) => api.put(`/customers/${id}`, customerData),
  delete: (id) => api.delete(`/customers/${id}`),
  getFeedback: (id, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/customers/${id}/feedback?${queryString}`);
  },
  addFeedback: (id, feedbackData) => api.post(`/customers/${id}/feedback`, feedbackData),
  getIncidents: (id, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/customers/${id}/incidents?${queryString}`);
  },
  getServiceHistory: (id) => api.get(`/customers/${id}/service-history`),
  getSatisfactionScore: (id, timeRange = '30d') => 
    api.get(`/customers/${id}/satisfaction?range=${timeRange}`),
};

// ===== SERVICIOS DE REPORTES =====
export const reportsAPI = {
  getAll: () => api.get('/reports'),
  getById: (id) => api.get(`/reports/${id}`),
  create: (reportData) => api.post('/reports', reportData),
  update: (id, reportData) => api.put(`/reports/${id}`, reportData),
  delete: (id) => api.delete(`/reports/${id}`),
  generate: (id, params = {}) => api.post(`/reports/${id}/generate`, params),
  download: (id, format = 'pdf') => api.get(`/reports/${id}/download`, {
    params: { format },
    responseType: 'blob'
  }),
  schedule: (id, scheduleData) => api.post(`/reports/${id}/schedule`, scheduleData),
  getTemplates: () => api.get('/reports/templates'),
  preview: (reportData) => api.post('/reports/preview', reportData),
};

// ===== SERVICIOS DE USUARIOS =====
export const usersAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/users?${queryString}`);
  },
  getById: (id) => api.get(`/users/${id}`),
  create: (userData) => api.post('/users', userData),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
  activate: (id) => api.post(`/users/${id}/activate`),
  deactivate: (id) => api.post(`/users/${id}/deactivate`),
  resetPassword: (id) => api.post(`/users/${id}/reset-password`),
  updateRole: (id, role) => api.patch(`/users/${id}/role`, { role }),
  getActivity: (id, timeRange = '30d') => api.get(`/users/${id}/activity?range=${timeRange}`),
  getPermissions: (id) => api.get(`/users/${id}/permissions`),
  updatePermissions: (id, permissions) => api.put(`/users/${id}/permissions`, { permissions }),
};

// ===== SERVICIOS DE NOTIFICACIONES =====
export const notificationsAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/notifications?${queryString}`);
  },
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  updatePreferences: (preferences) => api.put('/notifications/preferences', preferences),
  getPreferences: () => api.get('/notifications/preferences'),
  testNotification: (type, data) => api.post('/notifications/test', { type, data }),
};

// ===== SERVICIOS DE CONFIGURACIÓN =====
export const settingsAPI = {
  getAll: () => api.get('/settings'),
  update: (settings) => api.put('/settings', settings),
  getByCategory: (category) => api.get(`/settings/${category}`),
  updateCategory: (category, settings) => api.put(`/settings/${category}`, settings),
  reset: (category) => api.post(`/settings/${category}/reset`),
  backup: () => api.get('/settings/backup', { responseType: 'blob' }),
  restore: (backupFile) => {
    const formData = new FormData();
    formData.append('backup', backupFile);
    return api.post('/settings/restore', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
};

// ===== SERVICIOS DE ARCHIVOS =====
export const filesAPI = {
  upload: (file, type = 'general') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    return api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  delete: (fileId) => api.delete(`/files/${fileId}`),
  download: (fileId) => api.get(`/files/${fileId}/download`, { responseType: 'blob' }),
  getMetadata: (fileId) => api.get(`/files/${fileId}/metadata`),
};

// Función helper para manejar errores de API
export const handleAPIError = (error) => {
  if (error.response) {
    // Error de respuesta del servidor
    const { status, data } = error.response;
    return {
      status,
      message: data.message || 'Error del servidor',
      details: data.details || null,
      type: 'server_error'
    };
  } else if (error.request) {
    // Error de red
    return {
      status: 0,
      message: 'Error de conexión. Verifica tu conexión a internet.',
      type: 'network_error'
    };
  } else {
    // Error de configuración
    return {
      status: 0,
      message: error.message || 'Error desconocido',
      type: 'unknown_error'
    };
  }
};

// Función helper para crear parámetros de consulta
export const createQueryParams = (params) => {
  const filteredParams = Object.entries(params)
    .filter(([_, value]) => value !== null && value !== undefined && value !== '')
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
  
  return new URLSearchParams(filteredParams).toString();
};

export default api;