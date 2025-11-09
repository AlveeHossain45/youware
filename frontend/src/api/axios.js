// src/api/axios.js
import axios from 'axios';

// This line is the key.
// In production, it will use the Vercel variable.
// In development (npm run dev), it will use localhost.
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

console.log('API Base URL:', baseURL); // <-- Add this for debugging!

const apiClient = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});


// IMPORTANT: Interceptor to add the JWT token to every request if it exists
apiClient.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    const token = localStorage.getItem('token');
    
    // If the token exists, add it to the Authorization header
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;