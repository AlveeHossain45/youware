// src/contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';

import apiClient from '../api/axios'; // <-- Import our new API client

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if a user is logged in on initial app load
  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Use the '/auth/me' endpoint to get the user's profile
          const response = await apiClient.get('/auth/me');
          setUser(response.data);
        } catch (error) {
          // If the token is invalid or expired, clear it
          console.error("Session check failed:", error);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  // --- LOGIN FUNCTION ---
  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      
      const { user, token } = response.data;
      
      // Store the token in localStorage
      localStorage.setItem('token', token);
      
      // Set the user in the state
      setUser(user);
      
      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error.response?.data?.message || error.message);
      return { success: false, error: error.response?.data?.message || 'Login failed. Please try again.' };
    }
  };

  // --- REGISTER FUNCTION ---
  const register = async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      
      const { user, token } = response.data;
      
      localStorage.setItem('token', token);
      setUser(user);

      return { success: true, user };
    } catch (error) {
      console.error('Registration error:', error.response?.data?.message || error.message);
      return { success: false, error: error.response?.data?.message || 'Registration failed.' };
    }
  };

  // --- LOGOUT FUNCTION ---
  const logout = () => {
    // Remove the token from localStorage
    localStorage.removeItem('token');
    // Clear the user from the state
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};