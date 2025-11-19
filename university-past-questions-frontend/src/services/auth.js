import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const authService = {
  login: async (credentials) => {
    
    
    
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials)
      
      
      return response.data
    } catch (error) {
      
      
      throw error
    }
  },

  register: async (userData) => {
    
    
    
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData)
      
      
      return response.data
    } catch (error) {
      
      
      throw error
    }
  },

  getProfile: async () => {
    
    
    
    try {
      const response = await axios.get(`${API_URL}/auth/me`)
      
      
      return response.data
    } catch (error) {
      
      
      throw error
    }
  },

  // Optional: Add if your backend supports it
  logout: async () => {
    const response = await axios.post(`${API_URL}/auth/logout`)
    return response.data
  },

  updateProfile: async (userData) => {
    const response = await axios.put(`${API_URL}/auth/profile`, userData)
    return response.data
  }
}

export default authService


// import axios from 'axios';

// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// const authService = {
//   login: async (credentials) => {
//     const response = await axios.post(`${API_URL}/auth/login`, credentials);
//     return response.data;
//   },

//   register: async (userData) => {
//     const response = await axios.post(`${API_URL}/auth/register`, userData);
//     return response.data;
//   },

//   getProfile: async () => {
//     const response = await axios.get(`${API_URL}/auth/me`);
//     return response.data;
//   }
// };

// export default authService;