import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { getSecureCookie, clearSecureCookies } from '../utils/secureStorage';

// Environment-based configuration
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://devcrm.yellowtooths.in/api';

// Default headers configuration
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'X-Requested-With': 'XMLHttpRequest',
} as const;

// Token management utilities
const TOKEN_KEY = 'token';

const getAuthToken = (): string | null => getSecureCookie(TOKEN_KEY);

const clearAuthData = (): void => {
  clearSecureCookies();
  // Prevent redirect loop if already on login page
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

const isLoginRequest = (url?: string): boolean => url?.includes('/login') ?? false;

// Create axios instance with optimized configuration
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: DEFAULT_HEADERS,
  timeout: 10000, // 10 second timeout
});

// Request Interceptor: Add authentication token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle authentication errors and responses
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    const { response, config } = error;

    // Handle 401 Unauthorized (exclude login requests)
    if (response?.status === 401 && !isLoginRequest(config?.url)) {
      clearAuthData();
    }

    // Handle network errors
    if (!response) {
      console.error('Network error - please check your connection');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
export { BASE_URL };