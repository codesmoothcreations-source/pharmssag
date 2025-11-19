import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const pastQuestionsService = {
  getAll: async () => {
    try {
      const response = await axios.get(`${API_URL}/past-questions`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch past questions');
    }
  },

  getSingle: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/past-questions/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch question');
    }
  },

  create: async (formData, token) => {
    try {
      
      
      

      const response = await axios.post(`${API_URL}/past-questions`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      
      

      return response.data;
    } catch (error) {
      
      
      throw new Error(error.response?.data?.message || 'Failed to create question');
    }
  },

  update: async (id, questionData, token) => {
    try {
      
      
      

      const response = await axios.put(`${API_URL}/past-questions/${id}`, questionData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      
      

      return response.data;
    } catch (error) {
      
      
      throw new Error(error.response?.data?.message || 'Failed to update question');
    }
  },

  delete: async (id, token) => {
    try {
      const response = await axios.delete(`${API_URL}/past-questions/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete question');
    }
  },

  search: async (query) => {
    try {
      const response = await axios.get(`${API_URL}/past-questions/search`, {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Search failed');
    }
  }
};

export default pastQuestionsService;