import axios, { InternalAxiosRequestConfig } from 'axios';

export const BASE_URL = 'https://devcrm.yellowtooths.in/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json', // Added explicit Accept header
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// Request Interceptor: Automatically adds token to every call
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    
    if (token && config.headers) {
      // Use bracket notation or safely assign to headers
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Automatically logs out on 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if the error is 401 AND it's not a login attempt
    // (Prevents clearing storage if the user just typed the wrong password on the login screen)
    if (
      error.response && 
      error.response.status === 401 && 
      !error.config.url.includes('/login') // Adjust based on your actual login endpoint path
    ) {
      localStorage.clear(); // Clear token and role
      
      // Optional: Prevent redirect loop if already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'; 
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;