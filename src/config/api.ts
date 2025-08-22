import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,

  // Blog post endpoints
  PUBLIC_POSTS: `${API_BASE_URL}/posts/public`,
  POSTS: `${API_BASE_URL}/posts`,
  POST_BY_ID: (id: string) => `${API_BASE_URL}/posts/${id}`,

  // --- NEW ENDPOINTS FOR MY BLOGS AND TIME CAPSULES ---
  MY_POSTS: `${API_BASE_URL}/posts/me`, // This can still be used for an "All My Posts" view
  MY_PUBLIC_POSTS: `${API_BASE_URL}/posts/me/public`,
  MY_PRIVATE_POSTS: `${API_BASE_URL}/posts/me/private`,
  MY_TIME_CAPSULES: `${API_BASE_URL}/posts/time-capsules`, // Correct endpoint for time capsules
};

// ... (the rest of your api.ts file remains the same)
// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('miniverse_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, redirect to login
      localStorage.removeItem('miniverse_token');
      localStorage.removeItem('miniverse_username');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;