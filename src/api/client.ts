// src/api/client.ts
import axios from 'axios';

export const BASE_URL = 'https://devcrm.yellowtooths.in/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically adds token to every call
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; //
  }
  return config;
});

// Response Interceptor: Automatically logs out on 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.clear(); // Clear token and role
      window.location.href = '/login'; // Force redirect
    }
    return Promise.reject(error);
  }
);

export default apiClient;