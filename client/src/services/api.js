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

//automatically attach TWT token if it exists
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

// Auth API (login + register)
export const authApi = {
  // POST /api/auth/login
  login: async ({ email, password}) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data; //you will receive the token here, which you can store in AuthContext
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
  getAllTasks: async () => {
    const response = await api.get('/tasks');
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