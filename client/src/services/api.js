import axios from 'axios';

// Base URL pointing to your .NET API
// We keep "/api" here and add "/tasks" in each call
const API_BASE_URL = 'http://localhost:5000/api';

// Reusable axios instance for the whole app
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

//automatically attach TWT token if it exists--middleware for axios--runs before every request
api.interceptors.request.use(
  (config) => {
    // Read token that AuthContext stored in localStorage
    const token = localStorage.getItem('token');

    if (token) {
      // Add header: Authorization: Bearer <token>
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
  login: async ({ email, password}) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data; //you will receive the token here, which you can store in AuthContext
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
  register: async ({ username, email, password}) => {
    const response = await api.post('/auth/register', {
      username,
      email,
      password
    });
    return response.data; //you can choose what to return here, maybe a success message or the created user
    },
};

// "Service layer" for all task-related calls
// Each function matches one backend endpoint you listed.
export const taskApi = {
  // GET /api/tasks
  getAllTasks: async (params = {}) => {
    const response = await api.get('/tasks', { params });
    return response.data;
  },

  // POST /api/tasks
  createTask: async (task) => {
    // "task" is an object with the data your backend expects
    const response = await api.post('/tasks', task);
    return response.data;
  },

  // PUT /api/tasks/{id}
  updateTask: async (id, updatedTask) => {
    const response = await api.put(`/tasks/${id}`, updatedTask);
    return response.data;
  },

  // DELETE /api/tasks/{id}
  deleteTask: async (id) => {
    await api.delete(`/tasks/${id}`);
    // No data expected here – if it doesn't throw, we assume it worked
  },
};

// Default export is the raw axios instance in case you need it later
export default api;