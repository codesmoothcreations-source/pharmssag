import React, { createContext, useState, useContext, useEffect, useRef } from 'react'
import axios from 'axios'
import { authApi } from '../api/authApi'

/**
 * Authentication Context - Manages global authentication state
 * Provides login, logout, registration, and user management functions
 */
const AuthContext = createContext()

/**
 * Custom hook to use authentication context
 * Must be used within AuthProvider component
 */
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

/**
 * AuthProvider Component - Wraps app to provide authentication state
 * Handles JWT tokens, user data, and API interceptors
 */
export const AuthProvider = ({ children }) => {
  // Authentication state
  const [user, setUser] = useState(null) // Current user data
  const [loading, setLoading] = useState(true) // Initial loading state
  const [error, setError] = useState(null) // Authentication errors
  const interceptorRef = useRef(null) // Reference for axios interceptors

  // Set up axios interceptors for automatic token handling
  useEffect(() => {
    // Request interceptor - automatically add auth token to requests
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor - handle authentication errors globally
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid - clear authentication state
          localStorage.removeItem('token')
          delete axios.defaults.headers.common['Authorization']
          setUser(null)
          setError('Session expired. Please login again.')
        }
        return Promise.reject(error)
      }
    )

    // Store interceptor references for cleanup
    interceptorRef.current = { requestInterceptor, responseInterceptor }

    return () => {
      // Cleanup interceptors on component unmount
      if (interceptorRef.current) {
        axios.interceptors.request.eject(interceptorRef.current.requestInterceptor)
        axios.interceptors.response.eject(interceptorRef.current.responseInterceptor)
      }
    }
  }, [])

  // Initialize authentication on app startup
   useEffect(() => {
     const initAuth = async () => {
       
       const token = localStorage.getItem('token')
       

       if (token) {
         try {
           
           // CRITICAL FIX: Pass the token to getProfile API call
           const response = await authApi.getProfile(token)
           

           // Backend returns: { success: true, data: userObject }
           const userData = response.data || response.user || response
           

           if (userData && userData._id) {
             setUser(userData)
             setError(null)
             
           } else {
             throw new Error('Invalid user data received')
           }
         } catch (error) {
           
           // Clear invalid token and reset state
           localStorage.removeItem('token')
           setUser(null)
           setError('Session expired. Please login again.')
         }
       } else {
         
       }

       // Set loading to false after authentication check
       
       setLoading(false)
     }

     initAuth()
   }, [])

  /**
   * Login function - Authenticates user with email and password
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<{success: boolean, message: string, user?: object}>}
   */
  const login = async (email, password) => {
     try {
       
       setLoading(true)
       setError(null)

       // Call authentication service
       
       const response = await authApi.login(email, password)
       

       // Handle different possible response structures from backend
       const responseData = response.data || response
       

       // Backend returns: { success: true, data: { _id, name, email, role, department, token }, message: "Login successful" }
       const userData = responseData.data || responseData.user || responseData
       const token = responseData.data?.token || responseData.token || responseData.accessToken
       
       

       if (!token) {
         throw new Error('No token received from server')
       }

       // Store JWT token in localStorage
       localStorage.setItem('token', token)
       

       // Update user state - use the data object which contains user info + token
       setUser(userData)
       

       return {
         success: true,
         message: responseData.message || 'Login successful',
         user: userData
       }
     } catch (error) {
       
       const message = error.response?.data?.message || error.message || 'Login failed'
       
       setError(message)

       // Clear any potentially invalid token
       localStorage.removeItem('token')

       return {
         success: false,
         message
       }
     } finally {
       setLoading(false)
     }
   }

  const register = async (userData) => {
     try {
       
       setLoading(true)
       setError(null)

       const response = await authApi.register(userData)
       

       // Handle different response structures
       const responseData = response.data || response
       

       // Backend returns: { success: true, data: { _id, name, email, role, department, token }, message: "User registered successfully" }
       const newUser = responseData.data || responseData.user || responseData
       const token = responseData.data?.token || responseData.token || responseData.accessToken
       
       

       if (!token) {
         throw new Error('No token received from server')
       }

       // Store token
       localStorage.setItem('token', token)
       

       // Set user data
       setUser(newUser)
       

       return {
         success: true,
         message: responseData.message || 'Registration successful',
         user: newUser
       }
     } catch (error) {
       
       const message = error.response?.data?.message || error.message || 'Registration failed'
       
       setError(message)

       return {
         success: false,
         message
       }
     } finally {
       setLoading(false)
     }
   }

  /**
   * Logout function - Clears authentication state and tokens
   */
  const logout = () => {
    try {
      // Remove JWT token from localStorage
      localStorage.removeItem('token')

      // Clear user state and any errors
      setUser(null)
      setError(null)

      // Optional: Call logout endpoint if backend needs to invalidate token
      // await authService.logout()
    } catch (error) {
      
      // Force clear authentication state even if there's an error
      localStorage.removeItem('token')
      setUser(null)
    }
  }

  const updateUser = (updatedUser) => {
    setUser(prevUser => ({
      ...prevUser,
      ...updatedUser
    }))
  }

  const clearError = () => {
    setError(null)
  }

  const refreshToken = async () => {
     try {
       
       const token = localStorage.getItem('token')
       if (!token) {
         throw new Error('No token available for refresh')
       }
       
       const response = await authApi.getProfile(token)
       const userData = response.data || response.user || response
       
       setUser(userData)
       return true
     } catch (error) {
       
       logout()
       return false
     }
   }

  // Computed authentication state
   const isAuthenticated = !!user && !!localStorage.getItem('token')
   )

  /**
   * Check if current user has admin privileges
   * @returns {boolean} True if user is admin
   */
  const isAdmin = () => {
    return user?.role === 'admin' || user?.isAdmin === true
  }

  /**
   * Get current JWT token from localStorage
   * @returns {string|null} JWT token or null if not found
   */
  const getToken = () => {
    return localStorage.getItem('token')
  }

  // Context value object - provides authentication state and functions to components
   
   const value = {
     // State variables
     user,        // Current user data
     loading,     // Loading state for async operations
     error,       // Authentication error messages

     // Authentication actions
     login,       // Login function
     register,    // Registration function
     logout,      // Logout function
     updateUser,  // Update user data
     clearError,  // Clear error state
     refreshToken,// Refresh authentication token

     // Computed getters
     isAuthenticated,  // Boolean: is user logged in
     isAdmin: isAdmin(), // Boolean: is user admin
     getToken,    // Function: get JWT token
   }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}