import axios from 'axios';

// Base URL pointing to your .NET API
const API_BASE_URL = 'http://localhost:5000/api';

// Reusable axios instance for the whole app
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach JWT token if it exists..config is the request details (URL, headers, data, etc.)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API (login + register + forgot/reset password)
export const authApi = {
  // POST /api/auth/login
  login: async ({ email, password }) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  // Request password reset (sends email)
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password with token
  resetPassword: async (token, newPassword) => {
    const response = await api.post('/auth/reset-password', { 
      token, 
      newPassword 
    });
    return response.data;
  },

  // POST /api/auth/register
  register: async ({ username, email, password }) => {
    const response = await api.post('/auth/register', {
      username,
      email,
      password
    });
    return response.data;
  },
};

// Task API - all task-related calls
export const taskApi = {
  // GET /api/tasks
  getAllTasks: async (params = {}) => {
    const response = await api.get('/tasks', { params });
    return response.data;
  },

  // POST /api/tasks
  createTask: async (task) => {
    const response = await api.post('/tasks', task);
    return response.data;
  },

  // PUT /api/tasks/{id}
  updateTask: async (id, updatedTask) => {
    const response = await api.put(`/tasks/${id}`, updatedTask);
    return response.data;
  },

  // DELETE /api/tasks/{id} - Soft delete (marks as deleted)
  deleteTask: async (id) => {
    await api.delete(`/tasks/${id}`);
  },

  // GET /api/tasks/deleted - Get deleted tasks (trash view)
  getDeletedTasks: async () => {
    const response = await api.get('/tasks/deleted');
    return response.data;
  },

  // POST /api/tasks/{id}/restore - Restore task from trash
  restoreTask: async (id) => {
    await api.post(`/tasks/${id}/restore`);
  },

  // DELETE /api/tasks/{id}/permanent - Permanent delete (removes from database)
  permanentDelete: async (id) => {
    await api.delete(`/tasks/${id}/permanent`);
  },

  //  GET /api/tasks/export - Export tasks
  exportTasks: async (format = 'json', includeCompleted = true) => {
    const params = new URLSearchParams({
      format,
      includeCompleted: includeCompleted.toString()
    });

    const response = await api.get(`/tasks/export?${params}`, {
      // IMPORTANT: responseType must be 'blob' for file downloads (CSV/PDF)
      // For JSON, it can be 'json' but 'blob' works for all formats
      responseType: format === 'json' ? 'json' : 'blob',
    });

    return response;
  },
};

//  ADMIN API - New section for admin endpoints
export const adminApi = {
  // USER MANAGEMENT
  
  // GET /api/admin/users - Get all users
  getAllUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  // GET /api/admin/users/{id} - Get user details with their tasks
  getUserDetail: async (userId) => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },

  // DELETE /api/admin/users/{id} - Delete a user
  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  // PUT /api/admin/users/{id}/role - Change user role
  changeUserRole: async (userId, role) => {
    const response = await api.put(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

 
  // TASK MANAGEMENT
  
  // GET /api/admin/tasks - Get all tasks (all users)
  getAllTasks: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.isCompleted !== undefined) queryParams.append('isCompleted', params.isCompleted);
    if (params.priority) queryParams.append('priority', params.priority);
    
    const response = await api.get(`/admin/tasks?${queryParams}`);
    return response.data;
  },

  // POST /api/admin/tasks/assign - Assign existing task to user
  assignTask: async (taskId, userId) => {
    const response = await api.post('/admin/tasks/assign', { taskId, userId });
    return response.data;
  },

  // POST /api/admin/tasks/create-and-assign - Create task and assign it
  createAndAssignTask: async (taskData) => {
    const response = await api.post('/admin/tasks/create-and-assign', taskData);
    return response.data;
  },

  // DELETE /api/admin/tasks/{id}/force - Permanently delete task
  forceDeleteTask: async (taskId) => {
    const response = await api.delete(`/admin/tasks/${taskId}/force`);
    return response.data;
  },

  
  // STATISTICS
 
  // GET /api/admin/stats - Get system statistics
  getStatistics: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },
};

// Default export is the raw axios instance in case you need it later
export default api;